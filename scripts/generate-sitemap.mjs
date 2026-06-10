import { writeFileSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://bashsnippets.xyz';

// Static entries — copied verbatim from route.ts
const staticEntries = [
  { url: `${SITE_URL}/`,                                          lastmod: '2026-06-03', changefreq: 'daily',   priority: 1.0  },
  { url: `${SITE_URL}/snippets`,                                  lastmod: '2026-06-06', changefreq: 'daily',   priority: 0.9  },
  { url: `${SITE_URL}/tools`,                                     lastmod: '2026-06-06', changefreq: 'daily',   priority: 0.9  },
  { url: `${SITE_URL}/guides`,                                    lastmod: '2026-06-08', changefreq: 'weekly',  priority: 0.8  },
  { url: `${SITE_URL}/starter-kit`,                               lastmod: '2026-06-08', changefreq: 'monthly', priority: 0.8  },
  { url: `${SITE_URL}/about`,                                     lastmod: '2026-06-06', changefreq: 'monthly', priority: 0.5  },
  { url: `${SITE_URL}/privacy`,                                   lastmod: '2026-06-06', changefreq: 'yearly',  priority: 0.3  },
  { url: `${SITE_URL}/contact`,                                   lastmod: '2026-06-06', changefreq: 'yearly',  priority: 0.3  },
  { url: `${SITE_URL}/terms`,                                     lastmod: '2026-06-06', changefreq: 'yearly',  priority: 0.3  },
  { url: `${SITE_URL}/snippets/server-monitoring`,                lastmod: '2026-06-06', changefreq: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/snippets/backup-and-recovery`,              lastmod: '2026-06-06', changefreq: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/snippets/disk-management`,                  lastmod: '2026-06-06', changefreq: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/snippets/linux-security`,                   lastmod: '2026-06-06', changefreq: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/guides/bash-scripts-every-sysadmin-needs`,  lastmod: '2026-06-08', changefreq: 'weekly',  priority: 0.8  },
];

// src/lib/*.ts cannot be imported directly in plain Node (TypeScript + path aliases).
// Inline arrays synced from src/lib/snippets.ts and src/lib/tools.ts.
const snippets = [
  { slug: 'disk-space-warning', dateModified: '2026-06-03' },
  { slug: 'automated-file-backup', dateModified: '2026-06-03' },
  { slug: 'delete-old-log-files', dateModified: '2026-06-03' },
  { slug: 'quick-system-info-report', dateModified: '2026-05-22' },
  { slug: 'search-files-for-text-grep', dateModified: '2026-06-03' },
  { slug: 'check-if-website-is-up', dateModified: '2026-06-03' },
  { slug: 'bash-error-handling', dateModified: '2026-06-03' },
  { slug: 'bash-if-else-examples', dateModified: '2026-06-03' },
  { slug: 'create-dated-folder', dateModified: '2026-06-03' },
  { slug: 'kill-a-process', dateModified: '2026-06-03' },
  { slug: 'file-permissions-security', dateModified: '2026-06-03' },
  { slug: 'monitor-cpu-ram-usage', dateModified: '2026-06-03' },
  { slug: 'bash-send-email-alert', dateModified: '2026-06-03' },
  { slug: 'mysql-database-backup', dateModified: '2026-06-03' },
  { slug: 'ssh-key-setup-script', dateModified: '2026-06-03' },
  { slug: 'find-duplicate-files', dateModified: '2026-06-03' },
  { slug: 'restart-service-if-stopped', dateModified: '2026-06-03' },
  { slug: 'find-large-files-linux', dateModified: '2026-06-06' },
  { slug: 'kill-process-on-port', dateModified: '2026-06-06' },
  { slug: 'rsync-remote-backup', dateModified: '2026-06-06' },
  { slug: 'check-ssl-certificate-expiry', dateModified: '2026-06-06' },
  { slug: 'list-open-ports-linux', dateModified: '2026-06-06' },
  { slug: 'docker-prune-cleanup', dateModified: '2026-06-06' },
];

const tools = [
  { slug: 'bash-exit-code-lookup', datePublished: '2026-06-02', dateModified: '2026-06-06' },
  { slug: 'cron-job-builder', datePublished: '2026-06-02', dateModified: '2026-06-04' },
  { slug: 'chmod-permissions-builder', datePublished: '2026-06-02', dateModified: '2026-06-06' },
  { slug: 'path-debugger', datePublished: '2026-06-02', dateModified: '2026-06-06' },
  { slug: 'bash-boilerplate-generator', datePublished: '2026-06-02', dateModified: '2026-06-06' },
  { slug: 'rsync-command-builder', datePublished: '2026-06-06', dateModified: '2026-06-06' },
  { slug: 'grep-pattern-builder', datePublished: '2026-06-07', dateModified: '2026-06-07' },
  { slug: 'shellcheck-error-decoder', datePublished: '2026-06-02', dateModified: '2026-06-06' },
];

const snippetEntries = snippets.map(s => ({
  url: `${SITE_URL}/snippets/${s.slug}`,
  lastmod: s.dateModified,
  changefreq: 'weekly',
  priority: 0.8,
}));

const toolEntries = tools.map(t => ({
  url: `${SITE_URL}/tools/${t.slug}`,
  lastmod: t.dateModified ?? t.datePublished,
  changefreq: 'weekly',
  priority: 0.9,
}));

const allEntries = [...staticEntries, ...snippetEntries, ...toolEntries];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allEntries.map(e => `  <url>\n    <loc>${e.url}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`),
  '</urlset>',
].join('\n');

const outPath = resolve(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`sitemap.xml written to ${outPath} with ${allEntries.length} entries`);
