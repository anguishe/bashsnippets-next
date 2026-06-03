export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function highlightBash(raw: string): string {
  return raw
    .split('\n')
    .map((line) => {
      let esc = escapeHtml(line);

      esc = esc.replace(
        /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
        '<span style="color:#e3b341;">$1</span>',
      );

      esc = esc.replace(
        /(\$\{[A-Za-z_][A-Za-z0-9_]*\}|\$[A-Za-z_][A-Za-z0-9_]*|\$[#@?*])/g,
        '<span style="color:#39d353;">$1</span>',
      );

      esc = esc.replace(
        /\b(if|then|else|elif|fi|for|while|do|done|case|esac|in|function|return|exit|echo|set)\b/g,
        '<span style="color:#58a6ff;">$1</span>',
      );

      return esc;
    })
    .join('\n');
}

export function highlightCrontab(raw: string): string {
  return raw
    .split('\n')
    .map((line) => {
      if (line === '') return '';
      if (/^\s*#/.test(line)) {
        return `<span style="color:#8b949e;font-style:italic;">${escapeHtml(line)}</span>`;
      }
      if (/^[A-Z_]+=/.test(line)) {
        return `<span style="color:#58a6ff;">${escapeHtml(line)}</span>`;
      }
      const cron = line.match(/^(\S+\s+\S+\s+\S+\s+\S+\s+\S+)(\s+)(.*)$/);
      if (cron) {
        return (
          `<span style="color:#39d353;">${escapeHtml(cron[1])}</span>` +
          cron[2] +
          escapeHtml(cron[3])
        );
      }
      return escapeHtml(line);
    })
    .join('\n');
}
