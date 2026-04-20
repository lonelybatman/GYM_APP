import type {
  RawConfig, ExerciseBuilderState, GripType, GripWidth, BenchType, BodyPos, CableHeight,
  StandAngle, SitAngle, PlaneType, ComboType,
} from './types';

// ── Config value helpers ──────────────────────────────────────────────────────

export type ConfigVal = boolean | string | null | undefined;

/** True if this option is available (true or "WAHR*") */
export const isAvail = (v: ConfigVal): boolean => v === true || v === 'WAHR*';

/** True if this is the starred default ("WAHR*") */
export const isDefaultStar = (v: ConfigVal): boolean => v === 'WAHR*';

/** From a list of config keys, return those that are available */
export function availableKeys<T extends string>(config: RawConfig, keys: T[]): T[] {
  return keys.filter((k) => isAvail(config[k]));
}

/** Returns the starred-default key, or the first available, or null */
export function defaultKey<T extends string>(config: RawConfig, keys: T[]): T | null {
  return (
    keys.find((k) => isDefaultStar(config[k])) ??
    keys.find((k) => isAvail(config[k])) ??
    null
  );
}

// ── Grip helpers ─────────────────────────────────────────────────────────────

const GRIP_KEYS: GripType[] = ['sup', 'sn', 'n', 'np', 'pro'];
const GRIP_CONFIG_KEY: Record<GripType, string> = {
  sup: 'grip_sup', sn: 'grip_sn', n: 'grip_n', np: 'grip_np', pro: 'grip_pro',
};

export function availableGrips(config: RawConfig): GripType[] {
  return GRIP_KEYS.filter((g) => isAvail(config[GRIP_CONFIG_KEY[g]]));
}
export function defaultGrip(config: RawConfig): GripType | null {
  return (
    GRIP_KEYS.find((g) => isDefaultStar(config[GRIP_CONFIG_KEY[g]])) ??
    GRIP_KEYS.find((g) => isAvail(config[GRIP_CONFIG_KEY[g]])) ??
    null
  );
}

// ── Grip-width helpers ────────────────────────────────────────────────────────

const WIDTH_KEYS: GripWidth[] = ['05', '1', '15'];
const WIDTH_CONFIG_KEY: Record<GripWidth, string> = {
  '05': 'grip_width_05', '1': 'grip_width_1', '15': 'grip_width_15',
};

export function availableWidths(config: RawConfig): GripWidth[] {
  return WIDTH_KEYS.filter((w) => isAvail(config[WIDTH_CONFIG_KEY[w]]));
}
export function defaultWidth(config: RawConfig): GripWidth | null {
  return (
    WIDTH_KEYS.find((w) => isDefaultStar(config[WIDTH_CONFIG_KEY[w]])) ??
    WIDTH_KEYS.find((w) => isAvail(config[WIDTH_CONFIG_KEY[w]])) ??
    null
  );
}

// ── Bench-type helpers ────────────────────────────────────────────────────────

const BENCH_KEYS: BenchType[] = ['flat', 'incl', 'upright'];
const BENCH_CONFIG_KEY: Record<BenchType, string> = {
  flat: 'bench_flat', incl: 'bench_incl', upright: 'bench_upright',
};

export function availableBenchTypes(config: RawConfig): BenchType[] {
  return BENCH_KEYS.filter((b) => isAvail(config[BENCH_CONFIG_KEY[b]]));
}
export function defaultBenchType(config: RawConfig): BenchType | null {
  return (
    BENCH_KEYS.find((b) => isDefaultStar(config[BENCH_CONFIG_KEY[b]])) ??
    BENCH_KEYS.find((b) => isAvail(config[BENCH_CONFIG_KEY[b]])) ??
    null
  );
}

// ── Body position helpers (Bench + FW) ────────────────────────────────────────

const BODYPOS_KEYS: BodyPos[] = ['lying', '180', 'sitting'];
const BODYPOS_CONFIG_KEY: Record<BodyPos, string> = {
  lying: 'body_pos_lying', '180': 'body_pos_180', sitting: 'body_pos_sitting',
};

export function availableBodyPos(config: RawConfig): BodyPos[] {
  return BODYPOS_KEYS.filter((p) => isAvail(config[BODYPOS_CONFIG_KEY[p]]));
}
export function defaultBodyPos(config: RawConfig): BodyPos | null {
  return (
    BODYPOS_KEYS.find((p) => isDefaultStar(config[BODYPOS_CONFIG_KEY[p]])) ??
    BODYPOS_KEYS.find((p) => isAvail(config[BODYPOS_CONFIG_KEY[p]])) ??
    null
  );
}

