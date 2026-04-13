import { useMemo } from 'react';
import type { Workout } from '../types';
import { buildHeatmapGrid } from '../lib/heatmapGrid';
import { formatFullDate } from '../lib/format';

interface WorkoutHeatmapProps {
  workouts: Workout[];
  fig: number;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

function cellLevel(count: number): string {
  if (count === 0) return '';
  if (count === 1) return ' level-1';
  if (count === 2) return ' level-2';
  return ' level-3';
}

export function WorkoutHeatmap({ workouts, fig, dateFrom, dateTo }: WorkoutHeatmapProps) {
  const { grid, monthLabels } = useMemo(
    () => buildHeatmapGrid(workouts, dateFrom, dateTo),
    [workouts, dateFrom, dateTo],
  );

  const totalCols = grid[0]?.length ?? 0;
  if (totalCols === 0) return null;

  const totalWorkouts = workouts.length;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Workout Frequency</h2>
        <div className="section-header-controls">
          <span className="meta">{totalWorkouts} sessions</span>
        </div>
      </div>
      <div className="chart-container">
        <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
        <div className="heatmap">
          <div className="heatmap-labels">
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="heatmap-day-label">{label}</span>
            ))}
          </div>
          <div className="heatmap-grid">
            <div
              className="heatmap-months"
              style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(8px, 14px))` }}
            >
              {Array.from({ length: totalCols }, (_, col) => {
                const ml = monthLabels.find((m) => m.col === col);
                return (
                  <span key={col}>{ml?.label ?? ''}</span>
                );
              })}
            </div>
            <div
              className="heatmap-cells"
              style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(8px, 14px))` }}
            >
              {Array.from({ length: totalCols }, (_, col) =>
                grid.map((row, rowIdx) => {
                  const cell = row[col];
                  const tip = cell.count > 0
                    ? `${formatFullDate(cell.date)}: ${cell.count} workout${cell.count > 1 ? 's' : ''} (${cell.types.join(', ')})`
                    : formatFullDate(cell.date);
                  return (
                    <div
                      key={`${col}-${rowIdx}`}
                      className={`heatmap-cell${cellLevel(cell.count)}`}
                      title={tip}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
