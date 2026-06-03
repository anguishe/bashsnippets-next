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

export default function ChmodPermissionsBuilder() {
  const [perms, setPerms] = useState<Record<string, boolean>>(DEFAULT_PERMS);
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

  const octal = SCOPES.map(bitForScope).join('');
  const symbolic = SCOPES.map(symbolicForScope).join('');
  const command = `chmod ${octal} filename`;

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
  }, []);

  const handleCopy = useCallback(() => {
    void copy(command);
  }, [copy, command]);

  useEffect(() => {
    setOctalPulse(true);
    const t = setTimeout(() => setOctalPulse(false), 380);
    return () => clearTimeout(t);
  }, [octal]);

  return (
    <div className="rounded-lg border border-border bg-bg">
      <div id="permission-grid" className="mx-auto max-w-[900px] px-6 py-10">
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
              Reset to 755
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
