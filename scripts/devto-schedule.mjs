// Schedules the queued dev.to drafts for future publication.
//
// dev.to's API DOES support scheduling, it just isn't documented: PUT an article with
// `published: true` plus a future `published_at` and it goes to SCHEDULED, not live.
// Verified 2026-09-20 on post 02 — anonymous fetch of its URL returned 404 and the public
// feed still showed post 01 as newest. So the editor's hexagon scheduler is optional.
//
//   node scripts/devto-schedule.mjs --dry-run
//   node scripts/devto-schedule.mjs
//
// Run with the key from .env.local:
//   DEVTO_API_KEY="$(grep -m1 '^DEVTO_API_KEY=' .env.local | cut -d= -f2-)" node scripts/devto-schedule.mjs
//
// Idempotent: skips anything already scheduled for the right date.
// ponytail: flat 8s spacing + a 35s backoff on "Retry later". dev.to throttles article
// writes hard; if it still 429s, raise SPACING rather than adding a token bucket.

const KEY = process.env.DEVTO_API_KEY;
if (!KEY) { console.error('DEVTO_API_KEY missing'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');
const H = { 'api-key': KEY, 'Content-Type': 'application/json' };
const SPACING = 8000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Post number -> [dev.to article id, local date]. 08:00 America/Chicago.
// US DST ends 2026-11-01, so 11-03 is CST (-0600) and everything before it is CDT (-0500).
const SCHEDULE = [
  ['02', 4700404, '2026-09-22', '-0500'],
  ['03', 4700405, '2026-09-24', '-0500'],
  ['04', 4700406, '2026-09-29', '-0500'],
  ['05', 4700407, '2026-10-01', '-0500'],
  ['06', 4700410, '2026-10-06', '-0500'],
  ['07', 4700411, '2026-10-08', '-0500'],
  ['08', 4700413, '2026-10-13', '-0500'],
  ['09', 4700414, '2026-10-15', '-0500'],
  ['10', 4700415, '2026-10-20', '-0500'],
  ['11', 4700416, '2026-10-22', '-0500'],
  ['12', 4700417, '2026-10-27', '-0500'],
  ['13', 4700419, '2026-10-29', '-0500'],
  ['14', 4700422, '2026-11-03', '-0600'],
];

async function put(id, article) {
  for (let i = 0; i < 6; i++) {
    const res = await fetch(`https://dev.to/api/articles/${id}`, { method: 'PUT', headers: H, body: JSON.stringify({ article }) });
    const txt = await res.text();
    if (res.ok) return JSON.parse(txt);
    if (/retry later/i.test(txt) || res.status === 429) { console.log(`    rate limited, waiting 35s (attempt ${i + 1})`); await sleep(35000); continue; }
    throw new Error(`${res.status} ${txt.slice(0, 200)}`);
  }
  throw new Error('gave up after 6 attempts');
}

const all = await fetch('https://dev.to/api/articles/me/all?per_page=100', { headers: H }).then(r => r.json());
if (!Array.isArray(all)) { console.error('API error:', JSON.stringify(all).slice(0, 200)); process.exit(1); }
const byId = new Map(all.map(a => [a.id, a]));

let done = 0, skipped = 0;
for (const [num, id, date, off] of SCHEDULE) {
  const cur = byId.get(id);
  if (!cur) { console.log(`MISS  #${num} id ${id} not on the account`); continue; }
  const want = `${date} 08:00 ${off}`;
  if (cur.published_at && cur.published_at.slice(0, 10) === date && cur.published) {
    console.log(`skip  #${num} already scheduled ${date}`); skipped++; continue;
  }
  if (DRY) { console.log(`would #${num} id ${id} -> ${want}`); done++; continue; }
  const out = await put(id, { published: true, published_at: want });
  console.log(`sched #${num} -> ${out.published_at}`);
  done++;
  await sleep(SPACING);
}
console.log(`\n${DRY ? 'would schedule' : 'scheduled'} ${done}, skipped ${skipped}`);
