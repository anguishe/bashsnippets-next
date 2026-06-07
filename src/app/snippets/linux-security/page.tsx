import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Linux Security Bash Scripts — Permissions, Keys, Ports, and Certificates | BashSnippets.xyz',
  description:
    'Bash scripts for auditing Linux server security: file permissions, SSH key setup, open port inventory, and SSL certificate monitoring.',
  alternates: {
    canonical: `${SITE_URL}/snippets/linux-security`,
  },
  openGraph: {
    title: 'Linux Security Bash Scripts — Permissions, Keys, Ports, and Certificates | BashSnippets.xyz',
    description:
      'Bash scripts for auditing Linux server security: file permissions, SSH key setup, open port inventory, and SSL certificate monitoring.',
    url: `${SITE_URL}/snippets/linux-security`,
    type: 'website',
    images: [{ url: `${SITE_URL}/ogimage.png`, width: 1200, height: 630, alt: 'BashSnippets — Linux Security Scripts' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linux Security Bash Scripts — Permissions, Keys, Ports, and Certificates | BashSnippets.xyz',
    description:
      'Bash scripts for auditing Linux server security: file permissions, SSH key setup, open port inventory, and SSL certificate monitoring.',
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Linux Security Bash Scripts',
  url: `${SITE_URL}/snippets/linux-security`,
  description:
    'Bash scripts for auditing and hardening Linux server security: file permissions, SSH key authentication, open port inventory, and SSL certificate expiry monitoring.',
  hasPart: [
    { '@type': 'TechArticle', name: 'Linux File Permissions & Security', url: `${SITE_URL}/snippets/file-permissions-security` },
    { '@type': 'TechArticle', name: 'SSH Key Setup Script', url: `${SITE_URL}/snippets/ssh-key-setup-script` },
    { '@type': 'TechArticle', name: 'List All Open Ports on Linux', url: `${SITE_URL}/snippets/list-open-ports-linux` },
    { '@type': 'TechArticle', name: 'Check SSL Certificate Expiry', url: `${SITE_URL}/snippets/check-ssl-certificate-expiry` },
    { '@type': 'TechArticle', name: 'Kill Process on Port', url: `${SITE_URL}/snippets/kill-process-on-port` },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Snippets', item: `${SITE_URL}/snippets` },
    { '@type': 'ListItem', position: 3, name: 'Linux Security', item: `${SITE_URL}/snippets/linux-security` },
  ],
};

const snippets = [
  {
    slug: 'file-permissions-security',
    title: 'Linux File Permissions & Security',
    description:
      'Audits and corrects file permissions on web roots, config files, and SSH directories. Fixes the most common Linux permission misconfigurations.',
  },
  {
    slug: 'ssh-key-setup-script',
    title: 'SSH Key Setup Script',
    description:
      'Generates an SSH key pair and sets up key-based authentication. The setup that eliminates SSH password brute-force attacks.',
  },
  {
    slug: 'list-open-ports-linux',
    title: 'List All Open Ports on Linux',
    description:
      'Maps every port your server is listening on with the process name holding it. Run before opening firewall rules on a new server.',
  },
  {
    slug: 'check-ssl-certificate-expiry',
    title: 'Check SSL Certificate Expiry',
    description:
      'Reads the live TLS certificate from any domain and reports days until expiry. Catches the renewal failure that certbot misses.',
  },
  {
    slug: 'kill-process-on-port',
    title: 'Kill Process on Port',
    description:
      'Frees a port blocked by EADDRINUSE — lsof/ss discovery, SIGTERM, then SIGKILL escalation. Security-adjacent: identifies what is holding each port.',
  },
];

export default function LinuxSecurityHub() {
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
            { label: 'Linux Security' },
          ]}
        />

        <div className="mb-6 flex items-center gap-2 font-mono text-sm text-muted">
          <span className="text-green">$</span>
          <span>linux-security</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-green" aria-hidden />
        </div>

        <h1 className="font-heading text-4xl font-extrabold text-text">
          Linux Security Bash Scripts
        </h1>

        <p className="mt-4 max-w-2xl text-sm text-muted leading-relaxed">
          {snippets.length} scripts · permissions · SSH · ports · certificates
        </p>

        <div className="mt-8 space-y-5 leading-relaxed text-muted">
          <p>
            Security hardening on Linux isn&apos;t a one-time task — it&apos;s a set of checks you run every
            time you set up a server, every time you deploy new software, and periodically on servers
            that have been running for a while. The checks are not exotic. Most of them come down to
            four questions: who can read what, who can connect from where, what ports are listening,
            and are the certificates current?
          </p>
          <p>
            The scripts on this page answer those four questions. They don&apos;t require security tools,
            scanners, or paid software. They use chmod, ssh-keygen, ss, and openssl — the same tools
            that came with your Linux install.
          </p>
          <p>
            File permissions are the most common security misconfiguration on Linux servers. Not 777
            on a web root (obviously wrong) but more subtle issues: world-readable configuration files
            containing database passwords, log directories writable by the web server user, SSH
            authorized_keys files with group-write permissions that sshd silently ignores but that
            indicate a broader permission problem.{' '}
            <Link href="/snippets/file-permissions-security" className="text-green hover:text-text transition-colors">
              file-permissions-security
            </Link>{' '}
            audits and corrects the most common of these.
          </p>
          <p>
            Open ports are the attack surface. Every port in LISTEN state on 0.0.0.0 is a service
            that can be reached from the internet. Most of them should be. Some of them shouldn&apos;t —
            debug interfaces left open, old services from previous configurations, packages that start
            listeners on install without asking.{' '}
            <Link href="/snippets/list-open-ports-linux" className="text-green hover:text-text transition-colors">
              list-open-ports-linux
            </Link>{' '}
            maps your complete listening surface in one command. Run it on a new server before you
            open firewall rules.
          </p>
          <p>
            SSH key authentication is the single highest-value security upgrade for any Linux server
            that accepts remote access. Disabling password authentication and switching to key pairs
            eliminates the entire class of brute-force SSH attacks.{' '}
            <Link href="/snippets/ssh-key-setup-script" className="text-green hover:text-text transition-colors">
              ssh-key-setup-script
            </Link>{' '}
            automates the setup so there&apos;s no manual copying of authorized_keys files and no risk of
            locking yourself out.
          </p>
          <p>
            SSL certificate expiry is the silent failure. certbot renews automatically — until it
            doesn&apos;t. A failed renewal produces no alert visible to the user until the certificate
            expires and browsers start showing the warning.{' '}
            <Link href="/snippets/check-ssl-certificate-expiry" className="text-green hover:text-text transition-colors">
              check-ssl-certificate-expiry
            </Link>{' '}
            runs the check from outside the server (the same way a browser would), catches the
            failure that the renewal hook misses, and gives you 30 days of warning before the site
            goes red.
          </p>
        </div>

        <AffiliateBox
          partner="digitalocean"
          headline="Harden a fresh DigitalOcean droplet in minutes — these four scripts cover the baseline."
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
