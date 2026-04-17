import { useCallback, useState } from 'react';

const STORAGE_KEY = 'fitness-dashboard-goals';

function readGoals(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([, v]) => typeof v === 'number' && Number.isFinite(v),
      ),
    ) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeGoals(goals: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // no-op: keep UI responsive even when persistence is unavailable
  }
}

/** Read a persisted goal value from localStorage by metric ID. */
export function getGoal(metricId: string): number | null {
  const goals = readGoals();
  return goals[metricId] ?? null;
}

/** Persist a goal value to localStorage, or remove it when value is null. */
export function setGoal(metricId: string, value: number | null): void {
  const goals = readGoals();
  if (value == null) {
    delete goals[metricId];
  } else {
    goals[metricId] = value;
  }
  writeGoals(goals);
}

/** React hook for reading and writing a localStorage-backed goal value. */
export function useGoal(metricId: string): [number | null, (v: number | null) => void] {
  const [value, setValueState] = useState<number | null>(() => getGoal(metricId));

  const setValue = useCallback(
    (v: number | null) => {
      setGoal(metricId, v);
      setValueState(v);
    },
    [metricId],
  );

  return [value, setValue];
}
