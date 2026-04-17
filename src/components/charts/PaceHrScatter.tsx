import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WorkoutSummary } from '../../types';
import { useChart } from '../../hooks/useChart';
import { formatFullDate, formatPace } from '../../lib/format';

interface PaceHrScatterProps {
  summaries: WorkoutSummary[];
}

/** Scatter plot of pace vs avg HR per session — moving down+left indicates improving fitness. */
export function PaceHrScatter({ summaries }: PaceHrScatterProps) {
  const config = useMemo<ChartConfiguration<'scatter'> | null>(() => {
    const data = summaries.filter((s) => s.paceMinPerMi && s.avgHR && s.paceMinPerMi < 30);
    if (data.length < 3) return null;

    const oldest = data[0].startDate.getTime();
    const newest = data[data.length - 1].startDate.getTime();
    const range = newest - oldest || 1;

    return {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Session',
            data: data.map((s) => ({
              x: s.avgHR,
              y: s.paceMinPerMi as number,
            })),
            backgroundColor: data.map((s) => {
              const age = (s.startDate.getTime() - oldest) / range;
              const alpha = 0.3 + age * 0.7;
              return `rgba(34, 197, 94, ${alpha})`;
            }),
            pointRadius: 6,
            pointHoverRadius: 8,
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
            titleFont: { family: 'DM Mono' },
            bodyFont: { family: 'DM Mono' },
            callbacks: {
              title: (items) => {
                const s = data[items[0].dataIndex];
                return formatFullDate(s.startDate);
              },
              label: (ctx) => {
                const s = data[ctx.dataIndex];
                return `${s.paceStr} /mi @ ${s.avgHR} bpm | ${s.distMi?.toFixed(2) || '?'} mi`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { family: 'DM Mono', size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            title: {
              display: true,
              text: 'Avg Heart Rate (bpm)',
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
            },
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
              text: 'Pace (min/mi) — lower = faster',
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
