import type { ActivityTab, ZoneNumber, Zones } from './types';

/** Display labels and icons for each activity tab. */
export const ACTIVITY_TABS: Record<ActivityTab, { label: string; icon: string }> = {
  all: { label: 'All Cardio', icon: '♥' },
  stairs: { label: 'Stair Climber', icon: '⬆' },
  run: { label: 'Running', icon: '→' },
  walk: { label: 'Walking', icon: '~' },
};

/** Ordered list of tabs for rendering in the UI. */
export const ACTIVITY_TAB_ORDER: ActivityTab[] = ['all', 'stairs', 'run', 'walk'];

/** Color hex codes for each HR zone used in charts and badges. */
export const ZONE_COLORS: Record<ZoneNumber, string> = {
  1: '#3b82f6',
  2: '#22c55e',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
};

/** Human-readable names for each HR zone. */
export const ZONE_NAMES: Record<ZoneNumber, string> = {
  1: 'Zone 1 — Recovery',
  2: 'Zone 2 — Aerobic Base',
  3: 'Zone 3 — Tempo',
  4: 'Zone 4 — Threshold',
  5: 'Zone 5 — VO₂max',
};

/** Default HR zone boundaries based on ~60/70/80/90% of 190 max HR. */
export const DEFAULT_ZONES: Zones = {
  maxHR: 190,
  z1Max: 114,
  z2Max: 133,
  z3Max: 152,
  z4Max: 171,
};

/** Ordered stages displayed during file parsing progress. */
export const PARSE_STAGES = [
  { id: 'zip', label: 'Decompressing ZIP' },
  { id: 'hr', label: 'Heart rate samples' },
  { id: 'rhr', label: 'Resting heart rate' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'distance', label: 'Distance & elevation' },
  { id: 'vo2', label: 'VO₂max estimates' },
  { id: 'hrv', label: 'Heart rate variability' },
  { id: 'walkhr', label: 'Walking heart rate' },
  { id: 'mass', label: 'Body mass' },
  { id: 'steps', label: 'Step counts' },
  { id: 'sleep', label: 'Sleep analysis' },
  { id: 'energy', label: 'Active energy' },
  { id: 'sort', label: 'Sorting & finalizing' },
] as const;
