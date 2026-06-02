'use client';

import React from 'react';
import CopyButton from './CopyButton';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  filename?: string;
}

const extractCode = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractCode).join('');
  if (React.isValidElement(node) && node.props.children)
    return extractCode(node.props.children as React.ReactNode);
  return '';
};

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

function getLanguageLabel(className: string): string {
  if (className.includes('language-bash')) return 'bash';
  if (className.includes('language-sh')) return 'sh';
  return 'terminal';
}

export default function CodeBlock({
  children,
  className,
  filename,
}: CodeBlockProps) {
  const mergedClassName = getClassName(children, className);
  const lang = getLanguageLabel(mergedClassName);
  const extractedCode = extractCode(children);

  return (
    <div className="relative my-6 overflow-hidden rounded-lg border border-border bg-bg2">
      <div className="flex items-center justify-between border-b border-border bg-bg3 px-4 py-2">
        <span className="font-mono text-xs font-semibold text-green">{lang}</span>
        <CopyButton code={extractedCode} filename={filename} />
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-text">
        {children}
      </pre>
    </div>
  );
}
