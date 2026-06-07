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
      className={`font-mono text-xs transition-colors duration-150 cursor-pointer ${
        copied ? 'text-[#39d353]' : 'text-[#8b949e] hover:text-[#e6edf3]'
      }`}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}
