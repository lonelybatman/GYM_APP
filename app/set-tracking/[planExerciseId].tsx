import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { NumPad } from '../../components/set-tracking/NumPad';
import { SetRow } from '../../components/set-tracking/SetRow';
import { ExtraWeightPanel } from '../../components/set-tracking/ExtraWeightPanel';
import { useAuth } from '../../lib/auth-context';
import {
  fetchSetLogs,
  fetchPreviousSetLogs,
  upsertSetLog,
  deleteSetLog,
  updateDefaultSets,
  type SetLogEntry,
} from '../../lib/queries/set-tracking';
import { getExtraWeights } from '../../lib/local-storage';

// ── Types ────────────────────────────────────────────────────────────────────

type SetData = {
  uid: string;
  set_type: string;
  parent_set_type: string | null;
  hand: 'L' | 'R' | null;
  kg: string;
  reps: string;
  prev_kg: number | null;
  prev_reps: number | null;
  db_id: string | null;
  isConfirmed: boolean;
  isExtra: boolean;
};

type ActiveCell = { rowIndex: number; field: 'kg' | 'reps' } | null;

// ── generateSetList ───────────────────────────────────────────────────────────

let _uidCounter = 0;
function nextUid(): string {
  return String(_uidCounter++);
}

function generateSetList(params: {
  defaultSets: number;
  isOneHanded: boolean;
  warmupCount: number;
  hasDropSet: boolean;
  hasBackoff: boolean;
  prevLogs: SetLogEntry[];
}): SetData[] {
  const { defaultSets, isOneHanded, warmupCount, hasDropSet, hasBackoff, prevLogs } = params;
  const result: SetData[] = [];

  function findPrev(
    set_type: string,
    hand: 'L' | 'R' | null,
    parent_set_type: string | null,
  ): SetLogEntry | undefined {
    return prevLogs.find(
      (s) =>
        s.set_type === set_type &&
        s.hand === hand &&
        s.parent_set_type === parent_set_type,
    );
  }

  // 1. Warmup rows
  for (let n = 1; n <= warmupCount; n++) {
    const wType = `W${n}`;
    const prev = findPrev(wType, null, null);
    result.push({
      uid: nextUid(),
      set_type: wType,
      parent_set_type: null,
      hand: null,
      kg: prev?.kg != null ? String(prev.kg) : '',
      reps: prev?.reps != null ? String(prev.reps) : '',
      prev_kg: prev?.kg ?? null,
      prev_reps: prev?.reps ?? null,
      db_id: null,
      isConfirmed: false,
      isExtra: false,
    });
  }

  // 2. Normal sets
  const count = Math.max(defaultSets, 1);
  for (let i = 1; i <= count; i++) {
    if (isOneHanded) {
      const prevL = findPrev(`${i}L`, 'L', null);
      result.push({
        uid: nextUid(),
        set_type: `${i}L`,
        parent_set_type: null,
        hand: 'L',
        kg: prevL?.kg != null ? String(prevL.kg) : '',
        reps: prevL?.reps != null ? String(prevL.reps) : '',
        prev_kg: prevL?.kg ?? null,
        prev_reps: prevL?.reps ?? null,
        db_id: null,
        isConfirmed: false,
        isExtra: false,
      });
      const prevR = findPrev(`${i}R`, 'R', null);
      result.push({
        uid: nextUid(),
        set_type: `${i}R`,
        parent_set_type: null,
        hand: 'R',
        kg: prevR?.kg != null ? String(prevR.kg) : '',
        reps: prevR?.reps != null ? String(prevR.reps) : '',
        prev_kg: prevR?.kg ?? null,
        prev_reps: prevR?.reps ?? null,
        db_id: null,
        isConfirmed: false,
        isExtra: false,
      });
    } else {
      const prev = findPrev(String(i), null, null);
      result.push({
        uid: nextUid(),
        set_type: String(i),
        parent_set_type: null,
        hand: null,
        kg: prev?.kg != null ? String(prev.kg) : '',
        reps: prev?.reps != null ? String(prev.reps) : '',
        prev_kg: prev?.kg ?? null,
        prev_reps: prev?.reps ?? null,
        db_id: null,
        isConfirmed: false,
        isExtra: false,
      });
    }

    // Drop set after each normal set
    if (hasDropSet) {
      const prevD = findPrev('D', null, String(i));
      result.push({
        uid: nextUid(),
        set_type: 'D',
        parent_set_type: String(i),
        hand: null,
        kg: prevD?.kg != null ? String(prevD.kg) : '',
        reps: prevD?.reps != null ? String(prevD.reps) : '',
        prev_kg: prevD?.kg ?? null,
        prev_reps: prevD?.reps ?? null,
        db_id: null,
        isConfirmed: false,
        isExtra: false,
      });
    }
  }

  // 3. Backoff at end
  if (hasBackoff) {
    const prevB = findPrev('B', null, null);
    result.push({
      uid: nextUid(),
      set_type: 'B',
      parent_set_type: null,
      hand: null,
      kg: prevB?.kg != null ? String(prevB.kg) : '',
      reps: prevB?.reps != null ? String(prevB.reps) : '',
      prev_kg: prevB?.kg ?? null,
      prev_reps: prevB?.reps ?? null,
      db_id: null,
      isConfirmed: false,
      isExtra: false,
    });
  }

  return result;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function SetTrackingScreen() {
  const { planExerciseId, sessionId, exerciseIndex, totalExercises, allIds } =
    useLocalSearchParams<{
      planExerciseId: string;
      sessionId: string;
      exerciseIndex: string;
      totalExercises: string;
      allIds: string;
    }>();

  const router = useRouter();
  const { user } = useAuth();

  const [exerciseName, setExerciseName] = useState('...');
  const [sets, setSets] = useState<SetData[]>([]);
  const [activeCell, setActiveCell] = useState<ActiveCell>(null);
  const [loading, setLoading] = useState(true);
  const [isOneHanded, setIsOneHanded] = useState(false);

  const [extraWeight, setExtraWeight] = useState(0);
  const [extraIncrement, setExtraIncrement] = useState(1.25);
  const [availableIncrements, setAvailableIncrements] = useState<number[]>([1.25, 2.5, 5]);

  const exIndex = parseInt(exerciseIndex ?? '0', 10);
  const totalEx = parseInt(totalExercises ?? '1', 10);
  const idList = allIds ? allIds.split(',') : [];

  // Keep a ref to sets so async callbacks always see latest value
  const setsRef = useRef<SetData[]>([]);
  useEffect(() => {
    setsRef.current = sets;
  }, [sets]);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!planExerciseId || !sessionId || !user) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Fetch plan exercise directly
        const { supabase } = await import('../../lib/supabase') as { supabase: any };
        const { data: planExData, error: planExError } = await supabase
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
          .eq('id', planExerciseId)
          .single();

        if (planExError || !planExData) {
          setLoading(false);
          return;
        }

        const planEx = planExData as any;
        setExerciseName(planEx.exercise?.exercise_name ?? '');

        // Detect one-handed via custom_config
        const oneHanded = (planEx.custom_config?.hands ?? 0) === 1;
        setIsOneHanded(oneHanded);

        const defaultSetsCount: number = planEx.default_sets ?? 3;

        // Fetch previous session logs
        const prevLogs = await fetchPreviousSetLogs(user.id, planExerciseId, sessionId);

        // Detect features from previous session
        const warmupCount = prevLogs.filter((l: SetLogEntry) => l.set_type.startsWith('W')).length;
        const hasDropSet = prevLogs.some((l: SetLogEntry) => l.set_type === 'D');
        const hasBackoff = prevLogs.some((l: SetLogEntry) => l.set_type === 'B');

        // Generate set list
        const generated = generateSetList({
          defaultSets: defaultSetsCount,
          isOneHanded: oneHanded,
          warmupCount,
          hasDropSet,
          hasBackoff,
          prevLogs,
        });

        // Fetch current session logs and merge
        const currentLogs = await fetchSetLogs(sessionId, planExerciseId);
        for (const row of generated) {
          const match = currentLogs.find(
            (l) =>
              l.set_type === row.set_type &&
              l.parent_set_type === row.parent_set_type &&
              l.hand === row.hand,
          );
          if (match) {
            row.kg = match.kg != null ? String(match.kg) : '';
            row.reps = match.reps != null ? String(match.reps) : '';
            row.db_id = match.id;
            row.isConfirmed = true;
          }
        }

        setSets(generated);

        // Auto-focus first unconfirmed row's kg cell
        const firstUnconfirmed = generated.findIndex((s) => !s.isConfirmed);
        if (firstUnconfirmed !== -1) {
          setActiveCell({ rowIndex: firstUnconfirmed, field: 'kg' });
        }

        // Load extra weights
        const storedWeights = await getExtraWeights();
        const increments =
          storedWeights.available_kg.length > 0
            ? storedWeights.available_kg
            : [1.25, 2.5, 5];
        setAvailableIncrements(increments);
        setExtraIncrement(increments[0]);
      } catch (e) {
        console.error('SetTracking load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [planExerciseId, sessionId, user]);

  // ── saveRow ────────────────────────────────────────────────────────────────
  const saveRow = useCallback(
    async (rowIndex: number) => {
      if (!sessionId || !planExerciseId) return;

      const row = setsRef.current[rowIndex];
      if (!row) return;

      const kg = row.kg ? parseFloat(row.kg) : null;
      const reps = row.reps ? parseInt(row.reps, 10) : null;

      try {
        const saved = await upsertSetLog({
          id: row.db_id ?? undefined,
          session_id: sessionId,
          plan_exercise_id: planExerciseId,
          set_type: row.set_type,
          parent_set_type: row.parent_set_type,
          hand: row.hand,
          kg,
          reps,
          extra_weight: extraWeight,
          logged_at: new Date().toISOString(),
        });

        setSets((prev) => {
          const next = [...prev];
          next[rowIndex] = {
            ...next[rowIndex],
            db_id: saved.id,
            isConfirmed: true,
          };
          return next;
        });
      } catch (e) {
        console.error('Save set error:', e);
      }
    },
    [sessionId, planExerciseId, extraWeight],
  );

  // ── handleNext ─────────────────────────────────────────────────────────────
  const handleNext = useCallback(
    async (rowIndex: number, field: 'kg' | 'reps') => {
      if (field === 'kg') {
        setActiveCell({ rowIndex, field: 'reps' });
        return;
      }

      // field === 'reps' → save and possibly prompt
      await saveRow(rowIndex);

      const row = setsRef.current[rowIndex];
      if (row?.isExtra && planExerciseId) {
        // Count total non-warmup, non-D, non-B sets
        const currentSets = setsRef.current;
        const normalCount = isOneHanded
          ? new Set(
              currentSets
                .filter(
                  (s) =>
                    !s.set_type.startsWith('W') &&
                    s.set_type !== 'D' &&
                    s.set_type !== 'B',
                )
                .map((s) => s.set_type.replace(/[LR]$/, '')),
            ).size
          : currentSets.filter(
              (s) =>
                !s.set_type.startsWith('W') &&
                s.set_type !== 'D' &&
                s.set_type !== 'B',
            ).length;

        Alert.alert(
          'Update Plan?',
          `Update default sets to ${normalCount}?`,
          [
            {
              text: 'Yes',
              onPress: () => {
                updateDefaultSets(planExerciseId, normalCount).catch((e) =>
                  console.error('updateDefaultSets error:', e),
                );
              },
            },
            { text: 'No', style: 'cancel' },
          ],
        );
      }

      const next = rowIndex + 1;
      if (next < setsRef.current.length) {
        setActiveCell({ rowIndex: next, field: 'kg' });
      } else {
        setActiveCell(null);
      }
    },
    [saveRow, planExerciseId, isOneHanded],
  );

  // ── handleKey ──────────────────────────────────────────────────────────────
  const handleKey = useCallback(
    (key: string) => {
      if (!activeCell) return;
      const { rowIndex, field } = activeCell;

      if (key === 'next') {
        handleNext(rowIndex, field);
        return;
      }

      setSets((prev) => {
        const next = [...prev];
        const row = { ...next[rowIndex] };

        if (key === 'del') {
          row[field] = row[field].slice(0, -1);
        } else if (key === '.') {
          if (field === 'kg' && !row[field].includes('.')) {
            row[field] = row[field] + '.';
          }
        } else {
          row[field] = row[field] + key;
        }

        next[rowIndex] = row;
        return next;
      });
    },
    [activeCell, handleNext],
  );

  // ── handleDeleteSet ────────────────────────────────────────────────────────
  const handleDeleteSet = useCallback(
    async (index: number) => {
      const row = setsRef.current[index];
      if (!row) return;

      if (row.db_id) {
        try {
          await deleteSetLog(row.db_id);
        } catch (e) {
          console.error('deleteSetLog error:', e);
        }
      }

      setSets((prev) => prev.filter((_, i) => i !== index));

      setActiveCell((prev) => {
        if (!prev) return null;
        if (prev.rowIndex === index) return null;
        if (prev.rowIndex > index) return { rowIndex: prev.rowIndex - 1, field: prev.field };
        return prev;
      });
    },
    [],
  );

  // ── handleAddSet ───────────────────────────────────────────────────────────
  const handleAddSet = useCallback(() => {
    const current = setsRef.current;

    let nextNum: number;
    if (isOneHanded) {
      const nums = new Set(
        current
          .filter(
            (s) =>
              !s.set_type.startsWith('W') &&
              s.set_type !== 'D' &&
              s.set_type !== 'B',
          )
          .map((s) => s.set_type.replace(/[LR]$/, '')),
      );
      nextNum = nums.size + 1;
    } else {
      const normalSets = current.filter(
        (s) =>
          !s.set_type.startsWith('W') &&
          s.set_type !== 'D' &&
          s.set_type !== 'B',
      );
      nextNum = normalSets.length + 1;
    }

    // Find insertion point: before any 'B' set at end
    const bIndex = current.findLastIndex((s) => s.set_type === 'B');
    const insertAt = bIndex !== -1 ? bIndex : current.length;

    const newSets: SetData[] = [];
    if (isOneHanded) {
      newSets.push({
        uid: nextUid(),
        set_type: `${nextNum}L`,
        parent_set_type: null,
        hand: 'L',
        kg: '',
        reps: '',
        prev_kg: null,
        prev_reps: null,
        db_id: null,
        isConfirmed: false,
        isExtra: true,
      });
      newSets.push({
        uid: nextUid(),
        set_type: `${nextNum}R`,
        parent_set_type: null,
        hand: 'R',
        kg: '',
        reps: '',
        prev_kg: null,
        prev_reps: null,
        db_id: null,
        isConfirmed: false,
        isExtra: true,
      });
    } else {
      newSets.push({
        uid: nextUid(),
        set_type: String(nextNum),
        parent_set_type: null,
        hand: null,
        kg: '',
        reps: '',
        prev_kg: null,
        prev_reps: null,
        db_id: null,
        isConfirmed: false,
        isExtra: true,
      });
    }

    setSets((prev) => {
      const updated = [...prev];
      updated.splice(insertAt, 0, ...newSets);
      return updated;
    });

    setActiveCell({ rowIndex: insertAt, field: 'kg' });
  }, [isOneHanded]);

  // ── Extra weight handlers ──────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    setExtraWeight((w) => Math.round((w + extraIncrement) * 100) / 100);
  }, [extraIncrement]);

  const handleSubtract = useCallback(() => {
    setExtraWeight((w) => Math.max(0, Math.round((w - extraIncrement) * 100) / 100));
  }, [extraIncrement]);

  const handleReset = useCallback(() => {
    setExtraWeight(0);
  }, []);

  const handleIncrementUp = useCallback(() => {
    setExtraIncrement((cur) => {
      const idx = availableIncrements.indexOf(cur);
      const next = (idx + 1) % availableIncrements.length;
      return availableIncrements[next];
    });
  }, [availableIncrements]);

  const handleIncrementDown = useCallback(() => {
    setExtraIncrement((cur) => {
      const idx = availableIncrements.indexOf(cur);
      const prev = (idx - 1 + availableIncrements.length) % availableIncrements.length;
      return availableIncrements[prev];
    });
  }, [availableIncrements]);

  // ── Navigate to exercise ───────────────────────────────────────────────────
  function navigateTo(targetId: string, targetIndex: number) {
    router.replace({
      pathname: '/set-tracking/[planExerciseId]',
      params: {
        planExerciseId: targetId,
        sessionId: sessionId ?? '',
        exerciseIndex: String(targetIndex),
        totalExercises: String(totalEx),
        allIds: allIds ?? '',
      },
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!sessionId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>No session ID provided.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          disabled={exIndex <= 0}
          style={[styles.arrowBtn, exIndex <= 0 && styles.arrowBtnDisabled]}
          onPress={() => {
            if (exIndex <= 0) return;
            const prevId = idList[exIndex - 1];
            if (prevId) navigateTo(prevId, exIndex - 1);
            else router.back();
          }}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {exerciseName}
          </Text>
          {totalEx > 1 && (
            <Text style={styles.exerciseIndex}>
              {exIndex + 1} / {totalEx}
            </Text>
          )}
          <TouchableOpacity
            style={styles.progressBtn}
            onPress={() => {
              router.push({
                pathname: '/progress/[planExerciseId]',
                params: { planExerciseId, exerciseName: exerciseName },
              });
            }}
          >
            <Text style={styles.progressBtnText}>📊</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={exIndex >= totalEx - 1}
          style={[styles.arrowBtn, exIndex >= totalEx - 1 && styles.arrowBtnDisabled]}
          onPress={() => {
            const nextId = idList[exIndex + 1];
            if (nextId) navigateTo(nextId, exIndex + 1);
          }}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Column headers ───────────────────────────────────────────────── */}
      <View style={styles.colHeader}>
        <Text style={[styles.colHeaderText, { width: 52 }]}>SET</Text>
        <Text style={[styles.colHeaderText, { flex: 1.2 }]}>PREV</Text>
        <Text style={[styles.colHeaderText, { flex: 1 }]}>KG</Text>
        <Text style={[styles.colHeaderText, { flex: 1 }]}>REPS</Text>
      </View>

      {/* ── Sets list ────────────────────────────────────────────────────── */}
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="always">
        {sets.map((row, i) => (
          <SetRow
            key={row.uid}
            setType={row.set_type}
            prevKg={row.prev_kg}
            prevReps={row.prev_reps}
            kg={row.kg}
            reps={row.reps}
            isConfirmed={row.isConfirmed}
            isRowActive={activeCell?.rowIndex === i}
            isActiveKg={activeCell?.rowIndex === i && activeCell.field === 'kg'}
            isActiveReps={activeCell?.rowIndex === i && activeCell.field === 'reps'}
            onPressKg={() => setActiveCell({ rowIndex: i, field: 'kg' })}
            onPressReps={() => setActiveCell({ rowIndex: i, field: 'reps' })}
            onDelete={() => handleDeleteSet(i)}
          />
        ))}

        <TouchableOpacity style={styles.addSetBtn} onPress={handleAddSet}>
          <Text style={styles.addSetText}>+ Add Set</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Extra Weight Panel ───────────────────────────────────────────── */}
      <ExtraWeightPanel
        extraWeight={extraWeight}
        increment={extraIncrement}
        availableIncrements={availableIncrements}
        onAdd={handleAdd}
        onSubtract={handleSubtract}
        onReset={handleReset}
        onIncrementUp={handleIncrementUp}
        onIncrementDown={handleIncrementDown}
      />

      {/* ── NumPad ───────────────────────────────────────────────────────── */}
      <NumPad
        onKey={handleKey}
        showDecimal={activeCell?.field === 'kg'}
        nextLabel="→"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: Colors.TEXT_SECONDARY, fontSize: 16 },
  backLink: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  arrowBtn: { width: 36, alignItems: 'center' },
  arrowBtnDisabled: { opacity: 0.25 },
  arrowText: { color: Colors.TEXT, fontSize: 28, fontWeight: '300' },
  headerCenter: { flex: 1, alignItems: 'center' },
  exerciseName: { color: Colors.TEXT, fontSize: 18, fontWeight: '700' },
  exerciseIndex: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  progressBtn: { marginTop: 4, padding: 2 },
  progressBtnText: { fontSize: 16 },

  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  colHeaderText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginHorizontal: 4,
  },

  scroll: { flex: 1 },

  addSetBtn: {
    margin: 12,
    padding: 14,
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
  },
  addSetText: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 15 },
});
