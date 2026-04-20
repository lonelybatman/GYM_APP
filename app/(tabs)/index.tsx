import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../lib/auth-context';
import { fetchLastWorkout, type LastWorkoutSummary } from '../../lib/queries/set-tracking';

// Static featured exercises for Phase 1
const FEATURED_EXERCISES = [
  { name: 'Bench Press', target: 'Chest', combo: 'Bench · Freeweight' },
  { name: 'Pull-up / Lat Pull', target: 'Back', combo: 'Lat Pull · Cable' },
  { name: 'Cable Curl', target: 'Arms', combo: 'Free · Cable' },
  { name: 'Overhead Press', target: 'Shoulders', combo: 'Free · Freeweight' },
];

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffD >= 1) return diffD === 1 ? 'Yesterday' : `${diffD} days ago`;
  if (diffH >= 1) return `${diffH}h ago`;
  return 'Just now';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [lastWorkout, setLastWorkout] = useState<LastWorkoutSummary | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchLastWorkout(user.id)
      .then(setLastWorkout)
      .finally(() => setLoadingWorkout(false));
  }, [user]);

  const handleContinueWorkout = () => {
    if (!lastWorkout) return;
    router.push(`/day-overview/${lastWorkout.plan_day_id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Home</Text>

        {/* ── Last Workout ─────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>LAST WORKOUT</Text>
        {loadingWorkout ? (
          <View style={styles.card}>
            <ActivityIndicator size="small" color={Colors.PRIMARY} />
          </View>
        ) : lastWorkout ? (
          <TouchableOpacity style={styles.workoutCard} onPress={handleContinueWorkout} activeOpacity={0.8}>
            <View style={styles.workoutCardTop}>
              <View>
                <Text style={styles.workoutDayName}>{lastWorkout.plan_day_name}</Text>
                <Text style={styles.workoutPlanName}>{lastWorkout.plan_name}</Text>
              </View>
              <View style={styles.workoutBadge}>
                <Text style={styles.workoutBadgeText}>
                  {lastWorkout.finished_at ? 'Done' : 'In progress'}
                </Text>
              </View>
            </View>
            <View style={styles.workoutCardBottom}>
              <Text style={styles.workoutTime}>{formatRelativeTime(lastWorkout.started_at)}</Text>
              <Text style={styles.workoutContinue}>
                {lastWorkout.finished_at ? 'View →' : 'Continue →'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No workouts yet</Text>
            <Text style={styles.emptySubtext}>Start a training plan to track your progress</Text>
          </View>
        )}

        {/* ── Featured Exercises ───────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>FEATURED EXERCISES</Text>
        <View style={styles.featuredGrid}>
          {FEATURED_EXERCISES.map((ex) => (
            <View key={ex.name} style={styles.featuredCard}>
              <Text style={styles.featuredName}>{ex.name}</Text>
              <Text style={styles.featuredTarget}>{ex.target}</Text>
              <Text style={styles.featuredCombo}>{ex.combo}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.TEXT, marginBottom: 24 },

  sectionLabel: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },

  card: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  } as any,

  // Workout card
  workoutCard: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 16,
    gap: 12,
  } as any,
  workoutCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  workoutDayName: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },
  workoutPlanName: { color: Colors.TEXT_SECONDARY, fontSize: 13, marginTop: 2 },
  workoutBadge: {
    backgroundColor: Colors.PRIMARY + '22',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  workoutBadgeText: { color: Colors.PRIMARY, fontWeight: '700', fontSize: 12 },
  workoutCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutTime: { color: Colors.TEXT_SECONDARY, fontSize: 13 },
  workoutContinue: { color: Colors.PRIMARY, fontWeight: '700', fontSize: 14 },

  emptyText: { color: Colors.TEXT_SECONDARY, fontSize: 15, fontWeight: '500' },
  emptySubtext: { color: Colors.TEXT_SECONDARY, fontSize: 13, textAlign: 'center' },

  // Featured
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  } as any,
  featuredCard: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 14,
    width: '47%',
    gap: 4,
  } as any,
  featuredName: { color: Colors.TEXT, fontWeight: '700', fontSize: 14 },
  featuredTarget: { color: Colors.PRIMARY, fontSize: 12, fontWeight: '600' },
  featuredCombo: { color: Colors.TEXT_SECONDARY, fontSize: 11 },
});
