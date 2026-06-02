import type { Metadata } from 'next';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact BashSnippets by email, YouTube, or dev.to.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-4 font-heading text-4xl font-extrabold text-text">
        Contact
      </h1>
      <p className="mb-10 leading-relaxed text-muted">
        Have a script request, a bug report, or just want to say hello?
        Here&apos;s where to reach us.
      </p>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-bg2 p-5">
          <p className="mb-1 text-xs uppercase tracking-widest text-green">
            Email
          </p>
          <a
            href="mailto:anguishe1@gmail.com"
            className="font-mono text-text transition-colors hover:text-green"
          >
            anguishe1@gmail.com
          </a>
          <p className="mt-2 text-xs text-muted">
            Best for: bug reports, script requests, business
          </p>
        </div>

        <div className="rounded-lg border border-border bg-bg2 p-5">
          <p className="mb-1 text-xs uppercase tracking-widest text-green">
            YouTube
          </p>
          <a
            href="https://youtube.com/@BashSnippets"
            target="_blank"
            rel="noopener"
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
            rel="noopener"
            className="font-mono text-text transition-colors hover:text-green"
          >
            dev.to/bashsnippets ↗
          </a>
          <p className="mt-2 text-xs text-muted">
            Best for: article discussions and feedback
          </p>
        </div>
      </div>
    </main>
  );
}
