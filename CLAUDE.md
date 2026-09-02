# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**BashSnippets.xyz** — a free bash script library and interactive tools site targeting Linux developers, sysadmins, and DevOps engineers. Monetized by **one owned product**: the Production Bash Toolkit on Gumroad. No ads, no affiliates — both were removed on 2026-09-01 (see `docs/INDEXING-AUDIT-2026-09-01.md`). Revenue goal: paid conversions from the toolkit CTA, tracked in GA4 as `toolkit_cta_view` / `toolkit_cta_click` / `toolkit_purchase_click`.

- **Live site:** https://bashsnippets.xyz
- **Repo:** anguishe/bashsnippets-next
- **Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, MDX (via @next/mdx)
- **Hosting:** Vercel (auto-deploys on push to main)
- **Analytics:** GA4 G-6B01TGE8XS (no AdSense — the account and loader are gone)

---

## Commands

```bash
npm run dev        # local dev server
npm run build      # production build; sitemap written to public/sitemap.xml by scripts/generate-sitemap.mjs
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

### Content: Guides

Guides live at `/guides/<slug>`. Each guide is **its own static `page.tsx`** at `src/app/guides/<slug>/page.tsx` — there is no dynamic routing. The `page.tsx` holds metadata, JSON-LD and the page shell; **the prose is MDX at `src/content/guides/<slug>.mdx`**, rendered through `mdxComponents`. The index at `src/app/guides/page.tsx` maintains a hardcoded array of guide metadata.

`src/app/guides/layout.tsx` wraps the index and all **7** guides — it is the only single-edit reach across every guide, since there is no dynamic route. The toolkit CTA and email capture live there.

**One exception:** `bash-scripts-every-sysadmin-needs` has **no MDX file**. It is still 1254 lines of JSX inside its own `page.tsx`, with four components (`C`, `CodeBlock`, `SectionDivider`, `ScriptEntry`) defined locally in that file. Migrating it is parked deliberately — see `docs/MANUAL-ACTIONS-2026-09-01.md` §2.2. It still inherits the layout, so it has the CTA and email capture like every other guide.

To add a new guide — **all four steps, the fourth is easy to miss**:
1. Create `src/content/guides/<slug>.mdx` with the prose
2. Create `src/app/guides/<slug>/page.tsx` with `metadata`, schema JSON-LD, and the MDX loader
3. Add the guide's metadata to the `guides` array in `src/app/guides/page.tsx`
4. **Add a line to `scripts/generate-sitemap.mjs`.** Snippets and tools are generated from their registries; **guide URLs are a hardcoded list**. Skip this and the guide builds, renders and links correctly while being silently absent from `sitemap.xml`. Then update `public/llms.txt` and its guide count.

### Content: Snippet Category Pages

**Removed 2026-07-18.** The four thin category pages (`backup-and-recovery`, `disk-management`,
`linux-security`, `server-monitoring`) were consolidated into `/snippets` and 301'd in
`next.config.ts`. Do not recreate them.

### Content: Tools

Each tool requires:

1. A registry entry in `src/lib/tools.ts`
2. A React component in `src/components/tools/<Component>.tsx`, registered by slug in the `toolComponents` map in `ToolRenderer.tsx`
3. No per-tool route file — the shared `src/app/tools/[slug]/page.tsx` renders `<ToolRenderer slug={slug} />` and dispatches by slug

All tools are native React client components rendered by `ToolRenderer` via `next/dynamic` with a skeleton loader. Tool components share utilities from `src/components/tools/shared/` (`useClipboard.ts`, `bashHighlight.ts`, `shellcheckData.ts`). `ToolEmbed.tsx` (iframe path) still exists but is not used by `ToolRenderer`.

### MDX Pipeline

`next.config.ts` configures MDX with `remark-gfm`, `rehype-slug` (auto-IDs on headings), and `rehype-highlight` (syntax highlighting via highlight.js). Custom MDX components (CodeBlock with copy button, Callout, etc.) are registered in `MDXComponents.tsx` and passed as `components` to the dynamic import.

### Snippet Frontmatter Data Flow

`src/lib/mdx-frontmatter.ts` provides `loadSnippetFrontmatter(slug)`, which reads YAML frontmatter from an MDX file at build time via `gray-matter`. Fields available in frontmatter: `title`, `description`, `tags`, `quickAnswer`, `faq` (array of `{question, answer}`), `howToSteps` (array of `{name, text}`), `author`, `datePublished`, `dateModified`. These fields are optional — if present in frontmatter, the snippet registry can call `loadSnippetFrontmatter` and merge them. FAQ and HowTo data can therefore live in the MDX file rather than in the registry.

### Scaffold Templates

`src/templates/` contains reference templates — do not import them at runtime:
- `SNIPPET_REGISTRY_ENTRY.ts` — copy the object into `src/lib/snippets.ts`
- `SNIPPET_TEMPLATE.mdx` — starting point for a new MDX file
- `TOOL_REGISTRY_ENTRY.ts` — copy the object into `src/lib/tools.ts`
- `TOOL_COMPONENT_TEMPLATE.tsx` — starting point for a new tool component

### Monetization — one product, nothing else

**Do not add ads or affiliate links to this site.** Removed 2026-09-01: `AffiliateBox.tsx` (22 call sites), `AdSlot.tsx` (4 call sites), `public/ads.txt`, and every ad/affiliate clause in `/privacy` and `/terms`. Consent Mode keeps `ad_storage` / `ad_user_data` / `ad_personalization` **denied on every path** — the keys stay present because Consent Mode v2 requires them, not because ads may come back.

**The price is $9 and stays $9** (Travis, 2026-09-01). A proposal to move it to $29 with a $79 team tier was killed: Gumroad has recorded exactly one order ever — $0.00, Travis, a self-purchase to test checkout — so there has never been a paying customer at any price, and there is no conversion rate for a price change to move. The constraint is demand, not price. Do not reopen without Travis raising it.

The only commercial surface is the Production Bash Toolkit:

- `ToolkitCTA` — registered in `MDXComponents.tsx`, placed by the three detail layouts (snippets, tools, guides). Never insert it per-MDX-file.
- In-content prose links to `/starter-kit` — 14 content files.
- `EmailCapture` — Buttondown, renders `null` unless `NEXT_PUBLIC_BUTTONDOWN_USERNAME` is set.

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
| Guide | TechArticle + BreadcrumbList |
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
