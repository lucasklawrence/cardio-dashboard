export type ActivityTab = 'all' | 'stairs' | 'run' | 'walk';

export interface HrSample {
  date: Date;
  bpm: number;
}

export interface RestingHrSample {
  date: Date;
  bpm: number;
}

export interface Vo2Sample {
  date: Date;
  value: number;
}

export interface HrvSample {
  date: Date;
  value: number;
}

export interface WalkingHrSample {
  date: Date;
  bpm: number;
}

export interface BodyMassSample {
  date: Date;
  lbs: number;
}

export interface StepSample {
  date: Date;
  count: number;
}

export interface Workout {
  type: string;
  duration: number;
  durationUnit: string;
  startDate: Date;
  endDate: Date;
  calories: number | null;
  distanceMi: number | null;
  distanceKm: number | null;
  elevationM: number | null;
  elevationFlights?: number | null;
}

export interface HealthData {
  heartRateSamples: HrSample[];
  restingHR: RestingHrSample[];
  workouts: Workout[];
  stepCounts: StepSample[];
  vo2max: Vo2Sample[];
  hrv: HrvSample[];
  walkingHR: WalkingHrSample[];
  bodyMass: BodyMassSample[];
}

export interface Zones {
  maxHR: number;
  z1Max: number;
  z2Max: number;
  z3Max: number;
  z4Max: number;
}

export type ZoneNumber = 1 | 2 | 3 | 4 | 5;

export type ZoneDistribution = Record<ZoneNumber, { count: number; pct: number }>;

export interface WorkoutSummary extends Workout {
  avgHR: number;
  maxHR: number;
  minHR: number;
  zones: ZoneDistribution;
  dominantZone: ZoneNumber;
  durationMin: number;
  hrSamples: HrSample[];
  distMi: number | null;
  distKm: number | null;
  paceMinPerMi: number | null;
  paceStr: string | null;
  cardiacEfficiency: number | null;
}

export type ProgressStatus = 'pending' | 'active' | 'done';

export interface ProgressStage {
  id: string;
  label: string;
  status: ProgressStatus;
  count?: number | string;
}

export type ProgressCallback = (
  stageId: string,
  status: ProgressStatus,
  count?: number | string,
) => void;
