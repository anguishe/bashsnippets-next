'use client';

import { escapeHtml } from './shared/bashHighlight';
import { useClipboard } from './shared/useClipboard';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────
type SignalId = 'EXIT' | 'ERR' | 'INT' | 'TERM' | 'HUP' | 'PIPE';
type ActionId = 'temp' | 'lock' | 'jobs' | 'log' | 'terminal';
type Style = 'combined' | 'persignal';

interface TrapState {
  signals: Record<SignalId, boolean>;
  actions: Record<ActionId, boolean>;
  style: Style;
  header: boolean;
  sigName: boolean;
}

const SIGNALS: { id: SignalId; num: string; desc: string }[] = [
  { id: 'EXIT', num: '0', desc: 'Fires when the script exits for ANY reason — success or failure.' },
  { id: 'ERR', num: '', desc: 'Fires when any command returns a non-zero exit code (needs set -e).' },
  { id: 'INT', num: '2', desc: 'Fires when the user presses Ctrl+C.' },
  { id: 'TERM', num: '15', desc: 'Fires when the OS or another process sends kill / systemctl stop.' },
  { id: 'HUP', num: '1', desc: 'Fires when the terminal closes or the SSH session drops.' },
  { id: 'PIPE', num: '', desc: 'Fires when writing to a broken pipe (the reader closed).' },
];

const ACTIONS: { id: ActionId; label: string; code: string }[] = [
  { id: 'temp', label: 'Remove temp files', code: 'rm -f "$TMPFILE"' },
  { id: 'lock', label: 'Remove lock file', code: 'rm -f "$LOCKFILE"' },
  { id: 'jobs', label: 'Kill background jobs', code: 'kill "${job_pids[@]}"' },
  { id: 'log', label: 'Log exit reason', code: 'echo exit code + line' },
  { id: 'terminal', label: 'Restore terminal', code: 'tput cnorm' },
];

const SIGNAL_REFERENCE: { sig: string; fires: string; use: string }[] = [
  { sig: 'EXIT (0)', fires: 'Script exits for any reason — success, failure, or interrupt.', use: 'The one trap that always runs. Put resource teardown here.' },
  { sig: 'ERR', fires: 'A command returns a non-zero exit code (only while set -e is on).', use: 'Log the exact failing line with $LINENO before the script dies.' },
  { sig: 'INT (2)', fires: 'User presses Ctrl+C at the terminal.', use: 'Print an interrupted message and exit 130 so callers see it was cancelled.' },
  { sig: 'TERM (15)', fires: 'kill, systemctl stop, or docker stop sends SIGTERM.', use: 'Graceful shutdown of long-running scripts and Docker entrypoints.' },
  { sig: 'HUP (1)', fires: 'Terminal closes or the SSH session drops.', use: 'Decide whether to abort or keep running when the session is lost.' },
  { sig: 'PIPE', fires: 'Writing to a pipe whose reader has closed (e.g. head exited early).', use: 'Suppress broken-pipe noise; usually handled rather than aborted on.' },
];

const PRESETS: { label: string; signals: Record<SignalId, boolean>; actions: Record<ActionId, boolean> }[] = [
  {
    label: 'Temp-file cleanup',
    signals: { EXIT: true, ERR: true, INT: false, TERM: false, HUP: false, PIPE: false },
    actions: { temp: true, lock: false, jobs: false, log: true, terminal: false },
  },
  {
    label: 'Lock file',
    signals: { EXIT: true, ERR: false, INT: true, TERM: true, HUP: false, PIPE: false },
    actions: { temp: false, lock: true, jobs: false, log: true, terminal: false },
  },
  {
    label: 'Restore terminal',
    signals: { EXIT: true, ERR: false, INT: true, TERM: true, HUP: false, PIPE: false },
    actions: { temp: false, lock: false, jobs: false, log: false, terminal: true },
  },
];

const DEFAULT_STATE: TrapState = {
  signals: { EXIT: true, ERR: true, INT: false, TERM: false, HUP: false, PIPE: false },
  actions: { temp: true, lock: false, jobs: false, log: true, terminal: false },
  style: 'combined',
  header: true,
  sigName: true,
};

// ── Pure code generation (no React) ─────────────────────────────
interface GenResult {
  fn: string[];
  traps: string[];
  needsCleanFlag: boolean;
}

