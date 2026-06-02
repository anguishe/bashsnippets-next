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
};
