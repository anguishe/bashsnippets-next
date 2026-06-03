# BashSnippets.xyz — Claude Code Complete Setup Guide
## Skills Installation, Verification, and First Sessions
### Written for: ~/Projects/bashsnippets-next | Claude Code in Cursor Terminal
### Date: 2026-06-03

---

# WHAT THIS GUIDE COVERS

By the end of this guide you will have:
- Claude Code verified and working in your terminal
- claude-seo plugin verified and its /seo commands confirmed working
- 3 custom BashSnippets skills installed in your repo
- CLAUDE.md installed and confirmed loading on every session
- A verified working first session that proves everything is connected
- A reference for every command available to you going forward

**Estimated time: 20–30 minutes**

---

# PART 1 — UNDERSTANDING HOW CLAUDE CODE READS SKILLS
## (Read this — it prevents confusion later)

Claude Code is a separate program from Cursor. It runs in your terminal as `claude`.
When you start a session with `claude`, it automatically reads instruction files from
two locations:

```
Location 1 — Project-level (your repo):
  ~/Projects/bashsnippets-next/CLAUDE.md          ← Master instructions
  ~/Projects/bashsnippets-next/.claude/skills/*/SKILL.md  ← Specialized skills

Location 2 — Global (your home dir, applies to ALL projects):
  ~/.claude/skills/*/SKILL.md                     ← Where claude-seo installed to
  ~/.claude/agents/*.md                           ← Where claude-seo agents installed
```

**Key point:** Skills are just Markdown files. Claude reads them at the start of
every session. There is no "installing" in the software sense — you are placing text
files in the right directories. That is the entire system.

**How slash commands work:** When a SKILL.md file describes a `/command`, Claude Code
recognizes that syntax and follows the instructions in that skill when you type it.
They are not registered commands — they are behavioral instructions written in Markdown.

---

# PART 2 — VERIFY CLAUDE-SEO IS INSTALLED

You said you already ran the installer. Let's confirm it actually worked.

## Step 1: Check the global skills directory

Open Cursor's integrated terminal:
`Ctrl + `` ` (backtick) on Windows/Linux
`Cmd + `` ` on Mac

Run:
```bash
ls ~/.claude/skills/
```

**Expected output — you should see directories including:**
```
seo
seo-cluster
seo-content
seo-drift
seo-ecommerce
seo-geo
seo-hreflang
seo-images
seo-local
seo-maps
seo-programmatic
seo-schema
seo-sitemap
seo-sxo
seo-technical
... (more seo-* directories)
```

**If you see an empty listing or "No such file or directory":**
The install failed silently. Run this to reinstall:
```bash
cd ~
git clone --depth 1 https://github.com/AgriciDaniel/claude-seo.git
bash claude-seo/install.sh
```
Then re-run `ls ~/.claude/skills/` to confirm.

## Step 2: Confirm the core SKILL.md file exists

```bash
cat ~/.claude/skills/seo/SKILL.md | head -10
```

**Expected output:** First 10 lines of the claude-seo skill file (should show SEO-related instructions)

**If "No such file or directory":** See reinstall step above.

## Step 3: Check Python dependencies installed correctly

```bash
ls ~/.claude/skills/seo/.venv/bin/ 2>/dev/null | head -5
# OR if no venv:
pip show trafilatura 2>/dev/null | head -3
```

**If .venv is missing or pip show returns nothing:**
```bash
pip install --user trafilatura htmldate playwright
python3 -m playwright install chromium
```

## Step 4: Live test — confirm /seo commands work

```bash
cd ~/Projects/bashsnippets-next
claude
```

You are now inside Claude Code. The prompt changes to a `>` or shows Claude Code branding.

Type this and press Enter:
```
/seo page https://bashsnippets.xyz
```

**Expected:** Claude Code starts fetching and analyzing the page. You will see output
like "Analyzing page structure...", "Checking schema markup...", etc.
It takes 60–90 seconds for a single page audit.

When it finishes, type:
```
exit
```

