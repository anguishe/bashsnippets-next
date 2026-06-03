---
name: bashsnippets-frontend-design
description: Design system enforcer for BashSnippets.xyz. Activates when building or refactoring any UI component, page layout, or visual element. Prevents AI slop, enforces brand tokens, and produces terminal-native dark interfaces that feel crafted — not generated.
---

# BashSnippets Frontend Design Skill

Activates for: any UI task — new components, page refactors, layout changes,
visual audits, or anything touching `.tsx` files in `src/components/` or `src/app/`.

---

## DESIGN THINKING SEQUENCE — RUN BEFORE WRITING ANY CODE

Answer these four questions in your response before touching a file:

1. **What is this component's single job?**
2. **Who is the user at this exact moment?** (2am sysadmin debugging? junior dev copying first script?)
3. **What one thing will they remember about this page?**
4. **Which aesthetic direction fits?** (Pick one from the table below — commit to it)

### BashSnippets Aesthetic Directions

| Direction | Feel | Use For |
|---|---|---|
| **Terminal Realism** | Actual terminal — cursor blink, monospace density, scan lines | Hero, code displays |
| **Technical Schematic** | Blueprint/circuit — grid lines, precision, measurement marks | Tool builder UIs |
| **Editorial Density** | Engineer's magazine — tight type, strong hierarchy, no wasted space | Snippet long-form |
| **Brutalist Utility** | Raw function — asymmetry, hard cuts, no decoration | Index pages |
| **Signal/Noise** | Security dashboard — high contrast, data-forward, micro-animation on state | Interactive tools |

---

## BRAND TOKENS — ALWAYS USE CSS VARIABLES, NEVER HARDCODE HEX

```css
:root {
  --bg:         #0d1117;
  --bg2:        #161b22;
  --bg3:        #1c2128;
  --border:     #30363d;
  --green:      #39d353;
  --green-dim:  #1a4a2e;
  --amber:      #e3b341;
  --blue:       #58a6ff;
  --blue-dim:   #0d2a4a;
  --muted:      #8b949e;
  --text:       #e6edf3;
  --radius:     8px;
}
```

**Fonts — load ONLY via `next/font/google` in `src/app/layout.tsx`:**
```ts
import { IBM_Plex_Mono, Syne } from 'next/font/google'
export const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' })
export const heading = Syne({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-heading' })
```

---

## DO / DO NOT — THE HARD LIST

### ✓ DO
- Use `font-mono` (IBM Plex Mono) for ALL code, labels, tags, CLI output, nav wordmark
- Use `font-heading` (Syne) for ALL h1–h4
- Use system sans-serif for body paragraphs
- Use `--border` for ALL card/panel borders — no shadow-only separation
- Use `--bg2` for cards/panels, `--bg3` for code blocks and inputs
- Use `--green` as the single primary accent — `--amber` for warnings only
- Use `--muted` for metadata (dates, tags, difficulty labels)
- Add `:hover` on every interactive element — minimum: `border-color` shift to `--green`
- Use `letter-spacing: 0.05em` (tracking-widest) on all-caps labels
- Add a blinking cursor on terminal-style elements: `w-2 h-4 bg-green animate-pulse`
- Every code block: line numbers, copy button, language label, `--bg3` bg, horizontal scroll
- Add `transition-colors duration-150` on hover state changes
- Use left-aligned layouts as default — centered only for specific elements

### ✗ DO NOT
- ❌ Inter, Roboto, Arial, Space Grotesk, or any system font for headings
- ❌ Purple, violet, or lavender anywhere
- ❌ White or light-mode backgrounds (dark-only site)
- ❌ Emoji as icons or section markers (📊 💾 🧹)
- ❌ `// comment style` text as visible section labels in the UI
- ❌ Stacked pill badges as the only visual interest on a card
- ❌ Centered hero with no terminal prompt element
- ❌ Gradient text on headings
- ❌ Cards without a visible border (box-shadow only)
- ❌ Missing hover state on any interactive element
- ❌ Missing copy button on any code block
- ❌ Inline `style={}` props — use Tailwind classes or CSS variables

---

## COMPONENT PATTERNS

