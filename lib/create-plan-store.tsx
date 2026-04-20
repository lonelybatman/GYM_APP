import React, { createContext, useContext, useState } from 'react';

export type PlanExercise = {
  exercise_id: string;
  exercise_combo_id: string;
  name: string;
  combo_label: string;
};

export type DayConfig = {
  uid: string;          // stable identity, never changes after creation
  day_number: number;   // 1-based, reflects position in cycle
  name: string;
  is_rest_day: boolean;
  muscle_groups: string[];  // logical group names (Arms, Shoulders, …)
  muscle_ids: string[];     // DB muscle IDs (from Screen 3)
  exercises: PlanExercise[];
};

export type CreatePlanState = {
  plan_name: string;
  cycle_days: number;
  training_days: number;
  days: DayConfig[];
};

const DEFAULT_STATE: CreatePlanState = {
  plan_name: '',
  cycle_days: 7,
  training_days: 5,
  days: [],
};

type Ctx = {
  state: CreatePlanState;
  setPlanName: (v: string) => void;
  setCycleDays: (v: number) => void;
  setTrainingDays: (v: number) => void;
  setDays: (days: DayConfig[]) => void;
  updateDay: (dayNumber: number, patch: Partial<DayConfig>) => void;
  reset: () => void;
};

export const CreatePlanContext = createContext<Ctx | null>(null);

export function CreatePlanProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CreatePlanState>(DEFAULT_STATE);

  const setPlanName = (plan_name: string) => setState((s) => ({ ...s, plan_name }));
  const setCycleDays = (cycle_days: number) => setState((s) => ({ ...s, cycle_days }));
  const setTrainingDays = (training_days: number) =>
    setState((s) => ({ ...s, training_days }));

  const setDays = (days: DayConfig[]) => setState((s) => ({ ...s, days }));

  const updateDay = (dayNumber: number, patch: Partial<DayConfig>) =>
    setState((s) => ({
      ...s,
      days: s.days.map((d) => (d.day_number === dayNumber ? { ...d, ...patch } : d)),
    }));

  const reset = () => setState(DEFAULT_STATE);

  return (
    <CreatePlanContext.Provider
      value={{ state, setPlanName, setCycleDays, setTrainingDays, setDays, updateDay, reset }}
    >
      {children}
    </CreatePlanContext.Provider>
  );
}

export function useCreatePlan() {
  const ctx = useContext(CreatePlanContext);
  if (!ctx) throw new Error('useCreatePlan must be used within CreatePlanProvider');
  return ctx;
}
