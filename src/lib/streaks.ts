import type { Workout } from '../types';

export interface StreakResult {
  current: number;
  longest: number;
}

/** Get "YYYY-MM-DD" local date key from a Date. */
function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Add N days to a date key, returning a new date key. */
function addDays(dateKey: string, n: number): string {
  const d = new Date(dateKey + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

/**
 * Compute current and longest workout streaks.
 * A streak is consecutive calendar days with at least one workout.
 * "Current" streak counts backward from today (or the most recent workout day).
 */
export function computeStreaks(workouts: Workout[]): StreakResult {
  if (workouts.length === 0) return { current: 0, longest: 0 };

  const days = new Set(workouts.map((w) => toDateKey(w.startDate)));
  const sorted = Array.from(days).sort();

  // Compute longest streak
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Compute current streak (must include today or yesterday to be "current")
  const today = toDateKey(new Date());
  const yesterday = addDays(today, -1);
  const lastDay = sorted[sorted.length - 1];

  if (lastDay !== today && lastDay !== yesterday) {
    return { current: 0, longest };
  }

  let current = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    if (addDays(sorted[i], 1) === sorted[i + 1]) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

export interface WeeklyFrequency {
  weekStart: Date;
  sessions: number;
}

/** Compute sessions per ISO week. */
export function weeklyFrequency(workouts: Workout[]): WeeklyFrequency[] {
  if (workouts.length === 0) return [];

  const weeks = new Map<string, number>();
  for (const w of workouts) {
    const d = new Date(w.startDate);
    const day = d.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayOffset);
    const key = toDateKey(monday);
    weeks.set(key, (weeks.get(key) || 0) + 1);
  }

  return Array.from(weeks.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, sessions]) => ({
      weekStart: new Date(key + 'T00:00:00'),
      sessions,
    }));
}
