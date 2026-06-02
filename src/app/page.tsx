import AdSlot from '@/components/AdSlot';
import AffiliateBox from '@/components/AffiliateBox';
import HeroCanvasLoader from '@/components/HeroCanvasLoader';
import ScrollReveal from '@/components/ScrollReveal';
import { snippets, type SnippetMeta } from '@/lib/snippets';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: {
    absolute: 'Bash Script Examples and Tools Hub – BashSnippets.xyz',
  },
  description:
    'Browse free bash script examples for backups, cron, monitoring, grep, chmod, and Linux automation.',
  alternates: {
    canonical: `${SITE_URL}/`,
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a bash script?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A text file of terminal commands that runs automatically in sequence. Saved with a .sh extension, starting with #!/bin/bash.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I run a bash script?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Make it executable: chmod +x script.sh — then run: ./script.sh. Or skip chmod and type: bash script.sh',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I schedule a bash script?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use cron. Run crontab -e and add a line like: 0 2 * * * /path/to/script.sh to run daily at 2am.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I stop my script on errors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Add set -euo pipefail near the top. This exits on error, catches undefined variables, and handles pipe failures.',
      },
    },
  ],
};

const faqItems = [
  {
    question: 'What is a bash script?',
    answer:
      'A text file of terminal commands that runs automatically in sequence. Saved with a .sh extension, starting with #!/bin/bash.',
  },
  {
    question: 'How do I run a bash script?',
    answer:
      'Make it executable: chmod +x script.sh — then run: ./script.sh. Or skip chmod and type: bash script.sh',
  },
  {
    question: 'How do I schedule a bash script?',
    answer:
      'Use cron. Run crontab -e and add a line like: 0 2 * * * /path/to/script.sh to run daily at 2am.',
  },
  {
    question: 'How do I stop my script on errors?',
    answer:
      'Add set -euo pipefail near the top. This exits on error, catches undefined variables, and handles pipe failures.',
  },
] as const;

const previewTools = [
  {
    slug: 'bash-exit-code-lookup',
    title: 'Exit Code Lookup',
    description: 'Look up any exit code 0–255 and get a plain-English explanation.',
  },
  {
    slug: 'cron-job-builder',
    title: 'Cron Builder',
    description: 'Build cron expressions visually with human-readable output.',
  },
  {
    slug: 'chmod-permissions-builder',
    title: 'Chmod Builder',
    description: 'Permission matrix that outputs octal, symbolic, and chmod commands.',
  },
] as const;

function difficultyBadgeClass(difficulty: SnippetMeta['difficulty']): string {
  const base = 'shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase';
  switch (difficulty) {
    case 'beginner':
      return `${base} border-green bg-green-dim text-green`;
    case 'intermediate':
      return `${base} border-amber bg-amber-dim text-amber`;
    case 'advanced':
      return `${base} border-blue bg-blue-dim text-blue`;
  }
}

