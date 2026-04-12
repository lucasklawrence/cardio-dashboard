import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WorkoutSummary } from '../../types';
import { useChart } from '../../hooks/useChart';
import { formatShortDate } from '../../lib/format';

interface EfficiencyChartProps {
  summaries: WorkoutSummary[];
}

export function EfficiencyChart({ summaries }: EfficiencyChartProps) {
  const config = useMemo<ChartConfiguration<'line'> | null>(() => {
    const withEff = summaries
      .filter((s) => s.cardiacEfficiency && s.cardiacEfficiency > 0)
      .slice(-30);
    if (withEff.length < 2) return null;

    return {
      type: 'line',
      data: {
        labels: withEff.map((s) => formatShortDate(s.startDate)),
        datasets: [
          {
            label: 'Meters/Beat',
            data: withEff.map((s) => parseFloat((s.cardiacEfficiency as number).toFixed(3))),
            borderColor: '#2d9b6e',
            backgroundColor: 'rgba(45, 155, 110, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
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
          tooltip: {
            backgroundColor: '#1c1c22',
            borderColor: '#2a2a34',
            borderWidth: 1,
            titleFont: { family: 'DM Mono' },
            bodyFont: { family: 'DM Mono' },
            callbacks: {
              label: (ctx) => {
                const s = withEff[ctx.dataIndex];
                return `${(s.cardiacEfficiency as number).toFixed(2)} m/beat @ ${s.avgHR} bpm`;
              },
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
              text: 'meters per heartbeat',
              color: '#7a7880',
              font: { family: 'DM Mono', size: 10 },
            },
          },
        },
      },
    };
  }, [summaries]);

  const ref = useChart(config);
  if (!config) return null;
  return <canvas ref={ref} />;
}
