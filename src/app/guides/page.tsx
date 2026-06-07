import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

const guides = [
  {
    slug: 'bash-scripts-every-sysadmin-needs',
    title: '25 Bash Scripts Every Linux Sysadmin Needs',
    description:
      'The 25 bash scripts that prevent the most common server failures — disk full, SSL expiry, failed services, insecure permissions. Copy-paste ready, cron-schedulable, no installs required.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Bash Guides | BashSnippets.xyz',
  description: 'In-depth bash guides for Linux sysadmins.',
  alternates: {
    canonical: `${SITE_URL}/guides`,
  },
  openGraph: {
    title: 'Bash Guides | BashSnippets.xyz',
    description: 'In-depth bash guides for Linux sysadmins.',
    url: `${SITE_URL}/guides`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/ogimage.png`,
        width: 1200,
        height: 630,
        alt: 'BashSnippets — Bash Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bash Guides | BashSnippets.xyz',
    description: 'In-depth bash guides for Linux sysadmins.',
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Bash Guides',
  url: `${SITE_URL}/guides`,
  description: 'In-depth bash guides for Linux sysadmins.',
  hasPart: guides.map((guide) => ({
    '@type': 'TechArticle',
    name: guide.title,
    url: `${SITE_URL}/guides/${guide.slug}`,
    description: guide.description,
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
      name: 'Guides',
      item: `${SITE_URL}/guides`,
    },
  ],
};

function GuideCard({ guide }: { guide: (typeof guides)[number] }) {
  return (
    <article className="group relative flex min-h-[148px] flex-col overflow-hidden rounded-lg border border-border bg-bg2 p-5 transition-colors duration-150 hover:border-green">
      <div
        className="absolute left-0 top-0 h-0.5 w-0 bg-green transition-all duration-300 group-hover:w-full"
        aria-hidden
      />
      <span className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
        pillar guide · sysadmin
      </span>
      <h2 className="flex-1 font-heading text-base font-bold leading-snug text-text">
        {guide.title}
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">{guide.description}</p>
      <Link
        href={`/guides/${guide.slug}`}
        className="mt-4 font-mono text-xs text-green transition-colors hover:text-text"
      >
        Read guide →
      </Link>
    </article>
  );
}

export default function GuidesPage() {
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
            { label: 'Guides' },
          ]}
        />

        <div className="mb-6 flex items-center gap-2 font-mono text-sm text-muted">
          <span className="text-green">$</span>
          <span>bash-guides</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-green" aria-hidden />
        </div>

        <h1 className="font-heading text-4xl font-extrabold text-text">Bash Guides</h1>

        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          In-depth bash guides for Linux sysadmins — curated collections, failure scenarios, and
          copy-paste scripts you can schedule tonight.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </main>
    </>
  );
}
