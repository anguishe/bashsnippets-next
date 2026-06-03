'use client';

interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
}

export default function CopyButton({ copied, onClick }: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        color: copied ? '#39d353' : '#8b949e',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '12px',
        padding: 0,
        cursor: 'pointer',
        transition: 'color 0.15s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!copied) e.currentTarget.style.color = '#e6edf3';
      }}
      onMouseLeave={(e) => {
        if (!copied) e.currentTarget.style.color = '#8b949e';
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}
