<!-- Posting cadence rule: max 1 CoderLegion post per week. Check the last CoderLegion publish date before posting this. -->

# Why your bash email alerts never arrive (and the two-line fix that does)

A monitoring script that writes warnings to a log file isn't alerting anyone — mine logged a filling disk for hours while I found out from the outage. The pattern that fixes it is piping the finding into `mail`:

```bash
echo "Disk on $(hostname) at ${USAGE}% — $(date '+%F %T')" \
  | mail -s "[ALERT] disk space on $(hostname)" you@example.com
```

Two traps make this fail silently. First, `mail` exiting 0 means the message was handed to the local MTA, not that it was delivered — on a server with no MTA configured for outbound mail, it often lands in root's spool under `/var/mail`, a file nobody reads. Confirm real delivery by tailing `/var/log/mail.log` after a test send. Second, cron's minimal `PATH` can fail to find `mail` at all, so test from inside cron, not your login shell. Where direct sending is blocked, relay through SMTP with `msmtp` and an app password.

One more guard: a tripped threshold stays tripped, so dedupe with a marker file and only re-alert after 24 hours — otherwise you train yourself to ignore the channel.

The complete version, with the [full bash email alert script, Gmail SMTP relay setup, and dedupe guard](https://bashsnippets.xyz/snippets/bash-send-email-alert), covers the message body and cron scheduling too.
