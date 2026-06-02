'use client';

import React from 'react';
import CopyButton from './CopyButton';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

function extractCode(children: React.ReactNode): string {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractCode).join('');
  if (typeof children === 'object' && 'props' in (children as object)) {
    return extractCode(
      (children as React.ReactElement<{ children?: React.ReactNode }>).props
        ?.children,
    );
  }
  return '';
}

function getClassName(
  children: React.ReactNode,
  className?: string,
): string {
  if (className) return className;
  if (React.isValidElement(children)) {
    const childProps = children.props as { className?: string };
    if (childProps.className) return childProps.className;
  }
  return '';
}

function getFilename(className: string): string {
  if (className.includes('language-bash')) return 'script.sh';
  if (className.includes('language-sh')) return 'script.sh';
  if (className.includes('language-')) {
    const match = className.match(/language-(\w+)/);
    if (match) return `snippet.${match[1]}`;
  }
  return 'terminal';
}

export default function CodeBlock({
  children,
  className,
}: CodeBlockProps) {
  const mergedClassName = getClassName(children, className);
  const filename = getFilename(mergedClassName);
  const extractedCode = extractCode(children);

  return (
    <div
      className="my-6 overflow-hidden"
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          background: '#0d1117',
          padding: '8px 14px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <div className="flex shrink-0 gap-1.5" aria-hidden>
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: '#ff5f56' }}
            />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: '#ffbd2e' }}
            />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: '#27c93f' }}
            />
          </div>
          <span
            className="filename truncate"
            style={{
              marginLeft: '10px',
              fontSize: '12px',
              color: 'var(--muted)',
            }}
          >
            {filename}
          </span>
        </div>
        <CopyButton code={extractedCode} />
      </div>
      <pre
        className="overflow-x-auto text-text"
        style={{
          padding: '20px',
          fontSize: '13px',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {children}
      </pre>
    </div>
  );
}
