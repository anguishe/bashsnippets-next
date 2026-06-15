'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/snippets', label: 'Snippets' },
  { href: '/tools', label: 'Tools' },
  { href: '/guides', label: 'Guides' },
  { href: '/starter-kit', label: 'Toolkit' },
  { href: '/about', label: 'About' },
] as const;

function linkClassName(isActive: boolean): string {
  const base = 'font-mono text-sm transition-colors duration-150';
  return isActive
    ? `${base} text-green underline underline-offset-4 decoration-green`
    : `${base} text-muted hover:text-text`;
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-sm">
          <span className="text-green">bash</span>
          <span className="text-muted">/</span>
          <span className="text-text">snippets</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClassName(isActive(href))}>
              {label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="text-xl text-text md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {open && (
        <div className="w-full border-b border-border bg-bg2 md:hidden">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-6 py-3 ${linkClassName(isActive(href))}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
