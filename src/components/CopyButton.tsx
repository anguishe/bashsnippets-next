'use client';

import { useState } from 'react';

interface CopyButtonProps {
  code: string;
}

export default function CopyButton({ code }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  async function handleCopy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'absolute';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        background: '#1c2128',
        color:
          state === 'copied'
            ? '#39d353'
            : state === 'error'
              ? '#e3b341'
              : '#8b949e',
        border: `1px solid ${
          state === 'copied'
            ? '#39d353'
            : state === 'error'
              ? '#e3b341'
              : '#30363d'
        }`,
        borderRadius: '4px',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        padding: '3px 10px',
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {state === 'copied' ? 'copied!' : state === 'error' ? 'failed' : 'copy'}
    </button>
  );
}
