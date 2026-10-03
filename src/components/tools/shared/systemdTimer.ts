// Crontab line → systemd .service + .timer pair. Pure functions, no React, so
// scripts/check-systemd-timer.mjs can run them against `systemd-analyze calendar`.
import { parseDow, parseField, parseMonth } from './cronParse';

// systemd weekdays, in the order OnCalendar ranges run (Mon..Sun), indexed by cron's 0=Sun.
const SD_DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_FIRST = [1, 2, 3, 4, 5, 6, 0];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// A sorted set as "a,b,c..e": runs of three or more become systemd's `..` range.
function compress(values: number[], fmt: (n: number) => string): string {
  const out: string[] = [];
  for (let i = 0; i < values.length; ) {
    let j = i;
    while (j + 1 < values.length && values[j + 1] === values[j] + 1) j++;
    if (j - i >= 2) out.push(`${fmt(values[i])}..${fmt(values[j])}`);
    else for (let k = i; k <= j; k++) out.push(fmt(values[k]));
    i = j + 1;
  }
  return out.join(',');
}

// `*/n` keeps its step form (`0/15`, `1/2`), which systemd reads as "start, then every n";
// everything else is expanded to the exact values cron would match.
function field(text: string, set: Set<number> | null, min: number, pad: boolean): string {
  if (set === null) return '*';
  const step = text.match(/^\*\/(\d+)$/);
  const fmt = pad ? pad2 : String;
  if (step) return `${fmt(min)}/${step[1]}`;
  return compress([...set].sort((a, b) => a - b), fmt);
}

function weekdays(set: Set<number>): string {
  const ordered = MON_FIRST.filter((d) => set.has(d));
  // Consecutive in Mon..Sun order compress to a range; positions, not cron numbers, decide adjacency.
  const positions = ordered.map((d) => MON_FIRST.indexOf(d));
  return compress(positions, (p) => SD_DOW[MON_FIRST[p]]);
}

export interface CalendarResult {
  onCalendar: string[];
  notes: string[];
  error?: string;
}

/** Five cron fields → OnCalendar= lines that fire at exactly the same minutes. */
export function cronToOnCalendar(minute: string, hour: string, dom: string, month: string, dow: string): CalendarResult {
  let sets;
  try {
    sets = {
      minute: parseField(minute, 0, 59),
      hour: parseField(hour, 0, 23),
      dom: parseField(dom, 1, 31),
      month: parseMonth(month),
      dow: parseDow(dow),
    };
  } catch {
    return { onCalendar: [], notes: [], error: 'This cron expression does not parse, so there is nothing to convert.' };
  }

  const time = `${field(hour, sets.hour, 0, true)}:${field(minute, sets.minute, 0, true)}:00`;
  const mon = field(month, sets.month, 1, false);
  const day = field(dom, sets.dom, 1, false);
  const notes: string[] = [];

  if (sets.dom !== null && sets.dow !== null) {
    // cron ORs the two day fields; one OnCalendar= line ANDs them. Two lines OR again: a timer fires when any line matches.
    notes.push(
      `cron runs on day ${dom} of the month OR on weekday ${dow}. One OnCalendar= line would require both, so the export uses two lines; a timer fires when either matches, which is cron's behaviour.`,
    );
    return { onCalendar: [`*-${mon}-${day} ${time}`, `${weekdays(sets.dow)} *-${mon}-* ${time}`], notes };
  }
  const prefix = sets.dow !== null ? `${weekdays(sets.dow)} ` : '';
  return { onCalendar: [`${prefix}*-${mon}-${day} ${time}`], notes };
}

/** A unit name systemd accepts, from the job's first word: /usr/local/bin/backup.sh → backup. */
export function unitName(command: string): string {
  const first = command.trim().split(/\s+/)[0] ?? '';
  const base = (first.split('/').pop() ?? '').replace(/\.[a-z]+$/i, '');
  const clean = base.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return clean || 'cron-job';
}

/**
 * The command as an ExecStart= line. systemd does not use a shell, so the command runs under
 * the shell cron would have used. Inside the unit file `%` is a specifier and `$` is systemd's
 * own variable syntax, so both are doubled to reach the shell literally.
 */
export function execStart(command: string, shell: '/bin/sh' | '/bin/bash'): string {
  const escaped = command
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/%/g, '%%')
    .replace(/\$/g, '$$$$');
  return `ExecStart=${shell} -c "${escaped}"`;
}

export interface UnitOptions {
  name: string;
  description: string;
  execStart: string;
  onCalendar: string[];
  timeoutSec?: string;
  onFailure?: boolean;
}

export function buildUnits(o: UnitOptions): { service: string; timer: string; install: string; alert?: string } {
  const service = [
    `# ~/.config/systemd/user/${o.name}.service`,
    '[Unit]',
    `Description=${o.description.replace(/%/g, '%%')}`, // % is a specifier here too
    ...(o.onFailure ? ['# Starts the alert unit below when the job fails', `OnFailure=${o.name}-alert.service`] : []),
    '',
    '[Service]',
    // oneshot: a run still going when the next tick fires is queued, never overlapped, so no flock is needed.
    'Type=oneshot',
    // journalctl -u misses lines from short-lived child processes (verified on systemd 261); -t NAME finds them all.
    `SyslogIdentifier=${o.name}`,
    o.execStart,
    ...(o.timeoutSec ? [`TimeoutStartSec=${o.timeoutSec}`] : []),
  ].join('\n');

  const timer = [
    `# ~/.config/systemd/user/${o.name}.timer`,
    '[Unit]',
    `Description=Schedule for ${o.name}.service`,
    '',
    '[Timer]',
    ...o.onCalendar.map((c) => `OnCalendar=${c}`),
    // Run once at boot if the machine was off at the scheduled time; cron skips those runs silently.
    'Persistent=true',
    '',
    '[Install]',
    'WantedBy=timers.target',
  ].join('\n');

  // OnFailure= must name a unit that exists, so the export ships a minimal one to edit.
  const alert = o.onFailure
    ? [
        `# ~/.config/systemd/user/${o.name}-alert.service`,
        '[Unit]',
        `Description=Alert: ${o.name}.service failed`,
        '',
        '[Service]',
        'Type=oneshot',
        `SyslogIdentifier=${o.name}-alert`,
        '# Replace with your mail, Slack or webhook command.',
        `ExecStart=/bin/sh -c "echo '${o.name}.service failed; see: journalctl --user -t ${o.name}' >&2"`,
      ].join('\n')
    : undefined;

  const install = [
    'mkdir -p ~/.config/systemd/user   # save both files here',
    `systemd-analyze --user verify ~/.config/systemd/user/${o.name}.{service,timer}${o.onFailure ? ` ~/.config/systemd/user/${o.name}-alert.service` : ''}`,
    ...o.onCalendar.map((c) => `systemd-analyze calendar --iterations=3 '${c}'`),
    'systemctl --user daemon-reload',
    `systemctl --user enable --now ${o.name}.timer`,
    `systemctl --user list-timers ${o.name}.timer`,
    `journalctl --user -t ${o.name} --since today   # the job's output`,
    '# runs only while you are logged in unless: loginctl enable-linger "$USER"',
  ].join('\n');

  return { service, timer, install, alert };
}
