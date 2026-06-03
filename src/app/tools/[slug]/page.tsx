import AffiliateBox from '@/components/AffiliateBox';
import ToolEmbed from '@/components/ToolEmbed';
import { getAllToolSlugs, getToolBySlug } from '@/lib/tools';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const AD_CLIENT = 'ca-pub-5399156622542127';
const AD_SLOT = '7586966692';
const SITE_URL = 'https://bashsnippets.xyz';

type PageProps = {
  params: Promise<{ slug: string }>;
};

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

function buildSchemas(
  tool: { title: string; description: string; faqs: { question: string; answer: string }[] },
  slug: string,
) {
  const canonical = `${SITE_URL}/tools/${slug}`;

  const webApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    url: canonical,
    description: tool.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
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

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return [webApplication, breadcrumb, faqPage];
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

  const ogTitle = `${tool.title} – BashSnippets.xyz`;

  return {
    title: tool.title,
    description: tool.description,
    alternates: {
      canonical: `${SITE_URL}/tools/${slug}`,
    },
    openGraph: {
      title: ogTitle,
      description: tool.description,
      url: `${SITE_URL}/tools/${slug}`,
      siteName: 'BashSnippets',
      type: 'website',
      images: [{
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: ogTitle,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: tool.description,
      images: [`${SITE_URL}/og-image.png`],
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
        <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-text transition-colors">
            BashSnippets
          </Link>
          <span className="mx-2">›</span>
          <Link href="/tools" className="hover:text-text transition-colors">
            Tools
          </Link>
          <span className="mx-2">›</span>
          <span className="text-text">{tool.title}</span>
        </nav>

        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full border border-blue bg-blue-dim px-3 py-1 text-xs uppercase tracking-widest text-blue">
            {tool.category}
          </span>
          <span className="text-xs text-muted">
            Free · No login required · Browser-based
          </span>
        </div>

        <h1 className="font-heading text-3xl font-extrabold leading-tight md:text-4xl">
          {tool.title}
        </h1>

        <p className="mb-8 mt-3 text-base leading-relaxed text-muted">
          {tool.description}
        </p>

        <div className="mb-8 flex items-center gap-2 rounded border border-border bg-bg2 px-4 py-3 text-xs text-muted">
          <span className="text-green">💡</span>
          <span>
            This tool runs entirely in your browser. Nothing is sent to a server.
          </span>
        </div>

        <ToolEmbed slug={slug} />

        <AdSlot />

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-text">
            How to use the {tool.title}
          </h2>
          <ol className="mt-4 space-y-3">
            {tool.howToUse.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-green bg-green-dim font-mono text-[10px] font-semibold text-green">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-text">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-6">
            {tool.faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border bg-bg2 p-5">
                <h3 className="font-mono text-sm font-semibold text-text">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <AffiliateBox partner="digitalocean" className="mt-10" />
      </main>
    </>
  );
}
