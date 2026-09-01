<!-- Posting cadence rule: max 1 CoderLegion post per week. Do not publish this in the same week as any other BashSnippets CoderLegion excerpt. -->

## Three ways a jq one-liner lies to your bash script

Most "the filter looks right but the script misbehaves" bugs come down to three silent failure modes.

First, a missing `-r`. jq outputs JSON by default, so a string arrives with its quotes attached — your variable holds `"web-01"`, quotes included, and a comparison against web-01 never matches. Any value headed into a shell variable, filename, or test wants `-r`.

Second, missing keys don't error. jq emits `null`, which lands in bash as a literal four-character string — non-empty, so `[ -n ]` guards pass and backup-null.tar.gz gets written. The `//` operator supplies a real fallback.

Third, select() quoting. The program sits inside single quotes, so string matches inside it need double quotes:

```bash
jq -r '.items[] | select(.active == true) | .name'
```

Misquote it and nothing fails — select() matches zero elements, prints nothing, and exits 0, so the silence reads as success.

All three share the same fingerprint: exit code zero, plausible output, wrong result. The fastest way I've found to catch them before they ship is building the filter against the actual response: this [interactive jq filter builder with a live in-browser preview](https://bashsnippets.xyz/tools/jq-filter-builder) lets you click through your real JSON to build the path, handles the `-r`, `//`, and select() quoting for you, and shows exactly what the filter emits before anything runs.
