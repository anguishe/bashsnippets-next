type Gtag = (...args: unknown[]) => void;

/**
 * `gtag` is defined on every page by the Consent Mode default in layout.tsx, so this
 * always sends. Until the visitor accepts analytics, GA4 receives it as a cookieless,
 * consent-denied ping that standard reports do not show — so GA4 undercounts these
 * events. Gumroad's own views-by-referrer is the count of record for purchase clicks.
 */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag === 'function') gtag('event', event, params);
}
