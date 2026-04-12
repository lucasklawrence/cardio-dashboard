import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WorkoutSummary, Zones } from '../../types';
import { useChart } from '../../hooks/useChart';
import { hrZone } from '../../lib/zones';
import { ZONE_COLORS } from '../../constants';
import { formatPace } from '../../lib/format';
import { insertGapBreaks } from '../../lib/chartUtils';

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
        datasets: [
          {
            label: 'Pace (min/mi)',
            data: insertGapBreaks(withPace.map((s) => ({ x: s.startDate.getTime(), y: s.paceMinPerMi as number }))),
            borderColor: '#eab308',
            backgroundColor: 'rgba(234, 179, 8, 0.08)',
            fill: true,
            spanGaps: false,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: withPace.map(
              (s) => ZONE_COLORS[hrZone(s.avgHR, zones)],
            ),
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
            reverse: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.3)',
              font: { family: 'DM Mono', size: 10 },
              callback: (v) => formatPace(Number(v)),
            },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            title: {
              display: true,
              text: 'min/mile (lower = faster)',
              color: 'rgba(255, 255, 255, 0.3)',
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
