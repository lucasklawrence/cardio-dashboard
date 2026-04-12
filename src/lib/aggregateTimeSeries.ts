export type AggregationMode = 'day' | 'week' | 'month';

interface TimePoint {
  date: Date;
  value: number;
}

function getISOWeekMonday(d: Date): string {
  const day = new Date(d);
  const dow = day.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  day.setDate(day.getDate() + diff);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function aggregateTimeSeries(
  data: TimePoint[],
  mode: AggregationMode,
): TimePoint[] {
  if (mode === 'day' || data.length === 0) return data;

  const groups = new Map<string, number[]>();
  const groupDates = new Map<string, Date>();

  for (const point of data) {
    const key = mode === 'week'
      ? getISOWeekMonday(point.date)
      : getMonthKey(point.date);

    const existing = groups.get(key);
    if (existing) {
      existing.push(point.value);
    } else {
      groups.set(key, [point.value]);
      const representative = mode === 'week'
        ? new Date(key + 'T00:00:00')
        : new Date(point.date.getFullYear(), point.date.getMonth(), 1);
      groupDates.set(key, representative);
    }
  }

  const result: TimePoint[] = [];
  for (const [key, values] of groups) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    result.push({ date: groupDates.get(key)!, value: avg });
  }

  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}
