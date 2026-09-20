// Creates the queued cross-posts as dev.to DRAFTS so Travis only has to open each one
// and set its publish date (the hexagon icon by Publish). The API cannot schedule —
// `published_at` is not a create field — so drafts + the UI scheduler is the whole trick.
//
//   node scripts/devto-drafts.mjs --dry-run     # print what would be created
//   node scripts/devto-drafts.mjs               # create the missing drafts
//
// Run with the key from .env.local:
//   DEVTO_API_KEY="$(grep -m1 '^DEVTO_API_KEY=' .env.local | cut -d= -f2-)" node scripts/devto-drafts.mjs
//
// Idempotent: skips any queue file whose canonical_url is already on the account,
// published or draft. Safe to re-run after a partial failure.
import { readFileSync, readdirSync } from 'node:fs';

const KEY = process.env.DEVTO_API_KEY;
if (!KEY) { console.error('DEVTO_API_KEY missing'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');
const H = { 'api-key': KEY, 'Content-Type': 'application/json' };
const DIR = 'docs/cross-posts/queue';

// ponytail: 3-line front matter split, not a YAML parser. These files are generated
// and uniform (title/published/description/tags/canonical_url/cover_image, no nesting).
function parse(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('no front matter');
  const fm = {};
  for (const line of m[1].split('\n')) {
    const k = line.indexOf(':');
    if (k < 0) continue;
    fm[line.slice(0, k).trim()] = line.slice(k + 1).trim().replace(/^"|"$/g, '');
  }
  return { fm, body: m[2].trim() };
}

const files = readdirSync(DIR).filter(f => /^\d\d-.*-devto\.md$/.test(f)).sort();
const mine = await fetch('https://dev.to/api/articles/me/all?per_page=100', { headers: H }).then(r => r.json());
if (!Array.isArray(mine)) { console.error('API error:', JSON.stringify(mine).slice(0, 200)); process.exit(1); }
const taken = new Set(mine.map(a => a.canonical_url).filter(Boolean));

let made = 0, skipped = 0;
for (const f of files) {
  const { fm, body } = parse(readFileSync(`${DIR}/${f}`, 'utf8'));
  if (taken.has(fm.canonical_url)) { console.log(`skip   ${f} — canonical already on dev.to`); skipped++; continue; }
  if (body.includes('<!-- REVIEW')) { console.log(`SKIP   ${f} — REVIEW line present, not shipping`); skipped++; continue; }

  const article = {
    title: fm.title,
    body_markdown: body,          // body only: title/tags/canonical go as JSON fields
    published: false,             // draft. Travis schedules it in the editor.
    description: fm.description,
    tags: fm.tags.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4),
    canonical_url: fm.canonical_url,
    main_image: fm.cover_image,
  };
  if (DRY) { console.log(`would   ${f} → "${article.title.slice(0, 60)}…" tags=${article.tags} canonical=${article.canonical_url}`); made++; continue; }

  const res = await fetch('https://dev.to/api/articles', { method: 'POST', headers: H, body: JSON.stringify({ article }) });
  const out = await res.json();
  if (!res.ok) { console.error(`FAIL   ${f} — ${res.status} ${JSON.stringify(out).slice(0, 160)}`); continue; }
  console.log(`draft  ${f} → id ${out.id}  ${out.url || '(unpublished)'}`);
  made++;
  await new Promise(r => setTimeout(r, 12000)); // ponytail: flat 12s. dev.to throttles article creation; raise if it 429s.
}
console.log(`\n${DRY ? 'would create' : 'created'} ${made}, skipped ${skipped}`);