function selectedSignals(s: TrapState): SignalId[] {
  return SIGNALS.map((sig) => sig.id).filter((id) => s.signals[id]);
}

// Resource-teardown lines (everything except the log action).
function teardownLines(s: TrapState, indent: string): string[] {
  const L: string[] = [];
  if (s.actions.temp) {
    L.push(indent + '# Remove the temp file so a crash never leaves it behind.');
    L.push(indent + 'rm -f "$TMPFILE"');
  }
  if (s.actions.lock) {
    L.push(indent + '# Release the lock so the next run is not blocked by a stale file.');
    L.push(indent + 'rm -f "$LOCKFILE"');
  }
  if (s.actions.jobs) {
    L.push(indent + '# Stop any background jobs this script started so they do not outlive it.');
    L.push(indent + 'local -a job_pids');
    L.push(indent + 'mapfile -t job_pids < <(jobs -p)');
    L.push(indent + 'if [[ "${#job_pids[@]}" -gt 0 ]]; then');
    L.push(indent + '  kill "${job_pids[@]}" 2>/dev/null || true');
    L.push(indent + 'fi');
  }
  if (s.actions.terminal) {
    L.push(indent + '# Restore the cursor in case the script hid it (tput civis).');
    L.push(indent + 'tput cnorm 2>/dev/null || true');
  }
  return L;
}

function logLine(s: TrapState, indent: string, sigExpr: string): string[] {
  const tag = s.sigName && sigExpr ? '[' + sigExpr + '] ' : '';
  const L: string[] = [];
  L.push(indent + '# Report why we exited: non-zero is a failure, zero is clean.');
  L.push(indent + 'if (( exit_code != 0 )); then');
  L.push(indent + '  echo "$CROSS ' + tag + 'failed: exit $exit_code near line $line_no" >&2');
  L.push(indent + 'else');
  L.push(indent + '  echo "$CHECK ' + tag + 'clean exit"');
  L.push(indent + 'fi');
  return L;
}

// Top-of-script variable declarations driven by selected actions.
function topVars(s: TrapState): string[] {
  const L: string[] = [];
  if (s.actions.temp) {
    L.push('# Create the temp file up front so the trap can always remove it.');
    L.push('TMPFILE=$(mktemp)');
  }
  if (s.actions.lock) {
    L.push('LOCKFILE="/var/lock/myscript.lock"');
  }
  return L;
}

function exitCodeFor(sig: SignalId): string {
  // Conventional 128 + signal number for fatal signals.
  if (sig === 'INT') return '130';
  if (sig === 'TERM') return '143';
  if (sig === 'HUP') return '129';
  return '0';
}

function generateCombined(s: TrapState, sigs: SignalId[]): GenResult {
  const fn: string[] = [];
  fn.push('# One handler for every trapped signal. Args: $1 exit code, $2 line, $3 signal.');
  fn.push('cleanup() {');
  if (s.actions.log) {
    fn.push('  local exit_code="$1"');
    fn.push('  local line_no="$2"');
  }
  if (s.actions.log && s.sigName) fn.push('  local sig="${3:-EXIT}"');
  fn.push('  # ERR and EXIT can both fire on one failure; run the body only once.');
  fn.push('  [[ "${_CLEANED:-0}" -eq 1 ]] && return 0');
  fn.push('  _CLEANED=1');
  const td = teardownLines(s, '  ');
  if (td.length) {
    fn.push('');
    td.forEach((l) => fn.push(l));
  }
  if (s.actions.log) {
    fn.push('');
    logLine(s, '  ', '$sig').forEach((l) => fn.push(l));
  }
  fn.push('}');

  const traps: string[] = [];
  traps.push('# Single quotes: cleanup is resolved when the signal fires, not at definition (SC2064).');
  sigs.forEach((sig) => {
    traps.push("trap 'cleanup $? $LINENO " + sig + "' " + sig);
  });
  return { fn, traps, needsCleanFlag: true };
}

