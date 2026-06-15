import Link from 'next/link';

interface ToolkitCTAProps {
  className?: string;
}

export default function ToolkitCTA({ className = '' }: ToolkitCTAProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-bg2 px-6 py-5 ${className}`.trim()}
    >
      <span className="inline-block rounded border border-amber bg-[#3d2f0d] px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-amber">
        PAID RESOURCE — $9
      </span>
      <h2 className="mt-4 font-heading text-xl font-bold text-text">
        The Production Bash Toolkit
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        6 scripts + shared library + 52-page field guide. The production layer the
        free snippets don&apos;t cover.
      </p>
      <Link
        href="/starter-kit"
        className="mt-4 inline-block rounded-md bg-green px-5 py-2.5 font-heading text-sm font-bold text-bg no-underline transition-colors hover:bg-[#2ea043]"
      >
        Get the Toolkit →
      </Link>
    </div>
  );
}
