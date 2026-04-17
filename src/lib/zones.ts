import type { HrSample, ZoneDistribution, ZoneNumber, Zones } from '../types';

/** Classify a heart rate BPM into a zone number (1–5) based on zone boundaries. */
export function hrZone(bpm: number, zones: Zones): ZoneNumber {
  if (bpm < zones.z1Max) return 1;
  if (bpm < zones.z2Max) return 2;
  if (bpm < zones.z3Max) return 3;
  if (bpm < zones.z4Max) return 4;
  return 5;
}

/** Compute the count and percentage breakdown of HR samples across all 5 zones. */
export function analyzeZoneDistribution(
  samples: HrSample[],
  zones: Zones,
): ZoneDistribution {
  const counts: Record<ZoneNumber, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const s of samples) counts[hrZone(s.bpm, zones)]++;
  const total = samples.length || 1;
  return {
    1: { count: counts[1], pct: (counts[1] / total) * 100 },
    2: { count: counts[2], pct: (counts[2] / total) * 100 },
    3: { count: counts[3], pct: (counts[3] / total) * 100 },
    4: { count: counts[4], pct: (counts[4] / total) * 100 },
    5: { count: counts[5], pct: (counts[5] / total) * 100 },
  };
}
