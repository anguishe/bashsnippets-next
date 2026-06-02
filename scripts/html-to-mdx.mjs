#!/usr/bin/env node
/**
 * Converts bash-snippets static HTML article bodies to MDX.
 * Usage: node scripts/html-to-mdx.mjs [slug ...]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_DIR = path.resolve(__dirname, '../../bash-snippets/snippets');
const OUT_DIR = path.resolve(__dirname, '../src/content/snippets');

const DEFAULT_SLUGS = [
  'automated-file-backup',
  'delete-old-log-files',
  'quick-system-info-report',
  'search-files-for-text-grep',
  'check-if-website-is-up',
  'bash-error-handling',
  'bash-if-else-examples',
  'create-dated-folder',
  'kill-a-process',
  'file-permissions-security',
  'monitor-cpu-ram-usage',
  'bash-send-email-alert',
  'mysql-database-backup',
  'ssh-key-setup-script',
  'restart-service-if-stopped',
];

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  );
}

function cleanPre(html) {
  return decodeHtml(
    html
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .replace(/<pre[^>]*>/i, '')
      .replace(/<\/pre>/i, '')
      .trim(),
  );
}

function findArticleStart(html) {
  const markers = [
    '<h2>The Script</h2>',
    '<h2>The Template',
    '<h2>The Wrong Way',
    '<h2>The One-Liner</h2>',
  ];
  for (const marker of markers) {
    const idx = html.indexOf(marker);
    if (idx !== -1) {
      return idx;
    }
  }
  const mainIdx = html.indexOf('<main>');
  const h2Idx = html.indexOf('<h2>', mainIdx);
  if (h2Idx !== -1) {
    return h2Idx;
  }
  return -1;
}

function extractArticleHtml(html) {
  const start = findArticleStart(html);
  if (start === -1) {
    throw new Error('Could not find article start heading');
  }

  const endMarkers = [
    '<h2>Related Snippets</h2>',
    '<h2>Related</h2>',
    '<div class="explore-tools-cta"',
    '<!-- AFFILIATE BOX -->',
  ];
  let end = html.length;
  for (const marker of endMarkers) {
    const idx = html.indexOf(marker, start);
    if (idx !== -1 && idx < end) {
      end = idx;
    }
  }

  let body = html.slice(start, end);

  body = body.replace(/<!--[\s\S]*?-->/g, '');
  body = body.replace(/<div class="ad-slot">[\s\S]*?<\/div>/gi, '');
  body = body.replace(/<div class="affiliate-box"[^>]*>[\s\S]*?<\/div>/gi, '');
  body = body.replace(/<div class="explore-tools-cta"[\s\S]*?<\/div>/gi, '');
  body = body.replace(
    /<div style="background:var\(--bg2\)[\s\S]*?<\/div>\s*<\/div>/gi,
    '',
  );
  body = body.replace(/<a href="https:\/\/www\.digitalocean\.com[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  body = body.replace(/<img[^>]*>/gi, '');

  return body;
}

function calloutType(classAttr) {
  if (classAttr.includes('amber')) return 'warning';
  if (classAttr.includes('blue')) return 'info';
  return 'success';
}

function inlineMd(html) {
  let t = html;
  t = t.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
  t = t.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
  t = t.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');
  t = t.replace(
    /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, label) => {
      const text = stripTags(label);
      if (href.startsWith('/') || href.includes('bashsnippets')) {
        const clean = href.replace(/\.html$/, '').replace(/^https:\/\/bashsnippets\.xyz/, '');
        return `[${text}](${clean || '/'})`;
      }
      return `[${text}](${href})`;
    },
  );
  return stripTags(t);
}

function findMatchingCloseDiv(html, start) {
  let depth = 0;
  let pos = start;
  const open = '<div';
  const close = '</div>';

  while (pos < html.length) {
    if (html.startsWith(open, pos)) {
      depth++;
      pos += open.length;
      continue;
    }
    if (html.startsWith(close, pos)) {
      depth--;
      pos += close.length;
      if (depth === 0) {
        return pos;
      }
      continue;
    }
    pos++;
  }
  return html.length;
}

function calloutBlockToMdx(block) {
  const classMatch = block.match(/class="callout([^"]*)"/i);
  const type = calloutType(classMatch?.[1] ?? '');
  const titleMatch = block.match(
    /<div class="callout-title">([\s\S]*?)<\/div>/i,
  );
  const titleText = titleMatch
    ? stripTags(titleMatch[1]).replace(/^[✓💡⚠]\s*/, '').trim()
    : '';
  const inner = titleMatch
    ? block.replace(/<div class="callout-title">[\s\S]*?<\/div>/i, '')
    : block.replace(/<div class="callout[^"]*">/i, '').replace(/<\/div>\s*$/i, '');

  const paragraphs = [...inner.matchAll(/<p>([\s\S]*?)<\/p>/gi)].map((m) =>
    inlineMd(m[1]),
  );
  const content =
    paragraphs.length > 0 ? paragraphs.join('\n\n') : inlineMd(inner);

  if (titleText) {
    const safeTitle = titleText.replace(/"/g, "'");
    return `\n<Callout type="${type}" title="${safeTitle}">\n\n${content}\n\n</Callout>\n`;
  }
  return `\n<Callout type="${type}">\n\n${content}\n\n</Callout>\n`;
}

