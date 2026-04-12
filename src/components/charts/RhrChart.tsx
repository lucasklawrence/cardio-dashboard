import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { RestingHrSample } from '../../types';
import { useChart } from '../../hooks/useChart';
import { insertGapBreaks } from '../../lib/chartUtils';

interface RhrChartProps {
  data: RestingHrSample[];
  fig: number;
}

const MAX_POINTS = 90;

export function RhrChart({ data, fig }: RhrChartProps) {
  const config = useMemo<ChartConfiguration<'line'> | null>(() => {
    if (data.length < 2) return null;

    let series = data;
    if (series.length > MAX_POINTS) {
      const step = Math.ceil(series.length / MAX_POINTS);
      series = series.filter((_, i) => i % step === 0);
    }

    return {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Resting HR',
            data: insertGapBreaks(series.map((d) => ({ x: d.date.getTime(), y: d.bpm }))),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            fill: true,
            spanGaps: false,
            tension: 0.3,
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
          },
        },
      },
    };
  }, [data]);

  const ref = useChart(config);
  if (!config) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Resting Heart Rate</h2>
        <span className="meta">{data.length} data points</span>
      </div>
      <div className="chart-container">
        <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
