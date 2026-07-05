import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import FaqTerminal from '@/components/FaqTerminal';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: { absolute: 'Bash Server Monitoring Scripts — Watch Linux Without Buying Tools | BashSnippets.xyz' },
  description:
    'Free bash scripts for monitoring disk space, website uptime, CPU/RAM, running services, SSL expiry, and system health. Copy-paste ready, cron-schedulable, no agents required.',
  alternates: {
    canonical: `${SITE_URL}/snippets/server-monitoring`,
  },
  openGraph: {
    title: 'Bash Server Monitoring Scripts — Watch Linux Without Buying Tools | BashSnippets.xyz',
    description:
      'Free bash scripts for monitoring disk space, website uptime, CPU/RAM, running services, SSL expiry, and system health. Copy-paste ready, cron-schedulable, no agents required.',
    url: `${SITE_URL}/snippets/server-monitoring`,
    type: 'website',
    images: [{ url: `${SITE_URL}/ogimage.png`, width: 1200, height: 630, alt: 'BashSnippets — Server Monitoring Scripts' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bash Server Monitoring Scripts — Watch Linux Without Buying Tools | BashSnippets.xyz',
    description:
      'Free bash scripts for monitoring disk space, website uptime, CPU/RAM, running services, SSL expiry, and system health. Copy-paste ready, cron-schedulable, no agents required.',
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Server Monitoring Bash Scripts',
  url: `${SITE_URL}/snippets/server-monitoring`,
  description:
    'Bash scripts for monitoring Linux server health: disk usage, website uptime, CPU/RAM, services, and SSL certificate expiry. All scripts are cron-ready and require only coreutils.',
  hasPart: [
    { '@type': 'TechArticle', name: 'Disk Space Warning Script', url: `${SITE_URL}/snippets/disk-space-warning` },
    { '@type': 'TechArticle', name: 'Check If Website Is Up', url: `${SITE_URL}/snippets/check-if-website-is-up` },
    { '@type': 'TechArticle', name: 'Monitor CPU and RAM Usage', url: `${SITE_URL}/snippets/monitor-cpu-ram-usage` },
    { '@type': 'TechArticle', name: 'Restart Service If Stopped', url: `${SITE_URL}/snippets/restart-service-if-stopped` },
    { '@type': 'TechArticle', name: 'Quick System Info Report', url: `${SITE_URL}/snippets/quick-system-info-report` },
    { '@type': 'TechArticle', name: 'Check SSL Certificate Expiry', url: `${SITE_URL}/snippets/check-ssl-certificate-expiry` },
    { '@type': 'TechArticle', name: 'Kill a Process', url: `${SITE_URL}/snippets/kill-a-process` },
    { '@type': 'TechArticle', name: 'Send Email Alerts from Bash', url: `${SITE_URL}/snippets/bash-send-email-alert` },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Snippets', item: `${SITE_URL}/snippets` },
    { '@type': 'ListItem', position: 3, name: 'Server Monitoring', item: `${SITE_URL}/snippets/server-monitoring` },
  ],
};

const snippets = [
  {
    slug: 'disk-space-warning',
    title: 'Disk Space Warning Script',
    description: 'Fires a warning when any mounted filesystem crosses a threshold. The simplest script on this page and the most likely to prevent a production outage.',
  },
  {
    slug: 'check-if-website-is-up',
    title: 'Check If Website Is Up',
    description: 'Sends an HTTP request and checks the response code. Runs from cron and alerts when your site stops responding.',
  },
  {
    slug: 'monitor-cpu-ram-usage',
    title: 'Monitor CPU and RAM Usage',
    description: 'Logs CPU load average and memory usage with timestamps. Catches resource exhaustion before services start crashing.',
  },
  {
    slug: 'restart-service-if-stopped',
    title: 'Restart Service If Stopped',
    description: 'Checks whether a systemd service is active and restarts it if not. The lightweight watchdog for services that don\'t auto-recover.',
  },
  {
    slug: 'quick-system-info-report',
    title: 'Quick System Info Report',
    description: 'Prints a one-screen health snapshot: uptime, load, memory, disk, and top processes. Run it the moment you SSH into an unfamiliar box.',
  },
  {
    slug: 'check-ssl-certificate-expiry',
    title: 'Check SSL Certificate Expiry',
    description: 'Reads the live TLS certificate from a domain and reports days until expiry. Add to cron with a 30-day threshold for Let\'s Encrypt renewals.',
  },
  {
    slug: 'kill-a-process',
    title: 'Kill a Process',
    description: 'Safely terminates a named process with pgrep preview and pkill. Essential when a service hangs and needs a clean kill before you restart it.',
  },
  {
    slug: 'bash-send-email-alert',
    title: 'Send Email Alerts from Bash',
    description: 'Sends a notification email from any monitoring script using sendmail or msmtp. The standard alert channel for cron-based monitoring.',
  },
];

const decisionRows = [
  {
    slug: 'disk-space-warning',
    signal: 'you want one recurring check that warns before any filesystem crosses a usage threshold. The first script to install on every server, before anything has gone wrong.',
  },
  {
    slug: 'check-if-website-is-up',
    signal: 'a public URL has to stay reachable and you need to know about a non-200 response — or a connection that times out entirely — before a customer files the ticket.',
  },
  {
    slug: 'monitor-cpu-ram-usage',
    signal: 'the box feels slow but nothing is obviously down: sustained load average or memory pressure that has not crashed anything yet, but is heading there.',
  },
  {
    slug: 'restart-service-if-stopped',
    signal: 'a specific systemd unit must stay running and you want automatic recovery within a minute of it dying, plus a log line every time it does.',
  },
  {
    slug: 'quick-system-info-report',
    signal: 'you have just SSHed into an unfamiliar or misbehaving box and need its whole state — uptime, load, memory, disk, top processes — on one screen, immediately.',
  },
  {
    slug: 'check-ssl-certificate-expiry',
    signal: 'HTTPS depends on a certificate that renews on a schedule you do not personally watch, and a silent renewal failure would not surface until browsers go red.',
  },
  {
    slug: 'kill-a-process',
    signal: 'a named process is hung or duplicated and has to be stopped cleanly — with a preview of what matches — before you restart it.',
  },
  {
    slug: 'bash-send-email-alert',
    signal: 'any of the checks above detects a problem and the alert has to leave the box and reach a human inbox without flooding it on every cron run.',
  },
];

const faqItems = [
  {
    question: 'How do I monitor a Linux server without installing monitoring software?',
    answer:
      'Schedule the bash scripts on this page with cron. Each one uses only coreutils, systemctl, curl, or openssl, so there is no agent to install and no dashboard to maintain. A single crontab with a handful of entries covers disk, uptime, CPU, services, and certificate expiry — the same checks a paid SaaS platform runs, at zero cost and with no outbound telemetry.',
  },
  {
    question: 'How often should monitoring scripts run in cron?',
    answer:
      'Match the interval to how fast the failure hurts. Uptime and service checks run every one to five minutes; disk and CPU checks every five to fifteen minutes; SSL expiry once a day is enough. Running everything every minute wastes CPU and floods logs without catching failures any sooner — a certificate that expires in 20 days does not need checking 1,440 times a day.',
  },
  {
    question: 'Why are my monitoring scripts not sending email alerts?',
    answer:
      'Most cloud VPS providers block outbound port 25, so a bare mail command silently fails with no error you will notice. Relay through an authenticated SMTP service with msmtp instead, and add per-run deduplication so a persistent problem does not flood your inbox on every cron run. The send-email-alert script handles both the relay and the rate limiting.',
  },
  {
    question: 'What is the difference between monitoring uptime and monitoring a service?',
    answer:
      'Uptime monitoring tests the response from outside the box and catches network, DNS, and application failures a user would actually see. Service monitoring checks systemd state on the box itself and can act on it by restarting the unit. Run both: one sees what users see, the other can fix what broke. Neither replaces the other.',
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

export default function ServerMonitoringHub() {
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
            { label: 'Server Monitoring' },
          ]}
        />

        <div className="mb-6 flex items-center gap-2 font-mono text-sm text-muted">
          <span className="text-green">$</span>
          <span>server-monitoring</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-green" aria-hidden />
        </div>

        <h1 className="font-heading text-4xl font-extrabold text-text">
          Server Monitoring Bash Scripts
        </h1>

        <p className="mt-4 max-w-2xl text-sm text-muted leading-relaxed">
          {snippets.length} scripts · cron-ready · no agents · coreutils only
        </p>

        <div className="mt-8 space-y-5 leading-relaxed text-muted">
          <p>
            Your monitoring setup should answer three questions in under 30 seconds: is the service
            running, is the disk about to fill, and is the network reachable? Most teams buy a SaaS
            platform to answer these. Most of the time, six bash scripts do the same job at zero cost.
          </p>
          <p>
            The scripts on this page use nothing beyond coreutils, systemctl, curl, and openssl —
            tools present on every Linux distribution and every cloud provider&apos;s base image. No agents
            to install. No API keys to rotate. No dashboard to log into at 2am. Just shell scripts on
            a cron that pipe clean output to a log and send an alert when something breaks.
          </p>
          <p>
            The monitoring gap is always the same: things fail silently. A disk fills incrementally —
            70%, 80%, 90% — until writes start failing and services begin crashing in confusing ways.
            A website goes down on a holiday weekend. A service segfaults and doesn&apos;t restart because
            there&apos;s no watchdog. An SSL certificate expires at 2am and HTTPS silently breaks. By the
            time a human notices, the window for a graceful fix is usually closed.
          </p>
          <p>
            The scripts here are the watchdogs. Each one checks one thing, emits a clean status line,
            and fails loudly when the threshold is crossed. They are designed to be composed: run all
            of them from a single monitoring wrapper script, or schedule each independently depending
            on what you care about most.
          </p>
          <p>
            Start with{' '}
            <Link href="/snippets/disk-space-warning" className="text-green hover:text-text transition-colors">
              disk-space-warning
            </Link>{' '}
            — it is the most likely script to save you from a production outage in the next 90 days.
            Then add{' '}
            <Link href="/snippets/check-if-website-is-up" className="text-green hover:text-text transition-colors">
              check-if-website-is-up
            </Link>{' '}
            if you run any public-facing service. If you manage a server with auto-renewing Let&apos;s
            Encrypt certificates,{' '}
            <Link href="/snippets/check-ssl-certificate-expiry" className="text-green hover:text-text transition-colors">
              check-ssl-certificate-expiry
            </Link>{' '}
            closes the monitoring gap that renewal hooks miss: the hook runs, certbot silently fails,
            and the certificate expires anyway without anyone knowing until the browser warning appears.
          </p>
          <p>
            All of these scripts assume the problem has already happened to you or someone you know.
            They are not tutorials. They are the scripts you add to <code className="font-mono text-xs text-blue">/opt/scripts</code>,{' '}
            <code className="font-mono text-xs text-blue">chmod +x</code>, and add to crontab the day you set up a new server.
          </p>
        </div>

        <AffiliateBox
          partner="digitalocean"
          headline="Monitor your DigitalOcean droplets with these scripts — no third-party agents, no monthly fees."
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
            Monitoring is not one job — it is several, and each script here answers a different
            question. The trap is reaching for the wrong one: running a CPU check when the real
            problem is a dead service, or watching uptime when the disk is the thing about to fail.
            Match the signal you are seeing to the script built for it.
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
            These compose into a closed monitoring loop.{' '}
            <Link href="/snippets/restart-service-if-stopped" className="text-green hover:text-text transition-colors">
              restart-service-if-stopped
            </Link>{' '}
            runs every minute from cron and detects that nginx has died; it calls{' '}
            <code className="font-mono text-xs text-blue">systemctl start</code>, and if the restart
            itself fails it pipes the failure through{' '}
            <Link href="/snippets/bash-send-email-alert" className="text-green hover:text-text transition-colors">
              bash-send-email-alert
            </Link>{' '}
            so a human is paged instead of guessing. Separately,{' '}
            <Link href="/snippets/disk-space-warning" className="text-green hover:text-text transition-colors">
              disk-space-warning
            </Link>{' '}
            crosses its threshold at 3am and fires the same alert function; the on-call engineer then
            runs{' '}
            <Link href="/snippets/quick-system-info-report" className="text-green hover:text-text transition-colors">
              quick-system-info-report
            </Link>{' '}
            on login to confirm the box&apos;s full state in one screen before touching anything.
            Detection, recovery, and notification are three separate scripts, not one monolith —
            which is exactly why each can be scheduled, tested, and replaced on its own.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-text">
            Frequently Asked Questions
          </h2>
          <FaqTerminal items={faqItems} label="faq — server-monitoring" />
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
