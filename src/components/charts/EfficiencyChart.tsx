import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WorkoutSummary } from '../../types';
import { useChart } from '../../hooks/useChart';
import { insertGapBreaks } from '../../lib/chartUtils';

interface EfficiencyChartProps {
  summaries: WorkoutSummary[];
}

/** Cardiac efficiency line chart (meters per heartbeat) — higher values indicate better fitness. */
export function EfficiencyChart({ summaries }: EfficiencyChartProps) {
  const config = useMemo<ChartConfiguration<'line'> | null>(() => {
    const withEff = summaries
      .filter((s) => s.cardiacEfficiency && s.cardiacEfficiency > 0)
      .slice(-30);
    if (withEff.length < 2) return null;
    const effByTs = new Map(withEff.map((s) => [s.startDate.getTime(), s]));

    return {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Meters/Beat',
            data: insertGapBreaks(withEff.map((s) => ({
              x: s.startDate.getTime(),
              y: parseFloat((s.cardiacEfficiency as number).toFixed(3)),
            }))),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            fill: true,
            spanGaps: false,
            tension: 0.4,
            cubicInterpolationMode: 'monotone' as const,
            pointRadius: 3,
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
              label: (ctx) => {
                const s = effByTs.get(Number(ctx.parsed?.x));
                if (!s) return '';
                return `${(s.cardiacEfficiency as number).toFixed(2)} m/beat @ ${s.avgHR} bpm`;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'week', tooltipFormat: 'MMM d, yyyy' },
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
              text: 'meters per heartbeat',
              color: 'rgba(255, 255, 255, 0.3)',
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
