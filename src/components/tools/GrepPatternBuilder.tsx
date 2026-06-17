'use client';

import { escapeHtml } from './shared/bashHighlight';
import { useClipboard } from './shared/useClipboard';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────
type RegexEngine = 'basic' | 'extended' | 'perl';
type PartType = 'cmd' | 'flag' | 'include' | 'pattern' | 'path';
interface Part {
  text: string;
  type: PartType;
}

const PRESETS: { label: string; path: string; type: string }[] = [
  { label: 'Logs /var/log/', path: '/var/log/', type: '' },
  { label: 'Python src/', path: 'src/', type: '*.py' },
  { label: 'Shell scripts', path: '.', type: '*.sh' },
  { label: 'JS/TS src/', path: 'src/', type: '*.js,*.ts' },
  { label: 'Config /etc/', path: '/etc/', type: '*.conf' },
];

const ENGINES: { id: RegexEngine; label: string; note: string }[] = [
  { id: 'basic', label: 'Basic (BRE)', note: 'Default grep. + ? | ( ) are literal unless escaped with a backslash.' },
  { id: 'extended', label: '-E (ERE)', note: 'Extended regex — use + ? | ( ) without backslashes. Same as egrep.' },
  { id: 'perl', label: '-P (PCRE)', note: 'Perl-compatible regex — adds \\d, \\w, lookaheads. GNU grep only (not macOS/BSD).' },
];

// ── Pure logic (no React) ───────────────────────────────────────
const COLORS: Record<PartType, string> = {
  cmd: 'color:#39d353;font-weight:600;',
  flag: 'color:#58a6ff;',
  include: 'color:#e3b341;',
  pattern: 'color:#e3b341;',
  path: 'color:#8b949e;',
};

/** A path token looks like a directory when it ends with / or has no extension. */
function looksLikeDir(p: string): boolean {
  if (!p) return false;
  if (p.charAt(p.length - 1) === '/') return true;
  const last = p.split('/').pop() ?? '';
  return last.length > 0 && last.indexOf('.') === -1;
}

/** Turn comma-separated file types into --include="*.ext" tokens. */
function buildIncludes(raw: string): string[] {
  if (!raw.trim()) return [];
  const result: string[] = [];
  raw.split(',').forEach((t) => {
    let ext = t.trim();
    if (!ext) return;
    if (!/[*?]/.test(ext)) {
      ext = ext.charAt(0) === '.' ? '*' + ext : '*.' + ext;
    }
    result.push(`--include="${ext}"`);
  });
  return result;
}

interface BuildArgs {
  pattern: string;
  path: string;
  filetype: string;
  engine: RegexEngine;
  caseI: boolean;
  recursive: boolean;
  lineNums: boolean;
  invert: boolean;
  count: boolean;
  filenames: boolean;
  word: boolean;
  quiet: boolean;
  contextOn: boolean;
  contextN: number;
}

function buildParts(a: BuildArgs): Part[] {
  const ctx = Math.max(0, Math.min(5, a.contextN || 0));
  const useContext = a.contextOn && ctx > 0;

  // Combine short flags into a single -xyz token.
  let flags = '';
  if (a.recursive) flags += 'r';
  if (a.caseI) flags += 'i';
  // -n is suppressed when -c, -l, or -q is active (they change output mode).
  if (a.lineNums && !a.count && !a.filenames && !a.quiet) flags += 'n';
  if (a.invert) flags += 'v';
  if (a.count) flags += 'c';
  if (a.filenames) flags += 'l';
  if (a.engine === 'extended') flags += 'E';
  if (a.engine === 'perl') flags += 'P';
  if (a.word) flags += 'w';
  if (a.quiet) flags += 'q';

  const parts: Part[] = [{ text: 'grep', type: 'cmd' }];
  if (flags) parts.push({ text: '-' + flags, type: 'flag' });
  if (useContext) {
    parts.push({ text: '-B ' + ctx, type: 'flag' });
    parts.push({ text: '-A ' + ctx, type: 'flag' });
  }
  buildIncludes(a.filetype).forEach((inc) => parts.push({ text: inc, type: 'include' }));

  const quotedPattern = '"' + a.pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  parts.push({ text: quotedPattern, type: 'pattern' });

  if (a.path.trim()) parts.push({ text: a.path.trim(), type: 'path' });
  return parts;
}

function highlightCommand(parts: Part[]): string {
  return parts
    .map((p) => `<span style="${COLORS[p.type]}">${escapeHtml(p.text)}</span>`)
    .join(' ');
}

