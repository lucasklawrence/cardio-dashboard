interface TimePoint {
  x: number;
  y: number | null;
}

const GAP_THRESHOLD_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

/** Insert null-y break points between data points separated by more than 60 days to create visual gaps in line charts. */
export function insertGapBreaks(points: { x: number; y: number }[]): TimePoint[] {
  if (points.length < 2) return points;

  const result: TimePoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (points[i].x - points[i - 1].x > GAP_THRESHOLD_MS) {
      result.push({ x: points[i - 1].x + 1, y: null });
    }
    result.push(points[i]);
  }
  return result;
}
