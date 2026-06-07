import AdSlot from '@/components/AdSlot';
import AffiliateBox from '@/components/AffiliateBox';
import FaqTerminal from '@/components/FaqTerminal';
import { mdxComponents } from '@/components/MDXComponents';
import { getSnippetWordCount } from '@/lib/mdx-frontmatter';
import {
  getAllSlugs,
  getRelatedSnippets,
  getSnippetBySlug,
  type SnippetMeta,
} from '@/lib/snippets';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const SITE_URL = 'https://bashsnippets.xyz';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const OG_IMAGE = {
  url: 'https://bashsnippets.xyz/ogimage.png',
  width: 1200,
  height: 630,
} as const;

function generateSnippetSchema(snippet: SnippetMeta, slug: string, wordCount: number): string[] {
  const canonical = `${SITE_URL}/snippets/${slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: snippet.title,
    description: snippet.description,
    keywords: snippet.tags.join(', '),
    wordCount,
    author: {
      '@type': 'Person',
      name: snippet.author,
      '@id': `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BashSnippets.xyz',
      url: SITE_URL,
    },
    datePublished: snippet.datePublished,
    dateModified: snippet.dateModified,
    mainEntityOfPage: canonical,
    image: `${SITE_URL}/ogimage.png`,
    proficiencyLevel: snippet.difficulty.charAt(0).toUpperCase() + snippet.difficulty.slice(1),
    programmingLanguage: 'Bash',
    inLanguage: 'en',
    articleSection: 'Bash Scripting',
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

  const howToSchema =
    (snippet.howToSteps?.length ?? 0) > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: snippet.title,
          description: snippet.description,
          step: snippet.howToSteps!.map((step, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: step.name,
            text: step.text,
          })),
        }
      : null;

  const validFaqs = snippet.faq.filter((f) => f.question && f.answer);
  const faqSchema =
    (snippet.faq?.length ?? 0) > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: validFaqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  const schemas = [
    articleSchema,
    breadcrumb,
    ...(howToSchema ? [howToSchema] : []),
    ...(faqSchema ? [faqSchema] : []),
  ];
  return schemas.map((schema) => JSON.stringify(schema));
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

  const displayTitle = snippet.metaTitle ?? snippet.title;

  return {
    title: displayTitle,
    description: snippet.description,
    alternates: {
      canonical: `${SITE_URL}/snippets/${snippet.slug}`,
    },
    openGraph: {
      title: displayTitle,
      description: snippet.description,
      url: `${SITE_URL}/snippets/${snippet.slug}`,
      type: 'article',
      publishedTime: snippet.datePublished,
      modifiedTime: snippet.dateModified,
      authors: [`${SITE_URL}/about`],
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
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

  const getContent = async (slug: string) => {
    try {
      const mod = await import(`@/content/snippets/${slug}.mdx`);
      return mod.default;
    } catch (error) {
      console.error(`[MDX] Failed to load snippet: ${slug}`, error);
      return null;
    }
  };

  const Content = await getContent(slug);

  const related = getRelatedSnippets(slug, 3);
  const wordCount = getSnippetWordCount(slug);
  const schemaJson = generateSnippetSchema(snippet, slug, wordCount);
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

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
          <Link href="/" className="transition-colors hover:text-text">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href="/snippets" className="transition-colors hover:text-text">
            Snippets
          </Link>
          <span className="mx-2">›</span>
          <span className="text-text">{snippet.title}</span>
        </nav>

        <h1 className="font-heading text-3xl font-extrabold leading-tight text-text md:text-4xl">
          {snippet.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[4px] border border-border bg-bg2 px-2 py-0.5 font-mono text-xs text-blue"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-sm text-muted">{readTime} min read</span>
        </div>

        {snippet.quickAnswer && (
          <div className="mb-8 mt-8 rounded-r-lg border-l-[3px] border-green bg-bg2 px-5 py-4">
            <p className="mb-2 font-heading text-sm font-bold text-green">
              Quick Answer
            </p>
            <p className="text-sm leading-relaxed text-text">
              {snippet.quickAnswer}
            </p>
          </div>
        )}

        <AdSlot slot="SLOT_ABOVE_CONTENT" />

        <article className="prose-snippet mx-auto max-w-3xl">
          {Content ? (
            <Content components={mdxComponents} />
          ) : (
            <p className="text-muted">Content temporarily unavailable.</p>
          )}
        </article>

        <AdSlot slot="SLOT_MID_CONTENT" />

        <div className="my-10 flex items-start gap-4 rounded-lg border border-border bg-bg2 p-5">
          <Image
            src="/favicon-512x512.png"
            alt="BashSnippets logo"
            width={48}
            height={48}
            className="shrink-0 rounded-lg"
          />
          <div>
            <p className="font-heading font-bold text-text">
              Written by {snippet.author}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              Creator of BashSnippets.xyz
            </p>
            <Link
              href="/about"
              className="mt-1 inline-block text-sm text-blue transition-colors hover:text-green"
            >
              bashsnippets.xyz/about
            </Link>
          </div>
        </div>

        <AffiliateBox partner="digitalocean" />
        <AffiliateBox partner="namecheap" />

        <section className="mt-12">
          <h2 className="mb-6 font-heading text-xl font-bold text-text">
            Related Snippets
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/snippets/${item.slug}`}
                className="block rounded-lg border border-border bg-bg2 p-4 no-underline transition-colors duration-150 hover:border-green"
              >
                <p className="font-heading text-sm font-bold text-text">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {snippet.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 font-heading text-xl font-bold text-text">
              Frequently Asked Questions
            </h2>
            <FaqTerminal items={snippet.faq} label="faq — snippet" />
          </section>
        )}

        <AdSlot slot="SLOT_BELOW_CONTENT" />

        <div className="mt-12 flex items-center justify-between border-t border-border pt-8 text-xs text-muted">
          <Link href="/snippets" className="transition-colors hover:text-text">
            ← All Snippets
          </Link>
          <a href="#" className="transition-colors hover:text-text">
            ↑ Back to top
          </a>
        </div>
      </main>
    </>
  );
}