function truncateDescription(text: string, max = 80): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trimEnd()}...`;
}

function tagIcon(tag: string): string {
  const icons: Record<string, string> = {
    monitor: '📊',
    backup: '💾',
    cleanup: '🧹',
    grep: '🔍',
    'error-handling': '🛡️',
    conditionals: '🔀',
    files: '📁',
    process: '⚡',
    chmod: '🔒',
    email: '📧',
    mysql: '🗄️',
    ssh: '🔑',
    systemd: '♻️',
  };
  return icons[tag] ?? '📜';
}

export default function Home() {
  const featuredSnippets = snippets.slice(0, 9);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'BashSnippets',
              url: 'https://bashsnippets.xyz',
              description:
                'Free bash script examples for Linux, DevOps, and sysadmin automation.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate:
                    'https://bashsnippets.xyz/snippets?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'BashSnippets',
              url: 'https://bashsnippets.xyz',
              logo: 'https://bashsnippets.xyz/favicon-512x512.png',
              sameAs: [
                'https://www.youtube.com/@BashSnippets',
                'https://www.tiktok.com/@BashSnippets',
                'https://dev.to/bashsnippets',
              ],
            },
          ]),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section 1 — Hero */}
      <section className="relative mx-auto min-h-screen max-w-[860px] overflow-hidden px-6 py-20 text-center">
        <HeroCanvasLoader />
        <div className="relative z-10">
          <span className="mb-6 inline-block rounded-full border border-green bg-green-dim px-3 py-1 text-xs uppercase tracking-widest text-green">
            free · no login · no fluff
          </span>

          <h1 className="mb-5 font-heading text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Stop Googling the Same{' '}
            <em className="not-italic text-green">Bash Commands</em>
          </h1>

          <div
            className="mb-4 flex items-center justify-center gap-2"
            aria-hidden="true"
          >
            <span className="font-mono text-sm text-green opacity-70">$</span>
            <span
              className="inline-block h-4 w-2 bg-green"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          </div>

          <p className="mx-auto mb-9 max-w-xl text-lg leading-relaxed text-muted">
            I got tired of re-searching the same bash one-liners every time I sat
            down at a terminal. So I started collecting them. This is that
            collection — real scripts, explained like a human wrote them.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/snippets"
              className="rounded bg-green px-5 py-3 font-mono font-semibold text-bg transition-opacity hover:opacity-90"
            >
              Browse All Snippets
            </Link>
            <Link
              href="#tools"
              className="rounded border border-border px-5 py-3 font-mono text-muted transition-colors hover:border-muted hover:text-text"
            >
              Try the Builder
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2 — Stats Bar */}
      <section className="border-y border-border bg-bg2 px-6 py-5">
        <ScrollReveal>
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center md:flex-nowrap">
            {[
              { value: '20+', label: 'Working Scripts' },
              { value: '100%', label: 'Tested on Linux' },
              { value: '0', label: 'Logins Required' },
              { value: 'Free', label: 'Always' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="px-6 text-center md:border-r md:border-border md:px-10 last:md:border-r-0"
              >
                <p className="font-heading text-2xl font-extrabold tabular-nums text-green">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Section 3 — Snippets Grid */}
      <section
        id="snippets"
        className="mx-auto max-w-4xl border-t border-border px-6 py-20"
      >
        <ScrollReveal>
          <p className="mb-2 text-xs uppercase tracking-widest text-green">
            {'// the good stuff'}
          </p>
          <h2 className="mb-4 font-heading text-3xl font-extrabold text-text">
            Copy-Paste Scripts That Work
          </h2>
          <p className="mb-10 text-muted">
            Every snippet runs on Ubuntu, Debian, Fedora, and macOS. Tested
            personally.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredSnippets.map((snippet, index) => (
              <ScrollReveal
                key={snippet.slug}
                style={{ transitionDelay: `${index * 0.07}s` }}
              >
                <article className="flex flex-col rounded-lg border border-border bg-bg2 p-4">
                  <div className="flex items-start gap-2">
                    <h3 className="flex-1 text-sm font-semibold text-text">
                      <span aria-hidden="true">{tagIcon(snippet.tags[0])} </span>
                      {snippet.title}
                    </h3>
                    <span className={difficultyBadgeClass(snippet.difficulty)}>
                      {snippet.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {truncateDescription(snippet.description)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/snippets/${snippet.slug}`}
                    className="mt-3 text-xs text-blue transition-colors hover:text-text"
                  >
                    Full guide →
                  </Link>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        <AdSlot slot="AUTO" format="auto" />

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/snippets"
            className="rounded bg-green px-6 py-3 font-mono font-semibold text-bg transition-all duration-150 hover:scale-[1.02] hover:opacity-95"
          >
            Browse All Snippets
          </Link>
          <Link
            href="/tools"
            className="rounded bg-blue px-6 py-3 font-mono font-semibold text-bg transition-all duration-150 hover:scale-[1.02] hover:opacity-95"
          >
            Browse All Tools
          </Link>
        </div>
      </section>

      {/* Section 4 — Tools Preview */}
      <section
        id="tools"
        className="border-y border-border bg-bg2 px-6 py-20"
      >
        <ScrollReveal className="mx-auto max-w-4xl">
          <p className="mb-2 text-xs uppercase tracking-widest text-green">
            {'// interactive tools'}
          </p>
          <h2 className="mb-4 font-heading text-3xl font-extrabold text-text">
            Free Browser Tools for Bash
          </h2>
          <p className="mb-10 text-muted">
            No install required. Open in your browser, get the answer.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {previewTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="block rounded-lg border border-border bg-bg3 p-4 no-underline transition-colors hover:border-green"
              >
                <p className="mb-1 font-heading font-bold text-text">
                  {tool.title}
                </p>
                <p className="text-sm leading-relaxed text-muted">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>

          <Link
            href="/tools"
            className="mt-8 inline-block text-sm text-blue transition-colors hover:text-text"
          >
            See all 6 tools →
          </Link>
        </ScrollReveal>
      </section>

      {/* Section 5 — FAQ */}
      <section
        id="faq"
        className="mx-auto max-w-3xl border-t border-border px-6 py-20"
      >
        <ScrollReveal>
          <p className="mb-2 text-xs uppercase tracking-widest text-green">
            {'// faq'}
          </p>
          <h2 className="mb-6 font-heading text-3xl font-extrabold text-text">
            Common Questions
          </h2>

          <div>
            {faqItems.map((item) => (
              <details key={item.question} className="group">
                <summary className="cursor-pointer border-b border-border py-4 font-heading font-semibold text-text">
                  {item.question}
                </summary>
                <p className="py-4 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Section 6 — Affiliate */}
      <section className="mx-auto max-w-4xl border-t border-border px-6 py-10">
        <ScrollReveal>
          <AffiliateBox partner="digitalocean" />
          <AffiliateBox partner="namecheap" className="mt-4" />
        </ScrollReveal>
      </section>
    </>
  );
}
