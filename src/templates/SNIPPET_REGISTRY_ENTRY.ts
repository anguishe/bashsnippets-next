/**
 * SNIPPET REGISTRY ENTRY TEMPLATE
 * ================================
 * Copy the object below into the `snippets` array in src/lib/snippets.ts.
 *
 * Rules:
 * - `slug` must match the MDX filename: src/content/snippets/[slug].mdx
 * - A slug missing from this registry will 404 even if the MDX file exists
 * - `quickAnswer` is optional in the registry but strongly recommended (134–167 words)
 * - `youtubeShortId` is optional — only add when you have a published YouTube Short
 *
 * After adding the entry, run: npm run build
 */

import type { SnippetRegistryEntry } from '@/lib/snippets';

export const SNIPPET_REGISTRY_ENTRY_TEMPLATE: SnippetRegistryEntry = {
  // URL slug — same as MDX frontmatter `slug` and filename your-snippet-slug.mdx
  slug: 'your-snippet-slug',

  // Page title — usually matches MDX frontmatter title
  title: 'Your Snippet Title',

  // Meta description for SEO — 150–160 chars, consequence or action-first
  description:
    'Copy a bash script that does X using Y. Prevent [specific failure] on Linux servers.',

  // Optional but recommended: 134–167 word self-contained summary for the Quick Answer block
  quickAnswer:
    'The example-command reports or changes something critical on your system. This script wraps it with named variables at the top, compares results against your threshold, and exits 1 on failure so cron can alert you. Without monitoring, services crash before anyone notices. Works on Ubuntu 22.04 LTS, Debian 12, and macOS Ventura.',

  // Lowercase hyphenated tags — max 5. Used for /snippets filtering
  tags: ['monitor', 'cron-ready', 'example-tag'],

  // Skill level — must be exactly: 'beginner' | 'intermediate' | 'advanced'
  difficulty: 'beginner',

  // ISO date first published (YYYY-MM-DD)
  datePublished: '2026-06-03',

  // ISO date last updated (YYYY-MM-DD) — bump on every content change
  dateModified: '2026-06-03',

  // Optional: override schema publishedTime if different from datePublished
  // publishedTime: '2026-06-03',

  // Optional: override schema modifiedTime if different from dateModified
  // modifiedTime: '2026-06-03',

  // Optional: YouTube Short video ID (the part after watch?v= or youtu.be/)
  // youtubeShortId: 'XXXXXXXXXXX',
};
