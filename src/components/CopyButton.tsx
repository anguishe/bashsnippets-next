'use client';

import { useState } from 'react';

type CopyState = 'idle' | 'success';

interface CopyButtonProps {
  code: string;
  filename?: string;
}

export default function CopyButton({ code }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setState('success');
      window.setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('idle');
    }
  };

  const isSuccess = state === 'success';

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`cursor-pointer rounded border bg-transparent px-3 py-1 font-mono text-xs transition-colors ${
        isSuccess
          ? 'border-green text-green'
          : 'border-border text-muted hover:border-green hover:text-green'
      }`}
    >
      {isSuccess ? '✓ copied' : 'copy'}
    </button>
  );
}
