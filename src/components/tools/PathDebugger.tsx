'use client';

import CopyButton from '@/components/CopyButton';
import { useClipboard } from './shared/useClipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PATH_CHECK_COMMAND, PATH_SOURCES_COMMAND, buildKeepExisting, shQuote } from './shared/pathCheck';

const EXAMPLE_PATH =
  '/usr/local/sbin:/usr/local/bin:/usr/bin:/usr/sbin:/bin:/usr/bin:/usr/games:/usr/local/games:/snap/bin:/home/user/.local/bin:/nonexistent/dir';

// A browser cannot see the visitor's disk, so no entry is ever reported as existing or missing.
// Absolute entries are marked "check" and the generated shell lines below test them for real.
type EntryStatus = 'check' | 'duplicate' | 'empty' | 'relative';

interface PathRow {
  entry: string;
  status: EntryStatus;
  note: string;
}

function classifyEntry(entry: string): 'empty' | 'relative' | 'check' {
  if (entry === '') return 'empty';
  // A non-absolute entry (".", "./bin", "../x", or any path not starting with /)
  // is a security risk: PATH is resolved relative to the current working directory.
  if (entry.charAt(0) !== '/') return 'relative';
  return 'check';
}


function badgeClass(status: EntryStatus): string {
  const map: Record<EntryStatus, string> = {
    check: 'bg-[#0d2a4a] text-blue border-blue',
    relative: 'bg-[#2d1515] text-[#f85149] border-[#f85149]',
    duplicate: 'bg-bg3 text-muted border-border',
    empty: 'bg-[#3d2f0d] text-amber border-amber',
  };
  return map[status];
}

