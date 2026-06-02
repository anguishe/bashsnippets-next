'use client';

import { useEffect, useState } from 'react';

const brandVars = `
<style>
  :root, * {
    --bg: #0d1117;
    --bg2: #161b22;
    --bg3: #1c2128;
    --border: #30363d;
    --green: #39d353;
    --green-dim: #1a4a2e;
    --amber: #e3b341;
    --amber-dim: #3d2f0d;
    --blue: #58a6ff;
    --blue-dim: #0d2a4a;
    --muted: #8b949e;
    --text: #e6edf3;
    --radius: 8px;
    --mono-font: 'IBM Plex Mono', monospace;
    --heading-font: 'Syne', sans-serif;
  }
</style>
`;

interface ToolEmbedProps {
  slug: string;
}

export default function ToolEmbed({ slug }: ToolEmbedProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);
    setHtml(null);

    fetch(`/tool-content/${slug}.html`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load tool');
        }
        return res.text();
      })
      .then((data) => {
        if (!cancelled) {
          setHtml(brandVars + data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-muted">
        <div className="font-mono text-sm">
          <span className="text-green">$</span>
          <span className="ml-2">loading tool</span>
          <span className="ml-1 inline-block animate-pulse text-green">▊</span>
        </div>
        <p className="text-xs text-muted/60">Fetching interactive tool...</p>
      </div>
    );
  }

  if (error || !html) {
    return (
      <p className="rounded-lg border border-border bg-bg2 px-6 py-12 text-center text-muted">
        Tool loading failed. Try refreshing.
      </p>
    );
  }

  return (
    <div
      className="tool-embed-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
