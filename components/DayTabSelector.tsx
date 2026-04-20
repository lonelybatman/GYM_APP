import { TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import type { DayConfig } from '../lib/create-plan-store';

type Props = {
  days: DayConfig[];
  activeDayIndex: number;
  onSelect: (index: number) => void;
};

export function DayTabSelector({ days, activeDayIndex, onSelect }: Props) {
  const trainingDays = days.filter((d) => !d.is_rest_day);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {trainingDays.map((day, i) => {
        const isActive = i === activeDayIndex;
        return (
          <TouchableOpacity
            key={day.uid}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(i)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              Day {day.day_number}
            </Text>
            {day.muscle_groups.length > 0 && (
              <Text style={[styles.tabSub, isActive && styles.tabSubActive]} numberOfLines={1}>
                {day.muscle_groups.join(' · ')}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    minWidth: 72,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.PRIMARY + '22',
    borderColor: Colors.PRIMARY,
  },
  tabText: {
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: { color: Colors.PRIMARY },
  tabSub: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 10,
    marginTop: 2,
  },
  tabSubActive: { color: Colors.PRIMARY, opacity: 0.8 },
});
