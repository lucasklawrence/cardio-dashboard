import type { HealthData } from '../types';

interface CompactSample {
  d: string;
  b: number;
}

interface CompactVo2 {
  d: string;
  v: number;
}

interface CompactWorkout {
  t: string;
  dur: number;
  du: string;
  sd: string;
  ed: string;
  cal: number | null;
  dmi: number | null;
  dkm: number | null;
  elev: number | null;
  elevF?: number | null;
}

interface CompactHealthData {
  heartRateSamples?: CompactSample[];
  restingHR?: CompactSample[];
  workouts?: CompactWorkout[];
  vo2max?: CompactVo2[];
}

export function hydrateHealthJson(raw: CompactHealthData): HealthData {
  return {
    heartRateSamples: (raw.heartRateSamples || []).map((s) => ({
      date: new Date(s.d),
      bpm: s.b,
    })),
    restingHR: (raw.restingHR || []).map((s) => ({
      date: new Date(s.d),
      bpm: s.b,
    })),
    workouts: (raw.workouts || []).map((w) => ({
      type: w.t,
      duration: w.dur,
      durationUnit: w.du,
      startDate: new Date(w.sd),
      endDate: new Date(w.ed),
      calories: w.cal,
      distanceMi: w.dmi,
      distanceKm: w.dkm,
      elevationM: w.elev,
      elevationFlights: w.elevF ?? null,
    })),
    stepCounts: [],
    vo2max: (raw.vo2max || []).map((s) => ({
      date: new Date(s.d),
      value: s.v,
    })),
  };
}
