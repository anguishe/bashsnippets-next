export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolMeta {
  slug: string;
  component: string;
  title: string;
  description: string;
  category: string;
  howToUse: string[];
  faqs: ToolFaq[];
  relatedSnippets?: string[];
}

export const tools: ToolMeta[] = [
  {
    slug: 'bash-exit-code-lookup',
    component: 'BashExitCodeLookup',
    title: 'Bash Exit Code Lookup',
    description:
      'Look up any bash exit code 0-255 and get the plain-English meaning, common causes, and generated error handler.',
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
    title: 'Cron Job Builder',
    description:
      'Visual cron expression builder with human-readable schedule output and copy-paste crontab line.',
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
    title: 'Chmod Permissions Builder',
    description:
      'Build chmod commands visually with a permission matrix. Shows octal, symbolic, and command output.',
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
    title: 'Bash $PATH Debugger',
    description:
      'Debug your $PATH variable, find duplicate entries, missing directories, and fix ordering issues.',
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
  },
  {
    slug: 'bash-boilerplate-generator',
    component: 'BashBoilerplateGenerator',
    title: 'Bash Boilerplate Generator',
    description:
      'Generate a production-ready bash script template with error handling, logging, and argument parsing.',
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
    slug: 'shellcheck-error-decoder',
    component: 'ShellcheckErrorDecoder',
    title: 'ShellCheck Error Decoder',
    description:
      'Decode ShellCheck error codes SC1xxx-SC3xxx into plain-English explanations with before/after fix examples.',
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
