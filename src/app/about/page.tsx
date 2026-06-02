import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'About BashSnippets',
  description:
    'Who runs BashSnippets, what the site offers, and how to get in touch.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-heading text-4xl font-extrabold text-text">
        About BashSnippets
      </h1>

      <section className="mt-10">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Who runs it
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          BashSnippets is a free bash script library run by a self-taught Linux
          user in Florida. Started after writing the same disk monitoring script
          for the third time and deciding to just document it properly.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          What&apos;s on the site
        </h2>
        <div className="my-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            ['16 bash scripts', 'Copy-paste ready, plain-English explanations'],
            ['6 interactive tools', 'Cron builder, chmod calc, exit code lookup'],
            ['Zero logins', 'No account, no email, no paywall'],
            ['MIT licensed', 'Use the scripts anywhere, including production'],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded border border-border bg-bg2 p-4"
            >
              <p className="text-sm font-semibold text-green">{title}</p>
              <p className="mt-1 text-xs text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">Stack</h2>
        <p className="text-sm leading-relaxed text-muted">
          Static HTML migrated to Next.js. Hosted on Vercel. Scripts tested on
          Ubuntu 22.04 LTS and macOS Ventura.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Get in touch
        </h2>
        <p className="text-sm text-muted">
          <a
            href="mailto:anguishe1@gmail.com"
            className="text-blue transition-colors hover:text-text"
          >
            anguishe1@gmail.com
          </a>
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="https://youtube.com/@BashSnippets"
          target="_blank"
          rel="noopener"
          className="rounded border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-green hover:text-green"
        >
          YouTube @BashSnippets ↗
        </a>
        <a
          href="https://dev.to/bashsnippets"
          target="_blank"
          rel="noopener"
          className="rounded border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-green hover:text-green"
        >
          dev.to/bashsnippets ↗
        </a>
        <a
          href="https://github.com/anguishe/bash-scripts"
          target="_blank"
          rel="noopener"
          className="rounded border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-green hover:text-green"
        >
          GitHub scripts repo ↗
        </a>
      </div>

      <p className="mt-12 text-sm text-muted">
        <Link href="/snippets" className="text-blue hover:text-text">
          Browse the script library →
        </Link>
      </p>
    </main>
  );
}
