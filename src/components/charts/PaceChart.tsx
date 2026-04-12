import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WorkoutSummary, Zones } from '../../types';
import { useChart } from '../../hooks/useChart';
import { hrZone } from '../../lib/zones';
import { ZONE_COLORS } from '../../constants';
import { formatPace, formatShortDate } from '../../lib/format';

interface PaceChartProps {
  summaries: WorkoutSummary[];
  zones: Zones;
}

export function PaceChart({ summaries, zones }: PaceChartProps) {
  const config = useMemo<ChartConfiguration<'line'> | null>(() => {
    const withPace = summaries
      .filter((s) => s.paceMinPerMi && s.paceMinPerMi > 0 && s.paceMinPerMi < 30)
      .slice(-30);
    if (withPace.length < 2) return null;

    return {
      type: 'line',
      data: {
        labels: withPace.map((s) => formatShortDate(s.startDate)),
        datasets: [
          {
            label: 'Pace (min/mi)',
            data: withPace.map((s) => s.paceMinPerMi as number),
            borderColor: '#d4a843',
            backgroundColor: 'rgba(212, 168, 67, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: withPace.map(
              (s) => ZONE_COLORS[hrZone(s.avgHR, zones)],
            ),
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
                const s = withPace[ctx.dataIndex];
                return `${s.paceStr} /mi @ ${s.avgHR} bpm avg`;
              },
              afterLabel: (ctx) => {
                const s = withPace[ctx.dataIndex];
                return s.distMi ? `${s.distMi.toFixed(2)} mi in ${s.durationMin} min` : '';
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
            reverse: true,
            ticks: {
              color: '#7a7880',
              font: { family: 'DM Mono', size: 10 },
              callback: (v) => formatPace(Number(v)),
            },
            grid: { color: 'rgba(42, 42, 52, 0.5)' },
            title: {
              display: true,
              text: 'min/mile (lower = faster)',
              color: '#7a7880',
              font: { family: 'DM Mono', size: 10 },
            },
          },
        },
      },
    };
  }, [summaries, zones]);

  const ref = useChart(config);
  if (!config) return null;
  return <canvas ref={ref} />;
}
