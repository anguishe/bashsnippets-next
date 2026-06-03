const DEFAULT_PUBLISHED_TIME = '2026-05-01';
const DEFAULT_MODIFIED_TIME = '2026-05-22';

export interface SnippetMeta {
  slug: string;
  title: string;
  description: string;
  quickAnswer?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  datePublished: string;
  dateModified: string;
  publishedTime?: string;
  modifiedTime?: string;
  youtubeShortId?: string;
}

export const snippets: SnippetMeta[] = [
  {
    slug: 'disk-space-warning',
    title: 'Disk Space Warning Script',
    description:
      'Copy a disk space warning bash script using df, thresholds, cron, and email alerts. Monitor Linux servers and prevent full drives.',
    quickAnswer:
      'The df command reports disk space usage for every mounted filesystem as a percentage. This script reads the percentage for a configurable partition (default: /), compares it against a threshold you set, and prints a warning to stdout — plus exits with code 1 — when that threshold is crossed. A full disk stops your web server from writing access logs, prevents your database from flushing transactions, and can corrupt in-progress writes. Without monitoring, the first sign of a full disk is often a crashed service, not an alert. The default threshold of 80% on a 25 GB VPS means you have roughly 5 GB remaining before trouble starts. Works on Ubuntu 22.04 LTS, Debian 12, Fedora 39, CentOS 9, and macOS Ventura — any system with bash and df. Run manually or schedule with cron every hour: 0 * * * * /home/user/diskcheck.sh.',
    tags: ['monitor', 'cron-ready', 'df'],
    difficulty: 'beginner',
    datePublished: '2026-05-01',
    dateModified: '2026-06-03',
    youtubeShortId: 'lj1CKKCbXpI',
  },
  {
    slug: 'automated-file-backup',
    title: 'Automated File Backup',
    description:
      'Bash script to automatically backup files with timestamps using cp or rsync. Schedule with cron.',
    quickAnswer:
      'The cp command copies files and directories from one location to another. This script wraps cp -r with a date-stamped destination path, creating a new backup folder — like backup_2026-06-03_14-30 — each time it runs, so no backup overwrites a previous one. Without scheduled backups, a single accidental rm -rf or disk failure can permanently destroy days or weeks of work. There is no recycle bin on Linux servers. The script lets you set SOURCE (the folder to back up) and DEST (where backups are stored) at the top, then call it manually or schedule it with cron. A typical hourly backup of a 1 GB project folder completes in under five seconds. Works on Ubuntu 22.04 LTS, Debian 12, Fedora 39, and macOS Ventura — any system with bash and cp. Schedule with cron: 0 * * * * /home/user/backup.sh.',
    tags: ['backup', 'cron-ready', 'rsync'],
    difficulty: 'beginner',
    datePublished: '2026-05-01',
    dateModified: '2026-06-03',
  },
  {
    slug: 'delete-old-log-files',
    title: 'Delete Old Log Files',
    description:
      'Use find and mtime to automatically delete log files older than N days. Prevent disk bloat.',
    tags: ['cleanup', 'find', 'cron-ready'],
    difficulty: 'intermediate',
    datePublished: '2026-04-20',
    dateModified: '2026-05-22',
  },
  {
    slug: 'quick-system-info-report',
    title: 'Quick System Info Report',
    description:
      'One-script snapshot of hostname, uptime, CPU, RAM, disk, and IP. No installs required.',
    tags: ['monitor', 'reporting', 'system'],
    difficulty: 'beginner',
    datePublished: '2026-04-25',
    dateModified: '2026-05-22',
  },
  {
    slug: 'search-files-for-text-grep',
    title: 'Search Files for Text with grep',
    description:
      'Find any string across files and directories using grep, egrep, and common flags explained.',
    quickAnswer:
      'The grep command searches files for a pattern and prints every matching line with its filename. This script wraps grep -rn — recursive search with line numbers — so you can locate any string across an entire directory tree in a single command. Without grep, tracking down a hardcoded credential, a renamed function, or a specific log message across hundreds of files means opening each file manually. Running grep -rn "TODO" /var/www/html --include="*.php" scans every PHP file under /var/www/html and returns the filename, line number, and the matched line for every result. The -i flag makes the search case-insensitive; --color=auto highlights each match in the terminal output. Works on Ubuntu 22.04 LTS, Debian 12, Fedora 39, CentOS 9, and macOS Ventura — grep is pre-installed on every POSIX-compliant system. No packages needed. Run directly in your terminal.',
    tags: ['grep', 'search', 'text'],
    difficulty: 'beginner',
    datePublished: '2026-05-01',
    dateModified: '2026-06-03',
  },
  {
    slug: 'check-if-website-is-up',
    title: 'Check If Website Is Up',
    description:
      'curl-based uptime checker that returns HTTP status codes and alerts on non-200 responses.',
    tags: ['monitor', 'curl', 'uptime'],
    difficulty: 'beginner',
    datePublished: '2026-05-05',
    dateModified: '2026-05-22',
  },
  {
    slug: 'bash-error-handling',
    title: 'Bash Error Handling with set -euo pipefail',
    description:
      'Proper bash error handling using set -euo pipefail — stop scripts on errors, catch undefined variables, handle pipes.',
    tags: ['error-handling', 'best-practices', 'set'],
    difficulty: 'intermediate',
    datePublished: '2026-05-10',
    dateModified: '2026-05-22',
  },
  {
    slug: 'bash-if-else-examples',
    title: 'Bash If/Else Examples',
    description:
      'Comprehensive bash if/else, elif, test operators, string comparison, and file condition checks.',
    tags: ['conditionals', 'basics', 'if'],
    difficulty: 'beginner',
    datePublished: '2026-05-12',
    dateModified: '2026-05-22',
  },
  {
    slug: 'create-dated-folder',
    title: 'Create a Dated Folder',
    description:
      'Use date +%Y-%m-%d to auto-name folders for backups, logs, and organized archives.',
    tags: ['files', 'date', 'mkdir'],
    difficulty: 'beginner',
    datePublished: '2026-05-14',
    dateModified: '2026-05-22',
  },
  {
    slug: 'kill-a-process',
    title: 'Kill a Process with pkill and pgrep',
    description:
      'Use pkill, pgrep, and kill to find and stop processes by name, PID, or pattern.',
    tags: ['process', 'pkill', 'pgrep'],
    difficulty: 'intermediate',
    datePublished: '2026-05-16',
    dateModified: '2026-05-22',
  },
  {
    slug: 'file-permissions-security',
    title: 'File Permissions Security Audit',
    description:
      'Scan for world-writable files, SUID/SGID bits, and permission issues using find.',
    tags: ['chmod', 'security', 'find'],
    difficulty: 'intermediate',
    datePublished: '2026-05-18',
    dateModified: '2026-05-22',
  },
  {
    slug: 'monitor-cpu-ram-usage',
    title: 'Monitor CPU and RAM Usage',
    description:
      'Shell scripts to log and alert on CPU and memory usage using top, free, and awk.',
    tags: ['monitor', 'system', 'awk'],
    difficulty: 'intermediate',
    datePublished: '2026-05-19',
    dateModified: '2026-05-22',
  },
  {
    slug: 'bash-send-email-alert',
    title: 'Send Email Alerts from Bash',
    description:
      'Send email alerts from bash scripts using mailx, sendmail, or curl with SMTP.',
    tags: ['email', 'alert', 'mailx'],
    difficulty: 'intermediate',
    datePublished: '2026-05-20',
    dateModified: '2026-05-22',
  },
  {
    slug: 'mysql-database-backup',
    title: 'MySQL Database Backup Script',
    description:
      'Automated mysqldump backup with timestamps, compression, and cron scheduling.',
    tags: ['mysql', 'backup', 'cron-ready'],
    difficulty: 'intermediate',
    datePublished: '2026-05-21',
    dateModified: '2026-05-22',
  },
  {
    slug: 'ssh-key-setup-script',
    title: 'SSH Key Setup Script',
    description:
      'Generate, deploy, and configure SSH keys with ssh-keygen and ssh-copy-id.',
    tags: ['ssh', 'security', 'keys'],
    difficulty: 'intermediate',
    datePublished: '2026-05-22',
    dateModified: '2026-05-22',
  },
  {
    slug: 'restart-service-if-stopped',
    title: 'Restart a Service If It Stopped',
    description:
      'Use systemctl and bash to automatically restart stopped services and log the event.',
    tags: ['systemd', 'monitor', 'cron-ready'],
    difficulty: 'intermediate',
    datePublished: '2026-05-22',
    dateModified: '2026-05-22',
  },
];

