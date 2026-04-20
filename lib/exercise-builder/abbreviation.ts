import type { ExerciseBuilderState, ComboType, GripType, GripWidth, BenchType, BodyPos, CableHeight, StandAngle, SitAngle, PlaneType } from './types';
import {
  availableGrips, availableWidths, availableCableHeights, availableStandAngles,
  availableHands,
  defaultCablesUsed,
} from './config-utils';

// ── Display maps ─────────────────────────────────────────────────────────────

const GRIP_ABBR: Record<GripType, string> = {
  sup: 's', sn: 'ns', n: 'n', np: 'np', pro: 'p',
};
const WIDTH_ABBR: Record<GripWidth, string> = {
  '05': 'x0.5', '1': 'x1', '15': 'x1.5',
};
const BENCH_ANGLE_ABBR: Record<BenchType, string> = {
  flat: '0°', incl: '', upright: '90°', // incl uses the user-specified angle
};
const BODYPOS_ABBR: Record<BodyPos, string | null> = {
  lying: null, // standard → omit
  '180': '180',
  sitting: 'sit',
};
const HEIGHT_ABBR: Record<CableHeight, string> = {
  '1_8': 'L', '9_15': 'M', '16_22': 'H',
};
const STAND_ABBR: Record<StandAngle, string | null> = {
  '0': null,      // standard → omit
  '45': '45',
  '90': '90',
  '90os': '90os',
  '135': '135',
  '180': '180',
};
const SIT_ABBR: Record<string, string | null> = {
  '0': 'sit0',
  '90': 'sit90',
};

// Attachments where [handsused] should be hidden
const HIDE_HANDS = new Set([
  '1rope', 'nooses', 'raw', 'cuff',
]);

// ── Main function ─────────────────────────────────────────────────────────────

export function generateAbbreviation(
  combo: ComboType,
  exerciseName: string,
  targetMuscle: string, // e.g. "Biceps" → lowercased
  attachmentName: string,
  state: ExerciseBuilderState,
  handsMode: 1 | 2 | 3 = 2,
  cablesMode: 1 | 2 | 3 = 2,
): string {
  const cfg = state.raw_config;
  const target = targetMuscle.toLowerCase();
  const name = exerciseName.toLowerCase();

  const grips = availableGrips(cfg);
  const showGrip = grips.length > 1 && state.grip_type != null;
  const gripStr = showGrip ? GRIP_ABBR[state.grip_type!] : null;

  const widths = availableWidths(cfg);
  const showWidth = widths.length > 1 && state.grip_width != null;
  const widthStr = showWidth ? WIDTH_ABBR[state.grip_width!] : null;

  const heights = availableCableHeights(cfg);
  const showHeight = heights.length > 1 && state.cable_height != null;
  const heightStr = showHeight ? HEIGHT_ABBR[state.cable_height!] : null;

  const hideHands = HIDE_HANDS.has(attachmentName);
  const handsStr = handsAbbrToken(hideHands, state.hands, handsMode);

  /** Per current equipment: default cable count (WAHR* / left column first). */
  const refDefaultCables = defaultCablesUsed(cfg);

  const targetName = target + ' ' + name;

  // ── Free + Cable ──────────────────────────────────────────────────────────
  if (combo === 'free_cable') {
    const cablesStr = cablesAbbrWithMode(state.cables_used, refDefaultCables, cablesMode, 'free_bench');

    // Stand / Sit (mutually exclusive)
    let posStr: string | null = null;
    if (state.sit && state.sit !== '0') {
      posStr = SIT_ABBR[state.sit] ?? null;
    } else if (state.stand) {
      posStr = STAND_ABBR[state.stand] ?? null;
    }

    const tokens = [
      posStr,
      'F',
      cablesStr,
      'C',
      heightStr,
      handsStr,
      attachmentName,
      targetName,
      gripStr,
    ];
    return joinTokens(tokens);
  }

  // ── Bench + Freeweight ────────────────────────────────────────────────────
  if (combo === 'bench_freeweight') {
    const angleStr = benchAngleStr(state);
    const bodyPosStr = state.body_pos ? (BODYPOS_ABBR[state.body_pos] ?? null) : null;

    const tokens = [
      'B' + angleStr,
      concat([handsStr, attachmentName]),
      [bodyPosStr, targetName].filter(Boolean).join(' '),
      gripStr,
      widthStr,
    ];
    return joinTokens(tokens);
  }

  // ── Bench + Cable ─────────────────────────────────────────────────────────
  if (combo === 'bench_cable') {
    const cablesStr = cablesAbbrWithMode(state.cables_used, refDefaultCables, cablesMode, 'free_bench');
    const angleStr = benchAngleStr(state);
    const bodyBenchStr = state.body_bench + '°'; // always show, even at 0°

    const tokens = [
      String(state.bench_cable_angle) + 'B' + angleStr,
      concat([cablesStr, 'C', heightStr]),
      [concat([handsStr, attachmentName]), bodyBenchStr, targetName].filter(Boolean).join(' '),
      gripStr,
    ];
    return joinTokens(tokens);
  }

  // ── Lat Pull ──────────────────────────────────────────────────────────────
  if (combo === 'lat_pull') {
    const cablesStr = cablesAbbrWithMode(state.cables_used, refDefaultCables, cablesMode, 'lat');
    const tokens = [
      concat(['LP', cablesStr]),
      concat([handsStr, attachmentName]),
      targetName,
      gripStr,
      widthStr,
    ];
    return joinTokens(tokens);
  }

  // ── Lat Row ───────────────────────────────────────────────────────────────
  if (combo === 'lat_row') {
    const cablesStr = cablesAbbrWithMode(state.cables_used, refDefaultCables, cablesMode, 'lat');
    const tokens = [
      concat(['LR', cablesStr]),
      concat([handsStr, attachmentName]),
      targetName,
      gripStr,
      widthStr,
    ];
    return joinTokens(tokens);
  }

  // ── Free + Freeweight / Machine ───────────────────────────────────────────
  const tokens = [
    handsStr,
    targetName,
    gripStr,
  ];
  return joinTokens(tokens);
}

