import type { HealthData } from '../types';

interface CompactSample {
  d: string;
  b: number;
}

interface CompactVo2 {
  d: string;
  v: number;
}

interface CompactMass {
  d: string;
  lb: number;
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
  hrv?: CompactVo2[];
  walkingHR?: CompactSample[];
  bodyMass?: CompactMass[];
}

function byDate(a: { date: Date }, b: { date: Date }) {
  return a.date.getTime() - b.date.getTime();
}

export function hydrateHealthJson(raw: CompactHealthData): HealthData {
  const heartRateSamples = (raw.heartRateSamples || []).map((s) => ({
    date: new Date(s.d),
    bpm: s.b,
  }));
  const restingHR = (raw.restingHR || []).map((s) => ({
    date: new Date(s.d),
    bpm: s.b,
  }));
  const workouts = (raw.workouts || []).map((w) => ({
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
  }));
  const vo2max = (raw.vo2max || []).map((s) => ({
    date: new Date(s.d),
    value: s.v,
  }));
  const hrv = (raw.hrv || []).map((s) => ({
    date: new Date(s.d),
    value: s.v,
  }));
  const walkingHR = (raw.walkingHR || []).map((s) => ({
    date: new Date(s.d),
    bpm: s.b,
  }));
  const bodyMass = (raw.bodyMass || []).map((s) => ({
    date: new Date(s.d),
    lbs: s.lb,
  }));

  heartRateSamples.sort(byDate);
  restingHR.sort(byDate);
  workouts.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  vo2max.sort(byDate);
  hrv.sort(byDate);
  walkingHR.sort(byDate);
  bodyMass.sort(byDate);

  return {
    heartRateSamples,
    restingHR,
    workouts,
    stepCounts: [],
    vo2max,
    hrv,
    walkingHR,
    bodyMass,
  };
}
