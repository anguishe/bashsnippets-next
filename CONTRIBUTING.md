# Contributing to BashSnippets.xyz

This guide explains how to add new bash snippets and interactive tools to the site. You do not need to be a React expert — follow the templates and checklists below.

**Templates live in `src/templates/`:**

| File | Purpose |
| --- | --- |
| `SNIPPET_TEMPLATE.mdx` | Full MDX page with frontmatter comments |
| `SNIPPET_REGISTRY_ENTRY.ts` | Copy-paste block for `src/lib/snippets.ts` |
| `TOOL_COMPONENT_TEMPLATE.tsx` | React tool UI skeleton |
| `TOOL_REGISTRY_ENTRY.ts` | Copy-paste block for `src/lib/tools.ts` |

---

## How to Add a New Snippet

A snippet needs **two files**: the MDX content and a registry entry.

### Step 1: Copy the MDX template

1. Copy `src/templates/SNIPPET_TEMPLATE.mdx` to `src/content/snippets/your-snippet-slug.mdx`
2. Replace every placeholder (`your-snippet-slug`, script names, thresholds, FAQ text)
3. Read the `#` comments in the frontmatter — each field explains what to write

**Required content (in order):**

1. Frontmatter with all fields filled in
2. Consequence-first intro — what breaks without the script
3. Complete copy-paste bash script (`set -euo pipefail`, `CHECK`/`CROSS` variables)
4. Plain-English explanation before or after the code
5. Numbered setup steps
6. Cron example (if the script can be scheduled)
7. Tested on section (minimum 2 distros)
8. FAQ section (3+ real questions — must match frontmatter `faq`)
9. `<AffiliateBox partner="digitalocean" />` (required on every snippet)

### Step 2: Add the registry entry

1. Open `src/lib/snippets.ts`
2. Copy the object from `src/templates/SNIPPET_REGISTRY_ENTRY.ts`
3. Paste it into the `snippets` array (keep alphabetical or chronological order — match nearby entries)
4. Make sure `slug` matches your MDX filename exactly

**Important:** If the MDX file exists but the slug is missing from the registry, the page will **404**.

### Step 3: Build and preview

```bash
npm run dev
```

Open `http://localhost:3000/snippets/your-snippet-slug` and check:

- Title, description, and Quick Answer render correctly
- Code block has a copy button
- FAQ appears at the bottom
- No TypeScript errors in the terminal

---

## How to Add a New Tool

A tool needs **three changes**: a React component, a registry entry, and a renderer mapping.

### Step 1: Create the React component

1. Copy `src/templates/TOOL_COMPONENT_TEMPLATE.tsx` to `src/components/tools/YourToolName.tsx`
2. Rename the default export function to match your tool (PascalCase)
3. Replace placeholder input/output logic with your tool's behavior
4. Keep the brand layout: input panel on the left, output on the right, green action button, copy button on output

Shared utilities you can reuse:

- `@/components/CopyButton` — copy affordance on code output
- `@/components/tools/shared/useClipboard` — clipboard state hook
- `@/components/tools/shared/bashHighlight` — syntax highlighting for bash output

### Step 2: Register in ToolRenderer

Open `src/components/tools/ToolRenderer.tsx` and add a line inside `toolComponents`:

```ts
'your-tool-slug': withSkeleton(() => import('@/components/tools/YourToolName')),
```

The key (`your-tool-slug`) must match the slug in `src/lib/tools.ts`.

### Step 3: Add the registry entry

1. Open `src/lib/tools.ts`
2. Copy the object from `src/templates/TOOL_REGISTRY_ENTRY.ts`
3. Paste it into the `tools` array
4. Set `component` to the exact filename (without `.tsx`)

The tool page at `/tools/[slug]` is generated automatically — you do not create a new route file.

### Step 4: Build and preview

```bash
npm run dev
```

Open `http://localhost:3000/tools/your-tool-slug` and test every input, button, and copy action.

---

## Brand Rules

### Colors (dark theme only — never use light backgrounds)

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#0d1117` | Page background |
| `--bg2` | `#161b22` | Cards, panels, nav |
| `--bg3` | `#1c2128` | Code blocks, inputs |
| `--border` | `#30363d` | All borders |
| `--green` | `#39d353` | Primary accent, action buttons |
| `--amber` | `#e3b341` | Warnings |
| `--blue` | `#58a6ff` | Links, info callouts |
| `--muted` | `#8b949e` | Secondary text |
| `--text` | `#e6edf3` | Body text |

Use Tailwind classes where they exist (`bg-bg`, `text-green`, `border-border`, etc.) instead of hardcoding hex values in new components.

### Fonts

- **Syne** — all headings (h1–h4)
- **IBM Plex Mono** — code, labels, tags, CLI output
- System sans-serif — body paragraphs only

### Voice

- Lead with what **breaks** if the reader does not have this script or tool
- Write like a senior sysadmin explaining to a competent junior
- Never use: "simply", "just", "easy", "straightforward", "in this tutorial we will"
- FAQ questions must be real searches — not filler

### Design — do not use

- Inter, Roboto, Arial, or Space Grotesk as heading fonts
- Purple or lavender anywhere
- Emoji as section icons
- Cards with shadow but no visible border
- Code blocks without a copy button

---

## Testing Before You Push

Run these commands locally:

```bash
npm run dev      # preview in browser while editing
npm run build    # catches TypeScript and MDX errors (required before pushing)
npm run lint     # ESLint check
```

If `npm run build` fails, fix the errors before opening a pull request. There is no automated test suite — the build is the gate.

---

## Sitemap and Indexing

### Sitemap (automatic)

The sitemap at `https://bashsnippets.xyz/sitemap.xml` is generated from the registries in `src/app/sitemap.ts`. When you add a slug to `src/lib/snippets.ts` or `src/lib/tools.ts`, the new URL is included automatically on the next deploy. **You do not edit sitemap XML by hand.**

### After deploying new pages

1. Confirm the build passed on Vercel
2. Submit the new URL to IndexNow:

```bash
curl -X POST "https://yandex.com/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "bashsnippets.xyz",
    "key": "a7fae2a4e86d4822ab3f636599173c8f",
    "urlList": ["https://bashsnippets.xyz/snippets/YOUR-SLUG"]
  }'
```

Replace the URL with your new snippet or tool path.

3. Add the new page to `public/llms.txt`
4. Inspect the URL in Google Search Console (optional but recommended)

---

## Quick Checklist

**New snippet:**

- [ ] `src/content/snippets/[slug].mdx` created from template
- [ ] Entry added to `src/lib/snippets.ts`
- [ ] Slugs match everywhere
- [ ] `npm run build` passes
- [ ] FAQ in frontmatter matches visible FAQ section
- [ ] DigitalOcean AffiliateBox present

**New tool:**

- [ ] `src/components/tools/[Name].tsx` created from template
- [ ] Slug mapped in `ToolRenderer.tsx`
- [ ] Entry added to `src/lib/tools.ts`
- [ ] `npm run build` passes
- [ ] Copy button works on output
