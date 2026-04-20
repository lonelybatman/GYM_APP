import { supabase } from '../supabase';
import { defaultPlane } from '../exercise-builder/config-utils';
import { fetchNonDefaultVariantExerciseIds } from './exercise-variants';

// ── Column-name adapter: DB → app types ────────────────────────────────────
//
// DB (exercises)   │ app type
// ─────────────────┼──────────────────────────────────
//   exercise_name  │ name
//   place          │ combo.place
//   weight_type    │ combo.weight_type
//   muscle_id      │ target_muscle_id
//
// DB (equipment)   │ app type
// ─────────────────┼──────────────────────────────────
//   equipment_name │ name
//   is_default_setup (text: "false"/"true"/"star") │ is_default / is_default_star
//   details        │ config  (also contains info_equipment)

// ── Types ──────────────────────────────────────────────────────────────────

export type EquipmentOption = {
  id: string;
  exercise_id: string;
  name: string;
  is_available: boolean;
  is_default: boolean;
  is_default_star: boolean;
  config: Record<string, any>;
  info_equipment: string | null;
};

type EquipmentDefaultPick = {
  is_default_star: boolean;
  is_default: boolean;
};

type AttachmentSortRow = EquipmentDefaultPick & { name: string };

export function sortEquipmentOptionsForAttachmentPicker<T extends AttachmentSortRow>(
  options: T[],
): T[] {
  const tier = (o: EquipmentDefaultPick) => {
    if (o.is_default_star) return 0;
    if (o.is_default) return 1;
    return 2;
  };
  return [...options].sort((a, b) => {
    const d = tier(a) - tier(b);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export function pickDefaultEquipmentOption<T extends EquipmentDefaultPick>(options: T[]): T | null {
  if (options.length === 0) return null;
  const star = options.find((o) => o.is_default_star);
  if (star) return star;
  const def = options.find((o) => o.is_default);
  if (def) return def;
  return options[0];
}

export type ExerciseWithCombo = {
  id: string;
  name: string;
  is_default: boolean;
  is_superdefault: boolean;
  target_muscle_id: string;
  exercise_combo_id: string;
  combo: {
    id: string;
    label: string;
    place: string;
    weight_type: string;
  };
  plane: string | null;
};

// ── Raw DB rows ────────────────────────────────────────────────────────────

type NewExerciseRow = {
  id: string;
  exercise_name: string;
  place: string;
  weight_type: string;
  muscle_id: string;
  is_superdefault: boolean;
  options?: {
    is_default_setup: string;
    equipment_name: string;
    details: Record<string, any>;
  }[] | null;
};

type NewEquipmentRow = {
  id: string;
  exercise_id: string;
  equipment_name: string;
  is_default_setup: string; // "false" | "true" | "star"
  details: Record<string, any>;
};

// ── Adapters ───────────────────────────────────────────────────────────────

function adaptExerciseRow(row: NewExerciseRow): ExerciseWithCombo {
  const place = row.place ?? 'free';
  const weight_type = row.weight_type ?? 'cable';
  const comboId = `${place}+${weight_type}`;
  const combo = { id: comboId, label: comboId, place, weight_type };

  const optList = row.options ?? [];
  const adapted = optList.map((o) => ({
    is_default_star: o.is_default_setup === 'star',
    is_default: o.is_default_setup === 'star' || o.is_default_setup === 'true',
    name: o.equipment_name,
    config: normalizeEquipmentConfig(o.details ?? {}),
  }));
  const sorted = sortEquipmentOptionsForAttachmentPicker(adapted);
  const defaultOpt = pickDefaultEquipmentOption(sorted);
  const plane = defaultOpt ? defaultPlane(defaultOpt.config) : null;

  return {
    id: row.id,
    name: row.exercise_name,
    is_default: false,
    is_superdefault: row.is_superdefault ?? false,
    target_muscle_id: row.muscle_id,
    exercise_combo_id: comboId,
    combo,
    plane,
  };
}

// DB stores equipment.details with different key names than what config-utils.ts expects.
const DB_CONFIG_KEY_MAP: Record<string, string> = {
  hands_1: 'hand_1',
  hands_2: 'hand_2',
  grip_s_n: 'grip_sn',
  grip_n_p: 'grip_np',
  plane_l_s: 'plane_ls',
  plane_s_t: 'plane_st',
  plane_t_l: 'plane_tl',
  width_x05: 'grip_width_05',
  width_x1: 'grip_width_1',
  width_x15: 'grip_width_15',
  cable_h_1_8: 'cable_height_1_8',
  cable_h_9_15: 'cable_height_9_15',
  cable_h_16_22: 'cable_height_16_22',
  cables_1: 'cables_used_1',
  cables_2: 'cables_used_2',
};

function normalizeEquipmentConfig(raw: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw)) {
    const mappedKey = DB_CONFIG_KEY_MAP[k] ?? k;
    // Convert text values ("false"/"true"/"star") back to booleans for config-utils.
    // "star" is treated as true (primary default) — detail-level star handling comes later.
    if (v === 'false') out[mappedKey] = false;
    else if (v === 'true') out[mappedKey] = true;
    else if (v === 'star') out[mappedKey] = 'WAHR*'; // preserve star → isDefaultStar() works
    else out[mappedKey] = v; // strings like info_equipment
  }
  return out;
}

function adaptEquipmentRow(row: NewEquipmentRow): EquipmentOption {
  const details = normalizeEquipmentConfig(row.details ?? {});
  const isStar = row.is_default_setup === 'star';
  return {
    id: row.id,
    exercise_id: row.exercise_id,
    name: row.equipment_name,
    is_available: true, // "false" rows are filtered out at query level
    is_default: isStar || row.is_default_setup === 'true',
    is_default_star: isStar,
    config: details,
    info_equipment: (details.info_equipment as string) ?? null,
  };
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function fetchExercisesForMuscles(
  muscleIds: string[]
): Promise<ExerciseWithCombo[]> {
  if (muscleIds.length === 0) return [];
  const { data, error } = await supabase
    .from('exercises')
    .select('id, exercise_name, place, weight_type, muscle_id, is_superdefault')
    .in('muscle_id', muscleIds)
    .order('exercise_name');
  if (error) throw error;
  return ((data ?? []) as NewExerciseRow[]).map(adaptExerciseRow);
}

export async function fetchAllExercises(): Promise<ExerciseWithCombo[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, exercise_name, place, weight_type, muscle_id, is_superdefault')
    .order('exercise_name');
  if (error) throw error;
  return ((data ?? []) as NewExerciseRow[]).map(adaptExerciseRow);
}

/** Wie fetchAllExercises, aber ohne Zeilen, die nur Nicht-Default-Member einer Varianten-Gruppe sind. */
export async function fetchAllExercisesForPicker(): Promise<ExerciseWithCombo[]> {
  const [all, hideIds] = await Promise.all([
    fetchAllExercises(),
    fetchNonDefaultVariantExerciseIds(),
  ]);
  return all.filter((e) => !hideIds.has(e.id));
}

export async function fetchExerciseSiblings(
  name: string,
  place: string,
  weight_type: string,
): Promise<ExerciseWithCombo[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(`
      id,
      exercise_name,
      place,
      weight_type,
      muscle_id,
      is_superdefault,
      options:equipment(equipment_name, is_default_setup, details)
    `)
    .eq('exercise_name', name)
    .eq('place', place)
    .eq('weight_type', weight_type)
    .order('is_superdefault', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as NewExerciseRow[]).map(adaptExerciseRow);
}

export async function fetchExerciseById(exerciseId: string): Promise<ExerciseWithCombo | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, exercise_name, place, weight_type, muscle_id, is_superdefault')
    .eq('id', exerciseId)
    .single();
  if (error) return null;
  return adaptExerciseRow(data as NewExerciseRow);
}

export async function fetchEquipmentOptions(exerciseId: string): Promise<EquipmentOption[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('id, exercise_id, equipment_name, is_default_setup, details')
    .eq('exercise_id', exerciseId)
    .neq('is_default_setup', 'false');
  if (error) throw error;
  const adapted = (data ?? []).map(adaptEquipmentRow);
  return sortEquipmentOptionsForAttachmentPicker(adapted);
}

export async function fetchTargetMuscleName(muscleId: string): Promise<string> {
  const { data } = await supabase
    .from('muscles')
    .select('name_en')
    .eq('id', muscleId)
    .single();
  return data?.name_en ?? '';
}