// ── Display labels (for UI, not abbreviation) ─────────────────────────────────

export function benchAngleLabel(state: ExerciseBuilderState): string {
  if (!state.bench_type) return '—';
  if (state.bench_type === 'flat') return 'Flat (0°)';
  if (state.bench_type === 'upright') return 'Upright (90°)';
  if (state.bench_type === 'incl') {
    return state.bench_angle != null ? `Incline (${state.bench_angle}°)` : 'Incline (?)';
  }
  return '—';
}

export const GRIP_LABEL: Record<GripType, string> = {
  sup: 'Supinated', sn: 'Neutral-Sup', n: 'Neutral', np: 'Neutral-Pro', pro: 'Pronated',
};
export const WIDTH_LABEL: Record<GripWidth, string> = {
  '05': '× 0.5 (narrow)', '1': '× 1 (shoulder)', '15': '× 1.5 (wide)',
};
export const HEIGHT_LABEL: Record<CableHeight, string> = {
  '1_8': 'Low (1–8)', '9_15': 'Mid (9–15)', '16_22': 'High (16–22)',
};
export const STAND_LABEL: Record<StandAngle, string> = {
  '0': '0° (front)', '45': '45°', '90': '90°', '90os': '90° opposite side',
  '135': '135°', '180': '180° (back)',
};
export const BENCH_CABLE_LABEL: Record<number, string> = {
  0: '0° (face bench)', 90: '90° (perpendicular)', 180: '180° (back to bench)',
};
export const BODY_BENCH_LABEL: Record<number, string> = {
  0: '0° (face up)', 45: '45°', 90: '90°', 135: '135°', 180: '180° (face down)',
};
export const BENCH_TYPE_LABEL: Record<BenchType, string> = {
  flat: 'Flat', incl: 'Incline', upright: 'Upright',
};
export const BODY_POS_LABEL: Record<BodyPos, string> = {
  lying: 'Lying', '180': '180° (head down)', sitting: 'Sitting',
};
export const PLANE_LABEL: Record<PlaneType, string> = {
  lat:   'Lateral',
  ls:    'Lateral-Sagittal',
  sag:   'Sagittal',
  st:    'Sagittal-Transverse',
  trans: 'Transverse',
  tl:    'Transverse-Lateral',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function joinTokens(tokens: (string | null | undefined)[]): string {
  return tokens.filter(Boolean).join(' ');
}

function concat(tokens: (string | null | undefined)[]): string {
  const result = tokens.filter(Boolean).join('');
  return result || '';
}

function benchAngleStr(state: ExerciseBuilderState): string {
  if (!state.bench_type) return '?°';
  if (state.bench_type === 'flat') return '0°';
  if (state.bench_type === 'upright') return '90°';
  return state.bench_angle != null ? `${state.bench_angle}°` : '?°';
}

/**
 * Cables abbreviation token, mode-aware.
 *   mode=1: don't show (hidden)
 *   mode=2: always show the current count (fixed per equipment, informational)
 *   mode=3: show only when different from this equipment's default (user-selected)
 */
function cablesAbbrWithMode(
  cablesUsed: 1 | 2,
  refDefault: 1 | 2,
  cablesMode: 1 | 2 | 3,
  style: 'free_bench' | 'lat',
): string | null {
  if (cablesMode === 1) return null;
  if (cablesMode === 2) {
    return style === 'lat' ? String(cablesUsed) : cablesUsed === 2 ? '2C' : '1C';
  }
  // mode=3: only show when different from default
  if (cablesUsed === refDefault) return null;
  return style === 'lat' ? String(cablesUsed) : cablesUsed === 2 ? '2C' : '1C';
}

/**
 * Hands abbreviation token, mode-aware.
 *   mode=1: don't show (hidden)
 *   mode=2: always show the current count (fixed per equipment, informational)
 *   mode=3: show "1" only when one-hand; 2-hand stays unmarked (it's selectable)
 */
function handsAbbrToken(hideHands: boolean, hands: 1 | 2, handsMode: 1 | 2 | 3): string | null {
  if (hideHands) return null;
  if (handsMode === 1) return null;
  if (handsMode === 3) return hands === 1 ? '1' : null;
  return String(hands); // mode=2: always show
}
