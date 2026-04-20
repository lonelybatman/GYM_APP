// The 12 selectable logical groups shown in Screen 2
export const SELECTABLE_GROUPS = [
  'Arms', 'Shoulders', 'Chest', 'Back', 'Core', 'Legs',
  'Upper', 'Lower', 'Pull', 'Push', 'Anterior', 'Posterior',
] as const;

export type LogicalGroup = typeof SELECTABLE_GROUPS[number];

// Parent groups and the children they cover (grayout)
export const HIERARCHY: Record<string, string[]> = {
  Upper:     ['Arms', 'Shoulders', 'Chest', 'Back', 'Core'],
  Lower:     ['Legs', 'Glutes', 'Adductors', 'Abductors', 'Calves'],
  Pull:      ['Back', 'Core'],
  Push:      ['Chest', 'Glutes'],
  Anterior:  ['Chest', 'Core', 'Adductors'],
  Posterior: ['Back', 'Glutes', 'Abductors', 'Calves'],
};

// Which DB muscle boolean-column each logical group maps to
export const GROUP_FLAG_MAP: Record<string, string> = {
  Arms:       'in_arms',
  Shoulders:  'in_shoulders',
  Chest:      'in_chest',
  Back:       'in_back',
  Core:       'in_core',
  Legs:       'in_legs',
  Upper:      'in_upper',
  Lower:      'in_lower',
  Pull:       'in_pull',
  Push:       'in_push',
  Anterior:   'in_anterior',
  Posterior:  'in_posterior',
};

/** Returns groups that are grayed-out because a parent is selected */
export function getCoveredGroups(selected: string[]): string[] {
  const covered = new Set<string>();
  for (const s of selected) {
    if (HIERARCHY[s]) HIERARCHY[s].forEach((g) => covered.add(g));
  }
  return [...covered];
}

/** Toggle a group in/out of the selection, respecting hierarchy rules */
export function toggleGroup(group: string, selected: string[]): string[] {
  const isCovered = getCoveredGroups(selected).includes(group);
  if (isCovered) return selected; // grayed-out → no action

  if (selected.includes(group)) {
    return selected.filter((s) => s !== group);
  }

  let next = [...selected, group];
  // If selecting a parent: remove children that are now covered
  if (HIERARCHY[group]) {
    next = next.filter((s) => !HIERARCHY[group].includes(s));
  }
  return next;
}

/** All effective groups including those covered by parents */
export function getEffectiveGroups(selected: string[]): string[] {
  const covered = getCoveredGroups(selected);
  return [...new Set([...selected, ...covered])];
}

/**
 * Filter muscles to those whose logical group is selected or covered.
 * muscle_group_name must match DB muscle_group.name_en.
 * (Step 3 alternative to fetchMusclesByLogicalGroups for client-side filtering)
 */
export function getVisibleMuscles<T extends { muscle_group_name: string }>(
  selected: string[],
  allMuscles: T[],
): T[] {
  const active = new Set(getEffectiveGroups(selected));
  return allMuscles.filter((m) => active.has(m.muscle_group_name));
}
