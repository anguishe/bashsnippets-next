type Gtag = (...args: unknown[]) => void;

/**
 * ponytail: no-op until GA4 has loaded AND analytics consent was granted — `gtag`
 * is only defined once both are true, so the guard is the whole consent check.
 */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag === 'function') gtag('event', event, params);
}
