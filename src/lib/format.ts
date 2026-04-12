export function formatPace(minPerMi: number | null): string {
  if (minPerMi == null || !isFinite(minPerMi)) return '—';
  const m = Math.floor(minPerMi);
  const s = Math.round((minPerMi - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function toDateInputValue(d: Date | null): string {
  if (!d) return '';
  return d.toISOString().split('T')[0];
}
