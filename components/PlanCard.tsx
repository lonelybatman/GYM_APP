import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Colors } from '../constants/colors';
import type { TrainingPlan } from '../types';

type Props = {
  plan: TrainingPlan;
  muscleGroupTags: string[];
  onEdit: () => void;
  onPress: () => void;
};

export function PlanCard({ plan, muscleGroupTags, onEdit, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {plan.cover_image_url ? (
        <ImageBackground
          source={{ uri: plan.cover_image_url }}
          style={styles.coverImage}
          imageStyle={styles.coverImageStyle}
        >
          <View style={styles.overlay} />
          <CardContent plan={plan} muscleGroupTags={muscleGroupTags} onEdit={onEdit} />
        </ImageBackground>
      ) : (
        <View style={[styles.coverImage, styles.noCover]}>
          <CardContent plan={plan} muscleGroupTags={muscleGroupTags} onEdit={onEdit} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function CardContent({
  plan,
  muscleGroupTags,
  onEdit,
}: {
  plan: TrainingPlan;
  muscleGroupTags: string[];
  onEdit: () => void;
}) {
  return (
    <View style={styles.cardContent}>
      <TouchableOpacity style={styles.editButton} onPress={onEdit} hitSlop={8}>
        <Text style={styles.editIcon}>✏</Text>
      </TouchableOpacity>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planMeta}>
        {plan.cycle_days}-day cycle · {plan.training_days} training days
      </Text>
      {muscleGroupTags.length > 0 && (
        <View style={styles.tagsRow}>
          {muscleGroupTags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  coverImage: {
    minHeight: 140,
  },
  coverImageStyle: {
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  noCover: {
    backgroundColor: Colors.SURFACE_2,
  },
  cardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    color: Colors.TEXT,
    fontSize: 14,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT,
    marginBottom: 4,
  },
  planMeta: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.PRIMARY + '33',
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: Colors.PRIMARY_LIGHT,
    fontSize: 11,
    fontWeight: '600',
  },
});
