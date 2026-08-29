// Rewrites dev.to canonical_url for BashSnippets articles whose canonical points at a
// legacy URL (.html / trailing slash) that now 308s. Run: DEVTO_API_KEY=... node scripts/fix-devto-canonicals.mjs
// Get a key at https://dev.to/settings/extensions. Idempotent; prints one line per article.
const KEY = process.env.DEVTO_API_KEY;
if (!KEY) { console.error('DEVTO_API_KEY missing'); process.exit(1); }
const H = { 'api-key': KEY, 'Content-Type': 'application/json' };

const clean = (u) => u
  .replace(/\.html$/, '')
  .replace(/^(https:\/\/bashsnippets\.xyz)\/(.+?)\/$/, '$1/$2'); // strip trailing slash except root

const mine = await fetch('https://dev.to/api/articles/me/published?per_page=100', { headers: H }).then(r => r.json());
for (const a of mine) {
  const cur = a.canonical_url ?? '';
  if (!cur.startsWith('https://bashsnippets.xyz')) continue;
  const next = clean(cur);
  if (next === cur) { console.log('ok      ', cur); continue; }
  const res = await fetch(`https://dev.to/api/articles/${a.id}`, {
    method: 'PUT', headers: H, body: JSON.stringify({ article: { canonical_url: next } }),
  });
  console.log(res.ok ? 'fixed   ' : `FAIL ${res.status}`, cur, '->', next);
}
