<!-- NOT SCHEDULED. Wave 2 #21 - planned Thu 2026-12-03 08:00 CST (14:00Z), same minute as dev.to #21. Numbers from docker system df re-run on this box 2026-09-28 (Docker 28.5.2, no sudo); summary rows only, no names. No prune was run. -->

# Read the RECLAIMABLE column before docker system prune

The standard fix for a full Docker host is `docker system prune -a`, usually suggested before anyone has measured. I measured first on my own laptop, which runs a dozen long-lived containers:

```text
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          15        14        10.51GB   170.3MB (1%)
Containers      15        12        74.49MB   94.31kB (0%)
Local Volumes   4         3         1.838GB   40.37MB (2%)
Build Cache     0         0         0B        0B
```

About 12.4 GB held, about 210 MB reclaimable. Docker was not what was filling that disk, and a blanket prune would have bought a long re-pull the next time a stopped container started.

`docker system df -v` added a detail the summary hides. Three containers sat in Exited, and the two images only they used came to 712 MB. An exited container still references its image, and Docker never removes a referenced image, so an image prune cannot touch those until the containers go. That is why order matters on a box that does need cleaning: containers first, then images with `--filter "until=720h"` as a seatbelt, then volumes, then build cache. `docker volume prune` is the one step that deletes data rather than cache, so read `docker volume ls` before it.

Measure, prune in reference order, measure again. The confirmation prompt, the before/after report and cron lines are in [the Docker cleanup script](https://bashsnippets.xyz/snippets/docker-prune-cleanup).
