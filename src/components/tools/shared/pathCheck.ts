// Pure helpers for the PATH debugger. No React, so scripts/check-path-debugger.mjs can run them in node.

// Single-quote for bash: every character is literal except ' itself, closed and reopened as '\''.
export function shQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

// Runs in the visitor's own shell against their live $PATH, so "missing" there is a real disk check.
// The trailing ':' makes read -d: see every entry, including an empty last one.
export const PATH_CHECK_COMMAND =
  'while IFS= read -r -d: d; do if [[ -z $d ]]; then echo "empty entry: searches the current directory"; elif [[ $d != /* ]]; then echo "relative: $d"; elif [[ ! -d $d ]]; then echo "missing: $d"; fi; done <<< "$PATH:"';

// Keeps only the entries that exist as directories on the machine where it runs, in their original order.
export function buildKeepExisting(entries: string[]): string {
  if (entries.length === 0) return '';
  const list = entries.map(shQuote).join(' ');
  return `clean=; for d in ${list}; do [[ -d $d ]] && clean+="\${clean:+:}$d"; done; export PATH="$clean"`;
}

// Finds the startup-file line that adds each entry, so a duplicate can be removed at its source.
export const PATH_SOURCES_COMMAND =
  "grep -nE '(^|[^A-Za-z_])PATH=' ~/.bashrc ~/.bash_profile ~/.bash_login ~/.profile ~/.zshrc ~/.zprofile /etc/environment /etc/profile /etc/bash.bashrc /etc/profile.d/*.sh 2>/dev/null";
