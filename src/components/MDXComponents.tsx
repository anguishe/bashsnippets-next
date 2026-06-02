'use client';

import CodeBlock from './CodeBlock';

export const mdxComponents = {
  pre: (props: Parameters<typeof CodeBlock>[0]) => <CodeBlock {...props} />,
};
