import type { AggregationMode } from '../lib/aggregateTimeSeries';

interface AggregationToggleProps {
  mode: AggregationMode;
  onChange: (mode: AggregationMode) => void;
}

const MODES: { label: string; value: AggregationMode }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

/** Three-button toggle for selecting day/week/month time aggregation. */
export function AggregationToggle({ mode, onChange }: AggregationToggleProps) {
  return (
    <div className="agg-toggle">
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          className={`agg-btn${mode === m.value ? ' active' : ''}`}
          aria-pressed={mode === m.value}
          onClick={() => onChange(m.value)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