**If /seo gives "command not found" or "I don't have a skill for that":**
The global skill path is not being picked up. Check:
```bash
claude --version   # Confirm Claude Code 1.0.x
ls ~/.claude/      # Should show: skills/ agents/ possibly settings.json
```

If `~/.claude/` exists but skills aren't loading, you may need to restart Claude Code
or check if your version supports global skills.

---

# PART 3 — INSTALL YOUR THREE CUSTOM SKILLS

## Step 1: Create the skills directory in your repo

```bash
cd ~/Projects/bashsnippets-next
mkdir -p .claude/skills/frontend-design
mkdir -p .claude/skills/seo-aeo-geo
mkdir -p .claude/skills/content-standards
```

Verify:
```bash
ls .claude/skills/
```
Expected: `frontend-design  seo-aeo-geo  content-standards`

## Step 2: Install the SKILL.md files

Download the 3 skill files from the guide package, then run:

```bash
# Replace /path/to/downloads/ with wherever you saved the files from this guide
cp /path/to/downloads/SKILL-frontend-design.md \
   ~/Projects/bashsnippets-next/.claude/skills/frontend-design/SKILL.md

cp /path/to/downloads/SKILL-seo-aeo-geo.md \
   ~/Projects/bashsnippets-next/.claude/skills/seo-aeo-geo/SKILL.md

cp /path/to/downloads/SKILL-content-standards.md \
   ~/Projects/bashsnippets-next/.claude/skills/content-standards/SKILL.md
```

**Alternative — create them directly in Cursor:**
In Cursor's file explorer, navigate to `bashsnippets-next/.claude/skills/frontend-design/`.
Create a new file named `SKILL.md`. Paste the contents from the downloaded file.
Repeat for the other two skills.

Verify all three are in place:
```bash
ls .claude/skills/frontend-design/SKILL.md
ls .claude/skills/seo-aeo-geo/SKILL.md
ls .claude/skills/content-standards/SKILL.md
```
Each should return the file path without error.

## Step 3: Install CLAUDE.md at the repo root

```bash
cp /path/to/downloads/CLAUDE.md ~/Projects/bashsnippets-next/CLAUDE.md
```

Or create it in Cursor: new file at repo root, name it `CLAUDE.md`, paste contents.

Verify:
```bash
ls ~/Projects/bashsnippets-next/CLAUDE.md
cat ~/Projects/bashsnippets-next/CLAUDE.md | head -5
```
Expected first line: `# CLAUDE.md — BashSnippets.xyz Master Instruction File`

## Step 4: Final directory structure check

Run this and confirm every path resolves:
```bash
cd ~/Projects/bashsnippets-next
echo "--- Repo root ---"
ls CLAUDE.md
echo "--- Skills ---"
ls .claude/skills/frontend-design/SKILL.md
ls .claude/skills/seo-aeo-geo/SKILL.md
ls .claude/skills/content-standards/SKILL.md
echo "--- All clear ---"
```

Every line should print a file path. If any says "No such file or directory", go back
to Step 2/3 and reinstall that file.

---

# PART 4 — VERIFY EVERYTHING LOADS IN CLAUDE CODE

This is the confirmation test. Do not skip this.

## Step 1: Start Claude Code from your project directory

```bash
cd ~/Projects/bashsnippets-next
claude
```

You are now inside Claude Code. You will see something like:
```
Claude Code v1.x.x
Type /help for commands or start chatting.
>
```

## Step 2: Ask Claude to confirm what it has loaded

Type this exactly:
```
What files have you loaded from this project? List CLAUDE.md and any skills in .claude/skills/.
```

**Expected response:** Claude names CLAUDE.md, and lists the three skill names:
- `bashsnippets-frontend-design`
- `bashsnippets-seo-aeo-geo`
- `bashsnippets-content-standards`

**If Claude says it hasn't loaded CLAUDE.md or doesn't see skills:**
Type this to force it:
```
Please read CLAUDE.md and all files in .claude/skills/ now before we do anything else.
```
Claude will then read them explicitly.

## Step 3: Confirm it knows your repo structure

Type:
```
Based on CLAUDE.md, describe the file structure of this project and where snippet MDX files live.
```

