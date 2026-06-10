import { snippets } from '@/lib/snippets';
import { tools } from '@/lib/tools';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://bashsnippets.xyz';

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
};

export async function GET() {
  const snippetUrls: SitemapEntry[] = snippets.map((snippet) => ({
    url: `${SITE_URL}/snippets/${snippet.slug}`,
    lastModified: new Date(snippet.dateModified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const toolUrls: SitemapEntry[] = tools.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: new Date(tool.dateModified ?? tool.datePublished),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const entries: SitemapEntry[] = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date('2026-06-03'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/snippets`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: new Date('2026-06-08'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/starter-kit`,
      lastModified: new Date('2026-06-08'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/snippets/server-monitoring`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/snippets/backup-and-recovery`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/snippets/disk-management`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/snippets/linux-security`,
      lastModified: new Date('2026-06-06'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/guides/bash-scripts-every-sysadmin-needs`,
      lastModified: new Date('2026-06-08'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...snippetUrls,
    ...toolUrls,
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ url, lastModified, changeFrequency, priority }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date(lastModified).toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Vary': '',
    },
  });
}
