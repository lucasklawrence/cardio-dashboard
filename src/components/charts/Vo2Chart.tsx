import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { Vo2Sample } from '../../types';
import { useChart } from '../../hooks/useChart';
import { formatShortDate } from '../../lib/format';
import { aggregateTimeSeries, type AggregationMode } from '../../lib/aggregateTimeSeries';
import { useGoal } from '../../lib/goals';
import { goalAnnotation } from '../../lib/goalAnnotation';
import { AggregationToggle } from '../AggregationToggle';
import { GoalInput } from '../GoalInput';

interface Vo2ChartProps {
  data: Vo2Sample[];
}

const MAX_POINTS = 60;

export function Vo2Chart({ data }: Vo2ChartProps) {
  const [aggMode, setAggMode] = useState<AggregationMode>('day');
  const [goal, setGoal] = useGoal('vo2max');

  const config = useMemo<ChartConfiguration<'line'> | null>(() => {
    if (data.length < 2) return null;

    const raw = data.map((d) => ({ date: d.date, value: d.value }));
    let series = aggregateTimeSeries(raw, aggMode);

    if (series.length > MAX_POINTS) {
      const step = Math.ceil(series.length / MAX_POINTS);
      series = series.filter((_, i) => i % step === 0);
    }

    return {
      type: 'line',
      data: {
        labels: series.map((d) => formatShortDate(d.date)),
        datasets: [
          {
            label: 'VO₂max',
            data: series.map((d) => d.value),
            borderColor: '#d45a3a',
            backgroundColor: 'rgba(212, 90, 58, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2,
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
            backgroundColor: '#1c1c22',
            borderColor: '#2a2a34',
            borderWidth: 1,
            titleFont: { family: 'DM Mono' },
            bodyFont: { family: 'DM Mono' },
            callbacks: {
              label: (ctx) => `VO₂max: ${series[ctx.dataIndex].value.toFixed(1)} mL/kg/min`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#7a7880',
              font: { family: 'DM Mono', size: 10 },
              maxTicksLimit: 8,
            },
            grid: { color: 'rgba(42, 42, 52, 0.5)' },
          },
          y: {
            ticks: { color: '#7a7880', font: { family: 'DM Mono', size: 10 } },
            grid: { color: 'rgba(42, 42, 52, 0.5)' },
            title: {
              display: true,
              text: 'mL/kg/min',
              color: '#7a7880',
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
        <h2>VO₂max Estimate</h2>
        <div className="section-header-controls">
          <AggregationToggle mode={aggMode} onChange={setAggMode} />
          <GoalInput value={goal} onChange={setGoal} unit="mL/kg/min" />
          <span className="meta">{data.length} readings</span>
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={ref} />
      </div>
    </div>
  );
}
