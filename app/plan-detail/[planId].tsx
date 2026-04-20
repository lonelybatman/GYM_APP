import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { fetchPlanWithDays, type PlanWithDays, type PlanDayWithMuscles } from '../../lib/queries/training-plans';

export default function PlanDetailScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();

  const [plan, setPlan] = useState<PlanWithDays | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    fetchPlanWithDays(planId)
      .then(setPlan)
      .catch((e) => setError(e.message ?? 'Failed to load plan'))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.PRIMARY} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (error || !plan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.errorText}>{error ?? 'Plan not found.'}</Text>
      </SafeAreaView>
    );
  }

  const renderDay = ({ item }: { item: PlanDayWithMuscles }) => {
    const isRest = item.is_rest_day;
    return (
      <TouchableOpacity
        style={[styles.dayCard, isRest && styles.dayCardRest]}
        onPress={
          isRest
            ? undefined
            : () =>
                router.push({
                  pathname: '/day-overview/[planDayId]',
                  params: { planDayId: item.id, dayName: item.name },
                })
        }
        activeOpacity={isRest ? 1 : 0.7}
      >
        <View style={styles.dayRow}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>{item.day_number}</Text>
          </View>
          <View style={styles.dayInfo}>
            <Text style={[styles.dayName, isRest && styles.dayNameRest]}>
              {item.name}
            </Text>
            {isRest ? (
              <Text style={styles.restLabel}>Rest Day</Text>
            ) : (
              <Text style={styles.muscleNames} numberOfLines={2}>
                {item.muscle_group_names.length > 0
                  ? item.muscle_group_names.join(', ')
                  : 'No muscle groups set'}
              </Text>
            )}
          </View>
          {!isRest && (
            <Text style={styles.chevron}>›</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planMeta}>
          {plan.cycle_days}-day cycle · {plan.training_days} training days
        </Text>
      </View>

      <FlatList
        data={plan.days}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        renderItem={renderDay}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No days configured for this plan.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { color: Colors.PRIMARY, fontSize: 17, fontWeight: '600' },

  titleRow: { paddingHorizontal: 20, paddingBottom: 16 },
  planName: { color: Colors.TEXT, fontSize: 26, fontWeight: '700' },
  planMeta: { color: Colors.TEXT_SECONDARY, fontSize: 13, marginTop: 4 },

  list: { paddingHorizontal: 16, paddingBottom: 32 },

  dayCard: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 14,
  },
  dayCardRest: {
    opacity: 0.55,
  },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.PRIMARY + '22',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: { color: Colors.PRIMARY, fontWeight: '700', fontSize: 14 },
  dayInfo: { flex: 1 },
  dayName: { color: Colors.TEXT, fontWeight: '600', fontSize: 15 },
  dayNameRest: { color: Colors.TEXT_SECONDARY },
  restLabel: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  muscleNames: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  chevron: { color: Colors.TEXT_SECONDARY, fontSize: 22 },

  errorText: { color: Colors.ERROR, textAlign: 'center', margin: 32 },
  emptyText: { color: Colors.TEXT_SECONDARY, textAlign: 'center', marginTop: 32 },
});
