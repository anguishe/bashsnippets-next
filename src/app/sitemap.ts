import { snippets } from '@/lib/snippets';
import { getAllToolSlugs } from '@/lib/tools';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://bashsnippets.xyz';

const TOOL_LAST_MODIFIED = new Date('2026-05-22');

export default function sitemap(): MetadataRoute.Sitemap {
  const snippetUrls: MetadataRoute.Sitemap = snippets.map((snippet) => ({
    url: `${SITE_URL}/snippets/${snippet.slug}`,
    lastModified: new Date(snippet.dateModified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const toolUrls: MetadataRoute.Sitemap = getAllToolSlugs().map((slug) => ({
    url: `${SITE_URL}/tools/${slug}`,
    lastModified: TOOL_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date('2026-06-03'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/snippets`,
      lastModified: new Date('2026-06-03'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: TOOL_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date('2026-05-22'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date('2026-05-22'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date('2026-05-22'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...snippetUrls,
    ...toolUrls,
  ];
}
