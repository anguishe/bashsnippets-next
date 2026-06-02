/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://bashsnippets.xyz',
  outDir: './sitemap-backup',
  generateRobotsTxt: false,
  exclude: [
    '/robots.txt',
    '/sitemap.xml',
    '/sitemap-0.xml',
    '/tool-content/*',
    '/opensearch.xml',
    '/google*',
    '/BingSiteAuth.xml',
  ],
  transform: async (config, path) => {
    // Homepage
    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0, lastmod: new Date().toISOString() };
    }
    // Tool pages — high value, interactive
    if (path.startsWith('/tools/') && path !== '/tools') {
      return { loc: path, changefreq: 'weekly', priority: 0.9, lastmod: new Date().toISOString() };
    }
    // Tools index
    if (path === '/tools') {
      return { loc: path, changefreq: 'daily', priority: 0.9, lastmod: new Date().toISOString() };
    }
    // Snippets index
    if (path === '/snippets') {
      return { loc: path, changefreq: 'daily', priority: 0.8, lastmod: new Date().toISOString() };
    }
    // Individual snippet pages
    if (path.startsWith('/snippets/')) {
      return { loc: path, changefreq: 'weekly', priority: 0.8, lastmod: new Date().toISOString() };
    }
    // Utility pages
    if (['/about', '/privacy', '/contact'].includes(path)) {
      return { loc: path, changefreq: 'monthly', priority: 0.5, lastmod: new Date().toISOString() };
    }
    // Default fallback
    return { loc: path, changefreq: 'weekly', priority: 0.6, lastmod: new Date().toISOString() };
  },
};
