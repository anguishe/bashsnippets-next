# Sitemap Hardening + CLAUDE.md Refresh + Deploy Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden `scripts/generate-sitemap.mjs` so the URL set auto-tracks the real registries; fix two stale CLAUDE.md facts; create OWNERSHIP.md; verify redirect integrity; run a full build; then commit in logical groups and push.

**Architecture:** Parse `src/lib/snippets.ts` and `src/lib/tools.ts` with targeted regex in the sitemap generator — no new dependencies, no tsx/ts-node, structurally coupled to the registry object literal format. URL set must be byte-identical before/after. CLAUDE.md edits are surgical patches. OWNERSHIP.md is a new root-level file.

**Tech Stack:** Node.js 20+ ESM (`.mjs`), `String.prototype.matchAll` for registry parsing, bash + curl for redirect verification, `npm run build` for TypeScript validation.

---

### Task 1: Refactor generate-sitemap.mjs to read from real registries

**Files:**
- Modify: `scripts/generate-sitemap.mjs`

- [ ] **Step 1: Capture baseline URL set**

```bash
node -e "
const xml = require('fs').readFileSync('public/sitemap.xml','utf-8');
const locs = xml.match(/<loc>([^<]+)<\/loc>/g).map(l => l.replace(/<\/?loc>/g,''));
locs.sort().forEach(l => console.log(l));
" > /tmp/sitemap-before.txt
wc -l < /tmp/sitemap-before.txt   # expect: 52
```

- [ ] **Step 2: Replace generate-sitemap.mjs**

Replace the full file with this content:

```js
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://bashsnippets.xyz';

// Only static routes that have no registry entry belong here.
const staticEntries = [
  { url: `${SITE_URL}/`,                                          lastmod: '2026-06-03', changefreq: 'daily',   priority: 1.0  },
  { url: `${SITE_URL}/snippets`,                                  lastmod: '2026-06-10', changefreq: 'daily',   priority: 0.9  },
  { url: `${SITE_URL}/tools`,                                     lastmod: '2026-06-10', changefreq: 'daily',   priority: 0.9  },
  { url: `${SITE_URL}/guides`,                                    lastmod: '2026-06-10', changefreq: 'weekly',  priority: 0.8  },
  { url: `${SITE_URL}/starter-kit`,                               lastmod: '2026-06-08', changefreq: 'monthly', priority: 0.8  },
  { url: `${SITE_URL}/about`,                                     lastmod: '2026-06-06', changefreq: 'monthly', priority: 0.5  },
  { url: `${SITE_URL}/privacy`,                                   lastmod: '2026-06-06', changefreq: 'yearly',  priority: 0.3  },
  { url: `${SITE_URL}/contact`,                                   lastmod: '2026-06-06', changefreq: 'yearly',  priority: 0.3  },
  { url: `${SITE_URL}/terms`,                                     lastmod: '2026-06-06', changefreq: 'yearly',  priority: 0.3  },
  { url: `${SITE_URL}/snippets/server-monitoring`,                lastmod: '2026-06-06', changefreq: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/snippets/backup-and-recovery`,              lastmod: '2026-06-06', changefreq: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/snippets/disk-management`,                  lastmod: '2026-06-06', changefreq: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/snippets/linux-security`,                   lastmod: '2026-06-06', changefreq: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/guides/bash-scripts-every-sysadmin-needs`,  lastmod: '2026-06-08', changefreq: 'weekly',  priority: 0.8  },
  { url: `${SITE_URL}/guides/bash-scripting-for-ci-cd-pipelines`, lastmod: '2026-06-10', changefreq: 'weekly',  priority: 0.8  },
];

/**
 * Extract { slug, dateModified } pairs from a TypeScript registry source file
 * by matching slug: '...' and the nearest following dateModified: '...' literal.
 * Coupled to the object-literal format of src/lib/snippets.ts and src/lib/tools.ts.
 */
function parseRegistry(filePath) {
  const content = readFileSync(resolve(process.cwd(), filePath), 'utf-8');
  const slugs = [...content.matchAll(/slug:\s*'([^']+)'/g)]
    .map(m => ({ slug: m[1], index: m.index }));
  const dates = [...content.matchAll(/dateModified:\s*'([^']+)'/g)]
    .map(m => ({ date: m[1], index: m.index }));

  return slugs
    .map(s => ({ slug: s.slug, dateModified: dates.find(d => d.index > s.index)?.date }))
    .filter(e => e.dateModified);
}

const snippets = parseRegistry('src/lib/snippets.ts');
const tools    = parseRegistry('src/lib/tools.ts');

const snippetEntries = snippets.map(s => ({
  url:        `${SITE_URL}/snippets/${s.slug}`,
  lastmod:    s.dateModified,
  changefreq: 'weekly',
  priority:   0.8,
}));

const toolEntries = tools.map(t => ({
  url:        `${SITE_URL}/tools/${t.slug}`,
  lastmod:    t.dateModified,
  changefreq: 'weekly',
  priority:   0.9,
}));

const allEntries = [...staticEntries, ...snippetEntries, ...toolEntries];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allEntries.map(e =>
    `  <url>\n    <loc>${e.url}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
  ),
  '</urlset>',
].join('\n');

