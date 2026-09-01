---
name: bashsnippets-content-standards
description: Content scaffolding and quality enforcement for BashSnippets.xyz. Activates when creating new snippet pages, new tool pages, or auditing existing MDX/TSX content for voice, completeness, schema, and monetization compliance. Use /snippet-new, /tool-new, or /content-check.
---

# BashSnippets Content Standards Skill

Activates for: new MDX content, new tool pages, content audits.

---

## SNIPPET PAGE — REQUIRED SECTIONS IN ORDER

Every snippet MDX file at `src/content/snippets/[slug].mdx` must contain:

```
1.  Front matter (see template below)
2.  Quick Answer block — 134–167 words, self-contained, above the fold
3.  "What Problem This Solves" — 1–2 paragraphs, consequence-first
4.  Complete bash script — copy-paste ready, inside <CodeBlock>
5.  Prerequisites — what the user needs (bash version, packages)
6.  Line-by-line breakdown — each non-obvious line + WHY it exists
7.  How to Run It — chmod command, execution, expected terminal output
8.  Cron scheduling example — if the script is automatable
9.  Tested on — Ubuntu 22.04 LTS, Fedora 39, macOS Ventura (minimum 2 distros)
10. FAQ section — 3–5 real questions (not filler)
11. Related snippets — 3 minimum, using relatedSlugs from front matter

NOTE: there is NO affiliate box and NO ad slot. Both were removed site-wide on
2026-09-01 (commit 1a2cf79) and must not be re-added. The toolkit CTA is placed by
the detail LAYOUT, never per-MDX-file — you do not add it here.
```

---

## MDX FRONT MATTER TEMPLATE

```mdx
---
title: "Disk Space Warning Script in Bash"
description: "Copy a disk space warning bash script using df, thresholds, and cron. Prevent full drives before they crash your Linux server."
slug: "disk-space-warning"
datePublished: "2026-05-01"
dateModified: "2026-06-01"
difficulty: "beginner"
tags: ["monitor", "cron-ready", "df", "disk"]
testedOn: ["Ubuntu 22.04 LTS", "Fedora 39", "macOS Ventura"]
quickAnswer: "The df command reports disk partition usage as a percentage. This script extracts that percentage, compares it against a configurable threshold (default 80%), and echoes a warning if the threshold is exceeded. Running it every hour via cron catches disk problems before they take down your server. No external packages required — df ships with every Linux distribution and macOS."
relatedSlugs: ["automated-file-backup", "quick-system-info-report", "delete-old-log-files"]
faq:
  - question: "How do I change the disk warning threshold?"
    answer: "Edit the THRESHOLD variable at the top of the script, or pass it as an argument: ./disk-space-warning.sh 90 to warn at 90% usage instead of the default 80%."
  - question: "Will this script work on macOS?"
    answer: "Yes. The df -h command and awk parsing used in this script work on macOS Ventura and later. Tested on macOS Ventura 13.x."
  - question: "How do I get email alerts instead of just echo output?"
    answer: "Replace the echo warning line with: echo 'Disk at ${USAGE}%' | mail -s 'Disk Alert' you@example.com — requires mailutils installed (apt install mailutils on Ubuntu)."
---
```

**Front matter rules:**
- `description`: 150–160 chars, starts with a verb or consequence
- `quickAnswer`: 134–167 words, self-contained, uses the exact search query phrase
- `faq`: real questions with real answers — the answer must be complete standalone text
- `difficulty`: lowercase `beginner` | `intermediate` | `expert`
- `tags`: lowercase, hyphenated, max 5

---

## BASH SCRIPT CODE STANDARD

Every script shown on the site:

```bash
#!/bin/bash
# Script: disk-space-warning.sh
# Purpose: Alert when disk usage exceeds a threshold — prevent full-disk crashes
# Usage: ./disk-space-warning.sh [THRESHOLD_%]  (default: 80)
# Tested: Ubuntu 22.04 LTS, Fedora 39, macOS Ventura
set -euo pipefail

# ── CONFIGURATION ──────────────────────────────────────────────
THRESHOLD="${1:-80}"            # Usage % that triggers the alert (override via arg)
LOG_FILE="/var/log/disk-check.log"  # Append alerts here for cron job history

# ── CONSTANTS ──────────────────────────────────────────────────
CHECK="✓"
CROSS="✗"

# ── MAIN ───────────────────────────────────────────────────────
# df -h / → human-readable output for root partition
# awk NR==2 → skip header row, grab line 2
# tr -d '%' → strip the percent sign so bash can compare as integer
USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')

if [ "$USAGE" -ge "$THRESHOLD" ]; then
  echo "$CROSS Disk at ${USAGE}% — threshold is ${THRESHOLD}%"
  echo "$(date '+%Y-%m-%d %H:%M'): ALERT disk=${USAGE}% threshold=${THRESHOLD}%" >> "$LOG_FILE"
  exit 1
fi

echo "$CHECK Disk at ${USAGE}% — within ${THRESHOLD}% threshold"
```

**Mandatory rules:**
- `set -euo pipefail` — line 4 or 5, always
- `CHECK="✓"` and `CROSS="✗"` — defined before first use, never skip
- Header comment block: Script, Purpose (consequence prevented), Usage, Tested
- Configuration section at top — all thresholds/paths as named variables
- Never magic numbers inline — use named variables
- Comments explain WHY, not WHAT the line is
- `exit 1` on error conditions

---

## TOOLS ARCHITECTURE (read before adding new tools)

