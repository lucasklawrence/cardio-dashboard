import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { BodyMassSample } from '../../types';
import { useChart } from '../../hooks/useChart';
import { insertGapBreaks } from '../../lib/chartUtils';
import { aggregateTimeSeries, type AggregationMode } from '../../lib/aggregateTimeSeries';
import { useGoal } from '../../lib/goals';
import { goalAnnotation } from '../../lib/goalAnnotation';
import { AggregationToggle } from '../AggregationToggle';
import { GoalInput } from '../GoalInput';

interface BodyMassChartProps {
  data: BodyMassSample[];
  fig: number;
}

const MAX_POINTS = 90;

export function BodyMassChart({ data, fig }: BodyMassChartProps) {
  const [aggMode, setAggMode] = useState<AggregationMode>('day');
  const [goal, setGoal] = useGoal('bodyMass');

  const config = useMemo<ChartConfiguration<'line'> | null>(() => {
    if (data.length < 2) return null;

    const raw = data.map((d) => ({ date: d.date, value: d.lbs }));
    let series = aggregateTimeSeries(raw, aggMode);

    if (series.length > MAX_POINTS) {
      const step = Math.ceil(series.length / MAX_POINTS);
      series = series.filter((_, i) => i % step === 0);
    }

    const byTs = new Map(series.map((d) => [d.date.getTime(), d]));

    return {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Weight',
            data: insertGapBreaks(series.map((d) => ({ x: d.date.getTime(), y: d.value }))),
            borderColor: '#a78bfa',
            backgroundColor: 'rgba(167, 139, 250, 0.08)',
            fill: true,
            spanGaps: false,
            tension: 0.4,
            cubicInterpolationMode: 'monotone' as const,
            pointRadius: 2,
            pointHoverRadius: 5,
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
              label: (ctx) => {
                const d = byTs.get(Number(ctx.parsed?.x));
                if (!d) return '';
                return `${d.value.toFixed(1)} lbs`;
              },
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
              text: 'lbs',
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
            },
          },
        },
      },
    };
  }, [data, aggMode, goal]);

  const ref = useChart(config);
  if (!config) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Body Weight</h2>
        <div className="section-header-controls">
          <AggregationToggle mode={aggMode} onChange={setAggMode} />
          <GoalInput value={goal} onChange={setGoal} unit="lbs" />
          <span className="meta">{data.length} measurements</span>
        </div>
      </div>
      <div className="chart-container">
        <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
