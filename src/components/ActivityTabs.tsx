import { useMemo } from 'react';
import { ACTIVITY_TABS, ACTIVITY_TAB_ORDER } from '../constants';
import { useHealthDataContext } from '../state/HealthDataContext';
import { applyDateFilter, getWorkoutsForTab } from '../lib/workouts';

/** Tab bar for switching between activity types, showing session counts per tab. */
export function ActivityTabs() {
  const { healthData, activeTab, setActiveTab, dateFrom, dateTo } =
    useHealthDataContext();

  const counts = useMemo(() => {
    if (!healthData) return {} as Record<string, number>;
    const result: Record<string, number> = {};
    for (const tab of ACTIVITY_TAB_ORDER) {
      result[tab] = applyDateFilter(
        getWorkoutsForTab(healthData, tab),
        (w) => w.startDate,
        dateFrom,
        dateTo,
      ).length;
    }
    return result;
  }, [healthData, dateFrom, dateTo]);

  return (
    <div className="tabs">
      {ACTIVITY_TAB_ORDER.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`tab${tab === activeTab ? ' active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {ACTIVITY_TABS[tab].label}
          <span className="tab-count">{counts[tab] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
