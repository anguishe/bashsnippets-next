export interface ShellCheckEntry {
  code: string;
  severity: 'error' | 'warning' | 'info' | 'style';
  category: string;
  title: string;
  explanation: string;
  before: string;
  after: string;
}

export const SC_DATABASE: Record<string, ShellCheckEntry> = {
  SC2086: {
    code: 'SC2086', severity: 'info', category: 'Quoting',
    title: 'Double quote to prevent globbing and word splitting',
    explanation: 'Unquoted variables are word-split and glob-expanded by the shell. Wrap them in double quotes so spaces and wildcards in the value are preserved.',
    before: 'rm $file',
    after: 'rm "$file"',
  },
  SC2034: {
    code: 'SC2034', severity: 'warning', category: 'Variables',
    title: 'Variable appears unused',
    explanation: 'ShellCheck sees a variable assignment that is never read. Export it, use it later, or remove it if it is dead code.',
    before: 'MY_VAR="hello"',
    after: 'export MY_VAR\necho "$MY_VAR"',
  },
  SC2046: {
    code: 'SC2046', severity: 'warning', category: 'Quoting',
    title: 'Quote this to prevent word splitting',
    explanation: 'Command substitution output is split into separate words when unquoted. Quote it or use a safer pattern like find or a loop with read.',
    before: 'files=$(ls *.txt)\nrm $files',
    after: 'rm -- *.txt  # or use find',
  },
  SC2155: {
    code: 'SC2155', severity: 'warning', category: 'Variables',
    title: 'Declare and assign separately to avoid masking return values',
    explanation: 'Combining local/var declaration with command substitution hides the exit status of the command. Declare first, then assign on the next line.',
    before: 'local var=$(command)',
    after: 'local var\nvar=$(command)',
  },
  SC2154: {
    code: 'SC2154', severity: 'warning', category: 'Variables',
    title: 'Variable is referenced but not assigned',
    explanation: 'The script uses a variable that was never set in this scope. Assign a default value or ensure it is exported from a parent shell.',
    before: 'echo "$UNSET_VAR"',
    after: 'UNSET_VAR="default"\necho "$UNSET_VAR"',
  },
  SC2164: {
    code: 'SC2164', severity: 'warning', category: 'Logic',
    title: 'Use cd ... || exit in case cd fails',
    explanation: 'If cd fails, the script keeps running in the wrong directory. Add || exit so a failed cd stops execution immediately.',
    before: 'cd /some/dir',
    after: 'cd /some/dir || exit 1',
  },
  SC2006: {
    code: 'SC2006', severity: 'style', category: 'Style',
    title: 'Use $(...) notation instead of legacy backticks',
    explanation: 'Backticks are hard to nest and easy to misread. Modern $(...) command substitution is clearer and safer to compose.',
    before: 'files=`ls`',
    after: 'files=$(ls)',
  },
  SC2115: {
    code: 'SC2115', severity: 'warning', category: 'Logic',
    title: 'Use "${var:?}" to ensure this never expands to /*',
    explanation: 'An empty variable in a path like "/$DIR/" becomes "/" and can wipe the whole filesystem. Use ${var:?} to abort if the variable is unset or empty.',
    before: 'rm -rf "/$DIR/"',
    after: 'rm -rf "/${DIR:?}/"',
  },
  SC2162: {
    code: 'SC2162', severity: 'info', category: 'Style',
    title: 'read without -r will mangle backslashes',
    explanation: 'Plain read treats backslashes as escape characters. Use read -r when you need the line exactly as typed, especially for paths and regex.',
    before: 'read line',
    after: 'read -r line',
  },
  SC2016: {
    code: 'SC2016', severity: 'info', category: 'Quoting',
    title: "Expressions don't expand in single quotes",
    explanation: 'Single quotes preserve every character literally, so $USER stays as the text "$USER". Use double quotes when you want variable expansion.',
    before: "echo 'Hello $USER'",
    after: 'echo "Hello $USER"',
  },
  SC2035: {
    code: 'SC2035', severity: 'info', category: 'Quoting',
    title: 'Use ./*glob* or -- *glob* so names with dashes won\'t become options',
    explanation: 'A filename starting with - can be parsed as a command option. Prefix with ./ or pass -- before the glob so rm treats names as operands.',
    before: 'rm *.txt',
    after: 'rm ./*.txt',
  },
  SC2044: {
    code: 'SC2044', severity: 'warning', category: 'Logic',
    title: 'For loops over find output are fragile',
    explanation: 'Word splitting and globbing break filenames with spaces or special characters. Pipe find -print0 into a while read loop instead.',
    before: 'for f in $(find . -name "*.log"); do',
    after: 'find . -name "*.log" -print0 | while IFS= read -r -d "" f; do',
  },
  SC2236: {
    code: 'SC2236', severity: 'style', category: 'Style',
    title: 'Use -n instead of ! -z',
    explanation: 'Testing for a non-empty string with [ -n "$var" ] is clearer and more idiomatic than the double-negative [ ! -z "$var" ].',
    before: 'if [ ! -z "$var" ]; then',
    after: 'if [ -n "$var" ]; then',
  },
  SC2181: {
    code: 'SC2181', severity: 'style', category: 'Style',
    title: 'Check exit code directly with if mycmd, not through $?',
    explanation: '$? reflects the last command, which may not be the one you checked if anything ran in between. Test the command directly in the if condition.',
    before: 'mycmd\nif [ $? -eq 0 ]; then',
    after: 'if mycmd; then',
  },
  SC2002: {
    code: 'SC2002', severity: 'style', category: 'Style',
    title: 'Useless cat',
    explanation: 'Piping a file through cat adds a process for no benefit. Pass the filename directly to grep, awk, sed, or whatever tool you are using.',
    before: 'cat file.txt | grep pattern',
    after: 'grep pattern file.txt',
  },
  SC1091: {
    code: 'SC1091', severity: 'info', category: 'Portability',
    title: 'Not following: source was not found',
    explanation: 'ShellCheck cannot read the sourced file, so it skips analysis inside it. Point ShellCheck at the file with a source= directive or ignore if intentional.',
    before: 'source somefile',
    after: '# shellcheck source=somefile\nsource somefile',
  },
  SC2001: {
    code: 'SC2001', severity: 'style', category: 'Style',
    title: 'See if you can use ${variable//search/replace} instead',
    explanation: 'Simple sed substitutions in a pipeline can be replaced with bash parameter expansion, avoiding a subshell and extra process.',
    before: 'echo "$var" | sed "s/foo/bar/g"',
    after: 'echo "${var//foo/bar}"',
  },
  SC2004: {
    code: 'SC2004', severity: 'style', category: 'Style',
    title: '$/${} is unnecessary on arithmetic variables',
    explanation: 'Inside $(( )), variable names do not need $. Using $ can change how the expression is parsed and cause subtle bugs.',
    before: 'echo $(($n + ${arr[i]}))',
    after: 'echo $((n + arr[i]))',
  },
  SC2009: {
    code: 'SC2009', severity: 'info', category: 'Style',
    title: 'Consider using pgrep instead of grepping ps output',
    explanation: 'Parsing ps with grep is brittle and can match unrelated fields. pgrep finds PIDs by process name in one step when available.',
    before: 'ps ax | grep -v grep | grep "$service" > /dev/null',
    after: 'pgrep -f "$service" > /dev/null',
  },
  SC2012: {
    code: 'SC2012', severity: 'info', category: 'Style',
    title: 'Use find instead of ls to better handle non-alphanumeric filenames',
    explanation: 'ls output is meant for humans, not scripts, and can mangle or hide odd filenames. Use find or a shell array for reliable file lists.',
    before: 'NUMGZ="$(ls -l *.gz | wc -l)"',
    after: "gz_files=(*.gz)\nnumgz=${#gz_files[@]}",
  },
  SC2013: {
    code: 'SC2013', severity: 'info', category: 'Logic',
    title: 'To read lines rather than words, pipe/redirect to a while read loop',
    explanation: 'for x in $(...) splits on words and expands globs, breaking lines with spaces. while IFS= read -r reads one line at a time.',
    before: "for line in $(cat file | grep -v '^ *#')",
    after: "grep -v '^ *#' file | while IFS= read -r line",
  },
  SC2015: {
    code: 'SC2015', severity: 'info', category: 'Logic',
    title: 'Note that A && B || C is not if-then-else. C may run when A is true',
    explanation: 'If A succeeds but B fails, C still runs. That is not the same as if A then B else C — use a proper if statement for branching.',
    before: '[[ $dryrun ]] && echo "Would delete file" || rm file',
    after: 'if [[ $dryrun ]]; then\n  echo "Would delete file"\nelse\n  rm file\nfi',
  },
  SC2029: {
    code: 'SC2029', severity: 'info', category: 'Quoting',
    title: 'Note that, unescaped, this expands on the client side',
    explanation: 'Variables inside double-quoted ssh arguments expand locally before the remote shell sees them. Escape $ or use single quotes for remote expansion.',
    before: 'ssh host "echo $HOSTNAME"',
    after: "ssh host 'echo $HOSTNAME'",
  },
  SC2043: {
    code: 'SC2043', severity: 'warning', category: 'Logic',
    title: 'This loop will only ever run once for a constant value',
    explanation: 'for var in value iterates over one word, not a directory or command output. Expand a glob, variable, or use while read for multiple items.',
    before: 'for var in value',
    after: 'for var in /my/dir/*',
  },
  SC2048: {
    code: 'SC2048', severity: 'warning', category: 'Quoting',
    title: 'Use "$@" (with quotes) to prevent whitespace problems',
    explanation: 'Unquoted $* or ${array[*]} word-splits and globs every argument. "$@" and "${array[@]}" preserve each argument as a separate word.',
    before: 'cp $* ~/dir',
    after: 'cp "$@" ~/dir',
  },
  SC2053: {
    code: 'SC2053', severity: 'warning', category: 'Quoting',
    title: 'Quote the rhs of = in [[ ]] to prevent glob matching',
    explanation: 'An unquoted right-hand side in [[ ]] is treated as a glob pattern, not a literal string. Quote "$b" when comparing two variables.',
    before: '[[ $a = $b ]]',
    after: '[[ $a = "$b" ]]',
  },
  SC2061: {
    code: 'SC2061', severity: 'warning', category: 'Quoting',
    title: 'Quote the parameter to -name so the shell won\'t interpret it',
    explanation: 'The shell expands *.txt before find runs, so find may only search for one filename. Quote the pattern so find receives the glob itself.',
    before: 'find . -name *.txt',
    after: "find . -name '*.txt'",
  },
  SC2071: {
    code: 'SC2071', severity: 'error', category: 'Logic',
    title: '> is for string comparisons. Use -gt instead',
    explanation: '[[ $var > 10 ]] compares strings lexicographically, so "5" can be "greater" than "10". Use -gt, -ge, -lt, or -le for numeric tests.',
    before: 'if [[ $var > 10 ]]; then',
    after: 'if [[ $var -gt 10 ]]; then',
  },
  SC2087: {
    code: 'SC2087', severity: 'info', category: 'Quoting',
    title: 'Quote EOF to make here document expansions happen on the server side',
    explanation: 'An unquoted heredoc delimiter expands variables locally before ssh sends the script. Quote EOF so remote commands expand on the server.',
    before: 'ssh host << EOF\necho "Logged in on $HOSTNAME"\nEOF',
    after: 'ssh host << "EOF"\necho "Logged in on $HOSTNAME"\nEOF',
  },
  SC2088: {
    code: 'SC2088', severity: 'info', category: 'Quoting',
    title: 'Tilde does not expand in quotes. Use $HOME',
    explanation: 'Tilde only expands to your home directory when unquoted. Inside quotes use $HOME or leave ~/ outside the quoted segment.',
    before: 'rm "~/Desktop/$filename"',
    after: 'rm "$HOME/Desktop/$filename"',
  },
};

export const QUICK_CODES = [
  'SC2086', 'SC2034', 'SC2046', 'SC2155', 'SC2154', 'SC2164',
  'SC2006', 'SC2115', 'SC2162', 'SC2016', 'SC2035', 'SC2044',
  'SC2236', 'SC2181', 'SC2002',
];

export const CATEGORIES = ['All', 'Quoting', 'Variables', 'Logic', 'Style', 'Portability'] as const;
