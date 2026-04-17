import { describe, it, expect, vi, afterEach } from 'vitest';
import { computeStreaks, weeklyFrequency } from './streaks';
import type { Workout } from '../types';

function workout(dateStr: string): Workout {
  const start = new Date(dateStr + 'T08:00:00');
  const end = new Date(start.getTime() + 30 * 60_000);
  return {
    type: 'HKWorkoutActivityTypeRunning',
    duration: 30,
    durationUnit: 'min',
    startDate: start,
    endDate: end,
    calories: null,
    distanceMi: null,
    distanceKm: null,
    elevationM: null,
  };
}

describe('computeStreaks', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0/0 for no workouts', () => {
    expect(computeStreaks([])).toEqual({ current: 0, longest: 0 });
  });

  it('returns 1-day streak when only today has a workout', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T12:00:00'));
    const result = computeStreaks([workout('2026-04-16')]);
    expect(result).toEqual({ current: 1, longest: 1 });
  });

  it('computes consecutive day streak', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T12:00:00'));
    const workouts = [
      workout('2026-04-13'),
      workout('2026-04-14'),
      workout('2026-04-15'),
      workout('2026-04-16'),
    ];
    const result = computeStreaks(workouts);
    expect(result).toEqual({ current: 4, longest: 4 });
  });

  it('resets current streak on gap', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T12:00:00'));
    const workouts = [
      workout('2026-04-10'),
      workout('2026-04-11'),
      workout('2026-04-12'),
      // gap on 04-13, 04-14
      workout('2026-04-15'),
      workout('2026-04-16'),
    ];
    const result = computeStreaks(workouts);
    expect(result.current).toBe(2);
    expect(result.longest).toBe(3);
  });

  it('current streak is 0 when last workout was 2+ days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T12:00:00'));
    const workouts = [workout('2026-04-10'), workout('2026-04-11'), workout('2026-04-12')];
    const result = computeStreaks(workouts);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(3);
  });

  it('counts yesterday as current if no workout today yet', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T12:00:00'));
    const workouts = [workout('2026-04-13'), workout('2026-04-14'), workout('2026-04-15')];
    const result = computeStreaks(workouts);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it('deduplicates multiple workouts on the same day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T12:00:00'));
    const workouts = [
      workout('2026-04-15'),
      workout('2026-04-15'),
      workout('2026-04-16'),
      workout('2026-04-16'),
    ];
    const result = computeStreaks(workouts);
    expect(result).toEqual({ current: 2, longest: 2 });
  });
});

describe('weeklyFrequency', () => {
  it('returns empty for no workouts', () => {
    expect(weeklyFrequency([])).toEqual([]);
  });

  it('groups workouts by ISO week (Mon start)', () => {
    // 2026-04-13 = Monday, 2026-04-19 = Sunday
    const workouts = [
      workout('2026-04-13'),
      workout('2026-04-14'),
      workout('2026-04-15'),
      workout('2026-04-20'), // next Monday
    ];
    const result = weeklyFrequency(workouts);
    expect(result).toHaveLength(2);
    expect(result[0].sessions).toBe(3);
    expect(result[1].sessions).toBe(1);
  });

  it('returns results sorted by week', () => {
    const workouts = [workout('2026-04-20'), workout('2026-04-06')];
    const result = weeklyFrequency(workouts);
    expect(result[0].weekStart < result[1].weekStart).toBe(true);
  });
});
