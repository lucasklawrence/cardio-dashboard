import { friendlyType } from './workouts';

export interface HeatmapCell {
  date: Date;
  count: number;
  types: string[];
}

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const MAX_COLS = 104; // cap at ~2 years to limit DOM size

/** Get the Monday at or before a given date. */
function getMondayOf(d: Date): Date {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = m.getDay(); // 0=Sun, 1=Mon, ...
  m.setDate(m.getDate() - (dow === 0 ? 6 : dow - 1));
  return m;
}

/**
 * Build a 7-row (Mon–Sun) x N-column grid of workout counts.
 * When dateFrom/dateTo are provided the grid spans that range;
 * otherwise it shows the last 52 weeks ending at the current week.
 * Capped at MAX_COLS weeks to limit DOM node count.
 */
export function buildHeatmapGrid(
  workouts: { startDate: Date; type: string }[],
  dateFrom?: Date | null,
  dateTo?: Date | null,
): { grid: HeatmapCell[][]; monthLabels: { col: number; label: string }[] } {
  const endMonday = getMondayOf(dateTo ?? new Date());
  // End of grid = Sunday of that week
  const endDate = new Date(endMonday.getTime() + 6 * DAY_MS);

  let startMonday: Date;
  if (dateFrom) {
    startMonday = getMondayOf(dateFrom);
    // If the range is very wide, clamp to show only the last MAX_COLS weeks
    const maxStart = new Date(endMonday.getTime() - MAX_COLS * WEEK_MS);
    if (startMonday.getTime() < maxStart.getTime()) {
      startMonday = maxStart;
    }
  } else {
    startMonday = new Date(endMonday.getTime() - 52 * WEEK_MS);
  }

  // Build lookup: YYYY-MM-DD → {count, types[]}
  const lookup = new Map<string, { count: number; types: string[] }>();
  for (const w of workouts) {
    const d = w.startDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = lookup.get(key);
    const friendly = friendlyType(w.type);
    if (entry) {
      entry.count++;
      if (!entry.types.includes(friendly)) entry.types.push(friendly);
    } else {
      lookup.set(key, { count: 1, types: [friendly] });
    }
  }

  // Build grid using timestamp arithmetic (avoids setDate overflow)
  const startMs = startMonday.getTime();
  const diffMs = endDate.getTime() - startMs;
  const totalCols = Math.floor(diffMs / WEEK_MS) + 1;
  const grid: HeatmapCell[][] = Array.from({ length: 7 }, () => []);
  const monthLabels: { col: number; label: string }[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = -1;

  for (let col = 0; col < totalCols; col++) {
    for (let row = 0; row < 7; row++) {
      const date = new Date(startMs + (col * 7 + row) * DAY_MS);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const entry = lookup.get(key);

      grid[row].push({
        date,
        count: entry?.count ?? 0,
        types: entry?.types ?? [],
      });

      // Track month labels (on Monday row)
      if (row === 0 && date.getMonth() !== lastMonth) {
        lastMonth = date.getMonth();
        monthLabels.push({ col, label: months[date.getMonth()] });
      }
    }
  }

  return { grid, monthLabels };
}