const outPath = resolve(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`sitemap.xml → ${outPath} (${allEntries.length} entries: ${snippets.length} snippets, ${tools.length} tools)`);
```

- [ ] **Step 3: Run generator and diff URL set**

```bash
node scripts/generate-sitemap.mjs

node -e "
const xml = require('fs').readFileSync('public/sitemap.xml','utf-8');
const locs = xml.match(/<loc>([^<]+)<\/loc>/g).map(l => l.replace(/<\/?loc>/g,''));
locs.sort().forEach(l => console.log(l));
" > /tmp/sitemap-after.txt

diff /tmp/sitemap-before.txt /tmp/sitemap-after.txt && echo "PASS: URL sets identical" || echo "FAIL: see diff above"
wc -l < /tmp/sitemap-after.txt   # expect: 52
```

Expected: `PASS: URL sets identical` and count = 52. If diff is non-empty, STOP and report delta.

---

### Task 2: Fix two stale facts in CLAUDE.md + add AdSlot note

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Fix build command comment (fact a)**

Find:
```
npm run build      # production build + static export (no postbuild; sitemap is native app/sitemap.ts)
```
Replace with:
```
npm run build      # production build; sitemap written to public/sitemap.xml by scripts/generate-sitemap.mjs
```

- [ ] **Step 2: Fix tools architecture description (fact b)**

Find:
```
Most tools are native React components rendered by `ToolRenderer`. A few are thin wrappers that embed a standalone HTML file from `public/tool-content/<slug>.html` in an iframe via `ToolEmbed.tsx`. Do **not** convert the remaining iframe-embedded tools to React components unless explicitly asked.
```
Replace with:
```
All tools are native React components rendered by `ToolRenderer` and registered by slug in the `toolComponents` map. The `ToolEmbed.tsx` iframe path has been removed — no `public/tool-content/*.html` files remain.
```

- [ ] **Step 3: Add AdSlot flag-disable note**

After the Affiliate Links subsection, insert:

```markdown
> **AdSlot status (2026-06-14):** Ad units are flag-disabled in all components pending AdSense site approval. Remove the flag when approval email is received.
```

---

### Task 3: Create OWNERSHIP.md

**Files:**
- Create: `OWNERSHIP.md`

- [ ] **Step 1: Write the file**

```markdown
# BashSnippets.xyz — Ownership & Account Registry

Records every external account and service that controls the site.
Update this file whenever credentials, owners, or services change.

---

## Domain

| Field      | Value             |
|------------|-------------------|
| Domain     | bashsnippets.xyz  |
| Registrar  | Namecheap         |
| Auto-renew | TODO: confirm on  |
| Expiry     | TODO              |

---

## Google (GSC / GA4 / AdSense)

