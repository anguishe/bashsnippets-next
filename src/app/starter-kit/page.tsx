import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';
const GUMROAD_URL = 'https://anguish0.gumroad.com/l/toolkit';

export const metadata: Metadata = {
  title: 'Production Bash Toolkit — Scripts + Library + Field Guide | BashSnippets.xyz',
  description:
    '6 production scripts, bashlib.sh shared library, template.sh, and a 52-page field guide. ShellCheck-clean. $9 instant download.',
  alternates: {
    canonical: `${SITE_URL}/starter-kit`,
  },
  openGraph: {
    title: 'Production Bash Toolkit — Scripts + Library + Field Guide | BashSnippets.xyz',
    description:
      '6 production scripts, bashlib.sh shared library, template.sh, and a 52-page field guide. ShellCheck-clean. $9 instant download.',
    url: `${SITE_URL}/starter-kit`,
    type: 'website',
    images: [
      {
        url: 'https://bashsnippets.xyz/ogimage.png',
        width: 1200,
        height: 630,
        alt: 'Production Bash Toolkit — BashSnippets.xyz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Production Bash Toolkit — Scripts + Library + Field Guide | BashSnippets.xyz',
    description:
      '6 production scripts, bashlib.sh shared library, template.sh, and a 52-page field guide. ShellCheck-clean. $9 instant download.',
  },
};

const starterKitSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Bash Automation Starter Kit',
    description:
      '6 production scripts, bashlib.sh shared library, template.sh, and a 52-page field guide. ShellCheck-clean.',
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
          The Production Bash Toolkit
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
            What&apos;s in the ZIP
          </h2>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">backup.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                tar.gz archives with sha256 sidecars, read-back integrity test,
                retention rotation, and optional rsync offsite with retry.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">healthcheck.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                One cron job that checks disk, memory, load, services, and URLs
                against your thresholds. One alert when something is wrong.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">cron-wrapper.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Gives any command a sane PATH, locale, working directory, lock,
                timeout, and failure alert with the log tail attached.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">cleanup.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Retention cleanup that defaults to dry-run. You must pass --apply
                to actually delete anything.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">bashlib.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                31-function shared library. Leveled logging that survives cron,
                error traps that name the failing line, retry with exponential backoff,
                single-instance locking, safe delete guards, and a notify() that pages
                you in production and does nothing on your laptop.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">template.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Strict mode, dry-run, --help, and flag parsing already wired in.
                Copy it, fill in the logic, done.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">
                  52-page field guide (PDF)
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Five gotchas in set -e, why scripts die in cron, macOS vs Linux
                portability, quoting and word splitting, safe destructive operations,
                a debugging playbook, and handling secrets in CI.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            What&apos;s included
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            6 production scripts + bashlib.sh (31-function shared library) + template.sh +
            52-page field guide. ShellCheck-clean. Runs on Ubuntu 22.04+, Debian 12, macOS
            with Homebrew bash. MIT license — unlimited personal and commercial use.
          </p>
        </section>

        <div className="mt-10">
          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
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
