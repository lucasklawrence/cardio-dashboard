import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WorkoutSummary } from '../../types';
import { useChart } from '../../hooks/useChart';
import { aggregateTimeSeries, type AggregationMode } from '../../lib/aggregateTimeSeries';
import { useGoal } from '../../lib/goals';
import { goalAnnotation } from '../../lib/goalAnnotation';
import { AggregationToggle } from '../AggregationToggle';
import { GoalInput } from '../GoalInput';
import { formatPace } from '../../lib/format';
import { insertGapBreaks } from '../../lib/chartUtils';
import { matchesTab } from '../../lib/workouts';

interface PaceTrendChartProps {
  summaries: WorkoutSummary[];
  fig: number;
}

const MAX_POINTS = 90;

/** Aggregated running pace trend line chart with reversed y-axis, gap breaks, and optional goal line. */
export function PaceTrendChart({ summaries, fig }: PaceTrendChartProps) {
  const [aggMode, setAggMode] = useState<AggregationMode>('day');
  const [goal, setGoal] = useGoal('paceTrend');

  const runs = useMemo(
    () =>
      summaries.filter(
        (s) =>
          matchesTab(s.type, 'run') &&
          s.paceMinPerMi &&
          s.paceMinPerMi > 0 &&
          s.paceMinPerMi < 30 &&
          s.distKm &&
          s.distKm > 0.5 &&
          s.durationMin > 5,
      ),
    [summaries],
  );

  const config = useMemo<ChartConfiguration | null>(() => {
    if (runs.length < 2) return null;

    const raw = runs.map((s) => ({ date: s.startDate, value: s.paceMinPerMi as number }));
    let series = aggregateTimeSeries(raw, aggMode, 'avg');

    if (series.length > MAX_POINTS) {
      const step = Math.ceil(series.length / MAX_POINTS);
      series = series.filter((_, i) => i % step === 0 || i === series.length - 1);
    }

    const points = series.map((d) => ({ x: d.date.getTime(), y: d.value }));
    const chartPoints = insertGapBreaks(points);

    return {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Pace (min/mi)',
            data: chartPoints,
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.08)',
            fill: true,
            spanGaps: false,
            tension: 0.4,
            cubicInterpolationMode: 'monotone' as const,
            pointRadius: aggMode === 'day' ? 2 : 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#ec4899',
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          annotation: goalAnnotation(goal),
          tooltip: {
            backgroundColor: '#1a1a1d',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            titleFont: { family: 'DM Mono', size: 10 },
            bodyFont: { family: 'DM Mono', size: 10 },
            callbacks: {
              label: (ctx) => `${formatPace(ctx.parsed?.y ?? null)} /mi`,
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'month', tooltipFormat: 'MMM d, yyyy' },
            ticks: {
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
              maxTicksLimit: 8,
            },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
          },
          y: {
            reverse: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
              callback: (v) => formatPace(Number(v)),
            },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            title: {
              display: true,
              text: 'min/mi (lower = faster)',
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
            },
          },
        },
      },
    };
  }, [runs, aggMode, goal]);

  const ref = useChart(config);
  if (!config) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Running Pace Trend</h2>
        <div className="section-header-controls">
          <AggregationToggle mode={aggMode} onChange={setAggMode} />
          <GoalInput value={goal} onChange={setGoal} unit="min/mi" />
          <span className="meta">{runs.length} runs</span>
        </div>
      </div>
      <div className="chart-container">
        <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
