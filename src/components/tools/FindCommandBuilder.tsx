'use client';

import { escapeHtml } from './shared/bashHighlight';
import { useClipboard } from './shared/useClipboard';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────
type FileType = 'f' | 'd' | 'l';
type TimeUnit = 'days' | 'minutes';
type TimeSign = 'older' | 'within';
type SizeSign = 'larger' | 'smaller' | 'exact';
type SizeUnit = 'c' | 'k' | 'M' | 'G';
type Action = 'print' | 'print0' | 'delete' | 'exec';
type ExecTerm = 'semi' | 'plus';

interface FindState {
  path: string;
  nameOn: boolean;
  namePattern: string;
  nameInsensitive: boolean;
  typeOn: boolean;
  fileType: FileType;
  timeOn: boolean;
  timeUnit: TimeUnit;
  timeSign: TimeSign;
  timeValue: number;
  sizeOn: boolean;
  sizeSign: SizeSign;
  sizeValue: number;
  sizeUnit: SizeUnit;
  excludeOn: boolean;
  excludePattern: string;
  action: Action;
  execCmd: string;
  execTerm: ExecTerm;
}

const DEFAULT_STATE: FindState = {
  path: '.',
  nameOn: true,
  namePattern: '*.log',
  nameInsensitive: false,
  typeOn: true,
  fileType: 'f',
  timeOn: false,
  timeUnit: 'days',
  timeSign: 'older',
  timeValue: 30,
  sizeOn: false,
  sizeSign: 'larger',
  sizeValue: 100,
  sizeUnit: 'M',
  excludeOn: false,
  excludePattern: '*/node_modules/*',
  action: 'print',
  execCmd: 'ls -lh',
  execTerm: 'semi',
};

interface Preset {
  label: string;
  hint: string;
  state: FindState;
}

const PRESETS: Preset[] = [
  {
    label: 'Old .log files',
    hint: 'Regular .log files under /var/log modified more than 30 days ago. Action is -print so you preview first.',
    state: {
      ...DEFAULT_STATE,
      path: '/var/log',
      nameOn: true,
      namePattern: '*.log',
      typeOn: true,
      fileType: 'f',
      timeOn: true,
      timeUnit: 'days',
      timeSign: 'older',
      timeValue: 30,
      action: 'print',
    },
  },
  {
    label: 'Large files >100M',
    hint: 'Regular files larger than 100 MB anywhere under the current directory.',
    state: {
      ...DEFAULT_STATE,
      path: '.',
      nameOn: false,
      typeOn: true,
      fileType: 'f',
      sizeOn: true,
      sizeSign: 'larger',
      sizeValue: 100,
      sizeUnit: 'M',
      action: 'print',
    },
  },
  {
    label: 'Stale temp files',
    hint: 'Regular .tmp files under /tmp older than 7 days — switch the action to -delete once you have read the list.',
    state: {
      ...DEFAULT_STATE,
      path: '/tmp',
      nameOn: true,
      namePattern: '*.tmp',
      typeOn: true,
      fileType: 'f',
      timeOn: true,
      timeUnit: 'days',
      timeSign: 'older',
      timeValue: 7,
      action: 'print',
    },
  },
];

// ── Pure logic (no React) ───────────────────────────────────────
type PartType = 'cmd' | 'path' | 'flag' | 'value' | 'danger';
interface Part {
  text: string;
  type: PartType;
}

const COLORS: Record<PartType, string> = {
  cmd: 'color:#39d353;font-weight:600;',
  path: 'color:#e6edf3;',
  flag: 'color:#58a6ff;',
  value: 'color:#e3b341;',
  danger: 'color:#f85149;font-weight:600;',
};

