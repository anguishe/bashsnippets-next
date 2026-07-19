import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { mdxComponents } from '@/components/MDXComponents';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

const TITLE =
  'Bash Text Processing: find, grep, sed, and awk for Logs and Config Files';
const DESCRIPTION =
  'The four commands that turn an unreadable log or a tree of config files into an answer — find to locate, grep to search, sed to transform, awk to summarize. The order matters, and the gotchas are the reason most one-liners do the wrong thing quietly.';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | BashSnippets.xyz` },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/guides/bash-text-processing`,
  },
  openGraph: {
    title: `${TITLE} | BashSnippets.xyz`,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides/bash-text-processing`,
    type: 'article',
    publishedTime: '2026-06-17T00:00:00Z',
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
  url: `${SITE_URL}/guides/bash-text-processing`,
  datePublished: '2026-06-17',
  dateModified: '2026-06-17',
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
  articleSection: 'Linux Administration',
  keywords: [
    'bash text processing',
    'find command',
    'grep',
    'sed',
    'awk',
    'log analysis',
    'config files',
    'linux command line',
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
      name: TITLE,
      item: `${SITE_URL}/guides/bash-text-processing`,
    },
  ],
};

export default async function BashTextProcessingGuide() {
  const getContent = async () => {
    try {
      const mod = await import('@/content/guides/bash-text-processing.mdx');
      return mod.default;
    } catch (error) {
      console.error('[MDX] Failed to load guide: bash-text-processing', error);
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
            { label: TITLE },
          ]}
        />

        <h1 className="font-heading text-4xl font-extrabold leading-tight text-text md:text-5xl">
          {TITLE}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
          <span>Published: June 17, 2026</span>
          <span aria-hidden>·</span>
          <span>12 min read</span>
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
