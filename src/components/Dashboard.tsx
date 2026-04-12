import { useMemo } from 'react';
import { ACTIVITY_TABS } from '../constants';
import { useHealthDataContext } from '../state/HealthDataContext';
import {
  applyDateFilter,
  getWorkoutSummary,
  getWorkoutsForTab,
  matchesTab,
} from '../lib/workouts';
import { analyzeZoneDistribution } from '../lib/zones';
import type { ActivityTab, WorkoutSummary } from '../types';

import { ZoneSettings } from './ZoneSettings';
import { ActivityTabs } from './ActivityTabs';
import { DateFilter } from './DateFilter';
import { StatsGrid } from './StatsGrid';
import { ZoneBar } from './ZoneBar';
import { SessionLog } from './SessionLog';
import { DataSummary } from './DataSummary';

import { RhrChart } from './charts/RhrChart';
import { Vo2Chart } from './charts/Vo2Chart';
import { HrvChart } from './charts/HrvChart';
import { WalkingHrChart } from './charts/WalkingHrChart';
import { BodyMassChart } from './charts/BodyMassChart';
import { SessionHrChart } from './charts/SessionHrChart';
import { PaceChart } from './charts/PaceChart';
import { EfficiencyChart } from './charts/EfficiencyChart';
import { PaceHrScatter } from './charts/PaceHrScatter';

const SUB_ACTIVITIES: ActivityTab[] = ['stairs', 'run', 'walk'];

function countActivityCharts(summaries: WorkoutSummary[]) {
  const withPace = summaries.filter(
    (s) => s.paceMinPerMi && s.paceMinPerMi > 0 && s.paceMinPerMi < 30,
  );
  const withEff = summaries.filter((s) => s.cardiacEfficiency && s.cardiacEfficiency > 0);
  return (
    (summaries.length > 1 ? 1 : 0) +
    (withPace.length > 1 ? 1 : 0) +
    (withEff.length > 2 ? 1 : 0) +
    (withPace.length > 2 ? 1 : 0)
  );
}

interface ActivityChartsProps {
  summaries: WorkoutSummary[];
  zones: ReturnType<typeof useHealthDataContext>['zones'];
  figStart: number;
}

function ActivityCharts({ summaries, zones, figStart }: ActivityChartsProps) {
  const withPace = summaries.filter(
    (s) => s.paceMinPerMi && s.paceMinPerMi > 0 && s.paceMinPerMi < 30,
  );
  const withEff = summaries.filter((s) => s.cardiacEfficiency && s.cardiacEfficiency > 0);
  let fig = figStart;

  return (
    <>
      {summaries.length > 1 && (
        <div className="chart-container" style={{ marginBottom: 12 }}>
          <span className="fig-label">FIG. {String(fig++).padStart(2, '0')}</span>
          <p className="chart-caption">Avg HR per session</p>
          <SessionHrChart summaries={summaries} zones={zones} />
        </div>
      )}
      {withPace.length > 1 && (
        <div className="chart-container" style={{ marginBottom: 12 }}>
          <span className="fig-label">FIG. {String(fig++).padStart(2, '0')}</span>
          <p className="chart-caption">Pace trend — min/mile</p>
          <PaceChart summaries={summaries} zones={zones} />
        </div>
      )}
      {withEff.length > 2 && (
        <div className="chart-container" style={{ marginBottom: 12 }}>
          <span className="fig-label">FIG. {String(fig++).padStart(2, '0')}</span>
          <p className="chart-caption">Cardiac efficiency — meters per heartbeat</p>
          <EfficiencyChart summaries={summaries} />
        </div>
      )}
      {withPace.length > 2 && (
        <div className="chart-container">
          <span className="fig-label">FIG. {String(fig).padStart(2, '0')}</span>
          <p className="chart-caption">Pace at heart rate — down+left = fitter</p>
          <PaceHrScatter summaries={summaries} />
        </div>
      )}
    </>
  );
}

