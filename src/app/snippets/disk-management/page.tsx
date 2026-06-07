import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
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

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/snippets" className="font-mono text-sm text-muted transition-colors hover:text-text">
            ← View all bash scripts
          </Link>
        </div>
      </main>
    </>
  );
}
