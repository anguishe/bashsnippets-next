---
name: bashsnippets-seo-aeo-geo
description: SEO, AEO, and GEO optimization skill for BashSnippets.xyz. Activates for metadata, structured data, content optimization, schema markup, or AI search readiness tasks. Every recommendation is falsifiable. Aligned with Google's 2026 AI Optimization Guide.
---

# BashSnippets SEO / AEO / GEO Skill

Activates for: generateMetadata(), JSON-LD, content structure audits, schema tasks,
or explicit /seo-audit and /seo-schema commands.

---

## GROUND RULES

1. **Every recommendation is falsifiable.** State: what is wrong → what to change → how to verify.
2. **AEO = GEO = SEO.** Per Google's 2026 AI Optimization Guide, these are the same system.
   AI Overviews and AI Mode use the same ranking signals as classic Search.
3. **Never generate deprecated schema.** HowTo (removed Sept 2023), SpecialAnnouncement
   (retired July 2025), ClaimReview, VehicleListing (retired June 2025) — all banned.
4. **llms.txt is not a citation lever.** It helps discovery. Real GEO comes from
   content structure: self-contained answer blocks, question-format headings, entity presence.

---

## generateMetadata() TEMPLATE

Copy this pattern for every page. Fill in actual values — never leave placeholders.

```ts
// src/app/snippets/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const snippet = getSnippetBySlug(params.slug) // from src/lib/snippets.ts

  return {
    title: `${snippet.title} – BashSnippets.xyz`,
    description: snippet.description, // 150–160 chars, consequence-first phrasing
    alternates: {
      canonical: `https://bashsnippets.xyz/snippets/${params.slug}`,
    },
    openGraph: {
      title: `${snippet.title} – BashSnippets.xyz`,
      description: snippet.description,
      url: `https://bashsnippets.xyz/snippets/${params.slug}`,
      siteName: 'BashSnippets',
      type: 'article',
      publishedTime: snippet.datePublished,
      modifiedTime: snippet.dateModified,
      images: [{
        url: 'https://bashsnippets.xyz/og-image.png',
        width: 1200,
        height: 630,
        alt: `${snippet.title} – BashSnippets.xyz`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${snippet.title} – BashSnippets.xyz`,
      description: snippet.description,
      images: ['https://bashsnippets.xyz/og-image.png'],
    },
  }
}
```

---

## JSON-LD SCHEMA BY PAGE TYPE

### Homepage
```tsx
// src/app/page.tsx — inject before </body> or in layout
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://bashsnippets.xyz/#website',
      url: 'https://bashsnippets.xyz',
      name: 'BashSnippets',
      description: 'Free bash script examples and interactive tools for Linux developers and sysadmins.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://bashsnippets.xyz/snippets?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://bashsnippets.xyz/#organization',
      name: 'BashSnippets',
      url: 'https://bashsnippets.xyz',
      logo: { '@type': 'ImageObject', url: 'https://bashsnippets.xyz/favicon512x512.png' },
      sameAs: [
        'https://www.youtube.com/@BashSnippets',
        'https://www.tiktok.com/@BashSnippets',
        'https://dev.to/bashsnippets',
      ],
    },
  ],
}
```

### Snippet Page (TechArticle + BreadcrumbList + FAQPage)
```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TechArticle',
      headline: snippet.title,
      description: snippet.description,
      url: `https://bashsnippets.xyz/snippets/${snippet.slug}`,
      datePublished: snippet.datePublished,
      dateModified: snippet.dateModified,
      author: { '@type': 'Organization', name: 'BashSnippets', url: 'https://bashsnippets.xyz' },
      publisher: {
        '@type': 'Organization',
        name: 'BashSnippets',
        logo: { '@type': 'ImageObject', url: 'https://bashsnippets.xyz/favicon512x512.png' },
      },
      image: 'https://bashsnippets.xyz/og-image.png',
      proficiencyLevel: snippet.difficulty, // 'Beginner' | 'Intermediate' | 'Expert'
      programmingLanguage: 'Bash',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bashsnippets.xyz' },
        { '@type': 'ListItem', position: 2, name: 'Snippets', item: 'https://bashsnippets.xyz/snippets' },
        { '@type': 'ListItem', position: 3, name: snippet.title, item: `https://bashsnippets.xyz/snippets/${snippet.slug}` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: snippet.faq.map(q => ({  // faq must come from actual page content
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer },
      })),
    },
  ],
}

