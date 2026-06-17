'use client';

import { escapeHtml } from './shared/bashHighlight';
import { useClipboard } from './shared/useClipboard';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────
interface RsyncState {
  archive: boolean;
  verbose: boolean;
  compress: boolean;
  del: boolean;
  dryrun: boolean;
  partial: boolean;
  ssh: boolean;
  bwlimitOn: boolean;
}

interface Preset {
  label: string;
  hint: string;
  source: string;
  dest: string;
  state: RsyncState;
}

const PRESETS: Preset[] = [
  {
    label: 'Local backup',
    hint: 'Archive copy to a mounted disk — no SSH, no deletes.',
    source: '/home/user/data/',
    dest: '/mnt/backup/',
    state: { archive: true, verbose: true, compress: false, del: false, dryrun: false, partial: false, ssh: false, bwlimitOn: false },
  },
  {
    label: 'Push to remote',
    hint: 'Compressed transfer over SSH with resume on drop.',
    source: '/home/user/data/',
    dest: 'user@host:/backup/',
    state: { archive: true, verbose: true, compress: true, del: false, dryrun: false, partial: true, ssh: true, bwlimitOn: false },
  },
  {
    label: 'Mirror (--delete)',
    hint: 'Exact replica — dry-run pre-enabled so you preview deletions first.',
    source: '/home/user/data/',
    dest: 'user@host:/mirror/',
    state: { archive: true, verbose: true, compress: true, del: true, dryrun: true, partial: false, ssh: true, bwlimitOn: false },
  },
];

// ── Pure logic (no React) ───────────────────────────────────────
function buildParts(source: string, dest: string, excludes: string, s: RsyncState, bwlimit: number): string[] {
  let shortFlags = '';
  if (s.archive) shortFlags += 'a';
  if (s.verbose) shortFlags += 'v';
  if (s.compress) shortFlags += 'z';

  const parts: string[] = ['rsync'];
  if (shortFlags) parts.push('-' + shortFlags);
  if (s.del) parts.push('--delete');
  if (s.dryrun) parts.push('--dry-run');
  if (s.partial) {
    parts.push('--partial');
    parts.push('--progress');
  }
  if (s.bwlimitOn && bwlimit > 0) parts.push(`--bwlimit=${bwlimit}`);
  if (s.ssh) parts.push('-e ssh');

  if (excludes.trim()) {
    excludes.split(',').forEach((raw) => {
      const pattern = raw.trim();
      if (pattern) parts.push(`--exclude='${pattern}'`);
    });
  }

  parts.push(source);
  parts.push(dest || '[destination]');
  return parts;
}

function rawCommandFrom(parts: string[]): string {
  return parts.length <= 3 ? parts.join(' ') : parts.join(' \\\n  ');
}

function highlightCommand(parts: string[]): string {
  const colored = parts.map((part, i) => {
    if (i === 0) return `<span style="color:#39d353;font-weight:600;">${escapeHtml(part)}</span>`;
    if (part.indexOf('--exclude=') === 0) return `<span style="color:#e3b341;">${escapeHtml(part)}</span>`;
    if (part.charAt(0) === '-') return `<span style="color:#58a6ff;">${escapeHtml(part)}</span>`;
    return `<span style="color:#e6edf3;">${escapeHtml(part)}</span>`;
  });
  if (colored.length <= 3) return colored.join(' ');
  let html = colored[0];
  for (let j = 1; j < colored.length; j++) {
    html += ' <span style="color:#8b949e;">\\</span>\n  ' + colored[j];
  }
  return html;
}

