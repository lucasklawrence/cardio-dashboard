import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { Workout } from '../../types';
import { useChart } from '../../hooks/useChart';
import { aggregateTimeSeries, type AggregationMode } from '../../lib/aggregateTimeSeries';
import { useGoal } from '../../lib/goals';
import { goalAnnotation } from '../../lib/goalAnnotation';
import { AggregationToggle } from '../AggregationToggle';
import { GoalInput } from '../GoalInput';

interface TrainingVolumeChartProps {
  workouts: Workout[];
  fig: number;
}

const MAX_POINTS = 90;

function durationMinutes(w: Workout): number {
  if (w.duration && w.durationUnit === 'min') return w.duration;
  return (w.endDate.getTime() - w.startDate.getTime()) / 60000;
}

export function TrainingVolumeChart({ workouts, fig }: TrainingVolumeChartProps) {
  const [aggMode, setAggMode] = useState<AggregationMode>('week');
  const [goal, setGoal] = useGoal('trainingVolume');

  const config = useMemo<ChartConfiguration | null>(() => {
    if (workouts.length < 2) return null;

    const raw = workouts.map((w) => ({ date: w.startDate, value: durationMinutes(w) / 60 }));
    let series = aggregateTimeSeries(raw, aggMode, 'sum');

    if (series.length > MAX_POINTS) {
      const step = Math.ceil(series.length / MAX_POINTS);
      series = series.filter((_, i) => i % step === 0 || i === series.length - 1);
    }

    return {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Training Volume',
            data: series.map((d) => ({ x: d.date.getTime(), y: d.value })),
            backgroundColor: 'rgba(20, 184, 166, 0.5)',
            borderColor: '#14b8a6',
            borderWidth: 1,
            borderRadius: 2,
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
              label: (ctx) => `${(ctx.parsed?.y ?? 0).toFixed(1)} hrs`,
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
            ticks: {
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
            },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            title: {
              display: true,
              text: 'hrs',
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
            },
          },
        },
      },
    };
  }, [workouts, aggMode, goal]);

  const ref = useChart(config);
  if (!config) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Training Volume</h2>
        <div className="section-header-controls">
          <AggregationToggle mode={aggMode} onChange={setAggMode} />
          <GoalInput value={goal} onChange={setGoal} unit="hrs" />
          <span className="meta">{workouts.length} sessions</span>
        </div>
      </div>
      <div className="chart-container">
        <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
