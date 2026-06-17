'use client';

import CopyButton from '@/components/CopyButton';
import { highlightBash } from './shared/bashHighlight';
import { useClipboard } from './shared/useClipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type HandlerStyle = 'ifelse' | 'case' | 'inline';

interface ExitCodeInfo {
  meaning: string;
  causes: string;
  example: string;
}

const EXIT_CODES: Record<number, ExitCodeInfo> = {
  0: { meaning: 'Success', causes: 'Command completed without errors', example: 'All good' },
  1: { meaning: 'General error', causes: 'Catchall for unspecified errors', example: 'Permission denied, file not found, etc.' },
  2: { meaning: 'Misuse of shell builtin', causes: 'Missing keyword, wrong argument type', example: 'Syntax error in script' },
  126: { meaning: 'Command cannot execute', causes: 'Permission problem, not executable', example: 'File exists but lacks +x permission' },
  127: { meaning: 'Command not found', causes: 'Typo in command, not in PATH, not installed', example: 'Tried to run nonexistent command' },
  128: { meaning: 'Invalid argument to exit', causes: 'exit called with non-integer or out-of-range value', example: 'exit 3.14 or exit -1' },
  130: { meaning: 'Script terminated by Ctrl-C', causes: 'User pressed Ctrl-C (SIGINT)', example: 'Manual interrupt' },
  131: { meaning: 'Quit signal (SIGQUIT)', causes: 'User pressed Ctrl-\\ — terminate with core dump', example: 'Manual quit signal' },
  134: { meaning: 'Aborted (SIGABRT)', causes: 'abort() called, often from assertion failure', example: 'C program assertion failed' },
  137: { meaning: 'Script terminated by SIGKILL', causes: 'kill -9 sent to process', example: 'OOM killer or manual kill -9' },
  139: { meaning: 'Segmentation fault', causes: 'Invalid memory access (usually C program crash)', example: 'Core dumped' },
  141: { meaning: 'Pipe closed (SIGPIPE)', causes: 'Wrote to a pipe with no readers', example: 'cmd | head closed early' },
  143: { meaning: 'Script terminated by SIGTERM', causes: 'kill command (default signal)', example: 'Graceful shutdown requested' },
  255: { meaning: 'Exit status out of range', causes: 'exit called with value > 255 or negative', example: 'exit -1 wraps to 255' },
};

const COMMON_CODES = [
  { code: 0, label: '0 (success)', tooltip: 'Success' },
  { code: 1, label: '1 (error)', tooltip: 'General error' },
  { code: 2, label: '2 (misuse)', tooltip: 'Misuse of shell builtin' },
  { code: 126, label: '126 (not exec)', tooltip: 'Command cannot execute' },
  { code: 127, label: '127 (not found)', tooltip: 'Command not found' },
  { code: 130, label: '130 (ctrl-c)', tooltip: 'Script terminated by Ctrl-C' },
  { code: 137, label: '137 (SIGKILL)', tooltip: 'Script terminated by SIGKILL' },
  { code: 139, label: '139 (segfault)', tooltip: 'Segmentation fault' },
  { code: 143, label: '143 (SIGTERM)', tooltip: 'Script terminated by SIGTERM' },
];

interface SignalInfo {
  name: string;
  desc: string;
  trappable: boolean;
}

// Signal numbers that, added to 128, produce the exit code of a terminated process.
const SIGNALS: Record<number, SignalInfo> = {
  1: { name: 'SIGHUP', desc: 'Hangup — controlling terminal closed', trappable: true },
  2: { name: 'SIGINT', desc: 'Interrupt from keyboard (Ctrl-C)', trappable: true },
  3: { name: 'SIGQUIT', desc: 'Quit from keyboard (Ctrl-\\), core dump', trappable: true },
  4: { name: 'SIGILL', desc: 'Illegal instruction', trappable: true },
  6: { name: 'SIGABRT', desc: 'Abort signal from abort()', trappable: true },
  8: { name: 'SIGFPE', desc: 'Floating-point exception', trappable: true },
  9: { name: 'SIGKILL', desc: 'Killed — cannot be caught or ignored', trappable: false },
  11: { name: 'SIGSEGV', desc: 'Invalid memory reference (segfault)', trappable: true },
  13: { name: 'SIGPIPE', desc: 'Broken pipe — wrote with no reader', trappable: true },
  14: { name: 'SIGALRM', desc: 'Timer signal from alarm()', trappable: true },
  15: { name: 'SIGTERM', desc: 'Termination signal (default kill)', trappable: true },
  19: { name: 'SIGSTOP', desc: 'Stop process — cannot be caught or ignored', trappable: false },
  24: { name: 'SIGXCPU', desc: 'CPU time limit exceeded', trappable: true },
  25: { name: 'SIGXFSZ', desc: 'File size limit exceeded', trappable: true },
};