function buildExplanation(a: BuildArgs): string {
  if (!a.pattern) {
    return '<span style="color:#8b949e;font-style:italic;">Enter a search pattern to see the plain-English explanation.</span>';
  }
  const path = a.path.trim();
  const ctx = Math.max(0, a.contextN || 0);
  const useContext = a.contextOn && ctx > 0;

  const action = a.recursive
    ? `Searches recursively through <code style="color:#39d353;">${escapeHtml(path || '.')}</code>`
    : `Searches <code style="color:#39d353;">${escapeHtml(path || 'the file')}</code>`;

  let subject: string;
  if (a.invert) {
    subject = `for lines <em>not</em> containing <code style="color:#e3b341;">${escapeHtml(a.pattern)}</code>`;
  } else if (a.word) {
    subject = `for lines where the whole word matches <code style="color:#e3b341;">${escapeHtml(a.pattern)}</code>`;
  } else {
    subject = `for lines containing <code style="color:#e3b341;">${escapeHtml(a.pattern)}</code>`;
  }

  const mods: string[] = [];
  if (a.caseI) mods.push('case-insensitive');
  if (a.engine === 'extended') mods.push('extended regex');
  if (a.engine === 'perl') mods.push('Perl regex');
  if (mods.length) subject += ` (${mods.join(', ')})`;

  let output = '';
  if (a.quiet) {
    output = ', suppressing all output — exits 0 if a match is found (useful in if statements)';
  } else if (a.filenames) {
    output = ', printing only the filenames of matching files';
  } else if (a.count) {
    output = ', printing the count of matching lines per file';
  } else {
    const outParts: string[] = [];
    if (a.lineNums) outParts.push('showing line numbers');
    if (useContext) outParts.push(`with ${ctx} lines of context before and after each match`);
    if (outParts.length) output = ', ' + outParts.join(' and ');
  }
  return `${action} ${subject}${output}.`;
}

// ── Live tester ─────────────────────────────────────────────────
interface SampleResult {
  html: string;
  matchCount: number;
  error: boolean;
}

