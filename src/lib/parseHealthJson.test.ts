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

  it('sorts resting HR by date', () => {
    const raw = {
      restingHR: [
        { d: '2026-06-01T00:00:00', b: 50 },
        { d: '2026-01-01T00:00:00', b: 60 },
      ],
    };
    const data = hydrateHealthJson(raw);
    expect(data.restingHR.map((s) => s.date.getTime())).toEqual([
      new Date('2026-01-01T00:00:00').getTime(),
      new Date('2026-06-01T00:00:00').getTime(),
    ]);
  });

  it('hydrates step count samples', () => {
    const raw = {
      stepCounts: [{ d: '2026-01-15', c: 10000 }],
    };
    const data = hydrateHealthJson(raw);
    expect(data.stepCounts).toHaveLength(1);
    expect(data.stepCounts[0].count).toBe(10000);
    expect(data.stepCounts[0].date).toBeInstanceOf(Date);
  });

  it('hydrates sleep samples', () => {
    const raw = {
      sleep: [{ d: '2026-01-15', h: 7.5 }],
    };
    const data = hydrateHealthJson(raw);
    expect(data.sleep).toHaveLength(1);
    expect(data.sleep[0].hours).toBe(7.5);
    expect(data.sleep[0].date).toBeInstanceOf(Date);
  });

  it('hydrates active energy samples', () => {
    const raw = {
      activeEnergy: [{ d: '2026-01-15', k: 450 }],
    };
    const data = hydrateHealthJson(raw);
    expect(data.activeEnergy).toHaveLength(1);
    expect(data.activeEnergy[0].kcal).toBe(450);
    expect(data.activeEnergy[0].date).toBeInstanceOf(Date);
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
    expect(data.sleep).toHaveLength(0);
    expect(data.activeEnergy).toHaveLength(0);
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
    expect(data.heartRateSamples.map((s) => s.bpm)).toEqual([70, 75, 80]);
  });

  it('sorts workouts by startDate', () => {
    const base = {
      t: 'HKWorkoutActivityTypeRunning',
      dur: 30,
      du: 'min',
      cal: 250,
      dmi: 3.1,
      dkm: 5.0,
      elev: null,
    };
    const raw = {
      workouts: [
        { ...base, sd: '2026-03-01T10:00:00', ed: '2026-03-01T10:30:00' },
        { ...base, sd: '2026-01-01T10:00:00', ed: '2026-01-01T10:30:00' },
      ],
    };
    const data = hydrateHealthJson(raw);
    expect(data.workouts[0].startDate.getTime()).toBeLessThan(data.workouts[1].startDate.getTime());
  });

  it('sorts vo2max, hrv, walkingHR, and bodyMass by date', () => {
    const raw = {
      vo2max: [
        { d: '2026-02-01T10:00:00', v: 40 },
        { d: '2026-01-01T10:00:00', v: 42 },
      ],
      hrv: [
        { d: '2026-03-01T10:00:00', v: 50 },
        { d: '2026-01-01T10:00:00', v: 45 },
      ],
      walkingHR: [
        { d: '2026-02-01T10:00:00', b: 100 },
        { d: '2026-01-01T10:00:00', b: 95 },
      ],
      bodyMass: [
        { d: '2026-03-01T10:00:00', lb: 180 },
        { d: '2026-01-01T10:00:00', lb: 175 },
      ],
    };
    const data = hydrateHealthJson(raw);
    expect(data.vo2max.map((s) => s.value)).toEqual([42, 40]);
    expect(data.hrv.map((s) => s.value)).toEqual([45, 50]);
    expect(data.walkingHR.map((s) => s.bpm)).toEqual([95, 100]);
    expect(data.bodyMass.map((s) => s.lbs)).toEqual([175, 180]);
  });
});
