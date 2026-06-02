import AffiliateBox from '@/components/AffiliateBox';
import { tools } from '@/lib/tools';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Bash Tools – BashSnippets.xyz',
  description:
    'Free interactive bash tools: cron job builder, chmod calculator, exit code lookup, PATH debugger, boilerplate generator, and ShellCheck decoder.',
  alternates: {
    canonical: `${SITE_URL}/tools`,
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Interactive Bash Tools',
  url: `${SITE_URL}/tools`,
  description:
    'Free interactive bash tools: cron job builder, chmod calculator, exit code lookup, PATH debugger, boilerplate generator, and ShellCheck decoder.',
  hasPart: tools.map((tool) => ({
    '@type': 'WebApplication',
    name: tool.title,
    url: `${SITE_URL}/tools/${tool.slug}`,
    description: tool.description,
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
      name: 'Tools',
      item: `${SITE_URL}/tools`,
    },
  ],
};

export default function ToolsPage() {
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
        <p className="mb-2 text-xs uppercase tracking-widest text-green">
          {'// free tools'}
        </p>

        <h1 className="font-heading text-4xl font-extrabold text-text">
          Interactive Bash Tools
        </h1>

        <p className="mb-12 mt-4 max-w-xl text-muted">
          Browser-based tools for bash scripting. No install, no login, no fluff.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block rounded-lg border border-border bg-bg2 p-5 no-underline transition-all duration-200 hover:border-green"
            >
              <p className="mb-2 text-xs uppercase tracking-widest text-muted">
                {tool.category}
              </p>
              <p className="mb-1 font-heading font-bold text-text">
                {tool.title}
              </p>
              <p className="text-sm leading-relaxed text-muted">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>

        <AffiliateBox partner="digitalocean" className="mt-16" />
      </main>
    </>
  );
}
