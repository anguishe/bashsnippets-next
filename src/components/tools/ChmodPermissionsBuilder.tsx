'use client';

import CopyButton from '@/components/CopyButton';
import { useClipboard } from './shared/useClipboard';
import { useCallback, useEffect, useState } from 'react';

type Scope = 'owner' | 'group' | 'others';
type Perm = 'read' | 'write' | 'execute';

const SCOPES: Scope[] = ['owner', 'group', 'others'];
const PERMS: { id: Perm; bit: number; char: string }[] = [
  { id: 'read', bit: 4, char: 'r' },
  { id: 'write', bit: 2, char: 'w' },
  { id: 'execute', bit: 1, char: 'x' },
];

const DEFAULT_PERMS: Record<string, boolean> = {
  'owner-read': true,
  'owner-write': true,
  'owner-execute': true,
  'group-read': true,
  'group-write': false,
  'group-execute': false,
  'others-read': false,
  'others-write': false,
  'others-execute': false,
};

function permKey(scope: Scope, perm: Perm): string {
  return `${scope}-${perm}`;
}

interface SpecialBits {
  setuid: boolean;
  setgid: boolean;
  sticky: boolean;
}

const SPECIAL_BITS: { key: keyof SpecialBits; label: string; tip: string }[] = [
  { key: 'setuid', label: 'setuid (4)', tip: 'Executable runs with the file owner’s privileges' },
  { key: 'setgid', label: 'setgid (2)', tip: 'Runs as the group; on directories, new files inherit the group' },
  { key: 'sticky', label: 'sticky (1)', tip: 'Only the owner can delete files in the directory (e.g. /tmp)' },
];

const PRESETS: { label: string; octal: string }[] = [
  { label: 'SSH key', octal: '600' },
  { label: 'Web dir', octal: '755' },
  { label: 'Script', octal: '744' },
  { label: 'Std file', octal: '644' },
];

function parseOctal(input: string): { perms: Record<string, boolean>; special: SpecialBits } | null {
  const t = input.trim();
  if (!/^[0-7]{3,4}$/.test(t)) return null;
  const digits = (t.length === 4 ? t : `0${t}`).split('').map(Number);
  const [sp, ow, gr, ot] = digits;
  const special: SpecialBits = { setuid: !!(sp & 4), setgid: !!(sp & 2), sticky: !!(sp & 1) };
  const newPerms: Record<string, boolean> = {};
  const scopeDigits: [Scope, number][] = [['owner', ow], ['group', gr], ['others', ot]];
  for (const [scope, d] of scopeDigits) {
    for (const p of PERMS) newPerms[permKey(scope, p.id)] = !!(d & p.bit);
  }
  return { perms: newPerms, special };
}

function applySpecialToSymbolic(sym: string, sp: SpecialBits): string {
  const c = sym.split('');
  if (sp.setuid) c[2] = c[2] === 'x' ? 's' : 'S';
  if (sp.setgid) c[5] = c[5] === 'x' ? 's' : 'S';
  if (sp.sticky) c[8] = c[8] === 'x' ? 't' : 'T';
  return c.join('');
}

