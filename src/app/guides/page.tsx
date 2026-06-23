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
    blurb:
      'You walk away with a provisioning checklist, not a reading list: the exact scripts that prevent a disk-full outage, a silent SSL expiry, a service that died over the weekend, and a permission hole on a fresh web root. It is organized by failure mode, so you can jump straight to the problem you are trying to prevent and leave with the cron entry that prevents it.',
  },
  {
    slug: 'bash-scripting-for-ci-cd-pipelines',
    title: 'Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker',
    description:
      'A pipeline reported every step green and deployed broken code, because the build step piped output through tee and bash returned the exit code of tee — always zero. This guide covers the four CI-specific failure modes, safe bash headers, secret validation, PIPESTATUS and pipefail, Docker entrypoints, atomic symlink deploys, and debugging with set -x.',
    blurb:
      'You leave with a deploy script that fails loudly, rolls back automatically, and passes a health check before marking success — not one that ships broken builds under a green checkmark.',
  },
  {
    slug: 'bash-text-processing',
    title: 'Bash Text Processing: find, grep, sed, and awk for Logs and Config Files',
    description:
      'The four commands that turn an unreadable log or a tree of config files into an answer — find to locate, grep to search, sed to transform, awk to summarize. The order matters, and the gotchas are the reason most one-liners do the wrong thing quietly.',
    blurb:
      'You leave with the pipeline order that keeps text processing boring: scope the blast radius with find, confirm the match with grep, transform with sed or awk under an undo, and verify before you trust it — plus the 2am incident one-liner that ranks your errors most-frequent-first.',
  },
  {
    slug: 'bash-scripts-that-survive-cron',
    title: 'Bash Scripts That Survive Cron: Locking, Timeouts, and Retries',
    description:
      'A script that works when you run it isn\'t the same as one that survives unattended on cron. The three ways cron jobs die quietly — overlap, hang, transient failure — and the guards that stop each one.',
    blurb:
      'The three ways cron jobs die quietly — overlap, hang, transient failure — and the guard that stops each.',
  },
] as const;

const STRONGEST_GUIDE = guides[0];

export const metadata: Metadata = {
  title: { absolute: 'Bash Guides | BashSnippets.xyz' },
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
      <h2 className="font-heading text-base font-bold leading-snug text-text">
        {guide.title}
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">{guide.description}</p>
      <p className="mt-3 flex-1 text-xs leading-relaxed text-muted">{guide.blurb}</p>
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

        <div className="mt-6 max-w-2xl space-y-5 leading-relaxed text-muted">
          <p>
            Snippets and guides solve different problems. A snippet is one task and one script:
            check disk space, kill a process on a port, dump a database. You land on it from a
            search, copy the script, schedule it, and move on. A guide is the layer above that — an
            end-to-end workflow that composes several scripts into a system, with the judgment about
            which to run, in what order, and why. Snippets answer &ldquo;how do I do X&rdquo;; guides
            answer &ldquo;what should I actually run on a production server, and how do these pieces
            fit together.&rdquo;
          </p>
          <p>
            Guides are for the moment you have outgrown copy-paste. You have a server that matters, a
            handful of scripts already on cron, and the questions have shifted: which checks do I
            actually need, how do detection and alerting and recovery connect, what does a sane
            baseline look like for a box I just provisioned. The individual snippet pages cannot
            answer that — each describes one tool in isolation. A guide is where the cross-cutting
            decisions live.
          </p>
          <p>
            Every guide here is built from scripts you can also find as standalone snippets, so
            nothing is locked behind the long-form. The guide adds the sequencing and the reasoning;
            the snippets stay the reference you return to when you need just the command.
          </p>
        </div>

        <div className="mt-10 rounded-lg border border-blue bg-blue-dim/40 p-5">
          <span className="font-mono text-xs uppercase tracking-widest text-blue">
            Start here
          </span>
          <p className="mt-2 leading-relaxed text-text">
            New to the site? Begin with{' '}
            <Link
              href={`/guides/${STRONGEST_GUIDE.slug}`}
              className="font-semibold text-blue transition-colors hover:text-text"
            >
              {STRONGEST_GUIDE.title}
            </Link>
            . It is the widest-coverage guide here — a single pass that hardens a fresh server
            against the four failures that take production down most often, with every script ready
            to copy and schedule.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </main>
    </>
  );
}
