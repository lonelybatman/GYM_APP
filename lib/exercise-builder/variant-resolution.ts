import type { ExerciseBuilderState, PlaneType } from './types';
import type { ExerciseVariantMember, ExerciseVariantAxis } from '../queries/exercise-variants';
import { PLANE_LABEL } from './abbreviation';

/**
 * Liest den aktuellen Wert eines dimension_key aus dem Builder-State.
 * Muss zu exercise_variant_member.discriminant passen (Typen aus DB JSON).
 */
export function valueFromBuilderState(
  state: ExerciseBuilderState,
  dimensionKey: string,
): unknown {
  switch (dimensionKey) {
    case 'cables_used':
      return state.cables_used;
    case 'hands':
      return state.hands;
    case 'plane':
      return state.plane;
    case 'bench_cable_angle':
      return state.bench_cable_angle;
    case 'cable_height':
      return state.cable_height;
    case 'bench_type':
      return state.bench_type;
    case 'body_pos':
      return state.body_pos;
    case 'stand':
      return state.stand;
    default:
      return undefined;
  }
}

function normalizePlane(v: unknown): string {
  if (v == null) return '';
  return String(v).toLowerCase().replace(/_/g, '').replace(/-/g, '');
}

function discriminantValuesEqual(
  dimensionKey: string,
  stateVal: unknown,
  discVal: unknown,
): boolean {
  if (dimensionKey === 'plane') {
    return normalizePlane(stateVal) === normalizePlane(discVal);
  }
  if (stateVal === discVal) return true;
  if (typeof stateVal === 'number' && typeof discVal === 'string') {
    return stateVal === Number(discVal);
  }
  if (typeof stateVal === 'string' && typeof discVal === 'number') {
    return Number(stateVal) === discVal;
  }
  return false;
}

/**
 * Kurzbeschriftung für den Ausführungs-Picker (Achsen aus exercise_variant_axis + discriminant).
 */
export function formatVariantMemberOptionLabel(
  member: ExerciseVariantMember,
  axes: ExerciseVariantAxis[],
): string {
  const sortedAxes = [...axes].sort((a, b) => a.axis_index - b.axis_index);
  const parts: string[] = [];
  for (const ax of sortedAxes) {
    const raw = member.discriminant[ax.dimension_key];
    if (raw === undefined || raw === null) continue;
    let display: string;
    if (ax.dimension_key === 'plane') {
      const k = normalizePlane(raw) as PlaneType;
      display = PLANE_LABEL[k] ?? String(raw);
    } else {
      display = String(raw);
    }
    const prefix = ax.label_de?.trim() || ax.dimension_key;
    parts.push(`${prefix}: ${display}`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Variante';
}

/**
 * Findet das Member, dessen discriminant vollständig zum aktuellen State passt.
 * Nur Keys aus dem discriminant werden verglichen (z. B. { hands: 1 } ignoriert plane im State).
 * Kein exakter Match → Fallback auf das Default-Member (is_default_entry=true) oder
 * erstes nach sort_order. Das verhindert den Fall dass z. B. nach einem Wechsel zu
 * einem hands=1-Exercise (plane=null) der Rückweg zu hands=2 blockiert ist.
 */
export function findMatchingVariantMember(
  members: ExerciseVariantMember[],
  state: ExerciseBuilderState,
): ExerciseVariantMember | null {
  if (members.length === 0) return null;

  const matches = members.filter((m) => {
    const d = m.discriminant;
    if (!d || typeof d !== 'object') return false;
    for (const [key, discVal] of Object.entries(d)) {
      const sv = valueFromBuilderState(state, key);
      if (!discriminantValuesEqual(key, sv, discVal)) return false;
    }
    return true;
  });

  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    const preferred = matches.find((m) => m.is_default_entry);
    if (preferred) return preferred;
    return matches.sort((a, b) => a.sort_order - b.sort_order)[0];
  }

  // Kein exakter Match — Fallback auf Default-Member damit der User nicht stecken bleibt.
  const defaultMember = members.find((m) => m.is_default_entry);
  return defaultMember ?? [...members].sort((a, b) => a.sort_order - b.sort_order)[0];
}

/**
 * Wendet Discriminant-Werte auf einen bestehenden State an.
 * Nötig damit nach router.setParams/Reload die var-Detail-Werte erhalten bleiben,
 * auch wenn buildInitialState einen anderen Default hätte.
 */
export function applyDiscriminantToState(
  state: ExerciseBuilderState,
  discriminant: Record<string, unknown>,
): ExerciseBuilderState {
  const s = { ...state };
  for (const [key, val] of Object.entries(discriminant)) {
    const num = typeof val === 'string' ? Number(val) : (val as number);
    switch (key) {
      case 'cables_used':   s.cables_used = num as 1 | 2; break;
      case 'hands':         s.hands = num as 1 | 2; break;
      case 'plane':         s.plane = val as any; break;
      case 'bench_cable_angle': s.bench_cable_angle = num as any; break;
      case 'cable_height':  s.cable_height = val as any; break;
      case 'bench_type':    s.bench_type = val as any; break;
      case 'body_pos':      s.body_pos = val as any; break;
      case 'stand':         s.stand = val as any; break;
    }
  }
  return s;
}
