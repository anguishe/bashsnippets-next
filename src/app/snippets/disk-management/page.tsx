import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import FaqTerminal from '@/components/FaqTerminal';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Linux Disk Management Scripts — Find and Free Space Before the Disk Fills | BashSnippets.xyz',
  description:
    'Bash scripts for finding large files, cleaning up old logs, removing duplicate files, and monitoring disk usage on Linux. Prevent the disk-full outage before it happens.',
  alternates: {
    canonical: `${SITE_URL}/snippets/disk-management`,
  },
  openGraph: {
    title: 'Linux Disk Management Scripts — Find and Free Space Before the Disk Fills | BashSnippets.xyz',
    description:
      'Bash scripts for finding large files, cleaning up old logs, removing duplicate files, and monitoring disk usage on Linux. Prevent the disk-full outage before it happens.',
    url: `${SITE_URL}/snippets/disk-management`,
    type: 'website',
    images: [{ url: `${SITE_URL}/ogimage.png`, width: 1200, height: 630, alt: 'BashSnippets — Disk Management Scripts' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linux Disk Management Scripts — Find and Free Space Before the Disk Fills | BashSnippets.xyz',
    description:
      'Bash scripts for finding large files, cleaning up old logs, removing duplicate files, and monitoring disk usage on Linux. Prevent the disk-full outage before it happens.',
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Linux Disk Management Bash Scripts',
  url: `${SITE_URL}/snippets/disk-management`,
  description:
    'Bash scripts for monitoring disk usage, finding large files, cleaning up old logs, removing duplicates, and reclaiming Docker storage on Linux.',
  hasPart: [
    { '@type': 'TechArticle', name: 'Disk Space Warning Script', url: `${SITE_URL}/snippets/disk-space-warning` },
    { '@type': 'TechArticle', name: 'Find Large Files in Linux', url: `${SITE_URL}/snippets/find-large-files-linux` },
    { '@type': 'TechArticle', name: 'Delete Old Log Files', url: `${SITE_URL}/snippets/delete-old-log-files` },
    { '@type': 'TechArticle', name: 'Find Duplicate Files', url: `${SITE_URL}/snippets/find-duplicate-files` },
    { '@type': 'TechArticle', name: 'Docker Cleanup Script', url: `${SITE_URL}/snippets/docker-prune-cleanup` },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Snippets', item: `${SITE_URL}/snippets` },
    { '@type': 'ListItem', position: 3, name: 'Disk Management', item: `${SITE_URL}/snippets/disk-management` },
  ],
};

const snippets = [
  {
    slug: 'disk-space-warning',
    title: 'Disk Space Warning Script',
    description:
      'Checks every mounted filesystem and fires an alert when usage crosses a configurable threshold. The early warning system.',
  },
  {
    slug: 'find-large-files-linux',
    title: 'Find Large Files in Linux',
    description:
      'Finds the biggest files and directories on any path. Answers "what is eating my disk" in one command.',
  },
  {
    slug: 'delete-old-log-files',
    title: 'Delete Old Log Files',
    description:
      'Removes log files older than a configurable number of days. Handles the most predictable source of unbounded disk growth.',
  },
  {
    slug: 'find-duplicate-files',
    title: 'Find Duplicate Files',
    description:
      'Uses md5sum checksums to find byte-for-byte duplicate files across a directory tree.',
  },
  {
    slug: 'docker-prune-cleanup',
    title: 'Docker Cleanup Script',
    description:
      'Removes stopped containers, unused images, dangling volumes, and build cache. Reclaims the space Docker accumulates silently.',
  },
];

const decisionRows = [
  {
    slug: 'disk-space-warning',
    signal: 'you want the permanent background watch: one cron entry that warns when any filesystem crosses a threshold, long before writes start failing. This is the script you install before there is a problem.',
  },
  {
    slug: 'find-large-files-linux',
    signal: 'the warning has fired or df already shows the disk nearly full, and you need the biggest directories and files ranked by size in seconds, not minutes of manual du.',
  },
  {
    slug: 'delete-old-log-files',
    signal: 'the offender is /var/log — the most predictable source of unbounded growth — and you want age-based cleanup with a dry run to confirm exactly what gets removed first.',
  },
  {
    slug: 'find-duplicate-files',
    signal: 'usage is high but no single file is huge: redundant copies of archives, database dumps, or media scattered across a shared workspace and counted twice.',
  },
  {
    slug: 'docker-prune-cleanup',
    signal: 'the box runs Docker and the space is hiding in /var/lib/docker — stopped containers, dangling images, and build cache that df attributes to one opaque directory.',
  },
];

const faqItems = [
  {
    question: 'How do I find what is filling up my Linux disk?',
    answer:
      'Run the find-large-files script, which uses du and find to rank the largest directories and files on a path in seconds. Start at the filesystem that df reports as nearly full, then drill into the biggest directory it names. Logs under /var/log and Docker storage under /var/lib/docker are the two most common culprits on a server.',
  },
  {
    question: 'Is it safe to delete files in /var/log?',
    answer:
      'Yes, deleting old rotated logs is safe — they are historical records, not active state. Use the delete-old-log-files script with an age threshold and run it with the dry-run flag first to confirm what will be removed. Never truncate a log a running process still holds open; rotate it with logrotate instead, or the space will not actually free.',
  },
  {
    question: 'Why is my disk full when du shows less space used than df?',
    answer:
      'A process is still holding a deleted file open, so the kernel does not reclaim the space until that process closes it. Find the culprit with lsof +L1, then restart the offending service to release the disk. This is the classic disk-full mystery on long-running servers, and du alone will never reveal it because the file no longer has a directory entry.',
  },
  {
    question: 'How do I stop a disk from filling up again?',
    answer:
      'Schedule the disk-space-warning script on cron to catch growth early, and run delete-old-log-files weekly to bound the most predictable source. Configure logrotate for application logs, and prune Docker on a schedule if the box builds images. Prevention is three or four cron entries — far cheaper than the emergency surgery a full disk forces at 3am. Set the warning threshold low enough (80%, not 95%) that the alert arrives while you still have room to think rather than react.',
  },
];

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function DiskManagementHub() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Snippets', href: '/snippets' },
            { label: 'Disk Management' },
          ]}
        />

        <div className="mb-6 flex items-center gap-2 font-mono text-sm text-muted">
          <span className="text-green">$</span>
          <span>disk-management</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-green" aria-hidden />
        </div>

        <h1 className="font-heading text-4xl font-extrabold text-text">
          Linux Disk Management Scripts
        </h1>

        <p className="mt-4 max-w-2xl text-sm text-muted leading-relaxed">
          {snippets.length} scripts · find, free, and monitor disk space · no install required
        </p>

        <div className="mt-8 space-y-5 leading-relaxed text-muted">
          <p>
            A disk that fills to 100% doesn&apos;t send a warning. It stops writing. Databases start
            corrupting. Log rotations fail silently. Web servers start returning 500 errors for reasons
            that look unrelated to disk space. The root cause is always: something grew and nobody
            was watching.
          </p>
          <p>
            The scripts on this page are the watching.{' '}
            <Link href="/snippets/disk-space-warning" className="text-green hover:text-text transition-colors">
              disk-space-warning
            </Link>{' '}
            catches the growth before it becomes an outage.{' '}
            <Link href="/snippets/find-large-files-linux" className="text-green hover:text-text transition-colors">
              find-large-files-linux
            </Link>{' '}
            finds what grew.{' '}
            <Link href="/snippets/delete-old-log-files" className="text-green hover:text-text transition-colors">
              delete-old-log-files
            </Link>{' '}
            clears the most predictable source of unbounded growth.{' '}
            <Link href="/snippets/find-duplicate-files" className="text-green hover:text-text transition-colors">
              find-duplicate-files
            </Link>{' '}
            finds the copies you forgot were copies.{' '}
            <Link href="/snippets/docker-prune-cleanup" className="text-green hover:text-text transition-colors">
              docker-prune-cleanup
            </Link>{' '}
            reclaims the gigabytes Docker silently accumulates.
          </p>
          <p>
            The discipline is to run disk-space-warning on a cron and treat its output as a chore
            list, not an alert. At 80% full you have time to investigate. At 95% you are doing
            emergency surgery. The five scripts here represent the five questions in that
            investigation: how full is it, what&apos;s taking the space, can I delete the old logs, are
            there duplicate copies I forgot about, and is Docker holding hidden storage?
          </p>
          <p>
            Log growth is almost always the first thing to prune. Application logs, nginx access
            logs, systemd journal dumps — on a server that&apos;s been running for a year without rotation
            configured correctly, <code className="font-mono text-xs text-blue">/var/log</code> can hold tens of gigabytes of files you&apos;ve
            already read and will never need again.{' '}
            <Link href="/snippets/delete-old-log-files" className="text-green hover:text-text transition-colors">
              delete-old-log-files
            </Link>{' '}
            handles this with a configurable age threshold and a dry-run flag.
          </p>
          <p>
            Duplicate files are the second most common cause of unexpected disk usage after logs. Git
            repositories, downloaded archives, database dump files that got copied to multiple
            locations — find-duplicate-files uses md5sum to catch byte-for-byte duplicates across
            directory trees. On a server that&apos;s been used as a shared workspace, the space reclaimed
            is often surprising.
          </p>
        </div>

        <AffiliateBox
          partner="digitalocean"
          headline="When the fix is more disk, not less data — DigitalOcean droplets scale storage in minutes."
          className="mt-10"
        />

        <section className="mt-12">
          <h2 className="mb-6 font-heading text-2xl font-bold text-text">
            Scripts in This Collection ({snippets.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {snippets.map((snippet) => (
              <article
                key={snippet.slug}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg2 p-5 transition-colors duration-150 hover:border-green"
              >
                <div className="absolute left-0 top-0 h-0.5 w-0 bg-green transition-all duration-300 group-hover:w-full" aria-hidden />
                <h3 className="font-heading text-base font-bold leading-snug text-text">
                  {snippet.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">
                  {snippet.description}
                </p>
                <Link
                  href={`/snippets/${snippet.slug}`}
                  className="mt-4 font-mono text-xs text-green transition-colors hover:text-text"
                >
                  Full guide →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 font-heading text-2xl font-bold text-text">
            Which Script Do I Reach For?
          </h2>
          <p className="mb-6 leading-relaxed text-muted">
            A disk problem has two phases — before it fills and after — and the scripts split along
            that line. The recurring watch runs forever in the background; the investigation scripts
            run when the watch goes off or when df already shows 95%. Pick by where you are on that
            timeline. The discipline that separates a calm cleanup from a 3am emergency is treating
            the watch&apos;s output as a chore list at 80% rather than waiting for the alert at 98% —
            at 80% you investigate, at 98% you are deleting files under pressure with services
            already failing around you.
          </p>
          <div className="space-y-3">
            {decisionRows.map((row) => (
              <div key={row.slug} className="rounded-lg border border-border bg-bg2 p-4">
                <Link
                  href={`/snippets/${row.slug}`}
                  className="font-mono text-sm text-green transition-colors hover:text-text"
                >
                  {row.slug}
                </Link>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <span className="text-text">Reach for it when </span>
                  {row.signal}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 font-heading text-2xl font-bold text-text">
            How These Scripts Compose
          </h2>
          <p className="leading-relaxed text-muted">
            The disk-full workflow runs these in sequence.{' '}
            <Link href="/snippets/disk-space-warning" className="text-green hover:text-text transition-colors">
              disk-space-warning
            </Link>{' '}
            crosses 85% at 3am and pages you. You SSH in and run{' '}
            <Link href="/snippets/find-large-files-linux" className="text-green hover:text-text transition-colors">
              find-large-files-linux
            </Link>
            , which ranks the top consumers and points at{' '}
            <code className="font-mono text-xs text-blue">/var/log</code> holding 30 GB of unrotated
            nginx logs.{' '}
            <Link href="/snippets/delete-old-log-files" className="text-green hover:text-text transition-colors">
              delete-old-log-files
            </Link>{' '}
            clears everything older than 14 days — with a dry run first — and reclaims most of it
            immediately. If the box runs containers and the space is in{' '}
            <code className="font-mono text-xs text-blue">/var/lib/docker</code> instead,{' '}
            <Link href="/snippets/docker-prune-cleanup" className="text-green hover:text-text transition-colors">
              docker-prune-cleanup
            </Link>{' '}
            takes over. One script watches, one diagnoses, and one of two remediates depending on
            what the diagnosis found. The reason the diagnosis step is never skippable: deleting
            blindly is how you remove the wrong logs or a database dump someone still needed. Always
            rank first, then delete the thing you confirmed is safe.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-text">
            Frequently Asked Questions
          </h2>
          <FaqTerminal items={faqItems} label="faq — disk-management" />
        </section>

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/snippets" className="font-mono text-sm text-muted transition-colors hover:text-text">
            ← View all bash scripts
          </Link>
        </div>
      </main>
    </>
  );
}
