'use client';
import { useEffect } from 'react';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-5399156622542127';

export default function AdSlot({
  slot,
  format = 'auto',
}: {
  slot: string;
  format?: string;
}) {
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

  useEffect(() => {
    if (!adsEnabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('[AdSense] Push failed:', e);
    }
  }, [adsEnabled]);

  if (!adsEnabled) return null;

  return (
    <div className="my-6" style={{ minHeight: '90px', textAlign: 'center' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
