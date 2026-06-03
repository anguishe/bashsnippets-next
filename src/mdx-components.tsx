import type { MDXComponents } from 'mdx/types';
import CodeBlock from '@/components/CodeBlock';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: ({ children, className }) => (
      <CodeBlock className={className}>{children}</CodeBlock>
    ),
  };
}
