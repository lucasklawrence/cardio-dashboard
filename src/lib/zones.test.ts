import { describe, expect, it } from 'vitest';
import { hrZone, analyzeZoneDistribution } from './zones';
import { DEFAULT_ZONES } from '../constants';

describe('hrZone', () => {
  const zones = DEFAULT_ZONES;

  it('returns zone 1 for low BPM', () => {
    expect(hrZone(100, zones)).toBe(1);
  });

  it('returns zone 2 at z1Max boundary', () => {
    expect(hrZone(114, zones)).toBe(2);
  });

  it('returns zone 2 in middle of range', () => {
    expect(hrZone(125, zones)).toBe(2);
  });

  it('returns zone 3 at z2Max boundary', () => {
    expect(hrZone(133, zones)).toBe(3);
  });

  it('returns zone 4 at z3Max boundary', () => {
    expect(hrZone(152, zones)).toBe(4);
  });

  it('returns zone 5 at z4Max boundary', () => {
    expect(hrZone(171, zones)).toBe(5);
  });

  it('returns zone 5 for very high BPM', () => {
    expect(hrZone(200, zones)).toBe(5);
  });
});

describe('analyzeZoneDistribution', () => {
  const zones = DEFAULT_ZONES;

  it('returns all zeros for empty samples', () => {
    const dist = analyzeZoneDistribution([], zones);
    for (let z = 1; z <= 5; z++) {
      expect(dist[z as 1 | 2 | 3 | 4 | 5].count).toBe(0);
    }
  });

  it('distributes samples into correct zones', () => {
    const samples = [
      { date: new Date(), bpm: 100 },
      { date: new Date(), bpm: 120 },
      { date: new Date(), bpm: 140 },
      { date: new Date(), bpm: 160 },
      { date: new Date(), bpm: 180 },
    ];
    const dist = analyzeZoneDistribution(samples, zones);
    expect(dist[1].count).toBe(1);
    expect(dist[2].count).toBe(1);
    expect(dist[3].count).toBe(1);
    expect(dist[4].count).toBe(1);
    expect(dist[5].count).toBe(1);
    expect(dist[1].pct).toBe(20);
  });

  it('calculates percentages correctly', () => {
    const samples = [
      { date: new Date(), bpm: 120 },
      { date: new Date(), bpm: 125 },
      { date: new Date(), bpm: 130 },
      { date: new Date(), bpm: 180 },
    ];
    const dist = analyzeZoneDistribution(samples, zones);
    expect(dist[2].count).toBe(3);
    expect(dist[2].pct).toBe(75);
    expect(dist[5].count).toBe(1);
    expect(dist[5].pct).toBe(25);
  });
});
