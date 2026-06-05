'use client';

import { useEffect, useState } from 'react';

interface ToolEmbedProps {
  slug: string;
}

const DEFAULT_HEIGHT = 600;

export default function ToolEmbed({ slug }: ToolEmbedProps) {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHeight(DEFAULT_HEIGHT);
    setLoaded(false);
  }, [slug]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'resize' && typeof e.data.height === 'number') {
        setHeight(Math.max(500, e.data.height + 48));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="tool-embed relative">
      {!loaded && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-[#0d1117] text-sm text-muted transition-opacity"
          aria-hidden
        >
          <span className="animate-pulse">Loading tool…</span>
        </div>
      )}
      <iframe
        src={`/tool-content/${slug}.html`}
        title={`${slug} interactive tool`}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: `${height}px`,
          border: 'none',
          borderRadius: '8px',
          background: '#0d1117',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />
    </div>
  );
}