function convertCallouts(html) {
  const marker = '<div class="callout';
  let result = '';
  let rest = html;

  while (rest.includes(marker)) {
    const index = rest.indexOf(marker);
    result += rest.slice(0, index);
    const end = findMatchingCloseDiv(rest, index);
    const block = rest.slice(index, end);
    result += calloutBlockToMdx(block);
    rest = rest.slice(end);
  }

  return result + rest;
}

function convertCodeBlocks(html) {
  return html.replace(
    /<div class="code-block">[\s\S]*?<pre[^>]*>([\s\S]*?)<\/pre>[\s\S]*?<\/div>/gi,
    (_, pre) => `\n\`\`\`bash\n${cleanPre(pre)}\n\`\`\`\n`,
  );
}

function escapeTableCell(cell) {
  const escaped = cell.replace(/\|/g, '\\|').replace(/`/g, '');
  if (/[{}]/.test(escaped)) {
    return `\`${escaped}\``;
  }
  return escaped;
}

function convertTables(html) {
  return html.replace(/<table class="var-table">([\s\S]*?)<\/table>/gi, (_, table) => {
    const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    const lines = rows.map((row) => {
      const cells = [...row[1].matchAll(/<t[hd]>([\s\S]*?)<\/t[hd]>/gi)].map((c) =>
        escapeTableCell(stripTags(c[1])),
      );
      return `| ${cells.join(' | ')} |`;
    });
    if (lines.length < 2) return '';
    const sep = `| ${lines[0]
      .split('|')
      .slice(1, -1)
      .map(() => '---')
      .join(' | ')} |`;
    return `\n${lines[0]}\n${sep}\n${lines.slice(1).join('\n')}\n`;
  });
}


function convertHeadingsAndText(html) {
  const calloutHolds = [];

  let out = html.replace(/<Callout[\s\S]*?<\/Callout>/g, (match) => {
    calloutHolds.push(match);
    return `\n___CALLOUT_${calloutHolds.length - 1}___\n`;
  });

  out = out.replace(/<h2>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${stripTags(t)}\n`);
  out = out.replace(/<h3>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${stripTags(t)}\n`);
  out = out.replace(/<p>([\s\S]*?)<\/p>/gi, (_, t) => {
    const text = inlineMd(t);
    return text ? `\n${text}\n` : '';
  });
  out = out.replace(/<[^>]+>/g, '');
  out = out.replace(/[ \t]+\n/g, '\n');
  out = out.replace(/\n{3,}/g, '\n\n');

  calloutHolds.forEach((callout, index) => {
    out = out.replace(`___CALLOUT_${index}___`, callout);
  });

  return out.trim();
}

function convertHtmlToMdx(html) {
  let body = extractArticleHtml(html);
  body = convertCodeBlocks(body);
  body = convertCallouts(body);
  body = convertTables(body);
  body = convertHeadingsAndText(body);
  let cleaned = body
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `import Callout from '@/components/Callout'\n\n${cleaned}\n`;
}

function convertSlug(slug) {
  const htmlPath = path.join(HTML_DIR, `${slug}.html`);
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Missing HTML: ${htmlPath}`);
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const mdx = convertHtmlToMdx(html);
  const outPath = path.join(OUT_DIR, `${slug}.mdx`);
  fs.writeFileSync(outPath, mdx, 'utf8');
  console.log(`Wrote ${outPath} (${mdx.length} bytes)`);
}

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SLUGS;
for (const slug of slugs) {
  convertSlug(slug);
}
