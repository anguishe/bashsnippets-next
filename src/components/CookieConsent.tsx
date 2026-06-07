'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type ConsentValue = 'all' | 'necessary' | 'reject';

const STORAGE_KEY = 'bs_consent';
const COOKIE_NAME = 'bs_consent';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

const VALID_VALUES: ConsentValue[] = ['all', 'necessary', 'reject'];

function parseConsent(value: string | null | undefined): ConsentValue | null {
  if (value && VALID_VALUES.includes(value as ConsentValue)) {
    return value as ConsentValue;
  }
  return null;
}

function getStoredConsent(): ConsentValue | null {
  const cookieMatch = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  );
  const fromCookie = parseConsent(cookieMatch?.[1]);
  if (fromCookie) return fromCookie;

  return parseConsent(localStorage.getItem(STORAGE_KEY));
}

function persistConsent(value: ConsentValue): void {
  localStorage.setItem(STORAGE_KEY, value);
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function updateGtagConsent(value: ConsentValue): void {
  if (value !== 'all') return;

  const gtag = (
    window as Window & { gtag?: (...args: unknown[]) => void }
  ).gtag;
  if (typeof gtag !== 'function') return;

  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const stored = getStoredConsent();
    if (stored) {
      updateGtagConsent(stored);
      return;
    }

    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const frame = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(frame);
  }, [visible, reducedMotion]);

  const handleChoice = (value: ConsentValue) => {
    persistConsent(value);
    updateGtagConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg2 px-4 py-4 md:px-6 ${
        reducedMotion
          ? ''
          : `transition-transform duration-300 ease-out ${
              animateIn ? 'translate-y-0' : 'translate-y-full'
            }`
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-sm leading-relaxed text-text">
          We use cookies for site analytics and advertising. You can accept
          all, or limit us to strictly necessary cookies only.{' '}
          <Link
            href="/privacy"
            className="text-blue underline-offset-2 hover:underline"
          >
            Privacy &amp; cookie policy
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleChoice('all')}
            className="rounded-[6px] bg-green px-4 py-2 font-mono text-sm text-bg transition-colors duration-150 hover:bg-green/90"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => handleChoice('necessary')}
            className="rounded-[6px] border border-border px-4 py-2 font-mono text-sm text-muted transition-colors duration-150 hover:border-green hover:text-text"
          >
            Necessary only
          </button>
          <button
            type="button"
            onClick={() => handleChoice('reject')}
            className="rounded-[6px] border border-border px-4 py-2 font-mono text-sm text-muted transition-colors duration-150 hover:border-green hover:text-text"
          >
            Reject all
          </button>
        </div>
      </div>
    </div>
  );
}
