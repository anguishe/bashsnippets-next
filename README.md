# bashsnippets-next

Source for **[bashsnippets.xyz](https://bashsnippets.xyz)** — a free library of tested, copy-paste
bash scripts for Linux servers and cron jobs, with interactive command builders and long-form
guides. Every script is explained line-by-line on the site and mirrored, ShellCheck-clean, in the
public repo [anguishe/bashsnippets](https://github.com/anguishe/bashsnippets).

- **38** snippets · **12** interactive tools · **7** guides · one paid product (the
  [Production Bash Toolkit](https://bashsnippets.xyz/starter-kit), $9 on Gumroad)
- No ads, no affiliates. Removed 2026-09-01 and not coming back.
- Author: Travis (handle *Anguishe*). Voice is consequence-first, senior sysadmin to competent junior.

## Stack

Next.js 15 (App Router) · React 18 · TypeScript · Tailwind CSS 3 · MDX via `@next/mdx` ·
npm · Vercel (auto-deploys `main`) · GA4 · Buttondown for email capture.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # next build, then scripts/generate-sitemap.mjs writes public/sitemap.xml
npm run lint       # next lint
npm run start      # serve the production build
npm run indexnow   # submit the sitemap (or URL args) to IndexNow after every deploy
```

There is no test suite. `npm run build` is the gate — TypeScript errors surface there.

## Where things live

| Path | What |
|---|---|
| `src/content/snippets/*.mdx` + `src/lib/snippets.ts` | snippet bodies + registry (both required; slug must match) |
| `src/lib/tools.ts` + `src/components/tools/` + `ToolRenderer.tsx` | tool registry, components, slug dispatch |
| `src/content/guides/*.mdx` + `src/app/guides/<slug>/page.tsx` | guide bodies + per-guide page shells (no registry; `guides/page.tsx` holds the index array; `generate-sitemap.mjs` hardcodes guide URLs) |
| `src/app/guides/layout.tsx` and the snippet/tool `[slug]/page.tsx` | the three places `ToolkitCTA` and `EmailCapture` are placed — never per MDX file |
| `public/llms.txt` | hand-maintained AI-crawler index; update it with every new page |
| `scripts/` | sitemap generator, IndexNow submitter |

## Docs

| Read | For |
|---|---|
| `docs/PLAN.md` | **start here** — where the project is, what is next, measured baselines, dates to hold |
| `CLAUDE.md` | architecture, content pipelines, brand and voice rules, SEO requirements (the spec) |
| `CONTRIBUTING.md` | the practical workflow for adding a snippet, tool or guide |
| `OWNERSHIP.md` | every external account and service that controls the site |
| `docs/MANUAL-ACTIONS-2026-09-01.md` | human-only steps (console logins, judgment calls) with exact instructions |
| `docs/INDEXING-AUDIT-2026-09-01.md` | the current evidence base for the indexing strategy |
| `docs/CROSS-POST-BACKLOG.md`, `docs/cross-posts/` | shelved cross-posting queue and drafts |
| `docs/archive/` | superseded audits and plans, kept for history — do not act on them |

## License

Scripts published on the site and in the companion repo are MIT. Site code and prose are
© Travis / BashSnippets.
