import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

// Phase 2: real kinematic model. For now: placeholder with mock data.
type Activation = { muscle: string; percent: number };

const MOCK_ACTIVATIONS: Activation[] = [
  { muscle: 'Primary', percent: 80 },
  { muscle: 'Secondary', percent: 45 },
  { muscle: 'Stabilizer', percent: 20 },
];

export function MuscleActivationBar() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Muscle Activation</Text>
      <Text style={styles.phase2Note}>Phase 2 · Kinematic model</Text>
      {MOCK_ACTIVATIONS.map((a) => (
        <View key={a.muscle} style={styles.row}>
          <Text style={styles.muscleName}>{a.muscle}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${a.percent}%` }]} />
          </View>
          <Text style={styles.percent}>{a.percent}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    gap: 8,
  },
  title: { color: Colors.TEXT, fontWeight: '700', fontSize: 14 },
  phase2Note: { color: Colors.TEXT_SECONDARY, fontSize: 11 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muscleName: { color: Colors.TEXT_SECONDARY, fontSize: 12, width: 70 },
  barBg: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: Colors.SURFACE_2,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: Colors.PRIMARY, borderRadius: 3 },
  percent: { color: Colors.TEXT, fontSize: 12, fontWeight: '600', width: 36, textAlign: 'right' },
});
