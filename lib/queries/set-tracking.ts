import { supabase } from '../supabase';

export type SetLogEntry = {
  id: string;
  session_id: string;
  plan_exercise_id: string;
  set_type: string;
  parent_set_type: string | null;
  hand: 'L' | 'R' | null;
  kg: number | null;
  reps: number | null;
  extra_weight: number;
  logged_at: string;
};

export type PlanExerciseDetail = {
  id: string;
  plan_day_id: string;
  exercise_id: string;
  equipment_option_id: string;   // maps from DB equipment_id
  sort_order: number;
  default_sets: number;
  custom_config: Record<string, any> | null;
  exercise: {
    id: string;
    name: string;                 // maps from exercise_name
    target_muscle_id: string;    // maps from muscle_id
    exercise_combo_id: string;   // derived from place + weight_type
  };
  equipment_option: {
    id: string;
    name: string;                 // maps from equipment_name
    config: Record<string, any>; // maps from details
  };
};

// ── Day Overview ───────────────────────────────────────────────────────────

export type DayExerciseOverview = {
  id: string;
  sort_order: number;
  default_sets: number;
  exercise_name: string;
  target_muscle_name: string;
  combo_place: string;
  combo_weight_type: string;
  attachment_name: string;
  config: Record<string, any>;
  equipment_option_id: string;
};

export async function fetchDayExercisesForOverview(
  planDayId: string,
): Promise<DayExerciseOverview[]> {
  const { data, error } = await supabase
    .from('plan_exercises')
    .select(`
      id,
      sort_order,
      default_sets,
      exercise:exercise_id (
        exercise_name,
        place,
        weight_type,
        target_muscle:muscle_id ( name_en )
      ),
      equipment:equipment_id (
        id,
        equipment_name,
        details
      )
    `)
    .eq('plan_day_id', planDayId)
    .order('sort_order');

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    return {
      id: row.id,
      sort_order: row.sort_order,
      default_sets: row.default_sets ?? 3,
      exercise_name: row.exercise?.exercise_name ?? '',
      target_muscle_name: row.exercise?.target_muscle?.name_en ?? '',
      combo_place: row.exercise?.place ?? '',
      combo_weight_type: row.exercise?.weight_type ?? '',
      attachment_name: row.equipment?.equipment_name ?? '',
      config: row.equipment?.details ?? {},
      equipment_option_id: row.equipment?.id ?? '',
    };
  });
}

// ── getOrCreateSession ────────────────────────────────────────────────────

export async function getOrCreateSession(userId: string, planDayId: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_day_id', planDayId)
    .is('finished_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, plan_day_id: planDayId, started_at: new Date().toISOString() })
    .select('id')
    .single();

  if (createError) throw createError;
  return created.id as string;
}

// ── fetchPlanExercises ────────────────────────────────────────────────────

export async function fetchPlanExercises(planDayId: string): Promise<PlanExerciseDetail[]> {
  const { data, error } = await supabase
    .from('plan_exercises')
    .select(`
      id,
      plan_day_id,
      exercise_id,
      equipment_id,
      sort_order,
      default_sets,
      custom_config,
      exercise:exercise_id (
        id,
        exercise_name,
        muscle_id,
        place,
        weight_type
      ),
      equipment:equipment_id (
        id,
        equipment_name,
        details
      )
    `)
    .eq('plan_day_id', planDayId)
    .order('sort_order');

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    plan_day_id: row.plan_day_id,
    exercise_id: row.exercise_id,
    equipment_option_id: row.equipment_id,
    sort_order: row.sort_order,
    default_sets: row.default_sets,
    custom_config: row.custom_config,
    exercise: {
      id: row.exercise?.id ?? '',
      name: row.exercise?.exercise_name ?? '',
      target_muscle_id: row.exercise?.muscle_id ?? '',
      exercise_combo_id: `${row.exercise?.place ?? ''}+${row.exercise?.weight_type ?? ''}`,
    },
    equipment_option: {
      id: row.equipment?.id ?? '',
      name: row.equipment?.equipment_name ?? '',
      config: row.equipment?.details ?? {},
    },
  }));
}

// ── fetchSetLogs ──────────────────────────────────────────────────────────

export async function fetchSetLogs(
  sessionId: string,
  planExerciseId: string,
): Promise<SetLogEntry[]> {
  const { data, error } = await supabase
    .from('set_logs')
    .select('*')
    .eq('session_id', sessionId)
    .eq('plan_exercise_id', planExerciseId)
    .order('logged_at');
  if (error) throw error;
  return (data ?? []) as SetLogEntry[];
}

// ── fetchPreviousSetLogs ──────────────────────────────────────────────────

export async function fetchPreviousSetLogs(
  userId: string,
  planExerciseId: string,
  currentSessionId: string,
): Promise<SetLogEntry[]> {
  const { data: prevSession, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', userId)
    .not('finished_at', 'is', null)
    .neq('id', currentSessionId)
    .order('finished_at', { ascending: false })
    .limit(10);

  if (sessionError) throw sessionError;
  if (!prevSession || prevSession.length === 0) return [];

  for (const session of prevSession) {
    const { data: logs, error: logsError } = await supabase
      .from('set_logs')
      .select('*')
      .eq('session_id', session.id)
      .eq('plan_exercise_id', planExerciseId)
      .order('logged_at');

    if (logsError) continue;
    if (logs && logs.length > 0) return logs as SetLogEntry[];
  }

  return [];
}

// ── upsertSetLog ──────────────────────────────────────────────────────────

export async function upsertSetLog(
  entry: Partial<SetLogEntry> & {
    session_id: string;
    plan_exercise_id: string;
    set_type: string;
  },
): Promise<SetLogEntry> {
  const payload = {
    ...entry,
    extra_weight: entry.extra_weight ?? 0,
    logged_at: entry.logged_at ?? new Date().toISOString(),
  };

  if (entry.id) {
    const { data, error } = await supabase
      .from('set_logs')
      .update(payload)
      .eq('id', entry.id)
      .select()
      .single();
    if (error) throw error;
    return data as SetLogEntry;
  } else {
    const { data, error } = await supabase
      .from('set_logs')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as SetLogEntry;
  }
}

// ── deleteSetLog ──────────────────────────────────────────────────────────

export async function deleteSetLog(id: string): Promise<void> {
  const { error } = await supabase.from('set_logs').delete().eq('id', id);
  if (error) throw error;
}

// ── finishSession ─────────────────────────────────────────────────────────

export async function finishSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ finished_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw error;
}

