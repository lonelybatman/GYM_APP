import { supabase } from '../supabase';
import { getMuscleGroupsForLogical } from '../muscle-data';
import type { TrainingPlan, PlanDay } from '../../types';
import type { CreatePlanState } from '../create-plan-store';

// ── Plan detail types ──────────────────────────────────────────────────────

export type PlanDayWithMuscles = PlanDay & {
  muscle_group_names: string[];
};

export type PlanWithDays = TrainingPlan & {
  days: PlanDayWithMuscles[];
};

// ── Queries ────────────────────────────────────────────────────────────────

export async function fetchPlanWithDays(planId: string): Promise<PlanWithDays> {
  const { data: plan, error: planError } = await supabase
    .from('training_plans')
    .select('*')
    .eq('id', planId)
    .single();
  if (planError) throw planError;

  const { data: days, error: daysError } = await supabase
    .from('plan_days')
    .select(`
      id, plan_id, day_number, name, is_rest_day,
      plan_day_muscle_groups (
        muscle:muscle_id ( name_en )
      )
    `)
    .eq('plan_id', planId)
    .order('day_number');
  if (daysError) throw daysError;

  const daysWithMuscles: PlanDayWithMuscles[] = (days ?? []).map((d: any) => ({
    id: d.id,
    plan_id: d.plan_id,
    day_number: d.day_number,
    name: d.name,
    is_rest_day: d.is_rest_day,
    muscle_group_names: (d.plan_day_muscle_groups ?? [])
      .map((mg: any) => mg.muscle?.name_en)
      .filter(Boolean),
  }));

  return { ...plan, days: daysWithMuscles };
}

export async function fetchTrainingPlans(userId: string): Promise<TrainingPlan[]> {
  const { data, error } = await supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteTrainingPlan(planId: string): Promise<void> {
  const { error } = await supabase.from('training_plans').delete().eq('id', planId);
  if (error) throw error;
}

// ── savePlan ───────────────────────────────────────────────────────────────
// Maps logical group names (Arms, Shoulders, …) → muscles.id via name_en.
// New DB has no boolean flags — uses MUSCLE_DATA instead.

const MUSCLE_NAME_MAP: Record<string, string> = {
  Glutes: 'Glute', // MUSCLE_DATA 'Glutes' → new DB 'Glute'
};
const toMuscleDbName = (name: string) => MUSCLE_NAME_MAP[name] ?? name;

export async function savePlan(userId: string, plan: CreatePlanState): Promise<string> {
  // 1. Create training_plan
  const { data: planData, error: planError } = await supabase
    .from('training_plans')
    .insert({
      user_id: userId,
      name: plan.plan_name,
      cycle_days: plan.cycle_days,
      training_days: plan.training_days,
    })
    .select('id')
    .single();
  if (planError) throw planError;
  const planId: string = planData.id;

  // 2. Create plan_days
  const dayInserts = plan.days.map((d) => ({
    plan_id: planId,
    day_number: d.day_number,
    name: d.name || `Day ${d.day_number}`,
    is_rest_day: d.is_rest_day,
  }));
  const { data: dayData, error: dayError } = await supabase
    .from('plan_days')
    .insert(dayInserts)
    .select('id, day_number');
  if (dayError) throw dayError;

  const dayIdMap = new Map<number, string>(
    (dayData ?? []).map((d: { id: string; day_number: number }) => [d.day_number, d.id])
  );

  // 3. Fetch all muscles from new DB to build name→id map
  const { data: allMusclesData } = await supabase
    .from('muscles')
    .select('id, name_en');

  const muscleIdByName = new Map<string, string>();
  for (const m of (allMusclesData ?? [])) {
    const key = (m.name_en as string).toLowerCase();
    if (!muscleIdByName.has(key)) {
      muscleIdByName.set(key, m.id as string);
    }
  }

  // 4. For each training day: insert muscle groups
  for (const day of plan.days) {
    if (day.is_rest_day) continue;
    const dayId = dayIdMap.get(day.day_number);
    if (!dayId) continue;

    const relevantGroups = getMuscleGroupsForLogical(day.muscle_groups);
    const muscleGroupInserts: { plan_day_id: string; muscle_id: string }[] = [];
    const seenIds = new Set<string>();

    for (const mg of relevantGroups) {
      const dbName = toMuscleDbName(mg.group);
      const muscleId = muscleIdByName.get(dbName.toLowerCase());
      if (muscleId && !seenIds.has(muscleId)) {
        seenIds.add(muscleId);
        muscleGroupInserts.push({ plan_day_id: dayId, muscle_id: muscleId });
      }
    }

    if (muscleGroupInserts.length > 0) {
      const { error } = await supabase.from('plan_day_muscle_groups').insert(muscleGroupInserts);
      if (error) throw error;
    }
    // Note: plan_day_muscles (individual muscle visualization) is omitted for now
    // — individual sub-muscles don't exist as separate rows in the new DB yet.
  }

  return planId;
}
