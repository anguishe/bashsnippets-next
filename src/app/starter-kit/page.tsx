import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';
const GUMROAD_URL = 'https://anguish0.gumroad.com/l/toolkit';

export const metadata: Metadata = {
  title: 'Production Bash Toolkit — Field Guide + Script System | BashSnippets.xyz',
  description:
    'The Production Bash Toolkit: a 52-page PDF field guide plus a ZIP with a cohesive operational script system, bashlib.sh shared library, template.sh, README, LICENSE, and examples. ShellCheck-clean. $9 instant download.',
  alternates: {
    canonical: `${SITE_URL}/starter-kit`,
  },
  openGraph: {
    title: 'Production Bash Toolkit — Field Guide + Script System | BashSnippets.xyz',
    description:
      '52-page PDF field guide plus a ZIP with an operational bash script system, bashlib.sh, template.sh, README, LICENSE, and examples. ShellCheck-clean. $9 instant download.',
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
    title: 'Production Bash Toolkit — Field Guide + Script System | BashSnippets.xyz',
    description:
      '52-page PDF field guide plus a ZIP with an operational bash script system, bashlib.sh, template.sh, README, LICENSE, and examples. ShellCheck-clean. $9 instant download.',
  },
};

const starterKitSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'The Production Bash Toolkit',
    description:
      'A 52-page PDF field guide plus a ZIP containing a cohesive operational bash script system, bashlib.sh shared library, template.sh, README, LICENSE, and examples. ShellCheck-clean.',
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
        name: 'Production Bash Toolkit',
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
            { label: 'Production Bash Toolkit' },
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
            Free snippets solve one problem at a time. Production servers need a
            baseline that ships together: backup integrity checks before the disk
            fills, health monitoring that fires one alert instead of five cron
            emails, SSL expiry warnings before customers hit certificate errors,
            and retention cleanup that defaults to dry-run so a typo does not
            wipe a log directory. The Production Bash Toolkit is that baseline —
            not a grab bag of unrelated files, but a cohesive operational system
            you copy to{' '}
            <code className="font-mono text-xs text-green">/opt/scripts</code> on
            every new host before anything else goes live.
          </p>
          <p>
            Built for Linux sysadmins, DevOps engineers, and solo operators who
            maintain real servers — VPS instances, bare metal, homelab boxes that
            actually send mail when something breaks. If you have copied snippets
            from blog posts and spent an afternoon debugging why they behave
            differently under cron, or why{' '}
            <code className="font-mono text-xs text-green">set -e</code> silently
            skipped your error handler, this toolkit removes that rework. Every
            component shares the same conventions: strict mode, named thresholds,
            comments that explain why a line exists, and ShellCheck-clean output
            so your CI pipeline and pre-commit hooks do not fight the download.
          </p>
          <p>
            What you get is two deliverables. A 52-page PDF field guide covers the
            failure modes that do not show up in man pages — why bash dies in cron
            with a different PATH, macOS vs Linux portability traps, quoting bugs
            that pass locally and explode in production, and how to handle secrets
            in CI without leaking them in process listings. The ZIP holds the
            runnable system: an interconnected set of operational scripts, a
            31-function shared library, a copy-paste template for new work,
            worked examples, plus README and LICENSE files so you know exactly
            what you are allowed to deploy commercially.
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
                tar.gz archives with sha256 sidecars, read-back integrity verification,
                retention rotation, and optional rsync offsite with retry. Runs
                before you discover the backup was hollow.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">healthcheck.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                One cron entry that checks disk, memory, load, services, and HTTP
                endpoints against your thresholds. One alert when something crosses
                a line — not five separate emails you learn to ignore.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">cron-wrapper.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Wraps any command with a sane PATH, locale, working directory,
                lock file, timeout, and failure alert that attaches the log tail.
                Stops cron jobs from failing silently because the environment
                differs from your SSH session.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">cleanup.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Retention cleanup that defaults to dry-run. You must pass{' '}
                <code className="font-mono text-xs text-green">--apply</code> to
                delete anything — a mistyped path does not become an incident.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">bashlib.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                31-function shared library sourced by every script in the system.
                Leveled logging that survives cron redirection, error traps that
                name the failing line, retry with exponential backoff,
                single-instance locking, safe-delete guards, and a notify()
                function that pages you in production and stays quiet on your
                laptop.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">template.sh</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Strict mode, dry-run flag, --help, and argument parsing already
                wired in. Copy it, source bashlib.sh, fill in your logic. New
                internal tools inherit the same standards as the rest of the
                toolkit on day one.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg2 p-4">
              <p>
                <span className="font-mono font-semibold text-green">README + LICENSE + examples</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Deployment order, sourcing conventions, and MIT license terms
                spelled out. Worked examples show how each script composes with
                bashlib.sh so you are not guessing which functions to call.
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
                portability, quoting and word splitting, safe destructive
                operations, a step-by-step debugging playbook, and handling
                secrets in CI. Reference material you keep open while wiring
                the ZIP contents into your environment.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            Why ShellCheck-clean matters
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            ShellCheck catches quoting bugs, unreachable code, and portability
            hazards before they reach a production cron entry. Scripts that fail
            ShellCheck in CI tend to fail in subtler ways on real systems — a
            word-splitting bug that passes on your laptop but truncates a path
            under cron, or an unset variable that{' '}
            <code className="font-mono text-xs text-green">set -u</code> turns
            into a 3am page. Every file in this toolkit passes ShellCheck with
            no suppressions. That means you can drop the ZIP into a repo with
            existing shell lint gates and not carve out exceptions. For teams
            that treat bash as production code, not glue, that difference shows
            up the first time someone runs{' '}
            <code className="font-mono text-xs text-green">shellcheck *.sh</code>{' '}
            and gets zero warnings.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            Who this is for
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Operators who deploy and maintain Linux servers and want a vetted
            starting point instead of assembling fragments from a dozen blog
            posts. Freelance sysadmins onboarding a new client VPS. Homelab
            builders who need monitoring and backups that actually notify.
            Junior admins who understand bash syntax but have not yet internalized
            why cron breaks scripts that work fine interactively. The toolkit
            does not replace understanding — the field guide is there for that
            — but it removes the blank-page problem of wiring strict mode,
            logging, locking, and alerts consistently across every script you
            ship.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            What&apos;s included
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            One ZIP download plus one PDF. The ZIP contains the full operational
            script system, bashlib.sh (31-function shared library), template.sh,
            README, LICENSE, and examples. The PDF is the 52-page field guide.
            Everything is ShellCheck-clean. Tested on Ubuntu 22.04+, Debian 12,
            and macOS with Homebrew bash. MIT license — unlimited personal and
            commercial use, no attribution required in your cron output.
          </p>
        </section>

        <div className="mt-10">
          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-green px-6 py-3 font-mono text-sm font-semibold text-bg no-underline transition-colors hover:bg-[#2ea043]"
          >
            Get the Production Bash Toolkit — $9 →
          </a>
          <p className="mt-3 font-mono text-xs text-muted">
            Instant download · MIT License · No subscription
          </p>
        </div>

        <AffiliateBox
          partner="digitalocean"
          headline="Need somewhere to run the toolkit? DigitalOcean droplets from $4/mo."
          className="!my-10"
        />

        <p className="mt-12 text-sm text-muted">
          <Link href="/snippets" className="text-blue hover:text-text">
            ← Back to free snippets
          </Link>
        </p>
      </main>
    </>
  );
}
