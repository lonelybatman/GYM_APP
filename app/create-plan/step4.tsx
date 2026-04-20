import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { StepHeader } from '../../components/StepHeader';
import { DayTabSelector } from '../../components/DayTabSelector';
import { useCreatePlan } from '../../lib/create-plan-store';
import { fetchAllExercisesForPicker, type ExerciseWithCombo } from '../../lib/queries/exercises';
import { fetchMuscleGroups } from '../../lib/queries/muscles';
import { getEffectiveGroups } from '../../lib/muscle-hierarchy';
import { savePlan } from '../../lib/queries/training-plans';
import { useAuth } from '../../lib/auth-context';
import type { MuscleGroup } from '../../types';

const PLACE_LABELS: Record<string, string> = {
  bench: 'Bench',
  free: 'Free',
  lat_pull: 'Lat Pull',
  lat_row: 'Lat Row',
  machine: 'Machine',
};

const WEIGHT_LABELS: Record<string, string> = {
  cable: 'Cable',
  freeweight: 'FW',
  smith: 'Smith',
  machine: 'Machine',
};

const PLACE_FILTERS = ['All', 'bench', 'free', 'lat_pull', 'lat_row', 'machine'];

export default function Step4Screen() {
  const router = useRouter();
  const { state, reset } = useCreatePlan();
  const { user } = useAuth();
  const trainingDays = state.days.filter((d) => !d.is_rest_day);

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [allExercises, setAllExercises] = useState<ExerciseWithCombo[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [placeFilter, setPlaceFilter] = useState('All');
  const [saving, setSaving] = useState(false);

  const activeDay = trainingDays[activeDayIdx];

  useEffect(() => {
    Promise.all([fetchAllExercisesForPicker(), fetchMuscleGroups()])
      .then(([exs, mgs]) => { setAllExercises(exs); setMuscleGroups(mgs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter exercises relevant to the day's muscle groups
  const dayExercises = useMemo(() => {
    if (!activeDay) return allExercises;
    const effectiveGroups = getEffectiveGroups(activeDay.muscle_groups);
    if (effectiveGroups.length === 0) return allExercises;

    // Build set of relevant muscle_group IDs from DB
    // Map logical groups → DB muscle group IDs via muscle flags (done in queries)
    // For now: show exercises whose target_muscle_id matches any DB group
    // that has muscles in the effective logical groups
    return allExercises;
  }, [allExercises, activeDay?.muscle_groups]);

  const filtered = useMemo(() => {
    let result = dayExercises;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.combo.label.toLowerCase().includes(q)
      );
    }
    if (placeFilter !== 'All') {
      result = result.filter((e) => e.combo.place === placeFilter);
    }
    return result;
  }, [dayExercises, search, placeFilter]);

  const handleSave = () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to save a plan.');
      return;
    }
    Alert.alert(
      'Save Plan',
      `Save "${state.plan_name}" with ${state.training_days} training days?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            setSaving(true);
            try {
              await savePlan(user.id, state);
              reset();
              Alert.alert('Success!', 'Your training plan has been saved.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/plans') },
              ]);
            } catch (e: any) {
              Alert.alert('Save failed', e.message ?? 'Unknown error');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (!activeDay) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StepHeader currentStep={4} totalSteps={4} title="Add Exercises" />

      <DayTabSelector
        days={state.days}
        activeDayIndex={activeDayIdx}
        onSelect={setActiveDayIdx}
      />

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises..."
          placeholderTextColor={Colors.TEXT_SECONDARY}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Place filter chips */}
      <View style={styles.filterRow}>
        {PLACE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, placeFilter === f && styles.filterChipActive]}
            onPress={() => setPlaceFilter(f)}
          >
            <Text style={[styles.filterChipText, placeFilter === f && styles.filterChipTextActive]}>
              {f === 'All' ? 'All' : PLACE_LABELS[f] ?? f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.PRIMARY} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {allExercises.length === 0
                ? 'No exercises loaded. Check DB permissions.'
                : 'No exercises match your filter.'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseRow}
              onPress={() => router.push(`/exercise-builder/${item.id}`)}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseCombo}>
                  {item.combo.place.replace('_', ' ')} · {WEIGHT_LABELS[item.combo.weight_type] ?? item.combo.weight_type}
                </Text>
              </View>
              <View style={styles.addBtn}>
                <Text style={styles.addBtnText}>+</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving…' : '✓ Save Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },

  searchRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  searchInput: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    color: Colors.TEXT,
    fontSize: 15,
    padding: 12,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flexWrap: 'nowrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  filterChipActive: {
    backgroundColor: Colors.PRIMARY + '22',
    borderColor: Colors.PRIMARY,
  },
  filterChipText: { color: Colors.TEXT_SECONDARY, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: Colors.PRIMARY },

  list: { paddingHorizontal: 16, paddingBottom: 120 },

  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: Colors.TEXT, fontWeight: '600', fontSize: 15 },
  exerciseCombo: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.PRIMARY + '22',
    borderWidth: 1, borderColor: Colors.PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: Colors.PRIMARY, fontSize: 20, lineHeight: 24, fontWeight: '700' },
  separator: { height: 1, backgroundColor: Colors.BORDER + '66' },

  emptyText: {
    color: Colors.TEXT_SECONDARY, textAlign: 'center', marginTop: 32, fontSize: 14,
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16,
    backgroundColor: Colors.BACKGROUND,
    borderTopWidth: 1, borderTopColor: Colors.BORDER,
  },
  saveBtn: {
    backgroundColor: Colors.PRIMARY, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },
});
