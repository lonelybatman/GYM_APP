import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import ProgressChart, { type ChartMode } from '../../components/ProgressChart';
import {
  fetchProgressHistory,
  type ProgressPoint,
} from '../../lib/queries/set-tracking';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatValue(value: number, mode: ChartMode): string {
  if (mode === 'volume') {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k kg`;
    return `${Math.round(value)} kg`;
  }
  if (mode === '1rm') return `${Math.round(value)} kg`;
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} kg`;
}

function getTrend(data: ProgressPoint[], mode: ChartMode, hand: 'L' | 'R' | null): 'up' | 'down' | 'flat' {
  if (data.length < 2) return 'flat';
  const getVal = (p: ProgressPoint): number => {
    if (hand === 'L') return { best: p.left_best ?? 0, avg: p.left_avg ?? 0, volume: p.left_volume ?? 0, '1rm': p.left_one_rm ?? 0 }[mode];
    if (hand === 'R') return { best: p.right_best ?? 0, avg: p.right_avg ?? 0, volume: p.right_volume ?? 0, '1rm': p.right_one_rm ?? 0 }[mode];
    return { best: p.best_weight, avg: p.avg_weight, volume: p.volume, '1rm': p.one_rm }[mode];
  };
  const first = getVal(data[0]);
  const last = getVal(data[data.length - 1]);
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'flat';
}

function getLatestValue(data: ProgressPoint[], mode: ChartMode, hand: 'L' | 'R' | null): number {
  if (data.length === 0) return 0;
  const p = data[data.length - 1];
  if (hand === 'L') return { best: p.left_best ?? 0, avg: p.left_avg ?? 0, volume: p.left_volume ?? 0, '1rm': p.left_one_rm ?? 0 }[mode];
  if (hand === 'R') return { best: p.right_best ?? 0, avg: p.right_avg ?? 0, volume: p.right_volume ?? 0, '1rm': p.right_one_rm ?? 0 }[mode];
  return { best: p.best_weight, avg: p.avg_weight, volume: p.volume, '1rm': p.one_rm }[mode];
}

function getBestValue(data: ProgressPoint[], mode: ChartMode, hand: 'L' | 'R' | null): number {
  if (data.length === 0) return 0;
  const getVal = (p: ProgressPoint): number => {
    if (hand === 'L') return { best: p.left_best ?? 0, avg: p.left_avg ?? 0, volume: p.left_volume ?? 0, '1rm': p.left_one_rm ?? 0 }[mode];
    if (hand === 'R') return { best: p.right_best ?? 0, avg: p.right_avg ?? 0, volume: p.right_volume ?? 0, '1rm': p.right_one_rm ?? 0 }[mode];
    return { best: p.best_weight, avg: p.avg_weight, volume: p.volume, '1rm': p.one_rm }[mode];
  };
  return Math.max(...data.map(getVal));
}

const MODE_LABELS: Record<ChartMode, string> = {
  best: 'Best',
  avg: 'Avg',
  volume: 'Volume',
  '1rm': '1RM',
};

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label, value, trend,
}: {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'flat';
}) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value}>{value}</Text>
      {trend && trend !== 'flat' && (
        <Text style={[statStyles.trend, trend === 'up' ? statStyles.trendUp : statStyles.trendDown]}>
          {trend === 'up' ? 'Improving' : 'Declining'}
        </Text>
      )}
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  label: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    color: Colors.TEXT,
    fontSize: 15,
    fontWeight: '700',
  },
  trend: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  trendUp: { color: Colors.SUCCESS },
  trendDown: { color: Colors.ERROR },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const { planExerciseId, exerciseName: paramName } =
    useLocalSearchParams<{ planExerciseId: string; exerciseName?: string }>();
  const router = useRouter();

  const [data, setData] = useState<ProgressPoint[]>([]);
  const [mode, setMode] = useState<ChartMode>('best');
  const [loading, setLoading] = useState(true);
  const [exerciseName, setExerciseName] = useState(paramName ?? '');
  const [isOneHanded, setIsOneHanded] = useState(false);

  useEffect(() => {
    if (!planExerciseId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Fetch plan exercise for name + one-handed detection
        const { supabase } = await import('../../lib/supabase') as { supabase: any };
        const { data: planExData } = await supabase
          .from('plan_exercise')
          .select(`
            custom_config,
            exercise:exercise_id ( name )
          `)
          .eq('id', planExerciseId)
          .single();

        if (planExData) {
          if (!paramName) {
            setExerciseName((planExData as any).exercise?.name ?? '');
          }
          const oneHanded = ((planExData as any).custom_config?.hands ?? 0) === 1;
          setIsOneHanded(oneHanded);
        }

        const history = await fetchProgressHistory(planExerciseId);
        setData(history);
      } catch (e) {
        console.error('ProgressScreen load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [planExerciseId, paramName]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleModeSelect = useCallback((m: ChartMode) => {
    setMode(m);
  }, []);

  const modes: ChartMode[] = ['best', 'avg', 'volume', '1rm'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exerciseName || 'Progress'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        {modes.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeChip, mode === m && styles.modeChipActive]}
            onPress={() => handleModeSelect(m)}
          >
            <Text style={[styles.modeChipText, mode === m && styles.modeChipTextActive]}>
              {MODE_LABELS[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.PRIMARY} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Chart */}
          <View style={styles.chartContainer}>
            <ProgressChart data={data} mode={mode} isOneHanded={isOneHanded} />
          </View>

          {/* One-handed legend */}
          {isOneHanded && data.length >= 2 && (
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.PRIMARY }]} />
                <Text style={styles.legendText}>Left</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.PRIMARY_LIGHT }]} />
                <Text style={styles.legendText}>Right</Text>
              </View>
            </View>
          )}

          {/* Stats section */}
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Summary</Text>

            <View style={styles.statsRow}>
              <StatCard label="Sessions" value={String(data.length)} />
              {isOneHanded ? (
                <>
                  <StatCard
                    label={`L ${MODE_LABELS[mode]}`}
                    value={data.length > 0 ? formatValue(getBestValue(data, mode, 'L'), mode) : '—'}
                    trend={getTrend(data, mode, 'L')}
                  />
                  <StatCard
                    label={`R ${MODE_LABELS[mode]}`}
                    value={data.length > 0 ? formatValue(getBestValue(data, mode, 'R'), mode) : '—'}
                    trend={getTrend(data, mode, 'R')}
                  />
                </>
              ) : (
                <StatCard
                  label={`Best ${MODE_LABELS[mode]}`}
                  value={data.length > 0 ? formatValue(getBestValue(data, mode, null), mode) : '—'}
                  trend={getTrend(data, mode, null)}
                />
              )}
            </View>

            {data.length > 0 && (
              <View style={styles.statsRow}>
                {isOneHanded ? (
                  <>
                    <StatCard
                      label="L Latest"
                      value={formatValue(getLatestValue(data, mode, 'L'), mode)}
                    />
                    <StatCard
                      label="R Latest"
                      value={formatValue(getLatestValue(data, mode, 'R'), mode)}
                    />
                  </>
                ) : (
                  <StatCard
                    label="Latest"
                    value={formatValue(getLatestValue(data, mode, null), mode)}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  backBtn: { minWidth: 70 },
  backBtnText: { color: Colors.PRIMARY, fontSize: 15, fontWeight: '600' },
  headerTitle: {
    flex: 1,
    color: Colors.TEXT,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRight: { minWidth: 70 },

  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
  },
  modeChipActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  modeChipText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  modeChipTextActive: {
    color: Colors.TEXT,
  },

  scrollContent: { paddingBottom: 32 },

  chartContainer: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 12,
    overflow: 'hidden',
  },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
  },

  statsSection: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  statsSectionTitle: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
});
