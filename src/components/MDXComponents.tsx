import type { ComponentPropsWithoutRef } from 'react';
import Callout from './Callout';
import CodeBlock from './CodeBlock';

function Code({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'code'>) {
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

function H1(props: ComponentPropsWithoutRef<'h1'>) {
  return <h1 {...props} />;
}

function H2(props: ComponentPropsWithoutRef<'h2'>) {
  return <h2 {...props} />;
}

function H3(props: ComponentPropsWithoutRef<'h3'>) {
  return <h3 {...props} />;
}

function Pre({
  children,
  className,
}: ComponentPropsWithoutRef<'pre'>) {
  return (
    <CodeBlock className={className}>{children}</CodeBlock>
  );
}

export const mdxComponents = {
  pre: Pre,
  code: Code,
  h1: H1,
  h2: H2,
  h3: H3,
  Callout,
};
