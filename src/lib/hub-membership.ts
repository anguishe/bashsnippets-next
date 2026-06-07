export interface HubLink {
  url: string;
  label: string;
}

// Maps snippet slug → array of hubs it belongs to
const hubMembership: Record<string, HubLink[]> = {
  'disk-space-warning': [
    { url: '/snippets/server-monitoring', label: 'Server Monitoring' },
    { url: '/snippets/disk-management', label: 'Disk Management' },
  ],
  'check-if-website-is-up': [
    { url: '/snippets/server-monitoring', label: 'Server Monitoring' },
  ],
  'monitor-cpu-ram-usage': [
    { url: '/snippets/server-monitoring', label: 'Server Monitoring' },
  ],
  'restart-service-if-stopped': [
    { url: '/snippets/server-monitoring', label: 'Server Monitoring' },
  ],
  'quick-system-info-report': [
    { url: '/snippets/server-monitoring', label: 'Server Monitoring' },
  ],
  'check-ssl-certificate-expiry': [
    { url: '/snippets/server-monitoring', label: 'Server Monitoring' },
    { url: '/snippets/linux-security', label: 'Linux Security' },
  ],
  'kill-a-process': [
    { url: '/snippets/server-monitoring', label: 'Server Monitoring' },
  ],
  'bash-send-email-alert': [
    { url: '/snippets/server-monitoring', label: 'Server Monitoring' },
  ],
  'automated-file-backup': [
    { url: '/snippets/backup-and-recovery', label: 'Backup & Recovery' },
  ],
  'mysql-database-backup': [
    { url: '/snippets/backup-and-recovery', label: 'Backup & Recovery' },
  ],
  'rsync-remote-backup': [
    { url: '/snippets/backup-and-recovery', label: 'Backup & Recovery' },
  ],
  'find-large-files-linux': [
    { url: '/snippets/disk-management', label: 'Disk Management' },
  ],
  'delete-old-log-files': [
    { url: '/snippets/disk-management', label: 'Disk Management' },
  ],
  'find-duplicate-files': [
    { url: '/snippets/disk-management', label: 'Disk Management' },
  ],
  'docker-prune-cleanup': [
    { url: '/snippets/disk-management', label: 'Disk Management' },
  ],
  'file-permissions-security': [
    { url: '/snippets/linux-security', label: 'Linux Security' },
  ],
  'ssh-key-setup-script': [
    { url: '/snippets/linux-security', label: 'Linux Security' },
  ],
  'list-open-ports-linux': [
    { url: '/snippets/linux-security', label: 'Linux Security' },
  ],
  'kill-process-on-port': [
    { url: '/snippets/linux-security', label: 'Linux Security' },
  ],
};

export function getHubsForSlug(slug: string): HubLink[] {
  return hubMembership[slug] ?? [];
}
