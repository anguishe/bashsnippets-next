export async function GET() {
  const body = `# ------------------------------------------------------------
#     __      __
#     \\ \\     \\ \\       bash/snippets
#      \\ \\     \\ \\      $ copy-paste bash scripts
#      / /     / /      for linux & devs
#     /_/     /_/  bs
#
#     bashsnippets.xyz  -  no login | no paywall | free
# ------------------------------------------------------------

User-Agent: *
Allow: /

User-Agent: Google-Extended
Allow: /

User-Agent: GPTBot
Allow: /

User-Agent: Bytespider
Disallow: /

User-Agent: CCBot
Allow: /

Sitemap: https://bashsnippets.xyz/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
