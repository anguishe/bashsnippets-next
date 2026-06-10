# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**BashSnippets.xyz** — a free bash script library and interactive tools site targeting Linux developers, sysadmins, and DevOps engineers. Monetized via AdSense, DigitalOcean and Namecheap affiliates, and a planned Gumroad product. Traffic goal: Mediavine Journey qualification (10k sessions/mo).

- **Live site:** https://bashsnippets.xyz
- **Repo:** anguishe/bashsnippets-next
- **Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, MDX (via @next/mdx)
- **Hosting:** Vercel (auto-deploys on push to main)
- **Analytics:** GA4 G-6B01TGE8XS | AdSense ca-pub-5399156622542127

---

## Commands

```bash
npm run dev        # local dev server
npm run build      # production build + static export (no postbuild; sitemap is native app/sitemap.ts)
npm run start      # serve production build locally
npm run lint       # eslint via next lint
```

No test suite exists. Verify changes with `npm run build` — TypeScript errors surface here.

---

## Architecture

### Content: Snippets

Each snippet requires **two things**:

1. An MDX file at `src/content/snippets/<slug>.mdx`
2. A registry entry in `src/lib/snippets.ts` (slug, title, description, tags, difficulty, dates)

The `[slug]/page.tsx` route dynamically imports MDX at request time:
```ts
const mod = await import(`@/content/snippets/${slug}.mdx`);
```
`generateStaticParams` uses `getAllSlugs()` from the registry, so **a slug missing from the registry will 404 even if the MDX file exists**.

### Content: Tools

Each tool requires **three things**:

1. A standalone HTML file at `public/tool-content/<slug>.html`
2. A registry entry in `src/lib/tools.ts`
3. A route page at `src/app/tools/[slug]/page.tsx` that renders `<ToolEmbed slug={slug} />`

Tools are served as iframes via `ToolEmbed.tsx` — do **not** convert tools to React components unless explicitly asked.

### MDX Pipeline

`next.config.ts` configures MDX with `remark-gfm`, `rehype-slug` (auto-IDs on headings), and `rehype-highlight` (syntax highlighting via highlight.js). Custom MDX components (CodeBlock with copy button, Callout, etc.) are registered in `MDXComponents.tsx` and passed as `components` to the dynamic import.

### Affiliate Links

Affiliate URLs are **hardcoded constants in `AffiliateBox.tsx`**, not a separate lib file:

- DigitalOcean: `https://m.do.co/c/7a196437764c`
- Namecheap: `https://namecheap.pxf.io/c/7260430/1632743/5618`

Update `AffiliateBox.tsx` if these ever change. Use `<AffiliateBox partner="digitalocean" />` or `partner="namecheap"` — never inline raw affiliate URLs elsewhere.

---

## Karpathy Rules

### Rule 1: Surface Assumptions First
Before writing a single line of code, explicitly state every assumption. If uncertain about file structure, data shape, or intent — ask. Do not silently pick an interpretation and run with it.

### Rule 2: Minimum Viable Change
Make the smallest surgical edit that satisfies the goal. Do not refactor adjacent code, rename variables, or clean up things not asked about.

### Rule 3: No Orthogonal Changes
Do not modify code outside the explicit scope. If something broken is spotted but out of scope — flag it in a note, do not fix it.

### Rule 4: Verify Before Done
After every change, state exactly what changed and what the expected result is. Run `npm run build` and report the result.

---

## Brand Constants — Never Change Without Explicit Instruction

```css
--bg:         #0d1117;   /* page background */
--bg2:        #161b22;   /* cards, panels, nav */
--bg3:        #1c2128;   /* code blocks, inputs */
--border:     #30363d;   /* all borders */
--green:      #39d353;   /* primary accent */
--green-dim:  #1a4a2e;   /* green callout backgrounds */
--amber:      #e3b341;   /* warnings */
--blue:       #58a6ff;   /* links, info callouts */
--blue-dim:   #0d2a4a;   /* blue callout backgrounds */
--muted:      #8b949e;   /* subtext, comments */
--text:       #e6edf3;   /* primary body text */
--radius:     8px;
```