// Inject in page.tsx:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### Tool Page (WebApplication + BreadcrumbList + FAQPage)
```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: tool.name,
      url: `https://bashsnippets.xyz/tools/${tool.slug}`,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: tool.description,
    },
    // BreadcrumbList and FAQPage same pattern as snippet — adjust URLs
  ],
}
```

---

## AEO — ANSWER ENGINE OPTIMIZATION

AEO is how you get cited by AI Overviews, ChatGPT, Perplexity, and Claude.
These systems extract passages. Every H2 section must work as a standalone answer.

### Quick Answer Block (Required on every snippet and tool page)
Place immediately below the H1, before any other content:

```tsx
// In MDX file or page.tsx
<div className="bg-bg2 border-l-4 border-green rounded-r-[8px] pl-4 pr-5 py-4 mb-8">
  <p className="font-mono text-xs text-green uppercase tracking-widest mb-2">
    Quick Answer
  </p>
  <p className="text-text leading-relaxed text-sm">
    {/* 134–167 words. Self-contained. Directly answers the primary search query.
        Uses the exact phrase people type into Google.
        Must make sense with zero context from the rest of the page. */}
  </p>
</div>
```

### Heading Structure Rules
```
✓ CORRECT headings (question-format):
  H1: "Disk Space Warning Script in Bash"  ← close match to search query
  H2: "How Does the Disk Space Warning Script Work?"
  H2: "How Do I Schedule This Script with Cron?"
  H2: "What Happens If the Disk Is Already Full?"
  H3: "Checking Disk Usage with df"

✗ WRONG headings (vague):
  H1: "Monitor Your Server's Storage"
  H2: "Script Breakdown"
  H2: "Scheduling"
  H3: "The df Command"
```

### Passage Citability Test — Run for Every H2 Section
- [ ] Does this section answer its question without referencing "above" or "below"?
- [ ] Is the direct answer in the first 2 sentences?
- [ ] Does it contain a concrete example (a command, a value, a file path)?
- [ ] Is it under 167 words?
- [ ] Does it use the target keyword or a synonym in sentence 1?

---

## GEO — GENERATIVE ENGINE OPTIMIZATION

### Entity Signals (use naturally — not keyword-stuffed)
Every snippet page should reference:
- Distro names: Ubuntu, Debian, Fedora, CentOS, macOS
- Tool names: bash, cron, systemd, grep, find, rsync, curl, awk, sed
- Concepts: shell script, Linux automation, DevOps, sysadmin
- Version specifics when real: "Ubuntu 22.04 LTS", "macOS Ventura 13"

### llms.txt Update Protocol
When a new page goes live, append to `public/llms.txt`:
```
/snippets/new-slug - One sentence: what the script does and the problem it prevents
/tools/new-tool - One sentence: what the tool does and who needs it
```
Never modify existing entries. Append only.

---

## TECHNICAL SEO — PRE-DEPLOY CHECKLIST

```
[ ] generateMetadata() present on every new page
[ ] title: 50–60 chars, includes "BashSnippets.xyz"
[ ] description: 150–160 chars, consequence-first
[ ] canonical URL set in alternates.canonical
[ ] og:image points to real file (test: curl -I https://bashsnippets.xyz/og-image.png)
[ ] No noindex unless intentional (check robots property in metadata)
[ ] JSON-LD script tag present and correct type for page
[ ] No deprecated schema (HowTo, SpecialAnnouncement, ClaimReview)
[ ] FAQPage schema matches visible FAQ content — same words, not paraphrased
[ ] BreadcrumbList positions are 1-indexed and URLs are absolute
[ ] sitemap.ts includes new route (check src/app/sitemap.ts)
[ ] Quick Answer block present on snippet/tool pages
[ ] H2 headings are question-format on content pages
[ ] After deploy: submit to IndexNow, verify in GSC URL Inspection
[ ] Update public/llms.txt
```

---

## SLASH COMMAND: /seo-audit <file or url>

Read the file (or fetch the URL) and run every check above. Output:

```
SEO AUDIT — [PAGE]
===================
CRITICAL (fix before this deploys)
  ✗ No generateMetadata() export found
  ✗ Missing JSON-LD script tag

HIGH (fix within 24h of deploy)
  ✗ og:image missing from metadata
  ✗ Quick Answer block not present — AI Overview cannot cite this page

MEDIUM (fix this sprint)
  ⚠ H2 headings are not question-format: "Script Breakdown" → "How Does This Script Work?"
  ⚠ FAQPage schema has 1 question, visible FAQ has 3 — schema must match page

PASSING
  ✓ Canonical URL correct
  ✓ Title 54 chars, includes site name
  ✓ BreadcrumbList valid and matches URL structure

Verification steps for each CRITICAL/HIGH item included.
```

## SLASH COMMAND: /seo-schema <type>

Accepted types: `snippet`, `tool`, `homepage`, `snippets-index`, `tools-index`

Ask for: title, description, slug, datePublished, difficulty (for snippets), FAQ pairs.
Generate the complete JSON-LD block ready to paste into the page file.
Show where exactly in the TSX file to place it.