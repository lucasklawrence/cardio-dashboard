import { useMemo, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WalkingHrSample } from '../../types';
import { useChart } from '../../hooks/useChart';
import { insertGapBreaks } from '../../lib/chartUtils';
import { aggregateTimeSeries, type AggregationMode } from '../../lib/aggregateTimeSeries';
import { AggregationToggle } from '../AggregationToggle';

interface WalkingHrChartProps {
  data: WalkingHrSample[];
  fig: number;
}

const MAX_POINTS = 90;

export function WalkingHrChart({ data, fig }: WalkingHrChartProps) {
  const [aggMode, setAggMode] = useState<AggregationMode>('day');

  const config = useMemo<ChartConfiguration<'line'> | null>(() => {
    if (data.length < 2) return null;

    const raw = data.map((d) => ({ date: d.date, value: d.bpm }));
    let series = aggregateTimeSeries(raw, aggMode);

    if (series.length > MAX_POINTS) {
      const step = Math.ceil(series.length / MAX_POINTS);
      series = series.filter((_, i) => i % step === 0);
    }

    return {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Walking HR',
            data: insertGapBreaks(series.map((d) => ({ x: d.date.getTime(), y: d.value }))),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            fill: true,
            spanGaps: false,
            tension: 0.4,
            cubicInterpolationMode: 'monotone' as const,
            pointRadius: 1.5,
            pointHoverRadius: 4,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1d',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            titleFont: { family: 'DM Mono', size: 10 },
            bodyFont: { family: 'DM Mono', size: 10 },
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
              text: 'bpm',
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
            },
          },
        },
      },
    };
  }, [data, aggMode]);

  const ref = useChart(config);
  if (!config) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Walking Heart Rate</h2>
        <div className="section-header-controls">
          <AggregationToggle mode={aggMode} onChange={setAggMode} />
          <span className="meta">{data.length} daily averages</span>
        </div>
      </div>
      <div className="chart-container">
        <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
