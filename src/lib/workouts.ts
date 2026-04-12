import type {
  ActivityTab,
  HealthData,
  HrSample,
  Workout,
  WorkoutSummary,
  ZoneNumber,
  Zones,
} from '../types';
import { analyzeZoneDistribution } from './zones';

export function matchesTab(workoutType: string, tab: ActivityTab): boolean {
  if (tab === 'all') {
    return (
      matchesTab(workoutType, 'stairs') ||
      matchesTab(workoutType, 'run') ||
      matchesTab(workoutType, 'walk')
    );
  }
  if (tab === 'stairs') {
    return (
      workoutType.includes('StairClimbing') ||
      workoutType.includes('Stair') ||
      workoutType.includes('StepperMachine') ||
      workoutType.includes('StairStepper')
    );
  }
  if (tab === 'run') return workoutType.includes('Running');
  if (tab === 'walk') return workoutType.includes('Walking');
  return false;
}

export function getWorkoutsForTab(data: HealthData, tab: ActivityTab): Workout[] {
  return data.workouts.filter((w) => matchesTab(w.type, tab));
}

export function friendlyType(workoutType: string): string {
  if (
    workoutType.includes('StairClimbing') ||
    workoutType.includes('Stair') ||
    workoutType.includes('StepperMachine')
  ) {
    return 'Stairs';
  }
  if (workoutType.includes('Running')) return 'Run';
  if (workoutType.includes('Walking')) return 'Walk';
  return 'Other';
}

export function getHRForWorkout(workout: Workout, hrSamples: HrSample[]): HrSample[] {
  return hrSamples.filter(
    (s) => s.date >= workout.startDate && s.date <= workout.endDate,
  );
}

export function getWorkoutSummary(
  workout: Workout,
  hrSamples: HrSample[],
  zones: Zones,
): WorkoutSummary | null {
  const hrs = getHRForWorkout(workout, hrSamples);
  if (hrs.length === 0) return null;

  const bpms = hrs.map((h) => h.bpm);
  const avgHR = bpms.reduce((a, b) => a + b, 0) / bpms.length;
  const maxHR = Math.max(...bpms);
  const minHR = Math.min(...bpms);
  const distribution = analyzeZoneDistribution(hrs, zones);

  let dominantZone: ZoneNumber = 2;
  let maxPct = 0;
  for (const z of [1, 2, 3, 4, 5] as ZoneNumber[]) {
    const pct = distribution[z].pct;
    if (pct > maxPct) {
      maxPct = pct;
      dominantZone = z;
    }
  }

  const durationMin =
    workout.duration && workout.durationUnit === 'min'
      ? workout.duration
      : (workout.endDate.getTime() - workout.startDate.getTime()) / 60000;

  const distMi = workout.distanceMi;
  const distKm = workout.distanceKm;

  let paceMinPerMi: number | null = null;
  let paceStr: string | null = null;
  if (distMi && distMi > 0 && durationMin > 0) {
    paceMinPerMi = durationMin / distMi;
    const paceM = Math.floor(paceMinPerMi);
    const paceS = Math.round((paceMinPerMi - paceM) * 60);
    paceStr = `${paceM}:${paceS.toString().padStart(2, '0')}`;
  }

  let cardiacEfficiency: number | null = null;
  if (distMi && distMi > 0 && avgHR > 0 && durationMin > 0) {
    const totalBeats = avgHR * durationMin;
    const totalMeters = (distKm || 0) * 1000;
    cardiacEfficiency = totalMeters / totalBeats;
  }

  return {
    ...workout,
    avgHR: Math.round(avgHR),
    maxHR: Math.round(maxHR),
    minHR: Math.round(minHR),
    zones: distribution,
    dominantZone,
    durationMin: Math.round(durationMin),
    hrSamples: hrs,
    distMi,
    distKm,
    paceMinPerMi,
    paceStr,
    cardiacEfficiency,
  };
}

export function applyDateFilter<T>(
  items: T[],
  getDate: (item: T) => Date,
  dateFrom: Date | null,
  dateTo: Date | null,
): T[] {
  if (!dateFrom && !dateTo) return items;
  return items.filter((item) => {
    const d = getDate(item);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });
}
