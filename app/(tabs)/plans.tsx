import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../lib/auth-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { PlanCard } from '../../components/PlanCard';
import { fetchTrainingPlans, deleteTrainingPlan } from '../../lib/queries/training-plans';
import type { TrainingPlan } from '../../types';

export default function PlansScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await fetchTrainingPlans(user.id);
      setPlans(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans, user]);

  const handleEdit = (plan: TrainingPlan) => {
    Alert.alert('Edit Plan', `Edit "${plan.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrainingPlan(plan.id);
            setPlans((prev) => prev.filter((p) => p.id !== plan.id));
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handlePressNew = () => {
    router.push('/new');
  };

  const handlePressImport = () => {
    router.push('/scan/plan-import');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Plans</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.importButton} onPress={handlePressImport}>
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handlePressNew}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadPlans}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && plans.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No training plans yet</Text>
          <Text style={styles.emptySubtext}>Tap "+ New" to create your first plan</Text>
          <TouchableOpacity style={styles.createButton} onPress={handlePressNew}>
            <Text style={styles.createButtonText}>Create Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PlanCard
              plan={item}
              muscleGroupTags={[]}
              onEdit={() => handleEdit(item)}
              onPress={() => router.push(`/plan-detail/${item.id}`)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.TEXT,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  } as any,
  importButton: {
    backgroundColor: Colors.SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  importButtonText: {
    color: Colors.PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.TEXT,
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.TEXT,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: Colors.TEXT,
    fontWeight: '700',
    fontSize: 16,
  },
  errorBox: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.SURFACE,
    borderRadius: 8,
    borderColor: Colors.ERROR,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: Colors.ERROR,
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
});
