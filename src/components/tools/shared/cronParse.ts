// Cron field parsing shared by the cron builder and the systemd timer export.
// Throws on a field cron would reject; returns null for '*' (every value).

export const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseField(field: string, min: number, max: number): Set<number> | null {
  if (field === '*') return null;
  const values = new Set<number>();
  const parts = field.split(',');
  for (const part of parts) {
    let step = 1;
    let range = part;
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    if (stepMatch) {
      range = stepMatch[1];
      step = parseInt(stepMatch[2], 10);
      if (!step || step < 1) throw new Error('bad step');
    }
    let start: number;
    let end: number;
    if (range === '*') {
      start = min;
      end = max;
    } else if (range.indexOf('-') >= 0) {
      const bits = range.split('-');
      start = parseInt(bits[0], 10);
      end = parseInt(bits[1], 10);
    } else {
      start = end = parseInt(range, 10);
    }
    if (Number.isNaN(start) || Number.isNaN(end) || start < min || end > max || start > end) {
      throw new Error('bad range');
    }
    for (let v = start; v <= end; v += step) values.add(v);
  }
  return values;
}

// cron accepts 7 for Sunday and three-letter names in the month and weekday fields.
export function normalizeNames(field: string, names: string[], base: number): string {
  return field.replace(/[a-z]{3}/gi, (m) => {
    const i = names.findIndex((n) => n.toLowerCase() === m.toLowerCase());
    return i < 0 ? m : String(i + base);
  });
}

export function parseDow(field: string): Set<number> | null {
  const set = parseField(normalizeNames(field, DOW_NAMES, 0), 0, 7);
  if (set?.has(7)) {
    set.delete(7);
    set.add(0);
  }
  return set;
}

export function parseMonth(field: string): Set<number> | null {
  return parseField(normalizeNames(field, MONTH_NAMES, 1), 1, 12);
}
