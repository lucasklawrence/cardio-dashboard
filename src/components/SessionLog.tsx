import type { ActivityTab, WorkoutSummary } from '../types';
import { friendlyType } from '../lib/workouts';
import { formatFullDate } from '../lib/format';

interface SessionLogProps {
  summaries: WorkoutSummary[];
  activeTab: ActivityTab;
}

function zoneBadgeClass(dominantZone: number): string {
  if (dominantZone <= 2) return 'badge-z2';
  if (dominantZone === 3) return 'badge-z3';
  if (dominantZone >= 4) return 'badge-z4';
  return 'badge-mixed';
}

/** Tabular log of the 50 most recent workout sessions with date, type, duration, pace, HR, and zone data. */
export function SessionLog({ summaries, activeTab }: SessionLogProps) {
  const showTypeCol = activeTab === 'all';
  const anyDist = summaries.some((s) => s.distMi && s.distMi > 0);
  const recent = summaries.slice(-50).reverse();

  return (
    <div className="section">
      <div className="section-header">
        <h2>Session Log</h2>
        <span className="meta">{summaries.length} sessions</span>
      </div>
      <div className="chart-container scroll-x">
        <table className="workout-table">
          <thead>
            <tr>
              <th>Date</th>
              {showTypeCol && <th>Type</th>}
              <th>Duration</th>
              {anyDist && (
                <>
                  <th>Distance</th>
                  <th>Pace</th>
                </>
              )}
              <th>Avg HR</th>
              <th>Max HR</th>
              <th>Zone</th>
              <th>Z2 %</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((s, i) => {
              const z2pct = Math.round(s.zones[2]?.pct || 0);
              const distStr = s.distMi ? `${s.distMi.toFixed(2)} mi` : '—';
              return (
                <tr key={`${s.startDate.getTime()}-${i}`}>
                  <td>{formatFullDate(s.startDate)}</td>
                  {showTypeCol && (
                    <td>
                      <span style={{ opacity: 0.6 }}>{friendlyType(s.type)}</span>
                    </td>
                  )}
                  <td>{s.durationMin} min</td>
                  {anyDist && (
                    <>
                      <td>{distStr}</td>
                      <td>{s.paceStr || '—'}</td>
                    </>
                  )}
                  <td>{s.avgHR} bpm</td>
                  <td>{s.maxHR} bpm</td>
                  <td>
                    <span className={`badge ${zoneBadgeClass(s.dominantZone)}`}>
                      Z{s.dominantZone}
                    </span>
                  </td>
                  <td>{z2pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
