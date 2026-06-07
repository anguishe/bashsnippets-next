import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Bash Server Monitoring Scripts — Watch Linux Without Buying Tools | BashSnippets.xyz',
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

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/snippets" className="font-mono text-sm text-muted transition-colors hover:text-text">
            ← View all bash scripts
          </Link>
        </div>
      </main>
    </>
  );
}
