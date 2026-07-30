'use client';

// jq Filter Builder
// Paste a JSON API response (or pick a sample), click through the real structure,
// and this builds the jq filter + the full `curl … | jq` command, with a LIVE
// preview evaluated in-browser against your JSON.
//
// Scope note (kept honest in the UI): this builds the common extraction patterns
// people actually script — field/nested access, array indexing, array iteration
// with select() filters and projection, a // default, and -r raw output. It is not
// a full jq implementation; advanced expressions belong in the jq manual.

import { useMemo, useState } from 'react';

type Seg = { kind: 'key'; key: string } | { kind: 'index'; index: number };
type Op = '==' | '!=' | '>' | '<';

const SAMPLES: { label: string; url: string; json: string }[] = [
  {
    label: 'GitHub repo',
    url: 'https://api.github.com/repos/cli/cli',
    json: JSON.stringify(
      {
        full_name: 'cli/cli',
        stargazers_count: 38210,
        archived: false,
        owner: { login: 'cli', type: 'Organization' },
        license: { spdx_id: 'MIT' },
        topics: ['cli', 'go', 'github'],
      },
      null,
      2,
    ),
  },
  {
    label: 'Array of items',
    url: 'https://api.example.com/v1/jobs',
    json: JSON.stringify(
      {
        count: 3,
        items: [
          { id: 'j-01', name: 'nightly-backup', active: true, priority: 5 },
          { id: 'j-02', name: 'log-rotate', active: false, priority: 2 },
          { id: 'j-03', name: 'cert-renew', active: true, priority: 9 },
        ],
      },
      null,
      2,
    ),
  },
  {
    label: 'Nested object',
    url: 'https://api.example.com/v1/status',
    json: JSON.stringify(
      {
        service: 'checkout',
        healthy: true,
        region: { name: 'us-east-1', primary: true },
        dependencies: [
          { name: 'postgres', ok: true },
          { name: 'redis', ok: false },
        ],
      },
      null,
      2,
    ),
  },
];

function isBareKey(k: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(k);
}

function segToJq(seg: Seg): string {
  if (seg.kind === 'index') return `[${seg.index}]`;
  return isBareKey(seg.key) ? `.${seg.key}` : `[${JSON.stringify(seg.key)}]`;
}

function pathToJq(path: Seg[]): string {
  if (path.length === 0) return '.';
  return path.map(segToJq).join('');
}

function walk(root: unknown, path: Seg[]): unknown {
  let cur: unknown = root;
  for (const seg of path) {
    if (cur == null) return undefined;
    if (seg.kind === 'key') {
      if (typeof cur !== 'object' || Array.isArray(cur)) return undefined;
      cur = (cur as Record<string, unknown>)[seg.key];
    } else {
      if (!Array.isArray(cur)) return undefined;
      cur = cur[seg.index];
    }
  }
  return cur;
}

function typeLabel(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `array[${v.length}]`;
  return typeof v;
}

// Parse a select() value the way jq would read the literal the user typed.
function parseLiteral(raw: string): { display: string; value: unknown } {
  const t = raw.trim();
  if (t === 'true') return { display: 'true', value: true };
  if (t === 'false') return { display: 'false', value: false };
  if (t !== '' && !Number.isNaN(Number(t))) return { display: t, value: Number(t) };
  return { display: JSON.stringify(t), value: t };
}

function compare(a: unknown, op: Op, b: unknown): boolean {
  switch (op) {
    case '==':
      return a === b;
    case '!=':
      return a !== b;
    case '>':
      return typeof a === 'number' && typeof b === 'number' && a > b;
    case '<':
      return typeof a === 'number' && typeof b === 'number' && a < b;
  }
}

function formatOut(v: unknown, raw: boolean): string {
  if (v === undefined) return '';
  if (raw && typeof v === 'string') return v;
  if (v === null) return 'null';
  if (typeof v === 'object') return JSON.stringify(v);
  return JSON.stringify(v);
}

// Flatten a parsed value into indented, selectable rows for the tree view.
type Row = { path: Seg[]; label: string; value: unknown; depth: number };
function buildRows(value: unknown, path: Seg[], depth: number, out: Row[], label: string) {
  out.push({ path, label, value, depth });
  if (Array.isArray(value)) {
    value.forEach((el, i) =>
      buildRows(el, [...path, { kind: 'index', index: i }], depth + 1, out, `[${i}]`),
    );
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      buildRows(v, [...path, { kind: 'key', key: k }], depth + 1, out, k);
    }
  }
}

