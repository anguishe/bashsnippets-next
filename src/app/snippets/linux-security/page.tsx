import AffiliateBox from '@/components/AffiliateBox';
import Breadcrumb from '@/components/Breadcrumb';
import FaqTerminal from '@/components/FaqTerminal';
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

const decisionRows = [
  {
    slug: 'file-permissions-security',
    signal: 'you inherit a server or deploy new software and need to confirm config files are not world-readable, web roots are not world-writable, and SSH directories carry the permissions sshd demands.',
  },
  {
    slug: 'ssh-key-setup-script',
    signal: 'a server still accepts password logins over the internet. This is the single highest-value hardening step — it eliminates the entire class of brute-force SSH attacks in one change.',
  },
  {
    slug: 'list-open-ports-linux',
    signal: 'you are about to open firewall rules on a new box and need to see every service in LISTEN state, and which are bound to 0.0.0.0 (network-reachable) versus 127.0.0.1 (local only).',
  },
  {
    slug: 'check-ssl-certificate-expiry',
    signal: 'HTTPS depends on a certificate that auto-renews, and you want to catch the silent renewal failure 30 days before browsers start showing the warning page.',
  },
  {
    slug: 'kill-process-on-port',
    signal: 'the open-ports inventory turns up an unexpected listener and you need to identify the owning process and stop it cleanly before it stays exposed.',
  },
];

const faqItems = [
  {
    question: 'How do I check which ports are open on Linux?',
    answer:
      'Run the list-open-ports script, which wraps ss -tlnp to show every listening TCP port, the process holding it, and whether it is bound to 0.0.0.0 (reachable from the network) or 127.0.0.1 (local only). The bind address is the column that matters: anything on 0.0.0.0 is part of your attack surface and should be there on purpose, not by accident.',
  },
  {
    question: 'Is SSH key authentication more secure than a password?',
    answer:
      'Yes. A password can be brute-forced or leaked; a 256-bit Ed25519 key cannot be guessed in any practical timeframe. Set up keys with the ssh-key-setup script, confirm you can log in with the key, then disable password authentication in sshd_config. That sequence removes the entire class of brute-force SSH attacks while making sure you never lock yourself out.',
  },
  {
    question: 'What file permissions should a web server use?',
    answer:
      'Files should be 644 and directories 755, owned by a non-web user with the web server only in the group. World-writable (777) anything is the classic hole — a compromised script can overwrite your application files. The file-permissions script audits for these and applies the correct pattern with two separate find commands, so it never strips execute bits from directories and breaks navigation. Secrets-bearing files such as .env or wp-config.php should be tighter still at 640, readable by the owner and group but never world-readable.',
  },
  {
    question: 'Why did my SSL certificate expire if certbot renews automatically?',
    answer:
      'A renewal hook can fail silently — a rate limit, a changed DNS record, a stopped service — and certbot reports nothing the user sees until the certificate expires. The check-ssl-certificate-expiry script reads the live certificate from outside the box, the way a browser does, and alerts 30 days out. It catches the failure that the renewal log hides and the renewal hook never surfaces.',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
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

        <section className="mt-16">
          <h2 className="mb-4 font-heading text-2xl font-bold text-text">
            Which Script Do I Reach For?
          </h2>
          <p className="mb-6 leading-relaxed text-muted">
            Security on a server is a set of distinct surfaces — the filesystem, remote access, the
            network, and TLS — and each script audits one of them. Running an SSH check does nothing
            for an exposed port. Identify the surface you are worried about and reach for the script
            that maps it. None of these replace a firewall or a patching schedule; they close the
            gaps those tools miss — the world-writable config a package left behind, the debug port
            a deploy opened, the certificate a renewal hook failed to update — the small, silent
            misconfigurations that turn into incidents.
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
            These chain into a new-server hardening pass.{' '}
            <Link href="/snippets/ssh-key-setup-script" className="text-green hover:text-text transition-colors">
              ssh-key-setup-script
            </Link>{' '}
            goes first — key authentication before anything else, so a misconfiguration later never
            leaves password login exposed.{' '}
            <Link href="/snippets/list-open-ports-linux" className="text-green hover:text-text transition-colors">
              list-open-ports-linux
            </Link>{' '}
            then maps every listener; an unexpected service bound to{' '}
            <code className="font-mono text-xs text-blue">0.0.0.0</code> gets investigated with{' '}
            <Link href="/snippets/kill-process-on-port" className="text-green hover:text-text transition-colors">
              kill-process-on-port
            </Link>
            , which names the process before stopping it.{' '}
            <Link href="/snippets/file-permissions-security" className="text-green hover:text-text transition-colors">
              file-permissions-security
            </Link>{' '}
            audits the web root and config files in the same pass. Finally,{' '}
            <Link href="/snippets/check-ssl-certificate-expiry" className="text-green hover:text-text transition-colors">
              check-ssl-certificate-expiry
            </Link>{' '}
            goes on a daily cron last, so the one failure mode that produces no error of its own still
            reaches you with 30 days to spare. Run the first four as a one-time pass on every new
            box and keep the certificate check on its schedule — the difference between a server
            hardened on day one and one hardened after the incident is usually just this checklist.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-text">
            Frequently Asked Questions
          </h2>
          <FaqTerminal items={faqItems} label="faq — linux-security" />
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
