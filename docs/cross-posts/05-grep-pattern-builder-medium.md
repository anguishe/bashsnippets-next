# The One-Line Confession in My .bashrc, and the Eleven Days That Put It There

Near the top of my .bashrc sits a one-line confession: `alias grep='grep -E'`. It has survived every cleanup pass since the night I learned that a client's backup had been failing for eleven straight days while my weekly log check kept reporting calm seas.

The setup was ordinary. A $5 VPS, a small nginx site, a nightly cron job tarring the important directories, and a ritual I was quietly proud of: every Monday, `grep "error|failed" /var/log/backup.log`. Empty output meant a good week. I got three empty Mondays in a row — and during all three, the tar job was dying nightly, killed by a permissions change that came in with a logrotate tweak. When the client asked me to roll a page back, the freshest archive that would extract was eleven days stale. The log had recorded `backup failed` every single night. My check had looked straight past it.

Here's the mechanism, because it's the kind of trap that looks impossible until you see it. Default grep speaks Basic Regular Expressions. In BRE, the pipe is not "or" — it's a literal pipe character, the same as `+`, `?`, and parentheses, all of which are plain text unless backslash-escaped. So my pattern wasn't a search for "error" or "failed." It was a search for the exact twelve-character string `error|failed`, which no logger ever writes. Alternation as every modern regex engine does it lives behind `-E`:

```bash
# BRE (default): the pipe is a literal character — matches nothing, exits 1
grep "error|failed" /var/log/backup.log

# ERE: the pipe means OR — the search you actually meant
grep -E "error|failed" /var/log/backup.log
```

What makes this dangerous rather than merely annoying is how grep reports it. Nothing about the BRE version is malformed, so there's no error message. grep exits 1 — the same code it uses for a genuinely clean file — and prints nothing at all. A wrong question and a clean log are indistinguishable from the outside. False negatives beat false positives for damage every time, because a false positive wastes twenty minutes and a false negative closes the case.

The alias was my first response, and it's an honest half-measure at best. Aliases apply to interactive shells only, so the cron jobs that mattered kept their BRE grep. Worse, the alias follows me to no other machine, while the muscle memory it builds follows me everywhere. What I actually needed was a way to see what a grep command would do before believing its output.

That became the grep Pattern Builder. You type a pattern and a path, optionally a comma-separated list of file types (it emits the matching `--include="*.ext"` flags so log searches skip binaries), and flip toggles for the flags that carry real weight: `-i`, `-r`, `-n`, `-v`, `-c`, `-l`, `-w`, `-q`, and `-B`/`-A` context lines. The command assembles live, and beneath it a plain-English sentence states precisely what it will do — recursive or not, case-blind or not, printing lines, counts, filenames, or an exit code alone.

Two details exist specifically because of incidents like mine. First, a regex-engine picker — BRE, `-E`, `-P` — with a note per engine about which metacharacters are literal, plus a warning that `-P` is a GNU extension that macOS and BSD grep reject; the same command drifting between a Debian server and a Mac laptop is this bug's portability cousin. Second, a live tester: paste sample text, including a line you know should match, and it highlights every matching line with a running count. Feed it a real `backup failed` line and the BRE pattern lights up nothing — zero matches out of a line you're staring at is the alarm my Monday ritual never had.

Smaller guardrails ride along. A path that looks like a directory switches `-r` on automatically, since bare grep aimed at a directory declines with "Is a directory" — a refusal that vanishes when stderr is redirected. Turning on `-c`, `-l`, or `-q` drops `-n` from the command, because those flags replace the output format and line numbers become noise.

One unescaped character cost me eleven days of backups and a very uncomfortable email to a client. The command never crashed, never warned, never printed a byte. It answered the question I typed with perfect accuracy — and the question I typed was garbage. The fix worth keeping isn't in my .bashrc. It's checking the question before trusting the silence.

The builder, with the engine notes and the live match tester: https://bashsnippets.xyz/tools/grep-pattern-builder — and the companion Search Files for Text snippet at https://bashsnippets.xyz/snippets/search-files-for-text-grep covers the patterns themselves.

Originally published at https://bashsnippets.xyz/tools/grep-pattern-builder

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Programming, Command Line -->
