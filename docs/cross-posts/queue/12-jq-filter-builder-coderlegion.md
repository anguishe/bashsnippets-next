<!-- SCHEDULED on CoderLegion 2026-09-21 as https://coderlegion.com/28027 - publishes Tue 2026-10-27 08:00 CDT, same minute as dev.to #12. Editing this file does NOT reach CoderLegion: edit the post there too. -->

## Three ways a jq one-liner lies to your bash script

Most "the filter looks right but the script misbehaves" bugs come down to three silent failure modes.

First, a missing `-r`. jq outputs JSON by default, so a string arrives with its quotes attached — your variable holds `"web-01"`, quotes included, and a comparison against web-01 never matches. Any value headed into a shell variable, filename, or test wants `-r`.

Second, missing keys don't error. jq emits `null`, which lands in bash as a literal four-character string — non-empty, so `[ -n ]` guards pass and backup-null.tar.gz gets written. The `//` operator supplies a real fallback.

Third, select() compares exactly. A value that is almost right matches nothing, and nothing is not an error:

```bash
jq -r '.items[] | select(.active == true) | .name'
```

If the API sends `"active": "true"` as a string, that item is skipped. If you match `"Web-01"` against `"web-01"`, zero elements come back. Either way jq prints nothing and exits 0, so the silence reads as success.

All three share the same fingerprint: exit code zero, plausible output, wrong result. The fastest way I've found to catch them before they ship is building the filter against the actual response: this [interactive jq filter builder with a live in-browser preview](https://bashsnippets.xyz/tools/jq-filter-builder) lets you click through your real JSON to build the path, handles the `-r`, the `//` fallback and select() quoting for you, and shows exactly what the filter emits before anything runs.
