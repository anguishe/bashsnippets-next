import { getAllSlugs } from '@/lib/snippets';
import { getAllToolSlugs } from '@/lib/tools';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://bashsnippets.xyz';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const snippetUrls: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/snippets/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const toolUrls: MetadataRoute.Sitemap = getAllToolSlugs().map((slug) => ({
    url: `${SITE_URL}/tools/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/snippets`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...snippetUrls,
    ...toolUrls,
  ];
}
