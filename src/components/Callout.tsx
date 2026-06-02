import type { ReactNode } from 'react';

interface CalloutProps {
  type: 'info' | 'warning' | 'success';
  title?: string;
  children: ReactNode;
}

const styles = {
  info: 'border-l-4 border-blue bg-blue-dim/50 px-5 py-4 rounded-r my-6',
  warning: 'border-l-4 border-amber bg-amber-dim/50 px-5 py-4 rounded-r my-6',
  success: 'border-l-4 border-green bg-green-dim/50 px-5 py-4 rounded-r my-6',
} as const;

export default function Callout({ type, title, children }: CalloutProps) {
  return (
    <div className={styles[type]}>
      {title ? (
        <p className="mb-2 text-sm font-semibold text-text">{title}</p>
      ) : null}
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}
