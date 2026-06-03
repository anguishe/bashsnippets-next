'use client';

import CopyButton from '@/components/CopyButton';
import {
  CATEGORIES,
  QUICK_CODES,
  SC_DATABASE,
  type ShellCheckEntry,
} from './shared/shellcheckData';
import { useClipboard } from './shared/useClipboard';
import { useCallback, useEffect, useState } from 'react';

const KEYWORDS: Record<string, number> = {
  if: 1, then: 1, else: 1, elif: 1, fi: 1, for: 1, do: 1, done: 1,
  while: 1, until: 1, case: 1, esac: 1, in: 1, local: 1, echo: 1,
  read: 1, return: 1, exit: 1, export: 1, set: 1, shift: 1, function: 1,
  printf: 1, grep: 1, find: 1, rm: 1, cd: 1, source: 1, cat: 1, test: 1,
  pgrep: 1, ssh: 1, cp: 1,
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightBashCode(code: string): string {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    if (ch === '#') {
      const lineEnd = code.indexOf('\n', i);
      const comment = lineEnd === -1 ? code.slice(i) : code.slice(i, lineEnd);
      out += `<span class="text-muted italic">${escapeHtml(comment)}</span>`;
      i += comment.length;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\' && quote === '"') { j += 2; continue; }
        if (code[j] === quote) { j++; break; }
        j++;
      }
      out += `<span class="text-amber">${escapeHtml(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    if (ch === '$') {
      let k = i + 1;
      if (code[k] === '{') {
        while (k < code.length && code[k] !== '}') k++;
        if (k < code.length) k++;
      } else if (code[k] === '(') {
        let depth = 1;
        k++;
        while (k < code.length && depth > 0) {
          if (code[k] === '(') depth++;
          else if (code[k] === ')') depth--;
          k++;
        }
      } else {
        while (k < code.length && /[A-Za-z0-9_#?*@!-]/.test(code[k])) k++;
      }
      out += `<span class="text-green">${escapeHtml(code.slice(i, k))}</span>`;
      i = k;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let w = i;
      while (w < code.length && /[A-Za-z0-9_]/.test(code[w])) w++;
      const word = code.slice(i, w);
      out += KEYWORDS[word]
        ? `<span class="text-blue">${escapeHtml(word)}</span>`
        : escapeHtml(word);
      i = w;
      continue;
    }
    out += escapeHtml(ch);
    i++;
  }
  return out;
}

function highlightLineDiff(line: string, otherLine: string, markClass: string): string {
  if (line === otherLine) return highlightBashCode(line);
  let pre = 0;
  while (pre < line.length && pre < otherLine.length && line[pre] === otherLine[pre]) pre++;
  let endLine = line.length;
  let endOther = otherLine.length;
  while (endLine > pre && endOther > pre && line[endLine - 1] === otherLine[endOther - 1]) {
    endLine--;
    endOther--;
  }
  let html = highlightBashCode(line.slice(0, pre));
  if (pre < endLine) {
    html += `<mark class="${markClass}">${highlightBashCode(line.slice(pre, endLine))}</mark>`;
  }
  html += highlightBashCode(line.slice(endLine));
  return html;
}

function renderComparedBlock(code: string, otherCode: string, isBefore: boolean): string {
  const lines = code.split('\n');
  const otherLines = otherCode.split('\n');
  const markClass = isBefore ? 'bg-[rgba(248,81,73,0.15)] rounded px-0.5' : 'bg-[rgba(57,211,83,0.15)] rounded px-0.5';
  return lines
    .map((line, idx) => {
      const other = otherLines[idx];
      if (other === undefined) {
        return `<mark class="${markClass}">${highlightBashCode(line)}</mark>`;
      }
      return highlightLineDiff(line, other, markClass);
    })
    .join('\n');
}

function normalizeCode(raw: string): string | null {
  const match = String(raw).match(/SC(\d{4})/i);
  return match ? `SC${match[1]}` : null;
}

function extractCodes(text: string): string[] {
  const found: string[] = [];
  const seen: Record<string, boolean> = {};
  const re = /SC(\d{4})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const code = `SC${m[1]}`;
    if (!seen[code]) {
      seen[code] = true;
      found.push(code);
    }
  }
  if (!found.length && /^\d{4}$/.test(text.trim())) {
    found.push(`SC${text.trim()}`);
  }
  return found;
}

type View = 'empty' | 'not-found' | 'result';

export default function ShellcheckErrorDecoder() {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [view, setView] = useState<View>('empty');
  const [entry, setEntry] = useState<ShellCheckEntry | null>(null);
  const [notFoundCode, setNotFoundCode] = useState('');
  const [multiCodes, setMultiCodes] = useState<string[]>([]);
  const [afterRaw, setAfterRaw] = useState('');
  const [disableRaw, setDisableRaw] = useState('');
  const [beforeHtml, setBeforeHtml] = useState('');
  const [afterHtml, setAfterHtml] = useState('');
  const { copied: fixCopied, copy: copyFix } = useClipboard();
  const { copied: disableCopied, copy: copyDisable } = useClipboard();

  const displayCode = useCallback((code: string) => {
    const found = SC_DATABASE[code];
    if (found) {
      setEntry(found);
      setAfterRaw(found.after);
      setDisableRaw(`# shellcheck disable=${found.code}`);
      setBeforeHtml(renderComparedBlock(found.before, found.after, true));
      setAfterHtml(renderComparedBlock(found.after, found.before, false));
      setView('result');
      setMultiCodes([]);
      if (typeof window !== 'undefined') {
        const hash = `#${code}`;
        if (window.location.hash !== hash) {
          window.history.replaceState(null, '', hash);
        }
      }
    } else if (/^SC\d{4}$/i.test(code)) {
      setNotFoundCode(code.toUpperCase());
      setView('not-found');
    } else {
      setView('empty');
    }
  }, []);

  const lookup = useCallback(() => {
    const text = input.trim();
    if (!text) {
      setView('empty');
      setMultiCodes([]);
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      return;
    }

    const codes = extractCodes(text);
    if (codes.length === 1) {
      displayCode(codes[0]);
      return;
    }
    if (codes.length > 1) {
      setView('empty');
      setMultiCodes(codes);
      return;
    }

    const lone = normalizeCode(text);
    if (lone && /^SC\d{4}$/i.test(lone) && !SC_DATABASE[lone]) {
      setNotFoundCode(lone);
      setView('not-found');
      setMultiCodes([]);
      return;
    }

    setView('empty');
    setMultiCodes([]);
  }, [displayCode, input]);

  useEffect(() => {
    lookup();
  }, [input, lookup]);

  useEffect(() => {
    const onHash = () => {
      const m = window.location.hash.match(/^#SC(\d{4})$/i);
      if (m) {
        const code = `SC${m[1]}`;
        setInput(code);
        displayCode(code);
      }
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [displayCode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      document.getElementById('sc-input')?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const selectCode = useCallback((code: string) => {
    setInput(code);
    displayCode(code);
  }, [displayCode]);

  const filteredQuickCodes = QUICK_CODES.filter((code) => {
    if (category === 'All') return true;
    return SC_DATABASE[code]?.category === category;
  });

  return (
    <div className="rounded-lg border border-border bg-bg">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full shrink-0 md:w-[340px]">
          <label className="mb-2 block font-mono text-[11px] uppercase text-muted" htmlFor="sc-input">
            {'// search by code or paste output'}
          </label>
          <div className="relative mb-2">
            <input
              id="sc-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="SC2086 or paste ShellCheck output"
              autoComplete="off"
              className="w-full rounded-lg border border-border bg-bg3 py-3 pl-4 pr-10 font-mono text-sm text-text outline-none focus:border-green"
            />
            {input && (
              <button
                type="button"
                aria-label="Clear input"
                onClick={() => setInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 border-none bg-transparent px-2 font-mono text-lg text-muted hover:text-text"
              >
                ×
              </button>
            )}
          </div>
          <p className="mb-4 font-mono text-xs text-muted">Accepts SC codes, numbers, or pasted ShellCheck messages</p>

          {multiCodes.length > 0 && (
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] text-amber">⚡ Multiple codes detected — click one to decode:</div>
              <div className="flex flex-wrap gap-1.5">
                {multiCodes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => selectCode(code)}
                    className="rounded-md border border-border bg-bg2 px-2 py-1 font-mono text-xs text-text hover:border-green"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-2 mt-5 font-mono text-[11px] uppercase text-muted">{'// filter by category'}</div>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-2xl border px-3.5 py-1.5 font-mono text-xs ${
                  category === cat ? 'border-green bg-green-dim text-green' : 'border-border bg-bg2 text-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mb-2 font-mono text-[11px] uppercase text-muted">{'// most common codes'}</div>
          <div className="grid grid-cols-3 gap-2 max-[480px]:grid-cols-2">
            {filteredQuickCodes.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => selectCode(code)}
                className="rounded-md border border-border bg-bg2 py-2 font-mono text-xs text-text hover:border-green hover:text-green"
              >
                {code}
              </button>
            ))}
          </div>

          <div className="mt-5 font-mono text-xs text-muted">
            <span className="text-green font-semibold">{Object.keys(SC_DATABASE).length}</span> error codes decoded
          </div>
        </div>

        <div className="min-w-0 flex-1 md:sticky md:top-20">
          {view === 'empty' && (
            <div className="flex min-h-[200px] items-center justify-center px-6 py-12 text-center">
              <p className="font-mono text-sm text-muted">
                ← Type an SC code or click one from the list
                <span className="animate-pulse text-green">_</span>
              </p>
            </div>
          )}

          {view === 'not-found' && (
            <div className="px-6 py-12 text-center">
              <p className="font-mono text-sm text-muted">{notFoundCode} isn&apos;t in our database yet.</p>
              <p className="mt-3">
                <a
                  href={`https://www.shellcheck.net/wiki/${notFoundCode}`}
                  target="_blank"
                  rel="noopener"
                  className="text-blue hover:underline"
                >
                  Check the ShellCheck wiki →
                </a>
              </p>
            </div>
          )}

          {view === 'result' && entry && (
            <div className="rounded-lg border border-border bg-bg2 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xl font-bold text-green">{entry.code}</span>
                <span
                  className={`rounded-xl border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide ${
                    entry.severity === 'error'
                      ? 'border-[rgba(248,81,73,0.35)] bg-[rgba(248,81,73,0.15)] text-[#f85149]'
                      : entry.severity === 'warning'
                        ? 'border-[rgba(227,179,65,0.35)] bg-[rgba(227,179,65,0.15)] text-amber'
                        : entry.severity === 'info'
                          ? 'border-[rgba(88,166,255,0.35)] bg-[rgba(88,166,255,0.15)] text-blue'
                          : 'border-border bg-bg3 text-muted'
                  }`}
                >
                  {entry.severity}
                </span>
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-wide text-muted">{entry.category}</div>
              <div className="mt-1 font-heading text-[15px] font-bold text-text">{entry.title}</div>
              <p className="mt-3 text-[15px] leading-relaxed text-text">{entry.explanation}</p>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 font-mono text-[11px] uppercase text-[#f85149]">❌ Before</div>
                  <pre
                    className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-bg3 p-3.5 font-mono text-[13px] leading-relaxed text-text"
                    dangerouslySetInnerHTML={{ __html: beforeHtml }}
                  />
                </div>
                <div>
                  <div className="mb-2 font-mono text-[11px] uppercase text-green">✅ After</div>
                  <pre
                    className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-bg3 p-3.5 font-mono text-[13px] leading-relaxed text-text"
                    dangerouslySetInnerHTML={{ __html: afterHtml }}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 font-mono text-[11px] uppercase text-muted">{'// suppress this warning'}</div>
                <pre className="rounded-lg border border-border bg-bg3 p-3 font-mono text-[13px] text-text">{disableRaw}</pre>
                <p className="mt-2 text-xs text-muted">Add this comment on the line above the flagged command</p>
              </div>

              <a
                href={`https://www.shellcheck.net/wiki/${entry.code}`}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-block font-mono text-[13px] text-blue hover:underline"
              >
                Read full wiki entry →
              </a>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="flex min-w-[200px] flex-1 items-center justify-between gap-3 rounded-md border border-green bg-green px-4 py-3">
                  <span className="font-heading text-sm font-bold text-bg">⧉ Copy Fixed Code</span>
                  <CopyButton copied={fixCopied} onClick={() => void copyFix(afterRaw)} />
                </div>
                <div className="flex min-w-[200px] flex-1 items-center justify-between gap-3 rounded-md border border-green bg-green px-4 py-3">
                  <span className="font-heading text-sm font-bold text-bg">⧉ Copy Disable Directive</span>
                  <CopyButton copied={disableCopied} onClick={() => void copyDisable(disableRaw)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