// ── Cable height helpers ──────────────────────────────────────────────────────

const HEIGHT_KEYS: CableHeight[] = ['1_8', '9_15', '16_22'];
const HEIGHT_CONFIG_KEY: Record<CableHeight, string> = {
  '1_8': 'cable_height_1_8', '9_15': 'cable_height_9_15', '16_22': 'cable_height_16_22',
};

/** True if CSV import wrote cable-count columns into config */
export function hasCablesUsedInConfig(config: RawConfig): boolean {
  return Object.prototype.hasOwnProperty.call(config, 'cables_used_1')
    || Object.prototype.hasOwnProperty.call(config, 'cables_used_2');
}

export function availableCablesUsed(config: RawConfig): (1 | 2)[] {
  if (!hasCablesUsedInConfig(config)) return [1, 2];
  const vals: (1 | 2)[] = [];
  if (isAvail(config['cables_used_1'])) vals.push(1);
  if (isAvail(config['cables_used_2'])) vals.push(2);
  return vals;
}

export function defaultCablesUsed(config: RawConfig): 1 | 2 {
  if (!hasCablesUsedInConfig(config)) return 1;
  // WAHR* before plain WAHR; column AX (1) before AY (2) in CSV
  if (isDefaultStar(config['cables_used_1'])) return 1;
  if (isDefaultStar(config['cables_used_2'])) return 2;
  if (isAvail(config['cables_used_1'])) return 1;
  if (isAvail(config['cables_used_2'])) return 2;
  return 1;
}

/**
 * Show Cables count row only for this equipment when both 1 and 2 cables are WAHR.
 * Rule 1 (per equipment): only one count → no row; value only in abbreviation.
 */
export function showCablesCountPicker(config: RawConfig, combo: ComboType): boolean {
  const cableCombos: ComboType[] = ['free_cable', 'bench_cable', 'lat_pull', 'lat_row'];
  if (!cableCombos.includes(combo)) return false;
  if (!hasCablesUsedInConfig(config)) return true;
  return isAvail(config['cables_used_1']) && isAvail(config['cables_used_2']);
}

export function availableHands(config: RawConfig): (1 | 2)[] {
  const vals: (1 | 2)[] = [];
  if (isAvail(config['hand_1'])) vals.push(1);
  if (isAvail(config['hand_2'])) vals.push(2);
  return vals;
}

export function defaultHands(config: RawConfig): 1 | 2 {
  // WAHR* before plain WAHR; without star prefer left column (hand_1 before hand_2)
  if (isDefaultStar(config['hand_1'])) return 1;
  if (isDefaultStar(config['hand_2'])) return 2;
  if (isAvail(config['hand_1']) && !isAvail(config['hand_2'])) return 1;
  if (!isAvail(config['hand_1']) && isAvail(config['hand_2'])) return 2;
  if (isAvail(config['hand_1']) && isAvail(config['hand_2'])) return 1;
  return 2;
}

/** Show Hands row only when this equipment allows both 1- and 2-hand (Rule 1 per equipment → hide otherwise). */
export function showHandsCountPicker(config: RawConfig): boolean {
  return availableHands(config).length >= 2;
}

/**
 * Exercise-level hands mode, derived from ALL equipment options of the exercise:
 *   1 = all equipment uses only one value (same) → don't show in abbreviation or builder
 *   2 = each equipment has exactly one value, but differ across equipment → show in abbreviation, no picker
 *   3 = at least one equipment supports both 1 and 2 → show in abbreviation, picker for qualifying equipment
 */
export function computeHandsMode(configs: RawConfig[]): 1 | 2 | 3 {
  const relevant = configs.filter(c => isAvail(c['hand_1']) || isAvail(c['hand_2']));
  if (relevant.length === 0) return 1;
  if (relevant.some(c => isAvail(c['hand_1']) && isAvail(c['hand_2']))) return 3;
  const has1Only = relevant.some(c => isAvail(c['hand_1']) && !isAvail(c['hand_2']));
  const has2Only = relevant.some(c => !isAvail(c['hand_1']) && isAvail(c['hand_2']));
  return has1Only && has2Only ? 2 : 1;
}

/**
 * Exercise-level cables mode (same logic as computeHandsMode, applied to cables_used_1/2).
 * Returns 1 for non-cable combos.
 */
