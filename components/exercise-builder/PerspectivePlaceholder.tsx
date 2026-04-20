import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { StickFigure, type StickFigureProps } from './StickFigure';

type Props = Omit<StickFigureProps, 'size'> & { label?: string };

const PERSP_LABEL: Record<string, string> = {
  oben: 'Top', vorne: 'Front', seite: 'Side',
};

export function PerspectivePlaceholder({ label, ...figureProps }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.figureArea}>
        <StickFigure {...figureProps} size={110} />
      </View>
      <Text style={styles.label}>
        {label ?? PERSP_LABEL[figureProps.perspective]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  figureArea: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
