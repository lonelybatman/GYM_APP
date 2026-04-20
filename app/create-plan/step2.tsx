import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { StepHeader } from '../../components/StepHeader';
import { useCreatePlan } from '../../lib/create-plan-store';
import { getMuscleGroupsForLogical, getMusclesForGroup, MUSCLE_DATA, type MuscleGroupEntry } from '../../lib/muscle-data';
import { HIERARCHY, toggleGroup, getCoveredGroups, getEffectiveGroups } from '../../lib/muscle-hierarchy';

const PARENT_GROUPS = new Set(Object.keys(HIERARCHY));
const UPPER_ROW = ['Upper', 'Lower', 'Pull', 'Push', 'Anterior', 'Posterior'];
const LOWER_GRID = ['Arms', 'Shoulders', 'Chest', 'Back', 'Core', 'Legs'];
const OVERVIEW_ORDER = ['Chest', 'Back', 'Biceps', 'Triceps', 'Shoulders', 'Forearm', 'Legs', 'Glutes'];

/** All IDs for a group: muscle IDs if they exist, otherwise a group-level ID */
function getAllIds(mg: MuscleGroupEntry): string[] {
  return mg.muscles.length > 0
    ? mg.muscles.map((m) => m.id)
    : [`${mg.group}_group`];
}

