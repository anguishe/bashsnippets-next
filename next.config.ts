import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
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
        source: '/snippets/find-duplicate-files.html',
        destination: '/snippets/find-duplicate-files',
        permanent: true,
      },
      {
        source: '/snippets/find-large-files-linux.html',
        destination: '/snippets/find-large-files-linux',
        permanent: true,
      },
      {
        source: '/snippets/kill-process-on-port.html',
        destination: '/snippets/kill-process-on-port',
        permanent: true,
      },
      {
        source: '/snippets/rsync-remote-backup.html',
        destination: '/snippets/rsync-remote-backup',
        permanent: true,
      },
      {
        source: '/snippets/check-ssl-certificate-expiry.html',
        destination: '/snippets/check-ssl-certificate-expiry',
        permanent: true,
      },
      {
        source: '/snippets/list-open-ports-linux.html',
        destination: '/snippets/list-open-ports-linux',
        permanent: true,
      },
      {
        source: '/snippets/docker-prune-cleanup.html',
        destination: '/snippets/docker-prune-cleanup',
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
        source: '/tools/rsync-command-builder.html',
        destination: '/tools/rsync-command-builder',
        permanent: true,
      },
      {
        source: '/tools/grep-pattern-builder.html',
        destination: '/tools/grep-pattern-builder',
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
      {
        source: '/tools/index.html',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/bash-scripts',
        destination: '/snippets',
        permanent: true,
      },
      {
        source: '/bash-scripts/:path*',
        destination: '/snippets',
        permanent: true,
      },
      {
        source: '/snippets/backup-and-recovery',
        destination: '/snippets',
        permanent: true,
      },
      {
        source: '/snippets/linux-security',
        destination: '/snippets',
        permanent: true,
      },
      {
        source: '/snippets/disk-management',
        destination: '/snippets',
        permanent: true,
      },
      {
        source: '/snippets/server-monitoring',
        destination: '/snippets',
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
