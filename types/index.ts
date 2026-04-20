export type TrainingPlan = {
  id: string;
  user_id: string;
  name: string;
  cycle_days: number;
  training_days: number;
  cover_image_url: string | null;
  created_at: string;
};

export type PlanDay = {
  id: string;
  plan_id: string;
  day_number: number;
  name: string;
  is_rest_day: boolean;
};

export type MuscleGroup = {
  id: string;
  name_en: string;
  name_de: string | null;
  name_latin: string | null;
  parent_id: string | null;
};

export type Muscle = {
  id: string;
  muscle_group_id: string;
  name_en: string;
  name_de: string | null;
  in_arms: boolean;
  in_shoulders: boolean;
  in_legs: boolean;
  in_core: boolean;
  in_chest: boolean;
  in_back: boolean;
  in_upper: boolean;
  in_lower: boolean;
  in_pull: boolean;
  in_push: boolean;
  in_anterior: boolean;
  in_posterior: boolean;
};

export type Exercise = {
  id: string;
  combo_id: string;
  muscle_id: string;
  name: string;
  is_default: boolean;
};

export type ExerciseCombo = {
  id: string;
  label: string;
  place: string;
  weight_type: string;
};

export type EquipmentOption = {
  id: string;
  exercise_id: string;
  is_available: boolean;
  is_default: boolean;
  is_default_star: boolean;
  config: Record<string, boolean>;
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  plan_day_id: string;
  started_at: string;
  finished_at: string | null;
};

export type SetLog = {
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
