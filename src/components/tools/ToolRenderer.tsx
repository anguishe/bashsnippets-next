'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

function ToolSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading tool" role="status">
      <div className="h-10 w-full animate-pulse rounded-lg bg-bg3" />
      <div className="h-32 w-full animate-pulse rounded-lg bg-bg3" />
      <div className="flex gap-3">
        <div className="h-9 w-28 animate-pulse rounded-lg bg-bg3" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-bg3" />
      </div>
    </div>
  );
}

const withSkeleton = (loader: () => Promise<{ default: ComponentType }>) =>
  dynamic(loader, { loading: () => <ToolSkeleton /> });

const toolComponents: Record<string, ComponentType> = {
  'bash-exit-code-lookup': withSkeleton(() => import('@/components/tools/BashExitCodeLookup')),
  'cron-job-builder': withSkeleton(() => import('@/components/tools/CronJobBuilder')),
  'chmod-permissions-builder': withSkeleton(() => import('@/components/tools/ChmodPermissionsBuilder')),
  'path-debugger': withSkeleton(() => import('@/components/tools/PathDebugger')),
  'bash-boilerplate-generator': withSkeleton(() => import('@/components/tools/BashBoilerplateGenerator')),
  'shellcheck-error-decoder': withSkeleton(() => import('@/components/tools/ShellcheckErrorDecoder')),
  'rsync-command-builder': withSkeleton(() => import('@/components/tools/RsyncCommandBuilder')),
  'grep-pattern-builder': withSkeleton(() => import('@/components/tools/GrepPatternBuilder')),
};

interface ToolRendererProps {
  slug: string;
}

export default function ToolRenderer({ slug }: ToolRendererProps) {
  const Component = toolComponents[slug];
  if (!Component) return null;
  return <Component />;
}
