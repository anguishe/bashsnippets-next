<!-- SCHEDULED on CoderLegion 2026-09-21 as https://coderlegion.com/28018 - publishes Thu 2026-09-24 08:00 CDT, same minute as dev.to #03. Editing this file does NOT reach CoderLegion: edit the post there too. -->

# I sent my report script SIGTERM mid-write. Yesterday's output survived intact.

A script that writes straight to the path a consumer reads can die halfway and leave a torn file that everything downstream loads as complete. No error appears anywhere, because the only process that failed is gone. I tested the fix the unfriendly way on bash 5.3.9: a CSV generator with a `sleep 30` planted between rows, killed with SIGTERM one second in.

```bash
TMP_FILE=$(mktemp)
cleanup() { local code=$?; rm -f "$TMP_FILE"; exit "$code"; }
trap cleanup EXIT
generate_rows > "$TMP_FILE"
mv "$TMP_FILE" "$FINAL_PATH"
```

Exit 143, which is 128 plus signal 15. The temp file was gone, and `out.csv` still held the previous run's three complete lines. Stale is something monitoring can see. Torn is not.

`EXIT` fires on normal completion, an explicit `exit 1`, a `set -e` abort and after a handled signal, which is why this is five lines instead of twenty. And because `mv` on one filesystem is atomic, being half-written and being at the published path are never true at once. Even `kill -9`, which no trap catches, cannot publish a torn file.

The ordering is the part people move. I ran four handler variants against a script ending in `exit 3`, and only one exited 0: `rm -f` first, then `local code=$?`. It captured rm's success and laundered the failure. Capture first, clean second, exit last.

The complete script, subshell scoping rules and a line-by-line breakdown are on the [trap cleanup page for temp files and atomic writes](https://bashsnippets.xyz/snippets/bash-trap-cleanup).
