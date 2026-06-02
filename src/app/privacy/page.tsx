import type { Metadata } from 'next';

const SITE_URL = 'https://bashsnippets.xyz';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for BashSnippets.xyz — analytics, cookies, and affiliates.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-heading text-4xl font-extrabold text-text">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: May 2026</p>

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
          This site may set cookies from Google Analytics (measurement) and Google
          AdSense (advertising). You can block cookies in your browser settings;
          the site will still work for reading scripts and using tools.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Affiliate disclosure
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Some links are affiliate links. We earn a commission if you click and
          make a purchase, at no extra cost to you. We only link to services we
          use or recommend.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This site participates in the DigitalOcean affiliate program and the
          Namecheap affiliate program. If you click an affiliate link and make a
          purchase, we may receive a commission at no additional cost to you.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Third parties
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-muted">
          <li>Google Analytics (traffic measurement)</li>
          <li>Google AdSense (advertising)</li>
          <li>DigitalOcean affiliate program</li>
          <li>Namecheap affiliate program</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl font-bold text-text">
          Privacy contact
        </h2>
        <p className="text-sm text-muted">
          Questions about this policy:{' '}
          <a
            href="mailto:anguishe1@gmail.com"
            className="text-blue transition-colors hover:text-text"
          >
            anguishe1@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
