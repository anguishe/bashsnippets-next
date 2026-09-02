import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import EmailCapture from '@/components/EmailCapture';
import FaqTerminal from '@/components/FaqTerminal';
import { mdxComponents } from '@/components/MDXComponents';
import ToolkitCTA from '@/components/ToolkitCTA';
import { AUTHOR } from '@/lib/author';
import {
  getShellcheckPage,
  shellcheckPages,
  type ShellcheckPage,
} from '@/lib/shellcheck-pages';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';
const DECODER_PATH = '/tools/shellcheck-error-decoder';
// Every output on these pages was produced by this ShellCheck on this box. Bump when re-verified.
const SHELLCHECK_VERSION = '0.11.0';

const OG_IMAGE = {
  url: `${SITE_URL}/ogimage.png`,
  width: 1200,
  height: 630,
} as const;

type PageProps = {
  params: Promise<{ code: string }>;
};

type FaqItem = { question: string; answer: string };

const SEVERITY_CLASS: Record<ShellcheckPage['severity'], string> = {
  error: 'border-[rgba(248,81,73,0.35)] bg-[rgba(248,81,73,0.15)] text-[#f85149]',
  warning: 'border-[rgba(227,179,65,0.35)] bg-[rgba(227,179,65,0.15)] text-amber',
  info: 'border-[rgba(88,166,255,0.35)] bg-[rgba(88,166,255,0.15)] text-blue',
  style: 'border-border bg-bg3 text-muted',
};

