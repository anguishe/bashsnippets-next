import type { ReactNode } from 'react';
import EmailCapture from '@/components/EmailCapture';
import ToolkitCTA from '@/components/ToolkitCTA';

/**
 * ponytail: guides are 5 standalone page.tsx files with no shared shell, so this
 * layout is the single place that reaches all of them plus the /guides index.
 * Container classes mirror each guide's own <main> so the CTA lines up.
 */
export default function GuidesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 pb-16">
        <ToolkitCTA placement="guide" />
        <EmailCapture placement="guide" />
      </div>
    </>
  );
}
