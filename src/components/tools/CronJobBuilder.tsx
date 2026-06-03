'use client';

import { highlightCrontab } from './shared/bashHighlight';
import { useClipboard } from './shared/useClipboard';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LOCK_PATH = '/var/lock/cronjob.lock';
const LOG_PATH = '/var/log/cronjob.log';

const PRESETS = [
  { label: 'Daily 2am', expr: '0 2 * * *' },
  { label: 'Every 6 hours', expr: '0 */6 * * *' },
  { label: 'Weekdays 9am', expr: '0 9 * * 1-5' },
  { label: 'Monthly (1st)', expr: '0 0 1 * *' },
  { label: 'Every 15 min', expr: '*/15 * * * *' },
];

const SNIPPET_PILLS = [
  { label: 'File Backup', command: '/home/user/backup.sh', href: '/snippets/automated-file-backup' },
  { label: 'Disk Space Warning', command: '/home/user/disk-space-warning.sh', href: '/snippets/disk-space-warning' },
  { label: 'Delete Old Logs', command: '/home/user/delete-old-logs.sh', href: '/snippets/delete-old-log-files' },
];

function pad2(n: number): string {
  return (n < 10 ? '0' : '') + n;
}

function parseField(field: string, min: number, max: number): Set<number> | null {
  if (field === '*') return null;
  const values = new Set<number>();
  const parts = field.split(',');
  for (const part of parts) {
    let step = 1;
    let range = part;
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    if (stepMatch) {
      range = stepMatch[1];
      step = parseInt(stepMatch[2], 10);
      if (!step || step < 1) throw new Error('bad step');
    }
    let start: number;
    let end: number;
    if (range === '*') {
      start = min;
      end = max;
    } else if (range.indexOf('-') >= 0) {
      const bits = range.split('-');
      start = parseInt(bits[0], 10);
      end = parseInt(bits[1], 10);
    } else {
      start = end = parseInt(range, 10);
    }
    if (Number.isNaN(start) || Number.isNaN(end) || start < min || end > max || start > end) {
      throw new Error('bad range');
    }
    for (let v = start; v <= end; v += step) values.add(v);
  }
  return values;
}

function matchesSet(set: Set<number> | null, value: number): boolean {
  return set === null || set.has(value);
}

function dayMatches(date: Date, domSet: Set<number> | null, dowSet: Set<number> | null): boolean {
  const dom = date.getDate();
  const dow = date.getDay();
  if (domSet === null && dowSet === null) return true;
  if (domSet !== null && dowSet !== null) return domSet.has(dom) || dowSet.has(dow);
  if (domSet !== null) return domSet.has(dom);
  return dowSet!.has(dow);
}

function formatRun(d: Date): string {
  return `${DOW_NAMES[d.getDay()]} ${MONTH_NAMES[d.getMonth()]} ${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:00 ${d.getFullYear()}`;
}