export default function PathDebugger() {
  const [pathInput, setPathInput] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<PathRow[]>([]);
  const [stats, setStats] = useState({ total: 0, toCheck: 0, empty: 0, dupes: 0, risky: 0 });
  const [cleanedPath, setCleanedPath] = useState('');
  const [keepExisting, setKeepExisting] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { copied, copy } = useClipboard();
  const checkClip = useClipboard();
  const keepClip = useClipboard();
  const sourcesClip = useClipboard();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const analyzePath = useCallback(() => {
    const raw = pathInput.trim();
    setError('');

    if (!raw) {
      setError('Paste your $PATH value above');
      setAnalyzed(true);
      setRows([]);
      setCleanedPath('');
      setKeepExisting('');
      setStats({ total: 0, toCheck: 0, empty: 0, dupes: 0, risky: 0 });
      return;
    }

    const entries = raw.split(':');
    const seen: Record<string, number> = {};
    const resultRows: PathRow[] = [];
    let countCheck = 0;
    let countEmpty = 0;
    let countDupes = 0;
    let countRisky = 0;
    const cleanedEntries: string[] = [];

    entries.forEach((entry, i) => {
      let status: EntryStatus;
      let note: string;

      if (entry !== '' && seen[entry] !== undefined) {
        // The first occurrence wins when resolving a command; this copy never runs.
        status = 'duplicate';
        note = `Shadowed — entry #${seen[entry]} appears first and always wins`;
        countDupes++;
      } else {
        if (entry !== '') seen[entry] = i + 1;
        const cls = classifyEntry(entry);

        if (cls === 'empty') {
          // A bare/empty PATH element is treated as "." by the shell — same CWD risk.
          status = 'empty';
          note = 'Empty entry (bare colon) — shell treats this as the current directory';
          countEmpty++;
        } else if (cls === 'relative') {
          status = 'relative';
          note =
            i === 0
              ? 'CRITICAL — relative path is first in PATH; a planted binary here shadows every system command'
              : 'Security risk — relative path; a binary in the working directory can shadow real commands';
          countRisky++;
        } else {
          status = 'check';
          note = entry.includes('..')
            ? 'Contains .. — works, but write the resolved directory instead. Existence: run the check below'
            : "Absolute path — a browser can't see your disk; run the check below to confirm it exists";
          countCheck++;
          cleanedEntries.push(entry);
        }
      }

      resultRows.push({ entry: entry || '(empty)', status, note });
    });

    setStats({
      total: entries.length,
      toCheck: countCheck,
      empty: countEmpty,
      dupes: countDupes,
      risky: countRisky,
    });
    setRows(resultRows);
    setCleanedPath(`export PATH=${shQuote(cleanedEntries.join(':'))}`);
    setKeepExisting(buildKeepExisting(cleanedEntries));
    setAnalyzed(true);
  }, [pathInput]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(analyzePath, 600);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [pathInput, analyzePath]);

  const loadExample = useCallback(() => {
    setPathInput(EXAMPLE_PATH);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!cleanedPath) return;
    const ok = await copy(cleanedPath);
    if (ok) setShowToast(true);
  }, [cleanedPath, copy]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 1800);
    return () => clearTimeout(t);
  }, [showToast]);

  return (
    <div className="rounded-lg border border-border bg-bg">
      <div className="flex flex-col gap-6 p-0 md:flex-row">
        <div className="min-w-[280px] flex-[0_0_45%] rounded-lg border border-border bg-bg2 p-6">
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-green">Your $PATH value</div>
          <div className="mb-2.5 font-mono text-xs text-muted">
            Run: <code className="text-text">echo $PATH</code> — then paste the output here
          </div>

          <textarea
            id="path-input"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="/usr/local/bin:/usr/bin:/bin:..."
            className="min-h-[120px] w-full resize-y rounded-md border border-border bg-bg3 px-3 py-3 font-mono text-[13px] leading-relaxed text-text outline-none focus:border-green"
          />

          <p className="my-2.5 font-mono text-xs leading-snug text-muted">
            A web page cannot read your system or your disk. This tool checks the text you paste; the shell lines it generates check the directories for real.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={analyzePath}
              className="rounded-md border-none bg-green px-5 py-2.5 font-mono text-[13px] font-semibold text-[#0d1117] hover:opacity-85"
            >
              Analyze PATH →
            </button>
            <button
              type="button"
              onClick={loadExample}
              className="rounded-md border border-border bg-bg3 px-5 py-2.5 font-mono text-[13px] text-text hover:border-muted"
            >
              Load example $PATH
            </button>
          </div>
        </div>

        <div className="min-w-[280px] flex-1 rounded-lg border border-border bg-bg2">
          {!analyzed && (
            <div className="px-5 py-10 text-center font-mono text-sm text-muted">
              ← Paste your $PATH and click Analyze
            </div>
          )}

          {analyzed && (
            <div className="p-5">
              {error && (
                <div className="mb-4 rounded-md border border-[#f85149] bg-[#2d1515] px-3.5 py-2.5 font-mono text-[13px] text-[#f85149]">
                  {error}
                </div>
              )}

              {!error && (
                <>
                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue bg-bg3 px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-blue">
                      {stats.total} director{stats.total === 1 ? 'y' : 'ies'}
                    </span>
                    <span className="rounded-full border border-blue bg-[#0d2a4a] px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-blue">
                      {stats.toCheck} to check on disk
                    </span>
                    {stats.empty > 0 && (
                      <span className="rounded-full border border-amber bg-[#3d2f0d] px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-amber">
                        {stats.empty} empty
                      </span>
                    )}
                    <span className="rounded-full border border-border bg-bg3 px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-muted">
                      {stats.dupes} duplicate{stats.dupes === 1 ? '' : 's'}
                    </span>
                    {stats.risky > 0 && (
                      <span className="rounded-full border border-[#f85149] bg-[#2d1515] px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-[#f85149]">
                        {stats.risky} security risk{stats.risky === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  {stats.risky > 0 && (
                    <div role="alert" className="mb-5 rounded-md border-l-[3px] border-[#f85149] bg-[#2d1515] px-3.5 py-3 font-mono text-xs leading-relaxed text-text">
                      <strong className="text-[#f85149]">Security risk:</strong> a relative or empty PATH entry lets a binary in the current working directory shadow real system commands. Remove every non-absolute entry. The cleaned PATH below already drops them.
                    </div>
                  )}

                  <div className="mb-6 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-bg3">
                          <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Directory</th>
                          <th className="w-[120px] px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Status</th>
                          <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, j) => (
                          <tr key={j} className={`border-b border-border ${j % 2 !== 0 ? 'bg-[rgba(13,17,23,0.5)]' : ''}`}>
                            <td className="break-all px-3.5 py-2 font-mono text-xs text-text">{row.entry}</td>
                            <td className="px-3.5 py-2">
                              <span className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${badgeClass(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3.5 py-2 font-mono text-xs text-muted">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-green">
                      Check every entry on your machine
                    </div>
                    <p className="mb-2 font-mono text-xs leading-relaxed text-muted">
                      Run this in the shell whose PATH you pasted. It prints one line per empty, relative or missing entry and nothing when all of them exist.
                    </p>
                    <div className="relative rounded-md border border-border bg-bg3 p-3.5">
                      <pre className="whitespace-pre-wrap break-all pr-16 font-mono text-xs leading-relaxed text-text">
                        {PATH_CHECK_COMMAND}
                      </pre>
                      <div className="absolute right-2.5 top-2.5">
                        <CopyButton copied={checkClip.copied} onClick={() => void checkClip.copy(PATH_CHECK_COMMAND)} />
                      </div>
                    </div>
                  </div>

                  {stats.dupes > 0 && (
                    <div className="mb-6">
                      <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-green">
                        Where is each entry added?
                      </div>
                      <p className="mb-2 font-mono text-xs leading-relaxed text-muted">
                        A duplicate usually means two startup files add the same directory, or one file is sourced twice. This lists every PATH= line in the usual bash and zsh startup files, with its line number.
                      </p>
                      <div className="relative rounded-md border border-border bg-bg3 p-3.5">
                        <pre className="whitespace-pre-wrap break-all pr-16 font-mono text-xs leading-relaxed text-text">
                          {PATH_SOURCES_COMMAND}
                        </pre>
                        <div className="absolute right-2.5 top-2.5">
                          <CopyButton copied={sourcesClip.copied} onClick={() => void sourcesClip.copy(PATH_SOURCES_COMMAND)} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-green">
                      Cleaned export PATH= (duplicates, empty + relative entries removed)
                    </div>
                    <div className="relative rounded-md border border-border bg-bg3 p-3.5">
                      <pre className="whitespace-pre-wrap break-all pr-16 font-mono text-xs leading-relaxed text-text">
                        {cleanedPath}
                      </pre>
                      <div className="absolute right-2.5 top-2.5">
                        <CopyButton copied={copied} onClick={() => void handleCopy()} />
                      </div>
                    </div>
                  </div>

                  {keepExisting && (
                    <div>
                      <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-green">
                        Same list, keeping only directories that exist
                      </div>
                      <p className="mb-2 font-mono text-xs leading-relaxed text-muted">
                        Tests each directory with <code className="text-text">[[ -d ]]</code> on the machine where you run it, so a directory missing there is dropped and the order is kept.
                      </p>
                      <div className="relative rounded-md border border-border bg-bg3 p-3.5">
                        <pre className="whitespace-pre-wrap break-all pr-16 font-mono text-xs leading-relaxed text-text">
                          {keepExisting}
                        </pre>
                        <div className="absolute right-2.5 top-2.5">
                          <CopyButton copied={keepClip.copied} onClick={() => void keepClip.copy(keepExisting)} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-green bg-bg3 px-3.5 py-2.5 font-mono text-xs text-text"
        >
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