export function Dashboard() {
  const { healthData, activeTab, dateFrom, dateTo, zones } = useHealthDataContext();

  const view = useMemo(() => {
    if (!healthData) return null;

    const filteredWorkouts = applyDateFilter(
      getWorkoutsForTab(healthData, activeTab),
      (w) => w.startDate,
      dateFrom,
      dateTo,
    );
    const summaries = filteredWorkouts
      .map((w) => getWorkoutSummary(w, healthData.heartRateSamples, zones))
      .filter((s): s is WorkoutSummary => s !== null);

    const rhr = applyDateFilter(healthData.restingHR, (r) => r.date, dateFrom, dateTo);
    const vo2 = applyDateFilter(healthData.vo2max, (v) => v.date, dateFrom, dateTo);
    const hrv = applyDateFilter(healthData.hrv, (h) => h.date, dateFrom, dateTo);
    const walkingHR = applyDateFilter(healthData.walkingHR, (w) => w.date, dateFrom, dateTo);
    const bodyMass = applyDateFilter(healthData.bodyMass, (b) => b.date, dateFrom, dateTo);

    const allSessionHR = summaries.flatMap((s) => s.hrSamples);
    const overallZones = analyzeZoneDistribution(allSessionHR, zones);

    return { summaries, rhr, vo2, hrv, walkingHR, bodyMass, overallZones };
  }, [healthData, activeTab, dateFrom, dateTo, zones]);

  const tabCounts = useMemo(() => {
    if (!healthData) return { stairs: 0, run: 0, walk: 0 };
    return {
      stairs: applyDateFilter(
        getWorkoutsForTab(healthData, 'stairs'),
        (w) => w.startDate,
        dateFrom,
        dateTo,
      ).length,
      run: applyDateFilter(
        getWorkoutsForTab(healthData, 'run'),
        (w) => w.startDate,
        dateFrom,
        dateTo,
      ).length,
      walk: applyDateFilter(
        getWorkoutsForTab(healthData, 'walk'),
        (w) => w.startDate,
        dateFrom,
        dateTo,
      ).length,
    };
  }, [healthData, dateFrom, dateTo]);

  if (!healthData || !view) return null;

  const { summaries, rhr, vo2, hrv, walkingHR, bodyMass, overallZones } = view;
  const totalSessions = summaries.length;

  let figCounter = 1;

  return (
    <>
      <div className="dashboard-section">
        <ZoneSettings />
      </div>
      <div className="dashboard-section">
        <div className="tab-row">
          <ActivityTabs />
        </div>
        <DateFilter />
      </div>

      {totalSessions === 0 ? (
        <div className="empty-state dashboard-section">
          <p>
            No {ACTIVITY_TABS[activeTab].label.toLowerCase()} sessions found in this
            date range.
          </p>
          <p className="hint-text">
            Try adjusting the date filter or switching tabs.
          </p>
        </div>
      ) : (
        <>
          <div className="dashboard-section">
            <StatsGrid
              summaries={summaries}
              restingHR={rhr}
              activeTab={activeTab}
            />
          </div>
          <div className="dashboard-section">
            <ZoneBar zones={overallZones} meta={`${totalSessions} sessions combined`} />
          </div>

          {activeTab === 'all' ? (
            <>
              {rhr.length > 1 && (
                <div className="dashboard-section">
                  <RhrChart data={rhr} fig={figCounter++} />
                </div>
              )}
              {vo2.length > 1 && (
                <div className="dashboard-section">
                  <Vo2Chart data={vo2} fig={figCounter++} />
                </div>
              )}
              {hrv.length > 1 && (
                <div className="dashboard-section">
                  <HrvChart data={hrv} fig={figCounter++} />
                </div>
              )}
              {walkingHR.length > 1 && (
                <div className="dashboard-section">
                  <WalkingHrChart data={walkingHR} fig={figCounter++} />
                </div>
              )}
              {bodyMass.length > 1 && (
                <div className="dashboard-section">
                  <BodyMassChart data={bodyMass} fig={figCounter++} />
                </div>
              )}

              {SUB_ACTIVITIES.map((act) => {
                const actSummaries = summaries.filter((s) => matchesTab(s.type, act));
                if (actSummaries.length === 0) return null;
                const startFig = figCounter;
                figCounter += countActivityCharts(actSummaries);
                return (
                  <div className="section dashboard-section" key={act}>
                    <div className="section-header">
                      <h2>{ACTIVITY_TABS[act].label}</h2>
                      <span className="meta">{actSummaries.length} sessions</span>
                    </div>
                    <ActivityCharts summaries={actSummaries} zones={zones} figStart={startFig} />
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {summaries.length > 1 && (
                <div className="section dashboard-section">
                  <div className="section-header">
                    <h2>Avg HR Per Session</h2>
                    <span className="meta">Tracking cardiac efficiency over time</span>
                  </div>
                  <div className="chart-container">
                    <span className="fig-label">FIG. {String(figCounter++).padStart(2, '0')}</span>
                    <SessionHrChart summaries={summaries} zones={zones} />
                  </div>
                </div>
              )}
              {summaries.filter((s) => s.paceMinPerMi && s.paceMinPerMi < 30).length >
                1 && (
                <div className="section dashboard-section">
                  <div className="section-header">
                    <h2>Pace Trend</h2>
                    <span className="meta">Min/mile — lower is faster</span>
                  </div>
                  <div className="chart-container">
                    <span className="fig-label">FIG. {String(figCounter++).padStart(2, '0')}</span>
                    <PaceChart summaries={summaries} zones={zones} />
                  </div>
                </div>
              )}
              {summaries.filter((s) => s.cardiacEfficiency && s.cardiacEfficiency > 0)
                .length > 2 && (
                <div className="section dashboard-section">
                  <div className="section-header">
                    <h2>Cardiac Efficiency</h2>
                    <span className="meta">Meters per heartbeat — higher = fitter</span>
                  </div>
                  <div className="chart-container">
                    <span className="fig-label">FIG. {String(figCounter++).padStart(2, '0')}</span>
                    <EfficiencyChart summaries={summaries} />
                  </div>
                </div>
              )}
              {summaries.filter((s) => s.paceMinPerMi && s.paceMinPerMi < 30).length >
                2 && (
                <div className="section dashboard-section">
                  <div className="section-header">
                    <h2>Pace at Heart Rate</h2>
                    <span className="meta">
                      Each dot is a session — moving down+left = getting fitter
                    </span>
                  </div>
                  <div className="chart-container">
                    <span className="fig-label">FIG. {String(figCounter++).padStart(2, '0')}</span>
                    <PaceHrScatter summaries={summaries} />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="dashboard-section">
            <SessionLog summaries={summaries} activeTab={activeTab} />
          </div>
          <div className="dashboard-section">
            <DataSummary
              healthData={healthData}
              totalSessions={totalSessions}
              stairCount={tabCounts.stairs}
              runCount={tabCounts.run}
              walkCount={tabCounts.walk}
            />
          </div>
        </>
      )}
    </>
  );
}
