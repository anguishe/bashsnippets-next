import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/tool-content/' },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'Bytespider', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      // Intentional AI-training opt-out — not a search crawl directive.
      { userAgent: 'Google-Extended', disallow: '/' },
    ],
    sitemap: 'https://bashsnippets.xyz/sitemap.xml',
  };
}
