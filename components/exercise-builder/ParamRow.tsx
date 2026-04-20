/**
 * Generic parameter row for the Exercise Builder.
 * Supports: text-label (1 option), multi-option selector, toggle (2 options)
 */
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';

type Props = {
  label: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
  /** Nur Anzeige (z. B. eine feste Body Position), keine Auswahl-Chips. */
  textOnly?: boolean;
};

export function ParamRow({ label, options, selected, onSelect, textOnly }: Props) {
  if (options.length === 0) return null;

  if (textOnly) {
    const only = options[0];
    const show = options.find((o) => o.value === selected)?.label ?? only?.label ?? '';
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.textOnlyValue}>{show}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, selected === opt.value && styles.chipActive]}
              onPress={() => onSelect(opt.value)}
            >
              <Text style={[styles.chipText, selected === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER + '66',
  },
  label: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  chipActive: { backgroundColor: Colors.PRIMARY + '22', borderColor: Colors.PRIMARY },
  chipText: { color: Colors.TEXT_SECONDARY, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: Colors.PRIMARY },
  textOnlyValue: { color: Colors.TEXT, fontWeight: '600', fontSize: 13, paddingVertical: 4 },
});