function generatePerSignal(s: TrapState, sigs: SignalId[]): GenResult {
  const fn: string[] = [];
  const needsTeardown = teardownLines(s, '  ').length > 0;

  if (needsTeardown) {
    fn.push('# Shared teardown, idempotent so multiple handlers can call it safely.');
    fn.push('do_cleanup() {');
    fn.push('  [[ "${_CLEANED:-0}" -eq 1 ]] && return 0');
    fn.push('  _CLEANED=1');
    teardownLines(s, '  ').forEach((l) => fn.push(l));
    fn.push('}');
    fn.push('');
  }

  sigs.forEach((sig, i) => {
    if (i > 0) fn.push('');
    if (sig === 'EXIT') {
      fn.push('on_exit() {');
      if (s.actions.log) {
        fn.push('  local exit_code=$?');
        fn.push('  local line_no="${1:-0}"');
      }
      if (needsTeardown) fn.push('  do_cleanup');
      if (s.actions.log) logLine(s, '  ', 'EXIT').forEach((l) => fn.push(l));
      if (!s.actions.log && !needsTeardown) fn.push('  :  # EXIT trapped; no action configured');
      fn.push('}');
    } else if (sig === 'ERR') {
      fn.push('on_err() {');
      if (s.actions.log) {
        const tag = s.sigName ? '[ERR] ' : '';
        fn.push('  local exit_code=$?');
        fn.push('  local line_no="$1"');
        fn.push('  # Log the failing line before EXIT fires and tears things down.');
        fn.push('  echo "$CROSS ' + tag + 'command failed: exit $exit_code at line $line_no" >&2');
      } else {
        fn.push('  :  # ERR trapped; enable Log exit reason to record the failing line');
      }
      fn.push('}');
    } else {
      const lower = 'on_' + sig.toLowerCase();
      const code = exitCodeFor(sig);
      fn.push(lower + '() {');
      if (needsTeardown) fn.push('  do_cleanup');
      if (s.actions.log) {
        const tag2 = s.sigName ? '[' + sig + '] ' : '';
        fn.push('  echo "$CROSS ' + tag2 + 'received SIG' + sig + '" >&2');
      }
      fn.push('  # 128 + signal number is the conventional exit code for a fatal signal.');
      fn.push('  exit ' + code);
      fn.push('}');
    }
  });

  const traps: string[] = [];
  traps.push('# Single quotes so handler names resolve at fire time, not definition (SC2064).');
  sigs.forEach((sig) => {
    if (sig === 'ERR') traps.push("trap 'on_err $LINENO' ERR");
    else if (sig === 'EXIT') traps.push("trap 'on_exit $LINENO' EXIT");
    else traps.push("trap 'on_" + sig.toLowerCase() + "' " + sig);
  });
  return { fn, traps, needsCleanFlag: needsTeardown };
}

function build(s: TrapState): { full: string; trap: string } {
  const sigs = selectedSignals(s);
  if (sigs.length === 0) {
    return { full: '# Select at least one signal above to generate a trap block.', trap: '' };
  }
  const gen = s.style === 'combined' ? generateCombined(s, sigs) : generatePerSignal(s, sigs);

  // Assemble the body first so we can detect which convention vars it uses.
  const bodyText = gen.fn.concat(gen.traps).join('\n');
  const usesCheck = /\$CHECK\b/.test(bodyText);
  const usesCross = /\$CROSS\b/.test(bodyText);

  const head: string[] = [];
  head.push('#!/bin/bash');
  head.push('# Script: myscript.sh');
  head.push('# Purpose: A script without a trap leaves temp files, locks, and jobs behind when it crashes.');
  head.push('# Usage: ./myscript.sh');
  if (s.header) head.push('set -euo pipefail');
  // Only declare the convention vars the generated code references (keeps it SC2034-clean).
  if (usesCheck || usesCross) head.push('');
  if (usesCheck) head.push('CHECK="✓"');
  if (usesCross) head.push('CROSS="✗"');

  const tv = topVars(s);
  if (tv.length || gen.needsCleanFlag) head.push('');
  if (gen.needsCleanFlag) head.push('_CLEANED=0   # guard so cleanup runs exactly once');
  tv.forEach((l) => head.push(l));

  head.push('');
  gen.fn.forEach((l) => head.push(l));
  head.push('');
  gen.traps.forEach((l) => head.push(l));

  return { full: head.join('\n'), trap: gen.traps.join('\n') };
}