interface SignalForCode extends SignalInfo {
  num: number;
}

function signalForCode(code: number): SignalForCode | null {
  if (code > 128 && code <= 128 + 64) {
    const num = code - 128;
    const sig = SIGNALS[num];
    if (sig) return { num, ...sig };
  }
  return null;
}

function lookup(code: number): ExitCodeInfo {
  if (EXIT_CODES[code]) return EXIT_CODES[code];
  const sig = signalForCode(code);
  if (sig) {
    return {
      meaning: `Terminated by ${sig.name}`,
      causes: `Process received signal ${sig.num} (${sig.name}) — ${sig.desc}`,
      example: `128 + ${sig.num} = ${code}`,
    };
  }
  return {
    meaning: `Exit code ${code}`,
    causes: 'Check command documentation',
    example: '',
  };
}

interface SearchEntry {
  code: number;
  meaning: string;
  keywords: string;
}

// Flattened, lowercased index of every known code (and signal code) for free-text search.
const SEARCH_INDEX: SearchEntry[] = (() => {
  const byCode = new Map<number, SearchEntry>();
  for (const [c, info] of Object.entries(EXIT_CODES)) {
    const code = Number(c);
    byCode.set(code, {
      code,
      meaning: info.meaning,
      keywords: `${code} ${info.meaning} ${info.causes} ${info.example}`.toLowerCase(),
    });
  }
  for (const [n, sig] of Object.entries(SIGNALS)) {
    const code = 128 + Number(n);
    const existing = byCode.get(code);
    const sigWords = ` ${sig.name} ${sig.desc} signal ${n}`.toLowerCase();
    if (existing) {
      existing.keywords += sigWords;
    } else {
      byCode.set(code, {
        code,
        meaning: `Terminated by ${sig.name}`,
        keywords: `${code}${sigWords}`,
      });
    }
  }
  return [...byCode.values()].sort((a, b) => a.code - b.code);
})();

function buildTrapHandler(code: number, sig: SignalForCode): string {
  const shortName = sig.name.replace(/^SIG/, '');
  return `trap 'echo "Caught ${sig.name}, cleaning up"; exit ${code}' ${shortName}`;
}

