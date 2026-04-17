/** Dashboard activity filter tab identifier. */
export type ActivityTab = 'all' | 'stairs' | 'run' | 'walk';

/** A single instantaneous heart rate reading. */
export interface HrSample {
  date: Date;
  bpm: number;
}

/** A daily resting heart rate measurement. */
export interface RestingHrSample {
  date: Date;
  bpm: number;
}

/** A VO2max estimate reading (mL/kg/min). */
export interface Vo2Sample {
  date: Date;
  value: number;
}

/** A heart rate variability (SDNN) reading in milliseconds. */
export interface HrvSample {
  date: Date;
  value: number;
}

/** A daily walking heart rate average. */
export interface WalkingHrSample {
  date: Date;
  bpm: number;
}

/** A body mass measurement in pounds. */
export interface BodyMassSample {
  date: Date;
  lbs: number;
}

/** A daily aggregated step count. */
export interface StepSample {
  date: Date;
  count: number;
}

/** A nightly sleep duration total in hours. */
export interface SleepSample {
  date: Date;
  hours: number;
}

/** A daily active energy expenditure in kilocalories. */
export interface ActiveEnergySample {
  date: Date;
  kcal: number;
}

/** A single workout session parsed from Apple Health export data. */
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

/** Top-level container for all parsed health data arrays, sorted chronologically. */
export interface HealthData {
  heartRateSamples: HrSample[];
  restingHR: RestingHrSample[];
  workouts: Workout[];
  stepCounts: StepSample[];
  vo2max: Vo2Sample[];
  hrv: HrvSample[];
  walkingHR: WalkingHrSample[];
  bodyMass: BodyMassSample[];
  sleep: SleepSample[];
  activeEnergy: ActiveEnergySample[];
}

/** User-configured heart rate zone boundaries (BPM thresholds). */
export interface Zones {
  maxHR: number;
  z1Max: number;
  z2Max: number;
  z3Max: number;
  z4Max: number;
}

/** Heart rate training zone number (1–5). */
export type ZoneNumber = 1 | 2 | 3 | 4 | 5;

/** Per-zone sample count and percentage distribution. */
export type ZoneDistribution = Record<ZoneNumber, { count: number; pct: number }>;

/** Enriched workout with HR statistics, zone distribution, pace, and efficiency. */
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

/** Lifecycle status of a file-parsing stage. */
export type ProgressStatus = 'pending' | 'active' | 'done';

/** A single stage in the multi-step file parsing pipeline. */
export interface ProgressStage {
  id: string;
  label: string;
  status: ProgressStatus;
  count?: number | string;
}

/** Callback invoked by parsers to report progress on each stage. */
export type ProgressCallback = (
  stageId: string,
  status: ProgressStatus,
  count?: number | string,
) => void;
