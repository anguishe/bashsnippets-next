// Build-time meta gate. `npm run build` runs it right after `next build`, so a bad title
// fails the build locally AND the Vercel deploy, before the sitemap is written.
// Dependency-free: Node built-ins only.
//
// Reads every prerendered page under .next/server/app/**/*.html and FAILS (exit 1) on:
//   - missing <title> or meta description
//   - <title> > 65 chars, " | BashSnippets.xyz" suffix included (Bing's limit, the
//     2026-09-16 titles pass, 4ce6715) — warns > 60
//   - meta description > 160 chars
//   - duplicate <title> across indexable pages
// Pages marked robots noindex are still length-checked but left out of the duplicate check.
//
// The same limits are enforced against a live/preview URL by
// ~/Projects/docs/tools/site-gate/site-gate.mjs (CLAUDE.md "Change control and quality
// gate"); this is the in-repo backstop.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = join(process.cwd(), '.next', 'server', 'app');
const TITLE_MAX = 65;
const TITLE_WARN = 60;
const DESC_MAX = 160;
// Next's internal error shells: no route, no metadata of their own.
const SKIP = new Set(['/_global-error']);

if (!existsSync(ROOT)) {
  console.error(`[check-meta] ${ROOT} not found — run after \`next build\`.`);
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name.endsWith('.html') ? [p] : [];
  });
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

const pick = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1]) : null;
};

const errors = [];
const warns = [];
const titles = new Map();
let pages = 0;

for (const file of walk(ROOT)) {
  const route =
    '/' + relative(ROOT, file).split(sep).join('/').replace(/\.html$/, '').replace(/^index$/, '');
  if (SKIP.has(route)) continue;
  pages++;
  const html = readFileSync(file, 'utf8');
  const title = pick(html, /<title[^>]*>([^<]*)<\/title>/i);
  const desc = pick(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
  const robots = pick(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i) ?? '';
  const noindex = /noindex/i.test(robots) || route === '/_not-found';

  if (!title) errors.push(`${route}: missing <title>`);
  else {
    if (title.length > TITLE_MAX) errors.push(`${route}: title ${title.length} chars (>${TITLE_MAX}): "${title}"`);
    else if (title.length > TITLE_WARN) warns.push(`${route}: title ${title.length} chars (>${TITLE_WARN})`);
    if (!noindex) titles.set(title, [...(titles.get(title) ?? []), route]);
  }
  if (!desc) errors.push(`${route}: missing meta description`);
  else if (desc.length > DESC_MAX) errors.push(`${route}: description ${desc.length} chars (>${DESC_MAX}): "${desc}"`);
}

for (const [t, routes] of titles) {
  if (routes.length > 1) errors.push(`duplicate title on ${routes.join(', ')}: "${t}"`);
}

for (const w of warns) console.log(`[check-meta] WARN  ${w}`);
for (const e of errors) console.error(`[check-meta] ERROR ${e}`);
if (pages === 0) {
  console.error('[check-meta] no prerendered pages found — refusing to pass an empty scan.');
  process.exit(1);
}
if (errors.length) {
  console.error(
    `[check-meta] FAIL: ${errors.length} error(s) across ${pages} pages. Shorten via metaTitle/fitTitle (src/lib/meta-title.ts) — see CLAUDE.md "Change control and quality gate".`,
  );
  process.exit(1);
}
console.log(`[check-meta] PASS: ${pages} pages, ${warns.length} warning(s).`);
