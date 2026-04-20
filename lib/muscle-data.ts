import { getEffectiveGroups } from './muscle-hierarchy';

export type MuscleEntry = {
  id: string;         // stable: "GroupName_MuscleName"
  en: string;
  de: string;
  extraFlags?: string[]; // logical groups this specific muscle belongs to (overrides group-level)
};

export type MuscleGroupEntry = {
  group: string;      // English (Biceps, Triceps, …)
  group_de: string;   // German
  flags: string[];    // which logical groups it belongs to
  muscles: MuscleEntry[];
};

function m(group: string, en: string, de: string, extraFlags?: string[]): MuscleEntry {
  return { id: `${group}_${en}`, en, de, ...(extraFlags ? { extraFlags } : {}) };
}

export const MUSCLE_DATA: MuscleGroupEntry[] = [
  {
    group: 'Biceps', group_de: 'Bizeps',
    flags: ['Arms', 'Upper', 'Pull', 'Anterior'],
    muscles: [
      m('Biceps', 'Long Head', 'Langer Kopf'),
      m('Biceps', 'Short Head', 'Kurzer Kopf'),
    ],
  },
  {
    group: 'Triceps', group_de: 'Trizeps',
    flags: ['Arms', 'Upper', 'Push', 'Posterior'],
    muscles: [
      m('Triceps', 'Long Head', 'Langer Kopf'),
      m('Triceps', 'Lateral Head', 'Seitlicher Kopf'),
      m('Triceps', 'Medial Head', 'Medialer Kopf'),
    ],
  },
  {
    group: 'Forearm', group_de: 'Unterarm',
    flags: ['Arms', 'Upper'],
    muscles: [
      m('Forearm', 'Extensors', 'Strecker'),
      m('Forearm', 'Flexors', 'Beuger'),
      m('Forearm', 'Brachioradialis', 'Oberarmspeichenmuskel'),
    ],
  },
  {
    group: 'Shoulders', group_de: 'Schulter',
    flags: ['Shoulders', 'Upper', 'Push', 'Anterior'],
    muscles: [
      m('Shoulders', 'Front Delts', 'Vordere Schulter'),
      m('Shoulders', 'Side Delts', 'Seitliche Schulter'),
      m('Shoulders', 'Rear Delts', 'Hintere Schulter'),
    ],
  },
  {
    group: 'Chest', group_de: 'Brust',
    flags: ['Chest', 'Upper', 'Push', 'Anterior'],
    muscles: [
      m('Chest', 'Upper Chest', 'Obere Brust'),
      m('Chest', 'Mid Chest', 'Mittlere Brust'),
      m('Chest', 'Lower Chest', 'Untere Brust'),
    ],
  },
  {
    group: 'Back', group_de: 'Rücken',
    flags: ['Back', 'Upper', 'Pull', 'Posterior'],
    muscles: [
      m('Back', 'Lats', 'Breiter Rückenmuskel'),
      m('Back', 'Upper Back', 'Trapezmuskel'),
      m('Back', 'Mid Back', 'Rückenstrecker'),
      m('Back', 'Lower Back', 'Rautenmuskeln'),
    ],
  },
  {
    group: 'Core', group_de: 'Core',
    flags: ['Core', 'Upper', 'Pull', 'Anterior'],
    muscles: [
      m('Core', 'Abs', 'Gerader Bauchmuskel'),
      m('Core', 'Obliques', 'Schräge Bauchmuskeln'),
    ],
  },
  {
    group: 'Legs', group_de: 'Beine',
    flags: ['Legs', 'Lower'],
    muscles: [
      m('Legs', 'Quads', 'Oberschenkelvorderseite', ['Push']),
      m('Legs', 'Hamstrings', 'Oberschenkelrückseite', ['Pull']),
    ],
  },
  {
    group: 'Glutes', group_de: 'Gesäß',
    flags: ['Lower', 'Push', 'Posterior'],
    muscles: [
      m('Glutes', 'Upper Glutes', 'Großer Gesäßmuskel'),
      m('Glutes', 'Mid Glutes', 'Mittlerer Gesäßmuskel'),
      m('Glutes', 'Lower Glutes', 'Kleiner Gesäßmuskel'),
    ],
  },
  {
    group: 'Adductors', group_de: 'Adduktoren',
    flags: ['Lower', 'Anterior'],
    muscles: [],
  },
  {
    group: 'Abductors', group_de: 'Abduktoren',
    flags: ['Lower', 'Posterior'],
    muscles: [],
  },
  {
    group: 'Calves', group_de: 'Waden',
    flags: ['Lower', 'Push', 'Posterior'],
    muscles: [
      m('Calves', 'Calves', 'Wadenmuskel'),
    ],
  },
];

/** Return muscle groups relevant for the given logical groups (e.g. ['Arms', 'Push']) */
export function getMuscleGroupsForLogical(logicalGroups: string[]): MuscleGroupEntry[] {
  if (logicalGroups.length === 0) return [];
  const effective = new Set(getEffectiveGroups(logicalGroups));
  return MUSCLE_DATA.filter(
    (mg) =>
      mg.flags.some((f) => effective.has(f)) ||
      mg.muscles.some((m) => m.extraFlags?.some((f) => effective.has(f))),
  );
}

/**
 * Return only the muscles of a group that are relevant for the given effective groups.
 * If the group itself matches (via flags), all muscles are included.
 * Otherwise only muscles whose extraFlags match are included.
 */
export function getMusclesForGroup(mg: MuscleGroupEntry, effective: Set<string>): MuscleEntry[] {
  if (mg.flags.some((f) => effective.has(f))) return mg.muscles;
  return mg.muscles.filter((m) => m.extraFlags?.some((f) => effective.has(f)));
}
