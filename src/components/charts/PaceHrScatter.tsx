import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WorkoutSummary } from '../../types';
import { useChart } from '../../hooks/useChart';
import { formatFullDate, formatPace } from '../../lib/format';

interface PaceHrScatterProps {
  summaries: WorkoutSummary[];
}

export function PaceHrScatter({ summaries }: PaceHrScatterProps) {
  const config = useMemo<ChartConfiguration<'scatter'> | null>(() => {
    const data = summaries.filter(
      (s) => s.paceMinPerMi && s.avgHR && s.paceMinPerMi < 30,
    );
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
              return `rgba(45, 155, 110, ${alpha})`;
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
            backgroundColor: '#1c1c22',
            borderColor: '#2a2a34',
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
            ticks: { color: '#7a7880', font: { family: 'DM Mono', size: 10 } },
            grid: { color: 'rgba(42, 42, 52, 0.5)' },
            title: {
              display: true,
              text: 'Avg Heart Rate (bpm)',
              color: '#7a7880',
              font: { family: 'DM Mono', size: 10 },
            },
          },
          y: {
            reverse: true,
            ticks: {
              color: '#7a7880',
              font: { family: 'DM Mono', size: 10 },
              callback: (v) => formatPace(Number(v)),
            },
            grid: { color: 'rgba(42, 42, 52, 0.5)' },
            title: {
              display: true,
              text: 'Pace (min/mi) — lower = faster',
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
