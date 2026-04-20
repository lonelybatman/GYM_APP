import { useEffect, useState, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useCreatePlan } from '../../lib/create-plan-store';
import { ParamRow } from '../../components/exercise-builder/ParamRow';
import { BenchAnglePicker } from '../../components/exercise-builder/BenchAnglePicker';
import { PerspectivePlaceholder } from '../../components/exercise-builder/PerspectivePlaceholder';
import { HumanModel3D } from '../../components/exercise-builder/HumanModel3D';
import { MuscleActivationBar } from '../../components/exercise-builder/MuscleActivationBar';

import {
  fetchExerciseById, fetchEquipmentOptions, fetchTargetMuscleName,
  pickDefaultEquipmentOption,
  type ExerciseWithCombo, type EquipmentOption,
} from '../../lib/queries/exercises';
import {
  fetchExerciseVariantGroupByExerciseId,
  type ExerciseVariantGroupBundle,
} from '../../lib/queries/exercise-variants';
import {
  findMatchingVariantMember,
  formatVariantMemberOptionLabel,
  applyDiscriminantToState,
} from '../../lib/exercise-builder/variant-resolution';
import {
  getComboType,
  type ExerciseBuilderState,
  type GripType,
  type GripWidth,
  type BenchType,
  type CableHeight,
  type StandAngle,
} from '../../lib/exercise-builder/types';
import {
  buildInitialState,
  availableGrips, availableWidths, availableBenchTypes,
  availableBodyPos, availableCableHeights, availableStandAngles,
  availablePlanes, showCablesCountPicker,
  availableHands, availableCablesUsed,
  isAvail,
  validateAfterPlaneChange, computeActivePlane,
  computeHandsMode, computeCablesMode,
} from '../../lib/exercise-builder/config-utils';
import { getSettings } from '../../lib/local-storage';
import {
  generateAbbreviation,
  GRIP_LABEL, WIDTH_LABEL, HEIGHT_LABEL, STAND_LABEL,
  BENCH_CABLE_LABEL, BODY_BENCH_LABEL, BODY_POS_LABEL, PLANE_LABEL,
} from '../../lib/exercise-builder/abbreviation';
// Perspectives per exercise name (from perspective_logic.docx)
const EXERCISE_PERSPECTIVES: Record<string, ['oben' | 'vorne' | 'seite', 'oben' | 'vorne' | 'seite']> = {
  curl:    ['vorne', 'seite'], Bcurl:  ['oben', 'vorne'],
  CBcurl:  ['oben', 'vorne'], Ccurl:  ['oben', 'vorne'],
  Scurl:   ['oben', 'seite'], ext:    ['oben', 'seite'],
  OHext:   ['oben', 'seite'], Scrusher: ['oben', 'seite'],
  PD:      ['vorne', 'seite'], fly:   ['oben', 'vorne'],
  Rfly:    ['oben', 'vorne'], press:  ['oben', 'seite'],
  Lraise:  ['oben', 'vorne'], Fraise: ['oben', 'vorne'],
  Rraise:  ['oben', 'vorne'], Yraise: ['oben', 'vorne'],
  pull:    ['vorne', 'seite'], Apull: ['oben', 'vorne'],
  Fpull:   ['oben', 'vorne'], Rpull: ['oben', 'seite'],
  row:     ['oben', 'seite'], Frow:  ['oben', 'seite'],
  Kflap:   ['seite', 'seite'], Kshrugg: ['oben', 'seite'],
  shrugg:  ['vorne', 'vorne'], crunch: ['vorne', 'seite'],
  squat:   ['oben', 'seite'], RDL:   ['oben', 'seite'],
  DL:      ['vorne', 'seite'], 'HYPR-X': ['oben', 'seite'],
  flexion: ['oben', 'seite'],
};

