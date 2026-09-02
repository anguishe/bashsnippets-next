import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { mdxComponents } from '@/components/MDXComponents';
import { AUTHOR } from '@/lib/author';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

const TITLE =
  'List Open Ports on Linux: With the Process, Without Root, and Without netstat';
const DESCRIPTION =
  '"List open ports" is three questions — what is listening, who owns it, and is it reachable — and each needs a different command. ss with the filters and flags that matter, the -e trick that names the owning service without root, /proc/net/tcp by hand, lsof and fuser for the PID, nc and /dev/tcp for one port, what docker-proxy hides, and a CSV audit script that alerts once when a new listener appears.';

const BREADCRUMB = 'List Open Ports';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | BashSnippets.xyz` },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/guides/open-ports-linux`,
  },
  openGraph: {
    title: `${TITLE} | BashSnippets.xyz`,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides/open-ports-linux`,
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
  url: `${SITE_URL}/guides/open-ports-linux`,
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
    'list open ports linux',
    'linux list all open ports',
    'list open ports without netstat',
    'list open ports without root',
    'ss -ltnp',
    'which process is using a port linux',
    'check if port is open linux',
    'ss vs netstat',
    'lsof listening ports',
    'docker-proxy port',
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
      item: `${SITE_URL}/guides/open-ports-linux`,
    },
  ],
};

export default async function OpenPortsLinuxGuide() {
  const getContent = async () => {
    try {
      const mod = await import('@/content/guides/open-ports-linux.mdx');
      return mod.default;
    } catch (error) {
      console.error('[MDX] Failed to load guide: open-ports-linux', error);
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
