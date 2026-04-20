import { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Modal, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { StepHeader } from '../../components/StepHeader';
import { DayTabSelector } from '../../components/DayTabSelector';
import { useCreatePlan, type PlanExercise } from '../../lib/create-plan-store';
import { fetchAllExercisesForPicker, type ExerciseWithCombo } from '../../lib/queries/exercises';
import { fetchMuscleGroups } from '../../lib/queries/muscles';
import { getMuscleGroupsForLogical } from '../../lib/muscle-data';
import type { MuscleGroup } from '../../types';

// Maps MUSCLE_DATA group names → DB muscles.name_en
// Old DB used 'Shoulder' (singular) — new DB uses 'Shoulders' (no mapping needed).
// 'Glutes' (MUSCLE_DATA) → 'Glute' (new DB) mapping stays.
const MUSCLE_DB_NAME: Record<string, string> = {
  Glutes: 'Glute',
};
const toDbName = (name: string) => MUSCLE_DB_NAME[name] ?? name;


const PLACE_OPTIONS = [
  { key: 'bench', label: 'Bench' },
  { key: 'free', label: 'Free' },
  { key: 'lat_pull', label: 'Lat Pull' },
  { key: 'lat_row', label: 'Lat Row' },
  { key: 'machine', label: 'Machine' },
];

const WEIGHT_OPTIONS = [
  { key: 'cable', label: 'Cable' },
  { key: 'freeweight', label: 'Freeweight' },
  { key: 'smith', label: 'Smith' },
  { key: 'machine', label: 'Machine' },
];

const LAT_PULL_PLACE_KEY = 'lat_pull';
const LAT_ROW_PLACE_KEY = 'lat_row';

/** 1 vs 2 cables for Lat Pull / Lat Row combo labels (Lat Pull2, Lat Row 2, …). */
const getCableCountKey = (exercise: ExerciseWithCombo): '1' | '2' | null => {
  const place = exercise.combo.place;
  if (place !== LAT_PULL_PLACE_KEY && place !== LAT_ROW_PLACE_KEY) return null;
  const n = exercise.combo.label.toLowerCase().replace(/\s+/g, ' ').trim();
  if (place === LAT_PULL_PLACE_KEY) return n.includes('pull2') ? '2' : '1';
  return n.includes('row 2') || n.includes('row2') ? '2' : '1';
};

const placeNeedsCableVariant = (placeKey: string) =>
  placeKey === LAT_PULL_PLACE_KEY || placeKey === LAT_ROW_PLACE_KEY;

export default function Step3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    returnToAdd?: string;
    dayNumber?: string;
    selectedGroup?: string;
    selectedPlace?: string;
    selectedWeightTypes?: string;
    selectedCableCount?: string;
    superdefaultOnly?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { state, updateDay } = useCreatePlan();
  const trainingDays = state.days.filter((d) => !d.is_rest_day);

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [allExercises, setAllExercises] = useState<ExerciseWithCombo[]>([]);
  const [allMuscleGroups, setAllMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Modal filter state
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [selectedWeightTypes, setSelectedWeightTypes] = useState<Set<string>>(new Set());
  const [selectedCableCount, setSelectedCableCount] = useState<'1' | '2' | null>(null);
  const [superdefaultOnly, setSuperdefaultOnly] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<'place' | 'weight' | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [dropdownGestureLocked, setDropdownGestureLocked] = useState(false);
  const lastAppliedReturnKeyRef = useRef<string | null>(null);

  const activeDay = trainingDays[activeDayIdx];

  const returnKey = useMemo(
    () =>
      [
        params.returnToAdd ?? '',
        params.dayNumber ?? '',
        params.selectedGroup ?? '',
        params.selectedPlace ?? '',
        params.selectedWeightTypes ?? '',
        params.selectedCableCount ?? '',
        params.superdefaultOnly ?? '',
      ].join('|'),
    [
      params.returnToAdd,
      params.dayNumber,
      params.selectedGroup,
      params.selectedPlace,
      params.selectedWeightTypes,
      params.selectedCableCount,
      params.superdefaultOnly,
    ],
  );

  useEffect(() => {
    if (params.returnToAdd !== '1') return;
    if (trainingDays.length === 0) return;
    if (lastAppliedReturnKeyRef.current === returnKey) return;
    lastAppliedReturnKeyRef.current = returnKey;

    const requestedDay = Number(params.dayNumber);
    if (!Number.isNaN(requestedDay)) {
      const nextIdx = trainingDays.findIndex((d) => d.day_number === requestedDay);
      if (nextIdx >= 0) setActiveDayIdx(nextIdx);
    }

    setSelectedGroup(params.selectedGroup ?? null);

    const placeKey = params.selectedPlace;
    setSelectedPlaces(placeKey ? new Set([placeKey]) : new Set());

    const weightTypes = (params.selectedWeightTypes ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    setSelectedWeightTypes(new Set(weightTypes));

    const cable = params.selectedCableCount;
    setSelectedCableCount(cable === '1' || cable === '2' ? cable : null);

    setSuperdefaultOnly(params.superdefaultOnly !== '0');
    setModalVisible(true);
  }, [params, trainingDays, returnKey]);

  useEffect(() => {
    Promise.all([fetchAllExercisesForPicker(), fetchMuscleGroups()])
      .then(([exs, mgs]) => { setAllExercises(exs); setAllMuscleGroups(mgs); })
      .catch((err) => {
        console.error('fetchAllExercisesForPicker error:', err);
        alert('DB Fehler: ' + (err?.message ?? JSON.stringify(err)));
      })
      .finally(() => setLoading(false));
  }, []);

  // Muscle group entries for this day (Individual-style from MUSCLE_DATA)
  const dayMuscleEntries = useMemo(
    () => getMuscleGroupsForLogical(activeDay?.muscle_groups ?? []),
    [activeDay?.muscle_groups]
  );

  // Exercises relevant to this day based on its muscle groups.
  // When superdefaultOnly is active, skip the day filter — show all superdefaults from DB.
  const dayExercises = useMemo(() => {
    if (superdefaultOnly) return allExercises;
    if (allMuscleGroups.length === 0 || dayMuscleEntries.length === 0) return allExercises;
    const relevantGroupNames = new Set(dayMuscleEntries.map((e) => toDbName(e.group)));
    const relevantGroupIds = allMuscleGroups
      .filter((mg) => relevantGroupNames.has(mg.name_en))
      .map((mg) => mg.id);
    if (relevantGroupIds.length === 0) return allExercises;
    return allExercises.filter((ex) => relevantGroupIds.includes(ex.target_muscle_id));
  }, [allExercises, allMuscleGroups, dayMuscleEntries, superdefaultOnly]);

  // Base exercises filtered by superdefault + muscle group (without place/weight filters)
  const baseModalExercises = useMemo(() => {
    let result = dayExercises;
    if (superdefaultOnly) result = result.filter((ex) => ex.is_superdefault);
    if (selectedGroup !== null) {
      const dbName = toDbName(selectedGroup);
      const mg = allMuscleGroups.find((m) => m.name_en === dbName);
      if (mg?.id) result = result.filter((ex) => ex.target_muscle_id === mg.id);
    }
    return result;
  }, [dayExercises, allMuscleGroups, selectedGroup, superdefaultOnly]);

  // Available places = places that exist when weight type filter is applied
  const availablePlaces = useMemo(() => {
    let result = baseModalExercises;
    if (selectedWeightTypes.size > 0)
      result = result.filter((ex) => selectedWeightTypes.has(ex.combo.weight_type));
    return new Set(result.map((ex) => ex.combo.place));
  }, [baseModalExercises, selectedWeightTypes]);

  // Available weight types = weight types that exist when place filter is applied
  const availableWeightTypes = useMemo(() => {
    let result = baseModalExercises;
    if (selectedPlaces.size > 0)
      result = result.filter((ex) => selectedPlaces.has(ex.combo.place));
    return new Set(result.map((ex) => ex.combo.weight_type));
  }, [baseModalExercises, selectedPlaces]);

  const availableCableCounts = useMemo(() => {
    let result = baseModalExercises;
    if (selectedPlaces.size > 0)
      result = result.filter((ex) => selectedPlaces.has(ex.combo.place));
    if (selectedWeightTypes.size > 0)
      result = result.filter((ex) => selectedWeightTypes.has(ex.combo.weight_type));

    const counts = new Set<'1' | '2'>();
    result.forEach((ex) => {
      const count = getCableCountKey(ex);
      if (count) counts.add(count);
    });
    return counts;
  }, [baseModalExercises, selectedPlaces, selectedWeightTypes]);

  useEffect(() => {
    const needsCable =
      selectedPlaces.has(LAT_PULL_PLACE_KEY) || selectedPlaces.has(LAT_ROW_PLACE_KEY);
    if (!needsCable) {
      if (selectedCableCount !== null) setSelectedCableCount(null);
      return;
    }
    if (selectedCableCount !== null && availableCableCounts.has(selectedCableCount)) return;
    if (availableCableCounts.has('1')) {
      setSelectedCableCount('1');
      return;
    }
    if (availableCableCounts.has('2')) {
      setSelectedCableCount('2');
      return;
    }
    if (selectedCableCount !== null) setSelectedCableCount(null);
  }, [selectedPlaces, selectedCableCount, availableCableCounts]);

  // Filtered exercises in modal
  const modalExercises = useMemo(() => {
    let result = dayExercises;
    if (superdefaultOnly) {
      result = result.filter((ex) => ex.is_superdefault);
    }
    if (selectedGroup !== null) {
      const dbName = toDbName(selectedGroup);
      const mg = allMuscleGroups.find((m) => m.name_en === dbName);
      if (mg?.id) result = result.filter((ex) => ex.target_muscle_id === mg.id);
    }
    if (selectedPlaces.size > 0) {
      result = result.filter((ex) => selectedPlaces.has(ex.combo.place));
    }
    if (selectedWeightTypes.size > 0) {
      result = result.filter((ex) => selectedWeightTypes.has(ex.combo.weight_type));
    }
    const selPlace = selectedPlaces.size === 1 ? Array.from(selectedPlaces)[0] : undefined;
    if (selPlace && placeNeedsCableVariant(selPlace) && selectedCableCount) {
      result = result.filter((ex) => getCableCountKey(ex) === selectedCableCount);
    }
    return result;
  }, [dayExercises, allMuscleGroups, selectedGroup, selectedPlaces, selectedWeightTypes, selectedCableCount, superdefaultOnly]);

  const activePlaceKey =
    selectedPlaces.size === 1 ? Array.from(selectedPlaces)[0] : undefined;
  const activeWeightTypeKey =
    selectedWeightTypes.size === 1 ? Array.from(selectedWeightTypes)[0] : undefined;
  const anyDropdownOpen = activeDropdown !== null;

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setDropdownAnchor(null);
    setDropdownGestureLocked(false);
  };

  if (!activeDay) return null;

  const exercises: PlanExercise[] = activeDay.exercises ?? [];
  const addedIds = new Set(exercises.map((e) => e.exercise_id));

  const addExercise = (ex: ExerciseWithCombo) => {
    if (addedIds.has(ex.id)) return;
    updateDay(activeDay.day_number, {
      exercises: [...exercises, {
        exercise_id: ex.id,
        exercise_combo_id: ex.exercise_combo_id,
        name: ex.name,
        combo_label: ex.combo.label,
      }],
    });
  };

  const removeExercise = (exerciseId: string) => {
    updateDay(activeDay.day_number, {
      exercises: exercises.filter((e) => e.exercise_id !== exerciseId),
    });
  };

  const openModal = () => {
    setSelectedGroup(null);
    setSelectedPlaces(new Set());
    setSelectedWeightTypes(new Set());
    setSelectedCableCount(null);
    setSuperdefaultOnly(true);
    closeDropdowns();
    setModalVisible(true);
  };

  const toggleSet = (
    set: Set<string>,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    key: string,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const openDropdownAt = (
    kind: 'place' | 'weight',
    e: any,
  ) => {
    const { pageX, pageY, locationY } = e.nativeEvent;
    const triggerHeight = 42;
    const triggerWidth = 160;
    const x = Math.max(16, pageX - 12);
    const y = Math.max(0, pageY - locationY);
    setDropdownAnchor({ x, y, w: triggerWidth, h: triggerHeight });
    setActiveDropdown((prev) => (prev === kind ? null : kind));
    setDropdownGestureLocked(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepHeader currentStep={3} totalSteps={4} title="Exercises" />

      <DayTabSelector
        days={state.days}
        activeDayIndex={activeDayIdx}
        onSelect={setActiveDayIdx}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dayTitle}>
          {activeDay.name || `Day ${activeDay.day_number}`}
        </Text>

        {/* Exercise list */}
        {exercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercises added yet.</Text>
        ) : (
          exercises.map((ex) => (
            <View key={ex.exercise_id} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseCombo}>{ex.combo_label}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeExercise(ex.exercise_id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Add button */}
        <TouchableOpacity style={styles.addBtn} onPress={openModal}>
          <Text style={styles.addBtnText}>+</Text>
          <Text style={styles.addBtnLabel}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/create-plan/step4')}>
          <Text style={styles.nextBtnText}>Next: Add Exercises →</Text>
        </TouchableOpacity>
      </View>

      {/* Add Exercise Overlay (in-screen, avoids native Modal one-frame flash) */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Superdefault / All toggle */}
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modeBtn, superdefaultOnly && styles.modeBtnActive]}
                onPress={() => setSuperdefaultOnly(true)}
              >
                <Text style={[styles.modeBtnText, superdefaultOnly && styles.modeBtnTextActive]}>
                  Superdefault
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, !superdefaultOnly && styles.modeBtnActive]}
                onPress={() => setSuperdefaultOnly(false)}
              >
                <Text style={[styles.modeBtnText, !superdefaultOnly && styles.modeBtnTextActive]}>
                  All Exercises
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={modalExercises}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={!dropdownGestureLocked}
              onScrollBeginDrag={() => {
                if (anyDropdownOpen && !dropdownGestureLocked) closeDropdowns();
              }}
              ListHeaderComponent={
                <View>
                  {/* Muscle group buttons (Individual style) */}
                  {dayMuscleEntries.length > 0 && (
                    <View style={styles.muscleGrid}>
                      {dayMuscleEntries.map((entry) => {
                        const isActive = selectedGroup === entry.group;
                        return (
                          <TouchableOpacity
                            key={entry.group}
                            style={[styles.muscleBtn, isActive && styles.muscleBtnActive]}
                            onPress={() => setSelectedGroup(isActive ? null : entry.group)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.muscleBtnText, isActive && styles.muscleBtnTextActive]}>
                              {entry.group}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Place + Weight Type side by side (tap dropdowns) */}
                  <View style={styles.filterColumns}>
                    {/* Left: Place */}
                    <View style={styles.filterCol}>
                      <Text style={styles.sectionLabel}>PLACE</Text>
                      <TouchableOpacity
                        style={styles.dropdownTrigger}
                        onPress={(e) => openDropdownAt('place', e)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.dropdownTriggerText}>
                          {PLACE_OPTIONS.find((o) => o.key === activePlaceKey)?.label ?? 'Choose Place'}
                        </Text>
                        <Text style={styles.dropdownChevron}>{activeDropdown === 'place' ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Vertical divider */}
                    <View style={styles.verticalDivider} />

                    {/* Right: Weight Type */}
                    <View style={styles.filterCol}>
                      <Text style={styles.sectionLabel}>WEIGHT TYPE</Text>
                      <TouchableOpacity
                        style={styles.dropdownTrigger}
                        onPress={(e) => openDropdownAt('weight', e)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.dropdownTriggerText}>
                          {WEIGHT_OPTIONS.find((o) => o.key === activeWeightTypeKey)?.label ?? 'Choose Weight Type'}
                        </Text>
                        <Text style={styles.dropdownChevron}>{activeDropdown === 'weight' ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Cable count: Lat Pull vs Lat Pull2, Lat Row vs Lat Row 2 */}
                  {activePlaceKey &&
                    placeNeedsCableVariant(activePlaceKey) &&
                    availableCableCounts.size > 1 && (
                    <View style={styles.cableRow}>
                      <Text style={styles.sectionLabel}>CABLES</Text>
                      <View style={styles.modeToggleRow}>
                        <TouchableOpacity
                          style={[styles.modeBtn, selectedCableCount === '1' && styles.modeBtnActive]}
                          onPress={() => setSelectedCableCount('1')}
                        >
                          <Text style={[styles.modeBtnText, selectedCableCount === '1' && styles.modeBtnTextActive]}>
                            1 Cable
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modeBtn, selectedCableCount === '2' && styles.modeBtnActive]}
                          onPress={() => setSelectedCableCount('2')}
                        >
                          <Text style={[styles.modeBtnText, selectedCableCount === '2' && styles.modeBtnTextActive]}>
                            2 Cables
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={styles.divider} />

                  {loading && (
                    <ActivityIndicator color={Colors.PRIMARY} style={{ marginVertical: 16 }} />
                  )}
                </View>
              }
              ListEmptyComponent={
                !loading ? (
                  <Text style={styles.emptyText}>No exercises match the filters.</Text>
                ) : null
              }
              renderItem={({ item }) => {
                const isAdded = addedIds.has(item.id);
                const muscleName = selectedGroup === null
                  ? allMuscleGroups.find(mg => mg.id === item.target_muscle_id)?.name_en ?? ''
                  : null;
                return (
                  <TouchableOpacity
                    style={styles.modalExRow}
                    onPress={() => {
                      const selectedPlace =
                        selectedPlaces.size === 1 ? Array.from(selectedPlaces)[0] : '';
                      const selectedWeightTypesCsv = Array.from(selectedWeightTypes).join(',');
                      const qp = new URLSearchParams({
                        dayNumber: String(activeDay.day_number),
                        returnToAdd: '1',
                        superdefaultOnly: superdefaultOnly ? '1' : '0',
                      });
                      if (selectedGroup) qp.set('selectedGroup', selectedGroup);
                      if (selectedPlace) qp.set('selectedPlace', selectedPlace);
                      if (selectedWeightTypesCsv) qp.set('selectedWeightTypes', selectedWeightTypesCsv);
                      if (selectedCableCount) qp.set('selectedCableCount', selectedCableCount);
                      router.push(`/exercise-builder/${item.id}?${qp.toString()}`);
                    }}
                    activeOpacity={0.7}
                  >
                    {muscleName ? (
                      <Text style={styles.muscleTag}>{muscleName}</Text>
                    ) : null}
                    <View style={styles.modalExerciseInfo}>
                      <Text style={[styles.exerciseName, isAdded && styles.exerciseNameAdded, { flex: 1 }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.exerciseCombo} numberOfLines={1}>
                        {item.combo.place.replace(/_/g, ' ')} · {item.combo.weight_type}
                      </Text>
                    </View>
                    <View style={[styles.exAddBtn, isAdded && styles.exAddBtnDone]}>
                      <Text style={[styles.exAddBtnText, isAdded && styles.exAddBtnTextDone]}>
                        {isAdded ? '✓' : '+'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      )}
      <Modal
        visible={anyDropdownOpen && !!dropdownAnchor}
        transparent
        animationType="none"
        onRequestClose={closeDropdowns}
      >
        <TouchableOpacity activeOpacity={1} style={styles.dropdownBackdrop} onPress={closeDropdowns}>
          {dropdownAnchor && activeDropdown && (
            <View
              style={[
                styles.dropdownMenuModal,
                {
                  top: dropdownAnchor.y + dropdownAnchor.h + 4,
                  left: activeDropdown === 'place' ? 16 : undefined,
                  right: activeDropdown === 'weight' ? 16 : undefined,
                },
              ]}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={() => setDropdownGestureLocked(true)}
              onResponderRelease={() => setDropdownGestureLocked(false)}
              onResponderTerminate={() => setDropdownGestureLocked(false)}
            >
              {(activeDropdown === 'place' ? PLACE_OPTIONS : WEIGHT_OPTIONS).map((opt) => {
                const disabled =
                  activeDropdown === 'place'
                    ? !availablePlaces.has(opt.key)
                    : !availableWeightTypes.has(opt.key);
                const active =
                  activeDropdown === 'place'
                    ? selectedPlaces.has(opt.key)
                    : selectedWeightTypes.has(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.dropdownItem,
                      active && styles.dropdownItemActive,
                      disabled && styles.dropdownItemDisabled,
                    ]}
                    onPress={() => {
                      if (disabled) return;
                      if (activeDropdown === 'place') setSelectedPlaces(new Set([opt.key]));
                      else setSelectedWeightTypes(new Set([opt.key]));
                      closeDropdowns();
                    }}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        active && styles.dropdownItemTextActive,
                        disabled && styles.dropdownItemTextDisabled,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  scroll: { padding: 16, paddingBottom: 120 },

  dayTitle: {
    color: Colors.TEXT, fontWeight: '700', fontSize: 20, marginBottom: 16,
  },

  emptyText: {
    color: Colors.TEXT_SECONDARY, textAlign: 'center', marginTop: 16, fontSize: 14,
  },

  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: Colors.TEXT, fontWeight: '600', fontSize: 15 },
  exerciseCombo: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.SURFACE_2,
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { color: Colors.TEXT_SECONDARY, fontSize: 20, lineHeight: 26 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.PRIMARY,
    borderStyle: 'dashed',
  },
  addBtnText: { color: Colors.PRIMARY, fontSize: 22, fontWeight: '700', lineHeight: 26 },
  addBtnLabel: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 15 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16,
    backgroundColor: Colors.BACKGROUND,
    borderTopWidth: 1, borderTopColor: Colors.BORDER,
  },
  nextBtn: {
    backgroundColor: Colors.PRIMARY, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  nextBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },

  // Superdefault / All mode toggle
  modeToggleRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    overflow: 'hidden',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: Colors.PRIMARY,
  },
  modeBtnText: {
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
    fontSize: 14,
  },
  modeBtnTextActive: {
    color: Colors.TEXT,
  },
  cableRow: {
    marginTop: 10,
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 2000,
    elevation: 2000,
  },
  modalSheet: {
    backgroundColor: Colors.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    overflow: 'visible',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  modalTitle: { color: Colors.TEXT, fontWeight: '700', fontSize: 18 },
  modalClose: { color: Colors.TEXT_SECONDARY, fontSize: 18 },

  modalList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    overflow: 'visible',
    zIndex: 1,
  },

  // Muscle group buttons (Individual style like step1)
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 16,
  },
  muscleBtn: {
    width: '31%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleBtnActive: {
    backgroundColor: Colors.PRIMARY + '20',
    borderColor: Colors.PRIMARY,
  },
  muscleBtnText: { color: Colors.TEXT, fontWeight: '600', fontSize: 14 },
  muscleBtnTextActive: { color: Colors.PRIMARY },

  // Section label
  sectionLabel: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 8,
  },

  // Two-column filter layout
  filterColumns: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: 4,
    zIndex: 200,
    elevation: 30,
    position: 'relative',
  },
  filterCol: {
    flex: 1,
    position: 'relative',
    zIndex: 220,
    elevation: 35,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: Colors.BORDER,
    marginHorizontal: 12,
  },

  dropdownTrigger: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 10,
    backgroundColor: Colors.SURFACE,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    color: Colors.TEXT,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  dropdownChevron: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    marginLeft: 8,
  },
  dropdownMenu: {
    position: 'absolute', // legacy style kept for compatibility
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    opacity: 1,
    zIndex: 9999,
    elevation: 100,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenuModal: {
    position: 'absolute',
    width: '44%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    zIndex: 99999,
    elevation: 999,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    backgroundColor: '#2A2A2A',
  },
  dropdownItemActive: {
    backgroundColor: Colors.PRIMARY + '22',
  },
  dropdownItemDisabled: {
    opacity: 0.35,
  },
  dropdownItemText: {
    color: Colors.TEXT,
    fontSize: 14,
  },
  dropdownItemTextActive: {
    color: Colors.PRIMARY,
    fontWeight: '700',
  },
  dropdownItemTextDisabled: {
    color: Colors.TEXT_SECONDARY,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 16,
  },

  // Modal exercise rows
  modalExRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    position: 'relative',
    zIndex: 0,
    elevation: 0,
  },
  muscleTag: {
    color: Colors.PRIMARY,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: Colors.PRIMARY + '20',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  modalExerciseInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseNameAdded: { color: Colors.TEXT_SECONDARY },
  exAddBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.PRIMARY + '22',
    borderWidth: 1, borderColor: Colors.PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  exAddBtnDone: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  exAddBtnText: { color: Colors.PRIMARY, fontSize: 20, lineHeight: 24, fontWeight: '700' },
  exAddBtnTextDone: { color: Colors.TEXT },
  separator: { height: 1, backgroundColor: Colors.BORDER + '66' },
});
