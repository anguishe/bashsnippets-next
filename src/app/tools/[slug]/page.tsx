import AffiliateBox from '@/components/AffiliateBox';
import ToolRenderer from '@/components/tools/ToolRenderer';
import { getAllToolSlugs, getToolBySlug } from '@/lib/tools';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const SITE_URL = 'https://bashsnippets.xyz';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function buildSchemas(
  tool: { title: string; description: string; faqs: { question: string; answer: string }[] },
  slug: string,
) {
  const canonical = `${SITE_URL}/tools/${slug}`;

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, macOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
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

  return [softwareApplication, breadcrumb, faqPage];
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
      images: [{ url: '/ogimage.png', width: 1200, height: 630 }],
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

        <p className="mb-8 mt-3 text-base text-muted">
          {tool.description}
        </p>

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

        {/* Section 4: Affiliate box */}
        <AffiliateBox partner="digitalocean" className="mt-10" />

        {/* Section 5: FAQ accordion */}
        {tool.faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 font-heading text-xl font-bold text-text">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {tool.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="snippet-faq overflow-hidden rounded-lg border border-border bg-bg2"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-heading font-semibold text-text">
                    <span>{faq.question}</span>
                    <span
                      className="faq-chevron shrink-0 text-xs text-muted"
                      aria-hidden
                    >
                      ▼
                    </span>
                  </summary>
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
