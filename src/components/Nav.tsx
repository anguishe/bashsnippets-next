'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/snippets', label: 'Snippets' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
] as const;

function linkClassName(isActive: boolean): string {
  const base = 'transition-[color] duration-150';
  return isActive
    ? `${base} font-semibold text-green`
    : `${base} text-muted hover:text-text`;
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg2">
      <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-lg font-bold text-text">
          BashSnippets<span className="text-green">.xyz</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClassName(isActive(href))}
            >
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