// ── Lightweight highlighter (comments muted, keywords green) ─────
const KW = [
  'set', 'local', 'trap', 'if', 'then', 'else', 'elif', 'fi', 'for', 'while',
  'do', 'done', 'case', 'esac', 'return', 'exit', 'function', 'declare',
  'mapfile', 'readonly', 'kill', 'echo',
];
const KW_RE = new RegExp('\\b(' + KW.join('|') + ')\\b', 'g');

function highlightTrap(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const trimmed = line.replace(/^\s+/, '');
      if (trimmed.charAt(0) === '#') {
        return `<span style="color:#8b949e;font-style:italic;">${escapeHtml(line)}</span>`;
      }
      return escapeHtml(line).replace(KW_RE, '<span style="color:#39d353;">$1</span>');
    })
    .join('\n');
}

// ── Component ───────────────────────────────────────────────────
export default function BashTrapBuilder() {
  const [state, setState] = useState<TrapState>(DEFAULT_STATE);
  const { copied: trapCopied, copy: copyTrap } = useClipboard();
  const { copied: fullCopied, copy: copyFull } = useClipboard();

  const { full, trap } = useMemo(() => build(state), [state]);
  const outputHtml = useMemo(() => highlightTrap(full), [full]);
  const errWarn = state.signals.ERR && !state.header;

  const toggleSignal = useCallback((id: SignalId) => {
    setState((prev) => ({ ...prev, signals: { ...prev.signals, [id]: !prev.signals[id] } }));
  }, []);

  const toggleAction = useCallback((id: ActionId) => {
    setState((prev) => ({ ...prev, actions: { ...prev.actions, [id]: !prev.actions[id] } }));
  }, []);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setState((prev) => ({ ...prev, signals: { ...preset.signals }, actions: { ...preset.actions } }));
  }, []);

  const panelHead = (num: string, title: string) => (
    <h3 className="mb-3.5 flex items-center font-heading text-base font-extrabold text-text">
      <span className="mr-2 rounded bg-green-dim px-1.5 py-0.5 font-mono text-[11px] font-semibold text-green">{num}</span>
      {title}
    </h3>
  );

  return (
    <div className="rounded-lg border border-border bg-bg p-4 md:p-5">
      {/* Presets */}
      <div className="mb-4">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">{'// presets'}</div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="cursor-pointer rounded-md border border-border bg-bg3 px-3 py-1.5 font-mono text-[12px] text-muted transition-colors hover:border-green hover:text-text"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 01 — Signals */}
      <div className="mb-4 rounded-lg border border-border bg-bg2 p-4">
        {panelHead('01', 'Signals to trap')}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SIGNALS.map((sig) => {
            const on = state.signals[sig.id];
            return (
              <button
                key={sig.id}
                type="button"
                onClick={() => toggleSignal(sig.id)}
                aria-pressed={on}
                className={`cursor-pointer rounded-lg border bg-bg3 px-3.5 py-3 text-left transition-colors ${
                  on ? 'border-green bg-green-dim' : 'border-border hover:border-muted'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-[15px] font-semibold text-green">{sig.id}</span>
                  {sig.num && (
                    <span className="rounded border border-border px-1.5 font-mono text-[11px] text-muted">{sig.num}</span>
                  )}
                  <span
                    className={`ml-auto flex h-4 w-4 items-center justify-center rounded border font-mono text-[11px] ${
                      on ? 'border-green bg-green text-bg' : 'border-muted bg-transparent'
                    }`}
                  >
                    {on ? '✓' : ''}
                  </span>
                </div>
                <div className="text-[12px] leading-relaxed text-muted">{sig.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 02 — Cleanup actions */}
      <div className="mb-4 rounded-lg border border-border bg-bg2 p-4">
        {panelHead('02', 'Cleanup actions')}
        <div>
          {ACTIONS.map((a, i) => {
            const on = state.actions[a.id];
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAction(a.id)}
                aria-pressed={on}
                className={`flex w-full cursor-pointer items-start gap-2.5 py-2 text-left ${
                  i < ACTIONS.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border font-mono text-[11px] ${
                    on ? 'border-green bg-green text-bg' : 'border-muted bg-transparent'
                  }`}
                >
                  {on ? '✓' : ''}
                </span>
                <span className="text-[13px] text-text">
                  {a.label} <code className="ml-1 font-mono text-[12px] text-amber">{a.code}</code>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 03 — Behavior */}
      <div className="mb-4 rounded-lg border border-border bg-bg2 p-4">
        {panelHead('03', 'Behavior')}

        <div className="mb-4">
          <div className="mb-2 font-mono text-[12px] text-muted">Trap style</div>
          <div className="flex flex-wrap gap-2.5">
            {([
              ['combined', 'Combined single function'],
              ['persignal', 'Per-signal functions'],
            ] as [Style, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, style: value }))}
                aria-pressed={state.style === value}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[13px] transition-colors ${
                  state.style === value
                    ? 'border-green bg-green-dim text-green'
                    : 'border-border bg-bg3 text-muted hover:border-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 font-mono text-[12px] text-muted">Options</div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, header: !prev.header }))}
              aria-pressed={state.header}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[13px] transition-colors ${
                state.header ? 'border-green bg-green-dim text-green' : 'border-border bg-bg3 text-muted hover:border-muted'
              }`}
            >
              Include set -euo pipefail header
            </button>
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, sigName: !prev.sigName }))}
              aria-pressed={state.sigName}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[13px] transition-colors ${
                state.sigName ? 'border-green bg-green-dim text-green' : 'border-border bg-bg3 text-muted hover:border-muted'
              }`}
            >
              Include signal name in log output
            </button>
          </div>
        </div>
      </div>

      {/* 04 — Generated code */}
      <div className="mb-4 rounded-lg border border-border bg-bg2 p-4">
        {panelHead('04', 'Generated code')}
        <div className="mb-3 flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={!trap}
            onClick={() => trap && void copyTrap(trap)}
            className="cursor-pointer rounded-lg border border-green bg-transparent px-3 py-1.5 font-mono text-[13px] font-semibold text-green transition-colors hover:bg-green hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {trapCopied ? '✓ Copied' : 'Copy trap block only'}
          </button>
          <button
            type="button"
            onClick={() => void copyFull(full)}
            className="cursor-pointer rounded-lg border border-green bg-transparent px-3 py-1.5 font-mono text-[13px] font-semibold text-green transition-colors hover:bg-green hover:text-bg"
          >
            {fullCopied ? '✓ Copied' : 'Copy complete script header'}
          </button>
        </div>
        {errWarn && (
          <div role="alert" className="mb-3 rounded-lg border border-amber bg-[#3a2e10] px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-amber">
            ERR only fires while set -e is active. You disabled the set -euo pipefail header, so the ERR trap will never run. Re-enable the header or drop ERR.
          </div>
        )}
        <pre
          className="m-0 overflow-x-auto whitespace-pre rounded-lg border border-border bg-bg3 p-4 font-mono text-[13px] leading-relaxed text-text"
          dangerouslySetInnerHTML={{ __html: outputHtml }}
        />

        {/* Related snippet — internal linking */}
        <div className="mt-3 rounded-md border border-border border-l-[3px] border-l-blue bg-bg3 px-3.5 py-3 text-[12px] leading-relaxed text-muted">
          New to traps and <code className="text-amber">set -euo pipefail</code>? Read the full pattern in{' '}
          <Link href="/snippets/bash-error-handling" className="font-mono text-green hover:underline">
            Bash Error Handling →
          </Link>
        </div>
      </div>

      {/* 05 — Reference */}
      <div className="rounded-lg border border-border bg-bg2 p-4">
        {panelHead('05', 'Signal reference')}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="border border-border bg-bg3 px-2.5 py-2 text-left font-mono text-[12px] font-semibold text-blue">Signal</th>
                <th className="border border-border bg-bg3 px-2.5 py-2 text-left font-mono text-[12px] font-semibold text-blue">When it fires</th>
                <th className="border border-border bg-bg3 px-2.5 py-2 text-left font-mono text-[12px] font-semibold text-blue">Common use case</th>
              </tr>
            </thead>
            <tbody>
              {SIGNAL_REFERENCE.map((row) => (
                <tr key={row.sig}>
                  <td className="whitespace-nowrap border border-border px-2.5 py-2 align-top font-mono font-semibold text-green">{row.sig}</td>
                  <td className="border border-border px-2.5 py-2 align-top text-muted">{row.fires}</td>
                  <td className="border border-border px-2.5 py-2 align-top text-muted">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
