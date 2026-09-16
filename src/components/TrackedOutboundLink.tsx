'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/track';

interface TrackedOutboundLinkProps {
  href: string;
  event: string;
  params?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
}

/** External link that reports a GA4 event on click. Always opens in a new tab. */
export default function TrackedOutboundLink({
  href,
  event,
  params,
  className,
  children,
}: TrackedOutboundLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      // No noreferrer: Gumroad attributes views and sales to the referring site. The
      // site-wide Referrer-Policy (strict-origin-when-cross-origin) sends the origin only.
      rel="noopener"
      onClick={() => track(event, { ...params, href })}
      className={className}
    >
      {children}
    </a>
  );
}
