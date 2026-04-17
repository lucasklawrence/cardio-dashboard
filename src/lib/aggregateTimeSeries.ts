/** Time period for grouping data points in aggregation. */
export type AggregationMode = 'day' | 'week' | 'month';

interface TimePoint {
  date: Date;
  value: number;
}

function getDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

/** Reducer function applied to grouped values: average or sum. */
export type AggregationReducer = 'avg' | 'sum';

/** Group time-series data by day/week/month and reduce each group via avg or sum. */
export function aggregateTimeSeries(
  data: TimePoint[],
  mode: AggregationMode,
  reducer: AggregationReducer = 'avg',
): TimePoint[] {
  if (data.length === 0) return data;

  const groups = new Map<string, number[]>();
  const groupDates = new Map<string, Date>();

  for (const point of data) {
    const key = mode === 'day'
      ? getDayKey(point.date)
      : mode === 'week'
        ? getISOWeekMonday(point.date)
        : getMonthKey(point.date);

    const existing = groups.get(key);
    if (existing) {
      existing.push(point.value);
    } else {
      groups.set(key, [point.value]);
      const representative = mode === 'day'
        ? new Date(point.date.getFullYear(), point.date.getMonth(), point.date.getDate())
        : mode === 'week'
          ? new Date(key + 'T00:00:00')
          : new Date(point.date.getFullYear(), point.date.getMonth(), 1);
      groupDates.set(key, representative);
    }
  }

  const result: TimePoint[] = [];
  for (const [key, values] of groups) {
    const total = values.reduce((sum, v) => sum + v, 0);
    const value = reducer === 'sum' ? total : total / values.length;
    result.push({ date: groupDates.get(key)!, value });
  }

  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}
