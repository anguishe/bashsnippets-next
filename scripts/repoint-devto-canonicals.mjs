// Re-points dev.to canonical_url for articles that were self-canonicalized on 2026-08-31
// (when their site pages were noindexed) back at the site pages, which were restored on
// 2026-09-01. Run: export $(grep DEVTO_API_KEY .env.local) && node scripts/repoint-devto-canonicals.mjs
// Idempotent; prints one line per mapped article. dev.to returns 422 if another article
// already holds the target canonical — that is reported, not retried.
const KEY = process.env.DEVTO_API_KEY;
if (!KEY) { console.error('DEVTO_API_KEY missing'); process.exit(1); }
const H = { 'api-key': KEY, 'Content-Type': 'application/json' };
const SITE = 'https://bashsnippets.xyz';

// dev.to article id -> site path. Ids from the public API on 2026-09-10.
const MAP = {
  4266678: '/guides/shell-scripts-that-talk-to-apis', // Our Status Dashboard Was Green for 61 Hours…
  3958822: '/snippets/bash-functions-arguments',      // A Function Without local Overwrote My Variable…
  3942424: '/snippets/bash-read-file-line-by-line',   // The Alert Never Fired Because the Loop Skipped the Last Line…
  3900199: '/snippets/bash-for-loop-examples',        // A for Loop Skipped 23 Files…
  3791865: '/snippets/quick-system-info-report',      // I Aliased 'syscheck'…
  3773447: '/snippets/create-dated-folder',           // I Alias This One-Liner to 'mktoday'…
  3610473: '/snippets/kill-a-process',                // I was killing Ollama processes the hard way…
};

const mine = await fetch('https://dev.to/api/articles/me/published?per_page=100', { headers: H }).then(r => r.json());
for (const a of mine) {
  const path = MAP[a.id];
  if (!path) continue;
  const next = SITE + path;
  if (a.canonical_url === next) { console.log('ok      ', a.id, next); continue; }
  const res = await fetch(`https://dev.to/api/articles/${a.id}`, {
    method: 'PUT', headers: H, body: JSON.stringify({ article: { canonical_url: next } }),
  });
  console.log(res.ok ? 'repointed' : `FAIL ${res.status}`, a.id, a.canonical_url, '->', next);
}