### Card (Snippet or Tool listing)
```tsx
// ✓ CORRECT: distinct hierarchy, hover accent line, no emoji
<div className="bg-bg2 border border-border rounded-[8px] p-5
                hover:border-green transition-colors duration-150
                group relative overflow-hidden">
  {/* Accent line — grows from 0 to full on hover */}
  <div className="absolute top-0 left-0 h-0.5 w-0 bg-green
                  group-hover:w-full transition-all duration-300" />
  <span className="font-mono text-xs text-muted uppercase tracking-widest">
    {difficulty} · {category}
  </span>
  <h3 className="font-heading text-lg font-bold text-text mt-1.5 leading-snug">
    {title}
  </h3>
  <p className="text-muted text-sm mt-2 leading-relaxed">{description}</p>
  <div className="mt-4 font-mono text-xs text-muted">
    {tags.join(' · ')}  {/* inline · separated — NOT pill badges */}
  </div>
</div>

// ✗ WRONG: emoji, pill badges, no hover border
<div className="rounded-lg shadow-md p-4 bg-white">
  <span>📊</span><h3>{title}</h3>
  <div className="flex gap-2">
    <span className="badge bg-gray-100">tag1</span>
  </div>
</div>
```

### Hero Section
```tsx
// ✓ CORRECT: Terminal Realism — left-aligned, prompt element, no gradient
<section className="border-b border-border px-6 py-16 md:py-24">
  <div className="max-w-4xl">
    <div className="font-mono text-sm text-muted mb-6 flex items-center gap-2">
      <span className="text-green">$</span>
      <span>bashsnippets.xyz</span>
      <span className="w-2 h-4 bg-green animate-pulse inline-block ml-1" />
    </div>
    <h1 className="font-heading text-4xl md:text-6xl font-black text-text
                   leading-[1.05] tracking-tight max-w-3xl">
      Stop Googling the Same{' '}
      <em className="text-green not-italic">Bash Commands</em>
    </h1>
    <p className="text-muted mt-6 max-w-xl leading-relaxed text-base">
      {subtitle}
    </p>
    <div className="flex flex-wrap gap-3 mt-8">
      <a href="/snippets"
         className="font-mono text-sm bg-green text-bg px-4 py-2 rounded-[6px]
                    hover:bg-green/90 transition-colors">
        Browse Snippets
      </a>
      <a href="/tools"
         className="font-mono text-sm border border-border text-text px-4 py-2 rounded-[6px]
                    hover:border-green transition-colors">
        Open Tools
      </a>
    </div>
  </div>
</section>

// ✗ WRONG: centered, gradient text, emoji, // section comment
<section className="text-center py-20 bg-gradient-to-b from-purple-900">
  <h1 className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text">
    // the good stuff
  </h1>
</section>
```

### Navigation
```tsx
// ✓ CORRECT: mono wordmark, right links, active = green + underline
<nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-sm border-b border-border">
  <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" className="font-mono text-sm font-semibold">
      <span className="text-green">bash</span>
      <span className="text-muted">/</span>
      <span className="text-text">snippets</span>
    </a>
    <div className="hidden md:flex items-center gap-6">
      {navLinks.map(link => (
        <a key={link.href} href={link.href}
           className="font-mono text-sm text-muted hover:text-text transition-colors
                      data-[active=true]:text-green data-[active=true]:underline
                      underline-offset-4 decoration-green">
          {link.label}
        </a>
      ))}
    </div>
  </div>
</nav>
```

### Code Block (must match existing CodeBlock.tsx — read it first)
```
Every code block must have:
1. Language label — font-mono text-xs text-muted, top-right
2. Copy button — shifts to "Copied ✓" state on click (check CopyButton.tsx)
3. bg-bg3 background, border border-border
4. Horizontal scroll — no word wrap on code
5. Consistent padding: p-4 inside, px-4 py-2 for the header bar
```

### Affiliate Box (use existing AffiliateBox.tsx — do not rebuild)
```
Check src/components/AffiliateBox.tsx for current props.
Required on: ALL snippet pages, ALL tool pages.
DigitalOcean box first, Namecheap box second (if page is domain/deployment relevant).
```

---

## SLASH COMMAND: /design-audit

When this command is run, scan `src/components/` and `src/app/` and report:

```
DESIGN AUDIT — BashSnippets.xyz
=================================
File: src/components/Nav.tsx
  ✗ Line 12 — Inter font class detected → replace with font-mono / font-heading
  ✗ Line 34 — Active link uses pill badge → replace with text-green + underline

File: src/app/page.tsx
  ✗ Line 18 — Emoji 📊 used as section icon → remove, use category text label
  ✗ Line 45 — "// the good stuff" text in UI → remove section comment labels
  ✗ Line 67 — Centered hero, no terminal prompt element → restructure left-aligned
  ⚠ Line 89 — Card has box-shadow but no border → add border border-border

SUMMARY: 5 critical, 1 warning
Priority order: [list files by fix complexity, easiest first]
```

## SLASH COMMAND: /design-rebuild <component>

1. Read the component file — show current code
2. List every ✗ pattern found against the DO NOT list
3. State which aesthetic direction you are using
4. Write the rebuilt component
5. Show a clear before/after summary of changes made