export function computeCablesMode(configs: RawConfig[], combo: ComboType): 1 | 2 | 3 {
  const cableCombos: ComboType[] = ['free_cable', 'bench_cable', 'lat_pull', 'lat_row'];
  if (!cableCombos.includes(combo)) return 1;
  const relevant = configs.filter(c => isAvail(c['cables_used_1']) || isAvail(c['cables_used_2']));
  if (relevant.length === 0) return 1;
  if (relevant.some(c => isAvail(c['cables_used_1']) && isAvail(c['cables_used_2']))) return 3;
  const has1Only = relevant.some(c => isAvail(c['cables_used_1']) && !isAvail(c['cables_used_2']));
  const has2Only = relevant.some(c => !isAvail(c['cables_used_1']) && isAvail(c['cables_used_2']));
  return has1Only && has2Only ? 2 : 1;
}

export function availableCableHeights(config: RawConfig): CableHeight[] {
  return HEIGHT_KEYS.filter((h) => isAvail(config[HEIGHT_CONFIG_KEY[h]]));
}
export function defaultCableHeight(config: RawConfig): CableHeight | null {
  return (
    HEIGHT_KEYS.find((h) => isDefaultStar(config[HEIGHT_CONFIG_KEY[h]])) ??
    HEIGHT_KEYS.find((h) => isAvail(config[HEIGHT_CONFIG_KEY[h]])) ??
    null
  );
}

// ── Stand helpers ─────────────────────────────────────────────────────────────

const STAND_KEYS: StandAngle[] = ['0', '45', '90', '90os', '135', '180'];
const STAND_CONFIG_KEY: Record<StandAngle, string> = {
  '0': 'stand_0', '45': 'stand_45', '90': 'stand_90',
  '90os': 'stand_90os', '135': 'stand_135', '180': 'stand_180',
};

export function availableStandAngles(config: RawConfig): StandAngle[] {
  return STAND_KEYS.filter((s) => isAvail(config[STAND_CONFIG_KEY[s]]));
}
export function defaultStandAngle(config: RawConfig): StandAngle | null {
  return (
    STAND_KEYS.find((s) => isDefaultStar(config[STAND_CONFIG_KEY[s]])) ??
    STAND_KEYS.find((s) => isAvail(config[STAND_CONFIG_KEY[s]])) ??
    null
  );
}

// ── Plane helpers ─────────────────────────────────────────────────────────────

const PLANE_KEYS: PlaneType[] = ['lat', 'ls', 'sag', 'st', 'trans', 'tl'];
const PLANE_CONFIG_KEY: Record<PlaneType, string> = {
  lat: 'plane_lat', ls: 'plane_ls', sag: 'plane_sag',
  st: 'plane_st', trans: 'plane_trans', tl: 'plane_tl',
};

export function availablePlanes(config: RawConfig): PlaneType[] {
  return PLANE_KEYS.filter((p) => isAvail(config[PLANE_CONFIG_KEY[p]]));
}
export function defaultPlane(config: RawConfig): PlaneType | null {
  return (
    PLANE_KEYS.find((p) => isDefaultStar(config[PLANE_CONFIG_KEY[p]])) ??
    PLANE_KEYS.find((p) => isAvail(config[PLANE_CONFIG_KEY[p]])) ??
    null
  );
}

// ── Build initial state from an equipment_option ──────────────────────────────

export function buildInitialState(
  optionId: string,
  config: RawConfig,
  comboType: string,
): ExerciseBuilderState {
  const grips = availableGrips(config);
  const widths = availableWidths(config);

  return {
    equipment_option_id: optionId,
    raw_config: config,

    hands: defaultHands(config),
    grip_type: defaultGrip(config),
    grip_width: defaultWidth(config),

    cables_used: defaultCablesUsed(config),
    cable_height: defaultCableHeight(config),

    stand: defaultStandAngle(config),
    sit: null,

    bench_type: defaultBenchType(config),
    bench_angle: null,
    last_bench_angle: null,
    body_pos: defaultBodyPos(config),

    bench_cable_angle: isAvail(config['bench_cable_0']) ? 0 : isAvail(config['bench_cable_90']) ? 90 : isAvail(config['bench_cable_180']) ? 180 : 0,
    body_bench: 0,

    plane: defaultPlane(config),
  };
}

// ── R2: Plane computation and validation ──────────────────────────────────────

/**
 * Compute the active plane from the current state + config.
 * Returns the dominant plane string or null if undetermined.
 */
