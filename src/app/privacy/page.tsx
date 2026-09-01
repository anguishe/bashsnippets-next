import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for BashSnippets.xyz — analytics, cookies, and third-party services.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy' },
        ]}
      />

      <h1 className="font-heading text-4xl font-extrabold text-text">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: June 17, 2026.</p>

      <section className="mt-10">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Data we collect
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          BashSnippets uses Google Analytics 4 (GA4) for anonymized traffic
          statistics. We do not collect account data, and we do not store form
          submissions — there are no sign-up forms on this site.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">Cookies</h2>
        <p className="text-sm leading-relaxed text-muted">
          This site may set cookies from Google Analytics 4 (measurement and
          traffic tracking). The site serves no advertising and sets no
          advertising cookies. You can block cookies in your browser settings;
          the site will still work for reading scripts and using tools.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Data Retention
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Google Analytics 4 retains data for 14 months by default. Your consent
          choices are stored in your browser (localStorage and a cookie) until
          you clear them.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Your Rights (GDPR)
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          If you are in the EEA or UK, you have rights under GDPR (Articles
          15–17) to request access to, correction of, or deletion of your
          personal data. You may withdraw consent at any time by clearing cookies
          or changing your choice on the cookie consent banner.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          California Privacy (CCPA)
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          California residents may request disclosure or deletion of personal
          information and may opt out of the sale of personal information. We do
          not sell personal information.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          How to opt out
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Choose &quot;Necessary only&quot; or &quot;Reject all&quot; on the
          cookie banner when you first visit the site. That is the only
          tracking this site does.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Third parties
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-muted">
          <li>Google Analytics 4 (traffic measurement)</li>
          <li>Buttondown (email list — only if you submit the form)</li>
          <li>Gumroad (checkout — only if you buy the toolkit)</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          There are no advertising or affiliate partners. The site carries no
          ads and no affiliate links.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Privacy contact
        </h2>
        <p className="text-sm text-muted">
          Questions about this policy:{' '}
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
