import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { ActiveEnergySample } from '../../types';
import { useChart } from '../../hooks/useChart';
import { aggregateTimeSeries, type AggregationMode } from '../../lib/aggregateTimeSeries';
import { useGoal } from '../../lib/goals';
import { goalAnnotation } from '../../lib/goalAnnotation';
import { AggregationToggle } from '../AggregationToggle';
import { GoalInput } from '../GoalInput';

interface ActiveEnergyChartProps {
  data: ActiveEnergySample[];
  fig: number;
}

const MAX_POINTS = 90;

/** Time-series active energy expenditure bar chart (kcal) with sum aggregation, interval toggle, and optional goal line. */
export function ActiveEnergyChart({ data, fig }: ActiveEnergyChartProps) {
  const [aggMode, setAggMode] = useState<AggregationMode>('day');
  const [goal, setGoal] = useGoal('activeEnergy');

  const config = useMemo<ChartConfiguration | null>(() => {
    if (data.length < 2) return null;

    const raw = data.map((d) => ({ date: d.date, value: d.kcal }));
    let series = aggregateTimeSeries(raw, aggMode, 'sum');

    if (series.length > MAX_POINTS) {
      const step = Math.ceil(series.length / MAX_POINTS);
      series = series.filter((_, i) => i % step === 0);
    }

    return {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Active Energy',
            data: series.map((d) => ({ x: d.date.getTime(), y: d.value })),
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: '#ef4444',
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
              label: (ctx) => `${Math.round(ctx.parsed?.y ?? 0).toLocaleString()} kcal`,
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
              text: 'kcal',
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
        <h2>Active Energy</h2>
        <div className="section-header-controls">
          <AggregationToggle mode={aggMode} onChange={setAggMode} />
          <GoalInput value={goal} onChange={setGoal} unit="kcal" />
          <span className="meta">{data.length} days</span>
        </div>
      </div>
      <div className="chart-container">
        <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
