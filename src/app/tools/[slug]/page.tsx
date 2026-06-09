import AffiliateBox from '@/components/AffiliateBox';
import ToolkitCTA from '@/components/ToolkitCTA';
import FaqTerminal from '@/components/FaqTerminal';
import ToolRenderer from '@/components/tools/ToolRenderer';
import { getSnippetBySlug } from '@/lib/snippets';
import { getAllToolSlugs, getToolBySlug, type ToolMeta } from '@/lib/tools';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const SITE_URL = 'https://bashsnippets.xyz';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function buildSchemas(
  tool: Pick<ToolMeta, 'title' | 'description' | 'faqs'>,
  slug: string,
) {
  const canonical = `${SITE_URL}/tools/${slug}`;

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    description: tool.description,
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'UtilityApplication',
    browserRequirements: 'Requires JavaScript. HTML5.',
    operatingSystem: 'Linux, macOS',
    isAccessibleForFree: true,
    featureList: ['No login required', 'Browser-based', 'Copy-paste output'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'BashSnippets.xyz',
      url: 'https://bashsnippets.xyz',
    },
    url: canonical,
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
        name: 'Tools',
        item: `${SITE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.title,
        item: canonical,
      },
    ],
  };

  const validFaqs = tool.faqs.filter((f) => f.question && f.answer);
  const faqSchema =
    validFaqs.length > 0
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

  return [softwareApplication, breadcrumb, ...(faqSchema ? [faqSchema] : [])];
}

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return {};
  }

  return {
    title: tool.title,
    description: tool.description,
    alternates: {
      canonical: `${SITE_URL}/tools/${tool.slug}`,
    },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: `${SITE_URL}/tools/${tool.slug}`,
      type: 'website',
      images: [{ url: 'https://bashsnippets.xyz/ogimage.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: tool.title,
      description: tool.description,
      images: ['https://bashsnippets.xyz/ogimage.png'],
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const schemas = buildSchemas(tool, slug);

  const relatedSnippets = (tool.relatedSnippets ?? [])
    .map((s) => getSnippetBySlug(s))
    .filter((s): s is NonNullable<ReturnType<typeof getSnippetBySlug>> => s !== undefined);

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema['@type'] as string}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Section 1: Page header */}
        <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-text">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href="/tools" className="transition-colors hover:text-text">
            Tools
          </Link>
          <span className="mx-2">›</span>
          <span className="text-text">{tool.title}</span>
        </nav>

        <h1 className="font-heading text-3xl font-extrabold leading-tight text-text md:text-4xl">
          {tool.title}
        </h1>

        <div className="mb-8 mt-8 rounded-r-lg border-l-[3px] border-green bg-bg2 px-5 py-4">
          <p className="mb-2 font-heading text-sm font-bold text-green">
            Quick Answer
          </p>
          <p className="text-sm leading-relaxed text-text">
            {tool.quickAnswer}
          </p>
        </div>

        {/* Section 2: Tool component */}
        <div className="rounded-lg border border-border bg-bg2 p-6">
          <ToolRenderer slug={slug} />
        </div>

        {/* Section 3: How to use */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-text">
            How to use the {tool.title}
          </h2>
          <ol className="mt-4 flex flex-col gap-4">
            {tool.howToUse.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green font-heading text-sm font-bold text-bg">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-muted">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Section 4: Affiliate boxes */}
        <AffiliateBox partner="digitalocean" className="mt-10" />
        <AffiliateBox partner="namecheap" />

        <ToolkitCTA className="mt-10" />

        {/* Section 5: FAQ */}
        {tool.faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 font-heading text-xl font-bold text-text">
              Frequently Asked Questions
            </h2>
            <FaqTerminal items={tool.faqs} label="faq — tool" />
          </section>
        )}

        {/* Section 6: Related scripts */}
        {relatedSnippets.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 font-heading text-xl font-bold text-text">
              Related Scripts
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {relatedSnippets.map((snippet) => (
                <Link
                  key={snippet.slug}
                  href={`/snippets/${snippet.slug}`}
                  className="block rounded-lg border border-border bg-bg2 p-4 no-underline transition-colors duration-150 hover:border-green"
                >
                  <p className="font-mono text-xs uppercase tracking-widest text-muted">
                    {snippet.difficulty} · {snippet.tags[0]}
                  </p>
                  <p className="mt-1 font-heading text-sm font-bold text-text">
                    {snippet.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-2">
                    {snippet.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