export default function Step2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, updateDay } = useCreatePlan();
  const trainingDays = state.days.filter((d) => !d.is_rest_day);

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [detailsVisible, setDetailsVisible] = useState(false);

  // Double-tap picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<string[]>([]);
  const lastTapRef = useRef<{ idx: number; time: number } | null>(null);

  const activeDay = trainingDays[activeDayIdx];
  const muscleGroups = activeDay ? getMuscleGroupsForLogical(activeDay.muscle_groups) : [];

  // On mount: auto-select muscles relevant to each day's logical groups
  useEffect(() => {
    trainingDays.forEach((day) => {
      if (day.muscle_ids.length > 0) return;
      const effective = new Set(getEffectiveGroups(day.muscle_groups));
      const groups = getMuscleGroupsForLogical(day.muscle_groups);
      const ids = groups.flatMap((mg) => {
        const muscles = getMusclesForGroup(mg, effective);
        return muscles.length > 0 ? muscles.map((m) => m.id) : [`${mg.group}_group`];
      });
      if (ids.length > 0) updateDay(day.day_number, { muscle_ids: ids });
    });
  }, []);

  if (!activeDay) return null;

  const selectedIds = new Set(activeDay.muscle_ids);

  const handleSelectDay = (i: number) => {
    const now = Date.now();
    if (lastTapRef.current && lastTapRef.current.idx === i && now - lastTapRef.current.time < 400) {
      // Double-tap: open picker
      lastTapRef.current = null;
      setPickerSelected(trainingDays[i].muscle_groups ?? []);
      setPickerVisible(true);
    } else {
      lastTapRef.current = { idx: i, time: now };
      setActiveDayIdx(i);
      setExpanded(new Set());
    }
  };

  const toggleExpanded = (groupName: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const toggleMuscle = (muscleId: string) => {
    const next = selectedIds.has(muscleId)
      ? activeDay.muscle_ids.filter((id) => id !== muscleId)
      : [...activeDay.muscle_ids, muscleId];
    updateDay(activeDay.day_number, { muscle_ids: next });
  };

  const toggleGroupFn = (mg: MuscleGroupEntry) => {
    const ids = getAllIds(mg);
    const allSelected = ids.every((id) => selectedIds.has(id));
    const next = allSelected
      ? activeDay.muscle_ids.filter((id) => !ids.includes(id))
      : [...new Set([...activeDay.muscle_ids, ...ids])];
    updateDay(activeDay.day_number, { muscle_ids: next });
  };

  const confirmPicker = () => {
    const label = pickerSelected.length > 0 ? pickerSelected.join(' · ') : '';
    const effective = new Set(getEffectiveGroups(pickerSelected));
    const newMuscleGroups = getMuscleGroupsForLogical(pickerSelected);
    const ids = newMuscleGroups.flatMap((mg) => {
      const muscles = getMusclesForGroup(mg, effective);
      return muscles.length > 0 ? muscles.map((m) => m.id) : [`${mg.group}_group`];
    });
    updateDay(activeDay.day_number, {
      muscle_groups: pickerSelected,
      name: label,
      muscle_ids: ids,
    });
    setPickerVisible(false);
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
      'Wenn du eine Supergroup wählst, sind alle ihre Untergruppen automatisch abgedeckt.',
      [{ text: 'OK' }]
    );
  };

  const renderGroupBtn = (group: string) => {
    const isSelected = pickerSelected.includes(group);
    const covered = getCoveredGroups(pickerSelected);
    const isCovered = covered.includes(group);
    const isParent = PARENT_GROUPS.has(group);
    return (
      <TouchableOpacity
        key={group}
        style={[
          styles.groupBtn,
          isSelected && styles.groupBtnSelected,
          isCovered && styles.groupBtnCovered,
          isParent && styles.groupBtnParent,
        ]}
        onPress={() => !isCovered && setPickerSelected(toggleGroup(group, pickerSelected))}
        activeOpacity={0.7}
      >
        {isParent && <Text style={styles.parentDot}>◈</Text>}
        <Text style={[
          styles.groupBtnText,
          isSelected && styles.groupBtnTextSelected,
          isCovered && styles.groupBtnTextCovered,
        ]}>
          {group}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  // Overview: fractional count — sums per-muscle contributions across days
  // e.g. Legs has 2 muscles; a day with only Hamstrings contributes 0.5
  const calcGroupCount = (group: string): number => {
    const mgData = MUSCLE_DATA.find((m) => m.group === group);
    const total = mgData?.muscles.length ?? 0;
    if (total === 0) {
      return trainingDays.filter((d) =>
        d.muscle_ids.some((id) => id.startsWith(`${group}_`))
      ).length;
    }
    return trainingDays.reduce((sum, d) => {
      const trained = mgData!.muscles.filter((m) => d.muscle_ids.includes(m.id)).length;
      return sum + trained / total;
    }, 0);
  };

  const fmtCount = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

  const overviewCounts = OVERVIEW_ORDER.map((group) => ({
    group,
    count: calcGroupCount(group),
  }));

  const handleNextDay = () => {
    setActiveDayIdx((i) => i + 1);
    setExpanded(new Set());
  };

  const handleNext = () => router.push('/create-plan/step3');

  return (
    <SafeAreaView style={styles.container}>
      <StepHeader currentStep={2} totalSteps={4} title="Muscle Groups" />

      {/* Horizontal day tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {trainingDays.map((day, i) => {
          const isActive = i === activeDayIdx;
          return (
            <TouchableOpacity
              key={day.uid}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleSelectDay(i)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                Day {day.day_number}
              </Text>
              {day.muscle_groups.length > 0 && (
                <Text style={[styles.tabSub, isActive && styles.tabSubActive]} numberOfLines={1}>
                  {day.muscle_groups.join(' · ')}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Accordion muscle list */}
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scroll}>
        {muscleGroups.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Keine Muskelgruppen für diesen Tag ausgewählt.</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.emptyLink}>← Zurück zu Plan Setup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          muscleGroups.map((mg) => {
            const isExpanded = expanded.has(mg.group);
            const ids = getAllIds(mg);
            const allSelected = ids.every((id) => selectedIds.has(id));
            const someSelected = !allSelected && ids.some((id) => selectedIds.has(id));
            const hasMuscles = mg.muscles.length > 0;

            return (
              <View key={mg.group} style={styles.groupSection}>
                {/* Group header row */}
                <View style={styles.groupRow}>
                  <TouchableOpacity
                    style={styles.groupLeft}
                    onPress={() => hasMuscles && toggleExpanded(mg.group)}
                    activeOpacity={hasMuscles ? 0.7 : 1}
                  >
                    <View>
                      <Text style={styles.groupName}>{mg.group}</Text>
                      <Text style={styles.groupNameDe}>{mg.group_de}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.groupRight}>
                    {hasMuscles && (
                      <TouchableOpacity
                        onPress={() => toggleExpanded(mg.group)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.caret}>{isExpanded ? '▾' : '▸'}</Text>
                      </TouchableOpacity>
                    )}
                    <Switch
                      value={allSelected}
                      onValueChange={() => toggleGroupFn(mg)}
                      trackColor={{
                        false: someSelected ? Colors.PRIMARY + '44' : Colors.SURFACE_2,
                        true: Colors.PRIMARY + '88',
                      }}
                      thumbColor={allSelected || someSelected ? Colors.PRIMARY : Colors.TEXT_SECONDARY}
                      style={styles.switch}
                    />
                  </View>
                </View>

                {/* Individual muscles */}
                {isExpanded && mg.muscles.map((muscle, idx) => (
                  <View
                    key={muscle.id}
                    style={[
                      styles.muscleRow,
                      idx === mg.muscles.length - 1 && styles.muscleRowLast,
                    ]}
                  >
                    <View style={styles.muscleIndent} />
                    <View style={styles.muscleInfo}>
                      <Text style={styles.muscleName}>{muscle.en}</Text>
                      {muscle.de ? (
                        <Text style={styles.muscleNameDe}>{muscle.de}</Text>
                      ) : null}
                    </View>
                    <Switch
                      value={selectedIds.has(muscle.id)}
                      onValueChange={() => toggleMuscle(muscle.id)}
                      trackColor={{ false: Colors.SURFACE_2, true: Colors.PRIMARY + '88' }}
                      thumbColor={selectedIds.has(muscle.id) ? Colors.PRIMARY : Colors.TEXT_SECONDARY}
                      style={styles.switch}
                    />
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Overview bar */}
      <View style={styles.overviewBar}>
        <TouchableOpacity style={styles.detailsBtn} onPress={() => setDetailsVisible(true)}>
          <Text style={styles.detailsBtnText}>Details</Text>
        </TouchableOpacity>
        <View style={styles.overviewCols}>
          {overviewCounts.map(({ group, count }) => (
            <View key={group} style={styles.overviewCol}>
              <Text style={styles.overviewCount}>{fmtCount(count)}</Text>
              <View style={styles.overviewLabelBox}>
                <Text style={styles.overviewLabel}>{group}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
        {activeDayIdx < trainingDays.length - 1 && (
          <View style={styles.footerTop}>
            <TouchableOpacity style={styles.nextDayBtn} onPress={handleNextDay}>
              <Text style={styles.nextDayBtnText}>Next Day →</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next: Detail Muscles →</Text>
        </TouchableOpacity>
      </View>

      {/* Details Modal */}
      <Modal
        visible={detailsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsSheet}>
            <Text style={styles.detailsTitle}>Muscle Overview</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {OVERVIEW_ORDER.map((group) => {
                const mgData = MUSCLE_DATA.find((m) => m.group === group);
                return (
                  <View key={group} style={styles.detailsGroup}>
                    <View style={styles.detailsGroupHeader}>
                      <Text style={styles.detailsGroupName}>{group}</Text>
                      <Text style={styles.detailsGroupCount}>{fmtCount(calcGroupCount(group))}× / cycle</Text>
                    </View>
                    {mgData?.muscles.map((muscle) => {
                      const cnt = trainingDays.filter((d) =>
                        d.muscle_ids.includes(muscle.id)
                      ).length;
                      return (
                        <View key={muscle.id} style={styles.detailsMuscleRow}>
                          <Text style={styles.detailsMuscleName}>{muscle.en}</Text>
                          <Text style={styles.detailsMuscleCount}>{cnt}×</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          </View>
          <View style={[styles.detailsFooter, { paddingBottom: Math.max(16, insets.bottom) }]}>
            <TouchableOpacity style={styles.detailsCloseBtn} onPress={() => setDetailsVisible(false)}>
              <Text style={styles.detailsCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Picker Modal (double-tap on day tab) */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Day {activeDay.day_number}</Text>
              <Text style={styles.modalSummary} numberOfLines={1}>
                {pickerSelected.join(' · ')}
              </Text>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.groupLabelRow}>
                <Text style={styles.groupLabel}>Supergroups</Text>
                <TouchableOpacity onPress={showSupergroupInfo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.infoIcon}>ⓘ</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.wideRow}>
                {UPPER_ROW.map((g) => renderGroupBtn(g))}
              </View>
              <Text style={styles.groupLabel}>Individual</Text>
              <View style={styles.grid}>
                {LOWER_GRID.map((g) => renderGroupBtn(g))}
              </View>
            </ScrollView>
          </View>
          <View style={[styles.modalFooter, { paddingBottom: Math.max(50, insets.bottom + 16) }]}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmPicker}>
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

  tabsScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    minWidth: 72,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.PRIMARY + '22',
    borderColor: Colors.PRIMARY,
  },
  tabText: { color: Colors.TEXT_SECONDARY, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: Colors.PRIMARY },
  tabSub: { color: Colors.TEXT_SECONDARY, fontSize: 10, marginTop: 2 },
  tabSubActive: { color: Colors.PRIMARY, opacity: 0.8 },

  scrollFlex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 20 },

  emptyBox: { alignItems: 'center', marginTop: 40, gap: 12 },
  emptyText: { color: Colors.TEXT_SECONDARY, textAlign: 'center' },
  emptyLink: { color: Colors.PRIMARY, fontWeight: '600' },

  groupSection: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    marginBottom: 10,
    overflow: 'hidden',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  groupLeft: { flex: 1 },
  groupRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  caret: { color: Colors.TEXT_SECONDARY, fontSize: 20 },
  switch: { transform: [{ scale: 1.2 }] },
  groupName: { color: Colors.TEXT, fontWeight: '700', fontSize: 15 },
  groupNameDe: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 1 },

  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER + '66',
  },
  muscleRowLast: {},
  muscleIndent: { width: 20 },
  muscleInfo: { flex: 1 },
  muscleName: { color: Colors.TEXT, fontSize: 14, fontWeight: '500' },
  muscleNameDe: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 1 },

  // Overview bar
  overviewBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    backgroundColor: Colors.BACKGROUND,
    paddingTop: 6,
    paddingBottom: 6,
  },
  detailsBtn: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    borderRightWidth: 1,
    borderRightColor: Colors.BORDER,
  },
  detailsBtnText: {
    color: Colors.PRIMARY,
    fontSize: 11,
    fontWeight: '700',
  },
  overviewCols: {
    flex: 1,
    flexDirection: 'row',
  },
  overviewCol: {
    flex: 1,
    alignItems: 'center',
  },
  overviewCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  overviewLabelBox: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  overviewLabel: {
    fontSize: 9,
    color: Colors.TEXT_SECONDARY,
    transform: [{ rotate: '-45deg' }],
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  footerTop: {
    alignItems: 'flex-end',
  },
  nextDayBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  nextDayBtnText: {
    color: Colors.PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  nextBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  nextBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },

  // Details modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  detailsSheet: {
    backgroundColor: Colors.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 0,
    maxHeight: '75%',
  },
  detailsTitle: {
    color: Colors.TEXT,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
  },
  detailsGroup: {
    marginBottom: 16,
  },
  detailsGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    paddingBottom: 4,
  },
  detailsGroupName: {
    color: Colors.TEXT,
    fontWeight: '700',
    fontSize: 14,
  },
  detailsGroupCount: {
    color: Colors.PRIMARY,
    fontWeight: '700',
    fontSize: 13,
  },
  detailsMuscleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  detailsMuscleName: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 13,
  },
  detailsMuscleCount: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  detailsFooter: {
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  detailsCloseBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    marginBottom: 4,
  },
  detailsCloseBtnText: {
    color: Colors.TEXT_SECONDARY,
    fontWeight: '700',
    fontSize: 16,
  },

  // Picker modal (shared styles with step1)
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
  modalSummary: {
    flex: 1,
    color: Colors.PRIMARY,
    fontSize: 13,
  },
  modalScroll: { paddingBottom: 8 },
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
  infoIcon: { color: Colors.TEXT_SECONDARY, fontSize: 16 },
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
    flex: 1,
    justifyContent: 'center',
  },
  groupBtnParent: { borderStyle: 'dashed' },
  groupBtnSelected: { backgroundColor: Colors.PRIMARY + '20', borderColor: Colors.PRIMARY },
  groupBtnCovered: { opacity: 0.35, borderStyle: 'solid' },
  parentDot: { color: Colors.PRIMARY_LIGHT, fontSize: 12 },
  groupBtnText: { color: Colors.TEXT, fontWeight: '600', fontSize: 14 },
  groupBtnTextSelected: { color: Colors.PRIMARY },
  groupBtnTextCovered: { color: Colors.TEXT_SECONDARY },
  checkmark: { color: Colors.PRIMARY, fontSize: 14, fontWeight: '700' },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
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
});
