import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { WorkoutSummary, Zones } from '../../types';
import { useChart } from '../../hooks/useChart';
import { hrZone } from '../../lib/zones';
import { ZONE_COLORS } from '../../constants';
import { formatShortDate } from '../../lib/format';

interface SessionHrChartProps {
  summaries: WorkoutSummary[];
  zones: Zones;
}

export function SessionHrChart({ summaries, zones }: SessionHrChartProps) {
  const config = useMemo<ChartConfiguration<'bar'> | null>(() => {
    if (summaries.length < 2) return null;
    const recent = summaries.slice(-30);

    return {
      type: 'bar',
      data: {
        labels: recent.map((s) => formatShortDate(s.startDate)),
        datasets: [
          {
            label: 'Avg HR',
            data: recent.map((s) => s.avgHR),
            backgroundColor: recent.map(
              (s) => ZONE_COLORS[hrZone(s.avgHR, zones)] + '99',
            ),
            borderColor: recent.map((s) => ZONE_COLORS[hrZone(s.avgHR, zones)]),
            borderWidth: 1,
            borderRadius: 4,
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
              afterLabel: (ctx) => {
                const s = recent[ctx.dataIndex];
                return `Duration: ${s.durationMin}min | Max: ${s.maxHR}bpm`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#7a7880',
              font: { family: 'DM Mono', size: 10 },
              maxTicksLimit: 10,
            },
            grid: { display: false },
          },
          y: {
            ticks: { color: '#7a7880', font: { family: 'DM Mono', size: 10 } },
            grid: { color: 'rgba(42, 42, 52, 0.5)' },
            suggestedMin: 80,
          },
        },
      },
    };
  }, [summaries, zones]);

  const ref = useChart(config);
  if (!config) return null;
  return <canvas ref={ref} />;
}