function buildHandler(code: number, style: HandlerStyle, meaning: string): string {
  const safeMeaning = meaning.replace(/"/g, '\\"');
  if (style === 'case') {
    return `case $? in\n  ${code}) echo "Error: ${safeMeaning}"; exit ${code};;\nesac`;
  }
  if (style === 'inline') {
    return `command || { echo "Error: ${safeMeaning}"; exit ${code}; }`;
  }
  return `if [ $? -eq ${code} ]; then\n  echo "Error: ${safeMeaning}"\n  exit ${code}\nfi`;
}

export default function BashExitCodeLookup() {
  const searchParams = useSearchParams();
  const [codeInput, setCodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [handlerStyle, setHandlerStyle] = useState<HandlerStyle>('ifelse');
  const [view, setView] = useState<'empty' | 'loading' | 'result'>('empty');
  const [result, setResult] = useState<{ code: number; info: ExitCodeInfo; handler: string } | null>(null);
  const [handlerFlash, setHandlerFlash] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { copied, copy } = useClipboard();
  const { copied: trapCopied, copy: copyTrap } = useClipboard();
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = searchQuery.trim().toLowerCase();
  const searchMatches = query
    ? SEARCH_INDEX.filter((e) => e.keywords.includes(query)).slice(0, 8)
    : [];

  const renderResult = useCallback(
    (code: number, shouldUpdateUrl: boolean, shouldFlashHandler: boolean) => {
      const info = lookup(code);
      const handler = buildHandler(code, handlerStyle, info.meaning);
      setResult({ code, info, handler });
      setView('result');

      if (shouldFlashHandler) {
        setHandlerFlash(true);
        setTimeout(() => setHandlerFlash(false), 600);
      }

      if (shouldUpdateUrl && typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('code', String(code));
          const next = url.pathname + url.search + url.hash;
          const current = window.location.pathname + window.location.search + window.location.hash;
          if (next !== current) window.history.pushState({}, '', next);
        } catch {
          /* no-op */
        }
      }
    },
    [handlerStyle],
  );

  const render = useCallback(
    (options?: { updateUrl?: boolean; flashHandler?: boolean }) => {
      const rawValue = codeInput.trim();
      const code = parseInt(rawValue, 10);

      if (rawValue === '' || Number.isNaN(code) || code < 0 || code > 255) {
        if (renderTimer.current) clearTimeout(renderTimer.current);
        setView('empty');
        setResult(null);
        return;
      }

      if (renderTimer.current) clearTimeout(renderTimer.current);
      setView('loading');
      renderTimer.current = setTimeout(() => {
        renderResult(code, !!options?.updateUrl, !!options?.flashHandler);
      }, 200);
    },
    [codeInput, renderResult],
  );

  useEffect(() => {
    const initial = searchParams.get('code');
    if (initial !== null && /^\d+$/.test(initial)) {
      const n = parseInt(initial, 10);
      if (n >= 0 && n <= 255) {
        setCodeInput(String(n));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    render();
  }, [codeInput, handlerStyle, render]);

  const handleCopy = useCallback(async () => {
    if (!result?.handler) return;
    const ok = await copy(result.handler);
    if (ok) setShowToast(true);
  }, [result, copy]);

  const resultSignal = result ? signalForCode(result.code) : null;

  const handleTrapCopy = useCallback(async () => {
    if (!result || !resultSignal) return;
    await copyTrap(buildTrapHandler(result.code, resultSignal));
  }, [result, resultSignal, copyTrap]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 1800);
    return () => clearTimeout(t);
  }, [showToast]);

  return (
    <div className="rounded-lg border border-border bg-bg p-0">
      <div className="flex flex-col items-start gap-6 md:flex-row">
        <div className="w-full shrink-0 md:w-[340px]">
          <label htmlFor="inp-search" className="mb-1.5 block font-mono text-xs text-muted">
            Search codes & signals
          </label>
          <div className="relative mb-4">
            <input
              type="text"
              id="inp-search"
              placeholder="e.g. sigkill, segfault, not found"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-sm text-text outline-none focus:border-green"
            />
            {query && (
              <div className="mt-1.5 overflow-hidden rounded-md border border-border bg-bg2">
                {searchMatches.length === 0 ? (
                  <div className="px-3 py-2 font-mono text-xs text-muted">No matches</div>
                ) : (
                  searchMatches.map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => {
                        setCodeInput(String(m.code));
                        setSearchQuery('');
                        render({ updateUrl: true });
                      }}
                      className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left font-mono text-xs text-text last:border-b-0 hover:bg-bg3"
                    >
                      <span className="shrink-0 font-semibold text-green">{m.code}</span>
                      <span className="truncate text-muted">{m.meaning}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <label htmlFor="inp-code" className="mb-1.5 block font-mono text-xs text-muted">
            Exit Code
          </label>
          <input
            type="number"
            id="inp-code"
            placeholder="0-255"
            min={0}
            max={255}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') render({ updateUrl: true });
            }}
            className="w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-sm text-text outline-none focus:border-green"
          />

          <label htmlFor="sel-handler" className="mb-1.5 mt-4 block font-mono text-xs text-muted">
            Handler Type
          </label>
          <select
            id="sel-handler"
            value={handlerStyle}
            onChange={(e) => {
              setHandlerStyle(e.target.value as HandlerStyle);
              render({ updateUrl: true, flashHandler: true });
            }}
            className="w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text"
          >
            <option value="ifelse">if/else block</option>
            <option value="case">case statement</option>
            <option value="inline">inline || fallback</option>
          </select>

          <div className="mt-5">
            <div className="mb-2.5 font-mono text-[11px] uppercase tracking-widest text-muted">
              {'// common codes'}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_CODES.map(({ code, label, tooltip }) => (
                <button
                  key={code}
                  type="button"
                  title={tooltip}
                  onClick={() => {
                    setCodeInput(String(code));
                    render({ updateUrl: true });
                  }}
                  className="cursor-pointer rounded-md border border-border bg-bg2 px-2.5 py-2 font-mono text-[11px] text-text hover:border-green"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!result?.handler}
            onClick={() => void handleCopy()}
            className="mt-5 w-full rounded-lg border-none bg-green py-2.5 font-mono text-[13px] font-semibold text-[#0d1117] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? '✓ Copied' : '⧉ Copy Handler'}
          </button>

          <div className="mt-4 rounded-md border-l-[3px] border-blue bg-[#0d2744] px-3.5 py-3 text-xs leading-relaxed text-muted">
            <strong className="text-text">Pro tip:</strong> Exit codes 128+N mean the process was killed by signal N. For example, 137 = 128 + 9 (SIGKILL).
          </div>
        </div>

        <div className="min-w-0 flex-1 md:sticky md:top-20">
          {view === 'empty' && (
            <div className="rounded-lg border border-border bg-bg2 px-6 py-10 text-center text-sm text-muted">
              ← Enter a code between 0 and 255
            </div>
          )}

          {view === 'loading' && (
            <div className="rounded-lg border border-border bg-bg2 p-6" aria-live="polite">
              <span className="mb-3 block h-8 w-20 animate-pulse rounded-full bg-bg3" />
              <span className="mb-3.5 block h-3.5 w-[180px] animate-pulse rounded-full bg-bg3" />
              <span className="block h-3.5 w-[90%] animate-pulse rounded-full bg-bg3" />
            </div>
          )}

          {view === 'result' && result && (
            <>
              <div className="mb-4 rounded-lg border border-border bg-bg2 px-6 py-5">
                <div className="mb-1.5 text-[11px] uppercase tracking-widest text-green">Exit Code</div>
                <div className="font-heading text-[32px] font-bold text-text">{result.code}</div>
                <div className="mb-4 text-[15px] text-amber">{result.info.meaning}</div>
                <div className="text-[13px] leading-relaxed text-muted">
                  Common causes: {result.info.causes}
                  {result.info.example ? ` — ${result.info.example}` : ''}
                </div>
              </div>

              {resultSignal && (
                <div className="mb-4 rounded-lg border border-border bg-bg2 px-6 py-5">
                  <div className="mb-2 text-[11px] uppercase tracking-widest text-green">Signal mapping</div>
                  <div className="mb-3 font-mono text-[15px] text-text">
                    <span className="text-muted">128</span> + <span className="text-amber">{resultSignal.num}</span> ={' '}
                    <span className="font-semibold text-green">{result.code}</span>{' '}
                    <span className="text-text">{resultSignal.name}</span>
                  </div>
                  <p className="mb-3 text-[13px] leading-relaxed text-muted">{resultSignal.desc}</p>
                  {resultSignal.trappable ? (
                    <>
                      <div className="mb-2 flex items-center justify-between gap-3 border-b border-border pb-2">
                        <span className="font-mono text-xs text-muted">Trap handler</span>
                        <CopyButton copied={trapCopied} onClick={() => void handleTrapCopy()} />
                      </div>
                      <pre
                        className="overflow-x-auto bg-transparent font-mono text-[13px] leading-relaxed text-text"
                        dangerouslySetInnerHTML={{ __html: highlightBash(buildTrapHandler(result.code, resultSignal)) }}
                      />
                    </>
                  ) : (
                    <div className="rounded-md border-l-[3px] border-amber bg-[#3d2f0d] px-3.5 py-2.5 font-mono text-xs leading-relaxed text-amber">
                      {resultSignal.name} cannot be caught, blocked, or ignored — no trap handler is possible.
                    </div>
                  )}
                </div>
              )}

              <div
                className={`rounded-lg border border-border bg-bg p-4 ${handlerFlash ? 'border-l-[3px] border-l-green' : 'border-l-[3px] border-l-border'}`}
              >
                <div className="mb-2 flex items-center justify-between gap-3 border-b border-border pb-2">
                  <span className="font-mono text-xs text-muted">Generated Handler</span>
                  <CopyButton copied={copied} onClick={() => void handleCopy()} />
                </div>
                <pre
                  className="overflow-x-auto bg-transparent font-mono text-[13px] leading-relaxed text-text"
                  dangerouslySetInnerHTML={{ __html: highlightBash(result.handler) }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {showToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-green bg-bg3 px-3.5 py-2.5 font-mono text-xs text-text"
        >
          Handler copied to clipboard
        </div>
      )}
    </div>
  );
}