**Expected:** Claude describes `src/content/snippets/*.mdx` correctly.
If it guesses wrong, the CLAUDE.md isn't loading — recheck Step 3 of Part 3.

## Step 4: Exit
```
exit
```

---

# PART 5 — YOUR FIRST REAL SESSIONS

Run these in order. Each is a separate `claude` session.
Start a new session for each task — this keeps context clean and prevents confusion.

## Session 1: SEO Audit of the Live Site

**What this does:** Runs the claude-seo plugin against your live site. Produces a
full audit report as a Markdown file in your project directory.

```bash
cd ~/Projects/bashsnippets-next
claude
```

```
/seo audit https://bashsnippets.xyz
```

Wait 3–5 minutes. Parallel agents fan out across your site.

When it finishes:
```
/seo geo https://bashsnippets.xyz
```

Then:
```
/seo schema https://bashsnippets.xyz
```

Then exit:
```
exit
```

Check for generated files:
```bash
ls *.md
```
You should have: `FULL-AUDIT-REPORT.md`, `GEO-ANALYSIS.md`, `SCHEMA-REPORT.md`

Read the critical findings first:
```bash
grep -A 5 "CRITICAL\|critical" FULL-AUDIT-REPORT.md | head -40
```

## Session 2: Design Audit

**What this does:** Scans your components and pages for AI slop patterns.
Gives you a specific punch list with file:line references.

```bash
cd ~/Projects/bashsnippets-next
claude
```

```
Read CLAUDE.md and .claude/skills/frontend-design/SKILL.md.

Run /design-audit on the entire codebase.
Check every file in src/components/ and every page in src/app/.
Report each AI slop pattern with the exact file path and line number.
Group findings by severity: critical (fix immediately) and warning (fix this week).
```

When it finishes, copy the output somewhere. This is your design backlog.

```
exit
```

## Session 3: Content Audit of Your Snippet Pages

**What this does:** Checks every snippet page for missing Quick Answer blocks,
wrong heading format, missing affiliate boxes, and schema issues.

```bash
cd ~/Projects/bashsnippets-next
claude
```

```
Read CLAUDE.md and .claude/skills/content-standards/SKILL.md and .claude/skills/seo-aeo-geo/SKILL.md.

Run /content-check on every .mdx file in src/content/snippets/.
For each file, check:
1. Is quickAnswer in the front matter? Is it 134-167 words?
2. Are H2 headings question-format?
3. Is the FAQ section present with 3+ real questions?
4. Are AffiliateBox components present in the page.tsx or MDX?
5. Does the page.tsx for this slug have generateMetadata() with canonical and og:image?

Report: filename, PASS/FAIL per check, specific issue if FAIL.
```

```
exit
```

## Session 4: First Design Fix — Hero Section

Pick ONE thing from the design audit. Start with the hero section since it is
the highest-impact change for engagement.

```bash
cd ~/Projects/bashsnippets-next
claude
```

```
Read CLAUDE.md and .claude/skills/frontend-design/SKILL.md.

Read src/app/page.tsx now. Show me the current hero section code.

List every AI slop pattern you find in it.

Then rebuild only the hero section using the Terminal Realism aesthetic direction:
- Left-aligned layout (not centered)
- Terminal prompt with green $ and blinking cursor
- H1 in Syne font, large, with one key phrase in text-green (not gradient text)
- Remove all emoji
- Remove any // comment-style section labels
- Two CTA buttons following the pattern in the skill

Change ONLY the hero section. Do not touch navigation, cards, footer, or any other section.
Show me the new code before writing it to disk. I will confirm before you save.
```

**Important:** Claude Code will ask for confirmation before writing files.
Review the diff it shows you. Type `yes` to apply, or give feedback to adjust.

After applying:
```bash
npm run dev
```
Open http://localhost:3000 and verify it looks correct.

If anything breaks:
```bash
git diff src/app/page.tsx
git checkout src/app/page.tsx  # Reverts the change
```

---

# PART 6 — COMPLETE COMMANDS REFERENCE

