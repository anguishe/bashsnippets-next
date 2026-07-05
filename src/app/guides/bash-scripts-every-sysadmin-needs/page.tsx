import type { Metadata } from 'next';
import Link from 'next/link';
import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: { absolute: '25 Bash Scripts Every Linux Sysadmin Needs | BashSnippets.xyz' },
  description:
    'The 25 bash scripts that prevent the most common server failures — disk full, SSL expiry, failed services, insecure permissions. Copy-paste ready, cron-schedulable, no installs required.',
  alternates: {
    canonical: `${SITE_URL}/guides/bash-scripts-every-sysadmin-needs`,
  },
  openGraph: {
    title: '25 Bash Scripts Every Linux Sysadmin Needs | BashSnippets.xyz',
    description:
      'The 25 bash scripts that prevent the most common server failures — disk full, SSL expiry, failed services, insecure permissions. Copy-paste ready, cron-schedulable, no installs required.',
    url: `${SITE_URL}/guides/bash-scripts-every-sysadmin-needs`,
    type: 'article',
    publishedTime: '2026-06-06T00:00:00Z',
    images: [
      {
        url: `${SITE_URL}/ogimage.png`,
        width: 1200,
        height: 630,
        alt: '25 Bash Scripts Every Linux Sysadmin Needs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '25 Bash Scripts Every Linux Sysadmin Needs | BashSnippets.xyz',
    description:
      'The 25 bash scripts that prevent the most common server failures — disk full, SSL expiry, failed services, insecure permissions. Copy-paste ready, cron-schedulable, no installs required.',
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const techArticleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: '25 Bash Scripts Every Linux Sysadmin Needs',
  description:
    'The 25 bash scripts that prevent the most common server failures — disk full, SSL expiry, failed services, insecure permissions. Copy-paste ready, cron-schedulable, no installs required.',
  url: `${SITE_URL}/guides/bash-scripts-every-sysadmin-needs`,
  datePublished: '2026-06-06',
  dateModified: '2026-06-06',
  author: {
    '@type': 'Person',
    name: 'Anguishe',
    url: `${SITE_URL}/about`,
  },
  publisher: {
    '@type': 'Organization',
    name: 'BashSnippets.xyz',
    url: SITE_URL,
  },
  image: `${SITE_URL}/ogimage.png`,
  inLanguage: 'en',
  articleSection: 'Linux Administration',
  keywords: [
    'bash scripts',
    'sysadmin scripts',
    'linux automation',
    'server monitoring',
    'bash one-liners',
    'cron jobs',
    'disk monitoring',
    'ssl certificate check',
    'service watchdog',
  ].join(', '),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
    {
      '@type': 'ListItem',
      position: 3,
      name: '25 Bash Scripts Every Sysadmin Needs',
      item: `${SITE_URL}/guides/bash-scripts-every-sysadmin-needs`,
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What bash scripts should every sysadmin have?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The essential set covers five areas: disk monitoring (disk-space-warning, find-large-files-linux), automated backups (rsync-remote-backup, mysql-database-backup), service health (restart-service-if-stopped, check-if-website-is-up), security auditing (list-open-ports-linux, file-permissions-security), and SSL monitoring (check-ssl-certificate-expiry). These 9 scripts prevent the most common Linux server failures.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do these bash scripts work on Ubuntu, CentOS, and Debian?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All scripts use POSIX-compatible bash and standard GNU coreutils available on every major Linux distribution. Scripts that depend on systemctl are noted; they work on any systemd-based distribution.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I run these bash scripts on a cron schedule?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every script on this list is cron-safe: no interactive prompts in default mode, clean single-line output suitable for log files, and exit codes that cron can use to determine success or failure.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are these bash scripts free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All scripts on BashSnippets.xyz are published under the MIT License. Copy, modify, and use them in any environment, including production, without restriction.',
      },
    },
  ],
};