function nextRunTimes(
  minuteField: string,
  hourField: string,
  domField: string,
  monthField: string,
  dowField: string,
  count: number,
): Date[] | null {
  let minSet: Set<number> | null;
  let hourSet: Set<number> | null;
  let domSet: Set<number> | null;
  let monthSet: Set<number> | null;
  let dowSet: Set<number> | null;
  try {
    minSet = parseField(minuteField, 0, 59);
    hourSet = parseField(hourField, 0, 23);
    domSet = parseField(domField, 1, 31);
    monthSet = parseField(monthField, 1, 12);
    dowSet = parseField(dowField, 0, 6);
  } catch {
    return null;
  }

  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const results: Date[] = [];
  let safety = 200000;
  while (results.length < count && safety-- > 0) {
    const monthOk = matchesSet(monthSet, cursor.getMonth() + 1);
    const dayOk = monthOk && dayMatches(cursor, domSet, dowSet);
    if (!monthOk || !dayOk) {
      cursor.setHours(0, 0, 0, 0);
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }
    if (!matchesSet(hourSet, cursor.getHours())) {
      cursor.setMinutes(0, 0, 0);
      cursor.setHours(cursor.getHours() + 1);
      continue;
    }
    if (!matchesSet(minSet, cursor.getMinutes())) {
      cursor.setMinutes(cursor.getMinutes() + 1);
      continue;
    }
    results.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results.length === count ? results : null;
}

export default function CronJobBuilder() {
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('2');
  const [dom, setDom] = useState('*');
  const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*');
  const [command, setCommand] = useState('');
  const [logging, setLogging] = useState(true);
  const [shell, setShell] = useState(true);
  const [path, setPath] = useState(true);
  const [mailto, setMailto] = useState(false);
  const [lockfile, setLockfile] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState<string | null>(null);
  const [exprPulse, setExprPulse] = useState(false);
  const [runsLoading, setRunsLoading] = useState(false);
  const [nextRuns, setNextRuns] = useState<Date[] | null>([]);
  const [runsUnavailable, setRunsUnavailable] = useState(false);
  const [outputHtml, setOutputHtml] = useState(
    '<span style="color:#8b949e;font-style:italic;"># Add your command above to see the full crontab entry</span>',
  );
  const [currentRaw, setCurrentRaw] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { copied, copy } = useClipboard();
  const { copied: iconCopied, copy: copyIcon } = useClipboard();
  const runsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const expr = [minute, hour, dom, month, dow].join(' ');

  const renderNextRuns = useCallback((m: string, h: string, d: string, mo: string, dw: string) => {
    const runs = nextRunTimes(m, h, d, mo, dw, 10);
    if (runs) {
      setNextRuns(runs);
      setRunsUnavailable(false);
    } else {
      setNextRuns([]);
      setRunsUnavailable(true);
    }
    setRunsLoading(false);
  }, []);

  const generateCrontab = useCallback(
    (options?: { showFeedback?: boolean }) => {
      const showFeedback = options?.showFeedback;
      if (showFeedback) {
        setExprPulse(true);
        setTimeout(() => setExprPulse(false), 600);
      }

      const rawCommand = command.trim();
      if (!rawCommand) {
        setCurrentRaw('');
        setOutputHtml(
          '<span style="color:#8b949e;font-style:italic;"># Add your command above to see the full crontab entry</span>',
        );
        if (runsTimer.current) clearTimeout(runsTimer.current);
        if (showFeedback) {
          setRunsLoading(true);
          runsTimer.current = setTimeout(() => renderNextRuns(minute, hour, dom, month, dow), 180);
        } else {
          renderNextRuns(minute, hour, dom, month, dow);
        }
        return;
      }

      let cmd = rawCommand;
      if (lockfile) cmd = `/usr/bin/flock -n ${LOCK_PATH} ${cmd}`;
      let cronLine = `${expr} ${cmd}`;
      if (logging) cronLine += ` >> ${LOG_PATH} 2>&1`;

      const lines: string[] = [];
      if (shell) lines.push('SHELL=/bin/bash');
      if (path) lines.push('PATH=/usr/local/bin:/usr/bin:/bin');
      if (mailto) lines.push('MAILTO=you@example.com');
      if (lines.length) lines.push('');
      lines.push('# Cron job entry');
      lines.push(cronLine);

      const raw = lines.join('\n');
      setCurrentRaw(raw);
      setOutputHtml(highlightCrontab(raw));

      if (runsTimer.current) clearTimeout(runsTimer.current);
      if (showFeedback) {
        setRunsLoading(true);
        runsTimer.current = setTimeout(() => renderNextRuns(minute, hour, dom, month, dow), 180);
      } else {
        renderNextRuns(minute, hour, dom, month, dow);
      }
    },
    [command, dom, dow, expr, hour, lockfile, logging, mailto, minute, month, path, renderNextRuns, shell],
  );

  useEffect(() => {
    generateCrontab();
  }, [generateCrontab]);

  const applyPreset = useCallback((presetExpr: string) => {
    const parts = presetExpr.split(' ');
    if (parts.length !== 5) return;
    setMinute(parts[0]);
    setHour(parts[1]);
    setDom(parts[2]);
    setMonth(parts[3]);
    setDow(parts[4]);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!currentRaw) return;
    const ok = await copy(currentRaw);
    if (ok) setShowToast(true);
  }, [copy, currentRaw]);

  const handleIconCopy = useCallback(async () => {
    if (!currentRaw) return;
    await copyIcon(currentRaw);
  }, [copyIcon, currentRaw]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 1800);
    return () => clearTimeout(t);
  }, [showToast]);

  return (
    <div className="rounded-lg border border-border bg-bg">
      <div className="grid grid-cols-1 items-start gap-5 p-0 lg:grid-cols-[300px_1fr_360px]">
        <div>
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// cron expression'}</div>

          {[
            { id: 'minute', label: 'Minute', value: minute, setter: setMinute, options: [
              ['*', '* (every minute)'], ['0', ':00 (top of hour)'], ['15', ':15'], ['30', ':30'], ['45', ':45'],
              ['*/5', '*/5 (every 5 min)'], ['*/10', '*/10 (every 10 min)'], ['*/15', '*/15 (every 15 min)'], ['*/30', '*/30 (every 30 min)'],
            ]},
            { id: 'hour', label: 'Hour', value: hour, setter: setHour, options: [
              ['*', '* (every hour)'], ['0', '00:00 (midnight)'], ['2', '02:00 (2am)'], ['6', '06:00'],
              ['9', '09:00'], ['12', '12:00 (noon)'], ['18', '18:00 (6pm)'],
              ['*/2', '*/2 (every 2 hours)'], ['*/4', '*/4 (every 4 hours)'], ['*/6', '*/6 (every 6 hours)'],
            ]},
            { id: 'dom', label: 'Day of Month', value: dom, setter: setDom, options: [
              ['*', '* (every day)'], ['1', '1 (1st of month)'], ['15', '15 (15th)'],
            ]},
            { id: 'month', label: 'Month', value: month, setter: setMonth, options: [
              ['*', '* (every month)'], ['1', 'Jan'], ['6', 'Jun'], ['1-6', 'Jan-Jun'], ['7-12', 'Jul-Dec'],
            ]},
            { id: 'dow', label: 'Day of Week', value: dow, setter: setDow, options: [
              ['*', '* (every day)'], ['1-5', 'Mon-Fri (weekdays)'], ['0,6', 'Sat-Sun (weekends)'],
              ['1', 'Monday'], ['5', 'Friday'],
            ]},
          ].map(({ id, label, value, setter, options }) => (
            <div key={id} className="mb-3">
              <label htmlFor={`sel-${id}`} className="mb-1 block text-xs text-muted">{label}</label>
              <select
                id={`sel-${id}`}
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  generateCrontab({ showFeedback: true });
                }}
                className="w-full rounded-md border border-border bg-bg3 px-3 py-2 font-mono text-[13px] text-text"
              >
                {options.map(([v, t]) => (
                  <option key={v} value={v}>{t}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="mt-4 rounded-md border border-border bg-bg2 px-3.5 py-3">
            <div className="mb-1 text-[11px] text-muted">Cron Expression</div>
            <code className={`font-mono text-sm text-green ${exprPulse ? 'rounded px-1 ring-1 ring-green' : ''}`}>{expr}</code>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-[11px] text-muted">Quick presets:</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.expr}
                  type="button"
                  onClick={() => {
                    applyPreset(p.expr);
                    generateCrontab({ showFeedback: true });
                  }}
                  className="cursor-pointer rounded border border-border bg-bg2 px-2.5 py-1.5 font-mono text-[11px] text-text hover:border-green"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// bash wrapper options'}</div>

          <label htmlFor="inp-command" className="mb-1.5 block text-xs text-muted">Command or Script Path</label>
          <input
            type="text"
            id="inp-command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="/path/to/script.sh or bash -c 'command'"
            className="w-full rounded-md border border-border bg-bg3 px-3 py-2.5 font-mono text-[13px] text-text"
          />

          <div className="mt-5 space-y-2.5">
            {[
              { id: 'logging', checked: logging, setter: setLogging, label: 'Add logging (>> /var/log/cronjob.log 2>&1)', tip: 'Redirects all output to a log file so you can debug cron jobs' },
              { id: 'shell', checked: shell, setter: setShell, label: 'Set SHELL=/bin/bash', tip: 'Ensures bash features are available (arrays, [[ ]], etc)' },
              { id: 'path', checked: path, setter: setPath, label: 'Set PATH=/usr/local/bin:/usr/bin:/bin', tip: 'Cron has minimal PATH - this adds common bin directories' },
              { id: 'mailto', checked: mailto, setter: setMailto, label: 'Email on failure (MAILTO=you@example.com)', tip: 'Sends email if the cron job fails or produces output' },
              { id: 'lockfile', checked: lockfile, setter: setLockfile, label: 'Add lock file (prevent duplicate runs)', tip: 'Prevents the job from running if a previous instance is still active' },
            ].map(({ id, checked, setter, label, tip }) => (
              <label key={id} className="flex cursor-pointer items-center gap-2 text-[13px] text-text">
                <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} />
                <span>{label}</span>
                <span title={tip} className="cursor-help text-blue">ⓘ</span>
              </label>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-2 text-xs text-muted">Or wrap a snippet from the library:</div>
            <div className="flex flex-col gap-2">
              {SNIPPET_PILLS.map((pill) => (
                <div key={pill.label} className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const active = activeSnippet === pill.command;
                      if (active) {
                        setActiveSnippet(null);
                      } else {
                        setActiveSnippet(pill.command);
                        setCommand(pill.command);
                      }
                    }}
                    className={`cursor-pointer rounded-md border px-3 py-2 font-mono text-xs ${
                      activeSnippet === pill.command
                        ? 'border-green bg-green-dim text-green'
                        : 'border-border bg-bg2 text-text'
                    }`}
                  >
                    {pill.label}
                  </button>
                  <Link href={pill.href} target="_blank" className="text-[11px] text-muted hover:text-text">
                    view →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-20">
          <div className="flex items-center gap-3 rounded-t-lg border border-b-0 border-border bg-bg3 px-3.5 py-2.5">
            <div className="flex shrink-0 gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="inline-block h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="inline-block h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-xs text-muted">crontab entry</span>
            <button
              type="button"
              aria-label="Copy crontab entry"
              disabled={!currentRaw}
              onClick={() => void handleIconCopy()}
              className="ml-auto border-none bg-transparent font-mono text-sm text-muted disabled:opacity-40"
            >
              {iconCopied ? '✓ Copied' : '⧉'}
            </button>
          </div>
          <pre
            className="min-h-[200px] overflow-x-auto whitespace-pre rounded-b-lg border border-border bg-bg p-4 font-mono text-[13px] leading-relaxed text-text"
            dangerouslySetInnerHTML={{ __html: outputHtml }}
          />

          <div className="mt-3 rounded-md border border-border bg-bg2 p-3.5">
            <div className="mb-2 text-[11px] text-muted">Next 10 scheduled runs:</div>
            <div className="font-mono text-xs leading-relaxed text-text">
              {runsLoading ? (
                <div className="space-y-2">
                  <span className="block h-3.5 w-[70%] animate-pulse rounded-full bg-bg3" />
                  <span className="block h-3.5 w-[55%] animate-pulse rounded-full bg-bg3" />
                  <span className="block h-3.5 w-[62%] animate-pulse rounded-full bg-bg3" />
                </div>
              ) : runsUnavailable ? (
                <span className="text-muted">Preview not available for this pattern</span>
              ) : (
                nextRuns?.map((d, i) => (
                  <div key={i} className={i === 0 ? 'font-semibold text-green' : 'text-text'}>
                    {formatRun(d)}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={!currentRaw}
            onClick={() => void handleCopy()}
            className="mt-3 w-full rounded-lg border-none bg-green py-2.5 font-mono text-[13px] font-semibold text-[#0d1117] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? '✓ Copied' : '⧉ Copy Crontab Entry'}
          </button>

          <div className="mt-4 rounded-md border-l-[3px] border-blue bg-[#0d2a4a] px-3.5 py-3 text-xs leading-relaxed text-muted">
            <strong className="text-text">Pro tip:</strong> Test your cron job manually before adding it to crontab. Run the full command (including redirects) in your shell to catch errors.
          </div>
        </div>
      </div>

      {showToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-green bg-bg3 px-3.5 py-2.5 font-mono text-xs text-text"
        >
          Crontab entry copied
        </div>
      )}
    </div>
  );
}
