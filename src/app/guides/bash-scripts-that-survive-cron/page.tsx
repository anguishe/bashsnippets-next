import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { mdxComponents } from '@/components/MDXComponents';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

const TITLE =
  'Bash Scripts That Survive Cron: Locking, Timeouts, and Retries';
const DESCRIPTION =
  'A script that works when you run it isn\'t the same as one that survives unattended on cron. The three ways cron jobs die quietly — overlap, hang, transient failure — and the guards that stop each one.';

// Breadcrumb last crumb uses the short form per the task brief.
const BREADCRUMB = 'Bash Scripts That Survive Cron';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | BashSnippets.xyz` },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/guides/bash-scripts-that-survive-cron`,
  },
  openGraph: {
    title: `${TITLE} | BashSnippets.xyz`,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides/bash-scripts-that-survive-cron`,
    type: 'article',
    publishedTime: '2026-06-22T00:00:00Z',
    images: [
      {
        url: `${SITE_URL}/ogimage.png`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | BashSnippets.xyz`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const techArticleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: TITLE,
  description: DESCRIPTION,
  url: `${SITE_URL}/guides/bash-scripts-that-survive-cron`,
  datePublished: '2026-06-22',
  dateModified: '2026-06-22',
  author: {
    '@type': 'Person',
    name: 'Anguishe',
    url: `${SITE_URL}/about`,
  },
  publisher: {
    '@type': 'Organization',
    name: 'BashSnippets.xyz',
    url: SITE_URL,
  },
  image: `${SITE_URL}/ogimage.png`,
  inLanguage: 'en',
  articleSection: 'Guides',
  keywords: [
    'bash cron',
    'flock',
    'timeout command',
    'retry with backoff',
    'single instance lock',
    'cron jobs',
    'unattended scripts',
    'linux automation',
  ].join(', '),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
    {
      '@type': 'ListItem',
      position: 3,
      name: BREADCRUMB,
      item: `${SITE_URL}/guides/bash-scripts-that-survive-cron`,
    },
  ],
};

export default async function BashScriptsThatSurviveCronGuide() {
  const getContent = async () => {
    try {
      const mod = await import('@/content/guides/bash-scripts-that-survive-cron.mdx');
      return mod.default;
    } catch (error) {
      console.error('[MDX] Failed to load guide: bash-scripts-that-survive-cron', error);
      return null;
    }
  };

  const Content = await getContent();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides' },
            { label: BREADCRUMB },
          ]}
        />

        <h1 className="font-heading text-4xl font-extrabold leading-tight text-text md:text-5xl">
          {TITLE}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
          <span>Published: June 22, 2026</span>
          <span aria-hidden>·</span>
          <span>9 min read</span>
        </div>

        <article className="prose-snippet mt-10">
          {Content ? (
            <Content components={mdxComponents} />
          ) : (
            <p className="text-muted">Content temporarily unavailable.</p>
          )}
        </article>

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/guides" className="font-mono text-sm text-muted transition-colors hover:text-text">
            ← All guides
          </Link>
        </div>
      </main>
    </>
  );
}
