import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { mdxComponents } from '@/components/MDXComponents';
import { AUTHOR } from '@/lib/author';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

const TITLE =
  'Auto-Restart a Stopped Service on Linux: systemd Restart=, Cron Watchdogs, and the Start-Limit Trap';
const DESCRIPTION =
  '"Down" is three different states — crashed, stopped on purpose, or running but not answering — and a watchdog that checks systemctl is-active handles exactly one of them. Let systemd restart crashes with Restart=, clear the start-limit trap that makes systemctl start refuse, probe for the hung case, and alert once per outage instead of once per minute.';

const BREADCRUMB = 'Auto-Restart a Service';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | BashSnippets.xyz` },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/guides/auto-restart-linux-service`,
  },
  openGraph: {
    title: `${TITLE} | BashSnippets.xyz`,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides/auto-restart-linux-service`,
    type: 'article',
    publishedTime: '2026-09-01T00:00:00Z',
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
  url: `${SITE_URL}/guides/auto-restart-linux-service`,
  datePublished: '2026-09-01',
  dateModified: '2026-09-01',
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
    'auto restart linux service',
    'restart service if stopped bash script',
    'systemctl is-active exit code',
    'systemd Restart=on-failure',
    'start request repeated too quickly',
    'systemctl reset-failed',
    'cron service watchdog',
    'monitor a service and restart if stopped linux',
    'service running but not responding',
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
      item: `${SITE_URL}/guides/auto-restart-linux-service`,
    },
  ],
};

export default async function AutoRestartLinuxServiceGuide() {
  const getContent = async () => {
    try {
      const mod = await import('@/content/guides/auto-restart-linux-service.mdx');
      return mod.default;
    } catch (error) {
      console.error('[MDX] Failed to load guide: auto-restart-linux-service', error);
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
          <span>Published: September 1, 2026</span>
          <span aria-hidden>·</span>
          <span>11 min read</span>
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