// ── Component ───────────────────────────────────────────────────
export default function RsyncCommandBuilder() {
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [excludes, setExcludes] = useState('');
  const [bwlimit, setBwlimit] = useState(1000);
  const [state, setState] = useState<RsyncState>({
    archive: true,
    verbose: true,
    compress: false,
    del: false,
    dryrun: false,
    partial: false,
    ssh: true,
    bwlimitOn: false,
  });

  const { copied, copy } = useClipboard();
  const { copied: iconCopied, copy: copyIcon } = useClipboard();

  const setFlag = useCallback(
    (key: keyof RsyncState, value: boolean) => setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const applyPreset = useCallback((preset: Preset) => {
    setSource(preset.source);
    setDest(preset.dest);
    setState(preset.state);
  }, []);

  const rawCommand = useMemo(() => {
    if (!source.trim()) return '';
    return rawCommandFrom(buildParts(source.trim(), dest.trim(), excludes, state, bwlimit));
  }, [source, dest, excludes, state, bwlimit]);

  const commandHtml = useMemo(() => {
    if (!source.trim()) {
      return '<span style="color:#8b949e;font-style:italic;"># Enter a source path to generate the rsync command</span>';
    }
    return highlightCommand(buildParts(source.trim(), dest.trim(), excludes, state, bwlimit));
  }, [source, dest, excludes, state, bwlimit]);

  const handleCopy = useCallback(() => {
    if (rawCommand) void copy(rawCommand);
  }, [copy, rawCommand]);

  const handleIconCopy = useCallback(() => {
    if (rawCommand) void copyIcon(rawCommand);
  }, [copyIcon, rawCommand]);

  const checkbox = (
    key: keyof RsyncState,
    label: string,
    tip: string,
  ) => (
    <label className="mb-2.5 flex cursor-pointer select-none items-center gap-2 text-[13px] text-text">
      <input
        type="checkbox"
        checked={state[key]}
        onChange={(e) => setFlag(key, e.target.checked)}
        className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-green"
      />
      <span>{label}</span>
      <span title={tip} className="shrink-0 cursor-help text-blue">ⓘ</span>
    </label>
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
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// rsync options'}</div>

          <label htmlFor="rsync-source" className="mb-1.5 block text-xs text-muted">Source Path</label>
          <input
            id="rsync-source"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="/home/user/data/"
            className="mb-4 w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text outline-none focus:border-green"
          />

          <label htmlFor="rsync-dest" className="mb-1.5 block text-xs text-muted">Destination</label>
          <input
            id="rsync-dest"
            type="text"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="user@host:/backup/ or /mnt/backup/"
            className="mb-5 w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text outline-none focus:border-green"
          />

          <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-muted">Option toggles</div>

          {checkbox('archive', 'Archive mode (-a)', 'Preserves permissions, timestamps, symlinks, and directory structure')}
          {checkbox('verbose', 'Verbose (-v)', 'Shows file-by-file transfer progress')}
          {checkbox('compress', 'Compress (-z)', 'Compresses data during transfer — saves bandwidth on slow links')}
          {checkbox('partial', 'Resume / partial (--partial --progress)', 'Keeps partially transferred files and shows progress — essential for large files over unreliable connections')}
          {checkbox('ssh', 'Over SSH (-e ssh)', 'Transfers data over an encrypted SSH tunnel')}
          {checkbox('dryrun', 'Dry run (--dry-run)', 'Simulates the transfer without making any changes — always run this before --delete')}
          {checkbox('del', 'Delete extraneous (--delete)', 'Removes files on the destination that no longer exist in the source')}

          {/* Bandwidth limit */}
          <div className="mb-2.5 flex items-center gap-2">
            <input
              id="rsync-bwlimit"
              type="checkbox"
              checked={state.bwlimitOn}
              onChange={(e) => setFlag('bwlimitOn', e.target.checked)}
              className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-green"
            />
            <label htmlFor="rsync-bwlimit" className="cursor-pointer text-[13px] text-text">Bandwidth limit (--bwlimit)</label>
            <input
              type="number"
              min={1}
              value={bwlimit}
              disabled={!state.bwlimitOn}
              onChange={(e) => setBwlimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-20 rounded-md border border-border bg-bg3 px-2 py-1 text-center font-mono text-[13px] text-text outline-none focus:border-green disabled:opacity-40"
            />
            <span className="text-[11px] text-muted">KB/s</span>
            <span title="Caps transfer rate so a backup does not saturate the link. --bwlimit=1000 ≈ 1 MB/s." className="shrink-0 cursor-help text-blue">ⓘ</span>
          </div>

          {/* Dry-run-first warning — kept prominent */}
          {state.del && !state.dryrun && (
            <div role="alert" className="mt-3 rounded-lg border-2 border-[#FF4444] bg-[#4a1a1a] px-4 py-3 text-[13px] leading-relaxed text-text">
              <strong className="text-[#FF4444]">Warning:</strong> <code className="text-amber">--delete</code> permanently removes files on the destination that are not in the source. Enable <strong>Dry run</strong> and inspect the output before running this — deleted files do not come back.
            </div>
          )}
          {state.del && state.dryrun && (
            <div role="status" className="mt-3 rounded-lg border-2 border-green bg-green-dim px-4 py-3 text-[13px] leading-relaxed text-text">
              <strong className="text-green">Dry run is on.</strong> This previews every deletion without touching the destination. Remove <code className="text-amber">--dry-run</code> only after you have read the output.
            </div>
          )}

          <div className="mt-5">
            <label htmlFor="rsync-excludes" className="mb-1.5 block text-xs text-muted">
              Exclude Patterns
              <span title="Comma-separated patterns — each becomes a separate --exclude flag" className="ml-1.5 cursor-help text-blue">ⓘ</span>
            </label>
            <input
              id="rsync-excludes"
              type="text"
              value={excludes}
              onChange={(e) => setExcludes(e.target.value)}
              placeholder="*.log, .git, node_modules"
              className="w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text outline-none focus:border-green"
            />
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
            <span className="font-mono text-xs text-muted">rsync command</span>
            <button
              type="button"
              aria-label="Copy rsync command"
              disabled={!rawCommand}
              onClick={handleIconCopy}
              className="ml-auto border-none bg-transparent font-mono text-sm text-muted disabled:opacity-40"
            >
              {iconCopied ? '✓ Copied' : '⧉'}
            </button>
          </div>
          <pre
            className="m-0 min-h-[120px] overflow-x-auto whitespace-pre-wrap rounded-b-lg border border-border bg-bg p-4 font-mono text-[13px] leading-relaxed text-text"
            dangerouslySetInnerHTML={{ __html: commandHtml }}
          />

          <button
            type="button"
            disabled={!rawCommand}
            onClick={handleCopy}
            className="mt-3 w-full rounded-lg border-none bg-green py-2.5 font-mono text-[13px] font-semibold text-[#0d1117] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? '✓ Copied' : '⧉ Copy Command'}
          </button>

          {/* Related snippets — internal linking */}
          <div className="mt-3 rounded-md border border-border bg-bg2 px-3.5 py-3">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">{'// pair with snippet'}</div>
            <Link href="/snippets/rsync-remote-backup" className="block font-mono text-xs text-green hover:underline">
              Rsync Remote Backup →
            </Link>
            <Link href="/snippets/automated-file-backup" className="mt-1.5 block font-mono text-xs text-green hover:underline">
              Automated File Backup →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
