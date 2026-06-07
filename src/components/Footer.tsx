import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/snippets', label: 'Snippets' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg2 px-6 py-6 text-center">
      <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
        {footerLinks.map(({ href, label }, index) => (
          <span key={href} className="inline-flex items-center">
            {index > 0 && (
              <span className="mx-2 text-muted" aria-hidden>
                ·
              </span>
            )}
            <Link
              href={href}
              className="text-muted transition-colors duration-150 hover:text-green"
            >
              {label}
            </Link>
          </span>
        ))}
      </nav>
      <p className="text-xs text-muted">© 2026 BashSnippets.xyz</p>
    </footer>
  );
}
