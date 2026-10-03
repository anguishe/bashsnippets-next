<!-- NOT SCHEDULED. Wave 3 #33 - date TBD, same minute as dev.to #33 (page live 2026-10-03; earliest publish 2026-10-10). Canonical /snippets/docker-remove-all-containers. Output run 2026-10-03 in a scratch dir (Docker 28.5.2, busybox:1.37) on labelled demo containers only, all removed afterwards. -->

# The cleanup failed on the night there was nothing to clean

A nightly script with `set -euo pipefail` and one line of real work: `docker rm $(docker ps -aq --filter label=bsdemo=1 --filter status=exited)`. The first run removed two stopped demo containers. The second run:

```text
$ ./clean-containers.sh
docker: 'docker rm' requires at least 1 argument

Usage:  docker rm [OPTIONS] CONTAINER [CONTAINER...]

See 'docker rm --help' for more information
exit=1
```

With nothing to remove, the substitution expanded to nothing and bash ran `docker rm` with no arguments, a usage error. From cron, that is an alert on the one night everything was fine. `docker ps -aq ... | xargs -r docker rm` runs nothing on an empty list and exited 0.

Two more things the one-liner does not tell you. `docker rm` keeps anonymous volumes unless you pass `-v`, and a named volume survived even `docker rm -f`. And `docker stop` on a container whose PID 1 was `sleep` took 10.3 seconds and exited 137: `sleep` has no `SIGTERM` handler, so Docker waited out its timeout and sent `SIGKILL`. The same image started with `--init` stopped in 0.24 seconds with 143.

A script that dry-runs by default, keeps running containers out unless asked, and exits 0 when there is nothing to do is on the [remove all Docker containers page](https://bashsnippets.xyz/snippets/docker-remove-all-containers).