// ── fetchLastWorkout ──────────────────────────────────────────────────────

export type LastWorkoutSummary = {
  session_id: string;
  plan_day_id: string;
  plan_day_name: string;
  plan_name: string;
  started_at: string;
  finished_at: string | null;
};

export async function fetchLastWorkout(userId: string): Promise<LastWorkoutSummary | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      plan_day_id,
      started_at,
      finished_at,
      plan_day:plan_days!plan_day_id (
        name,
        training_plan:training_plans!plan_id (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const day = data.plan_day as any;
  return {
    session_id: data.id as string,
    plan_day_id: data.plan_day_id as string,
    plan_day_name: day?.name ?? '—',
    plan_name: day?.training_plan?.name ?? '—',
    started_at: data.started_at as string,
    finished_at: data.finished_at as string | null,
  };
}

// ── updateDefaultSets ─────────────────────────────────────────────────────

export async function updateDefaultSets(planExerciseId: string, defaultSets: number): Promise<void> {
  const { error } = await supabase
    .from('plan_exercises')
    .update({ default_sets: defaultSets })
    .eq('id', planExerciseId);
  if (error) throw error;
}

// ── fetchProgressHistory ──────────────────────────────────────────────────

export type ProgressPoint = {
  session_date: string;
  best_weight: number;
  avg_weight: number;
  volume: number;
  one_rm: number;
  left_best: number | null;
  left_avg: number | null;
  left_volume: number | null;
  left_one_rm: number | null;
  right_best: number | null;
  right_avg: number | null;
  right_volume: number | null;
  right_one_rm: number | null;
};

export async function fetchProgressHistory(
  planExerciseId: string,
): Promise<ProgressPoint[]> {
  const { data, error } = await supabase
    .from('set_logs')
    .select(`
      set_type,
      hand,
      kg,
      extra_weight,
      reps,
      session:workout_sessions!session_id (
        id,
        started_at,
        finished_at
      )
    `)
    .eq('plan_exercise_id', planExerciseId)
    .order('session_id');

  if (error) throw error;

  const byDate = new Map<string, { normal: typeof data; left: typeof data; right: typeof data }>();

  for (const log of (data ?? [])) {
    const session = (log as any).session;
    if (!session?.finished_at) continue;

    const date = session.started_at.slice(0, 10);
    const setType: string = (log as any).set_type;

    if (!byDate.has(date)) byDate.set(date, { normal: [], left: [], right: [] });
    const bucket = byDate.get(date)!;

    if (/^\d+$/.test(setType)) {
      bucket.normal.push(log);
    } else if (/^\d+L$/.test(setType) || (log as any).hand === 'L') {
      bucket.left.push(log);
    } else if (/^\d+R$/.test(setType) || (log as any).hand === 'R') {
      bucket.right.push(log);
    }
  }

  const result: ProgressPoint[] = [];

  for (const [date, buckets] of byDate) {
    const calcMetrics = (logs: typeof data) => {
      if (logs.length === 0) return null;
      const weights = logs.map((l: any) => (l.kg ?? 0) + (l.extra_weight ?? 0));
      const best = Math.max(...weights);
      const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
      const vol = logs.reduce((sum: number, l: any) => sum + ((l.kg ?? 0) + (l.extra_weight ?? 0)) * (l.reps ?? 0), 0);
      const oneRm = Math.max(...logs.map((l: any) => (l.kg ?? 0) * (1 + (l.reps ?? 0) / 30)));
      return { best, avg, vol, oneRm };
    };

    const normal = calcMetrics(buckets.normal);
    const left = calcMetrics(buckets.left);
    const right = calcMetrics(buckets.right);

    const mainBest = normal?.best ?? (left && right ? Math.max(left.best, right.best) : (left?.best ?? right?.best ?? 0));
    const mainAvg = normal?.avg ?? ((left?.avg ?? 0) + (right?.avg ?? 0)) / (left && right ? 2 : 1);
    const mainVol = normal?.vol ?? (left?.vol ?? 0) + (right?.vol ?? 0);
    const mainOneRm = normal?.oneRm ?? Math.max(left?.oneRm ?? 0, right?.oneRm ?? 0);

    result.push({
      session_date: date,
      best_weight: mainBest,
      avg_weight: mainAvg,
      volume: mainVol,
      one_rm: mainOneRm,
      left_best: left?.best ?? null,
      left_avg: left?.avg ?? null,
      left_volume: left?.vol ?? null,
      left_one_rm: left?.oneRm ?? null,
      right_best: right?.best ?? null,
      right_avg: right?.avg ?? null,
      right_volume: right?.vol ?? null,
      right_one_rm: right?.oneRm ?? null,
    });
  }

  return result.sort((a, b) => a.session_date.localeCompare(b.session_date));
}
