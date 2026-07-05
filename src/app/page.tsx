import AdSlot from '@/components/AdSlot';
import Breadcrumb from '@/components/Breadcrumb';
import AffiliateBox from '@/components/AffiliateBox';
import ToolkitCTA from '@/components/ToolkitCTA';
import FaqTerminal from '@/components/FaqTerminal';
import ScrollReveal from '@/components/ScrollReveal';
import { snippets } from '@/lib/snippets';
import { tools } from '@/lib/tools';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const SITE_URL = 'https://bashsnippets.xyz';

const homeTitle = 'Free Bash Script Library — Copy-Paste Scripts for Linux';
const homeDescription =
  'Copy-paste bash scripts and interactive tools for Linux, macOS, and DevOps — disk monitoring, backups, cron, permissions, and more. Every script is tested, explained line by line, and free.';

export const metadata: Metadata = {
  title: { absolute: `${homeTitle} | BashSnippets.xyz` },
  description: homeDescription,
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: SITE_URL,
    type: 'website',
    siteName: 'BashSnippets.xyz',
    images: [{ url: `${SITE_URL}/ogimage.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeDescription,
    images: [`${SITE_URL}/ogimage.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const faqItems = [
  {
    question: 'What is a bash script?',
    answer:
      'A text file of terminal commands that runs automatically in sequence. Saved with a .sh extension, starting with #!/bin/bash.',
  },
  {
    question: 'How do I run a bash script?',
    answer:
      'Make it executable: chmod +x script.sh — then run: ./script.sh. Or skip chmod and type: bash script.sh',
  },
  {
    question: 'How do I schedule a bash script?',
    answer:
      'Use cron. Run crontab -e and add a line like: 0 2 * * * /path/to/script.sh to run daily at 2am.',
  },
  {
    question: 'How do I stop my script on errors?',
    answer:
      'Add set -euo pipefail near the top. This exits on error, catches undefined variables, and handles pipe failures.',
  },
] as const;

const previewTools = [
  {
    slug: 'path-debugger',
    title: '$PATH Debugger',
    description: 'Paste your $PATH to surface duplicate entries, dead directories, and ordering problems that cause command-not-found errors.',
  },
  {
    slug: 'bash-exit-code-lookup',
    title: 'Exit Code Lookup',
    description: 'Look up any exit code 0–255 and get a plain-English explanation.',
  },
  {
    slug: 'cron-job-builder',
    title: 'Cron Builder',
    description: 'Build cron expressions visually with human-readable output.',
  },
  {
    slug: 'cron-wrapper-generator',
    title: 'Cron Wrapper Generator',
    description: 'Wrap a cron command with flock, timeout, and exponential-backoff retry so overlapping runs and hung jobs stop silently breaking your cron slot.',
  },
  {
    slug: 'bash-boilerplate-generator',
    title: 'Boilerplate Generator',
    description: 'Generate a production-ready script header with set -euo pipefail, cleanup traps, and argument parsing before writing a single line of logic.',
  },
  {
    slug: 'chmod-permissions-builder',
    title: 'Chmod Builder',
    description: 'Permission matrix that outputs octal, symbolic, and chmod commands.',
  },
  {
    slug: 'grep-pattern-builder',
    title: 'grep Builder',
    description: 'Build the exact grep command you need — recursive, case-insensitive, with context lines — and get a plain-English explanation for every flag.',
  },
  {
    slug: 'shellcheck-error-decoder',
    title: 'ShellCheck Decoder',
    description: 'Enter any SC code to get the rule name, why it causes production failures, and a before/after fix example.',
  },
] as const;


export default function Home() {
  const featuredSnippets = snippets.slice(0, 9);

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <Breadcrumb items={[{ label: 'Home' }]} />
      </div>

      {/* Hero */}
      <section className="w-full border-b border-border relative overflow-hidden min-h-[420px] md:min-h-[500px]">
        {/* Full-width background image — terminal graphic visible on right */}
        <Image
          src="/hero-section-bs.png"
          alt=""
          fill
          className="object-cover object-right"
          priority
        />
        {/* Gradient overlay — solid bg on left fading to transparent, hides image's baked-in text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] from-40% via-[#0d1117]/80 to-transparent" />

        {/* Content — sits above overlay */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="max-w-lg">
            <p className="mb-6 flex items-center gap-2 font-mono text-sm text-muted">
              <span className="text-green">$</span>
              <span>bashsnippets.xyz</span>
              <span className="h-4 w-2 animate-pulse bg-green" aria-hidden="true" />
            </p>

            <h1 className="font-heading text-4xl font-black leading-[1.05] tracking-tight text-text md:text-6xl">
              Stop Googling the Same{' '}
              <em className="not-italic text-green">Bash Commands</em>
            </h1>

            <p className="mt-6 leading-relaxed text-muted">
              I got tired of re-searching the same bash one-liners every time I sat
              down at a terminal. So I started collecting them. This is that
              collection — real scripts, explained like a human wrote them, with
              the edge cases documented so you don&apos;t hit the same problems I did.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/snippets"
                className="rounded-[6px] bg-green px-5 py-2.5 font-mono text-sm text-bg transition-opacity hover:opacity-90"
              >
                Browse All Snippets
              </Link>
              <Link
                href="#tools"
                className="rounded-[6px] border border-border px-5 py-2.5 font-mono text-sm text-text transition-colors hover:border-green"
              >
                Try the Builder
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { value: String(snippets.length), label: 'Working Scripts' },
                { value: '100%', label: 'Tested on Linux' },
                { value: '0', label: 'Logins Required' },
                { value: 'Free', label: 'Always' },
              ].map((stat) => (
                <p key={stat.label} className="font-mono text-xs uppercase tracking-widest text-muted">
                  {stat.value} {stat.label}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — What is BashSnippets */}
      <section className="mx-auto max-w-4xl border-t border-border px-6 py-16">
        <ScrollReveal>
          <h2 className="mb-4 font-heading text-2xl font-bold text-text">
            What is BashSnippets?
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <p className="leading-relaxed text-muted">
              BashSnippets is a free bash script library for Linux developers,
              sysadmins, and DevOps engineers. Every script solves a specific
              operational problem — disk space monitoring, automated backups,
              service watchdogs, log cleanup — and comes with a plain-English
              explanation of what each line does and why.
            </p>
            <p className="leading-relaxed text-muted">
              Bash runs on every Linux server without installing anything. That
              means these scripts work on Ubuntu, Debian, Fedora, CentOS, and
              macOS without a dependency manager, a runtime, or a package.json.
              Copy the script, set a threshold or path, make it executable, and
              you&apos;re done. The {tools.length} browser tools — cron builder, chmod
              calculator, exit code lookup — work the same way: open in a browser,
              get the answer, no account required.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Section 3 — Snippets Grid */}
      <section
        id="snippets"
        className="mx-auto max-w-4xl border-t border-border px-6 py-20"
      >
        <ScrollReveal>
          <h2 className="mb-4 font-heading text-2xl font-bold text-text">
            Copy-Paste Scripts That Work
          </h2>
          <p className="mb-10 text-muted">
            Every snippet runs on Ubuntu 22.04 LTS, Debian 12, Fedora 39, and
            macOS Ventura. Tested personally — including the failure cases.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredSnippets.map((snippet, index) => (
              <ScrollReveal
                key={snippet.slug}
                style={{ transitionDelay: `${index * 0.07}s` }}
              >
                <article className="bg-bg2 border border-border rounded-[8px] p-5 hover:border-green transition-colors duration-150 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-0.5 w-0 bg-green group-hover:w-full transition-all duration-300" />
                  <span className="font-mono text-xs text-muted uppercase tracking-widest">
                    {snippet.difficulty} · {snippet.tags[0]}
                  </span>
                  <h3 className="font-heading text-base font-bold text-text mt-1.5 leading-snug">
                    {snippet.title}
                  </h3>
                  <p className="text-muted text-sm mt-2 leading-relaxed line-clamp-2">
                    {snippet.description}
                  </p>
                  <p className="font-mono text-xs text-muted mt-3 truncate">
                    {snippet.tags.join(' · ')}
                  </p>
                  <Link
                    href={`/snippets/${snippet.slug}`}
                    className="font-mono text-xs text-green mt-4 inline-block hover:underline underline-offset-2"
                  >
                    Full guide →
                  </Link>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        <AdSlot slot="AUTO" format="auto" />

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/snippets"
            className="rounded bg-green px-6 py-3 font-mono font-semibold text-bg transition-all duration-150 hover:scale-[1.02] hover:opacity-95"
          >
            Browse All Snippets
          </Link>
          <Link
            href="/tools"
            className="rounded bg-blue px-6 py-3 font-mono font-semibold text-bg transition-all duration-150 hover:scale-[1.02] hover:opacity-95"
          >
            Browse All Tools
          </Link>
        </div>
      </section>

      {/* Section 4 — Tools Preview */}
      <section
        id="tools"
        className="border-y border-border bg-bg2 px-6 py-20"
      >
        <ScrollReveal className="mx-auto max-w-4xl">
          <h2 className="mb-4 font-heading text-2xl font-bold text-text">
            Free Browser Tools for Bash
          </h2>
          <p className="mb-2 text-muted">
            No install required. Open in your browser, get the answer.
          </p>
          <p className="mb-10 text-sm text-muted">
            The cron builder generates expressions visually and shows the
            human-readable schedule. The chmod calculator outputs octal, symbolic,
            and the exact <code className="font-mono text-xs text-green">chmod</code> command.
            The exit code lookup explains what any exit code 0–255 means and which
            command typically produces it. All {tools.length} tools run entirely in your
            browser — no server round-trips, no data collected.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {previewTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group relative block overflow-hidden rounded-lg border border-border bg-bg3 p-4 no-underline transition-colors duration-150 hover:border-green"
              >
                <div className="absolute left-0 top-0 h-0.5 w-0 bg-green transition-all duration-300 group-hover:w-full" aria-hidden />
                <p className="mb-1 font-heading font-bold text-text">
                  {tool.title}
                </p>
                <p className="text-sm leading-relaxed text-muted">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>

          <Link
            href="/tools"
            className="mt-8 inline-block text-sm text-blue transition-colors hover:text-text"
          >
            See all {tools.length} tools →
          </Link>
        </ScrollReveal>
      </section>

      {/* Section 5 — FAQ */}
      <section
        id="faq"
        className="mx-auto max-w-3xl border-t border-border px-6 py-20"
      >
        <ScrollReveal>
          <h2 className="mb-6 font-heading text-2xl font-bold text-text">
            Common Questions
          </h2>

          <FaqTerminal items={faqItems} label="faq — bash" />
        </ScrollReveal>
      </section>

      {/* Section 6 — Affiliate */}
      <section className="mx-auto max-w-4xl border-t border-border px-6 py-10">
        <ScrollReveal>
          <AffiliateBox partner="digitalocean" />
          <AffiliateBox partner="namecheap" className="mt-4" />
          <ToolkitCTA className="mt-10" />
        </ScrollReveal>
      </section>
    </>
  );
}
