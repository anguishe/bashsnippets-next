import Breadcrumb from '@/components/Breadcrumb';
import ToolkitCTA from '@/components/ToolkitCTA';
import { snippets, type SnippetRegistryEntry } from '@/lib/snippets';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: `Bash Script Library — ${snippets.length} Copy-Paste Shell Scripts for Linux`,
  description:
    `${snippets.length} copy-paste bash scripts with plain-English explanations. Tested on Ubuntu 22.04 LTS and macOS Ventura.`,
  alternates: {
    canonical: `${SITE_URL}/snippets`,
  },
  openGraph: {
    title: `Bash Script Library — ${snippets.length} Copy-Paste Shell Scripts for Linux`,
    description:
      `${snippets.length} copy-paste bash scripts with plain-English explanations. Tested on Ubuntu 22.04 LTS and macOS Ventura.`,
    url: `${SITE_URL}/snippets`,
    type: 'website',
    images: [{ url: `${SITE_URL}/ogimage.png`, width: 1200, height: 630, alt: 'BashSnippets — Bash Script Library' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Bash Script Library — ${snippets.length} Copy-Paste Shell Scripts for Linux`,
    description:
      `${snippets.length} copy-paste bash scripts with plain-English explanations. Tested on Ubuntu 22.04 LTS and macOS Ventura.`,
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Bash Script Library',
  url: `${SITE_URL}/snippets`,
  description:
    `${snippets.length} copy-paste bash scripts with plain-English explanations for Linux and macOS.`,
  hasPart: snippets.map((snippet) => ({
    '@type': 'TechArticle',
    name: snippet.title,
    url: `${SITE_URL}/snippets/${snippet.slug}`,
    description: snippet.description,
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Snippets',
      item: `${SITE_URL}/snippets`,
    },
  ],
};

// difficultyBadgeClass removed — design skill: no pill badges, use inline dot-separated text

const difficultyGroups: {
  id: 'beginner' | 'intermediate' | 'advanced';
  label: string;
  level: SnippetRegistryEntry['difficulty'];
}[] = [
  { id: 'beginner', label: 'Beginner Scripts', level: 'beginner' },
  { id: 'intermediate', label: 'Intermediate Scripts', level: 'intermediate' },
  { id: 'advanced', label: 'Advanced Scripts', level: 'advanced' },
];

const filterLinks = [
  { href: '/snippets', label: 'All' },
  { href: '#beginner', label: 'Beginner' },
  { href: '#intermediate', label: 'Intermediate' },
  { href: '#advanced', label: 'Advanced' },
] as const;

function truncateDescription(text: string, max = 100): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trimEnd()}...`;
}

function SnippetCard({ snippet }: { snippet: SnippetRegistryEntry }) {
  return (
    <article className="group relative flex min-h-[148px] flex-col overflow-hidden rounded-lg border border-border bg-bg2 p-5 transition-colors duration-150 hover:border-green">
      <div className="absolute left-0 top-0 h-0.5 w-0 bg-green transition-all duration-300 group-hover:w-full" aria-hidden />
      <span className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
        {snippet.difficulty} · {snippet.tags.join(' · ')}
      </span>
      <h3 className="flex-1 font-heading text-base font-bold leading-snug text-text">
        {snippet.title}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {truncateDescription(snippet.description)}
      </p>
      <Link
        href={`/snippets/${snippet.slug}`}
        className="mt-4 font-mono text-xs text-green transition-colors hover:text-text"
      >
        Full guide →
      </Link>
    </article>
  );
}

export default function SnippetsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Snippets' },
          ]}
        />

        <div className="mb-6 flex items-center gap-2 font-mono text-sm text-muted">
          <span className="text-green">$</span>
          <span>bash-snippets</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-green" aria-hidden />
        </div>

        <h1 className="font-heading text-4xl font-extrabold text-text">
          Bash Script Library
        </h1>

        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          {snippets.length} copy-paste bash scripts with plain-English explanations. Tested on
          Ubuntu 22.04 LTS and macOS Ventura.
        </p>

        <div className="my-8 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <span className="text-lg font-bold text-green">{snippets.length}</span>
            <span>scripts</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <span className="text-lg font-bold text-green">6</span>
            <span>free tools</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <span className="text-lg font-bold text-green">0</span>
            <span>logins required</span>
          </div>
        </div>

        <nav
          className="mt-8 flex flex-wrap gap-2"
          aria-label="Filter by difficulty"
        >
          {filterLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded border border-border bg-bg2 px-4 py-2 text-sm text-muted transition-colors hover:border-green hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-14">
          {difficultyGroups.map((group) => {
            const groupSnippets = snippets.filter(
              (s) => s.difficulty === group.level,
            );
            if (groupSnippets.length === 0) {
              return null;
            }
            return (
              <div key={group.id}>
                <section id={group.id}>
                  <h2 className="mb-6 font-heading text-2xl font-bold text-text">
                    {group.label} ({groupSnippets.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupSnippets.map((snippet) => (
                      <SnippetCard key={snippet.slug} snippet={snippet} />
                    ))}
                  </div>
                </section>
                {group.id === 'intermediate' && (
                  <div className="my-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-blue bg-bg2 p-5">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-widest text-blue">
                        Free Interactive Tools
                      </p>
                      <p className="text-sm font-semibold text-text">
                        Need a cron expression? chmod calculator?
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        6 browser-based bash tools — no install required
                      </p>
                    </div>
                    <Link
                      href="/tools"
                      className="whitespace-nowrap rounded bg-blue px-4 py-2 font-mono text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                      Browse All Tools →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ToolkitCTA className="mt-14" />
      </main>
    </>
  );
}
