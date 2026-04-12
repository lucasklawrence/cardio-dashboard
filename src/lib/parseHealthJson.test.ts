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

  it('hydrates HRV samples', () => {
    const raw = {
      hrv: [{ d: '2026-01-01T10:00:00', v: 45.3 }],
    };
    const data = hydrateHealthJson(raw);
    expect(data.hrv).toHaveLength(1);
    expect(data.hrv[0].value).toBe(45.3);
    expect(data.hrv[0].date).toBeInstanceOf(Date);
  });

  it('hydrates walking HR samples', () => {
    const raw = {
      walkingHR: [{ d: '2026-01-01T10:00:00', b: 98.2 }],
    };
    const data = hydrateHealthJson(raw);
    expect(data.walkingHR).toHaveLength(1);
    expect(data.walkingHR[0].bpm).toBe(98.2);
    expect(data.walkingHR[0].date).toBeInstanceOf(Date);
  });

  it('hydrates body mass samples', () => {
    const raw = {
      bodyMass: [{ d: '2026-01-01T10:00:00', lb: 175.5 }],
    };
    const data = hydrateHealthJson(raw);
    expect(data.bodyMass).toHaveLength(1);
    expect(data.bodyMass[0].lbs).toBe(175.5);
    expect(data.bodyMass[0].date).toBeInstanceOf(Date);
  });

  it('handles empty/missing arrays', () => {
    const data = hydrateHealthJson({});
    expect(data.heartRateSamples).toHaveLength(0);
    expect(data.restingHR).toHaveLength(0);
    expect(data.workouts).toHaveLength(0);
    expect(data.vo2max).toHaveLength(0);
    expect(data.stepCounts).toHaveLength(0);
    expect(data.hrv).toHaveLength(0);
    expect(data.walkingHR).toHaveLength(0);
    expect(data.bodyMass).toHaveLength(0);
  });
});
