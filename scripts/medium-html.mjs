#!/usr/bin/env node
/**
 * Medium does not parse markdown on paste: `##`, backticks and ``` fences arrive as
 * literal text, and its smart punctuation then rewrites 'quotes' and --flags inside
 * the would-be code. It does keep rich text. This renders each queued post to a
 * body-only HTML page: open it in a browser, Ctrl+A, Ctrl+C, paste into Medium.
 *
 * Usage: node scripts/medium-html.mjs [file.md ...]
 *   default: every docs/cross-posts/queue/NN-*-medium.md, plus the NN-*-devto.md
 *   bodies that have no -medium.md (front matter dropped).
 * Output: the same name with .html beside the source (…-medium.html).
 *
 * ponytail: tiny hast serializer instead of adding rehype-stringify; covers the
 * element/text/raw nodes mdast-util-to-hast emits for these posts, nothing more.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfm } from 'micromark-extension-gfm';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { toHast } from 'mdast-util-to-hast';

const QUEUE = 'docs/cross-posts/queue';

function sources() {
  const files = fs.readdirSync(QUEUE);
  const out = [];
  for (const f of files.filter((f) => /^\d\d-.*-devto\.md$/.test(f)).sort()) {
    const medium = f.replace(/-devto\.md$/, '-medium.md');
    out.push(path.join(QUEUE, files.includes(medium) ? medium : f));
  }
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(String(s)).replace(/"/g, '&quot;');

function html(node) {
  if (node.type === 'root') return node.children.map(html).join('');
  if (node.type === 'text') return esc(node.value);
  if (node.type === 'raw') return '';
  if (node.type !== 'element') return '';
  // Medium's own story HTML uses h3 (large) and h4 (small) for section headings.
  let tag = node.tagName;
  if (/^h[1-6]$/.test(tag)) tag = Number(tag[1]) <= 2 ? 'h3' : 'h4';
  const props = node.properties ?? {};
  const attrs = tag === 'a' && props.href ? ` href="${attr(props.href)}"` : '';
  if (['br', 'hr'].includes(tag)) return `<${tag}>`;
  return `<${tag}${attrs}>${node.children.map(html).join('')}</${tag}>`;
}

function render(file) {
  let md = fs.readFileSync(file, 'utf8');
  const title = (md.match(/^title:\s*"(.*)"\s*$/m) ?? md.match(/^# (.+)$/m) ?? [])[1] ?? path.basename(file);
  const canonical = md.match(/^canonical_url:\s*(\S+)\s*$/m)?.[1];
  md = md.replace(/^---\n[\s\S]*?\n---\n/, ''); // dev.to front matter
  // Medium's canonical check (recipe M step 5) looks for this line; -medium.md files already end with it.
  if (canonical && !md.includes('Originally published at')) md += `\n\nOriginally published at ${canonical}\n`;
  md = md.replace(/<!--[\s\S]*?-->/g, ''); // notes like the Medium tag list
  md = md.replace(/^\s*# .+\n/, ''); // the H1: Medium has its own title field
  const tree = toHast(fromMarkdown(md, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] }));
  const body = html(tree);
  const out = file.replace(/-(medium|devto)\.md$/, '-medium.html');
  fs.writeFileSync(
    out,
    `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${esc(title)} — Medium paste</title>\n` +
      '<style>body{max-width:720px;margin:2rem auto;font:18px/1.6 Georgia,serif;padding:0 1rem}pre{background:#f2f2f2;padding:1rem;overflow:auto}code{font-family:monospace}</style>\n' +
      `</head><body>\n${body}\n</body></html>\n`,
  );
  return out;
}

const files = process.argv.slice(2).length ? process.argv.slice(2) : sources();
for (const f of files) console.log(render(f));