Tools are native React client components rendered by `ToolRenderer.tsx`, which
dispatches by slug via `next/dynamic`. (`ToolEmbed.tsx` and `public/tool-content/`
are the OLD iframe path — still present, no longer used. Do not add tools there.)

**When adding a new tool:**

1. Create: `src/components/tools/<Component>.tsx`
   - A client component; shared helpers live in `src/components/tools/shared/`
     (`useClipboard.ts`, `bashHighlight.ts`, `shellcheckData.ts`)
   - Register it by slug in the `toolComponents` map in `ToolRenderer.tsx`

2. Register: Add to `src/lib/tools.ts`
   ```ts
   {
     slug: 'bash-string-builder',
     name: 'Bash String Manipulation Builder',
     description: 'Build and test string operations interactively.',
     category: 'builder',
     file: 'bash-string-builder.html',
   }
   ```

3. The route at `src/app/tools/[slug]/page.tsx` picks it up automatically via the registry.
   Confirm by reading the existing `[slug]/page.tsx` before assuming.

---

## MONETIZATION — ONE PRODUCT, NOTHING ELSE

**Do not add ads or affiliate links.** `AffiliateBox.tsx` and `AdSlot.tsx` were
deleted on 2026-09-01 along with all 22 and 4 of their call sites, `public/ads.txt`,
and every ad/affiliate clause in `/privacy` and `/terms`. Writing `<AffiliateBox …>`
into an MDX file now breaks the build.

The only commercial surface is the Production Bash Toolkit:

- `ToolkitCTA` — registered in `MDXComponents.tsx` and placed by the three detail
  layouts (snippets, tools, guides). **Never insert it per-MDX-file.**
- In-content prose links to `/starter-kit`, where they genuinely fit the topic.
- `EmailCapture` — Buttondown, on the same three layouts.

See `CLAUDE.md → Monetization` and `docs/INDEXING-AUDIT-2026-09-01.md`.

---

## SLASH COMMAND: /snippet-new <name>

When this runs, ask these questions BEFORE generating anything:

1. What exact search query should this page rank for? (phrase, not topic)
2. What breaks or fails if someone doesn't have this script? (the consequence)
3. What commands/tools does the script primarily use?
4. Difficulty: beginner / intermediate / expert?
5. Is it cron-schedulable? (yes/no)
6. Which existing snippets are most related? (check src/content/snippets/)

Then generate in this order:
1. Complete MDX front matter (all required fields)
2. Full bash script (following code standard above)
3. All 13 required content sections
4. Confirmation of where to save the file

Do NOT generate the page.tsx — the dynamic route at `src/app/snippets/[slug]/page.tsx`
handles all snippets automatically via the MDX registry.

## SLASH COMMAND: /tool-new <name>

Ask before generating:
1. What problem is a user experiencing RIGHT NOW when they need this tool?
2. What is the input? What is the output?
3. Does it build something (cron expression, script) or look something up (exit code)?
4. Which existing snippets should it link back to?

Then generate:
1. `src/components/tools/<Component>.tsx` — client component
2. Registry entry for `src/lib/tools.ts`, plus the `toolComponents` map in `ToolRenderer.tsx`
3. Confirmation of file locations

## SLASH COMMAND: /content-check <file>

Read the file and audit against this checklist. Output PASS/FAIL per item with file:line.

```
CONTENT AUDIT — [FILE]
=======================
Structure
[ ] Quick Answer block present (134–167 words)
[ ] "What Problem This Solves" present
[ ] Complete script in code block
[ ] Prerequisites listed
[ ] Line-by-line breakdown present
[ ] How to Run section present
[ ] Cron example present (if applicable from front matter difficulty)
[ ] Tested on section present (min 2 platforms)
[ ] FAQ present (3+ questions)
[ ] Related snippets present (3+)

Voice & Quality
[ ] No "simply", "just", "easy", "straightforward"
[ ] Consequence-first framing in intro
[ ] FAQ answers are complete standalone text
[ ] Script has set -euo pipefail
[ ] Script has CHECK/CROSS variables

Monetization
[ ] NO <AffiliateBox> anywhere (FAIL if present — removed site-wide 2026-09-01)
[ ] NO <AdSlot> anywhere (FAIL if present)
[ ] ToolkitCTA NOT hand-placed in the MDX (the layout does it)

SEO / AEO
[ ] Front matter has all required fields
[ ] quickAnswer is 134–167 words
[ ] H2 headings are question-format
[ ] faq array matches visible FAQ content
```

---

## GUIDES ARE NOT SNIPPETS

The required-sections checklist above is for `src/content/snippets/*.mdx`. Guides at
`src/content/guides/*.mdx` do not use Quick Answer, Prerequisites, How to Run, Tested
On, or a `faq` array, and `/content-check` should not fail them for it.

A guide is prose that answers an operational failure question, with code in service of
the argument. What still applies: the voice rules, the bash code standard for any full
script shown, consequence-first framing, and the monetization rules.

Guide front matter is only: `title`, `description`, `slug`, `author`, `datePublished`,
`dateModified`.

Each guide also needs a wrapper at `src/app/guides/<slug>/page.tsx` (metadata,
TechArticle + BreadcrumbList JSON-LD, MDX loader) and an entry in the hardcoded
`guides` array in `src/app/guides/page.tsx`. `src/app/guides/layout.tsx` supplies the
toolkit CTA and email capture to every guide — do not add them per-file.

**Why guides matter disproportionately:** on 2026-09-01 Bing AI Performance attributed
53 of 103 Copilot citations to two guides, versus 2–8 each for snippets. Guides earn
roughly 7x a snippet on the citation channel.
