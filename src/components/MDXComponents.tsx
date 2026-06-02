import type { HTMLAttributes } from 'react';
import Callout from './Callout';
import CodeBlock from './CodeBlock';
import CopyButton from './CopyButton';

export const mdxComponents = {
  pre: (props: HTMLAttributes<HTMLPreElement>) => <CodeBlock {...props} />,
  Callout,
  CopyButton,
};
