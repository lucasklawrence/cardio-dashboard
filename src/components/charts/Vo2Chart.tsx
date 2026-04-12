import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { Vo2Sample } from '../../types';
import { useChart } from '../../hooks/useChart';
import { formatShortDate } from '../../lib/format';

interface Vo2ChartProps {
  data: Vo2Sample[];
  fig: number;
}

const MAX_POINTS = 60;

export function Vo2Chart({ data, fig }: Vo2ChartProps) {
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
        labels: series.map((d) => formatShortDate(d.date)),
        datasets: [
          {
            label: 'VO₂max',
            data: series.map((d) => d.value),
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.08)',
            fill: true,
            tension: 0.3,
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
          tooltip: {
            backgroundColor: '#1a1a1d',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            titleFont: { family: 'DM Mono', size: 10 },
            bodyFont: { family: 'DM Mono', size: 10 },
            callbacks: {
              label: (ctx) => `VO₂max: ${series[ctx.dataIndex].value.toFixed(1)} mL/kg/min`,
            },
          },
        },
        scales: {
          x: {
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
              text: 'mL/kg/min',
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
            },
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
        <h2>VO₂max Estimate</h2>
        <span className="meta">{data.length} readings</span>
      </div>
      <div className="chart-container">
        <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