export function computeActivePlane(state: ExerciseBuilderState, combo: string): string | null {
  // Bench combos: plane determined by bench angle + body position
  if (combo === 'bench_freeweight' || combo === 'bench_cable') {
    if (!state.bench_type) return null;
    if (state.bench_type === 'flat') return 'plane_sag';
    if (state.bench_type === 'upright') return 'plane_trans';
    // incline: sagittal-transverse diagonal
    return 'plane_st';
  }
  // Free + Cable: plane determined by stand angle
  if (combo === 'free_cable' || combo === 'free_freeweight') {
    const angle = state.stand;
    if (!angle || angle === '0' || angle === '180') return 'plane_sag';
    if (angle === '90' || angle === '90os') return 'plane_lat';
    return 'plane_ls'; // 45°, 135° = diagonal
  }
  // Lat pull/row: always sagittal
  if (combo === 'lat_pull' || combo === 'lat_row') return 'plane_sag';
  return null;
}

/**
 * R2: After any parameter change that could affect the plane,
 * validate remaining params. Reset invalid ones silently.
 */
export function validateAfterPlaneChange(
  state: ExerciseBuilderState,
  combo: string,
): ExerciseBuilderState {
  const newState = { ...state };

  // Bench combos: if bench_type changes plane, re-check body_pos validity
  if (combo === 'bench_freeweight' || combo === 'bench_cable') {
    const validBodyPos = availableBodyPos(newState.raw_config);
    if (newState.body_pos && !validBodyPos.includes(newState.body_pos)) {
      newState.body_pos = defaultBodyPos(newState.raw_config);
    }
    // bench_cable: re-check cable_height validity
    if (combo === 'bench_cable') {
      const validHeights = availableCableHeights(newState.raw_config);
      if (newState.cable_height && !validHeights.includes(newState.cable_height)) {
        newState.cable_height = defaultCableHeight(newState.raw_config);
      }
    }
  }

  // free_cable: if stand changes plane, re-check cable_height + sit/stand conflict (R4)
  if (combo === 'free_cable') {
    const validHeights = availableCableHeights(newState.raw_config);
    if (newState.cable_height && !validHeights.includes(newState.cable_height)) {
      newState.cable_height = defaultCableHeight(newState.raw_config);
    }
    // If sit is set, clear stand (R4 enforcement)
    if (newState.sit && newState.stand) {
      newState.stand = null;
    }
    // Re-check grip validity after plane change
    const validGrips = availableGrips(newState.raw_config);
    if (newState.grip_type && !validGrips.includes(newState.grip_type)) {
      newState.grip_type = defaultGrip(newState.raw_config);
    }
    // Re-check grip width validity
    const validWidths = availableWidths(newState.raw_config);
    if (newState.grip_width && !validWidths.includes(newState.grip_width)) {
      newState.grip_width = defaultWidth(newState.raw_config);
    }
  }

  return newState;
}

// ── Re-apply equipment change (R1: keep values if still valid) ────────────────

export function applyEquipmentChange(
  prev: ExerciseBuilderState,
  newOptionId: string,
  newConfig: RawConfig,
  comboType: string,
): ExerciseBuilderState {
  const newState = buildInitialState(newOptionId, newConfig, comboType);

  // R1: Keep grip if still valid
  const grips = availableGrips(newConfig);
  if (prev.grip_type && grips.includes(prev.grip_type)) {
    newState.grip_type = prev.grip_type;
  }

  // Hands: only keep user choice when Rule 3 applies (both hands allowed on this equipment)
  if (availableHands(newConfig).length >= 2) {
    if (prev.hands === 1 && isAvail(newConfig['hand_1'])) newState.hands = 1;
    else if (prev.hands === 2 && isAvail(newConfig['hand_2'])) newState.hands = 2;
    else newState.hands = defaultHands(newConfig);
  } else {
    newState.hands = defaultHands(newConfig);
  }

  // R1: Keep grip width if still valid
  const widths = availableWidths(newConfig);
  if (prev.grip_width && widths.includes(prev.grip_width)) {
    newState.grip_width = prev.grip_width;
  }

  const combo = comboType as ComboType;
  if (showCablesCountPicker(newConfig, combo)) {
    const av = availableCablesUsed(newConfig);
    if (prev.cables_used === 1 && av.includes(1)) newState.cables_used = 1;
    else if (prev.cables_used === 2 && av.includes(2)) newState.cables_used = 2;
    else newState.cables_used = defaultCablesUsed(newConfig);
  } else {
    newState.cables_used = defaultCablesUsed(newConfig);
  }

  return newState;
}
