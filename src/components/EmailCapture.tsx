'use client';

import { track } from '@/lib/track';

/**
 * ponytail: Buttondown's own embed pattern — a real form POST to a named window.
 * No fetch, so no CORS preflight and no API key in the bundle.
 *
 * Renders NOTHING until NEXT_PUBLIC_BUTTONDOWN_USERNAME is set in Vercel, so a
 * half-configured form never ships. See docs/NEXT-STEPS.md before enabling.
 */
const USERNAME = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME;

interface EmailCaptureProps {
  className?: string;
  /** Where this form rendered — snippet, tool, guide. Sent with the GA4 event. */
  placement?: string;
}

export default function EmailCapture({
  className = '',
  placement = 'unknown',
}: EmailCaptureProps) {
  if (!USERNAME) return null;

  return (
    <section
      className={`rounded-lg border border-border bg-bg2 px-6 py-5 ${className}`.trim()}
      aria-labelledby="email-capture-heading"
    >
      <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted">
        <span className="text-green" aria-hidden>$</span>
        <span>curl -O bashlib.sh</span>
        <span
          className="ml-0.5 inline-block h-4 w-2 bg-green motion-safe:animate-pulse"
          aria-hidden
        />
      </span>
      <h2
        id="email-capture-heading"
        className="mt-3 font-heading text-lg font-bold text-text"
      >
        Get the bashlib starter
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ten functions I source into every script on my own boxes — strict-mode
        setup, an ERR trap that names the failing line, lock and timeout wrappers,
        and cleanup that runs on every exit path. One email, no sequence.
      </p>
      <form
        action={`https://buttondown.com/api/emails/embed-subscribe/${USERNAME}`}
        method="post"
        target="popupwindow"
        onSubmit={() => {
          track('email_capture_submit', { placement });
          window.open(`https://buttondown.com/${USERNAME}`, 'popupwindow');
        }}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="bd-email" className="sr-only">
          Email address
        </label>
        <input
          id="bd-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-md border border-border bg-bg3 px-4 py-2.5 font-mono text-sm text-text transition-colors duration-150 placeholder:text-muted hover:border-green focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
        <input type="hidden" name="tag" value={placement} />
        <button
          type="submit"
          className="rounded-md bg-green px-5 py-2.5 font-heading text-sm font-bold text-bg transition-colors duration-150 hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2 focus:ring-offset-bg2"
        >
          Send it
        </button>
      </form>
    </section>
  );
}
