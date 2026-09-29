'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CopyButton from '@/components/CopyButton';
import { track } from '@/lib/track';
import { useClipboard } from './shared/useClipboard';
import { highlightBash } from './shared/bashHighlight';
import { EXAMPLE_LISTING } from './shared/openPortsExample';
import {
  FORMAT_LABEL,
  MAX_BYTES,
  MAX_LINES,
  SCOPE_LABEL,
  baselineCsv,
  buildCards,
  decodeShare,
  displayAddress,
  encodeShare,
  isFlagged,
  isNetwork,
  parseListing,
  type Card,
  type ParseResult,
  type Scope,
  type Severity,
} from './shared/portData';

type Filter = 'all' | 'network' | 'flagged' | 'loopback';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'network', label: 'Network-reachable' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'loopback', label: 'Loopback' },
];

const SCOPE_COLOR: Record<Scope, string> = {
  loopback: 'text-muted',
  multicast: 'text-muted',
  wildcard4: 'text-amber',
  wildcard6: 'text-amber',
  wildcardAll: 'text-amber',
  wildcard6Unknown: 'text-amber',
  public: 'text-amber',
  named: 'text-amber',
  linklocal: 'text-blue',
  private: 'text-blue',
};

const SEV_COLOR: Record<Severity, string> = {
  critical: 'text-amber',
  warn: 'text-amber',
  info: 'text-blue',
  ok: 'text-green',
  note: 'text-muted',
};

const EMPTY_RESULT: ParseResult = {
  format: 'empty',
  nonRoot: false,
  noProcessColumn: false,
  portsByName: false,
  truncatedNames: false,
  netstatV6: false,
  hostnames: false,
  dataRows: 0,
  sockets: [],
  connections: [],
  unparsed: [],
  ignored: 0,
};

function CommandBlock({ command }: { command: string }) {
  const { copied, copy } = useClipboard();
  return (
    <div className="mt-3 overflow-hidden rounded-[8px] border border-border bg-bg3">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">bash</span>
        <CopyButton copied={copied} onClick={() => void copy(command)} />
      </div>
      <pre className="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed text-text">
        <code dangerouslySetInnerHTML={{ __html: highlightBash(command) }} />
      </pre>
    </div>
  );
}