function highlightSegment(line: string, regex: RegExp): string {
  let out = '';
  let last = 0;
  let guard = 0;
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null && guard++ < 10000) {
    if (m[0].length === 0) {
      regex.lastIndex++;
      continue;
    }
    out += escapeHtml(line.slice(last, m.index));
    out += `<span style="background:#1a4a2e;color:#39d353;border-radius:2px;">${escapeHtml(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  out += escapeHtml(line.slice(last));
  return out;
}

function runSample(sample: string, a: BuildArgs): SampleResult {
  if (!sample) {
    return { html: '<span style="color:#8b949e;font-style:italic;">Paste sample text to preview matches.</span>', matchCount: 0, error: false };
  }
  if (!a.pattern) {
    return { html: escapeHtml(sample), matchCount: 0, error: false };
  }
  let source = a.pattern;
  if (a.word) source = `\\b(?:${source})\\b`;
  let regex: RegExp;
  try {
    regex = new RegExp(source, 'g' + (a.caseI ? 'i' : ''));
  } catch {
    return { html: '<span style="color:#e3b341;font-style:italic;">Invalid regex pattern for the JavaScript preview engine.</span>', matchCount: 0, error: true };
  }

  let matchCount = 0;
  const lines = sample.split('\n').map((line) => {
    const test = new RegExp(source, a.caseI ? 'i' : '');
    const hit = test.test(line);
    const passes = a.invert ? !hit : hit;
    if (passes) matchCount++;
    if (a.invert) {
      return passes
        ? `<span style="background:#1a4a2e;color:#39d353;border-radius:2px;">${escapeHtml(line || ' ')}</span>`
        : `<span style="color:#8b949e;">${escapeHtml(line)}</span>`;
    }
    return hit ? highlightSegment(line, regex) : `<span style="color:#8b949e;">${escapeHtml(line)}</span>`;
  });
  return { html: lines.join('\n'), matchCount, error: false };
}

// ── Component ───────────────────────────────────────────────────
export default function GrepPatternBuilder() {
  const [pattern, setPattern] = useState('error');
  const [path, setPath] = useState('/var/log/');
  const [filetype, setFiletype] = useState('');
  const [engine, setEngine] = useState<RegexEngine>('basic');

  const [caseI, setCaseI] = useState(true);
  const [recursive, setRecursive] = useState(true);
  const [lineNums, setLineNums] = useState(true);
  const [invert, setInvert] = useState(false);
  const [count, setCount] = useState(false);
  const [filenames, setFilenames] = useState(false);
  const [word, setWord] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [contextOn, setContextOn] = useState(false);
  const [contextN, setContextN] = useState(2);

  const [sample, setSample] = useState('');

  const { copied, copy } = useClipboard();
  const { copied: iconCopied, copy: copyIcon } = useClipboard();

  const args = useMemo<BuildArgs>(
    () => ({
      pattern,
      path,
      filetype,
      engine,
      caseI,
      recursive,
      lineNums,
      invert,
      count,
      filenames,
      word,
      quiet,
      contextOn,
      contextN,
    }),
    [pattern, path, filetype, engine, caseI, recursive, lineNums, invert, count, filenames, word, quiet, contextOn, contextN],
  );

  const rawCommand = useMemo(() => {
    if (!pattern && !path.trim()) return '';
    return buildParts(args).map((p) => p.text).join(' ');
  }, [args, pattern, path]);

  const commandHtml = useMemo(() => {
    if (!pattern && !path.trim()) {
      return '<span style="color:#8b949e;font-style:italic;"># Enter a pattern and path above to build your grep command</span>';
    }
    return highlightCommand(buildParts(args));
  }, [args, pattern, path]);

  const explanationHtml = useMemo(() => buildExplanation(args), [args]);
  const sampleResult = useMemo(() => runSample(sample, args), [sample, args]);

  // Auto-enable recursive when the path looks like a directory.
  const handlePathChange = useCallback((value: string) => {
    setPath(value);
    if (looksLikeDir(value.trim())) setRecursive(true);
  }, []);

  const applyPreset = useCallback((p: { path: string; type: string }) => {
    setPath(p.path);
    setFiletype(p.type);
    if (looksLikeDir(p.path.trim())) setRecursive(true);
  }, []);

  const handleCopy = useCallback(() => {
    if (rawCommand) void copy(rawCommand);
  }, [copy, rawCommand]);

  const handleIconCopy = useCallback(() => {
    if (rawCommand) void copyIcon(rawCommand);
  }, [copyIcon, rawCommand]);

  const selectedEngine = ENGINES.find((e) => e.id === engine)!;

  const toggle = (
    id: string,
    label: string,
    flag: string,
    checked: boolean,
    onChange: (v: boolean) => void,
    tip: string,
  ) => (
    <label htmlFor={id} className="mb-2.5 flex cursor-pointer select-none items-center gap-2 text-[13px] text-text">
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

  return (
    <div className="rounded-lg border border-border bg-bg p-4 md:p-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[360px_1fr]">
        {/* ── Inputs + toggles ──────────────────────────────── */}
        <div>
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// search inputs'}</div>

          <label htmlFor="grep-pattern" className="mb-1.5 block text-xs text-muted">Search Pattern</label>
          <input
            id="grep-pattern"
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. error|warning or [Ee]rror"
            autoComplete="off"
            spellCheck={false}
            className="mb-3.5 w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text outline-none focus:border-green"
          />

          <label htmlFor="grep-path" className="mb-1.5 block text-xs text-muted">File Path or Pattern</label>
          <input
            id="grep-path"
            type="text"
            value={path}
            onChange={(e) => handlePathChange(e.target.value)}
            placeholder="e.g. /var/log/*.log or src/"
            autoComplete="off"
            spellCheck={false}
            className="mb-3.5 w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text outline-none focus:border-green"
          />

          <label htmlFor="grep-filetype" className="mb-1.5 block text-xs text-muted">
            File Type Filter <span className="text-[11px] text-muted">(comma-separated)</span>
          </label>
          <input
            id="grep-filetype"
            type="text"
            value={filetype}
            onChange={(e) => setFiletype(e.target.value)}
            placeholder="e.g. *.log, *.txt or log, conf"
            autoComplete="off"
            spellCheck={false}
            className="mb-1 w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text outline-none focus:border-green"
          />
          <div className="mb-4 text-[11px] text-muted">
            Generates <code className="text-amber">--include=&quot;*.ext&quot;</code> per type
          </div>

          <div className="mb-5 rounded-md border border-border bg-bg2 px-3.5 py-3">
            <div className="mb-2 text-[11px] text-muted">Quick file presets:</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="cursor-pointer rounded border border-border bg-bg3 px-2.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-muted hover:text-text"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// grep flags'}</div>

          {toggle('grep-case', 'Case insensitive', '-i', caseI, setCaseI, 'Matches ERROR, Error, error — any case combination')}
          {toggle('grep-recursive', 'Recursive', '-r', recursive, setRecursive, 'Search all files in the directory and subdirectories. Auto-enabled when the path looks like a directory.')}
          {toggle('grep-linenums', 'Show line numbers', '-n', lineNums, setLineNums, 'Prefix each matching line with its line number in the file')}
          {toggle('grep-invert', 'Invert match', '-v', invert, setInvert, 'Print lines that do NOT match the pattern — useful for filtering out noise')}
          {toggle('grep-count', 'Count matches only', '-c', count, setCount, 'Print only the count of matching lines per file, not the lines themselves')}
          {toggle('grep-filenames', 'Filenames only', '-l', filenames, setFilenames, 'Print only the names of files containing a match — useful with xargs')}

          {/* Context lines */}
          <div className="mb-2.5 flex items-center gap-2">
            <input
              id="grep-context"
              type="checkbox"
              checked={contextOn}
              onChange={(e) => setContextOn(e.target.checked)}
              className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-green"
            />
            <label htmlFor="grep-context" className="cursor-pointer text-[13px] text-text">Context lines</label>
            <input
              type="number"
              min={0}
              max={5}
              value={contextN}
              disabled={!contextOn}
              onChange={(e) => setContextN(Math.max(0, Math.min(5, parseInt(e.target.value, 10) || 0)))}
              className="w-14 rounded-md border border-border bg-bg3 px-2 py-1 text-center font-mono text-[13px] text-text outline-none focus:border-green disabled:opacity-40"
            />
            <span title="Show N lines before and after each match. Generates -B N -A N flags." className="shrink-0 cursor-help text-blue">ⓘ</span>
            <span className={`ml-auto shrink-0 rounded border border-green/25 bg-green-dim px-1.5 py-px font-mono text-[11px] font-semibold text-green ${contextOn ? '' : 'opacity-40'}`}>
              -B/-A
            </span>
          </div>

          {toggle('grep-word', 'Word boundary only', '-w', word, setWord, "Won't match 'errors' or 'errored' when searching 'error' — matches whole words only")}
          {toggle('grep-quiet', 'Quiet mode (exit code only)', '-q', quiet, setQuiet, 'Suppress output; exits 0 if a match is found, 1 if not. Ideal for if-statement checks in scripts.')}

          {/* Regex engine: -E vs -P */}
          <div className="mt-4 mb-2 text-[11px] text-muted">Regex engine:</div>
          <div className="flex flex-wrap gap-1.5">
            {ENGINES.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEngine(e.id)}
                aria-pressed={engine === e.id}
                className={`cursor-pointer rounded-md border px-3 py-1.5 font-mono text-[12px] transition-colors ${
                  engine === e.id
                    ? 'border-green bg-green-dim text-green'
                    : 'border-border bg-bg3 text-muted hover:border-muted hover:text-text'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">{selectedEngine.note}</p>

          <div className="mt-4 rounded-md border-l-[3px] border-blue bg-blue-dim px-3.5 py-3 text-[11px] leading-relaxed text-muted">
            <strong className="text-text">Note:</strong> <code className="text-amber">-c</code> and <code className="text-amber">-l</code> override <code className="text-amber">-n</code> — per-file counts and filenames suppress line-number output.
          </div>
        </div>

        {/* ── Output (sticky) ───────────────────────────────── */}
        <div className="lg:sticky lg:top-20">
          <div className="flex items-center gap-3 rounded-t-lg border border-b-0 border-border bg-bg3 px-3.5 py-2.5">
            <div className="flex shrink-0 gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="inline-block h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="inline-block h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-xs text-muted">grep command</span>
            <button
              type="button"
              aria-label="Copy grep command"
              disabled={!rawCommand}
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

          <div
            className="mt-2.5 rounded-md border border-border border-l-[3px] border-l-green bg-bg2 px-3.5 py-3 text-[12px] leading-relaxed text-muted"
            aria-live="polite"
            dangerouslySetInnerHTML={{ __html: explanationHtml }}
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
            <Link href="/snippets/search-files-for-text-grep" className="block font-mono text-xs text-green hover:underline">
              Search Files for Text (grep) →
            </Link>
            <Link href="/snippets/delete-old-log-files" className="mt-1.5 block font-mono text-xs text-green hover:underline">
              Delete Old Log Files →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Live tester ─────────────────────────────────────── */}
      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted">{'// test against sample text'}</span>
          {sample && !sampleResult.error && (
            <span className="font-mono text-[11px] text-green">
              {sampleResult.matchCount} matching {sampleResult.matchCount === 1 ? 'line' : 'lines'}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
          <textarea
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            placeholder={'Paste log lines or sample text here…\nERROR: disk full\nINFO: backup complete'}
            spellCheck={false}
            rows={8}
            className="w-full resize-y rounded-md border border-border bg-bg3 p-3 font-mono text-[13px] leading-relaxed text-text outline-none focus:border-green"
          />
          <pre
            className="m-0 min-h-[8rem] overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-border bg-bg p-3 font-mono text-[13px] leading-relaxed text-text"
            aria-live="polite"
            dangerouslySetInnerHTML={{ __html: sampleResult.html }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Preview uses the JavaScript regex engine — close to ERE/PCRE for everyday patterns. Highlighted spans are the lines grep would print for the current flags.
        </p>
      </div>
    </div>
  );
}
