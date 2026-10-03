// The jq subset the jq Filter Builder can build, parse back and evaluate in the browser:
// a path (.a.b[0], .["odd key"]), optional [] iteration, optional | select(.k OP literal),
// optional | .k projection, or a // default on a plain path. Anything else is real jq's job.
// Pure functions: scripts/check-jq-subset.mjs compares evaluate() with the jq binary.

export type Seg = { kind: 'key'; key: string } | { kind: 'index'; index: number };
export type Op = '==' | '!=' | '>' | '<';

export interface JqState {
  path: Seg[];
  iterate: boolean;
  select: { key: string; op: Op; value: string } | null;
  project: string | null;
  defaultVal: string | null;
}

export function isBareKey(k: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(k);
}

function segToJq(seg: Seg): string {
  if (seg.kind === 'index') return `[${seg.index}]`;
  return isBareKey(seg.key) ? `.${seg.key}` : `[${JSON.stringify(seg.key)}]`;
}

export function pathToJq(path: Seg[]): string {
  if (path.length === 0) return '.';
  const p = path.map(segToJq).join('');
  // A leading [..] without a dot is an array literal in jq, not a lookup: ["k"] prints ["k"].
  return p.startsWith('[') ? `.${p}` : p;
}

export function walk(root: unknown, path: Seg[]): unknown {
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

// Parse a select() value the way jq would read the literal the user typed.
export function parseLiteral(raw: string): { display: string; value: unknown } {
  const t = raw.trim();
  if (t === 'true') return { display: 'true', value: true };
  if (t === 'false') return { display: 'false', value: false };
  if (t === 'null') return { display: 'null', value: null };
  if (t !== '' && !Number.isNaN(Number(t))) return { display: t, value: Number(t) };
  // A typed "quoted string" is already jq syntax; keep its contents, not the quotes.
  if (/^"(?:[^"\\]|\\.)*"$/.test(t)) return { display: t, value: JSON.parse(t) };
  return { display: JSON.stringify(t), value: t };
}

export function compare(a: unknown, op: Op, b: unknown): boolean {
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

export function formatOut(v: unknown, raw: boolean): string {
  if (v === undefined) return '';
  if (raw && typeof v === 'string') return v;
  return JSON.stringify(v);
}

/** The filter text for a builder state: the one place the jq syntax is written. */
export function buildFilter(s: JqState): string {
  const base = pathToJq(s.path);
  if (s.iterate) {
    let f = `${base}[]`;
    if (s.select) f += ` | select(.${s.select.key} ${s.select.op} ${parseLiteral(s.select.value).display})`;
    if (s.project) f += ` | .${s.project}`;
    return f;
  }
  if (s.defaultVal !== null) {
    const d = parseLiteral(s.defaultVal).display;
    return `${base} // ${d === '"empty"' ? 'empty' : d}`;
  }
  return base;
}

/** What jq would print for this state, or a note when it would print nothing. */
export function evaluate(root: unknown, s: JqState, raw: boolean): { lines: string[]; note?: string } {
  const node = walk(root, s.path);
  if (s.iterate) {
    if (!Array.isArray(node)) return { lines: [], note: 'Not an array here, so [] has nothing to iterate (jq would error).' };
    const lines: string[] = [];
    for (const el of node) {
      const obj = el && typeof el === 'object' && !Array.isArray(el) ? (el as Record<string, unknown>) : undefined;
      if (s.select && !compare(obj?.[s.select.key] ?? null, s.select.op, parseLiteral(s.select.value).value)) continue;
      const out = s.project ? (obj?.[s.project] ?? null) : el;
      lines.push(formatOut(out, raw));
    }
    return lines.length ? { lines } : { lines: [], note: 'No elements matched (jq would output nothing).' };
  }
  let v = node;
  if ((v === undefined || v === null) && s.defaultVal !== null) {
    const d = parseLiteral(s.defaultVal);
    if (d.display === '"empty"') return { lines: [], note: '// empty → no output for the missing value' };
    v = d.value;
  }
  if (v === undefined) return { lines: [], note: 'Path not found (jq prints null for a missing key, or errors on a type mismatch).' };
  return { lines: [formatOut(v, raw)] };
}

const KEY = String.raw`[A-Za-z_][A-Za-z0-9_]*`;
const SEG = new RegExp(String.raw`^(?:\.(${KEY})|\.?\[(\d+)\]|\.?\[("(?:[^"\\]|\\.)*")\]|\.("(?:[^"\\]|\\.)*"))`);

/** A typed filter → builder state, or null when it is outside the subset this tool evaluates. */
export function parseFilter(text: string): JqState | null {
  let rest = text.trim();
  const state: JqState = { path: [], iterate: false, select: null, project: null, defaultVal: null };
  if (rest === '.') return state;
  if (!rest.startsWith('.')) return null;

  // Path segments: .key  [0]  ["key"]  ."key"
  while (rest && !rest.startsWith('[]') && !/^\s*(\||\/\/)/.test(rest)) {
    const m = rest.match(SEG);
    if (!m) return null;
    if (m[1] !== undefined) state.path.push({ kind: 'key', key: m[1] });
    else if (m[2] !== undefined) state.path.push({ kind: 'index', index: Number(m[2]) });
    else state.path.push({ kind: 'key', key: JSON.parse(m[3] ?? m[4]) });
    rest = rest.slice(m[0].length);
  }
  if (rest.startsWith('.[]')) rest = rest.slice(1); // `.[]` on the root
  if (rest.startsWith('[]')) {
    state.iterate = true;
    rest = rest.slice(2);
    const sel = rest.match(new RegExp(String.raw`^\s*\|\s*select\(\s*\.(${KEY})\s*(==|!=|>|<)\s*(true|false|null|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*")\s*\)`));
    if (sel) {
      state.select = { key: sel[1], op: sel[2] as Op, value: sel[3].startsWith('"') ? JSON.parse(sel[3]) : sel[3] };
      rest = rest.slice(sel[0].length);
    }
    const proj = rest.match(new RegExp(String.raw`^\s*\|\s*\.(${KEY})`));
    if (proj) {
      state.project = proj[1];
      rest = rest.slice(proj[0].length);
    }
  } else {
    const def = rest.match(/^\s*\/\/\s*(empty|true|false|null|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*")/);
    if (def) {
      state.defaultVal = def[1] === 'empty' ? 'empty' : def[1].startsWith('"') ? JSON.parse(def[1]) : def[1];
      rest = rest.slice(def[0].length);
    }
  }
  return rest.trim() === '' ? state : null;
}
