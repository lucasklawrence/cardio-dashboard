import { useCallback, useState } from 'react';

const STORAGE_KEY = 'fitness-dashboard-goals';

function readGoals(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeGoals(goals: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function getGoal(metricId: string): number | null {
  const goals = readGoals();
  return goals[metricId] ?? null;
}

export function setGoal(metricId: string, value: number | null): void {
  const goals = readGoals();
  if (value == null) {
    delete goals[metricId];
  } else {
    goals[metricId] = value;
  }
  writeGoals(goals);
}

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
