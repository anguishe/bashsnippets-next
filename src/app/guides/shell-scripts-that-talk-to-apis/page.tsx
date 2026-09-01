import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { mdxComponents } from '@/components/MDXComponents';
import { AUTHOR } from '@/lib/author';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

const TITLE = 'Shell Scripts That Talk to APIs';
const DESCRIPTION =
  'The reliable pattern for calling an HTTP API from bash: make curl fail when the API fails, parse the response with jq instead of regex, and alert to Slack when it breaks — with a full fetch → parse → alert script.';

const BREADCRUMB = 'Shell Scripts That Talk to APIs';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | BashSnippets.xyz` },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/guides/shell-scripts-that-talk-to-apis`,
  },
  openGraph: {
    title: `${TITLE} | BashSnippets.xyz`,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides/shell-scripts-that-talk-to-apis`,
    type: 'article',
    publishedTime: '2026-07-08T00:00:00Z',
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
  url: `${SITE_URL}/guides/shell-scripts-that-talk-to-apis`,
  datePublished: '2026-07-08',
  dateModified: '2026-07-08',
  author: { '@type': 'Person', ...AUTHOR },
  publisher: {
    '@type': 'Organization',
    name: 'BashSnippets.xyz',
    url: SITE_URL,
  },
  image: `${SITE_URL}/ogimage.png`,
  inLanguage: 'en',
  articleSection: 'Guides',
  keywords: [
    'bash api',
    'curl http status',
    'parse json bash',
    'jq',
    'slack webhook bash',
    'curl retry',
    'shell script api',
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
      item: `${SITE_URL}/guides/shell-scripts-that-talk-to-apis`,
    },
  ],
};

export default async function ShellScriptsThatTalkToApisGuide() {
  const getContent = async () => {
    try {
      const mod = await import('@/content/guides/shell-scripts-that-talk-to-apis.mdx');
      return mod.default;
    } catch (error) {
      console.error('[MDX] Failed to load guide: shell-scripts-that-talk-to-apis', error);
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
          <span>Published: July 8, 2026</span>
          <span aria-hidden>·</span>
          <span>7 min read</span>
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
