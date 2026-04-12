import type { HealthData } from '../types';

interface DataSummaryProps {
  healthData: HealthData;
  totalSessions: number;
  stairCount: number;
  runCount: number;
  walkCount: number;
}

export function DataSummary({
  healthData,
  totalSessions,
  stairCount,
  runCount,
  walkCount,
}: DataSummaryProps) {
  return (
    <div className="section">
      <div className="section-header">
        <h2>Data Summary</h2>
      </div>
      <div className="chart-container">
        <p className="data-summary">
          Heart rate samples:{' '}
          <strong>{healthData.heartRateSamples.length.toLocaleString()}</strong>
          <br />
          Resting HR readings:{' '}
          <strong>{healthData.restingHR.length.toLocaleString()}</strong>
          <br />
          HRV readings:{' '}
          <strong>{healthData.hrv.length.toLocaleString()}</strong>
          <br />
          Walking HR averages:{' '}
          <strong>{healthData.walkingHR.length.toLocaleString()}</strong>
          <br />
          Body mass entries:{' '}
          <strong>{healthData.bodyMass.length.toLocaleString()}</strong>
          <br />
          Workouts in range: <strong>{totalSessions}</strong>
          <br />
          Stair climber: <strong>{stairCount}</strong> · Running:{' '}
          <strong>{runCount}</strong> · Walking: <strong>{walkCount}</strong>
        </p>
      </div>
    </div>
  );
}
