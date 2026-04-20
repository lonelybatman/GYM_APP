import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Colors } from '../../constants/colors';

type Props = {
  setType: string;
  prevKg: number | null;
  prevReps: number | null;
  kg: string;
  reps: string;
  isConfirmed: boolean;
  isRowActive: boolean;
  isActiveKg: boolean;
  isActiveReps: boolean;
  onPressKg: () => void;
  onPressReps: () => void;
  onDelete: () => void;
};

function isWarmupOrSpecial(setType: string): boolean {
  return setType.startsWith('W') || setType === 'D' || setType === 'B';
}

function formatPrevious(kg: number | null, reps: number | null): string {
  if (kg == null && reps == null) return '—';
  if (kg == null) return `—×${reps}`;
  if (reps == null) return `${kg}×—`;
  return `${kg}×${reps}`;
}

const DELETE_THRESHOLD = -70;
const DELETE_BTN_WIDTH = 80;

export function SetRow({
  setType,
  prevKg,
  prevReps,
  kg,
  reps,
  isConfirmed,
  isRowActive,
  isActiveKg,
  isActiveReps,
  onPressKg,
  onPressReps,
  onDelete,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isSpecial = isWarmupOrSpecial(setType);
  const rowOpacity = (!isConfirmed && !isRowActive) ? 0.6 : 1;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && Math.abs(g.dx) > 6,
      onPanResponderMove: (_, g) => {
        const val = Math.min(0, g.dx);
        translateX.setValue(val);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < DELETE_THRESHOLD) {
          // Animate off screen then delete
          Animated.timing(translateX, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  // Resolve text styles for kg/reps cells
  function getValueTextStyle(isThisCellActive: boolean) {
    if (isThisCellActive) return [styles.valueText, styles.valueTextActive];
    if (isConfirmed || isRowActive) return [styles.valueText, styles.valueTextBright];
    return [styles.valueText, styles.valueTextDim];
  }

  function formatValue(val: string, isThisCellActive: boolean): string {
    if (val === '') {
      return isThisCellActive ? '' : '—';
    }
    return val;
  }

  return (
    <View style={styles.wrapper}>
      {/* Red delete background */}
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteLabel}>Delete</Text>
      </View>

      {/* Swipeable row */}
      <Animated.View
        style={[styles.row, { opacity: rowOpacity, transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Set badge */}
        <View style={styles.colSet}>
          <View style={[styles.badge, isSpecial ? styles.badgeSpecial : styles.badgeNormal]}>
            <Text style={[styles.badgeText, isSpecial ? styles.badgeTextSpecial : styles.badgeTextNormal]}>
              {setType}
            </Text>
          </View>
        </View>

        {/* Previous */}
        <View style={styles.colPrevious}>
          <Text style={styles.previousText}>
            {formatPrevious(prevKg, prevReps)}
          </Text>
        </View>

        {/* kg */}
        <TouchableOpacity
          style={[styles.colValue, isActiveKg && styles.colValueActive]}
          onPress={onPressKg}
          activeOpacity={0.7}
        >
          <Text style={getValueTextStyle(isActiveKg)}>
            {formatValue(kg, isActiveKg)}
          </Text>
        </TouchableOpacity>

        {/* reps */}
        <TouchableOpacity
          style={[styles.colValue, isActiveReps && styles.colValueActive]}
          onPress={onPressReps}
          activeOpacity={0.7}
        >
          <Text style={getValueTextStyle(isActiveReps)}>
            {formatValue(reps, isActiveReps)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER + '55',
  },

  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DELETE_BTN_WIDTH,
    backgroundColor: Colors.ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: {
    color: Colors.TEXT,
    fontWeight: '700',
    fontSize: 13,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.BACKGROUND,
  },

  // Set badge
  colSet: {
    width: 52,
    alignItems: 'center',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 36,
    alignItems: 'center',
  },
  badgeNormal: {
    backgroundColor: Colors.PRIMARY + '22',
    borderWidth: 1,
    borderColor: Colors.PRIMARY + '66',
  },
  badgeSpecial: {
    backgroundColor: Colors.SURFACE_2,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextNormal: {
    color: Colors.PRIMARY,
  },
  badgeTextSpecial: {
    color: Colors.TEXT_SECONDARY,
  },

  // Previous column
  colPrevious: {
    flex: 1.2,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  previousText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 13,
    fontFamily: 'monospace',
  },

  // Value columns (kg / reps)
  colValue: {
    flex: 1,
    height: 44,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colValueActive: {
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.PRIMARY + '15',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  valueTextActive: {
    color: Colors.PRIMARY,
  },
  valueTextBright: {
    color: Colors.TEXT,
  },
  valueTextDim: {
    color: Colors.TEXT_SECONDARY,
  },
});
