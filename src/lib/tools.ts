export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolMeta {
  slug: string;
  component: string;
  title: string;
  description: string;
  quickAnswer: string;
  category: string;
  datePublished: string;
  dateModified: string;
  howToUse: string[];
  faqs: ToolFaq[];
  relatedSnippets?: string[];
}

export const tools: ToolMeta[] = [
  {
    slug: 'bash-exit-code-lookup',
    component: 'BashExitCodeLookup',
    datePublished: '2026-06-02',
    dateModified: '2026-06-06',
    title: 'Bash Exit Code Lookup',
    description:
      'An unhandled exit code hides why a bash script failed and lets errors cascade silently into data loss. Enter any code 0-255 for the plain-English meaning, causes, and a copy-paste error handler.',
    quickAnswer:
      'Every bash command exits with a status code stored in `$?`. Zero means success; any non-zero value signals failure. When a cron job dies at 3am with no terminal attached, that number is often the only clue about what broke. Code 1 is a generic failure, 127 means the shell could not find the binary in `$PATH`, 130 means the process received SIGINT from Ctrl+C, and 137 typically means the Linux OOM killer sent SIGKILL. Ignoring `$?` lets a failed `cd` or `mkdir` cascade into commands running against the wrong directory. This browser tool maps any integer from 0 through 255 to a plain-English label, common causes, and representative commands that return that code. Type a number, browse the full table, or click Copy Handler to paste a trap block that prints the failing line and exits non-zero. The lookup runs entirely client-side — no install, no login, no data sent to a server.',
    category: 'reference',
    howToUse: [
      'Type any exit code number (0–255) into the search field.',
      'The tool returns the standard meaning, common shell and OS causes, and context for that code.',
      'Click "Copy Handler" to get a ready-to-paste error handler snippet for your script.',
      'Use the browse mode to scan all codes without searching.',
    ],
    faqs: [
      {
        question: 'What does exit code 1 mean in bash?',
        answer:
          'Exit code 1 is a general error — the command failed for an unspecified reason. Check stderr for the actual error message. It is the most common non-zero exit code and is used by most utilities to signal failure.',
      },
      {
        question: 'What is exit code 127 in bash?',
        answer:
          'Exit code 127 means "command not found." The shell could not locate the binary in any of the directories listed in $PATH. Check that the command is installed and that its directory is in your PATH.',
      },
      {
        question: 'How do I check the exit code of the last command in bash?',
        answer:
          'Run `echo $?` immediately after the command. This prints the exit code of the most recently executed foreground command. In scripts, capture it with `exit_code=$?` before running anything else.',
      },
      {
        question: 'What exit code means success in bash?',
        answer:
          'Exit code 0 always means success in bash and all POSIX-compliant shells. Any non-zero value signals failure. This convention applies to every command, script, and function in the shell.',
      },
    ],
    relatedSnippets: ['bash-error-handling', 'bash-if-else-examples'],
  },
  {
    slug: 'cron-job-builder',
    component: 'CronJobBuilder',
    datePublished: '2026-06-02',
    dateModified: '2026-06-04',
    title: 'Cron Job Builder',
    description:
      'A wrong cron expression runs jobs at the wrong time or skips them entirely with no error output. Build cron expressions visually and verify the human-readable schedule before saving to crontab.',
    quickAnswer:
      'Cron schedules recurring tasks on Linux using five time fields — minute, hour, day-of-month, month, and weekday — followed by the command to run. A single misplaced asterisk or off-by-one hour value runs your backup at the wrong time or not at all, with no error output from the cron daemon itself. Expressing `0 2 * * 1-5` as weekdays at 2am is easy to misread when you are editing crontab at midnight during an incident. This builder translates your selections into a valid five-field expression and shows a live human-readable summary so you can confirm the schedule before pasting into `crontab -e`. Pick presets for every five minutes, hourly, daily, weekly, or monthly runs, or switch to Custom to set each field. The output includes the full crontab line ready to copy. Works in any modern browser with JavaScript enabled. Pair it with disk monitoring or backup scripts, then schedule them with a line you have visually verified instead of guessing field order from man pages.',
    category: 'builder',
    howToUse: [
      'Select the frequency (every minute, hourly, daily, weekly, monthly) or choose "Custom" to set each field manually.',
      'Adjust the minute, hour, day, month, and weekday fields using the dropdowns or type directly into each field.',
      'The human-readable summary updates live — confirm it matches your intended schedule before copying.',
      'Click "Copy crontab line" and paste it into `crontab -e` on your server. Changes take effect on the next matching time.',
    ],
    faqs: [
      {
        question: 'How do I run a cron job every 5 minutes?',
        answer:
          'Set the minute field to `*/5` and leave the other fields as `*`. The resulting crontab line is `*/5 * * * * /path/to/command`. The builder generates this automatically when you select the "Every 5 minutes" preset.',
      },
      {
        question: 'What is the format for a crontab entry?',
        answer:
          'A crontab line has five time fields followed by the command: minute (0–59), hour (0–23), day of month (1–31), month (1–12), day of week (0–7, where both 0 and 7 are Sunday). Each field accepts numbers, ranges (1-5), lists (1,3,5), or step values (*/2).',
      },
      {
        question: 'How do I edit my crontab?',
        answer:
          'Run `crontab -e` in the terminal. This opens your personal crontab file in the default editor. Paste the generated line, save, and exit. The cron daemon picks up changes immediately — no restart needed.',
      },
      {
        question: 'Can I run a cron job on weekdays only?',
        answer:
          'Yes. Set the day of week field to `1-5` to run Monday through Friday. The builder supports range syntax, so you can also set it to `1,3,5` for Monday, Wednesday, and Friday only.',
      },
    ],
    relatedSnippets: ['disk-space-warning', 'automated-file-backup', 'restart-service-if-stopped'],
  },
  {
    slug: 'chmod-permissions-builder',
    component: 'ChmodPermissionsBuilder',
    datePublished: '2026-06-02',
    dateModified: '2026-06-06',
    title: 'Chmod Permissions Builder',
    description:
      'Wrong file permissions on a web server expose secrets or let compromised scripts overwrite application files. Build chmod commands visually — shows octal, symbolic notation, and the exact chmod command.',
    quickAnswer:
      'Linux file permissions control who can read, write, or execute each file using three groups — owner, group, and other — represented by bits that combine into octal values like 644 or 755. Setting 777 on a web root lets any compromised PHP script overwrite your application. Setting 644 on a directory breaks navigation because directories need the execute bit to be entered. Converting between octal, symbolic notation like `rwxr-xr-x`, and the exact `chmod` command is where mistakes happen during incident response. This builder presents a permission matrix with Owner, Group, and Others checkboxes. Toggling read, write, and execute updates the octal value, symbolic string, and full `chmod` command live in the output panel. Preset buttons cover 644 for static files, 755 for directories and scripts, and 700 for private executables. Copy the complete command or just the mode. Runs entirely in your browser. Use it before deploying to production or when auditing a server where world-writable files could expose credentials.',
    category: 'builder',
    howToUse: [
      'Toggle the read, write, and execute checkboxes for Owner, Group, and Others in the permission matrix.',
      'The octal value and symbolic string (e.g., 755 = rwxr-xr-x) update live in the output box as you click.',
      'Copy the full `chmod 755 filename` command or just the octal value depending on what your script needs.',
      'Use the preset buttons for common patterns: web server files (644), directories (755), private scripts (700).',
    ],
    faqs: [
      {
        question: 'What does chmod 755 mean?',
        answer:
          'chmod 755 gives the owner full read, write, and execute permissions (7), and gives group and others read and execute but not write (5). It is the standard permission for directories and executable scripts on Linux web servers.',
      },
      {
        question: 'What is the difference between chmod 644 and chmod 755?',
        answer:
          'chmod 644 gives the owner read and write (no execute), and group and others read only. It is the correct permission for static files like HTML, CSS, and configuration files. chmod 755 adds execute permission, which is required for scripts and directories.',
      },
      {
        question: 'How do I make a bash script executable?',
        answer:
          'Run `chmod +x script.sh` to add execute permission without changing any other permissions. For a fresh script with no existing permissions, `chmod 755 script.sh` sets the standard owner-executable pattern used for system scripts.',
      },
      {
        question: 'What does the sticky bit do on a directory?',
        answer:
          'When the sticky bit is set on a directory (chmod +t or mode 1755), only the file owner or root can delete or rename files inside it — even if others have write access to the directory. The /tmp directory uses this to prevent users from deleting each other\'s temporary files.',
      },
    ],
    relatedSnippets: ['file-permissions-security', 'ssh-key-setup-script'],
  },
  {
    slug: 'path-debugger',
    component: 'PathDebugger',
    datePublished: '2026-06-02',
    dateModified: '2026-06-06',
    title: 'Bash $PATH Debugger',
    description:
      'Duplicate and missing PATH entries cause command-not-found errors and slow shell startup by scanning dead directories. Paste your PATH to find duplicates, empty entries, and ordering problems.',
    quickAnswer:
      'The `$PATH` environment variable is a colon-separated list of directories the shell searches when you type a command name without a full path. Duplicate entries waste lookup time on every command. Dead directories from uninstalled software slow startup. Missing entries cause exit code 127 even when the binary exists elsewhere on disk. Order matters: the shell uses the first match, so an older `python` in `/usr/bin` wins over a newer one in `/usr/local/bin` if it appears first. This debugger splits your pasted PATH into one directory per line, flags duplicates in amber, highlights empty entries in red, and outputs a deduplicated string you can paste into `~/.bashrc` or `~/.zshrc`. Run `echo $PATH`, paste the result, and review before editing your shell profile. No data leaves your browser. Use it when command-not-found errors appear after installing software, when CI builds behave differently from your laptop, or when cleaning up a PATH bloated by years of manual exports across profile files.',
    category: 'debug',
    howToUse: [
      'Run `echo $PATH` in your terminal and paste the output into the input field.',
      'The tool splits the colon-separated PATH string and lists each directory as a separate entry.',
      'Review the output for duplicates (shown in amber) and empty entries (shown in red) that waste lookup time.',
      'Copy the cleaned PATH string with duplicates removed and add it to your ~/.bashrc or ~/.zshrc.',
    ],
    faqs: [
      {
        question: 'How do I see my current $PATH?',
        answer:
          'Run `echo $PATH` in the terminal. It prints all directories separated by colons. For a more readable format, run `echo $PATH | tr ":" "\\n"` to list each directory on its own line.',
      },
      {
        question: 'Why does PATH order matter in bash?',
        answer:
          'When you run a command, the shell searches PATH directories left to right and uses the first binary it finds. If you have two versions of a tool installed in different directories, the one in the earlier PATH entry wins. This is why putting your local bin directories first is important.',
      },
      {
        question: 'How do I permanently add a directory to $PATH?',
        answer:
          'Add `export PATH="/your/dir:$PATH"` to ~/.bashrc (bash) or ~/.zshrc (zsh). Then run `source ~/.bashrc` to apply changes to the current session. New terminal sessions will pick it up automatically.',
      },
      {
        question: 'What causes "command not found" errors in bash?',
        answer:
          'The binary is either not installed, or its directory is missing from $PATH. Paste your PATH into this tool to check whether the expected directory is present. If the directory is there, verify the binary exists with `which commandname` or `ls /expected/path/`.',
      },
    ],
    relatedSnippets: ['bash-error-handling', 'bash-if-else-examples'],
  },
  {
    slug: 'bash-boilerplate-generator',
    component: 'BashBoilerplateGenerator',
    datePublished: '2026-06-02',
    dateModified: '2026-06-06',
    title: 'Bash Boilerplate Generator',
    description:
      'A bash script without error handling silently continues after failures and leaves systems in a broken partial state. Generates a production-ready template with set -euo pipefail, traps, and argument parsing.',
    quickAnswer:
      'A bash script without guardrails keeps running after failures. A mistyped `cd` followed by `rm -rf *` in the wrong directory is the textbook disaster that `set -euo pipefail` prevents. Writing traps, argument parsing, and help text from scratch on every new script wastes time and invites inconsistent error handling across your automation. This generator produces a complete `.sh` template with toggles for strict mode, logging, `getopts` flag parsing, long-option handling, and `--help` output. Enter a script name and one-line purpose; those values populate header comments and usage text. Click Generate Script, copy the output, save as `yourscript.sh`, and run `chmod +x`. The templates include cleanup traps on EXIT, named variables instead of magic numbers, and explicit non-zero exits on failure. Generation happens entirely client-side. Use it when starting a cron job, deployment hook, or maintenance script so safe defaults are in place before you write the business logic.',
    category: 'generator',
    howToUse: [
      'Toggle the features you need: strict error handling (set -euo pipefail), logging, argument parsing, or --help output.',
      'Enter your script name and a one-line description — these appear in comments and the --help text.',
      'Click "Generate Script" to get the complete .sh template in the output panel.',
      'Copy the script, save as yourscript.sh, run `chmod +x yourscript.sh`, and replace the placeholder logic with your own.',
    ],
    faqs: [
      {
        question: 'What does `set -euo pipefail` do in bash?',
        answer:
          '`set -e` exits the script immediately on any command error. `set -u` treats references to undefined variables as errors instead of silently using an empty string. `set -o pipefail` makes a pipeline fail if any command in the pipe fails, not just the last one. Together they prevent scripts from silently continuing after a failure.',
      },
      {
        question: 'Why do bash scripts need a boilerplate?',
        answer:
          'Without proper error handling, a bash script will keep running after a failure and leave your system in a broken or partial state. A boilerplate enforces safe defaults upfront so you only need to write the logic for your actual task, not the error handling scaffolding.',
      },
      {
        question: 'How do I add argument parsing to a bash script?',
        answer:
          'Use `getopts` for single-character flags like `-v` and `-f filename`. For long flags like `--verbose` or `--file`, use a `while` loop with a `case` statement on `$1` and `shift`. The generator outputs both patterns ready to customize.',
      },
      {
        question: 'Are the generated scripts safe to use in production?',
        answer:
          'Yes. The templates follow the same conventions used in production Linux scripts: `set -euo pipefail`, cleanup traps on EXIT, explicit non-zero exit codes on failure, and named variables instead of positional magic numbers. Review and test any generated script before running it in your environment.',
      },
    ],
    relatedSnippets: ['bash-error-handling'],
  },
  {
    slug: 'rsync-command-builder',
    component: 'RsyncCommandBuilder',
    datePublished: '2026-06-06',
    dateModified: '2026-06-06',
    title: 'Rsync Command Builder',
    description:
      'A wrong rsync flag silently overwrites destination files or skips critical data with no error output. Build rsync commands visually — toggle archive, compress, delete, dry-run, SSH, and exclude patterns with a live preview.',
    quickAnswer:
      'rsync synchronizes directories locally or over SSH, transferring only changed blocks after the initial run. The wrong flag combination silently deletes destination files with `--delete`, skips permission preservation without `-a`, or overwrites production data without a dry-run preview. Remote backups need `-e ssh`, trailing slashes change whether the directory itself or its contents are copied, and exclude patterns must be repeated per rule or loaded from a file. This builder takes source and destination paths, toggles archive mode, compression, delete, partial resume, dry-run, and SSH transport, then assembles the full command in a live preview panel. Add comma-separated exclude patterns for `*.log`, `.git`, or `node_modules` without memorizing flag order. Click Copy Command to paste into your terminal. Always enable dry-run before `--delete` on a mirror job — deleted files do not come back. Runs in your browser with no account. Pair with the rsync remote backup snippet for cron scheduling and SSH key setup.',
    category: 'builder',
    howToUse: [
      'Enter the source path (local directory) and the destination (local path or user@host:/path for remote).',
      'Toggle the options you need: archive mode, compression, --delete, dry-run, partial resume, and SSH transport.',
      'Add comma-separated exclude patterns to skip files like *.log, .git, or node_modules.',
      'The rsync command updates live in the output panel. Click "Copy Command" to paste it into your terminal.',
    ],
    faqs: [
      {
        question: 'What does rsync -avz do?',
        answer:
          'The -a flag enables archive mode (preserves permissions, timestamps, symlinks, and directory structure). The -v flag shows verbose output so you can see which files are transferred. The -z flag compresses data during transfer to save bandwidth. Together they form the most common rsync invocation for backups.',
      },
      {
        question: 'How do I rsync to a remote server over SSH?',
        answer:
          'Use the format: rsync -avz -e ssh /local/path/ user@host:/remote/path/. The -e ssh flag tells rsync to use SSH as the transport. Make sure SSH key authentication is set up to avoid password prompts in automated scripts.',
      },
      {
        question: 'What does --delete do in rsync?',
        answer:
          'The --delete flag removes files on the destination that no longer exist in the source. This makes the destination an exact mirror. Always run with --dry-run first to preview deletions before they happen — deleted files cannot be recovered.',
      },
      {
        question: 'How do I exclude files from rsync?',
        answer:
          'Use --exclude for each pattern: rsync -av --exclude="*.log" --exclude=".git" /src/ /dest/. Patterns support wildcards. For complex exclusions, use --exclude-from=file.txt with one pattern per line.',
      },
    ],
    relatedSnippets: ['rsync-remote-backup', 'automated-file-backup'],
  },
  {
    slug: 'grep-pattern-builder',
    component: 'GrepPatternBuilder',
    datePublished: '2026-06-07',
    dateModified: '2026-06-07',
    title: 'grep Pattern Builder',
    description:
      'A wrong grep flag silently matches the wrong files or swallows error output with no warning. Build the exact grep command you need — recursive, case-insensitive, with context lines — and get a plain-English explanation for every output.',
    quickAnswer:
      'grep searches file contents for a regex or string pattern, returning every matching line by default. The wrong flag combination lets errors hide in plain sight: omitting -r on a directory finds nothing, missing -i causes case-sensitive mismatches that look like absent log entries, and running without -n makes it impossible to jump directly to the failing line number in a large file. On a busy server generating gigabytes of logs, knowing whether to use -c (count matches), -l (list files), or -q (exit code only) determines whether a search takes seconds or minutes. This builder takes a search pattern, file path, and optional file type filter, then assembles the complete grep command live as you toggle flags. It auto-enables -r when the path looks like a directory, suppresses -n when -c or -l override it, and generates correct --include flags from comma-separated file extensions. Each output includes a plain-English explanation of exactly what the command will do. Runs entirely in your browser with no install.',
    category: 'builder',
    howToUse: [
      'Enter the search pattern — any string or regex, e.g. "error|critical" or "[0-9]{3} ".',
      'Set the file path or glob pattern, e.g. /var/log/ for all logs or src/**/*.py for Python source files.',
      'Toggle flags: -r for recursive, -i for case-insensitive, -n for line numbers, -c to count, -l for filenames only.',
      'Copy the generated command and paste it into your terminal. The plain-English explanation below the output confirms what the command will do before you run it.',
    ],
    faqs: [
      {
        question: 'How do I search all files in a directory recursively with grep?',
        answer:
          'Use grep -r "pattern" /path/to/dir/. The -r flag tells grep to descend into subdirectories. Add -i for case-insensitive matching and -n to see line numbers in results. For large log directories, add --include="*.log" to avoid searching binary files.',
      },
      {
        question: 'What is the difference between grep and egrep?',
        answer:
          'egrep is equivalent to grep -E and enables Extended Regular Expressions (ERE). With ERE you can use +, ?, |, and () without backslashes. For example, grep -E "error|warning" matches either word without escaping the pipe. Modern systems alias egrep to grep -E.',
      },
      {
        question: 'How do I use grep to find files containing a pattern without printing the lines?',
        answer:
          'Use grep -l "pattern" /path/. The -l flag prints only the names of files that contain a match, one per line. Combine with xargs to act on those files: grep -rl "TODO" src/ | xargs wc -l counts lines in every file containing TODO.',
      },
      {
        question: 'How do I show lines before and after a grep match?',
        answer:
          'Use -B N to show N lines before the match and -A N for N lines after. For example, grep -B 2 -A 3 "error" app.log shows 2 lines before and 3 lines after every error line. Use -C N as shorthand for equal before-and-after context.',
      },
    ],
    relatedSnippets: ['search-files-for-text-grep', 'delete-old-log-files'],
  },
  {
    slug: 'shellcheck-error-decoder',
    component: 'ShellcheckErrorDecoder',
    datePublished: '2026-06-02',
    dateModified: '2026-06-06',
    title: 'ShellCheck Error Decoder',
    description:
      'ShellCheck warnings that go unfixed become the exact edge-case bugs that break in production on unexpected input. Enter any SC error code for the rule name, plain-English explanation, and a before/after fix example.',
    quickAnswer:
      'ShellCheck analyzes bash scripts for mistakes that work on happy-path input but fail on edge cases — unquoted variables, unreachable commands, deprecated syntax, and pipelines that hide errors. SC2086 alone appears in thousands of production scripts: an unquoted `$var` splits on whitespace and expands globs, breaking filenames with spaces. Reading the raw rule text in terminal output requires context switching between the error code, the wiki, and your editor. This decoder accepts any SC code such as SC2086, returns the rule name, a plain-English explanation of what is wrong, why it matters in production, and a before/after code example showing the fix. Click Copy Fix to paste the corrected line directly. Use it during code review, while clearing CI ShellCheck gates, or when onboarding juniors who need the rationale behind each warning, not just the flag name. Lookup runs client-side with no login. Fixing warnings before deploy prevents the exact failures ShellCheck was designed to catch — silent breakage on unexpected input.',
    category: 'reference',
    howToUse: [
      'Paste a ShellCheck error code (e.g., SC2086) into the search field, or type the four-digit number directly.',
      'The tool displays the full rule name, a plain-English explanation of what is wrong, and why it matters.',
      'Review the before/after code example to see exactly what change ShellCheck expects.',
      'Click "Copy Fix" to get the corrected line for your script, then run ShellCheck again to confirm the warning is resolved.',
    ],
    faqs: [
      {
        question: 'What is ShellCheck?',
        answer:
          'ShellCheck is an open-source static analysis tool for bash and sh scripts. It detects common mistakes — unquoted variables, incorrect conditionals, portability issues, and deprecated syntax — before they cause failures in production. It is available as a CLI tool and integrates with most editors.',
      },
      {
        question: 'How do I run ShellCheck on my script?',
        answer:
          'Install ShellCheck with `apt install shellcheck` on Debian/Ubuntu or `brew install shellcheck` on macOS. Then run `shellcheck script.sh`. For CI pipelines, ShellCheck exits non-zero if any warnings are found, making it easy to enforce as a gate.',
      },
      {
        question: 'What does ShellCheck SC2086 mean?',
        answer:
          'SC2086 warns that a variable is not double-quoted, which exposes it to word splitting and glob expansion. `echo $var` should be `echo "$var"`. If $var contains spaces or special characters, the unquoted version breaks silently in ways that are hard to debug.',
      },
      {
        question: 'Why does ShellCheck flag my script if it works fine?',
        answer:
          'ShellCheck warns about patterns that work in normal cases but fail in edge cases — variables with spaces, filenames with special characters, or pipelines that swallow errors. Each warning is a real bug risk. The script appears to work until it encounters unexpected input.',
      },
    ],
    relatedSnippets: ['bash-error-handling'],
  },
  {
    slug: 'bash-trap-builder',
    component: 'BashTrapBuilder',
    title: 'Bash trap & Signal Handler Builder',
    description:
      'A script that exits without a trap leaves temp files, lock files, and background jobs behind every time it crashes. Build your trap block visually — pick signals, choose cleanup actions, copy the result.',
    quickAnswer:
      'Select signals (EXIT, ERR, INT, TERM) and cleanup actions, then copy the generated trap block into your script header.',
    category: 'builder',
    datePublished: '2026-06-10',
    dateModified: '2026-06-10',
    howToUse: [
      'Select the signals you want to trap in panel 01.',
      'Choose cleanup actions (temp files, lock files, background jobs) in panel 02.',
      'Toggle per-signal vs. combined handler style and the set -euo pipefail header in panel 03.',
      'Copy the trap block only, or the full script header, from panel 04.',
      'Paste into your script immediately after the shebang and set -euo pipefail line.',
    ],
    faqs: [
      {
        question: 'What is the difference between trap EXIT and trap ERR in bash?',
        answer:
          'EXIT fires every time the script exits, regardless of why — success, failure, or Ctrl+C. ERR fires only when a command returns a non-zero exit code, and only when set -e is active. For cleanup that must always run, use EXIT. For logging failures at the exact line they occur, use ERR.',
      },
      {
        question: 'Should I use single or double quotes in a bash trap statement?',
        answer:
          'Single quotes in most cases. With double quotes, variables expand immediately when the trap line is parsed, capturing their value at that moment. With single quotes, expansion happens when the trap fires, which is usually what you want. Exception: if you want to capture the current value of $TMPFILE at trap-definition time, double quotes are correct.',
      },
      {
        question: 'Will trap EXIT run if my script calls exit 1?',
        answer:
          'Yes. EXIT fires on any exit, including explicit exit 1, set -e failures, and SIGTERM. The only way to prevent a trap from running is to kill the script with SIGKILL (kill -9), which cannot be trapped.',
      },
      {
        question: 'How do I pass the exit code to my trap handler so I can log success vs failure?',
        answer:
          'Capture $? as the first line inside your handler function: local exit_code=$?. After that point $? reflects the cleanup commands themselves, so capture it immediately on entry.',
      },
      {
        question: 'Does trap work with set -euo pipefail?',
        answer:
          'Yes, and they complement each other. set -e causes the ERR trap to fire on any non-zero exit code. set -u exits with code 1 on unbound variables, triggering the EXIT trap. set -o pipefail propagates pipe failures through the ERR trap. The combination gives complete coverage.',
      },
    ],
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
