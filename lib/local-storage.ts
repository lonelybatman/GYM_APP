import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Keys ─────────────────────────────────────────────────────────────────────
const KEYS = {
  BENCH_PRESETS: 'bench_presets',
  GYM_WEIGHTS: 'gym_machine_weights',
  EXTRA_WEIGHTS: 'local_extra_weights',
  SETTINGS: 'app_settings',
} as const;

// ── Bench Presets ────────────────────────────────────────────────────────────
export type RasterPreset = { raster_number: number; degree: number };
export type BenchPreset = {
  id: string;
  label: string;
  has_degree_markings: boolean;
  presets: RasterPreset[];
};

export async function getBenchPresets(): Promise<BenchPreset[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.BENCH_PRESETS);
    if (!raw) return [];
    return JSON.parse(raw) as BenchPreset[];
  } catch {
    return [];
  }
}

export async function saveBenchPresets(presets: BenchPreset[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.BENCH_PRESETS, JSON.stringify(presets));
  } catch {
    // ignore storage errors
  }
}

export async function addBenchPreset(preset: BenchPreset): Promise<void> {
  const presets = await getBenchPresets();
  presets.push(preset);
  await saveBenchPresets(presets);
}

export async function updateBenchPreset(id: string, updates: Partial<BenchPreset>): Promise<void> {
  const presets = await getBenchPresets();
  const idx = presets.findIndex((p) => p.id === id);
  if (idx !== -1) {
    presets[idx] = { ...presets[idx], ...updates };
    await saveBenchPresets(presets);
  }
}

export async function deleteBenchPreset(id: string): Promise<void> {
  const presets = await getBenchPresets();
  await saveBenchPresets(presets.filter((p) => p.id !== id));
}

export async function linkRasterToDegree(
  benchId: string,
  rasterNumber: number,
  degree: number,
): Promise<void> {
  const presets = await getBenchPresets();
  const bench = presets.find((p) => p.id === benchId);
  if (!bench) return;

  const existing = bench.presets.find((r) => r.raster_number === rasterNumber);
  if (existing) {
    existing.degree = degree;
  } else {
    bench.presets.push({ raster_number: rasterNumber, degree });
  }
  await saveBenchPresets(presets);
}

// ── App Settings ─────────────────────────────────────────────────────────────
export type AppSettings = {
  body_bench_visible: boolean; // R6: Body Position param visible in Bench+Cable
  claudeApiKey: string;
};

const DEFAULT_SETTINGS: AppSettings = { body_bench_visible: false, claudeApiKey: '' };

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...patch };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

// ── Extra Weights ─────────────────────────────────────────────────────────────
export type ExtraWeightConfig = { available_kg: number[] };

const DEFAULT_EXTRA_WEIGHTS: ExtraWeightConfig = { available_kg: [] };

export async function getExtraWeights(): Promise<ExtraWeightConfig> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EXTRA_WEIGHTS);
    if (!raw) return { ...DEFAULT_EXTRA_WEIGHTS };
    return JSON.parse(raw) as ExtraWeightConfig;
  } catch {
    return { ...DEFAULT_EXTRA_WEIGHTS };
  }
}

export async function saveExtraWeights(config: ExtraWeightConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.EXTRA_WEIGHTS, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}
