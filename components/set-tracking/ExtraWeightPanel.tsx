import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';

type Props = {
  extraWeight: number;
  increment: number;
  availableIncrements: number[];
  onAdd: () => void;
  onSubtract: () => void;
  onReset: () => void;
  onIncrementUp: () => void;
  onIncrementDown: () => void;
};

export function ExtraWeightPanel({
  extraWeight,
  increment,
  availableIncrements,
  onAdd,
  onSubtract,
  onReset,
  onIncrementUp,
  onIncrementDown,
}: Props) {
  const isZero = extraWeight === 0;
  const weightLabel = `${extraWeight % 1 === 0 ? extraWeight : extraWeight.toFixed(2)} kg extra`;
  const incrementLabel = availableIncrements.length > 0
    ? (increment % 1 === 0 ? String(increment) : increment.toFixed(2))
    : '—';

  return (
    <View style={styles.container}>
      {/* Left section: reset, subtract, display, add */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.iconBtn} onPress={onReset} activeOpacity={0.7}>
          <Text style={styles.iconText}>↺</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stepBtn} onPress={onSubtract} activeOpacity={0.7}>
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        <View style={styles.display}>
          <Text style={[styles.displayText, isZero && styles.displayTextMuted]}>
            {weightLabel}
          </Text>
        </View>

        <TouchableOpacity style={styles.stepBtn} onPress={onAdd} activeOpacity={0.7}>
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Right section: increment control */}
      <View style={styles.sectionRight}>
        <TouchableOpacity style={styles.stepBtn} onPress={onIncrementDown} activeOpacity={0.7}>
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        <View style={styles.incrementDisplay}>
          <Text style={styles.incrementText}>{incrementLabel}</Text>
        </View>

        <TouchableOpacity style={styles.stepBtn} onPress={onIncrementUp} activeOpacity={0.7}>
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    height: 52,
    paddingHorizontal: 8,
  },

  section: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  iconBtn: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: Colors.SURFACE_2,
  },
  iconText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: '600',
  },

  stepBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: Colors.SURFACE_2,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  stepBtnText: {
    color: Colors.TEXT,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },

  display: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.BACKGROUND,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingHorizontal: 6,
  },
  displayText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  displayTextMuted: {
    color: Colors.TEXT_SECONDARY,
  },

  divider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.BORDER,
    marginHorizontal: 8,
  },

  incrementDisplay: {
    width: 48,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: Colors.BACKGROUND,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  incrementText: {
    color: Colors.TEXT,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