## Terminal Commands (outside Claude Code)

```bash
# Start Claude Code in current directory
cd ~/Projects/bashsnippets-next && claude

# Run Claude Code with a single prompt (no interactive session)
claude -p "Read CLAUDE.md then tell me what SEO issues the homepage has"

# Check claude-seo installation
ls ~/.claude/skills/ | grep seo

# Check your project skills
ls ~/Projects/bashsnippets-next/.claude/skills/

# Run dev server
npm run dev

# Check for TypeScript errors without building
npx tsc --noEmit

# Full production build (catches more errors than tsc alone)
npm run build

# Revert a file Claude Code changed
git checkout src/components/Nav.tsx

# See what Claude Code changed
git diff
git status
```

## Inside Claude Code — BashSnippets Skills

These commands come from your `.claude/skills/` files:

```
/design-audit
  Scans src/components/ and src/app/ for AI slop patterns.
  Outputs: file:line references, severity (critical/warning), suggested fix.
  Run: at start of any design session, and after major refactors.

/design-rebuild Nav.tsx
  Reads the current Nav.tsx, lists problems, rebuilds to brand standards.
  Shows before/after diff. Asks for confirmation before writing.
  Use: for one component at a time — never run on multiple components at once.

/seo-audit src/app/snippets/disk-space-warning/page.tsx
  Audits a specific page file for: metadata, schema, AEO Quick Answer block,
  heading format, affiliate boxes.
  Outputs: CRITICAL / HIGH / MEDIUM / PASSING per check.

/seo-schema snippet
  Generates complete JSON-LD for a snippet page.
  Asks: title, description, slug, dates, difficulty, FAQ pairs.
  Outputs: copy-paste ready script tag for your page.tsx.

/snippet-new "monitor failed ssh logins"
  Asks 6 questions, then generates: complete MDX front matter, bash script,
  all 13 required content sections, correct save path.

/tool-new "bash string builder"
  Asks 4 questions, then generates: standalone HTML tool file,
  tools.ts registry entry, route page structure.

/content-check src/content/snippets/disk-space-warning.mdx
  Audits one MDX file for all content standards.
  Outputs: PASS/FAIL per item with line numbers for failures.
```

## Inside Claude Code — claude-seo Plugin

```
/seo audit https://bashsnippets.xyz
  Full parallel site audit. Takes 3–5 minutes.
  Produces: FULL-AUDIT-REPORT.md in current directory.
  Run: monthly, or after major site changes.

/seo page https://bashsnippets.xyz/snippets/disk-space-warning
  Deep single-page analysis: on-page elements, schema, content quality.
  Takes 60–90 seconds.
  Run: after publishing a new page, or when a page has low click-through.

/seo schema https://bashsnippets.xyz
  Detect and validate schema across the site.
  Produces: SCHEMA-REPORT.md
  Run: after adding new pages, to catch missing or broken schema.

/seo geo https://bashsnippets.xyz
  AI search readiness: passage citability, entity presence, AEO signals.
  Produces: GEO-ANALYSIS.md
  Run: monthly.

/seo technical https://bashsnippets.xyz
  Core Web Vitals (LCP, INP, CLS), crawlability, robots, sitemap.
  Run: after major layout or performance changes.

/seo content https://bashsnippets.xyz/snippets/disk-space-warning
  E-E-A-T and content quality analysis for one page.
  Run: when a page is indexed but not ranking.
```

---

# PART 7 — WORKFLOW FOR ONGOING WORK

## Adding a New Snippet (every time)

```bash
cd ~/Projects/bashsnippets-next
claude
```
```
Read CLAUDE.md, .claude/skills/content-standards/SKILL.md, .claude/skills/seo-aeo-geo/SKILL.md.
Run /snippet-new "[topic]"
```
Answer its 6 questions. Review the generated MDX. Confirm. Save.

```
exit
npm run build
git add . && git commit -m "feat: add [topic] snippet" && git push
```