export function getSnippetBySlug(slug: string): SnippetMeta | undefined {
  const snippet = snippets.find((s) => s.slug === slug);
  if (!snippet) {
    return undefined;
  }

  return {
    ...snippet,
    publishedTime:
      snippet.publishedTime ??
      snippet.datePublished ??
      DEFAULT_PUBLISHED_TIME,
    modifiedTime:
      snippet.modifiedTime ?? snippet.dateModified ?? DEFAULT_MODIFIED_TIME,
  };
}

export function getAllSlugs(): string[] {
  return snippets.map((snippet) => snippet.slug);
}

export function getSnippetsByDifficulty(
  level: SnippetMeta['difficulty'],
): SnippetMeta[] {
  return snippets.filter((snippet) => snippet.difficulty === level);
}

export function getSnippetsByTag(tag: string): SnippetMeta[] {
  return snippets.filter((snippet) => snippet.tags.includes(tag));
}

export function getRelatedSnippets(
  currentSlug: string,
  count: number,
): SnippetMeta[] {
  const current = getSnippetBySlug(currentSlug);
  if (!current) {
    return [];
  }

  const targetCount = Math.min(count, snippets.length - 1);
  const others = snippets.filter((snippet) => snippet.slug !== currentSlug);
  const sameDifficulty = others.filter(
    (snippet) => snippet.difficulty === current.difficulty,
  );
  const otherDifficulty = others.filter(
    (snippet) => snippet.difficulty !== current.difficulty,
  );

  const result: SnippetMeta[] = [];

  for (const snippet of sameDifficulty) {
    if (result.length >= targetCount) {
      break;
    }
    result.push(snippet);
  }

  for (const snippet of otherDifficulty) {
    if (result.length >= targetCount) {
      break;
    }
    result.push(snippet);
  }

  return result;
}
