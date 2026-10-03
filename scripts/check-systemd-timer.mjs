// Checks the cron → systemd timer export against systemd itself: every fixture's OnCalendar=
// lines must fire at exactly the minutes cron would, per `systemd-analyze calendar`.
// Usage: node scripts/check-systemd-timer.mjs   (needs systemd-analyze; exits 1 on failure)
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { register } from 'node:module';

// The shared modules import each other without extensions (Next resolves them); add `.ts` for node.
register(
  'data:text/javascript,' +
    encodeURIComponent(
      "export async function resolve(s, c, next) { try { return await next(s, c); } catch (e) { if (s.startsWith('.') && !s.endsWith('.ts')) return next(s + '.ts', c); throw e; } }",
    ),
);
const { cronToOnCalendar, execStart, unitName } = await import('../src/components/tools/shared/systemdTimer.ts');
const { parseDow, parseField, parseMonth } = await import('../src/components/tools/shared/cronParse.ts');

// Reference: does cron fire at minute `d`? Straight from man 5 crontab, including the day-field OR rule.
function cronMatches([mi, h, dom, mon, dow], d) {
  const s = { mi: parseField(mi, 0, 59), h: parseField(h, 0, 23), dom: parseField(dom, 1, 31), mon: parseMonth(mon), dow: parseDow(dow) };
  const has = (set, v) => set === null || set.has(v);
  const dayOk = s.dom !== null && s.dow !== null ? s.dom.has(d.getDate()) || s.dow.has(d.getDay()) : has(s.dom, d.getDate()) && has(s.dow, d.getDay());
  return has(s.mi, d.getMinutes()) && has(s.h, d.getHours()) && has(s.mon, d.getMonth() + 1) && dayOk;
}

// systemd's next N elapses for one OnCalendar expression, as epoch ms. --base-time pins "now".
const BASE = '2026-10-03 00:00:00';
function systemdNext(expr, n) {
  const out = execFileSync('systemd-analyze', ['calendar', `--iterations=${n}`, `--base-time=${BASE}`, expr], { encoding: 'utf8', env: { ...process.env, TZ: 'UTC', LC_ALL: 'C' } });
  if (!/Normalized form:/.test(out)) throw new Error(`systemd rejected ${expr}`);
  return [...out.matchAll(/(?:Next elapse|Iteration #\d+):\s+\w{3} (\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)/g)].map((m) => Date.parse(`${m[1]}Z`));
}

// cron's next N minutes from the same base, by brute force over minutes (UTC).
function cronNext(fields, n) {
  const out = [];
  for (let t = Date.parse('2026-10-03T00:00:00Z') + 60_000; out.length < n; t += 60_000) {
    const d = new Date(t);
    const local = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes());
    if (cronMatches(fields, local)) out.push(t);
  }
  return out;
}

const FIXTURES = [
  '0 2 * * *', '*/15 * * * *', '0 9 * * 1-5', '30 18 * * 0,6', '0 0 1 * *',
  '0 3 1-7 * 1', '0 */6 * * *', '15 2 15 1-6 *', '0 12 * 7-12 5', '0 0 * * 5-7',
  '5,35 8-10 * * MON-FRI', '0 4 */2 * *',
];

let failures = 0;
for (const line of FIXTURES) {
  const fields = line.split(' ');
  const { onCalendar, error } = cronToOnCalendar(...fields);
  try {
    assert.ok(!error && onCalendar.length > 0, `no translation for ${line}`);
    const N = 40;
    // A timer fires at the union of its OnCalendar= lines.
    const merged = [...new Set(onCalendar.flatMap((c) => systemdNext(c, N)))].sort((a, b) => a - b).slice(0, N);
    assert.deepEqual(merged, cronNext(fields, N), `${line} → ${onCalendar.join(' | ')}`);
    console.log(`ok  ${line.padEnd(22)} → ${onCalendar.join(' | ')}`);
  } catch (e) {
    failures++;
    console.log(`FAIL ${line}: ${e.message.split('\n')[0]}`);
  }
}

// A cron expression that does not parse must not produce a unit.
assert.ok(cronToOnCalendar('61', '*', '*', '*', '*').error);
// Unit names systemd accepts.
assert.equal(unitName('/usr/local/bin/Backup DB.sh --now'), 'backup');
assert.equal(unitName(''), 'cron-job');
// % and $ reach the shell literally; quotes and backslashes survive systemd's unquoting.
assert.equal(execStart('echo "$HOME" 100% \\n', '/bin/sh'), 'ExecStart=/bin/sh -c "echo \\"$$HOME\\" 100%% \\\\n"');

if (failures) {
  console.log(`${failures} fixture(s) disagree with systemd`);
  process.exit(1);
}
console.log(`all ${FIXTURES.length} fixtures agree with systemd-analyze calendar`);
