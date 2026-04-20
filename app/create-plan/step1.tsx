import { useState, useEffect, useRef, Fragment } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  ScrollView, PanResponder, Modal, Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { StepHeader } from '../../components/StepHeader';
import { useCreatePlan, type DayConfig } from '../../lib/create-plan-store';
import {
  HIERARCHY, toggleGroup, getCoveredGroups,
} from '../../lib/muscle-hierarchy';

const PARENT_GROUPS = new Set(Object.keys(HIERARCHY));
const UPPER_ROW = ['Upper', 'Lower', 'Pull', 'Push', 'Anterior', 'Posterior'];
const LOWER_GRID = ['Arms', 'Shoulders', 'Chest', 'Back', 'Core', 'Legs'];

const ITEM_HEIGHT = 48;
const GAP_HEIGHT = 18;
const ITEM_SLOT = ITEM_HEIGHT + GAP_HEIGHT;     // 66px — visual layout
const DETECTION_SLOT = ITEM_SLOT;               // same slot, but detection uses smaller item zone
const DETECTION_ITEM_HEIGHT = 20;               // only middle 20px of item counts as "on item", rest is gap zone

function Stepper({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
          onPress={() => value > min && onChange(value - 1)}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity
          style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
          onPress={() => value < max && onChange(value + 1)}
        >
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

let _uidCounter = 0;

function buildDays(cycleDays: number, trainingDays: number): DayConfig[] {
  return Array.from({ length: cycleDays }, (_, i) => ({
    uid: `day-${++_uidCounter}`,
    day_number: i + 1,
    name: i < trainingDays ? `Day ${i + 1}` : '',
    is_rest_day: i >= trainingDays,
    muscle_groups: [],
    muscle_ids: [],
    exercises: [],
  }));
}

export default function Step1Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setPlanName, setCycleDays, setTrainingDays, setDays } = useCreatePlan();

  const [localName, setLocalName] = useState(state.plan_name);
  const [cycleDays, setCycleDaysLocal] = useState(state.cycle_days);
  const [trainingDays, setTrainingDaysLocal] = useState(state.training_days);
  const [days, setDaysLocal] = useState<DayConfig[]>(() =>
    state.days.length > 0 ? state.days : buildDays(state.cycle_days, state.training_days)
  );
  const [dividerPos, setDividerPos] = useState(trainingDays);

  // Muscle group modal state
  const [modalDayUid, setModalDayUid] = useState<string | null>(null);
  const [modalSelected, setModalSelected] = useState<string[]>([]);

  const openModal = (day: DayConfig) => {
    setModalSelected(day.muscle_groups ?? []);
    setModalDayUid(day.uid);
  };

  const saveCurrentDay = () => {
    Keyboard.dismiss();
    if (!modalDayUid) return;
    const label = modalSelected.length > 0 ? modalSelected.join(' · ') : '';
    setDaysLocal((prev) =>
      prev.map((d) =>
        d.uid === modalDayUid
          ? { ...d, name: label, muscle_groups: modalSelected }
          : d
      )
    );
  };

  const confirmModal = () => {
    saveCurrentDay();
    setModalDayUid(null);
  };

  const confirmAndGoToNext = (nextDay: DayConfig) => {
    saveCurrentDay();
    setModalSelected(nextDay.muscle_groups ?? []);
    setModalDayUid(nextDay.uid);
  };

  const showSupergroupInfo = () => {
    Alert.alert(
      'Supergroups',
      'Supergroups fassen mehrere Muskelgruppen zusammen:\n\n' +
      '◈ Upper — Arms, Shoulders, Chest, Back, Core\n' +
      '◈ Lower — Legs, Glutes, Adductors, Abductors, Calves\n' +
      '◈ Pull — Back, Core\n' +
      '◈ Push — Chest, Glutes\n' +
      '◈ Anterior — Chest, Core, Adductors\n' +
      '◈ Posterior — Back, Glutes, Abductors, Calves\n\n' +
      'Wenn du eine Supergroup wählst, sind alle ihre Untergruppen automatisch abgedeckt. Diese werden daher ausgegraut und können nicht mehr einzeln gewählt werden.',
      [{ text: 'OK' }]
    );
  };

  const renderGroupBtn = (group: string, wide = false) => {
    const isSelected = modalSelected.includes(group);
    const covered = getCoveredGroups(modalSelected);
    const isCovered = covered.includes(group);
    const isParent = PARENT_GROUPS.has(group);
    return (
      <TouchableOpacity
        key={group}
        style={[
          styles.groupBtn,
          wide && styles.groupBtnWide,
          isSelected && styles.groupBtnSelected,
          isCovered && styles.groupBtnCovered,
          isParent && styles.groupBtnParent,
        ]}
        onPress={() => !isCovered && setModalSelected(toggleGroup(group, modalSelected))}
        activeOpacity={0.7}
      >
        {isParent && <Text style={styles.parentDot}>◈</Text>}
        <Text style={[styles.groupBtnText, isSelected && styles.groupBtnTextSelected, isCovered && styles.groupBtnTextCovered]}>
          {group}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  // Drag state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [touchingRestDay, setTouchingRestDay] = useState(false);

  // Refs that are always current (for use inside PanResponder closures)
  const daysRef = useRef(days);
  useEffect(() => { daysRef.current = days; }, [days]);

  const draggingIndexRef = useRef<number | null>(null);
  const dropIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const isTrainingDragRef = useRef(false);
  const touchedIndexRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<View>(null);
  const containerWidthRef = useRef(0);

  const grantDyRef = useRef(0);
  const capturedRestDayIndexRef = useRef(-1);

  const isFirstRender = useRef(true);
  const prevCycleDaysRef = useRef(cycleDays);
  const prevDividerPosRef = useRef(dividerPos);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }

    const prevCycle = prevCycleDaysRef.current;
    const prevDivider = prevDividerPosRef.current;
    prevCycleDaysRef.current = cycleDays;
    prevDividerPosRef.current = dividerPos;

    setDaysLocal((prev) => {
      let days = [...prev];

      // Cycle length changed: add/remove days at the end
      if (cycleDays > prevCycle) {
        for (let i = prevCycle; i < cycleDays; i++) {
          days.push({
            uid: `day-${++_uidCounter}`,
            day_number: i + 1,
            name: '',
            is_rest_day: true,
            muscle_groups: [],
            muscle_ids: [],
            exercises: [],
          });
        }
      } else if (cycleDays < prevCycle) {
        days = days.slice(0, cycleDays);
      }

      // Training days count changed: flip the last training/rest day
      if (dividerPos < prevDivider) {
        // Fewer training days → last training day becomes rest
        for (let n = 0; n < prevDivider - dividerPos; n++) {
          const idx = [...days].map((d, i) => ({ d, i })).reverse().find(({ d }) => !d.is_rest_day)?.i ?? -1;
          if (idx !== -1) days[idx] = { ...days[idx], is_rest_day: true, name: '', muscle_groups: [], muscle_ids: [] };
        }
      } else if (dividerPos > prevDivider) {
        // More training days → last rest day becomes training
        for (let n = 0; n < dividerPos - prevDivider; n++) {
          const idx = [...days].map((d, i) => ({ d, i })).reverse().find(({ d }) => d.is_rest_day)?.i ?? -1;
          if (idx !== -1) days[idx] = { ...days[idx], is_rest_day: false, name: '', muscle_groups: [], muscle_ids: [] };
        }
      }

      return days.map((d, i) => ({ ...d, day_number: i + 1 }));
    });
  }, [cycleDays, dividerPos]);

  const handleChangeCycle = (v: number) => {
    setCycleDaysLocal(v);
    if (dividerPos > v) setDividerPos(v);
  };

  // Returns rest day index if fingerY is within an extended zone around any rest day, else -1
  const findRestDayIndex = (fingerY: number): number => {
    const EXTEND = GAP_HEIGHT; // extend detection by one full gap above and below
    for (let i = 0; i < daysRef.current.length; i++) {
      if (!daysRef.current[i].is_rest_day) continue;
      const top = i * ITEM_SLOT - EXTEND;
      const bottom = i * ITEM_SLOT + ITEM_HEIGHT + EXTEND;
      if (fingerY >= top && fingerY <= bottom) return i;
    }
    return -1;
  };

  // fingerY → which gap/drop position (0..N)
  const yToDropIndex = (fingerY: number): number => {
    const effectiveGap = ITEM_SLOT - DETECTION_ITEM_HEIGHT; // 46px effective gap zone
    const raw = Math.round((fingerY - effectiveGap / 2) / ITEM_SLOT);
    return Math.max(0, Math.min(daysRef.current.length, raw));
  };

  // fingerY → either a gap position or a specific day index
  const yToTarget = (fingerY: number): { type: 'gap'; index: number } | { type: 'day'; index: number } => {
    const n = daysRef.current.length;
    const slot = Math.floor(fingerY / ITEM_SLOT);
    const withinSlot = fingerY - slot * ITEM_SLOT;
    if (withinSlot < GAP_HEIGHT) {
      return { type: 'gap', index: Math.max(0, Math.min(n, slot)) };
    }
    return { type: 'day', index: Math.max(0, Math.min(n - 1, slot)) };
  };

  const applyDrop = (fromIndex: number, toDropIndex: number) => {
    if (toDropIndex === fromIndex || toDropIndex === fromIndex + 1) return;
    const newDays = [...daysRef.current];
    const [removed] = newDays.splice(fromIndex, 1);
    const insertAt = toDropIndex > fromIndex ? toDropIndex - 1 : toDropIndex;
    newDays.splice(Math.max(0, Math.min(newDays.length, insertAt)), 0, removed);
    setDaysLocal(newDays.map((d, i) => ({ ...d, day_number: i + 1 })));
  };

  const swapDays = (i: number, j: number) => {
    const newDays = [...daysRef.current];
    [newDays[i], newDays[j]] = [newDays[j], newDays[i]];
    setDaysLocal(newDays.map((d, idx) => ({ ...d, day_number: idx + 1 })));
  };

  const cleanup = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    isDraggingRef.current = false;
    isTrainingDragRef.current = false;
    draggingIndexRef.current = null;
    dropIndexRef.current = null;
    hoverIndexRef.current = null;
    touchedIndexRef.current = null;
    setDraggingIndex(null);
    setDropIndex(null);
    setHoverIndex(null);
    setIsDragging(false);
    setTouchingRestDay(false);
  };

  // Single PanResponder on the list container
  const containerPanResponder = useRef(
    PanResponder.create({
      // Capture rest day touches immediately; training day touches go through children (onLongPress)
      onStartShouldSetPanResponderCapture: (evt) => {
        capturedRestDayIndexRef.current = findRestDayIndex(evt.nativeEvent.locationY);
        return capturedRestDayIndexRef.current !== -1;
      },

      // After training day long-press fires, steal the touch on the next move event
      onMoveShouldSetPanResponderCapture: () => {
        return isTrainingDragRef.current && !isDraggingRef.current;
      },

      onPanResponderGrant: (_evt, gestureState) => {
        grantDyRef.current = gestureState.dy;
        if (isTrainingDragRef.current) {
          // Training day drag: draggingIndexRef already set by onLongPress
          isDraggingRef.current = true;
          setIsDragging(true);
          return;
        }

        // Rest day drag — index was already found in onStartShouldSetPanResponderCapture
        const idx = capturedRestDayIndexRef.current;
        if (idx === -1) return;
        touchedIndexRef.current = idx;
        setTouchingRestDay(true);
        longPressTimerRef.current = setTimeout(() => {
          const i = touchedIndexRef.current;
          if (i === null) return;
          isDraggingRef.current = true;
          draggingIndexRef.current = i;
          dropIndexRef.current = i + 1;
          setDraggingIndex(i);
          setDropIndex(i + 1);
          setIsDragging(true);
        }, 1);
      },

      onPanResponderMove: (_evt, gestureState) => {
        if (!isDraggingRef.current) {
          if (Math.abs(gestureState.dy) > 8 && longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
          return;
        }
        // fingerY: start from the dragged item's center, add movement since grant
        const itemCenterY = (draggingIndexRef.current ?? 0) * ITEM_SLOT + GAP_HEIGHT + ITEM_HEIGHT / 2;
        const fingerY = itemCenterY + (gestureState.dy - grantDyRef.current);

        if (isTrainingDragRef.current) {
          const target = yToTarget(fingerY);
          if (target.type === 'day' && target.index !== draggingIndexRef.current) {
            hoverIndexRef.current = target.index;
            dropIndexRef.current = null;
            setHoverIndex(target.index);
            setDropIndex(null);
          } else {
            const newDrop = yToDropIndex(fingerY);
            dropIndexRef.current = newDrop;
            hoverIndexRef.current = null;
            setDropIndex(newDrop);
            setHoverIndex(null);
          }
        } else {
          const newDrop = yToDropIndex(fingerY);
          dropIndexRef.current = newDrop;
          setDropIndex(newDrop);
        }
      },

      onPanResponderRelease: () => {
        if (isDraggingRef.current) {
          if (isTrainingDragRef.current) {
            if (hoverIndexRef.current !== null && hoverIndexRef.current !== draggingIndexRef.current) {
              swapDays(draggingIndexRef.current!, hoverIndexRef.current);
            } else if (dropIndexRef.current !== null && draggingIndexRef.current !== null) {
              applyDrop(draggingIndexRef.current, dropIndexRef.current);
            }
          } else if (draggingIndexRef.current !== null && dropIndexRef.current !== null) {
            applyDrop(draggingIndexRef.current, dropIndexRef.current);
          }
        }
        cleanup();
      },

      onPanResponderTerminate: cleanup,
    })
  ).current;

  const handleNext = () => {
    if (!localName.trim()) {
      Alert.alert('Plan name required', 'Please enter a name for your training plan.');
      return;
    }
    setPlanName(localName.trim());
    setCycleDays(cycleDays);
    setTrainingDays(dividerPos);
    // Preserve muscle_ids set by step2 — match by uid (stable across rest-day reordering)
    const ctxMap = new Map(state.days.map((d) => [d.uid, d]));
    const merged = days.map((d) => {
      if (d.is_rest_day) return d;
      const ctx = ctxMap.get(d.uid);
      if (ctx && ctx.muscle_ids.length > 0 &&
          JSON.stringify(ctx.muscle_groups) === JSON.stringify(d.muscle_groups)) {
        return { ...d, muscle_ids: ctx.muscle_ids };
      }
      return d;
    });
    setDays(merged);
    router.push('/create-plan/step2');
  };

  const trainingCount = days.filter((d) => !d.is_rest_day).length;
  const restCount = days.filter((d) => d.is_rest_day).length;

  const isValidDrop = (from: number, to: number) =>
    to !== from && to !== from + 1;

  return (
    <SafeAreaView style={styles.container}>
      <StepHeader currentStep={1} totalSteps={4} title="Plan Setup" onBack={() => router.replace('/(tabs)/')} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isDragging && !touchingRestDay}

        contentContainerStyle={styles.scroll}
      >
        {/* Plan Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Name</Text>
          <TextInput
            style={styles.nameInput}
            value={localName}
            onChangeText={setLocalName}
            placeholder="e.g. Push Pull Legs"
            placeholderTextColor={Colors.TEXT_SECONDARY}
            returnKeyType="done"
            maxLength={60}
          />
        </View>

        {/* Cycle Setup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Setup</Text>
          <Stepper
            label="Cycle Length (days)"
            value={cycleDays}
            min={2}
            max={30}
            onChange={handleChangeCycle}
          />
          <View style={{ height: 8 }} />
          <Stepper
            label="Training Days"
            value={dividerPos}
            min={1}
            max={cycleDays}
            onChange={(v) => { setDividerPos(v); setTrainingDaysLocal(v); }}
          />
        </View>

        {/* Training Days header */}
        <View style={[styles.section, { marginBottom: 4 }]}>
          <Text style={styles.sectionTitle}>Training Days</Text>
          <Text style={styles.sectionSub}>
            {trainingCount} training · {restCount} rest
          </Text>
        </View>

        {/* Day list with drag support */}
        <View
          ref={listRef}
          style={styles.listContainer}
          onLayout={(e) => { containerWidthRef.current = e.nativeEvent.layout.width; }}
          {...containerPanResponder.panHandlers}
        >
          {/* Drop line at position 0 */}
          <View style={styles.gap}>
            {dropIndex === 0 && draggingIndex !== null && isValidDrop(draggingIndex, 0) && (
              <View style={styles.dropLine} />
            )}
          </View>

          {days.map((day, index) => (
            <Fragment key={day.uid}>
              {/* Day row */}
              <View
                style={[
                  styles.dayRow,
                  draggingIndex === index && styles.dayRowDragging,
                ]}
              >
                {/* Badge */}
                <View style={[styles.dayBadge, !day.is_rest_day && day.muscle_groups.length > 0 && styles.dayBadgeActive]}>
                  <Text style={[styles.dayBadgeText, !day.is_rest_day && day.muscle_groups.length > 0 && styles.dayBadgeTextActive]}>D{day.day_number}</Text>
                </View>

                {day.is_rest_day ? (
                  <View style={styles.dividerLine} pointerEvents="none">
                    <View style={[styles.dividerLineInner, hoverIndex === index && styles.dividerLineInnerHover]} />
                    <Text style={[styles.dividerLabel, hoverIndex === index && styles.dividerLabelHover]}>REST DAY</Text>
                    <View style={[styles.dividerLineInner, hoverIndex === index && styles.dividerLineInnerHover]} />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.dayNameInput, hoverIndex === index && styles.dayNameInputHover]}
                    onPress={() => openModal(day)}
                    onLongPress={() => {
                      isTrainingDragRef.current = true;
                      draggingIndexRef.current = index;
                      setDraggingIndex(index);
                      setIsDragging(true);
                    }}
                    delayLongPress={400}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayNameText,
                        !day.muscle_groups.length && styles.dayNamePlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {day.name || `Day ${day.day_number}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Drop line after this item */}
              <View style={styles.gap}>
                {dropIndex === index + 1 && draggingIndex !== null && isValidDrop(draggingIndex, index + 1) && (
                  <View style={styles.dropLine} />
                )}
              </View>
            </Fragment>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next: Muscle Groups →</Text>
        </TouchableOpacity>
      </View>

      {/* Muscle Group Picker Modal */}
      <Modal
        visible={modalDayUid !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setModalDayUid(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Day {days.find((d) => d.uid === modalDayUid)?.day_number}
              </Text>
              <Text style={styles.modalSummary} numberOfLines={1}>
                {modalSelected.join(' · ')}
              </Text>
              {(() => {
                const trainingDays = days.filter((d) => !d.is_rest_day);
                const currentIdx = trainingDays.findIndex((d) => d.uid === modalDayUid);
                const prevDay = trainingDays[currentIdx - 1];
                const nextDay = trainingDays[currentIdx + 1];
                return (
                  <View style={styles.modalNavBtns}>
                    <TouchableOpacity
                      style={[styles.modalNextBtn, !prevDay && styles.modalNextBtnDisabled]}
                      onPress={() => prevDay && confirmAndGoToNext(prevDay)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.modalNextIcon}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalNextBtn, !nextDay && styles.modalNextBtnDisabled]}
                      onPress={() => nextDay && confirmAndGoToNext(nextDay)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.modalNextIcon}>→</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.groupLabelRow}>
                <Text style={styles.groupLabel}>Supergroups</Text>
                <TouchableOpacity onPress={showSupergroupInfo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.infoIcon}>ⓘ</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.wideRow}>
                {UPPER_ROW.map((g) => renderGroupBtn(g, true))}
              </View>

              <Text style={styles.groupLabel}>Individual</Text>
              <View style={styles.grid}>
                {LOWER_GRID.map((g) => renderGroupBtn(g, true))}
              </View>
            </ScrollView>

          </View>

          <View style={[styles.modalFooter, { paddingBottom: Math.max(50, insets.bottom + 16) }]}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalDayUid(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmModal}>
              <Text style={styles.modalConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  scroll: { paddingBottom: 160 },

  section: { marginBottom: 28, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { color: Colors.TEXT, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  sectionSub: { color: Colors.TEXT_SECONDARY, fontSize: 13, marginBottom: 4 },

  nameInput: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    color: Colors.TEXT,
    fontSize: 16,
    padding: 14,
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 14,
  },
  stepperLabel: { color: Colors.TEXT, fontSize: 15 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.SURFACE_2,
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnDisabled: { opacity: 0.3 },
  stepperBtnText: { color: Colors.TEXT, fontSize: 22, lineHeight: 28 },
  stepperValue: {
    color: Colors.TEXT, fontSize: 20, fontWeight: '700',
    minWidth: 32, textAlign: 'center',
  },

  listContainer: {
    paddingHorizontal: 20,
  },

  gap: {
    height: GAP_HEIGHT,
    justifyContent: 'center',
  },
  dropLine: {
    height: 2,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 1,
  },

  dayRow: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayRowDragging: {
    backgroundColor: Colors.SURFACE_2,
    borderRadius: 10,
    opacity: 0.6,
  },

  dayBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1, borderColor: Colors.BORDER,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dayBadgeText: { color: Colors.TEXT_SECONDARY, fontWeight: '700', fontSize: 12 },
  dayBadgeActive: { backgroundColor: Colors.PRIMARY + '20', borderColor: Colors.PRIMARY },
  dayBadgeTextActive: { color: Colors.PRIMARY },

  dayNameInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dayNameInputHover: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  dayNameText: {
    color: Colors.TEXT,
    fontSize: 15,
  },
  dayNamePlaceholder: {
    color: Colors.TEXT_SECONDARY,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 0,
    maxHeight: '75%',
    marginBottom: 110,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalTitle: {
    color: Colors.TEXT,
    fontWeight: '700',
    fontSize: 20,
    flexShrink: 0,
  },
  modalNavBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  modalNextBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNextBtnDisabled: {
    opacity: 0.3,
  },
  modalNextIcon: {
    color: Colors.TEXT,
    fontSize: 18,
  },
  modalSummary: {
    flex: 1,
    color: Colors.PRIMARY,
    fontSize: 13,
  },
  modalScroll: {
    paddingBottom: 8,
  },
  groupLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  groupLabel: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoIcon: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 16,
  },
  wideRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  groupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    minWidth: '30%',
    justifyContent: 'center',
  },
  groupBtnWide: { minWidth: '30%', flex: 1 },
  groupBtnParent: { borderStyle: 'dashed' },
  groupBtnSelected: { backgroundColor: Colors.PRIMARY + '20', borderColor: Colors.PRIMARY },
  groupBtnCovered: { opacity: 0.35, borderStyle: 'solid' },
  parentDot: { color: Colors.PRIMARY_LIGHT, fontSize: 12 },
  groupBtnText: { color: Colors.TEXT, fontWeight: '600', fontSize: 14 },
  groupBtnTextSelected: { color: Colors.PRIMARY },
  groupBtnTextCovered: { color: Colors.TEXT_SECONDARY },
  checkmark: { color: Colors.PRIMARY, fontSize: 14, fontWeight: '700' },
  hint: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  hintText: { color: Colors.TEXT_SECONDARY, fontSize: 12 },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
    backgroundColor: Colors.BACKGROUND,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  modalCancelText: { color: Colors.TEXT_SECONDARY, fontWeight: '700', fontSize: 16 },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
  },
  modalConfirmText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },

  dividerLine: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  dividerLineInner: { flex: 1, height: 1, backgroundColor: Colors.BORDER },
  dividerLineInnerHover: { backgroundColor: Colors.PRIMARY },
  dividerLabel: {
    color: Colors.TEXT_SECONDARY, fontSize: 11, fontWeight: '700', letterSpacing: 1,
  },
  dividerLabelHover: { color: Colors.PRIMARY },

  dragHandle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dragHandleIcon: { color: Colors.TEXT_SECONDARY, fontSize: 20 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16,
    backgroundColor: Colors.BACKGROUND,
    borderTopWidth: 1, borderTopColor: Colors.BORDER,
  },
  nextBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  nextBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },
});
