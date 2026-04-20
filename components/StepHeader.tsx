import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

type Props = {
  currentStep: number;
  totalSteps: number;
  title: string;
  onBack?: () => void;
};

export function StepHeader({ currentStep, totalSteps, title, onBack }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => onBack ? onBack() : router.back()} hitSlop={12}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i + 1 === currentStep && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.stepLabel}>
        {currentStep}/{totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  back: {
    width: 36,
    alignItems: 'center',
  },
  backText: {
    color: Colors.TEXT,
    fontSize: 28,
    lineHeight: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Colors.TEXT,
    fontWeight: '700',
    fontSize: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.SURFACE_2,
  },
  dotActive: {
    backgroundColor: Colors.PRIMARY,
    width: 20,
    borderRadius: 4,
  },
  stepLabel: {
    width: 36,
    textAlign: 'right',
    color: Colors.TEXT_SECONDARY,
    fontSize: 13,
  },
});
