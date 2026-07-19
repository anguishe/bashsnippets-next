import Breadcrumb from '@/components/Breadcrumb';
import FaqTerminal, { type FaqTerminalItem } from '@/components/FaqTerminal';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Contact BashSnippets — Script Requests, Bug Reports, Support',
  description:
    'Reach BashSnippets by email for script requests, snippet bug reports, toolkit questions, and feedback. Response usually within 2 business days.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact BashSnippets',
    description:
      'Email BashSnippets for script requests, bug reports, and toolkit support. Usually a reply within 2 business days.',
    url: `${SITE_URL}/contact`,
    type: 'website',
    images: [{ url: '/ogimage.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact BashSnippets',
    description:
      'Email BashSnippets for script requests, bug reports, and toolkit support. Usually a reply within 2 business days.',
  },
};

const contactFaqs: FaqTerminalItem[] = [
  {
    question: 'Can I request a specific bash script?',
    answer:
      'Yes. Send the use case — what breaks without the script, what OS and shell version you run, and any constraints (cron-only, no root, must work on macOS). Requests that match problems other sysadmins hit get priority. There is no guarantee every request becomes a published snippet, but actionable, consequence-first requests land on the backlog.',
  },
  {
    question: 'Do you offer custom automation work?',
    answer:
      'BashSnippets.xyz is a free library and toolkit publisher, not a consulting shop. Custom automation, on-call retainers, and paid script development are not offered. For one-off questions about adapting a snippet to your environment, email with your OS, what you tried, and the exact error — that is in scope.',
  },
  {
    question: 'How do I report a bug in a snippet?',
    answer:
      'Email anguisheh1@gmail.com with the snippet slug or URL, your OS and bash version (output of bash --version), the command you ran, and the full stderr or unexpected behavior. A minimal reproduction — the smallest script that still fails — gets a fix faster than a vague "it does not work" report.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: contactFaqs.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/contact` },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact' },
          ]}
        />

        <h1 className="mb-4 font-heading text-4xl font-extrabold text-text">
          Contact
        </h1>
        <p className="mb-6 leading-relaxed text-muted">
          A snippet that fails on your distro, a tool that returns the wrong hash,
          a gap in the free library you keep hitting in production — that is what
          this page is for. Vague &quot;it broke&quot; messages without context sit
          in the queue behind reports that include enough detail to reproduce the
          failure.
        </p>
        <p className="mb-10 leading-relaxed text-muted">
          Pick the channel that matches what you need. Email is the only route for
          bug fixes, script requests, and questions about the Production Bash
          Toolkit purchase.
        </p>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-bg2 p-5">
            <p className="mb-1 text-xs uppercase tracking-widest text-green">
              Email
            </p>
            <a
              href="mailto:anguisheh1@gmail.com"
              className="font-mono text-text transition-colors hover:text-green"
            >
              anguisheh1@gmail.com
            </a>
            <p className="mt-2 text-xs text-muted">
              Best for: bug reports, script requests, toolkit support, business
            </p>
          </div>

          <div className="rounded-lg border border-border bg-bg2 p-5">
            <p className="mb-1 text-xs uppercase tracking-widest text-green">
              YouTube
            </p>
            <a
              href="https://youtube.com/@BashSnippets"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-text transition-colors hover:text-green"
            >
              @BashSnippets ↗
            </a>
            <p className="mt-2 text-xs text-muted">
              Best for: comments on specific videos
            </p>
          </div>

          <div className="rounded-lg border border-border bg-bg2 p-5">
            <p className="mb-1 text-xs uppercase tracking-widest text-green">
              dev.to
            </p>
            <a
              href="https://dev.to/bashsnippets"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-text transition-colors hover:text-green"
            >
              dev.to/bashsnippets ↗
            </a>
            <p className="mt-2 text-xs text-muted">
              Best for: article discussions and feedback
            </p>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            What to include in your message
          </h2>
          <p className="leading-relaxed text-muted">
            Without these four details, a bug report turns into a back-and-forth
            thread that burns days. Include your OS and version (e.g. Ubuntu 22.04,
            Debian 12, macOS 14 with Homebrew bash), what you already tried and the
            exact command or cron line you ran, the full error output or unexpected
            behavior — paste stderr, not a paraphrase — and whether the issue is
            about a free snippet, an interactive tool, or the Production Bash
            Toolkit download. Screenshots of terminal output are fine; &quot;it
            crashed&quot; is not.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            When to expect a reply
          </h2>
          <p className="leading-relaxed text-muted">
            BashSnippets is a one-person project maintained alongside production
            sysadmin work. Email gets a response usually within 2 business days.
            Reproducible bug reports with version info often get a same-week fix
            pushed to the site. Script requests are triaged by how many operators
            would hit the same failure — niche edge cases may not get a dedicated
            page. YouTube and dev.to comments are read, but email remains the
            channel for anything that needs a code change or a direct answer about
            your environment.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="mb-6 font-heading text-xl font-bold text-text">
            Common questions
          </h2>
          <FaqTerminal items={contactFaqs} label="contact — faq" />
        </section>
      </main>
    </>
  );
}
