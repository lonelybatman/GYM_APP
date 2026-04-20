import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../lib/auth-context';
import {
  fetchDayExercisesForOverview,
  getOrCreateSession,
  type DayExerciseOverview,
} from '../../lib/queries/set-tracking';
import { buildInitialState } from '../../lib/exercise-builder/config-utils';
import { generateAbbreviation } from '../../lib/exercise-builder/abbreviation';
import { getComboType } from '../../lib/exercise-builder/types';
import type { RawConfig } from '../../lib/exercise-builder/types';

export default function DayOverviewScreen() {
  const { planDayId, dayName } = useLocalSearchParams<{
    planDayId: string;
    dayName: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [exercises, setExercises] = useState<DayExerciseOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planDayId) return;
    fetchDayExercisesForOverview(planDayId)
      .then(setExercises)
      .catch((e) => setError(e.message ?? 'Failed to load exercises'))
      .finally(() => setLoading(false));
  }, [planDayId]);

  // Pre-compute abbreviations for each exercise
  const abbreviations = useMemo(() => {
    return exercises.map((ex) => {
      const combo = getComboType(ex.combo_place, ex.combo_weight_type);
      const state = buildInitialState(ex.equipment_option_id, ex.config as RawConfig, combo);
      return generateAbbreviation(combo, ex.exercise_name, ex.target_muscle_name, ex.attachment_name, state);
    });
  }, [exercises]);

  const handleStart = async () => {
    if (!user || !planDayId) {
      Alert.alert('Error', 'You must be signed in to start a workout.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('No exercises', 'Add exercises to this day before starting.');
      return;
    }
    setStarting(true);
    try {
      const sessionId = await getOrCreateSession(user.id, planDayId);
      const allIds = exercises.map((e) => e.id).join(',');
      const firstId = exercises[0].id;

      router.push({
        pathname: '/set-tracking/[planExerciseId]',
        params: {
          planExerciseId: firstId,
          sessionId,
          exerciseIndex: '0',
          totalExercises: String(exercises.length),
          allIds,
        },
      });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not start workout.');
    } finally {
      setStarting(false);
    }
  };

  const renderExercise = ({ item, index }: { item: DayExerciseOverview; index: number }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => {
        // Navigate to exercise builder for this exercise (view/edit config)
        // For now just show what's there — future: open in view mode
      }}
      activeOpacity={0.8}
    >
      <View style={styles.exerciseRow}>
        <View style={styles.exerciseIndexBadge}>
          <Text style={styles.exerciseIndexText}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.abbreviation}>{abbreviations[index] || '—'}</Text>
          <Text style={styles.setsLabel}>
            {item.default_sets} {item.default_sets === 1 ? 'set' : 'sets'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.dayTitle}>{dayName ?? 'Day Overview'}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.PRIMARY} style={{ marginTop: 48 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderExercise}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises added to this day yet.</Text>
              <Text style={styles.emptySubtext}>
                Go back and add exercises in the Training Plan flow.
              </Text>
            </View>
          }
        />
      )}

      {/* Footer */}
      {!loading && !error && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.scanBtn} onPress={() => Alert.alert('Scan', 'Coming in Phase 1')}>
            <Text style={styles.scanBtnText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startBtn, (starting || exercises.length === 0) && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={starting || exercises.length === 0}
          >
            {starting ? (
              <ActivityIndicator color={Colors.TEXT} size="small" />
            ) : (
              <Text style={styles.startBtnText}>Start Workout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  backBtn: { width: 60 },
  backText: { color: Colors.PRIMARY, fontSize: 17, fontWeight: '600' },
  dayTitle: { color: Colors.TEXT, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },

  list: { padding: 16, paddingBottom: 120 },

  exerciseCard: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 14,
  },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseIndexBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.PRIMARY + '22',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: { color: Colors.PRIMARY, fontWeight: '700', fontSize: 13 },
  exerciseInfo: { flex: 1 },
  abbreviation: { color: Colors.TEXT, fontSize: 15, fontWeight: '600' },
  setsLabel: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 3 },

  emptyContainer: { alignItems: 'center', marginTop: 48, paddingHorizontal: 32 },
  emptyText: { color: Colors.TEXT_SECONDARY, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { color: Colors.TEXT_SECONDARY, fontSize: 13, marginTop: 8, textAlign: 'center' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: Colors.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  scanBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    width: 90,
  },
  scanBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 15 },
  startBtn: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },

  errorText: { color: Colors.ERROR, textAlign: 'center', margin: 32 },
});
