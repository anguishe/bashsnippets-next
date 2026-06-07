import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';
const GUMROAD_URL = 'GUMROAD_URL_PLACEHOLDER';

export const metadata: Metadata = {
  title: 'Bash Automation Starter Kit — 30 Scripts for Linux Sysadmins | BashSnippets.xyz',
  description:
    'The 30 bash scripts I actually run on production servers — pre-tested, pre-commented, ready to paste. $9. Instant download.',
  alternates: {
    canonical: `${SITE_URL}/starter-kit`,
  },
  openGraph: {
    title: 'Bash Automation Starter Kit — 30 Scripts for Linux Sysadmins | BashSnippets.xyz',
    description:
      'The 30 bash scripts I actually run on production servers — pre-tested, pre-commented, ready to paste. $9. Instant download.',
    url: `${SITE_URL}/starter-kit`,
    type: 'website',
    images: [
      {
        url: 'https://bashsnippets.xyz/ogimage.png',
        width: 1200,
        height: 630,
        alt: 'Bash Automation Starter Kit — BashSnippets.xyz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bash Automation Starter Kit — 30 Scripts for Linux Sysadmins | BashSnippets.xyz',
    description:
      'The 30 bash scripts I actually run on production servers — pre-tested, pre-commented, ready to paste. $9. Instant download.',
  },
};

const starterKitSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Bash Automation Starter Kit',
    description:
      '30 production-tested bash scripts for Linux and DevOps — pre-commented, instant download.',
    offers: {
      '@type': 'Offer',
      price: '9.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Bash Automation Starter Kit',
        item: `${SITE_URL}/starter-kit`,
      },
    ],
  },
];

export default function StarterKitPage() {
  return (
    <>
      {starterKitSchemas.map((schema) => (
        <script
          key={schema['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Bash Automation Starter Kit' },
          ]}
        />

        <h1 className="font-heading text-4xl font-extrabold text-text">
          The 30 bash scripts I actually run on every server I manage
        </h1>

        <p className="mt-4 font-mono text-sm text-green">
          $9 — instant download — MIT license
        </p>

        <div className="mt-10 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            These aren&apos;t tutorials. These are the scripts I SSH in and copy to{' '}
            <code className="font-mono text-xs text-green">/opt/scripts</code> on every
            new server before I do anything else. Disk monitoring that fires before the
            outage. A backup pipeline that handles retention automatically. SSL expiry
            checks that run daily at 8am. Service watchdogs that restart things before
            users notice.
          </p>
          <p>
            Every script follows the same format:{' '}
            <code className="font-mono text-xs text-green">set -euo pipefail</code>, named
            variables for every threshold, comments explaining WHY each line exists.
            Copy-paste ready. No setup, no configuration wizards, no install scripts.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            What&apos;s included
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed text-muted">
            <li>
              10 monitoring scripts (disk, CPU, RAM, website uptime, SSL expiry, service
              health)
            </li>
            <li>8 backup automation scripts (files, databases, rsync offsite)</li>
            <li>5 security audit scripts (port inventory, permissions, SSH hardening)</li>
            <li>
              4 DevOps utility scripts (Docker cleanup, log rotation, process management)
            </li>
            <li>3 bash scripting templates (error handling, retry logic, trap patterns)</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Plus: the production-ready bash script template file I start every new script
            from.
          </p>
        </section>

        <div className="mt-10">
          <a
            href={GUMROAD_URL}
            className="inline-block rounded-md bg-green px-6 py-3 font-mono text-sm font-semibold text-bg no-underline transition-colors hover:bg-[#2ea043]"
          >
            Get the Starter Kit — $9 →
          </a>
          <p className="mt-3 font-mono text-xs text-muted">
            Instant download · MIT License · No subscription
          </p>
        </div>

        <AffiliateBox
          partner="digitalocean"
          headline="Already have scripts — need somewhere to run them? DigitalOcean droplets from $4/mo."
          className="!my-10"
        />

        <p className="mt-12 text-sm text-muted">
          <Link href="/snippets" className="text-blue hover:text-text">
            ← Back to free scripts
          </Link>
        </p>
      </main>
    </>
  );
}
