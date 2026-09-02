// Registry for the per-code ShellCheck deep dives at /shellcheck/<code>.
// One entry per hand-written page in src/content/shellcheck/<slug>.mdx. Quick Answer
// and FAQ live in that file's frontmatter; this file holds only what the route
// metadata, the sitemap generator (which regex-parses `slug:` / `dateModified:`)
// and the decoder tool's "deep dives" list need. Keep it client-safe: no fs.

export type ShellcheckSeverity = 'error' | 'warning' | 'info' | 'style';

export interface ShellcheckPageLink {
  href: string;
  label: string;
}

export interface ShellcheckPage {
  code: string;
  slug: string;
  severity: ShellcheckSeverity;
  title: string;
  description: string;
  keywords: string[];
  datePublished: string;
  dateModified: string;
  /** Pages on this site where the flagged pattern actually shows up. */
  related: ShellcheckPageLink[];
}

export const shellcheckPages: ShellcheckPage[] = [
  {
    code: 'SC2086',
    slug: 'sc2086',
    severity: 'info',
    title: 'ShellCheck SC2086: Double Quote to Prevent Globbing and Word Splitting',
    description:
      'rm $file with a space in the name deletes two other files and exits 0. What SC2086 catches, the run that proves it, the fix, the variants inside [ ], for loops and arrays, and how to disable it for one line, one file, or only lint for this rule.',
    keywords: [
      'shellcheck sc2086',
      'sc2086',
      'double quote to prevent globbing and word splitting',
      'shellcheck disable sc2086',
      'shellcheck only sc2086',
      'bash unquoted variable',
    ],
    datePublished: '2026-09-01',
    dateModified: '2026-09-01',
    related: [
      { href: '/snippets/bash-for-loop-examples', label: 'Bash For Loop Examples — the loop over ls that splits on spaces' },
      { href: '/snippets/bash-arrays', label: 'Bash Arrays — the fix for lists that contain spaces' },
      { href: '/snippets/bash-if-else-examples', label: 'Bash If/Else Examples — quoting inside [ ]' },
      { href: '/guides/safe-bash-script-template', label: 'The Safe Bash Script Template' },
    ],
  },
  {
    code: 'SC2046',
    slug: 'sc2046',
    severity: 'warning',
    title: 'ShellCheck SC2046: Quote This to Prevent Word Splitting',
    description:
      'chmod 600 $(find . -name "*.key") locked down two files that are not keys and skipped the one that is. What SC2046 catches on unquoted command substitution, the real run, the find -exec and mapfile fixes, the ls and $(dirname $0) variants, and when disabling it is honest.',
    keywords: [
      'shellcheck sc2046',
      'sc2046',
      'quote this to prevent word splitting',
      'command substitution word splitting',
      'shellcheck disable sc2046',
      'bash $(find) spaces in filenames',
    ],
    datePublished: '2026-09-01',
    dateModified: '2026-09-01',
    related: [
      { href: '/snippets/find-duplicate-files', label: 'Find Duplicate Files — the find -print0 | xargs -0 pattern' },
      { href: '/snippets/bash-for-loop-examples', label: 'Bash For Loop Examples — looping over command output safely' },
      { href: '/snippets/bash-read-file-line-by-line', label: 'Read a File Line by Line — while IFS= read -r' },
      { href: '/tools/find-command-builder', label: 'Find Command Builder — -exec and -print0 without guessing' },
    ],
  },
  {
    code: 'SC2063',
    slug: 'sc2063',
    severity: 'warning',
    title: 'ShellCheck SC2063: Grep Uses Regex, but This Looks Like a Glob',
    description:
      "grep -q '*.gz' reports no rotated logs while two sit in the directory, because a leading * is a literal asterisk in a regex. What SC2063 catches, the real run, the anchored-regex and grep -F fixes, the patterns that do not trigger it, and when to disable it.",
    keywords: [
      'shellcheck sc2063',
      'sc2063',
      'grep uses regex but this looks like a glob',
      'grep glob vs regex',
      'grep star pattern not matching',
      'shellcheck disable sc2063',
    ],
    datePublished: '2026-09-01',
    dateModified: '2026-09-01',
    related: [
      { href: '/snippets/search-files-for-text-grep', label: 'Search Files for Text with grep' },
      { href: '/tools/grep-pattern-builder', label: 'grep Pattern Builder — regex vs fixed-string, explained per flag' },
      { href: '/guides/bash-text-processing', label: 'Bash Text Processing: find, grep, sed, and awk' },
      { href: '/snippets/delete-old-log-files', label: 'Delete Old Log Files — the cleanup script this check protects' },
    ],
  },
  {
    code: 'SC2115',
    slug: 'sc2115',
    severity: 'warning',
    title: 'ShellCheck SC2115: Use "${var:?}" to Ensure This Never Expands to /',
    description:
      'rm -rf "$STAGE/$RELEASE/"* with an empty $RELEASE deleted every release in the staging tree and printed "cleaned". What SC2115 catches, the real run, why set -u does not save you from an empty string, the ${var:?} fix that aborts before rm starts, and when to disable it.',
    keywords: [
      'shellcheck sc2115',
      'sc2115',
      'use ${var:?} to ensure this never expands to /',
      'rm -rf empty variable',
      'bash rm -rf safety',
      'shellcheck disable sc2115',
    ],
    datePublished: '2026-09-01',
    dateModified: '2026-09-01',
    related: [
      { href: '/snippets/delete-old-log-files', label: 'Delete Old Log Files — find -delete against a directory variable' },
      { href: '/snippets/bash-trap-cleanup', label: 'Bash trap: Clean Up Temp Files on Exit — rm -rf on a mktemp path' },
      { href: '/snippets/bash-argument-parsing', label: 'Bash Argument Parsing — validating $1 before it reaches rm' },
      { href: '/guides/safe-bash-script-template', label: 'The Safe Bash Script Template — what set -u actually checks' },
    ],
  },
  {
    code: 'SC2154',
    slug: 'sc2154',
    severity: 'warning',
    title: 'ShellCheck SC2154: Variable Is Referenced but Not Assigned',
    description:
      'A one-character typo sent a backup to /site-2026-09-01.tgz instead of the backup directory. What SC2154 catches, why it stays silent for UPPERCASE names, the real run with and without set -u, the : "${var:?}" and ${var:-default} fixes for variables that come from the environment, and how to disable it.',
    keywords: [
      'shellcheck sc2154',
      'sc2154',
      'variable is referenced but not assigned',
      'shellcheck disable sc2154',
      'shellcheck environment variable not assigned',
      'bash unbound variable',
    ],
    datePublished: '2026-09-01',
    dateModified: '2026-09-01',
    related: [
      { href: '/guides/safe-bash-script-template', label: 'The Safe Bash Script Template — set -u and the ERR trap' },
      { href: '/snippets/bash-error-handling', label: 'Bash Error Handling with set -euo pipefail' },
      { href: '/snippets/bash-functions', label: 'Bash Functions — local scope and where variables come from' },
      { href: '/guides/bash-scripts-that-survive-cron', label: 'Bash Scripts That Survive Cron — the empty cron environment' },
    ],
  },
  {
    code: 'SC2034',
    slug: 'sc2034',
    severity: 'warning',
    title: 'ShellCheck SC2034: Variable Appears Unused',
    description:
      'This site\'s own script repo claimed ShellCheck-clean while three scripts carried a CROSS or KEY_BITS nothing read. What SC2034 catches, why an unused variable is usually a typo somewhere else, the real run, the export and _ fixes, and the file-level disable for sourced config files.',
    keywords: [
      'shellcheck sc2034',
      'sc2034',
      'variable appears unused verify use or export',
      'shellcheck disable sc2034',
      'shellcheck unused variable sourced file',
      'bash unused variable',
    ],
    datePublished: '2026-09-01',
    dateModified: '2026-09-01',
    related: [
      { href: '/snippets/bash-functions-arguments', label: 'Bash Functions and Arguments — one of the scripts that tripped it' },
      { href: '/snippets/find-large-files-linux', label: 'Find Large Files in Linux — the other one' },
      { href: '/snippets/ssh-key-setup-script', label: 'SSH Key Setup Script — where KEY_BITS was dead code' },
      { href: '/snippets/bash-argument-parsing', label: 'Bash Argument Parsing — variables that are set but never read' },
    ],
  },
  {
    code: 'SC2016',
    slug: 'sc2016',
    severity: 'info',
    title: "ShellCheck SC2016: Expressions Don't Expand in Single Quotes",
    description:
      'The disk alert that went out read "disk on $HOST is at $USAGE", literally. What SC2016 catches, the real run, the double-quote fix, why awk \'{print $5}\' and ssh host \'du $HOME\' pass but sed and mail -s do not, and the one-line disable for strings that must expand somewhere else.',
    keywords: [
      'shellcheck sc2016',
      'sc2016',
      "expressions don't expand in single quotes",
      'shellcheck disable sc2016',
      'shellcheck sc2016 ssh',
      'bash single quotes variable not expanding',
    ],
    datePublished: '2026-09-01',
    dateModified: '2026-09-01',
    related: [
      { href: '/snippets/bash-send-email-alert', label: 'Send Email Alerts from Bash — the alert string that must expand' },
      { href: '/snippets/bash-slack-webhook-alerts', label: 'Send Slack Alerts from Bash — payload strings built with jq' },
      { href: '/snippets/rsync-remote-backup', label: 'Rsync Remote Backup — commands that expand on the remote host' },
      { href: '/snippets/bash-sed-find-replace', label: 'Find and Replace with sed — $ in sed expressions' },
    ],
  },
];

export function getShellcheckPage(slug: string): ShellcheckPage | undefined {
  return shellcheckPages.find((p) => p.slug === slug.toLowerCase());
}

export function getShellcheckPageByCode(code: string): ShellcheckPage | undefined {
  return shellcheckPages.find((p) => p.code === code.toUpperCase());
}
