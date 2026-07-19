import { snippets } from '@/lib/snippets';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const sortedSnippets = [...snippets].sort(
    (a, b) =>
      new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
  );

  const items = sortedSnippets
    .map(
      (snippet) => `
    <item>
      <title>${escapeXml(snippet.title)}</title>
      <link>${SITE_URL}/snippets/${snippet.slug}</link>
      <description>${escapeXml(snippet.description)}</description>
      <pubDate>${new Date(snippet.datePublished).toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/snippets/${snippet.slug}</guid>
    </item>`,
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BashSnippets.xyz</title>
    <description>Free bash scripts for Linux sysadmins</description>
    <link>${SITE_URL}</link>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
