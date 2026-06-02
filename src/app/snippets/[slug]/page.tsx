import AffiliateBox from '@/components/AffiliateBox';
import { mdxComponents } from '@/components/MDXComponents';
import {
  getAllSlugs,
  getRelatedSnippets,
  getSnippetBySlug,
  type SnippetMeta,
} from '@/lib/snippets';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const AD_CLIENT = 'ca-pub-5399156622542127';
const AD_SLOT = '7586966692';
const SITE_URL = 'https://bashsnippets.xyz';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function difficultyBadgeClass(difficulty: SnippetMeta['difficulty']): string {
  const base = 'inline-block rounded px-2 py-0.5 text-xs font-semibold border';
  switch (difficulty) {
    case 'beginner':
      return `${base} bg-green-dim text-green border-green`;
    case 'intermediate':
      return `${base} bg-amber-dim text-amber border-amber`;
    case 'advanced':
      return `${base} bg-blue-dim text-blue border-blue`;
  }
}

function AdSlot() {
  return (
    <div className="my-8 flex min-h-[90px] items-center justify-center overflow-hidden rounded-lg border border-border bg-bg2">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
        }}
      />
    </div>
  );
}

function relatedDifficultyBadgeClass(
  difficulty: SnippetMeta['difficulty'],
): string {
  const base =
    'inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest';
  switch (difficulty) {
    case 'beginner':
      return `${base} border-green bg-green-dim text-green`;
    case 'intermediate':
      return `${base} border-amber bg-amber-dim text-amber`;
    case 'advanced':
      return `${base} border-blue bg-blue-dim text-blue`;
  }
}

function buildSchemas(snippet: SnippetMeta, slug: string) {
  const canonical = `${SITE_URL}/snippets/${slug}`;

  const techArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: snippet.title,
    description: snippet.description,
    url: canonical,
    datePublished: snippet.datePublished,
    dateModified: snippet.dateModified,
    author: {
      '@type': 'Organization',
      name: 'BashSnippets',
      url: SITE_URL,
    },
    programmingLanguage: {
      '@type': 'ComputerLanguage',
      name: 'Bash',
    },
    operatingSystem: 'Linux, macOS',
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Snippets',
        item: `${SITE_URL}/snippets`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: snippet.title,
        item: canonical,
      },
    ],
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I use the ${snippet.title} bash script?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Copy the script from this page, save it as a .sh file, run chmod +x filename.sh to make it executable, then run ./filename.sh. ${snippet.description}`,
        },
      },
      {
        '@type': 'Question',
        name: `Does the ${snippet.title} script work on Ubuntu?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. This script is tested on Ubuntu 22.04 LTS and macOS Ventura. It requires only standard bash tools (${snippet.tags.join(', ')}) that ship with every Linux distribution.`,
        },
      },
    ],
  };

  return [techArticle, breadcrumb, faqPage];
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const snippet = getSnippetBySlug(slug);
  if (!snippet) {
    return {};
  }

  return {
    title: snippet.title,
    description: snippet.description,
    alternates: {
      canonical: `${SITE_URL}/snippets/${slug}`,
    },
    openGraph: {
      type: 'article',
      publishedTime: snippet.datePublished,
      modifiedTime: snippet.dateModified,
    },
  };
}

export default async function SnippetPage({ params }: PageProps) {
  const { slug } = await params;
  const snippet = getSnippetBySlug(slug);

  if (!snippet) {
    notFound();
  }

  let Content: React.ComponentType<{
    components?: typeof mdxComponents;
  }> = () => null;
  try {
    const mod = await import(`@/content/snippets/${slug}.mdx`);
    Content = mod.default;
  } catch {
    // content file not found — page still renders with layout
  }

  const related = getRelatedSnippets(slug, 3);
  const schemas = buildSchemas(snippet, slug);

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema['@type'] as string}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-text transition-colors">
            BashSnippets
          </Link>
          <span className="mx-2">›</span>
          <Link href="/snippets" className="hover:text-text transition-colors">
            Snippets
          </Link>
          <span className="mx-2">›</span>
          <span className="text-text">{snippet.title}</span>
        </nav>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={difficultyBadgeClass(snippet.difficulty)}>
            {snippet.difficulty}
          </span>
          {snippet.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border bg-bg3 px-2 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-heading text-3xl font-extrabold leading-tight md:text-4xl">
          {snippet.title}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By BashSnippets · Tested on Ubuntu 22.04 LTS
        </p>

        <AdSlot />

        <div className="mb-6 rounded-r border-l-4 border-green bg-green-dim/40 px-4 py-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-green">
            Quick answer
          </p>
          <p className="text-sm leading-relaxed text-text">
            {snippet.description}
          </p>
          <p className="mt-2 text-xs text-muted">
            Tested on: Ubuntu 22.04 LTS · macOS Ventura
          </p>
        </div>

        <article className="prose-snippet">
          <Content components={mdxComponents} />
        </article>

        <AdSlot />

        <AffiliateBox partner="digitalocean" />
        <AffiliateBox partner="namecheap" />

        <section className="mt-12">
          <h2 className="mb-6 font-heading text-xl font-bold text-text">
            Related Snippets
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/snippets/${item.slug}`}
                className="block cursor-pointer rounded-lg border border-border bg-bg2 p-4 no-underline transition-colors hover:border-green"
              >
                <p className="text-sm font-semibold text-text">{item.title}</p>
                <span
                  className={`mt-2 ${relatedDifficultyBadgeClass(item.difficulty)}`}
                >
                  {item.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-8 text-xs text-muted">
          <Link href="/snippets">← All Snippets</Link>
          <a href="#" className="transition-colors hover:text-text">
            ↑ Back to top
          </a>
        </div>
      </main>
    </>
  );
}