// Static Tailwind classes for tree indentation (JIT can't see interpolated class names).
const DEPTH_PAD = ['pl-2', 'pl-6', 'pl-10', 'pl-14', 'pl-16', 'pl-16'];
function depthPad(depth: number): string {
  return DEPTH_PAD[Math.min(depth, DEPTH_PAD.length - 1)];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          },
          () => {},
        );
      }}
      className="inline-flex items-center gap-1 rounded-[6px] border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs text-[var(--muted)] transition-colors hover:border-[var(--green)] hover:text-[var(--green)]"
      aria-label="Copy to clipboard"
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}

export default function JqFilterBuilder() {
  const [jsonText, setJsonText] = useState(SAMPLES[0].json);
  const [url, setUrl] = useState(SAMPLES[0].url);
  const [path, setPath] = useState<Seg[]>([{ kind: 'key', key: 'owner' }, { kind: 'key', key: 'login' }]);

  const [raw, setRaw] = useState(true);
  const [useDefault, setUseDefault] = useState(false);
  const [defaultVal, setDefaultVal] = useState('empty');

  const [iterate, setIterate] = useState(false);
  const [useSelect, setUseSelect] = useState(false);
  const [selectKey, setSelectKey] = useState('');
  const [selectOp, setSelectOp] = useState<Op>('==');
  const [selectVal, setSelectVal] = useState('true');
  const [useProject, setUseProject] = useState(false);
  const [projectKey, setProjectKey] = useState('');

  const parsed = useMemo<{ ok: true; value: unknown } | { ok: false; error: string }>(() => {
    try {
      return { ok: true, value: JSON.parse(jsonText) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'invalid JSON' };
    }
  }, [jsonText]);

  const rows = useMemo<Row[]>(() => {
    if (!parsed.ok) return [];
    const out: Row[] = [];
    buildRows(parsed.value, [], 0, out, '(root)');
    return out;
  }, [parsed]);

  const nodeAtPath = parsed.ok ? walk(parsed.value, path) : undefined;
  const nodeIsArray = Array.isArray(nodeAtPath);

  // Keys available on the elements of the selected array (for select/project dropdowns).
  const elementKeys = useMemo<string[]>(() => {
    if (!nodeIsArray) return [];
    const keys = new Set<string>();
    for (const el of nodeAtPath as unknown[]) {
      if (el && typeof el === 'object' && !Array.isArray(el)) {
        Object.keys(el as Record<string, unknown>).forEach((k) => keys.add(k));
      }
    }
    return [...keys];
  }, [nodeIsArray, nodeAtPath]);

  const iterating = nodeIsArray && iterate;

  // ── Build the jq filter string ────────────────────────────────────────────
  const filter = useMemo(() => {
    const base = pathToJq(path);
    if (iterating) {
      let f = `${base}[]`;
      if (useSelect && selectKey) {
        const lit = parseLiteral(selectVal).display;
        f += ` | select(.${selectKey} ${selectOp} ${lit})`;
      }
      if (useProject && projectKey) f += ` | .${projectKey}`;
      return f;
    }
    let f = base;
    if (useDefault) f += ` // ${parseLiteral(defaultVal).display === '"empty"' ? 'empty' : parseLiteral(defaultVal).display}`;
    return f;
  }, [path, iterating, useSelect, selectKey, selectOp, selectVal, useProject, projectKey, useDefault, defaultVal]);

  const command = `curl -s "${url}" | jq ${raw ? '-r ' : ''}'${filter}'`;

  // ── Live preview: evaluate the supported subset against the actual JSON ────
  const preview = useMemo<{ lines: string[]; note?: string }>(() => {
    if (!parsed.ok) return { lines: [], note: 'Fix the JSON above to see a preview.' };
    if (iterating) {
      const arr = nodeAtPath as unknown[];
      const lines: string[] = [];
      for (const el of arr) {
        if (useSelect && selectKey) {
          const left = el && typeof el === 'object' ? (el as Record<string, unknown>)[selectKey] : undefined;
          if (!compare(left, selectOp, parseLiteral(selectVal).value)) continue;
        }
        let out: unknown = el;
        if (useProject && projectKey) {
          out = el && typeof el === 'object' ? (el as Record<string, unknown>)[projectKey] : undefined;
        }
        lines.push(formatOut(out, raw));
      }
      return lines.length ? { lines } : { lines: [], note: 'No elements matched (jq would output nothing).' };
    }
    let v = walk(parsed.value, path);
    if ((v === undefined || v === null) && useDefault) {
      const d = parseLiteral(defaultVal);
      if (d.display === '"empty"') return { lines: [], note: '// empty → no output for the missing value' };
      v = d.value;
    }
    if (v === undefined) return { lines: [], note: 'Path not found (jq would output nothing / an error).' };
    return { lines: [formatOut(v, raw)] };
  }, [parsed, iterating, nodeAtPath, useSelect, selectKey, selectOp, selectVal, useProject, projectKey, path, useDefault, defaultVal, raw]);

  // ── Plain-English breakdown of the built filter ───────────────────────────
  const explain = useMemo<string[]>(() => {
    const parts: string[] = [];
    parts.push(path.length === 0 ? '. → the whole document' : `${pathToJq(path)} → walk to that field`);
    if (iterating) {
      parts.push('[] → emit one output per array element');
      if (useSelect && selectKey) parts.push(`select(.${selectKey} ${selectOp} …) → keep only elements that match`);
      if (useProject && projectKey) parts.push(`| .${projectKey} → output just that field from each`);
    } else if (useDefault) {
      parts.push('// … → fall back to this value when the field is missing or null');
    }
    if (raw) parts.push('-r → raw string output (no surrounding quotes) — use this for shell variables');
    return parts;
  }, [path, iterating, useSelect, selectKey, selectOp, useProject, projectKey, useDefault, raw]);

  const mono = '[font-family:var(--font-mono)]';

  return (
    <div className="flex flex-col gap-6">
      {/* Sample loader */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--muted)]">Load a sample response:</span>
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              setJsonText(s.json);
              setUrl(s.url);
              setPath([]);
              setIterate(false);
              setUseSelect(false);
              setUseProject(false);
              setUseDefault(false);
            }}
            className="rounded-[6px] border border-[var(--border)] bg-[var(--bg2)] px-3 py-1 text-sm transition-colors hover:border-[var(--green)] hover:text-[var(--green)]"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* JSON input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="jq-json" className="text-sm font-semibold text-[var(--text)]">
            JSON response
          </label>
          <textarea
            id="jq-json"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
            rows={16}
            className={`w-full resize-y rounded-[8px] border bg-[var(--bg2)] p-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--green)] ${mono} ${
              parsed.ok ? 'border-[var(--border)]' : 'border-[var(--amber)]'
            }`}
          />
          {!parsed.ok && (
            <p className={`text-xs text-[var(--amber)] ${mono}`}>✗ {parsed.error}</p>
          )}
        </div>

        {/* Tree / path picker */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[var(--text)]">
            Click a field to build the path
          </span>
          <div className="max-h-[22rem] overflow-auto rounded-[8px] border border-[var(--border)] bg-[var(--bg2)] p-2">
            {rows.length === 0 && <p className="p-2 text-sm text-[var(--muted)]">No parseable JSON yet.</p>}
            {rows.map((r, i) => {
              const selected = pathToJq(r.path) === pathToJq(path);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPath(r.path);
                    setIterate(false);
                    setUseSelect(false);
                    setUseProject(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-[6px] py-1 pr-2 text-left text-sm transition-colors hover:bg-[var(--bg3)] ${depthPad(
                    r.depth,
                  )} ${
                    selected ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'text-[var(--text)]'
                  }`}
                >
                  <span className={mono}>{r.label}</span>
                  <span className={`text-xs text-[var(--muted)] ${mono}`}>{typeLabel(r.value)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-4 rounded-[8px] border border-[var(--border)] bg-[var(--bg2)] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={raw} onChange={(e) => setRaw(e.target.checked)} />
            <span>
              Raw output <code className={`text-[var(--green)] ${mono}`}>-r</code>
            </span>
          </label>

          {!nodeIsArray && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={useDefault} onChange={(e) => setUseDefault(e.target.checked)} />
              <span>
                Default <code className={`text-[var(--green)] ${mono}`}>{'//'}</code>
              </span>
              {useDefault && (
                <input
                  value={defaultVal}
                  onChange={(e) => setDefaultVal(e.target.value)}
                  className={`w-28 rounded-[6px] border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs ${mono}`}
                  placeholder="empty / 0"
                />
              )}
            </label>
          )}

          {nodeIsArray && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={iterate} onChange={(e) => setIterate(e.target.checked)} />
              <span>
                Iterate each element <code className={`text-[var(--green)] ${mono}`}>[]</code>
              </span>
            </label>
          )}
        </div>

        {iterating && (
          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-3">
            <label className="flex flex-wrap items-center gap-2 text-sm">
              <input type="checkbox" checked={useSelect} onChange={(e) => setUseSelect(e.target.checked)} />
              <span className={`text-[var(--green)] ${mono}`}>select(</span>
              <select
                value={selectKey}
                onChange={(e) => setSelectKey(e.target.value)}
                className={`rounded-[6px] border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs ${mono}`}
              >
                <option value="">.field</option>
                {elementKeys.map((k) => (
                  <option key={k} value={k}>
                    .{k}
                  </option>
                ))}
              </select>
              <select
                value={selectOp}
                onChange={(e) => setSelectOp(e.target.value as Op)}
                className={`rounded-[6px] border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs ${mono}`}
              >
                <option value="==">==</option>
                <option value="!=">!=</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
              </select>
              <input
                value={selectVal}
                onChange={(e) => setSelectVal(e.target.value)}
                className={`w-24 rounded-[6px] border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs ${mono}`}
                placeholder="true / 5 / text"
              />
              <span className={`text-[var(--green)] ${mono}`}>)</span>
            </label>

            <label className="flex flex-wrap items-center gap-2 text-sm">
              <input type="checkbox" checked={useProject} onChange={(e) => setUseProject(e.target.checked)} />
              <span>
                Output one field <code className={`text-[var(--green)] ${mono}`}>| .field</code>
              </span>
              <select
                value={projectKey}
                onChange={(e) => setProjectKey(e.target.value)}
                className={`rounded-[6px] border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs ${mono}`}
              >
                <option value="">(whole element)</option>
                {elementKeys.map((k) => (
                  <option key={k} value={k}>
                    .{k}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {/* Output: filter + command + preview */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text)]">jq filter</span>
            <CopyButton text={filter} />
          </div>
          <pre className={`overflow-auto rounded-[8px] border border-[var(--border)] bg-[var(--bg)] p-3 text-sm text-[var(--green)] ${mono}`}>
            {filter}
          </pre>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`min-w-0 flex-1 rounded-[6px] border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs text-[var(--muted)] ${mono}`}
              aria-label="API URL for the generated command"
            />
            <CopyButton text={command} />
          </div>
          <pre className={`overflow-auto rounded-[8px] border border-[var(--border)] bg-[var(--bg)] p-3 text-sm text-[var(--text)] ${mono}`}>
            {command}
          </pre>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[var(--text)]">Live preview (evaluated against your JSON)</span>
          <pre className={`min-h-[3rem] overflow-auto rounded-[8px] border border-[var(--border)] bg-[var(--bg)] p-3 text-sm text-[var(--blue)] ${mono}`}>
            {preview.lines.length ? preview.lines.join('\n') : ''}
            {preview.note ? <span className="text-[var(--muted)]">{preview.note}</span> : null}
          </pre>
        </div>

        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg2)] p-4">
          <span className="text-sm font-semibold text-[var(--text)]">What this filter does</span>
          <ul className="mt-2 flex flex-col gap-1">
            {explain.map((e, i) => (
              <li key={i} className={`text-sm text-[var(--muted)] ${mono}`}>
                {e}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[var(--muted)]">
          Builds the common extraction patterns — field and nested access, array indexing, iteration with{' '}
          <code className={mono}>select()</code> and projection, <code className={mono}>{'//'}</code> defaults, and{' '}
          <code className={mono}>-r</code> raw output. For the full language (reduce, string interpolation, math,
          conditionals) see the jq manual.
        </p>
      </div>
    </div>
  );
}
