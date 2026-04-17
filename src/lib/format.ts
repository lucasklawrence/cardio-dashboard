/** Format a decimal pace value (e.g. 8.5) as "M:SS" string. Returns "—" for null/invalid. */
export function formatPace(minPerMi: number | null): string {
  if (minPerMi == null || !isFinite(minPerMi)) return '—';
  let m = Math.floor(minPerMi);
  let s = Math.round((minPerMi - m) * 60);
  if (s === 60) {
    m += 1;
    s = 0;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format a date as "Jan 5" style short string. */
export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format a date as "Jan 5, 2026" style full string. */
export function formatFullDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Convert a Date to "YYYY-MM-DD" string for HTML date inputs. Returns "" for null. */
export function toDateInputValue(d: Date | null): string {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
