import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import { snippets } from '@/lib/snippets';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'About BashSnippets — Bash Script Author & Linux Developer',
  description:
    `BashSnippets is a free bash script library built by a self-taught Linux developer. ${snippets.length} tested scripts, 6 browser tools, zero logins. Learn who built it and how.`,
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About BashSnippets — Bash Script Author & Linux Developer',
    description: `BashSnippets is a free bash script library built by a self-taught Linux developer. ${snippets.length} tested scripts, 6 browser tools, zero logins.`,
    url: `${SITE_URL}/about`,
    type: 'website',
    images: [{ url: 'https://bashsnippets.xyz/ogimage.png', width: 1200, height: 630, alt: 'About BashSnippets — Bash Script Library' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About BashSnippets — Bash Script Author & Linux Developer',
    description: `BashSnippets is a free bash script library built by a self-taught Linux developer. ${snippets.length} tested scripts, 6 browser tools, zero logins.`,
  },
};

const aboutSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'About BashSnippets',
    url: `${SITE_URL}/about`,
    description: `BashSnippets is a free bash script library built by a self-taught Linux developer. ${snippets.length} tested scripts, 6 browser tools, zero logins.`,
    isPartOf: { '@type': 'WebSite', name: 'BashSnippets.xyz', url: SITE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Anguishe',
    '@id': `${SITE_URL}/about`,
    url: `${SITE_URL}/about`,
    jobTitle: 'Linux Developer & Bash Script Author',
    description: 'Self-taught Linux developer based in Florida. Builds and maintains BashSnippets.xyz — a free bash script library for sysadmins and DevOps engineers.',
    worksFor: {
      '@type': 'Organization',
      name: 'BashSnippets',
      url: SITE_URL,
    },
    email: 'anguisheh1@gmail.com',
    sameAs: [
      'https://youtube.com/@BashSnippets',
      'https://dev.to/bashsnippets',
      'https://github.com/anguishe/bash-scripts',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      {aboutSchemas.map((schema) => (
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
            { label: 'About' },
          ]}
        />

        <h1 className="font-heading text-4xl font-extrabold text-text">
          About BashSnippets
        </h1>

        <section className="mt-10">
          <h2 className="mb-3 font-heading text-xl font-bold text-text">
            Who runs it
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            BashSnippets is a free bash script library run by a self-taught Linux
            developer based in Florida. Started on Ubuntu in 2013, moved through
            Debian and Fedora as different jobs demanded different environments,
            and picked up enough bash along the way to automate the repetitive
            parts of sysadmin work.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The site started because I kept re-writing the same scripts. Disk
            monitoring. Log cleanup. Service watchdogs. The third time I wrote a
            disk space checker for a different employer, I decided to document it
            properly instead of burying it in <code className="font-mono text-xs text-green">~/scripts</code>.
            That folder became this site.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Everything here comes from real operational use — scripts I&apos;ve run on
            production servers, broken at least once, and fixed. The explanations
            exist because I spent time figuring out why the standard one-liners
            fail on edge cases: the wrong partition, macOS <code className="font-mono text-xs text-green">df</code> output
            formatting, cron&apos;s minimal PATH. Rather than explain that again, I
            wrote it up once.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl font-bold text-text">
            Why bash?
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Bash runs on every Linux server without anything installed. Scripts
            that depend on Python virtual environments, Node.js, or Ruby introduce
            dependency problems on servers that don&apos;t have those runtimes or have
            conflicting versions. A bash script is a text file. Any sysadmin can
            read it, audit it, and run it in under a minute.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The constraint of keeping things in bash also forces clarity. If you
            can&apos;t implement something cleanly in bash, that&apos;s often a sign the
            script is trying to do too much. The right answer is usually a smaller,
            focused script rather than a bash script pretending to be an
            application.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl font-bold text-text">
            How scripts are tested
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Every script on this site runs on Ubuntu 22.04 LTS before it goes up.
            Scripts with filesystem or process interactions also get tested on
            Debian 12. macOS notes come from running the same scripts on macOS
            Ventura using Homebrew&apos;s bash 5.x — macOS ships bash 3.2 from 2007,
            which is missing features these scripts rely on.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            I test the failure cases, not just the happy path. The &quot;Common
            Mistakes&quot; sections on each page come from things that actually
            broke during testing — and from watching the same mistakes show up in
            production support tickets repeatedly. Scripts that don&apos;t behave
            correctly under failure conditions don&apos;t make it onto the site.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl font-bold text-text">
            What&apos;s on the site
          </h2>
          <div className="my-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              [`${snippets.length} bash scripts`, 'Copy-paste ready, plain-English explanations'],
              ['6 interactive tools', 'Cron builder, chmod calc, exit code lookup'],
              ['Zero logins', 'No account, no email, no paywall'],
              ['MIT licensed', 'Use the scripts anywhere, including production'],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded border border-border bg-bg2 p-4"
              >
                <p className="text-sm font-semibold text-green">{title}</p>
                <p className="mt-1 text-xs text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl font-bold text-text">Stack</h2>
          <p className="text-sm leading-relaxed text-muted">
            Static HTML migrated to Next.js 15 with TypeScript and MDX. Hosted on
            Vercel. Scripts tested on Ubuntu 22.04 LTS, Debian 12, Fedora 39, and
            macOS Ventura. The site has no database — snippet content lives in MDX
            files, and tools are standalone HTML pages served as iframes so they
            can be updated independently without touching the Next.js app.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            Recommended hosting &amp; domains
          </h2>
          <AffiliateBox partner="digitalocean" className="!my-6" />
          <AffiliateBox partner="namecheap" className="!my-6" />
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl font-bold text-text">
            Get in touch
          </h2>
          <p className="text-sm text-muted">
            <a
              href="mailto:anguisheh1@gmail.com"
              className="text-blue transition-colors hover:text-text"
            >
              anguisheh1@gmail.com
            </a>
          </p>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://youtube.com/@BashSnippets"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-green hover:text-green"
          >
            YouTube @BashSnippets ↗
          </a>
          <a
            href="https://dev.to/bashsnippets"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-green hover:text-green"
          >
            dev.to/bashsnippets ↗
          </a>
          <a
            href="https://github.com/anguishe/bash-scripts"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-green hover:text-green"
          >
            GitHub scripts repo ↗
          </a>
        </div>

        <p className="mt-12 text-sm text-muted">
          <Link href="/snippets" className="text-blue hover:text-text">
            Browse the script library →
          </Link>
        </p>
      </main>
    </>
  );
}
