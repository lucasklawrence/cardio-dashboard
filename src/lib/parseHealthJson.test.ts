import { describe, expect, it } from 'vitest';
import { hydrateHealthJson } from './parseHealthJson';

describe('hydrateHealthJson', () => {
  it('hydrates compact HR samples into full format', () => {
    const raw = {
      heartRateSamples: [{ d: '2026-01-01T10:00:00', b: 120.5 }],
    };
    const data = hydrateHealthJson(raw);
    expect(data.heartRateSamples).toHaveLength(1);
    expect(data.heartRateSamples[0].bpm).toBe(120.5);
    expect(data.heartRateSamples[0].date).toBeInstanceOf(Date);
  });

  it('hydrates compact workouts', () => {
    const raw = {
      workouts: [
        {
          t: 'HKWorkoutActivityTypeRunning',
          dur: 30,
          du: 'min',
          sd: '2026-01-01T10:00:00',
          ed: '2026-01-01T10:30:00',
          cal: 250,
          dmi: 3.1,
          dkm: 5.0,
          elev: null,
          elevF: 0,
        },
      ],
    };
    const data = hydrateHealthJson(raw);
    expect(data.workouts).toHaveLength(1);
    expect(data.workouts[0].type).toBe('HKWorkoutActivityTypeRunning');
    expect(data.workouts[0].duration).toBe(30);
    expect(data.workouts[0].distanceMi).toBe(3.1);
    expect(data.workouts[0].startDate).toBeInstanceOf(Date);
  });

  it('hydrates VO2max samples', () => {
    const raw = {
      vo2max: [{ d: '2026-01-01T10:00:00', v: 42.5 }],
    };
    const data = hydrateHealthJson(raw);
    expect(data.vo2max).toHaveLength(1);
    expect(data.vo2max[0].value).toBe(42.5);
  });

  it('sorts heart rate samples by date', () => {
    const raw = {
      heartRateSamples: [
        { d: '2026-03-01T10:00:00', b: 80 },
        { d: '2026-01-01T10:00:00', b: 70 },
        { d: '2026-02-01T10:00:00', b: 75 },
      ],
    };
    const data = hydrateHealthJson(raw);
    expect(data.heartRateSamples[0].bpm).toBe(70);
    expect(data.heartRateSamples[1].bpm).toBe(75);
    expect(data.heartRateSamples[2].bpm).toBe(80);
  });

  it('sorts resting HR by date', () => {
    const raw = {
      restingHR: [
        { d: '2026-06-01T00:00:00', b: 60 },
        { d: '2026-01-01T00:00:00', b: 55 },
      ],
    };
    const data = hydrateHealthJson(raw);
    expect(data.restingHR[0].bpm).toBe(55);
    expect(data.restingHR[1].bpm).toBe(60);
  });

  it('sorts vo2max by date', () => {
    const raw = {
      vo2max: [
        { d: '2026-12-01T00:00:00', v: 45 },
        { d: '2026-06-01T00:00:00', v: 42 },
      ],
    };
    const data = hydrateHealthJson(raw);
    expect(data.vo2max[0].value).toBe(42);
    expect(data.vo2max[1].value).toBe(45);
  });

  it('sorts workouts by start date', () => {
    const base = {
      t: 'HKWorkoutActivityTypeRunning',
      dur: 30,
      du: 'min',
      cal: null,
      dmi: null,
      dkm: null,
      elev: null,
    };
    const raw = {
      workouts: [
        { ...base, sd: '2026-03-01T10:00:00', ed: '2026-03-01T10:30:00' },
        { ...base, sd: '2026-01-01T10:00:00', ed: '2026-01-01T10:30:00' },
      ],
    };
    const data = hydrateHealthJson(raw);
    expect(data.workouts[0].startDate.getTime()).toBeLessThan(
      data.workouts[1].startDate.getTime(),
    );
  });

  it('handles empty/missing arrays', () => {
    const data = hydrateHealthJson({});
    expect(data.heartRateSamples).toHaveLength(0);
    expect(data.restingHR).toHaveLength(0);
    expect(data.workouts).toHaveLength(0);
    expect(data.vo2max).toHaveLength(0);
    expect(data.stepCounts).toHaveLength(0);
  });
});
