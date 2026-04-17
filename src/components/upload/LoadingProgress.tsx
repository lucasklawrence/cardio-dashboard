import type { ProgressStage } from '../../types';

interface LoadingProgressProps {
  stages: ProgressStage[];
  error: string | null;
}

function stageIcon(status: ProgressStage['status']): string {
  if (status === 'done') return '✓';
  if (status === 'active') return '◉';
  return '○';
}

function formatCount(count: ProgressStage['count']): string {
  if (count == null) return '';
  if (typeof count === 'number') return count.toLocaleString();
  return count;
}

/** Multi-stage loading indicator showing parsing progress with checkmarks, spinners, and counts. */
export function LoadingProgress({ stages, error }: LoadingProgressProps) {
  return (
    <div className="loading">
      {!error && <div className="spinner" />}
      <p>{error ? `Error: ${error}` : 'Unpacking health data…'}</p>
      <div
        style={{
          marginTop: 20,
          textAlign: 'left',
          display: 'inline-block',
          minWidth: 260,
        }}
      >
        {stages.map((s) => (
          <div key={s.id} className={`progress-stage ${s.status}`}>
            <span className="stage-icon">{stageIcon(s.status)}</span>
            <span>{s.label}</span>
            <span className="stage-count">{formatCount(s.count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
