export interface ToolMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
}

export const tools: ToolMeta[] = [
  {
    slug: 'bash-exit-code-lookup',
    title: 'Bash Exit Code Lookup',
    description:
      'Look up any bash exit code 0-255 and get the plain-English meaning, common causes, and generated error handler.',
    category: 'reference',
  },
  {
    slug: 'cron-job-builder',
    title: 'Cron Job Builder',
    description:
      'Visual cron expression builder with human-readable schedule output and copy-paste crontab line.',
    category: 'builder',
  },
  {
    slug: 'chmod-permissions-builder',
    title: 'Chmod Permissions Builder',
    description:
      'Build chmod commands visually with a permission matrix. Shows octal, symbolic, and command output.',
    category: 'builder',
  },
  {
    slug: 'path-debugger',
    title: 'Bash $PATH Debugger',
    description:
      'Debug your $PATH variable, find duplicate entries, missing directories, and fix ordering issues.',
    category: 'debug',
  },
  {
    slug: 'bash-boilerplate-generator',
    title: 'Bash Boilerplate Generator',
    description:
      'Generate a production-ready bash script template with error handling, logging, and argument parsing.',
    category: 'generator',
  },
  {
    slug: 'shellcheck-error-decoder',
    title: 'ShellCheck Error Decoder',
    description:
      'Decode ShellCheck error codes SC1xxx-SC3xxx into plain-English explanations with before/after fix examples.',
    category: 'reference',
  },
];

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getAllToolSlugs(): string[] {
  return tools.map((tool) => tool.slug);
}

export function getToolsByCategory(category: string): ToolMeta[] {
  return tools.filter((tool) => tool.category === category);
}
