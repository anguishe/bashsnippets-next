import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <div className="flex items-center gap-2 font-mono text-sm text-muted">
        <span className="text-green">$</span>
        <span>cd {'{requested-page}'}</span>
        <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-green" />
      </div>
      <p className="mt-3 font-mono text-sm text-amber">
        bash: cd: {'{requested-page}'}: No such file or directory
      </p>

      <h1 className="mt-8 font-heading text-4xl font-extrabold leading-tight text-text md:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        That path doesn&apos;t exist on this server — but the scripts and tools you
        came for almost certainly do. Pick a working directory below.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/snippets"
          className="rounded-[6px] bg-green px-4 py-2 font-mono text-sm font-semibold text-bg no-underline transition-colors hover:bg-[#2ea043]"
        >
          Browse Snippets
        </Link>
        <Link
          href="/tools"
          className="rounded-[6px] border border-border px-4 py-2 font-mono text-sm text-text no-underline transition-colors hover:border-green"
        >
          Open Tools
        </Link>
        <Link
          href="/guides/bash-scripts-every-sysadmin-needs"
          className="rounded-[6px] border border-border px-4 py-2 font-mono text-sm text-text no-underline transition-colors hover:border-green"
        >
          Read the Sysadmin Guide
        </Link>
      </div>
    </main>
  );
}
