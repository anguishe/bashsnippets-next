import type { Metadata } from 'next';
import { IBM_Plex_Mono, Syne } from 'next/font/google';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Nav from '@/components/Nav';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bashsnippets.xyz'),
  title: {
    template: '%s – BashSnippets.xyz',
    default: 'Bash Script Examples and Tools Hub – BashSnippets.xyz',
  },
  description:
    'Browse free bash script examples for backups, cron, monitoring, grep, chmod, and Linux automation. Copy-paste ready scripts with plain-English explanations.',
  openGraph: {
    siteName: 'BashSnippets',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BashSnippets — bash scripts for Linux and DevOps',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} ${syne.variable}`}
    >
      <head>
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="BashSnippets"
          href="/opensearch.xml"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-bg font-mono text-text">
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6B01TGE8XS"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6B01TGE8XS');
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
