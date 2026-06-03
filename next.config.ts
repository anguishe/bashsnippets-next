import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/snippets/disk-space-warning.html',
        destination: '/snippets/disk-space-warning',
        permanent: true,
      },
      {
        source: '/snippets/automated-file-backup.html',
        destination: '/snippets/automated-file-backup',
        permanent: true,
      },
      {
        source: '/snippets/delete-old-log-files.html',
        destination: '/snippets/delete-old-log-files',
        permanent: true,
      },
      {
        source: '/snippets/quick-system-info-report.html',
        destination: '/snippets/quick-system-info-report',
        permanent: true,
      },
      {
        source: '/snippets/search-files-for-text-grep.html',
        destination: '/snippets/search-files-for-text-grep',
        permanent: true,
      },
      {
        source: '/snippets/check-if-website-is-up.html',
        destination: '/snippets/check-if-website-is-up',
        permanent: true,
      },
      {
        source: '/snippets/bash-error-handling.html',
        destination: '/snippets/bash-error-handling',
        permanent: true,
      },
      {
        source: '/snippets/bash-if-else-examples.html',
        destination: '/snippets/bash-if-else-examples',
        permanent: true,
      },
      {
        source: '/snippets/create-dated-folder.html',
        destination: '/snippets/create-dated-folder',
        permanent: true,
      },
      {
        source: '/snippets/kill-a-process.html',
        destination: '/snippets/kill-a-process',
        permanent: true,
      },
      {
        source: '/snippets/file-permissions-security.html',
        destination: '/snippets/file-permissions-security',
        permanent: true,
      },
      {
        source: '/snippets/monitor-cpu-ram-usage.html',
        destination: '/snippets/monitor-cpu-ram-usage',
        permanent: true,
      },
      {
        source: '/snippets/bash-send-email-alert.html',
        destination: '/snippets/bash-send-email-alert',
        permanent: true,
      },
      {
        source: '/snippets/mysql-database-backup.html',
        destination: '/snippets/mysql-database-backup',
        permanent: true,
      },
      {
        source: '/snippets/ssh-key-setup-script.html',
        destination: '/snippets/ssh-key-setup-script',
        permanent: true,
      },
      {
        source: '/snippets/restart-service-if-stopped.html',
        destination: '/snippets/restart-service-if-stopped',
        permanent: true,
      },
      {
        source: '/tools/bash-exit-code-lookup.html',
        destination: '/tools/bash-exit-code-lookup',
        permanent: true,
      },
      {
        source: '/tools/cron-job-builder.html',
        destination: '/tools/cron-job-builder',
        permanent: true,
      },
      {
        source: '/tools/chmod-permissions-builder.html',
        destination: '/tools/chmod-permissions-builder',
        permanent: true,
      },
      {
        source: '/tools/path-debugger.html',
        destination: '/tools/path-debugger',
        permanent: true,
      },
      {
        source: '/tools/bash-boilerplate-generator.html',
        destination: '/tools/bash-boilerplate-generator',
        permanent: true,
      },
      {
        source: '/tools/shellcheck-error-decoder.html',
        destination: '/tools/shellcheck-error-decoder',
        permanent: true,
      },
      {
        source: '/builder.html',
        destination: '/tools/bash-boilerplate-generator',
        permanent: true,
      },
      {
        source: '/about.html',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/privacy.html',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/contact.html',
        destination: '/contact',
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-gfm'], 'remark-frontmatter'],
    rehypePlugins: [
      ['rehype-slug'],
      ['rehype-highlight', { ignoreMissing: true }],
    ],
  },
});

export default withMDX(nextConfig);
