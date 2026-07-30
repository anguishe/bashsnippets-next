// Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver).
// Usage: npm run indexnow            — submits all sitemap URLs
//        npm run indexnow -- <url>…  — submits only the given URLs
import { readFileSync } from 'fs';
import { resolve } from 'path';

const HOST = 'bashsnippets.xyz';

// Key from .env.local (or env). One IndexNow key pings Bing + Yandex + Seznam +
// Naver via the single api.indexnow.org endpoint — there is no separate Bing or
// Yandex key. Public by protocol design; also served at /<key>.txt.
function loadKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY;
  try {
    const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    const m = env.match(/^INDEXNOW_KEY=(.+)$/m);
    if (m) return m[1].trim();
  } catch {}
  throw new Error('INDEXNOW_KEY not found in env or .env.local');
}
const KEY = loadKey();

const args = process.argv.slice(2);
const urlList = args.length
  ? args
  : [...readFileSync(resolve(process.cwd(), 'public', 'sitemap.xml'), 'utf-8')
      .matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

if (!urlList.length) {
  console.error('No URLs found to submit.');
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});

// 200 = submitted, 202 = accepted pending key validation
console.log(`IndexNow: HTTP ${res.status} — submitted ${urlList.length} URLs`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
