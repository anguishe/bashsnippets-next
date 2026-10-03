'use client';

import { useShareLink, type ShareField } from './useShareLink';

/** "Copy share link" for a tool's header row: the listed inputs travel in the URL hash. */
export default function ShareLinkButton({ fields }: { fields: Record<string, ShareField> }) {
  const { copied, copyLink, error } = useShareLink(fields);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void copyLink()}
        className="rounded-[6px] border border-border bg-bg3 px-3 py-1.5 font-mono text-xs text-text transition-colors duration-150 hover:border-green hover:text-green"
      >
        {copied ? '✓ Link copied' : 'Copy share link'}
      </button>
      {error && (
        <span role="status" className="font-mono text-xs text-amber">
          {error}
        </span>
      )}
    </span>
  );
}