function PortCard({ card, redact }: { card: Card; redact: boolean }) {
  const headingId = `port-card-${card.id}`;
  const critical = card.severity === 'critical';
  const families = [...new Set(card.sockets.map((s) => (s.family === 'any' ? 'IPv4+IPv6' : s.family === 'ipv6' ? 'IPv6' : 'IPv4')))];
  const fds = card.sockets.reduce((n, s) => n + s.fds, 0);
  return (
    <article
      aria-labelledby={headingId}
      className={`group relative rounded-[8px] border border-border bg-bg2 p-4 transition-colors duration-150 hover:border-green ${
        critical ? 'border-l-4 border-l-amber' : ''
      }`}
    >
      <div className="font-mono text-xs uppercase tracking-widest text-muted">
        {card.proto} · {families.join('+')} · {card.sockets.length} socket{card.sockets.length === 1 ? '' : 's'}
        {fds > card.sockets.length ? ` · ${fds} fds` : ''}
      </div>
      <h3 id={headingId} className="mt-1 break-all font-heading text-lg font-bold text-text">
        {card.sockets.map((s) => displayAddress(s, redact)).join('  +  ')}
      </h3>
      <p className="mt-1 font-mono text-xs">
        <span className={SCOPE_COLOR[card.scope]}>{SCOPE_LABEL[card.scope]}</span>
        <span className="text-muted"> · </span>
        <span className="text-text">{card.owner ?? 'owner not shown'}</span>
      </p>
      {card.info && (
        <p className="mt-2 text-sm text-text">
          <span className="font-semibold">{card.info.name}.</span> {card.info.what}
          {card.info.bindAdvice && isNetwork(card) ? <span className="text-muted"> {card.info.bindAdvice}</span> : null}
        </p>
      )}
      {card.flags.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {card.flags.map((f) => (
            <li key={f.id} className="text-sm leading-relaxed text-text">
              <span className={`mr-2 font-mono text-[11px] font-semibold uppercase tracking-widest ${SEV_COLOR[f.severity]}`}>
                {f.severity}
              </span>
              {f.text}
              {f.link && (
                <>
                  {' '}
                  <Link href={f.link.href} className="text-blue transition-colors duration-150 hover:text-green">
                    {f.link.label}
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <CommandBlock command={card.command} />
    </article>
  );
}

export default function OpenPortsExplainer() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ParseResult>(EMPTY_RESULT);
  const [tooBig, setTooBig] = useState(false);
  const [redact, setRedact] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [fromShare, setFromShare] = useState(false);
  const [shareError, setShareError] = useState('');
  const promptClip = useClipboard();
  const baselineClip = useClipboard();
  const shareClip = useClipboard();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse on input, debounced. Nothing leaves the browser.
  useEffect(() => {
    if (fromShare) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const lines = input.split('\n').length;
      const big = lines > MAX_LINES || new Blob([input]).size > MAX_BYTES;
      setTooBig(big);
      setResult(big ? EMPTY_RESULT : parseListing(input));
    }, 150);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [input, fromShare]);

  // A share link carries redacted rows in the hash; the server never sees it.
  useEffect(() => {
    const onHash = () => {
      const payload = decodeShare(window.location.hash);
      if (!payload) return;
      setFromShare(true);
      setResult({ ...EMPTY_RESULT, format: payload.f, nonRoot: payload.n, noProcessColumn: payload.p, sockets: payload.s });
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (e.key === 'Escape') {
        setFilter('all');
        return;
      }
      if (e.key !== '/' || tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      document.getElementById('ports-input')?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const cards = useMemo(() => buildCards(result.sockets), [result]);
  const shown = useMemo(() => {
    if (filter === 'network') return cards.filter(isNetwork);
    if (filter === 'flagged') return cards.filter(isFlagged);
    if (filter === 'loopback') return cards.filter((c) => c.scope === 'loopback');
    return cards;
  }, [cards, filter]);
  const networkCount = cards.filter(isNetwork).length;
  const flaggedCount = cards.filter(isFlagged).length;
  const socketCount = result.sockets.length;

  const clearAll = useCallback(() => {
    setInput('');
    setResult(EMPTY_RESULT);
    setFilter('all');
    if (fromShare) {
      setFromShare(false);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [fromShare]);

  const loadExample = useCallback(() => {
    setFromShare(false);
    setInput(EXAMPLE_LISTING);
    track('tool_example_loaded');
  }, []);

  const copyShare = useCallback(async () => {
    const hash = encodeShare(result, redact);
    if (!hash) {
      setShareError('Too many rows for a share link. Paste only the listeners: ss -ltnp.');
      return;
    }
    setShareError('');
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    if (await shareClip.copy(url)) track('tool_share_copied');
  }, [result, redact, shareClip]);

  const detected = (() => {
    if (result.format === 'empty') return '';
    const parts = [FORMAT_LABEL[result.format]];
    if (result.nonRoot) parts.push('not root');
    if (result.noProcessColumn) parts.push('no process column');
    return `Detected: ${parts.join(', ')}`;
  })();

  const hasResults = socketCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 font-mono text-sm text-muted">
        <div className="flex items-center gap-2">
          <span className="text-green">$</span>
          <span className="text-text">ss -tulpn</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-green" aria-hidden="true" />
        </div>
        <CopyButton copied={promptClip.copied} onClick={() => void promptClip.copy('ss -tulpn')} />
      </div>

      <div className="rounded-[8px] border border-border bg-bg2 p-4">
        <label htmlFor="ports-input" className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-green">
          Paste ss, netstat or lsof output
        </label>
        <textarea
          id="ports-input"
          value={fromShare ? '' : input}
          onChange={(e) => {
            setFromShare(false);
            setInput(e.target.value);
          }}
          placeholder="$ ss -tulpn"
          spellCheck={false}
          wrap="off"
          className="min-h-[12rem] w-full resize-y overflow-x-auto whitespace-pre rounded-[8px] border border-border bg-bg3 p-3 font-mono text-xs leading-relaxed text-text outline-none transition-colors duration-150 focus:border-green"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadExample}
            className="rounded-[6px] border border-border bg-bg3 px-3 py-1.5 font-mono text-xs text-text transition-colors duration-150 hover:border-green"
          >
            Load example
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-[6px] border border-border bg-bg3 px-3 py-1.5 font-mono text-xs text-text transition-colors duration-150 hover:border-green"
          >
            Clear
          </button>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-text">
            <input
              type="checkbox"
              checked={redact}
              onChange={(e) => setRedact(e.target.checked)}
              className="accent-[var(--green)]"
            />
            Redact addresses
          </label>
          {detected && <span className="font-mono text-xs uppercase tracking-widest text-muted">{detected}</span>}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Parsed in your browser. Nothing is sent anywhere, and this tool never connects to a port. It shows who could
          reach each socket; your firewall, NAT and cloud security groups are invisible to it.
        </p>
      </div>

      {tooBig && (
        <p className="rounded-[8px] border border-amber bg-bg2 p-3 font-mono text-xs text-amber">
          That paste is over {MAX_LINES} lines or 400 KB. Paste the listeners only: ss -tulpn or ss -ltnp.
        </p>
      )}
      {result.format === 'windows' && (
        <p className="rounded-[8px] border border-amber bg-bg2 p-3 font-mono text-xs text-amber">
          This looks like Windows netstat -ano. Windows output is not supported yet; the tool reads Linux ss, netstat
          and lsof.
        </p>
      )}
      {result.format === 'unknown' && (
        <div className="rounded-[8px] border border-amber bg-bg2 p-3 font-mono text-xs text-amber">
          Could not recognise this output. Paste ss -tulpn (Linux), header line included.
        </div>
      )}

      {fromShare && (
        <p className="rounded-[8px] border border-blue bg-bg2 p-3 font-mono text-xs text-blue">
          Loaded from a shared link: the rows below were normalised (and redacted if the sender left redaction on)
          before they were put in the link.{' '}
          <button type="button" onClick={clearAll} className="underline transition-colors duration-150 hover:text-green">
            Clear
          </button>
        </p>
      )}

      {hasResults && (
        <>
          <div
            aria-live="polite"
            className="sticky top-16 z-10 -mx-1 border-b border-border bg-bg/90 px-1 py-2 font-mono text-xs text-muted backdrop-blur-sm"
          >
            <span className="text-text">{cards.length}</span> listeners ({socketCount} sockets) ·{' '}
            <span className="text-text">{networkCount}</span> reachable from the network ·{' '}
            <span className={`transition-colors duration-150 ${flaggedCount > 0 ? 'text-amber' : 'text-green'}`}>
              {flaggedCount} flagged
            </span>
            {result.ignored > 0 && <> · {result.ignored} ignored rows</>}
          </div>

          {(result.nonRoot || result.noProcessColumn) && (
            <div className="rounded-[8px] border border-border border-l-4 border-l-blue bg-bg2 p-3 text-sm leading-relaxed text-text">
              {result.noProcessColumn
                ? 'You ran it without -p, so no row names its owner. Add -p (and sudo), or run ss -ltnpe: without root it still names the systemd unit that owns each socket.'
                : 'Not run as root: rows with no owner belong to other users. sudo ss -tulpn shows every process; ss -ltnpe names the systemd unit without root.'}{' '}
              <Link href="/guides/open-ports-linux#without-root" className="text-blue transition-colors duration-150 hover:text-green">
                Owners without root
              </Link>
            </div>
          )}
          {(result.portsByName || result.truncatedNames || result.netstatV6 || result.hostnames) && (
            <ul className="space-y-1 font-mono text-xs text-muted">
              {result.portsByName && <li>You ran it without -n; ports shown by name were mapped back to numbers.</li>}
              {result.truncatedNames && (
                <li>Process names are cut short by the tool that printed them (15 characters in ss, 9 in lsof).</li>
              )}
              {result.netstatV6 && <li>netstat does not show v6only; ss -ltne does.</li>}
              {result.hostnames && <li>lsof printed host names; re-run it with -nP to see addresses.</li>}
            </ul>
          )}

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter listeners">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors duration-150 ${
                  filter === f.id ? 'border-green text-green' : 'border-border text-muted hover:border-green hover:text-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {shown.map((c) => (
              <PortCard key={c.id} card={c} redact={redact} />
            ))}
            {shown.length === 0 && <p className="font-mono text-xs text-muted">No listeners match this filter.</p>}
          </div>

          <div className="rounded-[8px] border border-border bg-bg2 p-4">
            <h3 className="font-heading text-lg font-bold text-text">Turn this into a nightly diff</h3>
            <p className="mt-2 text-sm leading-relaxed text-text">
              Copy this listing as a baseline in the same proto,address,port,service,owner shape that{' '}
              <Link href="/snippets/ports-audit" className="text-blue transition-colors duration-150 hover:text-green">
                ports-audit.sh
              </Link>{' '}
              writes, then schedule the script so a new listener alerts you. Wrap it with the{' '}
              <Link href="/tools/cron-wrapper-generator" className="text-blue transition-colors duration-150 hover:text-green">
                cron wrapper generator
              </Link>
              . The{' '}
              <Link href="/starter-kit" className="text-blue transition-colors duration-150 hover:text-green">
                Production Bash Toolkit
              </Link>
              &apos;s cron-wrapper.sh adds the lock, timeout and one-alert-per-change logging for the nightly run.
            </p>
            <p className="mt-2 font-mono text-xs text-muted">
              Service names here come from this tool&apos;s port table, so that column can differ from getent services.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => void baselineClip.copy(baselineCsv(result.sockets))}
                className="rounded-[6px] border border-border bg-bg3 px-3 py-1.5 font-mono text-xs text-text transition-colors duration-150 hover:border-green"
              >
                {baselineClip.copied ? '✓ Baseline copied' : 'Copy baseline CSV'}
              </button>
              <button
                type="button"
                onClick={() => void copyShare()}
                className="rounded-[6px] border border-border bg-bg3 px-3 py-1.5 font-mono text-xs text-text transition-colors duration-150 hover:border-green"
              >
                {shareClip.copied ? '✓ Link copied' : `Copy share link${redact ? ' (redacted)' : ''}`}
              </button>
              {shareError && <span className="font-mono text-xs text-amber">{shareError}</span>}
            </div>
          </div>

          {result.unparsed.length > 0 && (
            <details className="rounded-[8px] border border-border bg-bg2 p-3">
              <summary className="cursor-pointer font-mono text-xs text-amber transition-colors duration-150 hover:text-text">
                {result.unparsed.length} line{result.unparsed.length === 1 ? '' : 's'} could not be read
              </summary>
              <ul className="mt-2 space-y-1 font-mono text-xs text-muted">
                {result.unparsed.map((u) => (
                  <li key={u.line} className="break-all">
                    line {u.line}: {u.text}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {result.connections.length > 0 && (
            <details className="rounded-[8px] border border-border bg-bg2 p-3">
              <summary className="cursor-pointer font-mono text-xs text-muted transition-colors duration-150 hover:text-text">
                {result.connections.length} connection{result.connections.length === 1 ? '' : 's'} (not listeners)
              </summary>
              <ul className="mt-2 space-y-1 font-mono text-xs text-muted">
                {result.connections.map((c, i) => (
                  <li key={i} className="break-all">
                    {redact ? c.replace(/\[?[0-9a-f]*:[0-9a-f:]+\]?|\b\d{1,3}(\.\d{1,3}){3}\b/gi, (m) => (/^(127\.|\[?::1\]?$)/.test(m) ? m : '(redacted)')) : c}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
