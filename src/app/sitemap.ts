import { snippets, getSnippetBySlug } from '@/lib/snippets';
import { getAllToolSlugs, getToolBySlug } from '@/lib/tools';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://bashsnippets.xyz';
const INDEX_LAST_MODIFIED = new Date('2026-06-06');
const TOOL_FALLBACK_LAST_MODIFIED = new Date('2026-06-06');

export default function sitemap(): MetadataRoute.Sitemap {
  const snippetUrls: MetadataRoute.Sitemap = snippets.map((snippet) => ({
    url: `${SITE_URL}/snippets/${snippet.slug}`,
    lastModified: new Date(getSnippetBySlug(snippet.slug)!.dateModified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const toolUrls: MetadataRoute.Sitemap = getAllToolSlugs().map((slug) => {
    const tool = getToolBySlug(slug) as { dateModified?: string } | undefined;
    return {
      url: `${SITE_URL}/tools/${slug}`,
      lastModified: tool?.dateModified
        ? new Date(tool.dateModified)
        : TOOL_FALLBACK_LAST_MODIFIED,
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
      lastModified: INDEX_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: INDEX_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
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
    ...snippetUrls,
    ...toolUrls,
  ];
}
