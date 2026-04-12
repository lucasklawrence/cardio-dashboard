import type { RestingHrSample, WorkoutSummary } from '../types';
import { ACTIVITY_TABS } from '../constants';
import { formatPace } from '../lib/format';
import type { ActivityTab } from '../types';

interface StatsGridProps {
  summaries: WorkoutSummary[];
  restingHR: RestingHrSample[];
  activeTab: ActivityTab;
}

export function StatsGrid({ summaries, restingHR, activeTab }: StatsGridProps) {
  const totalSessions = summaries.length;
  const avgDuration =
    totalSessions > 0
      ? Math.round(summaries.reduce((a, s) => a + s.durationMin, 0) / totalSessions)
      : 0;
  const avgHR =
    totalSessions > 0
      ? Math.round(summaries.reduce((a, s) => a + s.avgHR, 0) / totalSessions)
      : 0;

  const withDist = summaries.filter((s) => s.distMi && s.distMi > 0);
  const totalDistMi = withDist.reduce((a, s) => a + (s.distMi || 0), 0);
  const avgPaceMin =
    withDist.length > 0
      ? withDist.reduce((a, s) => a + (s.paceMinPerMi || 0), 0) / withDist.length
      : null;

  const latestRHR = restingHR.length > 0 ? restingHR[restingHR.length - 1].bpm : null;
  const earliestRHR = restingHR.length > 5 ? restingHR[0].bpm : null;
  const rhrDelta =
    earliestRHR != null && latestRHR != null
      ? Math.round(latestRHR - earliestRHR)
      : null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="label">Sessions</div>
        <div className="value">{totalSessions}</div>
        <div className="unit">{ACTIVITY_TABS[activeTab].label.toLowerCase()}</div>
      </div>
      <div className="stat-card">
        <div className="label">Avg Duration</div>
        <div className="value">{avgDuration}</div>
        <div className="unit">minutes</div>
      </div>
      <div className="stat-card">
        <div className="label">Avg Heart Rate</div>
        <div className="value">{avgHR}</div>
        <div className="unit">bpm across sessions</div>
      </div>
      <div className="stat-card">
        <div className="label">Total Distance</div>
        <div className="value">{totalDistMi > 0 ? totalDistMi.toFixed(1) : '—'}</div>
        <div className="unit">{totalDistMi > 0 ? 'miles' : 'no GPS data'}</div>
      </div>
      <div className="stat-card">
        <div className="label">Avg Pace</div>
        <div className="value">{formatPace(avgPaceMin)}</div>
        <div className="unit">{avgPaceMin ? 'min/mile' : ''}</div>
      </div>
      <div className="stat-card">
        <div className="label">Resting HR</div>
        <div className="value">{latestRHR ?? '—'}</div>
        <div className="unit">
          {rhrDelta !== null ? (
            <span className={`stat-delta ${rhrDelta <= 0 ? 'good' : 'neutral'}`}>
              {rhrDelta <= 0 ? '' : '+'}
              {rhrDelta} bpm (period)
            </span>
          ) : (
            'bpm latest'
          )}
        </div>
      </div>
    </div>
  );
}
