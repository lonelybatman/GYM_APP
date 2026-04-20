import { supabase } from '../supabase';
import type { MuscleGroup, Muscle } from '../../types';

// ── MuscleGroup (new DB: muscles table, flat) ──────────────────────────────

export async function fetchMuscleGroups(): Promise<MuscleGroup[]> {
  const { data, error } = await supabase
    .from('muscles')
    .select('id, name_en')
    .order('name_en');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, name_de: null, name_latin: null, parent_id: null }));
}

// ── fetchMusclesByGroups ───────────────────────────────────────────────────
// New DB has no muscle_group_id FK — muscles are flat.
// Filters directly by the provided IDs.

export async function fetchMusclesByGroups(groupIds: string[]): Promise<Muscle[]> {
  if (groupIds.length === 0) return [];
  const { data, error } = await supabase
    .from('muscles')
    .select('id, name_en')
    .in('id', groupIds)
    .order('name_en');
  if (error) throw error;
  // Boolean flags don't exist in new DB — return with defaults
  return (data ?? []).map((r: any) => ({
    id: r.id,
    muscle_group_id: r.id,
    name_en: r.name_en,
    name_de: null,
    in_arms: false, in_shoulders: false, in_chest: false,
    in_back: false, in_core: false, in_legs: false,
    in_upper: false, in_lower: false, in_pull: false,
    in_push: false, in_anterior: false, in_posterior: false,
  }));
}

// ── fetchMusclesByLogicalGroups ────────────────────────────────────────────
// New DB has no boolean flags → use MUSCLE_DATA + name matching instead.

export async function fetchMusclesByLogicalGroups(
  logicalGroups: string[],
  allMuscleGroups: MuscleGroup[]
): Promise<{ group: MuscleGroup; muscles: Muscle[] }[]> {
  if (logicalGroups.length === 0 || allMuscleGroups.length === 0) return [];

  const { getMuscleGroupsForLogical } = await import('../muscle-data');
  const relevantEntries = getMuscleGroupsForLogical(logicalGroups);
  const relevantNames = new Set(relevantEntries.map((e) => e.group.toLowerCase()));

  return allMuscleGroups
    .filter((mg) => relevantNames.has(mg.name_en.toLowerCase()))
    .map((mg) => ({ group: mg, muscles: [] }));
}