**Fonts:**
- `IBM Plex Mono` — code, labels, tags, CLI output (weights 400, 600)
- `Syne` — ALL headings h1–h4 (weights 400, 700, 800)
- System sans-serif — body paragraphs only

---

## Bash Script Code Standard

Every bash script shown on the site must follow this exact format:

```bash
#!/bin/bash
# Script: descriptive-name.sh
# Purpose: One sentence on WHAT BREAKS without this script
# Usage: ./script.sh [args]
set -euo pipefail

CHECK="✓"
CROSS="✗"
```

- `set -euo pipefail` always on line 4 or 5
- `CHECK` and `CROSS` always defined before use
- Comments explain WHY a line exists, not WHAT it does
- Named variables for all thresholds/paths — no magic numbers

---

## Content Voice

- Consequence-first: lead with what breaks, then show the fix
- Never use: "simply", "just", "easy", "straightforward", "in this tutorial we will"
- Tone: senior sysadmin explaining to a competent junior
- FAQ questions must be real questions real users ask — not filler

---

## Never Do — AI Slop Prevention

### Design
- Inter, Roboto, Arial, Space Grotesk as heading fonts
- Purple, violet, or lavender anywhere
- Light/white backgrounds (dark-only site)
- Emoji as icons or section markers
- Gradient text on headings
- Cards without visible border (shadow-only)
- Missing hover states on interactive elements
- Missing copy button on any code block

### Code
- Inline styles instead of Tailwind classes
- New component for something a Tailwind class handles
- `<link>` tags for Google Fonts — use `next/font/google`
- `any` TypeScript type without an explanatory comment
- `console.log` left in production code

### Content
- Generic tutorial-style intros
- FAQ questions that nobody would actually search
- Schema markup that doesn't match visible page content
- SpecialAnnouncement schema (retired July 2025)

---

## SEO Requirements — Every Page

1. `generateMetadata()` export: title, description, canonical, og:image, og:type, twitter:card
2. JSON-LD `<script type="application/ld+json">` block
3. Breadcrumb component with BreadcrumbList schema
4. Quick Answer block on all snippet/tool pages (134–167 words, self-contained)
5. Question-format H2 headings on content pages
6. FAQ section on snippet/tool pages (visible accordion + FAQPage JSON-LD)

**FAQPage schema:** YES — emitted on all snippet/tool pages. Intentional. Kept for AI/LLM passage-level citability (Perplexity, ChatGPT, Claude) even though Google deprecated it for visual rich results in 2023.

**Schema types by page:**

| Page | Required Schema |
|---|---|
| Homepage | WebSite + Organization |
| Snippet | TechArticle + BreadcrumbList + FAQPage |
| Tool | WebApplication + BreadcrumbList + FAQPage |
| Index pages | CollectionPage + BreadcrumbList |
| About | WebPage + Person + BreadcrumbList |

---

## Post-Deploy Checklist

After every push with new pages:
1. Verify build: `npm run build`
2. Submit to IndexNow:
```bash
curl -X POST "https://yandex.com/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "bashsnippets.xyz",
    "key": "a7fae2a4e86d4822ab3f636599173c8f",
    "urlList": ["https://bashsnippets.xyz/snippets/NEW-SLUG"]
  }'
```
3. Update `public/llms.txt` with new page entries
4. Verify in Google Search Console URL Inspection

---

## Available Slash Commands

| Command | What It Does |
|---|---|
| `/design-audit` | Scans all components for AI slop, outputs punch list with file:line refs |
| `/design-rebuild <component>` | Rebuilds one component with brand DNA, shows before/after |
| `/seo-audit <file>` | Full SEO/AEO/GEO audit of a specific page file |
| `/seo-schema <type>` | Generates complete JSON-LD for snippet/tool/homepage |
| `/snippet-new <name>` | Scaffolds complete MDX + page.tsx + schema for new snippet |
| `/tool-new <name>` | Scaffolds new tool page + registry entry |
| `/content-check <file>` | Audits content vs. voice, schema, affiliate, AEO rules |
