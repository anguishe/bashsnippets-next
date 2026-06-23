import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://bashsnippets.xyz';

// Only static routes that have no registry entry belong here.
const staticEntries = [
  { url: `${SITE_URL}/`,                                          lastmod: '2026-06-03', changefreq: 'daily',   priority: 1.0  },
  { url: `${SITE_URL}/snippets`,                                  lastmod: '2026-06-10', changefreq: 'daily',   priority: 0.9  },
  { url: `${SITE_URL}/tools`,                                     lastmod: '2026-06-10', changefreq: 'daily',   priority: 0.9  },
  { url: `${SITE_URL}/guides`,                                    lastmod: '2026-06-10', changefreq: 'weekly',  priority: 0.8  },
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
  { url: `${SITE_URL}/guides/bash-scripting-for-ci-cd-pipelines`, lastmod: '2026-06-10', changefreq: 'weekly',  priority: 0.8  },
  { url: `${SITE_URL}/guides/bash-text-processing`,               lastmod: '2026-06-17', changefreq: 'weekly',  priority: 0.8  },
  { url: `${SITE_URL}/guides/bash-scripts-that-survive-cron`,     lastmod: '2026-06-22', changefreq: 'weekly',  priority: 0.8  },
];

/**
 * Extract { slug, dateModified } pairs from a TypeScript registry source file
 * by matching slug: '...' and the nearest following dateModified: '...' literal.
 * Coupled to the object-literal format of src/lib/snippets.ts and src/lib/tools.ts.
 */
function parseRegistry(filePath) {
  const content = readFileSync(resolve(process.cwd(), filePath), 'utf-8');
  const slugs = [...content.matchAll(/slug:\s*'([^']+)'/g)]
    .map(m => ({ slug: m[1], index: m.index }));
  const dates = [...content.matchAll(/dateModified:\s*'([^']+)'/g)]
    .map(m => ({ date: m[1], index: m.index }));

  return slugs
    .map(s => ({ slug: s.slug, dateModified: dates.find(d => d.index > s.index)?.date }))
    .filter(e => e.dateModified);
}

const snippets = parseRegistry('src/lib/snippets.ts');
const tools    = parseRegistry('src/lib/tools.ts');

const snippetEntries = snippets.map(s => ({
  url:        `${SITE_URL}/snippets/${s.slug}`,
  lastmod:    s.dateModified,
  changefreq: 'weekly',
  priority:   0.8,
}));

const toolEntries = tools.map(t => ({
  url:        `${SITE_URL}/tools/${t.slug}`,
  lastmod:    t.dateModified,
  changefreq: 'weekly',
  priority:   0.9,
}));

const allEntries = [...staticEntries, ...snippetEntries, ...toolEntries];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allEntries.map(e =>
    `  <url>\n    <loc>${e.url}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
  ),
  '</urlset>',
].join('\n');

const outPath = resolve(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`sitemap.xml → ${outPath} (${allEntries.length} entries: ${snippets.length} snippets, ${tools.length} tools)`);
