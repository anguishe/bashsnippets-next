import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10 text-center text-xs text-muted">
      <nav className="mb-4 flex flex-wrap justify-center gap-5">
        <Link href="/privacy" className="hover:text-text transition-colors">
          Privacy
        </Link>
        <Link href="/about" className="hover:text-text transition-colors">
          About
        </Link>
        <Link href="/contact" className="hover:text-text transition-colors">
          Contact
        </Link>
        <a
          href="https://youtube.com/@BashSnippets"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text transition-colors"
        >
          YouTube
        </a>
        <a
          href="https://dev.to/bashsnippets"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text transition-colors"
        >
          dev.to
        </a>
      </nav>
      <p>© 2026 BashSnippets</p>
      <p className="mt-2 text-muted/70">
        Some links on this site are affiliate links. We may earn a small
        commission at no extra cost to you.
      </p>
    </footer>
  );
}
