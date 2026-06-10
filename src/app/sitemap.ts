import { snippets } from '@/lib/snippets';
import { tools } from '@/lib/tools';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://bashsnippets.xyz';

export default function sitemap(): MetadataRoute.Sitemap {
  const snippetUrls: MetadataRoute.Sitemap = snippets.map((snippet) => ({
    url: `${SITE_URL}/snippets/${snippet.slug}`,
    lastModified: new Date(snippet.dateModified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const toolUrls: MetadataRoute.Sitemap = tools.map((tool) => {
    const toolWithDates = tool as typeof tool & {
      dateModified?: string;
      datePublished?: string;
    };
    const lastModified =
      toolWithDates.dateModified ?? toolWithDates.datePublished ?? '2026-05-01';

    return {
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified: new Date(lastModified),
      changeFrequency: 'weekly',
      priority: 0.9,
    };
  });

  return [
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
}
