// ── Combo classification ─────────────────────────────────────────────────────

export type ComboType =
  | 'free_cable'
  | 'free_freeweight'
  | 'bench_cable'
  | 'bench_freeweight'
  | 'lat_pull'
  | 'lat_row'
  | 'machine';

export function getComboType(place: string, weightType: string): ComboType {
  if (place === 'lat_pull') return 'lat_pull';
  if (place === 'lat_row') return 'lat_row';
  if (place === 'machine') return 'machine';
  if (place === 'bench' && weightType === 'cable') return 'bench_cable';
  if (place === 'bench') return 'bench_freeweight';
  if (place === 'free' && weightType === 'cable') return 'free_cable';
  return 'free_freeweight';
}

// ── Raw config keys from Supabase JSONB ──────────────────────────────────────

export type RawConfig = Record<string, boolean | string | null>;

// ── Parsed, user-chosen configuration ────────────────────────────────────────

export type GripType = 'sup' | 'sn' | 'n' | 'np' | 'pro';
export type GripWidth = '05' | '1' | '15';
export type BenchType = 'flat' | 'incl' | 'upright';
export type BodyPos = 'lying' | '180' | 'sitting';
export type StandAngle = '0' | '45' | '90' | '90os' | '135' | '180';
export type SitAngle = '0' | '90';
export type CableHeight = '1_8' | '9_15' | '16_22';
export type BenchCableAngle = 0 | 90 | 180;
export type BodyBenchAngle = 0 | 45 | 90 | 135 | 180;
export type PlaneType = 'lat' | 'ls' | 'sag' | 'st' | 'trans' | 'tl';

export type ExerciseBuilderState = {
  equipment_option_id: string;
  raw_config: RawConfig;

  // Common
  hands: 1 | 2;
  grip_type: GripType | null;
  grip_width: GripWidth | null;

  // Cable combos
  cables_used: 1 | 2;
  cable_height: CableHeight | null;

  // Free + Cable
  stand: StandAngle | null;
  sit: SitAngle | null;

  // Bench combos
  bench_type: BenchType | null;
  bench_angle: number | null; // degrees, only when incl
  last_bench_angle: number | null; // restored when switching back to incl
  body_pos: BodyPos | null; // Bench + FW

  // Bench + Cable specific
  bench_cable_angle: BenchCableAngle;
  body_bench: BodyBenchAngle;

  // Movement plane
  plane: PlaneType | null;
};
