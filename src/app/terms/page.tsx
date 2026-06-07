import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for BashSnippets.xyz — script license, disclaimers, affiliates, and advertising.',
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Terms of Service' },
        ]}
      />

      <h1 className="font-heading text-4xl font-extrabold text-text">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: June 6, 2026.</p>

      <section className="mt-10">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Acceptance of Terms
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          By accessing or using BashSnippets.xyz, you agree to these Terms of
          Service. If you do not agree, do not use this site.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Content License
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          All bash scripts on this site are provided under the MIT License. You
          may copy, modify, and use them freely, including for commercial
          purposes, with no warranty.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          No Warranty / Use at Your Own Risk
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Scripts and tools are provided &quot;as is&quot; without warranty of
          any kind. Running shell scripts can modify or delete data on your
          systems. Test in a safe environment before running anything in
          production. You are solely responsible for outcomes.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Affiliate Disclosure
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Some outbound links (DigitalOcean, Namecheap) are affiliate links.
          BashSnippets.xyz may earn a commission if you click and make a
          purchase, at no extra cost to you. Affiliate relationships do not
          affect the script content published on this site.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Third-Party Advertising
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Google AdSense serves advertisements on this site and may set cookies
          subject to your consent choice. See our{' '}
          <a href="/privacy" className="text-blue transition-colors hover:text-text">
            Privacy Policy
          </a>{' '}
          for details on advertising cookies and tracking.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Limitation of Liability
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          BashSnippets.xyz and its operator are not liable for any damages
          arising from your use of scripts, tools, or content on this site,
          including direct, indirect, incidental, or consequential damages.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Changes to These Terms
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          These terms may be updated from time to time. The last-updated date at
          the top of this page reflects the current version.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">Contact</h2>
        <p className="text-sm text-muted">
          Questions about these terms:{' '}
          <a
            href="mailto:anguisheh1@gmail.com"
            className="text-blue transition-colors hover:text-text"
          >
            anguisheh1@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
