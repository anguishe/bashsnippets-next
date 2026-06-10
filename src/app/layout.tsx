import type { Metadata } from 'next';
import { IBM_Plex_Mono, Syne } from 'next/font/google';
import Script from 'next/script';
import CookieConsent from '@/components/CookieConsent';
import Footer from '@/components/Footer';
import Nav from '@/components/Nav';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  manifest: '/manifest.json',
  metadataBase: new URL('https://bashsnippets.xyz'),
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/rss.xml', title: 'BashSnippets RSS' }],
    },
  },
  title: {
    default: 'BashSnippets.xyz — Free Bash Scripts for Linux & DevOps',
    template: '%s | BashSnippets.xyz',
  },
  description:
    'Free copy-paste bash scripts for developers, sysadmins, and Linux users. Disk monitoring, backups, process management, and more.',
  keywords: [
    'bash scripts',
    'linux scripts',
    'bash automation',
    'shell scripts',
    'sysadmin scripts',
  ],
  authors: [{ name: 'Anguishe', url: 'https://bashsnippets.xyz/about' }],
  creator: 'Anguishe',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bashsnippets.xyz',
    siteName: 'BashSnippets.xyz',
    images: [
      {
        url: '/ogimage.png',
        width: 1200,
        height: 630,
        alt: 'BashSnippets.xyz — Free Bash Scripts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@BashSnippets',
    creator: '@BashSnippets',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  verification: {
    google: '1cbf4fa57c5805dd',
    yandex: '4d8ff527d40ec19d554ffb613576145a',
    other: {
      'msvalidate.01': '251791F542A787E4DDDFABC902DDB251',
    },
  },
  other: {
    'msapplication-TileColor': '#0d1117',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://bashsnippets.xyz/#organization',
  name: 'BashSnippets.xyz',
  url: 'https://bashsnippets.xyz',
  logo: 'https://bashsnippets.xyz/favicon-512x512.png',
  description:
    'Free bash script library and interactive tools for Linux users, sysadmins, and DevOps engineers.',
  sameAs: [
    'https://www.youtube.com/@BashSnippets',
    'https://www.tiktok.com/@BashSnippets',
    'https://dev.to/bashsnippets',
  ],
  founder: {
    '@type': 'Person',
    name: 'Anguishe',
    url: 'https://bashsnippets.xyz/about',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://bashsnippets.xyz/#website',
  url: 'https://bashsnippets.xyz',
  name: 'BashSnippets.xyz',
  description: 'Free bash script library for Linux users and sysadmins',
  publisher: { '@id': 'https://bashsnippets.xyz/#organization' },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://bashsnippets.xyz/snippets?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="BashSnippets"
          href="/opensearch.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="hPaS1a7Tg3n7RQ0sUvzaGg"
          async
        />
        <Script id="consent-mode-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
          `}
        </Script>
      </head>
      <body
        className={`${ibmPlexMono.variable} ${syne.variable} flex min-h-screen flex-col bg-bg text-text`}
      >
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
        <CookieConsent />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6B01TGE8XS"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            (function() {
              var match = document.cookie.match(/(?:^|; )bs_consent=([^;]*)/);
              if (match && match[1] === 'all') {
                gtag('consent', 'update', {
                  ad_storage: 'granted',
                  ad_user_data: 'granted',
                  ad_personalization: 'granted',
                  analytics_storage: 'granted'
                });
              }
              gtag('js', new Date());
              gtag('config', 'G-6B01TGE8XS');
            })();
          `}
        </Script>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5399156622542127"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
