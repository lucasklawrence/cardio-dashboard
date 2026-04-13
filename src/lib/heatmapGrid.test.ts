import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildHeatmapGrid } from './heatmapGrid';

function findCell(grid: ReturnType<typeof buildHeatmapGrid>['grid'], year: number, month: number, day: number) {
  for (const row of grid) {
    for (const cell of row) {
      if (cell.date.getFullYear() === year && cell.date.getMonth() === month && cell.date.getDate() === day) {
        return cell;
      }
    }
  }
  return null;
}

describe('buildHeatmapGrid', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 7 rows when no dates given', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15)); // Wed Apr 15 2026
    const { grid } = buildHeatmapGrid([]);
    expect(grid).toHaveLength(7);
    // Should have ~53 columns (52 weeks + partial)
    expect(grid[0].length).toBeGreaterThanOrEqual(53);
  });

  it('grid starts on a Monday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15));
    const { grid } = buildHeatmapGrid([]);
    const firstDate = grid[0][0].date;
    expect(firstDate.getDay()).toBe(1); // Monday
  });

  it('respects dateFrom and dateTo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15));
    const from = new Date(2026, 2, 1); // Mar 1
    const to = new Date(2026, 3, 15); // Apr 15
    const { grid } = buildHeatmapGrid([], from, to);
    expect(grid).toHaveLength(7);
    // ~7-9 weeks (grid snaps to Monday boundaries)
    const cols = grid[0].length;
    expect(cols).toBeGreaterThanOrEqual(7);
    expect(cols).toBeLessThanOrEqual(9);
    // First cell should be on or before Mar 1
    expect(grid[0][0].date.getTime()).toBeLessThanOrEqual(from.getTime());
  });

  it('counts workouts on correct date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15));
    const workouts = [
      { startDate: new Date(2026, 3, 14), type: 'HKWorkoutActivityTypeRunning' },
      { startDate: new Date(2026, 3, 14), type: 'HKWorkoutActivityTypeWalking' },
    ];
    const { grid } = buildHeatmapGrid(workouts);

    const cell = findCell(grid, 2026, 3, 14);
    expect(cell).not.toBeNull();
    expect(cell!.count).toBe(2);
    expect(cell!.types).toContain('Run');
    expect(cell!.types).toContain('Walk');
  });

  it('empty days have count 0', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15));
    const from = new Date(2026, 3, 1);
    const to = new Date(2026, 3, 15);
    const { grid } = buildHeatmapGrid([], from, to);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.count).toBe(0);
        expect(cell.types).toEqual([]);
      }
    }
  });

  it('generates month labels', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15));
    const { monthLabels } = buildHeatmapGrid([]);
    expect(monthLabels.length).toBeGreaterThan(0);
    const aprLabel = monthLabels.find((l) => l.label === 'Apr');
    expect(aprLabel).toBeDefined();
  });

  it('does not duplicate friendly types for same workout type', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15));
    const workouts = [
      { startDate: new Date(2026, 3, 14), type: 'HKWorkoutActivityTypeRunning' },
      { startDate: new Date(2026, 3, 14), type: 'HKWorkoutActivityTypeRunning' },
    ];
    const { grid } = buildHeatmapGrid(workouts);
    const cell = findCell(grid, 2026, 3, 14);
    expect(cell).not.toBeNull();
    expect(cell!.count).toBe(2);
    expect(cell!.types).toEqual(['Run']);
  });
});
