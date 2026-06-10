/**
 * TOOL REGISTRY ENTRY TEMPLATE
 * ==============================
 * Copy the object below into the `tools` array in src/lib/tools.ts.
 *
 * Also required (not in this file):
 * 1. React component at src/components/tools/YourToolName.tsx
 * 2. Dynamic import in src/components/tools/ToolRenderer.tsx:
 *    'your-tool-slug': withSkeleton(() => import('@/components/tools/YourToolName')),
 *
 * Categories in use: 'reference' | 'builder' | 'debug' | 'generator'
 *
 * After adding the entry, run: npm run build
 */

import type { ToolMeta } from '@/lib/tools';

export const TOOL_REGISTRY_ENTRY_TEMPLATE: ToolMeta = {
  // URL slug — appears at /tools/your-tool-slug
  slug: 'your-tool-slug',

  // PascalCase component filename without extension — must match ToolRenderer import
  component: 'YourToolName',

  // Page title for H1, metadata, and SoftwareApplication schema
  title: 'Your Tool Title',

  // Meta description — what the tool does and who it helps (150–160 chars ideal)
  description:
    'Short plain-English description of what the user gets when they use this tool.',

  // Quick Answer block on tool page — 134–167 words, consequence-first, self-contained
  quickAnswer:
    'Write a self-contained Quick Answer paragraph (134–167 words) explaining what breaks without this tool, how it works, and who it helps. This appears in the green-bordered Quick Answer block above the interactive widget.',

  // Grouping on /tools index — pick one: reference | builder | debug | generator
  category: 'builder',

  // ISO 8601 dates — used in sitemap lastmod and TechArticle schema
  datePublished: 'YYYY-MM-DD',
  dateModified: 'YYYY-MM-DD',

  // Numbered usage steps shown on the tool page (4 steps is a good target)
  howToUse: [
    'Describe the first thing the user does (e.g., enter a value in the input field).',
    'Explain what updates live as they interact (e.g., the output panel refreshes).',
    'Tell them how to verify the result looks correct before copying.',
    'Explain the copy action and where to paste the output (crontab, script file, terminal).',
  ],

  // FAQ for JSON-LD FAQPage schema — real questions, complete standalone answers
  faqs: [
    {
      question: 'What does this tool do?',
      answer:
        'One or two sentences explaining the input, the output, and the problem it solves — written so someone who has never seen the site understands it.',
    },
    {
      question: 'How do I use the output from this tool?',
      answer:
        'Concrete steps: click Copy, paste into your script or crontab, save, and run. Mention any chmod or cron steps if relevant.',
    },
    {
      question: 'Does this work on macOS and Linux?',
      answer:
        'Yes — the tool runs in the browser. The generated bash output works on any system with bash unless you note a platform-specific flag.',
    },
    {
      question: 'Is my input sent to a server?',
      answer:
        'No. All processing happens in your browser. Nothing is stored or transmitted.',
    },
  ],
};
