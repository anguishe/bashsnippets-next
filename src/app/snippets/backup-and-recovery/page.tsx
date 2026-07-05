import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import FaqTerminal from '@/components/FaqTerminal';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: { absolute: 'Linux Backup Bash Scripts — Automate Before You Need to Restore | BashSnippets.xyz' },
  description:
    'Bash scripts for automated file backups, MySQL database backups, and rsync remote backups. Cron-ready, incremental, and tested on Linux and macOS.',
  alternates: {
    canonical: `${SITE_URL}/snippets/backup-and-recovery`,
  },
  openGraph: {
    title: 'Linux Backup Bash Scripts — Automate Before You Need to Restore | BashSnippets.xyz',
    description:
      'Bash scripts for automated file backups, MySQL database backups, and rsync remote backups. Cron-ready, incremental, and tested on Linux and macOS.',
    url: `${SITE_URL}/snippets/backup-and-recovery`,
    type: 'website',
    images: [{ url: `${SITE_URL}/ogimage.png`, width: 1200, height: 630, alt: 'BashSnippets — Backup and Recovery Scripts' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linux Backup Bash Scripts — Automate Before You Need to Restore | BashSnippets.xyz',
    description:
      'Bash scripts for automated file backups, MySQL database backups, and rsync remote backups. Cron-ready, incremental, and tested on Linux and macOS.',
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Linux Backup and Recovery Bash Scripts',
  url: `${SITE_URL}/snippets/backup-and-recovery`,
  description:
    'Bash scripts for automated file, database, and remote backups on Linux. Covers local backups with retention, MySQL dumps, and rsync over SSH to remote servers.',
  hasPart: [
    { '@type': 'TechArticle', name: 'Automated File Backup', url: `${SITE_URL}/snippets/automated-file-backup` },
    { '@type': 'TechArticle', name: 'MySQL Database Backup', url: `${SITE_URL}/snippets/mysql-database-backup` },
    { '@type': 'TechArticle', name: 'Rsync Remote Backup', url: `${SITE_URL}/snippets/rsync-remote-backup` },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Snippets', item: `${SITE_URL}/snippets` },
    { '@type': 'ListItem', position: 3, name: 'Backup & Recovery', item: `${SITE_URL}/snippets/backup-and-recovery` },
  ],
};

const snippets = [
  {
    slug: 'automated-file-backup',
    title: 'Automated File Backup',
    description:
      'Creates a timestamped compressed archive of a specified directory and removes copies older than the retention period. The foundation of any local backup strategy.',
  },
  {
    slug: 'mysql-database-backup',
    title: 'MySQL Database Backup',
    description:
      'Dumps every MySQL/MariaDB database to a timestamped SQL file and rotates old dumps. Runs before deploys, not after them.',
  },
  {
    slug: 'rsync-remote-backup',
    title: 'Rsync Remote Backup',
    description:
      'Incremental, resumable backup over SSH using rsync. Pushes only changed files and handles interrupted connections cleanly.',
  },
];

const decisionRows = [
  {
    slug: 'automated-file-backup',
    signal: 'you are protecting files and directories — application code, configs, user uploads — with timestamped local archives and automatic retention that prunes old copies. Best when the data changes as whole files and a fast same-host copy is your first line of defense against a fat-fingered delete or a deploy that overwrites the wrong directory.',
  },
  {
    slug: 'mysql-database-backup',
    signal: 'you are protecting a live MySQL or MariaDB database, where copying the raw data directory would capture an inconsistent, mid-write state. mysqldump takes a transaction-consistent snapshot the file-level scripts cannot, which is exactly why a database needs its own job instead of being swept up in the file backup.',
  },
  {
    slug: 'rsync-remote-backup',
    signal: 'the copy has to survive the machine itself — an incremental, resumable transfer over SSH to a separate server or object storage, sending only the bytes that changed. This is the one script here that turns a backup into an offsite backup, the copy that lives when the source disk dies.',
  },
];

const faqItems = [
  {
    question: 'What is the difference between a local backup and an offsite backup?',
    answer:
      'A local backup protects against accidental deletion and failed deploys; an offsite backup protects against the disk, server, or datacenter failing. A backup stored on the same machine as the data dies in the same disk failure or ransomware event. Keep timestamped archives locally with the automated-file-backup script and push a copy offsite with rsync-remote-backup — you need both. The local copy gives you a fast restore for everyday mistakes; the offsite copy is the one that saves you on the worst day.',
  },
  {
    question: 'How do I back up a MySQL database with bash?',
    answer:
      'Use mysqldump piped through gzip to a timestamped file, scheduled with cron. The mysql-database-backup script does this and rotates dumps older than seven days so the backup disk stays bounded. Never copy the raw data directory of a running server — the files are mid-write and the restore will be inconsistent or outright corrupt. Store credentials in ~/.my.cnf, never in the script.',
  },
  {
    question: 'How long should I keep backups?',
    answer:
      'Long enough to cover the time it takes to notice a problem. A corrupted record or a bad deploy can go unnoticed for days, so a single day of retention is a trap — you overwrite the good copy before you know you need it. Thirty daily backups is a common default; the right number depends on your recovery point objective and available storage, not on what the script ships with.',
  },
  {
    question: 'Why do my backups run without errors but fail to restore?',
    answer:
      'The most common cause is a backup that was never test-restored: it wrote to a directory short on space, or the database user lost dump privileges after a password rotation, and the script reported success anyway. Schedule a periodic restore into a scratch environment and verify the data. A backup you have never restored is a hypothesis, not a safety net.',
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

export default function BackupAndRecoveryHub() {
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
            { label: 'Backup & Recovery' },
          ]}
        />

        <div className="mb-6 flex items-center gap-2 font-mono text-sm text-muted">
          <span className="text-green">$</span>
          <span>backup-and-recovery</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-green" aria-hidden />
        </div>

        <h1 className="font-heading text-4xl font-extrabold text-text">
          Linux Backup and Recovery Scripts
        </h1>

        <p className="mt-4 max-w-2xl text-sm text-muted leading-relaxed">
          {snippets.length} scripts · local + remote · retention management · cron-ready
        </p>

        <div className="mt-8 space-y-5 leading-relaxed text-muted">
          <p>
            The backup you don&apos;t have is the one you&apos;ll need. Every sysadmin knows this. Most of them
            also know, from experience, that the backup they had wasn&apos;t tested, ran out of retention
            space six weeks ago, or was pointed at the wrong directory. A backup strategy that isn&apos;t
            automated is a plan that depends on nobody forgetting.
          </p>
          <p>
            The scripts on this page automate the parts that people skip. Timestamped archives that
            create themselves on a cron. MySQL dumps that run before the deploy, not after the fact.
            Incremental rsync backups over SSH that pick up where they left off if the connection drops
            midway. Retention management that deletes copies older than 30 days so the backup disk
            doesn&apos;t silently fill and start failing writes.
          </p>
          <p>
            Local backups protect you from accidental deletions and failed deployments. They do not
            protect you from a disk failure, a datacenter incident, or a compromised server. The{' '}
            <Link href="/snippets/rsync-remote-backup" className="text-green hover:text-text transition-colors">
              rsync-remote-backup
            </Link>{' '}
            script on this page pushes copies to a remote server over SSH — it&apos;s the difference
            between a backup and an offsite backup. Both matter.
          </p>
          <p>
            Before you schedule any of these scripts, decide two things: where the backups live (a
            separate disk, a mounted NFS share, a remote server, or object storage), and how long you
            keep them. The scripts use a configurable retention period — 30 days is the default. The
            correct answer depends on your recovery time objective and how much storage you have, not
            on what the default is.
          </p>
          <p>
            The most common backup failure mode isn&apos;t a missing script — it&apos;s a script that runs
            without errors for months until the day you need to restore, when you discover the archive
            was writing to a directory that didn&apos;t have enough space, or the database user had lost
            its dump privileges after a password rotation. Test restores. Schedule them. The scripts
            are the low-risk part; the restore you never tested is where it breaks.
          </p>
        </div>

        <AffiliateBox
          partner="digitalocean"
          headline="Rsync your backups to a DigitalOcean droplet or Spaces bucket — offsite in one command."
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
            Three scripts, three different things being protected. The mistake is treating them as
            interchangeable — a file backup will not capture a consistent database, and a local
            archive will not survive the disk it lives on. Choose by what you are protecting and
            where the copy needs to live. The widely cited 3-2-1 rule — three copies, on two kinds
            of media, with one held offsite — is the target these three scripts hit together, not
            individually, which is why a complete strategy runs all three rather than picking one.
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
            A complete backup runs all three in order, every night.{' '}
            <Link href="/snippets/mysql-database-backup" className="text-green hover:text-text transition-colors">
              mysql-database-backup
            </Link>{' '}
            dumps the database to a timestamped SQL file first, so the data is captured as a
            consistent snapshot rather than mid-write.{' '}
            <Link href="/snippets/automated-file-backup" className="text-green hover:text-text transition-colors">
              automated-file-backup
            </Link>{' '}
            then archives the application directory — now including that fresh dump — with retention
            that prunes copies older than 30 days. Finally,{' '}
            <Link href="/snippets/rsync-remote-backup" className="text-green hover:text-text transition-colors">
              rsync-remote-backup
            </Link>{' '}
            pushes the whole backup directory offsite over SSH, transferring only the bytes that
            changed since last night. The local archives handle the accidental{' '}
            <code className="font-mono text-xs text-blue">rm -rf</code>; the offsite copy handles the
            dead disk. Layer a weekly test restore on top of the nightly run and the chain is
            complete: consistent capture, bounded local history, and an offsite copy you have
            actually proven you can read back rather than merely hoped was good.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-text">
            Frequently Asked Questions
          </h2>
          <FaqTerminal items={faqItems} label="faq — backup-and-recovery" />
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
