# The Warning Sat in a Log File While the Disk Filled

The most dangerous script on any of my servers was the one that worked flawlessly. It was a disk check on a small VPS — cron ran it hourly, it read usage off `df`, compared the number to a threshold, and got the answer right every single time. Its output went to a log file. That detail is the whole story.

Because when the disk filled, nothing warned me. Writes bounced, services fell over, and I found out by logging in to a broken machine. One grep later I was staring at the humiliating part: an unbroken column of hourly warning lines, written faithfully through the entire climb. The script had known for hours. It had told a file. Nobody reads that file — including, evidently, me.

I'd treated detection as the whole job when it's half of one. The other half is delivery: getting the finding in front of a human before the consequence arrives. A monitor that writes to a log has relocated the problem, not solved it, because now something has to watch the log — and that something turned out to be the outage.

Delivery, at its smallest, fits in a pipe:

```bash
#!/bin/bash
set -euo pipefail

USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$USAGE" -gt 80 ]; then
  printf 'Disk on %s hit %s%% at %s\n' "$(hostname)" "$USAGE" "$(date '+%F %T')" \
    | mail -s "[ALERT] disk space on $(hostname)" you@example.com
fi
```

Over the threshold, the message lands in an inbox — a place I check dozens of times a day without being asked. The subject carries the hostname, because run this on three servers and an alert that won't say which one is burning is a riddle at the worst possible moment.

Except there's a second silent failure lurking inside the fix, and it has the same shape as the first. `mail` returning zero means the message was accepted by the local mail transfer agent — nothing more. The exit code you can see ends at that handoff; actual delivery is the MTA's job, invisible to your script. On a box with no MTA configured for the outside world, the handoff commonly ends in root's local spool under `/var/mail`: a file, on the same machine, that nobody opens. Which is to say — a log file wearing a costume. The script reports success, and the alert never leaves the building.

Cron makes it worse in its own way. Its stripped-down `PATH` can fail to resolve `mail` at all, and a cron line that discards output swallows even the "command not found." So the only test worth trusting runs end to end: let cron trigger the script, confirm the email reaches your actual inbox, and tail `/var/log/mail.log` to watch what the MTA did with it.

For genuine delivery, the box needs a route out. Debian and Ubuntu's `mailutils` brings an MTA along, and the "Internet Site" install option works where the host may send mail directly. Many can't — cloud providers filter outbound mail, and receiving servers spam-bin unknown senders — which is where an SMTP relay earns its keep. `msmtp` with a Gmail app password takes a few lines of configuration; `curl` can talk SMTP to a relay where installing an MTA isn't on the table. Both replace "handed to the MTA" with "accepted by infrastructure built to deliver."

Then comes the failure mode on the far side of success: too many alerts. A tripped threshold stays tripped, so an hourly check emails the same news twenty-four times a day. Within a week you're skimming those emails, and a skimmed alert channel fails as silently as the log file did — the message that matters is camouflaged among duplicates. The fix is a dedupe sentinel: touch a marker file when an alert goes out, and before sending, check its age. Under twenty-four hours old, suppress; over, send. The check still runs hourly. The repetition doesn't.

That VPS still grows its disk at the same pace. The difference is that the knowledge now travels: threshold trips, email arrives, and the body carries the hostname, the timestamp, and the five biggest directories — enough to fix the problem before it becomes an incident. Identical detection to the version that failed me. All that changed was who got told.

The full script — with the top-disk-consumers alert body, the msmtp Gmail relay config, the 24-hour dedupe guard, and the cron pitfalls that eat alerts — lives here: https://bashsnippets.xyz/snippets/bash-send-email-alert

Alerting is one guard among several for unattended jobs: the Hardened Cron Wrapper Generator (https://bashsnippets.xyz/tools/cron-wrapper-generator) composes it with locking, timeouts, and retries, and Bash Scripts That Survive Cron (https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron) covers the whole discipline. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/bash-send-email-alert

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Sysadmin, Monitoring -->