After Vercel deploys (~2 min):
```bash
curl -X POST "https://yandex.com/indexnow" \
  -H "Content-Type: application/json" \
  -d '{"host":"bashsnippets.xyz","key":"a7fae2a4e86d4822ab3f636599173c8f","urlList":["https://bashsnippets.xyz/snippets/NEW-SLUG"]}'
```

## Adding a New Tool (every time)

```bash
claude
```
```
Read CLAUDE.md, .claude/skills/content-standards/SKILL.md.
Run /tool-new "[tool name]"
```
Answer its 4 questions. Review HTML and registry entry. Confirm.

```
exit
npm run build && git add . && git commit -m "feat: add [tool name] tool" && git push
```

## Weekly Maintenance (10 minutes)

```bash
claude
/design-audit
exit
```
Pick the top 2 critical items. Fix in separate sessions (one component per session).

## Monthly SEO Review (30 minutes)

```bash
claude
/seo audit https://bashsnippets.xyz
/seo geo https://bashsnippets.xyz
exit
cat FULL-AUDIT-REPORT.md | less
```
Build a fix list. Address CRITICAL items within the week.

---

# PART 8 — TROUBLESHOOTING

## "Claude doesn't seem to see my skills"
```bash
# 1. Verify files exist
ls ~/Projects/bashsnippets-next/CLAUDE.md
ls ~/Projects/bashsnippets-next/.claude/skills/frontend-design/SKILL.md

# 2. Inside Claude Code, force-read them:
> Please read CLAUDE.md and all files in .claude/skills/ explicitly, then confirm what you loaded.
```

## "npm run dev breaks after Claude Code changes"
```bash
# See what changed
git diff

# Identify the error
npm run dev 2>&1 | head -30

# Inside Claude Code, paste the error:
> Fix only this TypeScript error. Do not change anything else: [paste error]

# If you want to just undo:
git checkout src/  # Reverts all src/ changes
```

## "claude-seo /seo commands not working"
```bash
# Check installation
ls ~/.claude/skills/seo/SKILL.md

# If missing, reinstall
cd ~ && bash claude-seo/install.sh

# If Python deps are missing
pip install --user trafilatura htmldate playwright
python3 -m playwright install chromium
```

## "Build fails after adding new snippet"
```bash
npm run build 2>&1 | tail -20
```
Common causes:
- MDX front matter syntax error (YAML is strict about indentation/quotes)
- Missing required front matter field
- Broken import in page.tsx

Paste the error into Claude Code:
```
Fix only this build error. Do not change anything else: [paste error]
```

## "Claude Code is making too many changes at once"
This is the Karpathy Rule 2 violation. When it happens:
```bash
git checkout .  # Undo everything since last commit
```
Then restart with a more constrained prompt:
```
Read CLAUDE.md. Note Rule 2: minimum viable change.
Change ONLY [specific thing]. Do not touch any other file.
Show me exactly what you plan to change before writing it.
```

---

# QUICK REFERENCE CARD

```
SETUP (one-time)
  ls ~/.claude/skills/ | grep seo         Verify claude-seo installed
  ls .claude/skills/*/SKILL.md            Verify custom skills installed
  ls CLAUDE.md                            Verify master instructions installed

START EVERY SESSION
  cd ~/Projects/bashsnippets-next
  claude
  > Read CLAUDE.md and all .claude/skills/ files before doing anything.

DESIGN WORK
  /design-audit                           Full codebase AI slop scan
  /design-rebuild Nav.tsx                 Rebuild one component to brand spec

SEO WORK  
  /seo audit https://bashsnippets.xyz     Full site audit (3-5 min)
  /seo page https://bashsnippets.xyz/... Deep single page analysis
  /seo-audit src/app/snippets/x/page.tsx Local file audit (faster)
  /seo-schema snippet                     Generate JSON-LD for page

CONTENT WORK
  /snippet-new "topic"                    Scaffold new snippet page
  /tool-new "tool name"                   Scaffold new tool
  /content-check src/content/x.mdx       Audit existing content

AFTER EVERY PUSH
  Submit to IndexNow (see Part 7)
  Verify in GSC URL Inspection
  Update public/llms.txt
```
