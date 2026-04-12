import { describe, expect, it } from 'vitest';
import {
  matchesTab,
  friendlyType,
  getHRForWorkout,
  getWorkoutSummary,
  applyDateFilter,
} from './workouts';
import { DEFAULT_ZONES } from '../constants';
import type { HrSample, Workout } from '../types';

describe('matchesTab', () => {
  it('matches stairs variants', () => {
    expect(matchesTab('HKWorkoutActivityTypeStairClimbing', 'stairs')).toBe(true);
    expect(matchesTab('HKWorkoutActivityTypeStepperMachine', 'stairs')).toBe(true);
    expect(matchesTab('HKWorkoutActivityTypeStairStepper', 'stairs')).toBe(true);
  });

  it('matches running', () => {
    expect(matchesTab('HKWorkoutActivityTypeRunning', 'run')).toBe(true);
  });

  it('matches walking', () => {
    expect(matchesTab('HKWorkoutActivityTypeWalking', 'walk')).toBe(true);
  });

  it('does not cross-match', () => {
    expect(matchesTab('HKWorkoutActivityTypeRunning', 'stairs')).toBe(false);
    expect(matchesTab('HKWorkoutActivityTypeWalking', 'run')).toBe(false);
  });

  it('"all" matches any cardio type', () => {
    expect(matchesTab('HKWorkoutActivityTypeRunning', 'all')).toBe(true);
    expect(matchesTab('HKWorkoutActivityTypeWalking', 'all')).toBe(true);
    expect(matchesTab('HKWorkoutActivityTypeStairClimbing', 'all')).toBe(true);
  });

  it('"all" does not match unknown types', () => {
    expect(matchesTab('HKWorkoutActivityTypeCycling', 'all')).toBe(false);
  });
});

describe('friendlyType', () => {
  it('returns Stairs for stair types', () => {
    expect(friendlyType('HKWorkoutActivityTypeStairClimbing')).toBe('Stairs');
    expect(friendlyType('HKWorkoutActivityTypeStepperMachine')).toBe('Stairs');
  });

  it('returns Run for running', () => {
    expect(friendlyType('HKWorkoutActivityTypeRunning')).toBe('Run');
  });

  it('returns Walk for walking', () => {
    expect(friendlyType('HKWorkoutActivityTypeWalking')).toBe('Walk');
  });

  it('returns Other for unknown', () => {
    expect(friendlyType('HKWorkoutActivityTypeCycling')).toBe('Other');
  });
});

describe('getHRForWorkout', () => {
  const samples: HrSample[] = [
    { date: new Date('2026-01-01T10:00:00'), bpm: 80 },
    { date: new Date('2026-01-01T10:05:00'), bpm: 120 },
    { date: new Date('2026-01-01T10:10:00'), bpm: 140 },
    { date: new Date('2026-01-01T10:15:00'), bpm: 130 },
    { date: new Date('2026-01-01T10:20:00'), bpm: 90 },
    { date: new Date('2026-01-01T10:30:00'), bpm: 70 },
  ];

  it('returns samples within workout time range', () => {
    const workout: Workout = {
      type: 'Running',
      duration: 15,
      durationUnit: 'min',
      startDate: new Date('2026-01-01T10:05:00'),
      endDate: new Date('2026-01-01T10:20:00'),
      calories: null,
      distanceMi: null,
      distanceKm: null,
      elevationM: null,
    };
    const result = getHRForWorkout(workout, samples);
    expect(result).toHaveLength(4);
    expect(result[0].bpm).toBe(120);
    expect(result[1].bpm).toBe(140);
    expect(result[2].bpm).toBe(130);
    expect(result[3].bpm).toBe(90);
  });

  it('returns empty for non-overlapping workout', () => {
    const workout: Workout = {
      type: 'Running',
      duration: 5,
      durationUnit: 'min',
      startDate: new Date('2026-01-01T11:00:00'),
      endDate: new Date('2026-01-01T11:05:00'),
      calories: null,
      distanceMi: null,
      distanceKm: null,
      elevationM: null,
    };
    expect(getHRForWorkout(workout, samples)).toHaveLength(0);
  });
});

describe('getWorkoutSummary', () => {
  const samples: HrSample[] = [
    { date: new Date('2026-01-01T10:00:00'), bpm: 120 },
    { date: new Date('2026-01-01T10:05:00'), bpm: 130 },
    { date: new Date('2026-01-01T10:10:00'), bpm: 125 },
  ];

  const workout: Workout = {
    type: 'HKWorkoutActivityTypeRunning',
    duration: 10,
    durationUnit: 'min',
    startDate: new Date('2026-01-01T10:00:00'),
    endDate: new Date('2026-01-01T10:10:00'),
    calories: 150,
    distanceMi: 1.2,
    distanceKm: 1.93,
    elevationM: null,
  };

  it('computes HR stats', () => {
    const summary = getWorkoutSummary(workout, samples, DEFAULT_ZONES);
    expect(summary).not.toBeNull();
    expect(summary!.avgHR).toBe(125);
    expect(summary!.maxHR).toBe(130);
    expect(summary!.minHR).toBe(120);
  });

  it('computes dominant zone', () => {
    const summary = getWorkoutSummary(workout, samples, DEFAULT_ZONES);
    expect(summary!.dominantZone).toBe(2);
  });

  it('computes pace', () => {
    const summary = getWorkoutSummary(workout, samples, DEFAULT_ZONES);
    expect(summary!.paceMinPerMi).toBeCloseTo(10 / 1.2, 1);
    expect(summary!.paceStr).toBeTruthy();
  });

  it('computes cardiac efficiency', () => {
    const summary = getWorkoutSummary(workout, samples, DEFAULT_ZONES);
    expect(summary!.cardiacEfficiency).toBeGreaterThan(0);
  });

  it('returns null when no HR samples overlap', () => {
    const farWorkout: Workout = {
      ...workout,
      startDate: new Date('2026-06-01T10:00:00'),
      endDate: new Date('2026-06-01T10:10:00'),
    };
    expect(getWorkoutSummary(farWorkout, samples, DEFAULT_ZONES)).toBeNull();
  });
});

describe('applyDateFilter', () => {
  const items = [
    { d: new Date('2026-01-01') },
    { d: new Date('2026-02-01') },
    { d: new Date('2026-03-01') },
    { d: new Date('2026-04-01') },
  ];

  it('returns all items when no filter set', () => {
    expect(applyDateFilter(items, (i) => i.d, null, null)).toHaveLength(4);
  });

  it('filters by dateFrom', () => {
    const result = applyDateFilter(items, (i) => i.d, new Date('2026-02-15'), null);
    expect(result).toHaveLength(2);
  });

  it('filters by dateTo', () => {
    const result = applyDateFilter(items, (i) => i.d, null, new Date('2026-02-15'));
    expect(result).toHaveLength(2);
  });

  it('filters by both', () => {
    const result = applyDateFilter(
      items,
      (i) => i.d,
      new Date('2026-01-15'),
      new Date('2026-03-15'),
    );
    expect(result).toHaveLength(2);
  });
});
