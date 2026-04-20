import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';

type Props = {
  onKey: (key: string) => void; // '0'-'9', '.', 'del', 'next'
  showDecimal?: boolean;         // for kg: true; for reps: false
  nextLabel?: string;            // default: '→'
};

const ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
];

export function NumPad({ onKey, showDecimal = false, nextLabel = '→' }: Props) {
  return (
    <View style={styles.container}>
      {/* Rows 7-9, 4-6, 1-3 */}
      {ROWS.map((row) => (
        <View key={row[0]} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.btn}
              onPress={() => onKey(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Bottom row: [.] [0] [DEL] */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, !showDecimal && styles.btnDisabled]}
          onPress={() => showDecimal && onKey('.')}
          activeOpacity={showDecimal ? 0.7 : 1}
        >
          <Text style={[styles.btnText, !showDecimal && styles.btnTextDisabled]}>.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onKey('0')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDel]}
          onPress={() => onKey('del')}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, styles.btnDelText]}>⌫</Text>
        </TouchableOpacity>
      </View>

      {/* Next button — full width */}
      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => onKey('next')}
        activeOpacity={0.8}
      >
        <Text style={styles.nextBtnText}>{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  btn: {
    flex: 1,
    height: 64,
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: Colors.TEXT,
    fontSize: 22,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.3,
  },
  btnTextDisabled: {
    color: Colors.TEXT_SECONDARY,
  },
  btnDel: {
    backgroundColor: Colors.SURFACE_2,
  },
  btnDelText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 20,
  },
  nextBtn: {
    height: 64,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  nextBtnText: {
    color: Colors.TEXT,
    fontSize: 22,
    fontWeight: '700',
  },
});
