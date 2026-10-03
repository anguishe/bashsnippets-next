---
title: "My Container Cleanup Removed Two Containers. The Next Run Had Nothing to Remove and Exited 1."
published: true
description: "docker rm $(docker ps -aq ...) under set -euo pipefail removed two stopped containers, then failed the next run because the list was empty, and left a volume behind both times. What docker rm skips, and why docker stop takes 10 seconds."
tags: docker, bash, devops, linux
canonical_url: https://bashsnippets.xyz/snippets/docker-remove-all-containers
cover_image: https://bashsnippets.xyz/ogimage.png
---

The script is three lines of real work, written the way most answers online write it, with strict mode on, the way a cleanup script should run. This machine runs real containers, so every demo container here carries a `bsdemo=1` label and every command filters on it. Four containers: two running, two exited, one of the exited ones with an anonymous volume at `/scratch`. Then the script, twice:

```text
$ docker ps -a --filter label=bsdemo=1 --format 'table {{.Names}}\t{{.Status}}'
NAMES          STATUS
demo-migrate   Exited (0) Less than a second ago
demo-job       Exited (0) Less than a second ago
demo-db        Up Less than a second
demo-web       Up 1 second
$ cat clean-containers.sh
#!/bin/bash
# nightly: remove finished job containers
set -euo pipefail
docker rm $(docker ps -aq --filter label=bsdemo=1 --filter status=exited)
echo "removed finished containers"
$ ./clean-containers.sh
83e39033b709
6d7ce95e7af5
removed finished containers
exit=0
$ ./clean-containers.sh
docker: 'docker rm' requires at least 1 argument

Usage:  docker rm [OPTIONS] CONTAINER [CONTAINER...]

See 'docker rm --help' for more information
exit=1
```

The first run did its job. The second run had nothing to do, and that is the run that failed. From cron, the alert fires on the quiet night, the one where everything is fine, and after a few of those nobody reads the alert.

## An empty list is not an empty command

`$(docker ps -aq ...)` printed nothing, so the substitution expanded to nothing, and the line bash ran was `docker rm` with no arguments at all. That is a usage error, exit 1, and `set -e` did what it is for and stopped the script. Strict mode did not cause the failure; it reported it. Without `set -e`, the script would have printed "removed finished containers" after an error, which is worse.

The fix is to stop treating "no containers" as an argument list. GNU `xargs -r` runs nothing when its input is empty:

```text
$ docker ps -aq --filter label=bsdemo=1 --filter status=exited | xargs -r docker rm
exit=0
```

The `--filter` in that line is doing more work than it looks. Without it, `docker ps -aq` lists every container on the host, running or stopped, and the same pipe with `rm -f` takes the database of the project you were not thinking about.

## Why stop took ten seconds, and what rm kept

Then I cleared the rest by hand, and two more things went differently than the one-liner suggests. A fifth container, `demo-init`, from the same image but started with `--init`, was there for comparison:

```text
$ time docker stop demo-web
demo-web

real	0m10.304s
user	0m0.029s
sys	0m0.010s
$ docker inspect demo-web --format '{{.State.ExitCode}}'
137
$ time docker stop demo-init   # same image, started with --init
demo-init

real	0m0.240s
user	0m0.029s
sys	0m0.013s
$ docker inspect demo-init --format '{{.State.ExitCode}}'
143
$ docker rm -f $(docker ps -aq --filter label=bsdemo=1)
0a3eeea5215f
2bba0b8db484
5abd19793234
$ docker volume ls --filter name=bsdemo-data
DRIVER    VOLUME NAME
local     bsdemo-data
```

`docker stop demo-web` took 10.3 seconds and the container exited 137. `docker stop` sends `SIGTERM`, waits 10 seconds, then sends `SIGKILL`, and 137 is 128 + 9, killed. The main process was `sleep`, running as PID 1 in its container, and the kernel does not apply a signal's default action to a namespace's PID 1 when the signal comes from outside it. `sleep` has no handler for `SIGTERM`, so the signal did nothing and Docker waited out the timeout. With `--init`, a small init process sits at PID 1 and forwards the signal, `sleep` is an ordinary child again, and it died of `SIGTERM` in 0.24 seconds: 143, 128 + 15. `docker rm -f` skips the wait by killing at once, which is fine for a throwaway container and wrong for a database you want flushed.

The bottom of the block is what `docker rm` keeps. All three remaining containers are gone, and `demo-db`'s named volume, `bsdemo-data`, is still there, even after `-f`. The script's earlier run left something too: `docker volume ls`, filtered on the ID of the anonymous volume `demo-job` had mounted at `/scratch`, still listed it, because `docker rm` without `-v` keeps anonymous volumes. Both are by design, and neither is mentioned in `docker rm`'s output. Leftover volumes are a separate job for `docker volume ls --filter dangling=true` and `docker volume prune`, done on purpose.

## A cleanup that shows its work

The page's script, `docker-remove-containers.sh`, takes stopped containers only unless you pass `--running`, passes `--filter` straight to `docker ps`, and dry-runs until `--yes`. On two fresh exited containers and one running one, all labelled, the dry run listed `demo-migrate` and `demo-job` with their status and image and exited 1. With `--yes` it printed `✓ removed 2 container(s)` and a line counting the volumes no container uses. Run again with nothing left, it printed `✓ no containers match — nothing to remove` and exited 0. `demo-web`, running, was untouched.

That last run is the one my three-line version failed. Nothing to do should be the quietest night a cleanup script has.

---

The script, the filters, and what to check before deleting anything: https://bashsnippets.xyz/snippets/docker-remove-all-containers

If the goal is disk space rather than containers, [Docker Prune Cleanup](https://bashsnippets.xyz/snippets/docker-prune-cleanup) covers images, build cache and volumes, and the [Bash Exit Code Lookup](https://bashsnippets.xyz/tools/bash-exit-code-lookup) decodes 137 and 143. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 3 #33 - date TBD (page live 2026-10-03; earliest publish 2026-10-10). Outputs: run 2026-10-03 in the session scratchpad (Docker 28.5.2, busybox:1.37 already local, --pull never, bash 5.3.15). Only containers and volumes created for this run, every one labelled bsdemo=1 or named bsdemo-*; all removed afterwards (0 bsdemo containers, bsdemo-data and the anonymous volume deleted). The page's docker-remove-containers.sh copied verbatim from the MDX (ShellCheck 0.11.0 clean). PID-1 signal behaviour stated as documented kernel/Docker behaviour; the timings and exit codes are from the run. -->
