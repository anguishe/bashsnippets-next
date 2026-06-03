import AdSlot from '@/components/AdSlot';
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

const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: 'BashSnippets — bash scripts for Linux and DevOps',
} as const;

function generateSnippetSchema(snippet: SnippetMeta, slug: string): string[] {
  const pageTitle = `${snippet.title} – BashSnippets.xyz`;
  const canonical = `${SITE_URL}/snippets/${slug}`;
  const published = snippet.publishedTime ?? '2026-05-01';
  const modified = snippet.modifiedTime ?? '2026-05-22';

  const techArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: pageTitle,
    description: snippet.description,
    url: canonical,
    author: {
      '@type': 'Organization',
      name: 'BashSnippets',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BashSnippets',
      url: SITE_URL,
    },
    image: OG_IMAGE.url,
    datePublished: published,
    dateModified: modified,
    proficiencyLevel: snippet.difficulty.charAt(0).toUpperCase() + snippet.difficulty.slice(1),
    programmingLanguage: 'Bash',
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I run a bash script on Linux?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Make it executable with chmod +x script.sh, then run ./script.sh or bash script.sh',
        },
      },
      {
        '@type': 'Question',
        name: 'What does set -euo pipefail do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It makes bash exit on any error (-e), treats unset variables as errors (-u), and catches pipe failures (-o pipefail). Add it near the top of every script.',
        },
      },
    ],
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'BashSnippets',
        item: SITE_URL,
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

  return [techArticle, faqPage, breadcrumb].map((schema) =>
    JSON.stringify(schema),
  );
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

  const ogTitle = `${snippet.title} – BashSnippets.xyz`;

  return {
    title: snippet.title,
    description: snippet.description,
    alternates: {
      canonical: `${SITE_URL}/snippets/${slug}`,
    },
    openGraph: {
      title: ogTitle,
      description: snippet.description,
      type: 'article',
      url: `${SITE_URL}/snippets/${slug}`,
      images: [OG_IMAGE],
      publishedTime: snippet.publishedTime ?? '2026-05-01',
      modifiedTime: snippet.modifiedTime ?? '2026-05-22',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: snippet.description,
      images: [OG_IMAGE.url],
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
  const schemaJson = generateSnippetSchema(snippet, slug);

  return (
    <>
      {schemaJson.map((json, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
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

        {snippet.quickAnswer && (
          <div className="bg-bg2 border-l-4 border-green rounded-r-[8px] pl-5 pr-5 py-4 mb-8">
            <p className="font-mono text-xs text-green uppercase tracking-widest mb-2">Quick Answer</p>
            <p className="text-text leading-relaxed text-sm">{snippet.quickAnswer}</p>
          </div>
        )}

        <article className="prose-snippet">
          <Content components={mdxComponents} />
        </article>

        <AdSlot slot="AUTO" format="auto" />

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