| Service         | Account                | Property / ID           |
|-----------------|------------------------|-------------------------|
| Google account  | anguisheh1@gmail.com   | —                       |
| GA4             | anguisheh1@gmail.com   | G-6B01TGE8XS            |
| AdSense         | anguisheh1@gmail.com   | ca-pub-5399156622542127 |
| Search Console  | anguisheh1@gmail.com   | bashsnippets.xyz        |

---

## Bing Webmaster Tools

| Field   | Value              |
|---------|--------------------|
| Account | TODO               |
| Site    | bashsnippets.xyz   |

---

## Vercel

| Field          | Value                      |
|----------------|----------------------------|
| User           | anguishe                   |
| Project        | bashsnippets-next          |
| Repo           | anguishe/bashsnippets-next |
| Deploy trigger | Push to main branch        |

---

## Gumroad

| Field   | Value  |
|---------|--------|
| Account | TODO   |
| Product | TODO   |

---

## Recovery & Emergency Access

| Resource           | Value                  |
|--------------------|------------------------|
| Primary email      | anguisheh1@gmail.com   |
| Recovery email     | TODO                   |
| 2FA backup codes   | TODO: store offline    |
```

---

### Task 4: Verify no .html in sitemap or internal links; check redirect chains

- [ ] **Step 1: Check sitemap**

```bash
grep -c '\.html' public/sitemap.xml && echo "FAIL: .html URLs found in sitemap" || echo "PASS: no .html in sitemap"
```
Expected: `PASS`

- [ ] **Step 2: Check internal links in source**

```bash
grep -rn 'href="[^"]*\.html"' src/ --include="*.tsx" --include="*.ts" --include="*.mdx" || echo "PASS: no .html hrefs in src/"
```
Expected: no matches.

- [ ] **Step 3: Curl 3 redirect samples — expect single 308 + 200**

```bash
for url in \
  "https://bashsnippets.xyz/snippets/disk-space-warning.html" \
  "https://bashsnippets.xyz/tools/cron-job-builder.html" \
  "https://bashsnippets.xyz/snippets/bash-error-handling.html"; do
  echo "--- $url ---"
  curl -sIL --max-redirs 3 "$url" | grep -E '^HTTP|^location'
done
```
Expected pattern per URL: `HTTP/2 308` → `location: .../clean-slug` → `HTTP/2 200`

---

### Task 5: Full build — report exit code, page count, first-load JS

- [ ] **Step 1: Run build**

```bash
npm run build 2>&1 | tee /tmp/build-output.txt; echo "Exit code: $?"
```

- [ ] **Step 2: Extract route count and snippet JS size**

```bash
grep -c '○\|●\|ƒ' /tmp/build-output.txt || grep -c 'Page ' /tmp/build-output.txt
grep 'disk-space-warning\|first load' /tmp/build-output.txt | tail -5
```

Report: build exit code, total route count, first-load JS for a snippet page.

---

### Task 6: Deploy plan (enter plan mode for approval)

Proposed commit grouping (each group = one `git add` + `git commit`):

1. `fix(seo): allow AI crawlers, correct tool count, fix /guides title, align sameAs + HowTo`
2. `feat(nav): complete nav/footer, close internal-link loop, real 404, skip link; remove dead files`
3. `feat(analytics): consent-gated affiliate/tool/toolkit events; flag-disable ad units for review`
4. `content(snippets): add 5 Quick Answers, de-dup compatibility lines, add source links`
5. `content(snippets): humanize + de-template 13 snippets (consequence-first, first-person)`
6. `fix(content): remove replacement-character artifacts + orphaned in-body affiliate CTAs`
7. `chore: harden sitemap generator, refresh CLAUDE.md, add OWNERSHIP.md`

On approval, stage each group with `git add -p` (or targeted `git add <files>`) and commit, then `git push origin main`.

---

## Post-deploy

```bash
# IndexNow ping for all changed pages
curl -X POST "https://yandex.com/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "bashsnippets.xyz",
    "key": "a7fae2a4e86d4822ab3f636599173c8f",
    "urlList": [
      "https://bashsnippets.xyz/",
      "https://bashsnippets.xyz/snippets",
      "https://bashsnippets.xyz/tools"
    ]
  }'
```
