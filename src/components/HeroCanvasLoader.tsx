'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const HeroCanvas = dynamic(() => import('@/components/HeroCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function HeroCanvasLoader() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      return;
    }

    const load = () => setShouldLoad(true);

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(load, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(load, 100);
    return () => clearTimeout(id);
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return <HeroCanvas />;
}
