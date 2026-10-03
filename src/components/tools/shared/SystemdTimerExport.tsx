'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClipboard } from './useClipboard';
import { buildUnits, cronToOnCalendar, unitName } from './systemdTimer';

interface Props {
  /** The five cron fields, already split. */
  fields: [string, string, string, string, string];
  /** What ExecStart= runs: a full line from execStart(), or an absolute path to a script. */
  execStart: string;
  /** Used for the unit name and Description=. */
  label: string;
  timeoutSec?: string;
  onFailure?: boolean;
}

function Block({ title, text }: { title: string; text: string }) {
  const { copied, copy } = useClipboard();
  return (
    <div className="mt-3 overflow-hidden rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-bg3 px-3 py-1.5">
        <span className="font-mono text-xs text-muted">{title}</span>
        <button
          type="button"
          onClick={() => void copy(text)}
          className="rounded border border-border px-2 py-0.5 font-mono text-xs text-green transition-colors hover:border-green"
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <pre className="overflow-x-auto bg-bg p-3 font-mono text-[12.5px] leading-relaxed text-text">{text}</pre>
    </div>
  );
}

/** "Export as a systemd timer": the same schedule as a .service + .timer pair. */
export default function SystemdTimerExport({ fields, execStart, label, timeoutSec, onFailure }: Props) {
  const [open, setOpen] = useState(false);
  const { onCalendar, notes, error } = cronToOnCalendar(...fields);
  const name = unitName(label);

  return (
    <div className="mt-4 rounded-md border border-border bg-bg2 px-3.5 py-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left font-mono text-[13px] font-semibold text-green transition-colors hover:text-text"
      >
        {open ? '▾' : '▸'} Export as a systemd timer
      </button>
      {open && (
        <div className="mt-2 text-xs leading-relaxed text-muted">
          {error ? (
            <p className="text-amber">{error}</p>
          ) : (
            <>
              <p>
                Same schedule, but a run missed while the machine was off happens at the next boot (
                <code className="text-text">Persistent=true</code>), a slow run is queued instead of overlapping, and
                output lands in the journal instead of a mail spool nobody reads. Why each matters, measured on one
                machine: <Link href="/guides/systemd-timers-vs-cron" className="text-blue hover:text-green">systemd Timers vs Cron</Link>.
              </p>
              {notes.map((n) => (
                <p key={n} className="mt-2 rounded border-l-[3px] border-amber bg-bg3 px-2.5 py-1.5 text-amber">
                  {n}
                </p>
              ))}
              {(() => {
                const units = buildUnits({
                  name,
                  description: `${name} (converted from crontab: ${fields.join(' ')})`,
                  execStart: execStart.startsWith('ExecStart=') ? execStart : `ExecStart=${execStart}`,
                  onCalendar,
                  timeoutSec,
                  onFailure,
                });
                return (
                  <>
                    <Block title={`${name}.service`} text={units.service} />
                    <Block title={`${name}.timer`} text={units.timer} />
                    {units.alert && <Block title={`${name}-alert.service`} text={units.alert} />}
                    <Block title="install and check (user timer, no root)" text={units.install} />
                  </>
                );
              })()}
              <p className="mt-2">
                Every OnCalendar= translation here is checked against <code className="text-text">systemd-analyze calendar</code>{' '}
                on systemd 261: it fires on exactly the minutes cron would. For a system-wide job, put the files in{' '}
                <code className="text-text">/etc/systemd/system/</code> and drop <code className="text-text">--user</code>.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
