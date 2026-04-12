import type { ActivityTab, ZoneNumber, Zones } from './types';

export const ACTIVITY_TABS: Record<ActivityTab, { label: string; icon: string }> = {
  all: { label: 'All Cardio', icon: '♥' },
  stairs: { label: 'Stair Climber', icon: '⬆' },
  run: { label: 'Running', icon: '→' },
  walk: { label: 'Walking', icon: '~' },
};

export const ACTIVITY_TAB_ORDER: ActivityTab[] = ['all', 'stairs', 'run', 'walk'];

export const ZONE_COLORS: Record<ZoneNumber, string> = {
  1: '#3b6b8a',
  2: '#2d9b6e',
  3: '#d4a843',
  4: '#d45a3a',
  5: '#c43a5a',
};

export const ZONE_NAMES: Record<ZoneNumber, string> = {
  1: 'Zone 1 — Recovery',
  2: 'Zone 2 — Aerobic Base',
  3: 'Zone 3 — Tempo',
  4: 'Zone 4 — Threshold',
  5: 'Zone 5 — VO₂max',
};

export const DEFAULT_ZONES: Zones = {
  maxHR: 190,
  z1Max: 114,
  z2Max: 133,
  z3Max: 152,
  z4Max: 171,
};

export const PARSE_STAGES = [
  { id: 'zip', label: 'Decompressing ZIP' },
  { id: 'hr', label: 'Heart rate samples' },
  { id: 'rhr', label: 'Resting heart rate' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'distance', label: 'Distance & elevation' },
  { id: 'vo2', label: 'VO₂max estimates' },
  { id: 'steps', label: 'Step counts' },
  { id: 'sort', label: 'Sorting & finalizing' },
] as const;
