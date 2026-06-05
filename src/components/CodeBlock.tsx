'use client';

import React, { useState } from 'react';
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

function getLanguage(className: string): string {
  const match = className.match(/language-([\w-]+)/);
  return match ? match[1] : 'shell';
}

export default function CodeBlock({
  children,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const mergedClassName = getClassName(children, className);
  const language = getLanguage(mergedClassName);
  const extractedCode = extractCode(children);

  async function handleCopy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(extractedCode);
      } else {
        const ta = document.createElement('textarea');
        ta.value = extractedCode;
        ta.style.position = 'absolute';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no state change
    }
  }

  return (
    <div
      style={{
        border: '1px solid #30363d',
        borderRadius: '8px',
        marginBottom: '24px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          padding: '8px 16px',
          gap: '12px',
        }}
      >
        <span
          style={{
            color: '#8b949e',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            flexShrink: 0,
          }}
        >
          {language}
        </span>
        <CopyButton copied={copied} onClick={handleCopy} />
      </div>
      <div
        style={{
          padding: '1.25rem 1.5rem',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '14px',
          lineHeight: 1.75,
          letterSpacing: '0.01em',
          color: '#e6edf3',
          background: 'transparent',
          overflowX: 'auto',
          overflowY: 'visible',
          whiteSpace: 'pre',
          minHeight: 'calc(4 * 1.75em + 2.5rem)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
