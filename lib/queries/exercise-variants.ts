import { supabase } from '../supabase';

/**
 * exercise_id, die in einer Varianten-Gruppe nur als Alternative (nicht Default) gelistet sind.
 * Diese sollen im Plan-Picker nicht erscheinen — Umschalten erfolgt im Exercise Builder.
 */
export async function fetchNonDefaultVariantExerciseIds(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('exercise_variant_member')
    .select('exercise_id')
    .eq('is_default_entry', false);
  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.exercise_id as string));
}

/** Zeilen aus exercise_variant_axis (var-Detail-Reihenfolge). */
export type ExerciseVariantAxis = {
  id: string;
  group_id: string;
  axis_index: number;
  dimension_key: string;
  label_de: string | null;
  label_en: string | null;
};

/** Member: eine exercises-Zeile + discriminant (Match auf var-Detail-Werte). */
export type ExerciseVariantMember = {
  id: string;
  group_id: string;
  exercise_id: string;
  is_default_entry: boolean;
  is_superdefault: boolean;
  discriminant: Record<string, unknown>;
  sort_order: number;
};

export type ExerciseVariantGroupBundle = {
  group: { id: string; label: string | null; notes: string | null };
  axes: ExerciseVariantAxis[];
  members: ExerciseVariantMember[];
};

/**
 * Lädt Gruppe inkl. Achsen und allen Membern, wenn exerciseId Teil der Gruppe ist.
 * Sonst null (Einzel-Exercise ohne Varianten-Gruppe).
 */
export async function fetchExerciseVariantGroupByExerciseId(
  exerciseId: string,
): Promise<ExerciseVariantGroupBundle | null> {
  const { data: memberRow, error: e1 } = await supabase
    .from('exercise_variant_member')
    .select('group_id')
    .eq('exercise_id', exerciseId)
    .maybeSingle();

  if (e1 || !memberRow?.group_id) return null;

  const groupId = memberRow.group_id as string;

  const [groupRes, axesRes, membersRes] = await Promise.all([
    supabase.from('exercise_variant_group').select('id, label, notes').eq('id', groupId).single(),
    supabase
      .from('exercise_variant_axis')
      .select('id, group_id, axis_index, dimension_key, label_de, label_en')
      .eq('group_id', groupId)
      .order('axis_index', { ascending: true }),
    supabase
      .from('exercise_variant_member')
      .select('id, group_id, exercise_id, is_default_entry, discriminant, sort_order, exercise:exercises(is_superdefault)')
      .eq('group_id', groupId)
      .order('sort_order', { ascending: true }),
  ]);

  if (groupRes.error || !groupRes.data) return null;

  const members: ExerciseVariantMember[] = (membersRes.data ?? []).map((r: any) => ({
    id: r.id,
    group_id: r.group_id,
    exercise_id: r.exercise_id,
    is_default_entry: r.is_default_entry,
    is_superdefault: r.exercise?.is_superdefault ?? false,
    discriminant: r.discriminant,
    sort_order: r.sort_order,
  }));

  return {
    group: groupRes.data as ExerciseVariantGroupBundle['group'],
    axes: (axesRes.data ?? []) as ExerciseVariantAxis[],
    members,
  };
}