/** Double-quote a glob so the shell cannot expand it before find runs. */
function quote(raw: string): string {
  return '"' + raw.replace(/"/g, '\\"') + '"';
}

function timeToken(s: FindState): { flag: string; value: string } {
  const flag = s.timeUnit === 'days' ? '-mtime' : '-mmin';
  const sign = s.timeSign === 'older' ? '+' : '-';
  return { flag, value: `${sign}${s.timeValue}` };
}

function sizeToken(s: FindState): string {
  const sign = s.sizeSign === 'larger' ? '+' : s.sizeSign === 'smaller' ? '-' : '';
  return `${sign}${s.sizeValue}${s.sizeUnit}`;
}

/**
 * Assemble find as [find] [path] [tests…] [action].
 * The action is appended last on purpose — placed before the tests, -delete
 * and -exec run on everything find walks instead of only the matches.
 */
function buildParts(s: FindState): Part[] {
  const parts: Part[] = [
    { text: 'find', type: 'cmd' },
    { text: s.path.trim() || '.', type: 'path' },
  ];

  // ── Tests (filters) ──
  if (s.nameOn && s.namePattern.trim()) {
    parts.push({ text: s.nameInsensitive ? '-iname' : '-name', type: 'flag' });
    parts.push({ text: quote(s.namePattern.trim()), type: 'value' });
  }
  if (s.typeOn) {
    parts.push({ text: '-type', type: 'flag' });
    parts.push({ text: s.fileType, type: 'value' });
  }
  if (s.timeOn) {
    const t = timeToken(s);
    parts.push({ text: t.flag, type: 'flag' });
    parts.push({ text: t.value, type: 'value' });
  }
  if (s.sizeOn) {
    parts.push({ text: '-size', type: 'flag' });
    parts.push({ text: sizeToken(s), type: 'value' });
  }
  if (s.excludeOn && s.excludePattern.trim()) {
    parts.push({ text: '-not', type: 'flag' });
    parts.push({ text: '-path', type: 'flag' });
    parts.push({ text: quote(s.excludePattern.trim()), type: 'value' });
  }

  // ── Action (always last) ──
  switch (s.action) {
    case 'print':
      parts.push({ text: '-print', type: 'flag' });
      break;
    case 'print0':
      parts.push({ text: '-print0', type: 'flag' });
      break;
    case 'delete':
      parts.push({ text: '-delete', type: 'danger' });
      break;
    case 'exec':
      parts.push({ text: '-exec', type: 'danger' });
      parts.push({ text: s.execCmd.trim() || 'CMD', type: 'value' });
      parts.push({ text: '{}', type: 'value' });
      parts.push({ text: s.execTerm === 'plus' ? '+' : '\\;', type: 'flag' });
      break;
  }

  return parts;
}

function rawCommand(parts: Part[]): string {
  return parts.map((p) => p.text).join(' ');
}

function highlightCommand(parts: Part[]): string {
  return parts
    .map((p) => `<span style="${COLORS[p.type]}">${escapeHtml(p.text)}</span>`)
    .join(' ');
}

interface FlagExplain {
  token: string;
  text: string;
  danger?: boolean;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const SIZE_LABEL: Record<SizeUnit, string> = {
  c: 'bytes',
  k: 'KB (1024-byte blocks)',
  M: 'MB',
  G: 'GB',
};

const TYPE_LABEL: Record<FileType, string> = {
  f: 'regular files',
  d: 'directories',
  l: 'symbolic links',
};

/** One plain-English line per active flag, in the same order as the command. */
function buildExplanations(s: FindState): FlagExplain[] {
  const out: FlagExplain[] = [];
  const path = s.path.trim() || '.';
  out.push({
    token: path,
    text: `Starts the search at ${path} and walks every file and subdirectory beneath it.`,
  });

  if (s.nameOn && s.namePattern.trim()) {
    const pattern = s.namePattern.trim();
    const flag = s.nameInsensitive ? '-iname' : '-name';
    const caseNote = s.nameInsensitive ? ', ignoring case' : '';
    out.push({
      token: `${flag} ${quote(pattern)}`,
      text: `Keeps names matching the glob ${pattern}${caseNote}. The pattern is quoted so the shell cannot expand it before find runs.`,
    });
  }

  if (s.typeOn) {
    out.push({
      token: `-type ${s.fileType}`,
      text: `Restricts matches to ${TYPE_LABEL[s.fileType]} only.`,
    });
  }

  if (s.timeOn) {
    const t = timeToken(s);
    const unit = s.timeUnit === 'days' ? 'day' : 'minute';
    const phrase =
      s.timeSign === 'older'
        ? `modified more than ${plural(s.timeValue, unit)} ago (older than ${plural(s.timeValue, unit)})`
        : `modified within the last ${plural(s.timeValue, unit)}`;
    out.push({ token: `${t.flag} ${t.value}`, text: `Matches files ${phrase}.` });
  }

  if (s.sizeOn) {
    const cmp =
      s.sizeSign === 'larger' ? 'larger than' : s.sizeSign === 'smaller' ? 'smaller than' : 'of exactly';
    out.push({
      token: `-size ${sizeToken(s)}`,
      text: `Matches files ${cmp} ${s.sizeValue} ${SIZE_LABEL[s.sizeUnit]}.`,
    });
  }

  if (s.excludeOn && s.excludePattern.trim()) {
    const pattern = s.excludePattern.trim();
    out.push({
      token: `-not -path ${quote(pattern)}`,
      text: `Drops any path matching ${pattern} from the results — find still descends into it, but those matches are filtered out.`,
    });
  }

  switch (s.action) {
    case 'print':
      out.push({
        token: '-print',
        text: 'Prints each matching path on its own line (the default action). Safe to run.',
      });
      break;
    case 'print0':
      out.push({
        token: '-print0',
        text: 'Separates results with a null byte instead of a newline — pipe into xargs -0 to handle names with spaces or newlines safely.',
      });
      break;
    case 'delete':
      out.push({
        token: '-delete',
        danger: true,
        text: 'Removes every matching file or directory. It runs after the tests, so it only touches matches — but deletions are not reversible. Run the -print version first and read the list.',
      });
      break;
    case 'exec': {
      const cmd = s.execCmd.trim() || 'CMD';
      const detail =
        s.execTerm === 'plus'
          ? `runs ${cmd} once with many matches batched as arguments — {} expands to the list, + ends the command (faster when ${cmd} accepts multiple files)`
          : `runs ${cmd} once per matching file — {} is the filename, \\; ends the command`;
      out.push({
        token: `-exec ${cmd} {} ${s.execTerm === 'plus' ? '+' : '\\;'}`,
        danger: true,
        text: `Runs a command on each match: ${detail}. Preview with -print first to confirm the match list.`,
      });
      break;
    }
  }

  return out;
}

// ── Component ───────────────────────────────────────────────────
export default function FindCommandBuilder() {
  const [s, setState] = useState<FindState>(DEFAULT_STATE);

  const { copied, copy } = useClipboard();
  const { copied: iconCopied, copy: copyIcon } = useClipboard();

  const set = useCallback(
    <K extends keyof FindState>(key: K, value: FindState[K]) =>
      setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const applyPreset = useCallback((preset: Preset) => setState(preset.state), []);

  const parts = useMemo(() => buildParts(s), [s]);
  const command = useMemo(() => rawCommand(parts), [parts]);
  const commandHtml = useMemo(() => highlightCommand(parts), [parts]);
  const explanations = useMemo(() => buildExplanations(s), [s]);

  const handleCopy = useCallback(() => {
    if (command) void copy(command);
  }, [copy, command]);

  const handleIconCopy = useCallback(() => {
    if (command) void copyIcon(command);
  }, [copyIcon, command]);

  const destructive = s.action === 'delete' || s.action === 'exec';

  // ── Small render helpers (match grep/rsync house style) ──
  const toggle = (
    id: string,
    label: string,
    flag: string,
    checked: boolean,
    onChange: (v: boolean) => void,
    tip: string,
  ) => (
    <label htmlFor={id} className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-text">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-green"
      />
      <span>{label}</span>
      <span title={tip} className="shrink-0 cursor-help text-blue">ⓘ</span>
      <span className="ml-auto shrink-0 rounded border border-green/25 bg-green-dim px-1.5 py-px font-mono text-[11px] font-semibold text-green">
        {flag}
      </span>
    </label>
  );

  const seg = (
    current: string,
    onChange: (v: string) => void,
    options: { id: string; label: string }[],
  ) => (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={current === o.id}
          className={`cursor-pointer rounded-md border px-2.5 py-1.5 font-mono text-[12px] transition-colors ${
            current === o.id
              ? 'border-green bg-green-dim text-green'
              : 'border-border bg-bg3 text-muted hover:border-muted hover:text-text'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  const numberInput = (value: number, onChange: (v: number) => void, label: string) => (
    <input
      type="number"
      min={0}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      className="w-20 rounded-md border border-border bg-bg3 px-2 py-1.5 text-center font-mono text-[13px] text-text outline-none focus:border-green"
    />
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
              title={p.hint}
              className="cursor-pointer rounded-md border border-border bg-bg3 px-3 py-1.5 font-mono text-[12px] text-muted transition-colors hover:border-green hover:text-text"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_420px]">
        {/* ── Inputs ──────────────────────────────────────────── */}
        <div>
          {/* Path */}
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// search path'}</div>
          <label htmlFor="find-path" className="mb-1.5 block text-xs text-muted">Starting Path</label>
          <input
            id="find-path"
            type="text"
            value={s.path}
            onChange={(e) => set('path', e.target.value)}
            placeholder="."
            autoComplete="off"
            spellCheck={false}
            className="mb-5 w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text outline-none focus:border-green"
          />

          {/* Tests */}
          <div className="mb-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">
            {'// tests'} <span className="normal-case tracking-normal">— run before the action</span>
          </div>

          {/* Name */}
          <div className="mb-3 rounded-md border border-border bg-bg2 px-3 py-2.5">
            {toggle('find-name-on', 'Name pattern', '-name', s.nameOn, (v) => set('nameOn', v), 'Match filenames against a glob. The builder quotes the pattern so the shell cannot expand it first.')}
            {s.nameOn && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={s.namePattern}
                  onChange={(e) => set('namePattern', e.target.value)}
                  placeholder="*.log"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Name glob pattern"
                  className="w-full rounded-md border border-border bg-bg3 px-3 py-2 font-mono text-[13px] text-text outline-none focus:border-green"
                />
                <label className="mt-2 flex cursor-pointer select-none items-center gap-2 text-[12px] text-muted">
                  <input
                    type="checkbox"
                    checked={s.nameInsensitive}
                    onChange={(e) => set('nameInsensitive', e.target.checked)}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-green"
                  />
                  Ignore case <span className="font-mono text-green">(-iname)</span>
                </label>
              </div>
            )}
          </div>

          {/* Type */}
          <div className="mb-3 rounded-md border border-border bg-bg2 px-3 py-2.5">
            {toggle('find-type-on', 'File type', '-type', s.typeOn, (v) => set('typeOn', v), 'Limit matches to files, directories, or symlinks.')}
            {s.typeOn && (
              <div className="mt-2.5">
                {seg(s.fileType, (v) => set('fileType', v as FileType), [
                  { id: 'f', label: 'File (f)' },
                  { id: 'd', label: 'Directory (d)' },
                  { id: 'l', label: 'Symlink (l)' },
                ])}
              </div>
            )}
          </div>

          {/* Modified time */}
          <div className="mb-3 rounded-md border border-border bg-bg2 px-3 py-2.5">
            {toggle('find-time-on', 'Modified time', '-mtime', s.timeOn, (v) => set('timeOn', v), 'Filter by age. The sign is the trap: +N is older than N, -N is within the last N.')}
            {s.timeOn && (
              <div className="mt-2.5 flex flex-col gap-2.5">
                {seg(s.timeSign, (v) => set('timeSign', v as TimeSign), [
                  { id: 'older', label: 'older than' },
                  { id: 'within', label: 'within the last' },
                ])}
                <div className="flex items-center gap-2">
                  {numberInput(s.timeValue, (v) => set('timeValue', v), 'Time value')}
                  {seg(s.timeUnit, (v) => set('timeUnit', v as TimeUnit), [
                    { id: 'days', label: 'days (-mtime)' },
                    { id: 'minutes', label: 'minutes (-mmin)' },
                  ])}
                </div>
                <p className="text-[11px] leading-relaxed text-muted">
                  Reads as “{s.timeSign === 'older' ? 'older than' : 'within the last'} {plural(s.timeValue, s.timeUnit === 'days' ? 'day' : 'minute')}” → <code className="text-amber">{timeToken(s).flag} {timeToken(s).value}</code>
                </p>
              </div>
            )}
          </div>

          {/* Size */}
          <div className="mb-3 rounded-md border border-border bg-bg2 px-3 py-2.5">
            {toggle('find-size-on', 'Size', '-size', s.sizeOn, (v) => set('sizeOn', v), 'Filter by file size. +N is larger than N, -N is smaller than N.')}
            {s.sizeOn && (
              <div className="mt-2.5 flex flex-col gap-2.5">
                {seg(s.sizeSign, (v) => set('sizeSign', v as SizeSign), [
                  { id: 'larger', label: 'larger than' },
                  { id: 'smaller', label: 'smaller than' },
                  { id: 'exact', label: 'exactly' },
                ])}
                <div className="flex items-center gap-2">
                  {numberInput(s.sizeValue, (v) => set('sizeValue', v), 'Size value')}
                  {seg(s.sizeUnit, (v) => set('sizeUnit', v as SizeUnit), [
                    { id: 'c', label: 'bytes (c)' },
                    { id: 'k', label: 'KB (k)' },
                    { id: 'M', label: 'MB (M)' },
                    { id: 'G', label: 'GB (G)' },
                  ])}
                </div>
              </div>
            )}
          </div>

          {/* Exclude */}
          <div className="mb-3 rounded-md border border-border bg-bg2 px-3 py-2.5">
            {toggle('find-exclude-on', 'Exclude path', '-not -path', s.excludeOn, (v) => set('excludeOn', v), 'Drop paths matching a glob from the results, e.g. */node_modules/* or */.git/*.')}
            {s.excludeOn && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={s.excludePattern}
                  onChange={(e) => set('excludePattern', e.target.value)}
                  placeholder="*/node_modules/*"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Exclude path glob"
                  className="w-full rounded-md border border-border bg-bg3 px-3 py-2 font-mono text-[13px] text-text outline-none focus:border-green"
                />
              </div>
            )}
          </div>

          {/* Action */}
          <div className="mb-2.5 mt-5 font-mono text-[11px] uppercase tracking-wide text-muted">
            {'// action'} <span className="normal-case tracking-normal">— find runs this last, after every test above</span>
          </div>
          <div className="rounded-md border border-border bg-bg2 px-3 py-2.5">
            {seg(s.action, (v) => set('action', v as Action), [
              { id: 'print', label: '-print' },
              { id: 'print0', label: '-print0' },
              { id: 'delete', label: '-delete' },
              { id: 'exec', label: '-exec' },
            ])}
            {s.action === 'exec' && (
              <div className="mt-3 flex flex-col gap-2.5">
                <input
                  type="text"
                  value={s.execCmd}
                  onChange={(e) => set('execCmd', e.target.value)}
                  placeholder="ls -lh"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Command to run on each match"
                  className="w-full rounded-md border border-border bg-bg3 px-3 py-2 font-mono text-[13px] text-text outline-none focus:border-green"
                />
                {seg(s.execTerm, (v) => set('execTerm', v as ExecTerm), [
                  { id: 'semi', label: 'one per file (\\;)' },
                  { id: 'plus', label: 'batched (+)' },
                ])}
              </div>
            )}
          </div>
        </div>

        {/* ── Output (sticky) ─────────────────────────────────── */}
        <div className="lg:sticky lg:top-20">
          <div className="flex items-center gap-3 rounded-t-lg border border-b-0 border-border bg-bg3 px-3.5 py-2.5">
            <div className="flex shrink-0 gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="inline-block h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="inline-block h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-xs text-muted">find command</span>
            <button
              type="button"
              aria-label="Copy find command"
              disabled={!command}
              onClick={handleIconCopy}
              className="ml-auto border-none bg-transparent font-mono text-sm text-muted disabled:opacity-40"
            >
              {iconCopied ? '✓ Copied' : '⧉'}
            </button>
          </div>
          <pre
            className="m-0 overflow-x-auto whitespace-pre-wrap break-all rounded-b-lg border border-border bg-bg p-4 font-mono text-[13px] leading-relaxed text-text"
            dangerouslySetInnerHTML={{ __html: commandHtml }}
          />

          {/* Destructive-action warning — preview with -print first */}
          {destructive && (
            <div
              role="alert"
              className={`mt-2.5 rounded-lg border-2 px-4 py-3 text-[13px] leading-relaxed text-text ${
                s.action === 'delete' ? 'border-[#FF4444] bg-[#4a1a1a]' : 'border-amber bg-[#3a2e12]'
              }`}
            >
              {s.action === 'delete' ? (
                <>
                  <strong className="text-[#FF4444]">Warning:</strong> <code className="text-amber">-delete</code> permanently removes every matched file or directory — deletions do not come back. Switch the action to <code className="text-amber">-print</code>, run it, and read the file list before you run <code className="text-amber">-delete</code>.
                </>
              ) : (
                <>
                  <strong className="text-amber">Caution:</strong> <code className="text-amber">-exec</code> runs your command on every match. Preview with <code className="text-amber">-print</code> first to confirm exactly which files it will hit.
                </>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={!command}
            onClick={handleCopy}
            className="mt-3 w-full rounded-lg border-none bg-green py-2.5 font-mono text-[13px] font-semibold text-[#0d1117] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? '✓ Copied' : '⧉ Copy Command'}
          </button>

          {/* Per-flag explanation */}
          <div className="mt-3 rounded-md border border-border bg-bg2 px-3.5 py-3">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">{'// what each flag does'}</div>
            <ul className="flex flex-col gap-2" aria-live="polite">
              {explanations.map((ex, i) => (
                <li key={i} className="text-[12px] leading-relaxed">
                  <code className={`font-mono ${ex.danger ? 'text-[#f85149]' : 'text-amber'}`}>{ex.token}</code>
                  <span className="text-muted"> — {ex.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related snippets — internal linking */}
          <div className="mt-3 rounded-md border border-border bg-bg2 px-3.5 py-3">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">{'// pair with snippet'}</div>
            <Link href="/snippets/delete-old-log-files" className="block font-mono text-xs text-green hover:underline">
              Delete Old Log Files →
            </Link>
            <Link href="/snippets/search-files-for-text-grep" className="mt-1.5 block font-mono text-xs text-green hover:underline">
              Search Files for Text (grep) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