// Quick Answer and FAQ live in the MDX frontmatter beside the prose they belong to.
// Read them at build time, the way src/lib/mdx-frontmatter.ts does for snippets.
function loadFrontmatter(slug: string) {
  const file = path.join(process.cwd(), 'src/content/shellcheck', `${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  const faq: FaqItem[] = Array.isArray(data.faq)
    ? data.faq.filter(
        (f: unknown): f is FaqItem =>
          typeof f === 'object' &&
          f !== null &&
          typeof (f as FaqItem).question === 'string' &&
          typeof (f as FaqItem).answer === 'string',
      )
    : [];
  const wordCount = content
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    quickAnswer: typeof data.quickAnswer === 'string' ? data.quickAnswer : '',
    faq,
    wordCount,
  };
}

function buildSchemas(page: ShellcheckPage, faq: FaqItem[], wordCount: number): object[] {
  const canonical = `${SITE_URL}/shellcheck/${page.slug}`;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.title,
    description: page.description,
    keywords: page.keywords.join(', '),
    wordCount,
    author: { '@type': 'Person', ...AUTHOR },
    publisher: {
      '@type': 'Organization',
      name: 'BashSnippets.xyz',
      url: SITE_URL,
    },
    datePublished: page.datePublished,
    dateModified: page.dateModified,
    mainEntityOfPage: canonical,
    url: canonical,
    image: `${SITE_URL}/ogimage.png`,
    proficiencyLevel: 'Intermediate',
    programmingLanguage: 'Bash',
    inLanguage: 'en',
    articleSection: 'ShellCheck',
    about: {
      '@type': 'SoftwareApplication',
      name: 'ShellCheck',
      softwareVersion: SHELLCHECK_VERSION,
      url: 'https://www.shellcheck.net/',
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'ShellCheck Error Decoder',
        item: `${SITE_URL}${DECODER_PATH}`,
      },
      { '@type': 'ListItem', position: 4, name: page.code, item: canonical },
    ],
  };

  const faqSchema =
    faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null;

  return [article, breadcrumb, ...(faqSchema ? [faqSchema] : [])];
}

// Only the registered lowercase slugs exist; /shellcheck/SC2086 is a 404, not a duplicate.
export const dynamicParams = false;

export function generateStaticParams() {
  return shellcheckPages.map((p) => ({ code: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const page = getShellcheckPage(code);
  if (!page) {
    return {};
  }
  const url = `${SITE_URL}/shellcheck/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: 'article',
      publishedTime: page.datePublished,
      modifiedTime: page.dateModified,
      authors: [`${SITE_URL}/about`],
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function ShellcheckCodePage({ params }: PageProps) {
  const { code } = await params;
  const page = getShellcheckPage(code);

  if (!page) {
    notFound();
  }

  const getContent = async (slug: string) => {
    try {
      const mod = await import(`@/content/shellcheck/${slug}.mdx`);
      return mod.default;
    } catch (error) {
      console.error(`[MDX] Failed to load shellcheck page: ${slug}`, error);
      return null;
    }
  };

  const Content = await getContent(page.slug);
  const { quickAnswer, faq, wordCount } = loadFrontmatter(page.slug);
  const schemas = buildSchemas(page, faq, wordCount);
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const others = shellcheckPages.filter((p) => p.code !== page.code);

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Tools', href: '/tools' },
            { label: 'ShellCheck Error Decoder', href: DECODER_PATH },
            { label: page.code },
          ]}
        />

        <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-xs">
          <span
            className={`rounded-xl border px-2.5 py-0.5 uppercase tracking-wide ${SEVERITY_CLASS[page.severity]}`}
          >
            {page.severity}
          </span>
          <span className="text-muted">ShellCheck {SHELLCHECK_VERSION}</span>
          <span className="text-muted" aria-hidden>
            ·
          </span>
          <span className="text-muted">{readTime} min read</span>
        </div>

        <h1 className="font-heading text-3xl font-extrabold leading-tight text-text md:text-4xl">
          {page.title}
        </h1>

        {quickAnswer && (
          <div className="mb-8 mt-8 rounded-r-lg border-l-[3px] border-green bg-bg2 px-5 py-4">
            <p className="mb-2 font-heading text-sm font-bold text-green">Quick Answer</p>
            <p className="text-sm leading-relaxed text-text">{quickAnswer}</p>
          </div>
        )}

        <article className="prose-snippet mx-auto max-w-3xl">
          {Content ? (
            <Content components={mdxComponents} />
          ) : (
            <p className="text-muted">Content temporarily unavailable.</p>
          )}
        </article>

        <section className="mt-12">
          <h2 className="mb-6 font-heading text-xl font-bold text-text">
            Where {page.code} shows up on this site
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {page.related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg border border-border bg-bg2 p-4 text-sm leading-relaxed text-text no-underline transition-colors duration-150 hover:border-green"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <ToolkitCTA className="mx-auto my-12 max-w-3xl" placement="shellcheck" />

        <EmailCapture className="mx-auto my-12 max-w-3xl" placement="shellcheck" />

        {faq.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 font-heading text-xl font-bold text-text">
              Frequently Asked Questions
            </h2>
            <FaqTerminal items={faq} label={`faq — ${page.code.toLowerCase()}`} />
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            More ShellCheck deep dives
          </h2>
          <ul className="flex flex-col gap-2">
            {others.map((p) => (
              <li key={p.code}>
                <Link
                  href={`/shellcheck/${p.slug}`}
                  className="flex items-baseline gap-3 rounded-md border border-border bg-bg2 px-4 py-2.5 font-mono text-xs text-text no-underline transition-colors hover:border-green"
                >
                  <span className="shrink-0 font-semibold text-green">{p.code}</span>
                  <span className="text-muted">{p.title.replace(/^ShellCheck [A-Z0-9]+: /, '')}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Any other code:{' '}
            <Link href={DECODER_PATH} className="text-blue transition-colors hover:text-green">
              paste it into the ShellCheck Error Decoder
            </Link>
            .
          </p>
        </section>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-8 text-xs text-muted">
          <Link href={DECODER_PATH} className="transition-colors hover:text-text">
            ← ShellCheck Error Decoder
          </Link>
          <a href="#" className="transition-colors hover:text-text">
            ↑ Back to top
          </a>
        </div>
      </main>
    </>
  );
}
