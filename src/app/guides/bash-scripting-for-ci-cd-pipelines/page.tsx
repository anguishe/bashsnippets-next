import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { mdxComponents } from '@/components/MDXComponents';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: { absolute: 'Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker | BashSnippets.xyz' },
  description:
    'A pipeline reported every step green and deployed broken code, because the build step piped its output through tee and bash returned the exit code of tee — always zero — instead of the compiler that had just failed. The error was real, the logs showed it, and the pipeline shipped anyway.',
  alternates: {
    canonical: `${SITE_URL}/guides/bash-scripting-for-ci-cd-pipelines`,
  },
  openGraph: {
    title: 'Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker | BashSnippets.xyz',
    description:
      'A pipeline reported every step green and deployed broken code, because the build step piped its output through tee and bash returned the exit code of tee — always zero — instead of the compiler that had just failed. The error was real, the logs showed it, and the pipeline shipped anyway.',
    url: `${SITE_URL}/guides/bash-scripting-for-ci-cd-pipelines`,
    type: 'article',
    publishedTime: '2026-06-10T00:00:00Z',
    images: [
      {
        url: `${SITE_URL}/ogimage.png`,
        width: 1200,
        height: 630,
        alt: 'Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker | BashSnippets.xyz',
    description:
      'A pipeline reported every step green and deployed broken code, because the build step piped its output through tee and bash returned the exit code of tee — always zero — instead of the compiler that had just failed. The error was real, the logs showed it, and the pipeline shipped anyway.',
    images: [`${SITE_URL}/ogimage.png`],
  },
};

const techArticleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker',
  description:
    'A pipeline reported every step green and deployed broken code, because the build step piped its output through tee and bash returned the exit code of tee — always zero — instead of the compiler that had just failed. The error was real, the logs showed it, and the pipeline shipped anyway.',
  url: `${SITE_URL}/guides/bash-scripting-for-ci-cd-pipelines`,
  datePublished: '2026-06-10',
  dateModified: '2026-06-10',
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
      name: 'Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker',
      item: `${SITE_URL}/guides/bash-scripting-for-ci-cd-pipelines`,
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

export default async function BashScriptsGuide() {
  const getContent = async () => {
    try {
      const mod = await import('@/content/guides/bash-scripting-for-ci-cd-pipelines.mdx');
      return mod.default;
    } catch (error) {
      console.error('[MDX] Failed to load guide: bash-scripting-for-ci-cd-pipelines', error);
      return null;
    }
  };

  const Content = await getContent();

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
            { label: 'Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker' },
          ]}
        />

        <h1 className="font-heading text-4xl font-extrabold leading-tight text-text md:text-5xl">
          Bash Scripting for CI/CD Pipelines: GitHub Actions, Deploys, and Docker
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
          <span>Published: June 10, 2026</span>
          <span aria-hidden>·</span>
          <span>18 min read</span>
        </div>

        <article className="prose-snippet mt-10">
          {Content ? (
            <Content components={mdxComponents} />
          ) : (
            <p className="text-muted">Content temporarily unavailable.</p>
          )}
        </article>

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/guides" className="font-mono text-sm text-muted transition-colors hover:text-text">
            ← All guides
          </Link>
        </div>
      </main>
    </>
  );
}