export default function ChmodPermissionsBuilder() {
  const [perms, setPerms] = useState<Record<string, boolean>>(DEFAULT_PERMS);
  const [special, setSpecial] = useState<SpecialBits>({ setuid: false, setgid: false, sticky: false });
  const [octalDraft, setOctalDraft] = useState('');
  const [octalPulse, setOctalPulse] = useState(false);
  const { copied, copy } = useClipboard();

  const bitForScope = useCallback(
    (scope: Scope) =>
      PERMS.reduce((sum, p) => sum + (perms[permKey(scope, p.id)] ? p.bit : 0), 0),
    [perms],
  );

  const symbolicForScope = useCallback(
    (scope: Scope) =>
      PERMS.map((p) => (perms[permKey(scope, p.id)] ? p.char : '-')).join(''),
    [perms],
  );

  const specialDigit = (special.setuid ? 4 : 0) + (special.setgid ? 2 : 0) + (special.sticky ? 1 : 0);
  const octal3 = SCOPES.map(bitForScope).join('');
  const octal = specialDigit > 0 ? `${specialDigit}${octal3}` : octal3;
  const symbolic = applySpecialToSymbolic(SCOPES.map(symbolicForScope).join(''), special);
  const command = `chmod ${octal} filename`;

  const applyOctal = useCallback((value: string) => {
    setOctalDraft(value);
    const parsed = parseOctal(value);
    if (parsed) {
      setPerms(parsed.perms);
      setSpecial(parsed.special);
    }
  }, []);

  const toggleSpecial = useCallback((key: keyof SpecialBits) => {
    setSpecial((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const togglePerm = useCallback((scope: Scope, perm: Perm) => {
    const key = permKey(scope, perm);
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetPermissions = useCallback(() => {
    setPerms(
      SCOPES.reduce(
        (acc, scope) => {
          PERMS.forEach((p) => {
            acc[permKey(scope, p.id)] = false;
          });
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    );
    setSpecial({ setuid: false, setgid: false, sticky: false });
  }, []);

  const handleCopy = useCallback(() => {
    void copy(command);
  }, [copy, command]);

  useEffect(() => {
    setOctalPulse(true);
    setOctalDraft(octal);
    const t = setTimeout(() => setOctalPulse(false), 380);
    return () => clearTimeout(t);
  }, [octal]);

  return (
    <div className="rounded-lg border border-border bg-bg">
      <div id="permission-grid" className="mx-auto max-w-[900px] px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-bg2 px-4 py-3">
          <label htmlFor="octal-input" className="font-mono text-xs font-semibold uppercase tracking-wide text-muted">
            Load octal
          </label>
          <input
            id="octal-input"
            type="text"
            inputMode="numeric"
            value={octalDraft}
            maxLength={4}
            onChange={(e) => applyOctal(e.target.value)}
            placeholder="755"
            className="w-24 rounded-md border border-border bg-bg3 px-3 py-2 font-mono text-sm text-text transition-colors hover:border-green focus:border-green focus:outline-none"
          />
          {octalDraft && !parseOctal(octalDraft) ? (
            <span className="font-mono text-xs text-amber">3–4 octal digits (0–7)</span>
          ) : null}
          <div className="ml-auto flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.octal}
                type="button"
                onClick={() => applyOctal(p.octal)}
                className="rounded border border-border bg-bg2 px-3 py-1.5 font-mono text-xs text-text transition-colors hover:border-green"
              >
                {p.label} <span className="text-muted">{p.octal}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-[140px_1fr_1fr_1fr] gap-4 max-sm:grid-cols-[100px_1fr_1fr_1fr] max-sm:gap-2">
          <div aria-hidden="true" />
          <div className="text-center font-mono text-xs font-bold uppercase tracking-wide text-green">Owner</div>
          <div className="text-center font-mono text-xs font-bold uppercase tracking-wide text-blue">Group</div>
          <div className="text-center font-mono text-xs font-bold uppercase tracking-wide text-amber">Others</div>
        </div>

        {PERMS.map((p) => (
          <div key={p.id} className="mb-3 grid grid-cols-[140px_1fr_1fr_1fr] gap-4 max-sm:grid-cols-[100px_1fr_1fr_1fr] max-sm:gap-2">
            <div className="self-center font-mono text-[15px] font-semibold capitalize text-muted">
              {p.id === 'read' ? 'Read (r)' : p.id === 'write' ? 'Write (w)' : 'Execute (x)'}
            </div>
            {SCOPES.map((scope) => (
              <label
                key={permKey(scope, p.id)}
                className="flex h-14 cursor-pointer items-center justify-center rounded-lg border-2 border-border bg-bg2 transition-colors hover:border-green has-[:checked]:border-green max-sm:h-12"
              >
                <input
                  type="checkbox"
                  checked={!!perms[permKey(scope, p.id)]}
                  onChange={() => togglePerm(scope, p.id)}
                  aria-label={`${scope} ${p.id}`}
                  className="h-6 w-6 cursor-pointer accent-green"
                />
              </label>
            ))}
          </div>
        ))}

        <div className="mt-6 border-t border-border pt-6">
          <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-muted">Special bits</div>
          <div className="grid grid-cols-3 gap-4 max-sm:gap-2">
            {SPECIAL_BITS.map((b) => (
              <label
                key={b.key}
                title={b.tip}
                className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-border bg-bg2 px-2 transition-colors hover:border-green has-[:checked]:border-green max-sm:h-12"
              >
                <input
                  type="checkbox"
                  checked={special[b.key]}
                  onChange={() => toggleSpecial(b.key)}
                  aria-label={b.key}
                  className="h-5 w-5 cursor-pointer accent-green"
                />
                <span className="font-mono text-xs text-text max-sm:text-[11px]">{b.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div id="output-panel" className="mx-auto max-w-[900px] px-6 pb-10">
        <div className="mb-6 rounded-lg border-2 border-border bg-bg2 px-8 py-8 text-center max-sm:px-6 max-sm:py-6">
          <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-muted">Octal Notation</div>
          <div
            className={`inline-block font-mono text-[72px] font-extrabold tracking-[8px] text-green max-sm:text-[52px] max-sm:tracking-[6px] ${octalPulse ? 'scale-105 transition-transform' : ''}`}
            aria-live="polite"
          >
            {octal}
          </div>
        </div>

        <div className="mb-6 rounded-lg border-2 border-border bg-bg2 px-6 py-6 text-center">
          <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-muted">Symbolic Notation</div>
          <div className="font-mono text-4xl font-bold text-text max-sm:text-2xl" aria-live="polite">
            {symbolic}
          </div>
        </div>

        <div className="rounded-lg border-2 border-green bg-bg3 p-6 text-left">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wide text-green">Generated Command</span>
            <CopyButton copied={copied} onClick={handleCopy} />
          </div>
          <div className="mb-4 break-all font-mono text-xl font-semibold text-text max-sm:text-[15px]">{command}</div>
          <div className="flex flex-wrap gap-3 max-sm:flex-col">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border-none bg-green px-8 py-3 font-heading text-sm font-bold tracking-wide text-bg hover:bg-green-dim max-sm:w-full"
            >
              {copied ? '✓ Copied' : 'Copy Command'}
            </button>
            <button
              type="button"
              onClick={resetPermissions}
              className="rounded-md border-2 border-border bg-bg2 px-6 py-2.5 font-heading text-[13px] font-semibold tracking-wide text-text hover:border-green max-sm:mt-0 max-sm:w-full"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 pb-10" aria-live="polite">
        {octal === '777' && (
          <div role="alert" className="mb-4 rounded-lg border-2 border-[#FF4444] bg-[#4a1a1a] p-5">
            <div className="mb-2 font-heading text-base font-bold text-[#FF4444]">SECURITY RISK: 777 Permissions</div>
            <p className="font-mono text-sm leading-relaxed text-text">
              chmod 777 gives EVERYONE full read/write/execute access. Never use this on production servers or sensitive files.
            </p>
          </div>
        )}
        {octal === '666' && (
          <div role="alert" className="mb-4 rounded-lg border-2 border-amber bg-[#4a2e1a] p-5">
            <div className="mb-2 font-heading text-base font-bold text-amber">WARNING: 666 Permissions</div>
            <p className="font-mono text-sm leading-relaxed text-text">
              chmod 666 gives everyone read/write access (no execute). Avoid this on config files or sensitive data.
            </p>
          </div>
        )}
        {octal === '644' && (
          <div className="rounded-lg border-2 border-green bg-bg2 p-5">
            <div className="mb-2 font-heading text-base font-bold text-green">SAFE: Standard File Permissions</div>
            <p className="font-mono text-sm leading-relaxed text-text">
              chmod 644 is the standard permission for regular files. Owner can read/write, everyone else can only read.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