function C({ children }: { children: string }) {
  return (
    <code className="rounded bg-bg3 px-1.5 py-0.5 font-mono text-xs text-blue">
      {children}
    </code>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-lg border border-border bg-bg3 p-4 font-mono text-xs leading-relaxed text-blue">
      <code>{code}</code>
    </pre>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-8 mt-14 flex items-center gap-4">
      <div className="h-px flex-1 bg-border" />
      <span className="font-mono text-xs tracking-widest text-muted uppercase">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

interface ScriptEntryProps {
  num: number;
  title: string;
  problem: string;
  description: React.ReactNode;
  code: string;
  linkHref: string;
  linkLabel: string;
  comingSoon?: boolean;
}

function ScriptEntry({ num, title, problem, description, code, linkHref, linkLabel, comingSoon }: ScriptEntryProps) {
  return (
    <article className="mb-10 border-l-2 border-border pl-6 transition-colors hover:border-green">
      <div className="mb-1 font-mono text-xs text-muted">
        <span className="text-green">#{String(num).padStart(2, '0')}</span>
      </div>
      <h3 className="font-heading text-xl font-bold text-text">{title}</h3>
      <p className="mt-2 text-sm font-semibold text-amber">Problem: {problem}</p>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted">{description}</div>
      {code && <CodeBlock code={code} />}
      {comingSoon ? (
        <Link
          href={linkHref}
          className="mt-3 inline-block font-mono text-xs text-muted transition-colors hover:text-text"
        >
          {linkLabel}
        </Link>
      ) : (
        <Link
          href={linkHref}
          className="mt-3 inline-block font-mono text-xs text-green transition-colors hover:text-text"
        >
          {linkLabel} →
        </Link>
      )}
    </article>
  );
}

export default function BashScriptsGuide() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides' },
            { label: '25 Bash Scripts Every Sysadmin Needs' },
          ]}
        />

        {/* Header */}
        <div className="mb-4 flex items-center gap-2 font-mono text-sm text-muted">
          <span className="text-green">$</span>
          <span>cat essential-scripts.sh</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-green" aria-hidden />
        </div>

        <h1 className="font-heading text-4xl font-extrabold leading-tight text-text md:text-5xl">
          25 Bash Scripts Every Linux Sysadmin Needs
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
          <span>Published: June 6, 2026</span>
          <span aria-hidden>·</span>
          <span>25 scripts</span>
          <span aria-hidden>·</span>
          <span>No external dependencies</span>
          <span aria-hidden>·</span>
          <span>MIT License</span>
        </div>

        {/* Quick Answer */}
        <div className="mt-8 rounded-lg border border-green-dim bg-green-dim/20 px-6 py-5">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-green">
            Quick Answer
          </p>
          <p className="text-sm leading-relaxed text-text">
            The 25 scripts on this page cover five failure categories that account for the majority
            of production Linux incidents: disk growth, backup gaps, service crashes, security drift,
            and SSL expiry. None require third-party installs. Every script runs with bash, coreutils,
            and the utilities that ship on Ubuntu, Debian, CentOS, Rocky, and Alma Linux. Add them
            to <C>/opt/scripts/</C>, make them executable with <C>chmod +x</C>, and schedule the
            monitoring group on cron. The disk warning fires at 80% so you have time to investigate
            before 100% shuts down writes. The SSL check fires at 30 days so you have time to renew
            before browsers throw certificate errors. The service watchdog runs every 5 minutes so
            the longest your users wait for a crashed service is 5 minutes, not until the next
            business morning.
          </p>
        </div>

        {/* Introduction */}
        <div className="mt-10 space-y-5 leading-relaxed text-muted">
          <p>
            A server doesn&apos;t tell you it&apos;s about to fail. The disk fills incrementally — 1%
            a day, every day — until the database starts throwing write errors and the application
            logs stop rotating and the behavior presents as five different problems instead of one
            root cause. The SSL certificate expires silently at 2am on a Sunday. The service crashes
            at 3am, doesn&apos;t restart, and the first person who finds out is a user who emails
            support six hours later. By the time you notice any of these, the window for a graceful
            fix has long since closed.
          </p>
          <p>
            The 25 scripts on this list are the difference between managing infrastructure and
            reacting to it. They are the early-warning layer that runs while you sleep — checking
            disk thresholds, verifying SSL expiry dates, confirming services are alive, auditing
            open ports for unexpected listeners, and shipping timestamped backups to a remote host
            before anything has a chance to go wrong.
          </p>
          <p>
            None of these require third-party monitoring agents, SaaS dashboards, or paid platforms.
            No agents to install, no API keys to rotate, no subscription to lapse. Everything runs
            with bash, coreutils, and the standard utilities that ship on every major Linux
            distribution. Add them to <C>/opt/scripts/</C>, make them executable, schedule them on
            cron, and stop finding out about problems from your users.
          </p>
          <p>
            Each script entry below includes the core command or one-liner, the specific failure it
            prevents, and a link to the full annotated script with configurable thresholds, cron
            examples, and production-tested error handling.
          </p>
        </div>

        {/* ===================== DISK MONITORING ===================== */}
        <SectionDivider label="Disk Monitoring & Management" />

        <div className="mb-8 space-y-3 leading-relaxed text-muted">
          <p>
            Your disk never fills all at once. It fills incrementally — 1% at a time, across weeks
            or months — until the database starts throwing write errors, the web server returns 500s
            with no application-level explanation, and log rotation silently starts failing. By the
            time any of those symptoms appear, the disk is usually at 98% or 100% and you are doing
            emergency surgery instead of routine maintenance.
          </p>
          <p>
            The discipline is to run a threshold check on cron and treat its output as a chore list
            rather than an emergency alert. At 80% full you have time to investigate what grew and
            make a measured decision. At 95% you are deleting files under pressure. At 100% writes
            stop and every service on the machine begins misbehaving in ways that obscure the actual
            cause. These five scripts represent the five questions in that investigation: how full is
            it, what is taking the space, can I delete the old logs, are there duplicate copies
            taking up space, and is Docker holding hidden storage I forgot about.
          </p>
        </div>

        <ScriptEntry
          num={1}
          title="Disk Space Warning"
          problem="Production outage caused by a filesystem hitting 100% capacity — writes fail, databases corrupt, logs stop, services crash with misleading errors."
          description={
            <>
              <p>
                The most reliable outage prevention on a Linux server is a simple threshold check
                running on cron. This one-liner reads every mounted filesystem and prints any that
                have crossed the 80% mark. At 80% you still have hours or days to respond. Pipe the
                output to <C>mail</C> and you have an email alert. Pair it with{' '}
                <Link href="/snippets/find-large-files-linux" className="text-green hover:text-text transition-colors">
                  find-large-files-linux
                </Link>{' '}
                and you have a complete disk triage workflow.
              </p>
              <p>
                The full script adds a configurable threshold (default 80%), hostname identification
                for servers where you run the same script on multiple machines, and a clean crontab
                entry that fires daily at 7am.
              </p>
            </>
          }
          code={`df -h | awk 'NR>1 && $5+0 >= 80 {print $0}'`}
          linkHref="/snippets/disk-space-warning"
          linkLabel="Full script with configurable threshold and cron setup"
        />

        <ScriptEntry
          num={2}
          title="Find Large Files"
          problem="The disk is full but df only tells you which filesystem — not what is consuming the space."
          description={
            <>
              <p>
                When disk-space-warning fires, the next question is always: what grew? This command
                answers it in seconds. <C>du -ah</C> walks every file and directory under the target
                path, calculates sizes in human-readable format, and <C>sort -rh</C> puts the
                largest items at the top. The <C>head -20</C> limits output to the top 20 candidates
                worth investigating.
              </p>
              <p>
                On a typical server, the culprits are application logs, database dump files, old
                Docker layers, and downloaded archive files that were never cleaned up. The full
                script adds exclusion patterns for <C>/proc</C> and <C>/sys</C>, which contain
                virtual filesystems that can produce misleading sizes.
              </p>
            </>
          }
          code={`du -ah /var | sort -rh | head -20`}
          linkHref="/snippets/find-large-files-linux"
          linkLabel="Full script with exclusion patterns"
        />

        <ScriptEntry
          num={3}
          title="Delete Old Log Files"
          problem="Log files grow without bound on servers where rotation is not configured correctly — /var/log filling up is the most predictable disk failure on any production server."
          description={
            <>
              <p>
                Log growth is almost always the first thing to prune when a disk starts filling.
                Application logs, nginx access logs, systemd journal dumps — on a server that has
                been running for a year without rotation configured correctly, <C>/var/log</C> can
                hold tens of gigabytes of files you have already read and will never need again.
              </p>
              <p>
                This command finds every <C>.log</C> file under <C>/var/log</C> that was last
                modified more than 30 days ago and deletes it. The <C>-mtime +30</C> flag means
                &quot;more than 30 days ago&quot; — the <C>+</C> prefix is commonly misread and
                important to get right. The full script includes a <C>--dry-run</C> flag that prints
                what would be deleted without touching anything.
              </p>
            </>
          }
          code={`find /var/log -name "*.log" -mtime +30 -delete`}
          linkHref="/snippets/delete-old-log-files"
          linkLabel="Full script with retention configuration and dry-run flag"
        />

        <ScriptEntry
          num={4}
          title="Find Duplicate Files"
          problem="Copied database dumps, cloned git repositories, archived files moved to multiple locations — duplicate files are the second most common source of unexpected disk growth after logs."
          description={
            <>
              <p>
                This script uses <C>md5sum</C> to generate a checksum for every file under a target
                path, then groups files with identical checksums. The <C>uniq -w32 -D</C> flag
                matches on the first 32 characters of each line — the MD5 hash — and prints all
                duplicate lines. On a shared server or a machine used for development work, the
                space reclaimed from forgotten duplicates is often several gigabytes.
              </p>
              <p>
                The full script adds directory-level comparison, a human-readable output format that
                groups each duplicate set, and a total bytes-wasted summary so you know whether
                the cleanup is worth the time before you commit to it.
              </p>
            </>
          }
          code={`find /path -type f | xargs md5sum | sort | uniq -w32 -D`}
          linkHref="/snippets/find-duplicate-files"
          linkLabel="Full script with directory comparison and size summary"
        />

        <ScriptEntry
          num={5}
          title="Docker Prune Cleanup"
          problem="Docker accumulates gigabytes of garbage — stopped containers, dangling images, unused build cache — without ever asking permission."
          description={
            <>
              <p>
                Every Docker-based deployment leaves behind a layer of accumulated debris. Stopped
                containers that were never removed. Intermediate build layers from images that have
                since been replaced. Volumes from services that no longer exist. On an active CI
                server or deployment host, this can reach 20–40GB within a month of operation
                without any action on your part.
              </p>
              <p>
                This command first shows you the current state with <C>docker system df</C> so you
                know what you are about to reclaim, then removes all images that have not been used
                in the last 30 days. The <C>--filter &quot;until=720h&quot;</C> flag is the key
                safety valve — it preserves images actively in use while clearing the historical
                accumulation. The full script adds volume pruning with a separate confirmation step
                and a before/after disk usage report.
              </p>
            </>
          }
          code={`docker system df && docker image prune -af --filter "until=720h"`}
          linkHref="/snippets/docker-prune-cleanup"
          linkLabel="Full script with volume pruning and before/after disk report"
        />

        {/* ===================== BACKUP & RECOVERY ===================== */}
        <SectionDivider label="Backup & Recovery" />

        <div className="mb-8 space-y-3 leading-relaxed text-muted">
          <p>
            The backup you don&apos;t have is the one you will need. The backup you have that was
            never tested is indistinguishable from no backup until the moment you try to restore
            it. A MySQL dump that has been silently failing for three weeks because the credentials
            changed is not a backup — it is a false sense of security with a timestamp on it.
          </p>
          <p>
            These three backup scripts address the three most common gaps: local file archives with
            retention management, database dumps with verified output, and incremental remote
            backups over SSH. Run all three on cron, send output to a log file, and check that log
            file weekly. A backup job that runs without emitting output is either working perfectly
            or silently failing — the log is the only way to tell the difference.
          </p>
        </div>

        <ScriptEntry
          num={6}
          title="Automated File Backup"
          problem="Manual backups that get skipped when someone is busy, and timestamped archives that don't clean themselves up until the backup disk fills."
          description={
            <>
              <p>
                This command creates a compressed <C>.tar.gz</C> archive of the target directory
                with today&apos;s date embedded in the filename. The <C>$(date +%Y%m%d)</C>
                substitution runs at execution time, so every cron invocation produces a distinct
                archive — <C>20260606_backup.tar.gz</C>, <C>20260607_backup.tar.gz</C>, and so on.
                Without a retention policy, these archives accumulate until the backup volume fills.
              </p>
              <p>
                The full script adds automatic rotation — archives older than a configurable number
                of days are deleted at the end of each run — and a verification step using{' '}
                <C>tar -tzf</C> to confirm the archive is not corrupt before the old one is removed.
              </p>
            </>
          }
          code={`tar -czf /backups/$(date +%Y%m%d)_backup.tar.gz /var/www`}
          linkHref="/snippets/automated-file-backup"
          linkLabel="Full script with rotation and archive verification"
        />

        <ScriptEntry
          num={7}
          title="MySQL Database Backup"
          problem="A deploy overwrites data before anyone thought to run a manual dump, or a backup job that has been failing silently for weeks because credentials changed."
          description={
            <>
              <p>
                <C>mysqldump --all-databases</C> produces a SQL dump of every database in the
                MySQL instance. Redirect it to a timestamped file and you have a recoverable
                point-in-time backup. This is the minimum viable database backup — one command,
                one output file, scheduled on cron at 2am before the morning deployment window.
              </p>
              <p>
                The full script handles credential management via <C>.my.cnf</C> so passwords never
                appear in the process list, compresses output with gzip to reduce storage, rotates
                old dumps automatically, and verifies the dump file is non-empty before completing —
                so a silent failure writes a zero-byte file that is immediately detectable rather
                than a missing file you only notice at restore time.
              </p>
            </>
          }
          code={`mysqldump --all-databases > /backups/$(date +%Y%m%d)_mysql.sql`}
          linkHref="/snippets/mysql-database-backup"
          linkLabel="Full script with credentials handling and retention"
        />

        <ScriptEntry
          num={8}
          title="rsync Remote Backup"
          problem="A local-only backup that disappears with the machine — disk failure, datacenter incident, or ransomware all destroy local backups along with the data they were protecting."
          description={
            <>
              <p>
                <C>rsync</C> over SSH is the most practical incremental backup mechanism available
                without installing additional software. The <C>-avz</C> flags enable archive mode
                (preserves permissions, timestamps, symlinks), verbose output for the log, and
                compression for the transfer. The <C>--delete</C> flag mirrors deletions to the
                remote, keeping the backup in sync rather than accumulating stale files. Only
                changed files transfer on each run, making subsequent backups fast even for large
                directories.
              </p>
              <p>
                The full script adds a <C>--dry-run</C> flag for testing, exclude patterns for
                cache directories and temporary files, and a cron-ready invocation that logs
                transfer statistics to a dedicated file for weekly review.
              </p>
            </>
          }
          code={`rsync -avz --delete -e ssh /local/path/ user@remote:/backup/path/`}
          linkHref="/snippets/rsync-remote-backup"
          linkLabel="Full script with dry-run, exclude patterns, and cron setup"
        />

        {/* ===================== SERVICE & PROCESS MANAGEMENT ===================== */}
        <SectionDivider label="Service & Process Management" />

        <div className="mb-8 space-y-3 leading-relaxed text-muted">
          <p>
            A crashed service that nobody knows about is a service that has been down since 3am.
            The process table shows nothing. Logs show the last successful request was hours ago.
            The first notification you receive is a user email the next morning asking why the site
            is down. These scripts close that gap — the service watchdog checks every 5 minutes and
            restarts the process before any user ever notices the downtime window.
          </p>
          <p>
            Process management scripts also solve the development-side problem: port conflicts that
            prevent services from starting, runaway processes consuming all available CPU, and the
            recurring need to understand the current resource consumption before a deploy. The
            scripts in this section address both the production monitoring and the operational
            debugging use cases.
          </p>
        </div>

        <ScriptEntry
          num={9}
          title="Restart Service If Stopped"
          problem="A service crash nobody finds out about until a user reports it hours later — nginx, postgres, redis, or any service that doesn't auto-recover from a segfault."
          description={
            <>
              <p>
                This is the minimal service watchdog. <C>systemctl is-active --quiet</C> returns
                exit code 0 if the service is running and non-zero if it is not. The <C>||</C>
                operator runs the restart only when the check fails. Put this on a 5-minute cron
                and your maximum undetected downtime drops from &quot;until someone notices&quot;
                to 5 minutes.
              </p>
              <p>
                The full script handles multiple services in a loop, sends an email alert on each
                restart event so you know the service crashed even if it recovered, and logs every
                restart with a timestamp for post-incident review. The log is how you notice that
                nginx is restarting three times a day because of a memory leak — which a naked
                watchdog loop would mask by restarting it before anyone sees a symptom.
              </p>
            </>
          }
          code={`systemctl is-active --quiet nginx || systemctl restart nginx`}
          linkHref="/snippets/restart-service-if-stopped"
          linkLabel="Full script with email alerting and multiple services"
        />

        <ScriptEntry
          num={10}
          title="Kill a Process"
          problem="A runaway process consuming all CPU or memory that normal termination methods can't stop — OOM killer hasn't fired yet but the machine is becoming unresponsive."
          description={
            <>
              <p>
                <C>pkill -f</C> sends <C>SIGTERM</C> to every process whose full command line
                matches the pattern, giving the process a chance to clean up. The <C>||</C> chain
                falls through to <C>kill -9</C> only if the graceful kill produced no running
                process to terminate. This two-stage approach avoids data corruption from hard kills
                when a graceful kill would work, while still handling processes that ignore
                <C>SIGTERM</C>.
              </p>
              <p>
                The full script adds a safety confirmation prompt before killing, a <C>pgrep -a</C>
                preview showing what would be killed before execution, and a post-kill verification
                check to confirm the process is no longer running.
              </p>
            </>
          }
          code={`pkill -f "process-name" || kill -9 $(pgrep -f "process-name")`}
          linkHref="/snippets/kill-a-process"
          linkLabel="Full script with signal escalation and safety confirmation"
        />

        {/* Affiliate after #10 */}
        <AffiliateBox
          partner="digitalocean"
          headline="Running these scripts on a VPS? DigitalOcean Droplets start at $4/mo — $200 free credit for new accounts."
          className="my-10"
        />

        <ScriptEntry
          num={11}
          title="Kill Process on Port"
          problem="EADDRINUSE — 'address already in use' — your dev server or production service won't start because something is squatting on the port it needs."
          description={
            <>
              <p>
                <C>lsof -ti</C> returns only the PID of the process holding the specified port —
                no headers, no formatting, just the number. <C>xargs -r kill</C> passes that PID
                to <C>kill</C>, with <C>-r</C> preventing an error if the output is empty (the
                port was already free). One command, one port freed, no need to look up the PID
                manually first.
              </p>
              <p>
                The full script adds <C>SIGTERM</C> followed by a brief wait and then <C>SIGKILL</C>
                if the process hasn&apos;t exited, supports UDP ports in addition to TCP, and works
                on systems where <C>lsof</C> is not available by falling back to <C>ss</C> and
                <C>/proc</C>.
              </p>
            </>
          }
          code={`lsof -ti :3000 | xargs -r kill`}
          linkHref="/snippets/kill-process-on-port"
          linkLabel="Full script with safe kill escalation and UDP support"
        />

        <ScriptEntry
          num={12}
          title="Monitor CPU and RAM Usage"
          problem="Resource exhaustion that causes services to become progressively slower before crashing — caught in a log as a trend rather than a sudden unexplained event."
          description={
            <>
              <p>
                This <C>awk</C> expression reads <C>/proc/meminfo</C> directly — no external
                tools, works on every Linux kernel — and calculates used memory as a percentage of
                total. The same approach works for CPU utilization by reading <C>/proc/stat</C>
                across two samples with a sleep interval. Both metrics are available without{' '}
                <C>top</C>, <C>htop</C>, or any interactive tool that would block a cron job.
              </p>
              <p>
                The full script checks both CPU and memory against configurable thresholds, logs
                each reading with a timestamp to a file you can <C>tail -f</C> during an incident,
                and sends an email alert when either metric crosses the threshold. A week of this
                log gives you a baseline — anything that deviates from baseline is worth
                investigating before it becomes a crash.
              </p>
            </>
          }
          code={`awk '/MemFree/{free=$2} /MemTotal/{total=$2} END{print (total-free)/total*100 "% used"}' /proc/meminfo`}
          linkHref="/snippets/monitor-cpu-ram-usage"
          linkLabel="Full script with CPU, thresholds, and timestamped logging"
        />

        <ScriptEntry
          num={13}
          title="Quick System Info Report"
          problem="Spending five minutes running individual commands to understand the state of an unfamiliar or inherited server when you first SSH in."
          description={
            <>
              <p>
                This compound command chains the five most useful system overview commands with
                <C>&&</C>: kernel version and hostname from <C>uname -a</C>, uptime and load
                averages, memory consumption from <C>free -h</C>, disk usage across all filesystems
                from <C>df -h</C>, and the top 5 memory consumers from <C>ps aux</C>. All of this
                fits in a single terminal screen.
              </p>
              <p>
                The full script formats each section with a labeled header so the output is readable
                at a glance, adds IP address information from <C>ip addr</C>, and can be added to
                <C>/etc/profile.d/</C> so it runs automatically on every SSH login — giving you an
                instant snapshot of server health without any manual commands.
              </p>
            </>
          }
          code={`uname -a && uptime && free -h && df -h && ps aux --sort=-%mem | head -5`}
          linkHref="/snippets/quick-system-info-report"
          linkLabel="Full formatted script with section headers and IP info"
        />

        {/* ===================== NETWORK & CONNECTIVITY ===================== */}
        <SectionDivider label="Network & Connectivity" />

        <div className="mb-8 space-y-3 leading-relaxed text-muted">
          <p>
            Network problems are uniquely frustrating because they often appear as application
            problems. A site that is down looks like a web server issue until you confirm the web
            server is running — then it looks like a database issue — then you discover the issue
            is actually that port 443 stopped accepting connections because certbot failed and nginx
            reloaded with an invalid config. External checks that bypass the application layer are
            the fastest way to narrow the scope of a network incident.
          </p>
        </div>

        <ScriptEntry
          num={14}
          title="Check If Website Is Up"
          problem="Your site went down and you found out from a user, not from an automated check."
          description={
            <>
              <p>
                <C>curl -s -o /dev/null -w &quot;%&#123;http_code&#125;&quot;</C> makes an HTTP
                request and prints only the response status code — discarding the response body,
                suppressing progress output, and returning in under a second on a live connection.
                A 200 means the site is responding. Anything else — 5xx, connection refused, or no
                response — means it is not.
              </p>
              <p>
                The full script wraps this in a loop with configurable retry logic (3 attempts with
                a 10-second interval before declaring the site down), sends an email alert with the
                HTTP status code on failure, and supports HTTPS with certificate validation. Run it
                on cron every 5 minutes and your average time-to-detection for an outage drops from
                &quot;whenever a user reports it&quot; to 5 minutes maximum.
              </p>
            </>
          }
          code={`curl -s -o /dev/null -w "%{http_code}" https://yoursite.com`}
          linkHref="/snippets/check-if-website-is-up"
          linkLabel="Full script with retry logic and email notification"
        />

        <ScriptEntry
          num={15}
          title="List Open Ports"
          problem="An unknown service listening on a public port that you didn't open and didn't know was there — the first symptom of a misconfiguration or a compromise."
          description={
            <>
              <p>
                <C>ss -tlnp</C> lists every TCP socket in the LISTEN state with the process name
                and PID that owns each socket. The flags: <C>-t</C> for TCP only, <C>-l</C> for
                listening sockets only, <C>-n</C> for numeric output (faster, no DNS resolution),
                <C>-p</C> for process information. This is the first command to run on any server
                you inherit or haven&apos;t reviewed recently.
              </p>
              <p>
                Unexpected entries in this output are how you find: a debug server left running
                from a deployment, a database port accidentally exposed to 0.0.0.0 instead of
                127.0.0.1, a crypto miner that opened a listener, or a misconfigured application
                binding to a port that conflicts with production. The full script adds UDP sockets,
                cross-references output against a known-good baseline, and flags any new listeners
                that appeared since the last audit.
              </p>
            </>
          }
          code={`ss -tlnp`}
          linkHref="/snippets/list-open-ports-linux"
          linkLabel="Full script with UDP, lsof integration, and baseline comparison"
        />

        {/* ===================== SECURITY & ACCESS ===================== */}
        <SectionDivider label="Security & Access" />

        <div className="mb-8 space-y-3 leading-relaxed text-muted">
          <p>
            Security posture on a Linux server degrades slowly, through small decisions that
            individually seem harmless: a config file given world-read permissions for debugging
            that was never tightened back, an SSH directory that got wrong permissions during a
            restore, a certificate renewed manually once and then forgotten in cron. Each of these
            is a silent failure mode. None of them announce themselves. You find them during audits
            or after incidents.
          </p>
          <p>
            The four scripts in this section are the audit. Run them on a schedule and treat the
            output as a compliance checklist. Any deviation from expected output is worth
            investigating — it is either a configuration drift you need to correct or a change you
            made deliberately and need to document.
          </p>
        </div>

        <ScriptEntry
          num={16}
          title="SSH Key Setup"
          problem="SSH brute-force attacks that succeed against password-authenticated servers — the single most common vector for unauthorized server access."
          description={
            <>
              <p>
                This two-command sequence generates an ed25519 key pair — the current recommended
                algorithm, smaller and faster than RSA-4096 with equivalent security — and copies
                the public key to the authorized_keys file on the remote server using{' '}
                <C>ssh-copy-id</C>, which handles the correct permissions and file format
                automatically. After this runs, you can disable password authentication in{' '}
                <C>/etc/ssh/sshd_config</C> and eliminate the brute-force attack surface entirely.
              </p>
              <p>
                The full script verifies the key was installed correctly by attempting an
                authentication test, checks that <C>~/.ssh</C> has the correct permissions (700),
                that <C>authorized_keys</C> has 600, and outputs a checklist of recommended
                <C>sshd_config</C> hardening settings to apply after key authentication is
                confirmed working.
              </p>
            </>
          }
          code={`ssh-keygen -t ed25519 -C "user@host" && ssh-copy-id user@remote`}
          linkHref="/snippets/ssh-key-setup-script"
          linkLabel="Full script with authorized_keys verification and permission checks"
        />

        <ScriptEntry
          num={17}
          title="File Permissions Security"
          problem="World-readable config files containing database passwords, web root directories writable by the wrong user, or SSH directories with incorrect permissions that silently break key authentication."
          description={
            <>
              <p>
                <C>find /var/www -type f -perm /o=w</C> locates every file under the web root where
                the &quot;other&quot; permission class has write access. <C>-exec chmod o-w &#123;&#125; \;</C>
                strips that write bit from each match. This handles the most dangerous permission
                state in a web root: a file that any local process or exploited web application can
                overwrite. Run this weekly, and any deployment that accidentally sets wrong
                permissions gets corrected before it becomes an exposure window.
              </p>
              <p>
                The full script also audits SSH directory permissions (700 for <C>~/.ssh</C>, 600
                for <C>authorized_keys</C> and private keys), finds configuration files readable by
                non-root users, and produces a permission audit report with each finding labeled by
                severity.
              </p>
            </>
          }
          code={`find /var/www -type f -perm /o=w -exec chmod o-w {} \\;`}
          linkHref="/snippets/file-permissions-security"
          linkLabel="Full script with web root and SSH permission audit"
        />

        <ScriptEntry
          num={18}
          title="Check SSL Certificate Expiry"
          problem="An SSL certificate that expired at 2am with no warning — certbot renewed for months, until a silent failure meant it didn't."
          description={
            <>
              <p>
                This command connects to the live server, reads the certificate it presents — not
                the one stored on disk, but the one actually served to browsers — and prints its
                expiry date. The key word is &quot;live&quot;: this catches the scenario where the
                certificate on disk was renewed but nginx was never reloaded to serve the new one,
                a failure mode that certbot hooks don&apos;t always prevent.
              </p>
              <p>
                The full script calculates days remaining until expiry, fires an alert at 30 days
                and again at 7 days, supports multiple domains in a single run, and produces
                output formatted for cron log review: <C>[OK] example.com expires in 84 days</C>
                or <C>[WARN] example.com expires in 12 days</C>. Set it on a weekly cron and you
                will never again discover certificate expiry from a browser error.
              </p>
            </>
          }
          code={`echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com \\
  2>/dev/null | openssl x509 -noout -enddate`}
          linkHref="/snippets/check-ssl-certificate-expiry"
          linkLabel="Full script with multi-domain support, days-remaining, and cron setup"
        />

        <ScriptEntry
          num={19}
          title="Send Email Alert from Bash"
          problem="Monitoring scripts that log silently to a file nobody reads — alerts that exist in the log but never surface to the person who needs to act on them."
          description={
            <>
              <p>
                Every monitoring script on this list becomes significantly more useful when it can
                notify you rather than waiting for you to check a log file. This one-liner sends a
                plain text email using the system mail infrastructure — on most servers, either
                <C>sendmail</C> or <C>postfix</C> with a local relay. The <C>$(hostname)</C>
                substitution in the subject line identifies which server sent the alert when you
                are managing multiple machines.
              </p>
              <p>
                The full script handles both sendmail and msmtp (for servers without a local MTA),
                provides a template for the alert body that includes timestamp, hostname, and the
                specific metric that triggered the alert, and can be sourced as a function by other
                scripts — so every monitoring script in your toolkit can call <C>send_alert</C> as
                a single line.
              </p>
            </>
          }
          code={`echo "Alert: disk at 95%" | mail -s "DISK WARNING: $(hostname)" admin@yourdomain.com`}
          linkHref="/snippets/bash-send-email-alert"
          linkLabel="Full script with SMTP configuration and msmtp fallback"
        />

        {/* ===================== BASH FUNDAMENTALS ===================== */}
        <SectionDivider label="Bash Scripting Fundamentals" />

        <div className="mb-8 space-y-3 leading-relaxed text-muted">
          <p>
            The monitoring scripts above are only as reliable as the shell code that implements
            them. A backup script that exits silently in the middle of a tar operation, a watchdog
            that catches its own errors and reports success anyway, a deployment script that
            continues executing after a failed rsync — these are failure modes that correct error
            handling prevents entirely. The patterns in this section are the foundation that makes
            all the scripts above safe to run unattended on a production server.
          </p>
        </div>

        <ScriptEntry
          num={20}
          title="Bash Error Handling"
          problem="A script that fails silently in the middle of a backup or deployment, completing from the shell's perspective while having done half the work."
          description={
            <>
              <p>
                <C>set -euo pipefail</C> is the single most important line in any production bash
                script. <C>-e</C> exits immediately if any command returns a non-zero exit code.
                <C>-u</C> treats unset variables as errors rather than expanding them to empty
                strings. <C>-o pipefail</C> makes a pipeline fail if any stage fails, not just the
                last one. Without these three flags, a script that encounters a disk-full error
                partway through a backup continues running and reports success.
              </p>
              <p>
                The <C>trap</C> line registers an error handler that fires on any unexpected exit,
                printing the line number where the failure occurred and exiting with a non-zero
                code that cron can detect. The full script adds a cleanup trap for temporary files,
                a logging function that timestamps every operation, and a pattern for graceful
                error messages that distinguish between expected failures and unexpected ones.
              </p>
            </>
          }
          code={`set -euo pipefail\ntrap 'echo "Error on line $LINENO"; exit 1' ERR`}
          linkHref="/snippets/bash-error-handling"
          linkLabel="Full script with trap cleanup and structured logging"
        />

        <ScriptEntry
          num={21}
          title="Bash If/Else Examples"
          problem="Conditional logic that doesn't handle edge cases — empty strings treated as false, uninitialized variables, exit codes misread as booleans — producing scripts that misbehave silently."
          description={
            <>
              <p>
                The <C>[[ ]]</C> construct is bash&apos;s extended test command — more reliable
                than <C>[ ]</C> for string testing, supports regex matching with <C>=~</C>, and
                handles empty string edge cases correctly. The <C>:-</C> parameter expansion
                provides a default value for potentially unset variables, preventing the{' '}
                <C>-u</C> flag from triggering an unbound variable error. This pattern — test a
                variable defensively, provide a default — appears in nearly every production bash
                script.
              </p>
              <p>
                The full reference covers string testing, numeric comparison with <C>-eq/-lt/-gt</C>
                vs. arithmetic context, file existence and type checks, exit code testing, and the
                five most common mistakes beginners make with bash conditionals and the specific
                output those mistakes produce.
              </p>
            </>
          }
          code={'[[ -n "${VAR:-}" ]] && echo "set" || echo "empty"'}
          linkHref="/snippets/bash-if-else-examples"
          linkLabel="Full examples with pitfalls and comparison patterns"
        />

        <ScriptEntry
          num={22}
          title="Create Dated Folder"
          problem="Backup directories, report exports, and log archives that overwrite each other because no timestamp was embedded in the directory name."
          description={
            <>
              <p>
                <C>$(date +%Y-%m-%d)</C> expands to the current date in ISO 8601 format at the
                moment of execution — <C>2026-06-06</C>, for example. Combined with <C>mkdir -p</C>
                (which creates intermediate directories and doesn&apos;t error if the target already
                exists), this produces a uniquely named directory for every day the script runs.
                The pattern appears in every backup and archiving script in this collection.
              </p>
              <p>
                The full script covers alternative date formats for different use cases
                (<C>%Y%m%d</C> for sortable filenames, <C>%Y-%m-%dT%H%M%S</C> for
                second-precision timestamps when multiple runs per day are possible), and includes
                a function that creates both the dated directory and a <C>latest</C> symlink
                pointing to the most recent run.
              </p>
            </>
          }
          code={`mkdir -p "$(date +%Y-%m-%d)_backup"`}
          linkHref="/snippets/create-dated-folder"
          linkLabel="Full script with configurable date format and latest symlink"
        />

        <ScriptEntry
          num={23}
          title="Search Files for Text (grep)"
          problem="Spending 15 minutes manually opening files to find where a config value, error message, or connection string appears across a directory tree."
          description={
            <>
              <p>
                <C>grep -rn</C> searches recursively through every file under the target path and
                prints matching lines with filename and line number. The <C>--include=&quot;*.conf&quot;</C>
                filter limits results to files with the specified extension — removing that flag
                searches all file types, which is useful when you don&apos;t know which file type
                contains the value you&apos;re hunting for. Add <C>-i</C> for case-insensitive
                matching and <C>-l</C> to list only filenames rather than matching lines.
              </p>
              <p>
                The full reference demonstrates the four most common grep variations for sysadmin
                work: finding all references to an IP address across config files, searching for a
                specific error pattern in log files within a date range, inverting a match to find
                lines that don&apos;t contain a required string, and displaying N lines of context
                around each match with <C>-B</C> and <C>-A</C>.
              </p>
            </>
          }
          code={`grep -rn "search_term" /path/to/search --include="*.conf"`}
          linkHref="/snippets/search-files-for-text-grep"
          linkLabel="Full reference with case-insensitive, invert, and context options"
        />

        {/* ===================== COMING SOON ===================== */}
        <SectionDivider label="Coming Soon" />

        <div className="mb-8 rounded-lg border border-border bg-bg2 px-5 py-4">
          <p className="text-sm leading-relaxed text-muted">
            The following scripts are in development and will be published in the coming weeks.
            All completed scripts are linked above. View the full library at{' '}
            <Link href="/snippets" className="text-green hover:text-text transition-colors">
              /snippets
            </Link>
            .
          </p>
        </div>

        <ScriptEntry
          num={24}
          title="Parse JSON with jq"
          problem="Every API and modern config system returns JSON. Parsing it with grep and sed is fragile — a whitespace change in the response breaks the parser."
          description={
            <>
              <p>
                <C>jq</C> is the standard tool for processing JSON in bash scripts. It handles
                nested objects, arrays, and type conversions that would require dozens of lines of
                fragile sed/awk to replicate. The naive version shown here extracts a top-level
                field — the full script covers filtering arrays, transforming output format,
                handling null values safely, and piping API responses directly from curl into jq
                for single-command data extraction.
              </p>
            </>
          }
          code={`curl -s https://api.example.com/status | jq '.status'`}
          linkHref="/snippets"
          linkLabel="Coming soon — view all scripts"
          comingSoon
        />

        <ScriptEntry
          num={25}
          title="Bash Retry on Failure"
          problem="Network calls in deployment scripts that fail once and bring down the entire deploy when a simple retry with backoff would have succeeded."
          description={
            <>
              <p>
                The naive retry loop — <C>until command; do sleep 5; done</C> — has no maximum
                attempt count, which means a permanently failing command runs forever. The full
                script adds configurable attempt limits, exponential backoff (doubling the sleep
                interval on each retry to avoid thundering herd against a recovering service), a
                maximum wait cap, and a final exit with a non-zero code when all attempts are
                exhausted. This pattern belongs in every deployment script that makes network calls.
              </p>
            </>
          }
          code={`until command; do sleep 5; done  # naive — the full script adds attempt limits + backoff`}
          linkHref="/snippets"
          linkLabel="Coming soon — view all scripts"
          comingSoon
        />

        {/* ===================== MONITORING SUITE ===================== */}
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-bold text-text">
            Running All of These as a Monitoring Suite
          </h2>

          <div className="mt-4 space-y-4 leading-relaxed text-muted">
            <p>
              The real value isn&apos;t any one script — it&apos;s running the monitoring group
              together on a predictable cron schedule and routing all output to a shared log file.
              A log file that captures daily output from disk checks, SSL expiry, and website
              uptime gives you something more valuable than any individual alert: a baseline.
            </p>
            <p>
              A week of this log shows you what normal looks like on your server. You see that
              disk usage grows by about 0.5% per day, that the SSL certificate has 84 days
              remaining, that nginx restarts zero times per day. When something deviates from
              that baseline — disk growing 5% in a day, nginx restarting twice in an hour — you
              see it as a deviation from the expected pattern rather than an isolated event that
              you are trying to diagnose without context.
            </p>
            <p>
              Place your scripts in <C>/opt/scripts/</C>, make them executable with{' '}
              <C>chmod +x /opt/scripts/*.sh</C>, and add entries to <C>/etc/cron.d/</C> rather
              than individual user crontabs. The <C>/etc/cron.d/</C> format runs as a specified
              user (root in the example below), survives user account changes, and is visible to
              anyone with root access reviewing the cron configuration. User crontabs are harder
              to audit and easier to lose during account migrations.
            </p>
          </div>

          <CodeBlock code={`# /etc/cron.d/server-monitoring
# Daily at 7am — disk, SSL, and service health
0 7 * * * root /opt/scripts/check-ssl-expiry.sh >> /var/log/monitor.log 2>&1
5 7 * * * root /opt/scripts/disk-space-warning.sh >> /var/log/monitor.log 2>&1
10 7 * * * root /opt/scripts/check-website-up.sh >> /var/log/monitor.log 2>&1

# Every 5 minutes — service watchdog
*/5 * * * * root /opt/scripts/restart-if-stopped.sh nginx >> /var/log/monitor.log 2>&1

