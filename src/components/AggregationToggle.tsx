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

export function AggregationToggle({ mode, onChange }: AggregationToggleProps) {
  return (
    <div className="agg-toggle">
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          className={`agg-btn${mode === m.value ? ' active' : ''}`}
          onClick={() => onChange(m.value)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