export default function ExerciseBuilderScreen() {
  const {
    exerciseId,
    dayNumber,
    superdefaultOnly,
  } = useLocalSearchParams<{
    exerciseId: string;
    dayNumber?: string;
    superdefaultOnly?: string;
  }>();
  const router = useRouter();
  const { state, updateDay } = useCreatePlan();

  const [exercise, setExercise] = useState<ExerciseWithCombo | null>(null);
  const [options, setOptions] = useState<EquipmentOption[]>([]);
  const [targetMuscle, setTargetMuscle] = useState('');
  const [builderState, setBuilderState] = useState<ExerciseBuilderState | null>(null);
  const [loading, setLoading] = useState(true);
  const [bodyBenchVisible, setBodyBenchVisible] = useState(false);
  const [activePerspIdx, setActivePerspIdx] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [variantBundle, setVariantBundle] = useState<ExerciseVariantGroupBundle | null>(null);
  // Discriminant-Werte die nach dem nächsten Reload auf den initialen State angewendet werden sollen.
  // Verhindert dass buildInitialState einen falschen Default setzt und einen Loop auslöst.
  const pendingDiscriminantRef = useRef<Record<string, unknown> | null>(null);

  const closeToStep3 = () => {
    if (isClosing) return;
    setIsClosing(true);
    // Keep a solid frame while navigator swaps screens.
    setTimeout(() => {
      router.back();
      setTimeout(() => setIsClosing(false), 120);
    }, 40);
  };

  useEffect(() => {
    setActivePerspIdx(0);
  }, [exerciseId]);

  // Load data
  useEffect(() => {
    if (!exerciseId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchExerciseById(exerciseId),
      fetchEquipmentOptions(exerciseId),
      getSettings(),
      fetchExerciseVariantGroupByExerciseId(exerciseId).catch(() => null),
    ])
      .then(async ([ex, opts, settings, vBundle]) => {
        if (cancelled) return;
        setBodyBenchVisible(settings.body_bench_visible);
        if (!ex) {
          setVariantBundle(null);
          setExercise(null);
          setOptions([]);
          setBuilderState(null);
          setTargetMuscle('');
          return;
        }
        setVariantBundle(vBundle ?? null);
        setExercise(ex);
        setOptions(opts);

        const muscleName = await fetchTargetMuscleName(ex.target_muscle_id);
        if (cancelled) return;
        setTargetMuscle(muscleName);

        const combo = getComboType(ex.combo.place, ex.combo.weight_type);
        const defaultOpt = pickDefaultEquipmentOption(opts);
        if (defaultOpt) {
          let initial = buildInitialState(defaultOpt.id, defaultOpt.config, combo);
          // Pending discriminant anwenden: verhindert Loop wenn buildInitialState
          // einen anderen Default hätte als den Wert der den Wechsel ausgelöst hat.
          if (pendingDiscriminantRef.current) {
            initial = applyDiscriminantToState(initial, pendingDiscriminantRef.current);
            pendingDiscriminantRef.current = null;
          }
          setBuilderState(initial);
        } else {
          pendingDiscriminantRef.current = null;
          setBuilderState(null);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  /**
   * DB-gesteuerte Variantengruppe: var-Detail (discriminant) → passende exercise_id.
   * Wechsel nur per router.setParams; vollständiger Reload läuft im Load-effect oben.
   * pendingDiscriminantRef wird gesetzt damit der Reload den richtigen State bekommt.
   */
  useEffect(() => {
    if (loading || !builderState || !exerciseId) return;
    if (!variantBundle || variantBundle.members.length < 2) return;

    const match = findMatchingVariantMember(variantBundle.members, builderState);
    if (!match || match.exercise_id === exerciseId) return;

    pendingDiscriminantRef.current = { ...match.discriminant } as Record<string, unknown>;
    router.setParams({ exerciseId: match.exercise_id });
  }, [
    loading,
    exerciseId,
    variantBundle,
    builderState,
    router,
  ]);

  // ── Exercise-level hands / cables mode (from all equipment options) ──────────
  const handsMode = useMemo(
    () => computeHandsMode(options.map((o) => o.config)),
    [options],
  );
  const cablesMode = useMemo(() => {
    if (!exercise) return 1 as const;
    const c = getComboType(exercise.combo.place, exercise.combo.weight_type);
    return computeCablesMode(options.map((o) => o.config), c);
  }, [options, exercise?.combo.place, exercise?.combo.weight_type]);

  // ── Abbreviation (live) ───────────────────────────────────────────────────
  const abbreviation = useMemo(() => {
    if (!exercise || !builderState) return '';
    const combo = getComboType(exercise.combo.place, exercise.combo.weight_type);
    const selectedOpt = options.find((o) => o.id === builderState.equipment_option_id);
    return generateAbbreviation(
      combo,
      exercise.name,
      targetMuscle,
      selectedOpt?.name ?? '',
      builderState,
      handsMode,
      cablesMode,
    );
  }, [exercise, builderState, targetMuscle, options, handsMode, cablesMode]);

  const variantMembersSorted = useMemo(() => {
    if (!variantBundle) return [];
    let members = [...variantBundle.members].sort((a, b) => a.sort_order - b.sort_order);
    if (superdefaultOnly === '1') {
      members = members.filter((m) => m.is_superdefault);
    }
    return members;
  }, [variantBundle, superdefaultOnly]);

  const showVariantExecutionPicker = variantMembersSorted.length >= 2;

  // ── Perspectives (Bench + Cable: immer „oben“ anbieten, sonst fehlt der Bank-Button-Pfad) ──
  const perspectives = useMemo((): ('oben' | 'vorne' | 'seite')[] => {
    if (!exercise) return ['vorne', 'seite'];
    const raw = EXERCISE_PERSPECTIVES[exercise.name] ?? ['vorne', 'seite'];
    const list: ('oben' | 'vorne' | 'seite')[] = [...raw];
    const c = getComboType(exercise.combo.place, exercise.combo.weight_type);
    if ((c === 'bench_cable' || c === 'free_cable') && !list.includes('oben')) {
      list.unshift('oben');
    }
    return [...new Set(list)];
  }, [exercise]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.PRIMARY} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!exercise || !builderState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Exercise not found</Text>
          <TouchableOpacity onPress={closeToStep3}>
            <Text style={styles.link}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const combo = getComboType(exercise.combo.place, exercise.combo.weight_type);
  const attachmentOptions = options;
  const cfg = builderState.raw_config;
  const grips = availableGrips(cfg);
  const widths = availableWidths(cfg);
  const benchTypes = availableBenchTypes(cfg);
  const bodyPositions = availableBodyPos(cfg);
  const cableHeights = availableCableHeights(cfg);
  const standAngles = availableStandAngles(cfg);
  const planes = availablePlanes(cfg);
  const hasSit = isAvail(cfg['sit_0']) || isAvail(cfg['sit_90']);
  const handsAvailable = availableHands(cfg);
  const cablesAvailable = availableCablesUsed(cfg);
  // Rule 3: picker only when exercise-level mode=3 AND this specific equipment supports both
  const showHandsRow = handsMode === 3 && handsAvailable.length >= 2;
  const showCablesRow = cablesMode === 3 && showCablesCountPicker(cfg, combo) && cablesAvailable.length >= 2;
  const handParamOptions = handsAvailable.map((h) => ({
    value: String(h),
    label: h === 1 ? '1 Hand' : '2 Hands',
  }));
  const cableParamOptions = cablesAvailable.map((c) => ({
    value: String(c),
    label: c === 1 ? '× 1 Cable' : '× 2 Cables',
  }));

  // ── State updaters ────────────────────────────────────────────────────────
  const update = (patch: Partial<ExerciseBuilderState>) =>
    setBuilderState((s) => {
      if (!s) return s;
      const next = { ...s, ...patch };
      return validateAfterPlaneChange(next, combo);
    });

  const handleEquipmentChange = (optId: string) => {
    const newOpt = options.find((o) => o.id === optId);
    if (!newOpt || !exercise) return;
    setBuilderState(buildInitialState(newOpt.id, newOpt.config, combo));
  };

  const handleExecutionVariantChange = (memberExerciseId: string) => {
    if (!exerciseId || memberExerciseId === exerciseId) return;
    const targetMember = variantBundle?.members.find((m) => m.exercise_id === memberExerciseId);
    if (targetMember?.discriminant) {
      pendingDiscriminantRef.current = { ...targetMember.discriminant } as Record<string, unknown>;
    }
    router.setParams({ exerciseId: memberExerciseId });
  };

  const handleBenchTypeChange = (bt: BenchType) => {
    if (bt !== 'incl') {
      // R5: switching away from incline — save last angle
      update({ bench_type: bt, last_bench_angle: builderState.bench_angle, bench_angle: null });
    } else {
      // R5: switching back to incline — restore last angle
      update({ bench_type: bt, bench_angle: builderState.last_bench_angle });
    }
  };

  const handleStandChange = (v: string) => {
    // R4: selecting stand clears sit
    update({ stand: v as StandAngle, sit: null });
  };

  const handleSitChange = (v: string) => {
    // R4: selecting sit clears stand
    update({ sit: v as any, stand: null });
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={closeToStep3} hitSlop={12}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.comboLabel}>{exercise.combo.label}</Text>
          <Text style={styles.abbreviation}>{abbreviation || '—'}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── 3D Model ─────────────────────────────────────────────────── */}
        <View style={styles.modelSection}>
          {/* Perspective tabs */}
          {perspectives[0] !== perspectives[1] && (
            <View style={styles.perspTabs}>
              {perspectives.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.perspTab, activePerspIdx === i && styles.perspTabActive]}
                  onPress={() => setActivePerspIdx(i)}
                >
                  <Text style={[styles.perspTabText, activePerspIdx === i && styles.perspTabTextActive]}>
                    {p === 'oben' ? 'Oben' : p === 'vorne' ? 'Vorne' : 'Seite'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <HumanModel3D
            width={220}
            height={300}
            bench
            benchAngle={builderState.bench_angle ?? 0}
            benchZAngle={combo === 'bench_cable' ? builderState.bench_cable_angle : 0}
            perspective={perspectives[activePerspIdx] ?? 'vorne'}
            benchCableAngle={combo === 'bench_cable' ? builderState.bench_cable_angle : null}
            allowBenchXZEditor={combo === 'bench_cable' || combo === 'free_cable'}
            onBenchAdjustRequestOben={
              perspectives.includes('oben')
                ? () => setActivePerspIdx(perspectives.indexOf('oben'))
                : undefined
            }
          />
        </View>

        {/* ── Exercise Name ────────────────────────────────────────────── */}
        <View style={styles.exerciseTitleRow}>
          <Text style={styles.exerciseTitle}>{exercise.name}</Text>
          <Text style={styles.targetMuscle}>{targetMuscle}</Text>
        </View>

        {/* ── Parameters ───────────────────────────────────────────────── */}

        {showVariantExecutionPicker && variantBundle && (
          <ParamRow
            label="Ausführung"
            options={variantMembersSorted.map((m) => ({
              value: m.exercise_id,
              label: formatVariantMemberOptionLabel(m, variantBundle.axes),
            }))}
            selected={exercise.id}
            onSelect={handleExecutionVariantChange}
          />
        )}

        {attachmentOptions.length >= 2 && (
          <ParamRow
            label={combo === 'free_freeweight' || combo === 'bench_freeweight' ? 'Equipment' : 'Attachment'}
            options={attachmentOptions.map((o) => ({ value: o.id, label: o.name }))}
            selected={builderState.equipment_option_id}
            onSelect={handleEquipmentChange}
          />
        )}

        {/* Hands: Rule 3 — only when this equipment allows both 1 and 2 */}
        {showHandsRow && (
          <ParamRow
            label="Hands"
            options={handParamOptions}
            selected={String(builderState.hands)}
            onSelect={(v) => update({ hands: Number(v) as 1 | 2 })}
          />
        )}

        {showCablesRow && (
          <ParamRow
            label="Cables"
            options={cableParamOptions}
            selected={String(builderState.cables_used)}
            onSelect={(v) => update({ cables_used: Number(v) as 1 | 2 })}
          />
        )}

        {/* 3. Grip Type (only if ≥2 available) */}
        {grips.length >= 1 && (
          <ParamRow
            label="Grip"
            options={grips.map((g) => ({ value: g, label: GRIP_LABEL[g] }))}
            selected={builderState.grip_type}
            onSelect={(v) => update({ grip_type: v as GripType })}
          />
        )}

        {/* 4. Grip Width (only if ≥1 available) */}
        {widths.length >= 1 && (
          <ParamRow
            label="Grip Width"
            options={widths.map((w) => ({ value: w, label: WIDTH_LABEL[w] }))}
            selected={builderState.grip_width}
            onSelect={(v) => update({ grip_width: v as GripWidth })}
          />
        )}

        {/* ── FREE + CABLE extras ────────────────────────────────────── */}
        {(combo === 'free_cable') && (
          <>
            {/* Cable height */}
            {cableHeights.length >= 1 && (
              <ParamRow
                label="Cable Height"
                options={cableHeights.map((h) => ({ value: h, label: HEIGHT_LABEL[h] }))}
                selected={builderState.cable_height}
                onSelect={(v) => update({ cable_height: v as CableHeight })}
              />
            )}

            {/* Stand position */}
            {standAngles.length > 0 && !hasSit && (
              <ParamRow
                label="Stand Position"
                options={standAngles.map((s) => ({ value: s, label: STAND_LABEL[s] }))}
                selected={builderState.stand}
                onSelect={handleStandChange}
              />
            )}

            {/* Sit / Stand (when both possible) */}
            {hasSit && standAngles.length > 0 && (
              <>
                <ParamRow
                  label="Position Mode"
                  options={[{ value: 'stand', label: 'Standing' }, { value: 'sit', label: 'Sitting' }]}
                  selected={builderState.sit ? 'sit' : 'stand'}
                  onSelect={(v) => {
                    if (v === 'stand') update({ sit: null });
                    else update({ stand: null });
                  }}
                />
                {!builderState.sit && standAngles.length >= 2 && (
                  <ParamRow
                    label="Stand Angle"
                    options={standAngles.map((s) => ({ value: s, label: STAND_LABEL[s] }))}
                    selected={builderState.stand}
                    onSelect={handleStandChange}
                  />
                )}
                {builderState.sit !== null && (
                  <ParamRow
                    label="Sit Angle"
                    options={[
                      ...(isAvail(cfg['sit_0']) ? [{ value: '0', label: '0° (face cable)' }] : []),
                      ...(isAvail(cfg['sit_90']) ? [{ value: '90', label: '90° (side)' }] : []),
                    ]}
                    selected={builderState.sit}
                    onSelect={handleSitChange}
                  />
                )}
              </>
            )}

            {/* Sit only (no stand available) */}
            {hasSit && standAngles.length === 0 && (
              <ParamRow
                label="Sit Angle"
                options={[
                  ...(isAvail(cfg['sit_0']) ? [{ value: '0', label: '0° (face cable)' }] : []),
                  ...(isAvail(cfg['sit_90']) ? [{ value: '90', label: '90° (side)' }] : []),
                ]}
                selected={builderState.sit}
                onSelect={handleSitChange}
              />
            )}
          </>
        )}

        {/* ── BENCH + FREEWEIGHT extras ──────────────────────────────── */}
        {combo === 'bench_freeweight' && (
          <>
            <BenchAnglePicker
              benchTypes={benchTypes}
              selectedType={builderState.bench_type}
              benchAngle={builderState.bench_angle}
              onTypeChange={handleBenchTypeChange}
              onAngleChange={(angle) => update({ bench_angle: angle })}
            />
            {bodyPositions.length >= 1 && (
              <ParamRow
                label="Body Position"
                options={bodyPositions.map((p) => ({ value: p, label: BODY_POS_LABEL[p] }))}
                selected={builderState.body_pos}
                onSelect={(v) => update({ body_pos: v as any })}
              />
            )}
          </>
        )}

        {/* ── BENCH + CABLE extras ───────────────────────────────────── */}
        {combo === 'bench_cable' && (
          <>
            <BenchAnglePicker
              benchTypes={benchTypes}
              selectedType={builderState.bench_type}
              benchAngle={builderState.bench_angle}
              onTypeChange={handleBenchTypeChange}
              onAngleChange={(angle) => update({ bench_angle: angle })}
            />
            <ParamRow
              label="Bench : Cable Angle"
              options={[0, 90, 180].map((v) => ({ value: String(v), label: BENCH_CABLE_LABEL[v] }))}
              selected={String(builderState.bench_cable_angle)}
              onSelect={(v) => update({ bench_cable_angle: Number(v) as any })}
            />
            {cableHeights.length >= 1 && (
              <ParamRow
                label="Cable Height"
                options={cableHeights.map((h) => ({ value: h, label: HEIGHT_LABEL[h] }))}
                selected={builderState.cable_height}
                onSelect={(v) => update({ cable_height: v as CableHeight })}
              />
            )}
            <ParamRow
              label="Body : Bench"
              options={[0, 45, 90, 135, 180].map((v) => ({ value: String(v), label: BODY_BENCH_LABEL[v] }))}
              selected={String(builderState.body_bench)}
              onSelect={(v) => update({ body_bench: Number(v) as any })}
            />
            {combo === 'bench_cable' && bodyBenchVisible && bodyPositions.length >= 1 && (
              <ParamRow
                label="Body Position"
                options={bodyPositions.map((p) => ({ value: p, label: BODY_POS_LABEL[p] }))}
                selected={builderState.body_pos}
                onSelect={(v) => update({ body_pos: v as any })}
                textOnly={bodyPositions.length === 1}
              />
            )}
          </>
        )}

        {/* ── Muscle Activation Bar ──────────────────────────────────── */}
        <MuscleActivationBar />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.scanBtn}>
          <Text style={styles.scanBtnText}>⊡ Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => {
            if (dayNumber && exercise) {
              const dn = Number(dayNumber);
              const day = state.days.find((d) => d.day_number === dn);
              if (day) {
                const already = (day.exercises ?? []).some((e) => e.exercise_id === exercise.id);
                if (!already) {
                  updateDay(dn, {
                    exercises: [...(day.exercises ?? []), {
                      exercise_id: exercise.id,
                      exercise_combo_id: exercise.exercise_combo_id,
                      name: exercise.name,
                      combo_label: exercise.combo.label,
                    }],
                  });
                }
              }
            }
            closeToStep3();
          }}
        >
          <Text style={styles.nextBtnText}>Add →</Text>
        </TouchableOpacity>
      </View>
      {isClosing && <View pointerEvents="none" style={styles.closingMask} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  modelSection: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  perspTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    overflow: 'hidden',
  },
  perspTab: { paddingHorizontal: 24, paddingVertical: 8 },
  perspTabActive: { backgroundColor: Colors.PRIMARY },
  perspTabText: { color: Colors.TEXT_SECONDARY, fontWeight: '600', fontSize: 14 },
  perspTabTextActive: { color: Colors.TEXT },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: Colors.TEXT_SECONDARY },
  link: { color: Colors.PRIMARY, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  backBtn: { color: Colors.TEXT, fontSize: 28, lineHeight: 32, width: 32 },
  headerCenter: { flex: 1, alignItems: 'center' },
  comboLabel: { color: Colors.TEXT_SECONDARY, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  abbreviation: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  scroll: { paddingBottom: 16 },

  figuresRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },

  exerciseTitleRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  exerciseTitle: { color: Colors.TEXT, fontWeight: '700', fontSize: 20 },
  targetMuscle: { color: Colors.TEXT_SECONDARY, fontSize: 13 },

  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    backgroundColor: Colors.BACKGROUND,
  },
  scanBtn: {
    flex: 1,
    backgroundColor: Colors.SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 14,
    alignItems: 'center',
  },
  scanBtnText: { color: Colors.TEXT, fontWeight: '600', fontSize: 15 },
  nextBtn: {
    flex: 2,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  nextBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 15 },
  closingMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.BACKGROUND,
    zIndex: 9999,
    elevation: 999,
  },
});