# Nightly at 2am — backups
0 2 * * * root /opt/scripts/mysql-backup.sh >> /var/log/backup.log 2>&1
15 2 * * * root /opt/scripts/rsync-backup.sh >> /var/log/backup.log 2>&1

# Weekly on Monday at 6am — security audit
0 6 * * 1 root /opt/scripts/list-open-ports.sh >> /var/log/security-audit.log 2>&1
5 6 * * 1 root /opt/scripts/file-permissions-audit.sh >> /var/log/security-audit.log 2>&1`}
          />

          <div className="mt-4 space-y-4 leading-relaxed text-muted">
            <p>
              The <C>2&gt;&amp;1</C> redirect captures both stdout and stderr to the log file.
              Cron jobs that produce no output send no email through the system MTA — if you want
              email alerts only on failure, redirect stdout to the log and let stderr go to cron&apos;s
              default behavior (email on any output). The staggered minute offsets (0, 5, 10) prevent
              all scripts from running simultaneously and competing for I/O at the same second.
            </p>
            <p>
              <C>tail -f /var/log/monitor.log</C> during the first week of operation lets you verify
              every script is producing expected output. After that, a weekly <C>grep -i warn /var/log/monitor.log</C>
              takes 30 seconds and surfaces anything worth investigating. That is the complete
              maintenance overhead for a monitoring setup that would otherwise require a paid
              platform subscription.
            </p>
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-bold text-text">Frequently Asked Questions</h2>

          <div className="mt-6 space-y-6">
            <details className="group rounded-lg border border-border bg-bg2 p-5" open>
              <summary className="cursor-pointer font-heading text-base font-bold text-text list-none">
                What bash scripts should every sysadmin have?
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                The essential set covers five areas: disk monitoring (
                <Link href="/snippets/disk-space-warning" className="text-green hover:text-text transition-colors">disk-space-warning</Link>,{' '}
                <Link href="/snippets/find-large-files-linux" className="text-green hover:text-text transition-colors">find-large-files-linux</Link>
                ), automated backups (
                <Link href="/snippets/rsync-remote-backup" className="text-green hover:text-text transition-colors">rsync-remote-backup</Link>,{' '}
                <Link href="/snippets/mysql-database-backup" className="text-green hover:text-text transition-colors">mysql-database-backup</Link>
                ), service health (
                <Link href="/snippets/restart-service-if-stopped" className="text-green hover:text-text transition-colors">restart-service-if-stopped</Link>,{' '}
                <Link href="/snippets/check-if-website-is-up" className="text-green hover:text-text transition-colors">check-if-website-is-up</Link>
                ), security auditing (
                <Link href="/snippets/list-open-ports-linux" className="text-green hover:text-text transition-colors">list-open-ports-linux</Link>,{' '}
                <Link href="/snippets/file-permissions-security" className="text-green hover:text-text transition-colors">file-permissions-security</Link>
                ), and SSL monitoring (
                <Link href="/snippets/check-ssl-certificate-expiry" className="text-green hover:text-text transition-colors">check-ssl-certificate-expiry</Link>
                ). These 9 scripts prevent the most common Linux server failures.
              </p>
            </details>

            <details className="group rounded-lg border border-border bg-bg2 p-5">
              <summary className="cursor-pointer font-heading text-base font-bold text-text list-none">
                Do these bash scripts work on Ubuntu, CentOS, and Debian?
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Yes. All scripts use POSIX-compatible bash and standard GNU coreutils available on
                every major Linux distribution — Ubuntu 20.04+, Debian 11+, CentOS 7+, Rocky Linux,
                AlmaLinux, and Amazon Linux 2. Scripts that depend on <C>systemctl</C> are labeled
                accordingly; they work on any systemd-based distribution. The{' '}
                <Link href="/snippets/list-open-ports-linux" className="text-green hover:text-text transition-colors">
                  list-open-ports-linux
                </Link>{' '}
                script includes a fallback from <C>ss</C> to <C>netstat</C> for older distributions
                where <C>ss</C> is not the default.
              </p>
            </details>

            <details className="group rounded-lg border border-border bg-bg2 p-5">
              <summary className="cursor-pointer font-heading text-base font-bold text-text list-none">
                Can I run these bash scripts on a cron schedule?
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Yes. Every script on this list is cron-safe by design: no interactive prompts in
                default mode, clean single-line or structured multi-line output suitable for log
                files, and non-zero exit codes on failure that cron can use to trigger email
                notification through the system MTA. The cron examples in each full script entry
                use <C>/etc/cron.d/</C> format, which runs as a specified user rather than
                inheriting the calling environment — avoiding the most common cron failure mode
                where a script works when run manually but fails on cron because <C>PATH</C> or
                environment variables differ.
              </p>
            </details>

            <details className="group rounded-lg border border-border bg-bg2 p-5">
              <summary className="cursor-pointer font-heading text-base font-bold text-text list-none">
                Are these bash scripts free to use?
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Yes. All scripts on BashSnippets.xyz are published under the MIT License. Copy,
                modify, and deploy them in any environment — including production — without
                restriction. No attribution required, no registration, no paywall. The MIT License
                text is included in each full script file. If you find a bug or improvement, the
                contribution guide is at{' '}
                <Link href="/about" className="text-green hover:text-text transition-colors">
                  /about
                </Link>
                .
              </p>
            </details>
          </div>
        </section>

        {/* Affiliate at end */}
        <AffiliateBox
          partner="digitalocean"
          headline="Put these scripts to work on a real server — DigitalOcean Droplets from $4/mo with $200 free credit."
          className="mt-14"
        />

        {/* Footer nav */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <Link href="/snippets" className="font-mono text-sm text-muted transition-colors hover:text-text">
            ← All bash scripts
          </Link>
          <div className="flex gap-6">
            <Link href="/snippets/server-monitoring" className="font-mono text-xs text-muted transition-colors hover:text-green">
              Server Monitoring →
            </Link>
            <Link href="/snippets/disk-management" className="font-mono text-xs text-muted transition-colors hover:text-green">
              Disk Management →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
