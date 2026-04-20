import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { callClaudeWithImage } from '../../lib/claude-vision';
import { getSettings } from '../../lib/local-storage';
import { savePlan } from '../../lib/queries/training-plans';
import { useAuth } from '../../lib/auth-context';
import type { CreatePlanState, DayConfig } from '../../lib/create-plan-store';

const PLAN_IMPORT_PROMPT = `This is a screenshot of a training plan from a gym/fitness app. Extract the training plan information.
Return a JSON object with this exact structure:
{
  "plan_name": "Name of the plan",
  "cycle_days": 7,
  "training_days": 4,
  "days": [
    {
      "day_number": 1,
      "name": "Day name (e.g. Push Day, Chest & Triceps)",
      "is_rest_day": false,
      "exercises": ["Exercise 1", "Exercise 2", "Exercise 3"]
    }
  ]
}
For rest days, set is_rest_day to true and exercises to [].
cycle_days should be the total days in one training cycle (e.g. 7 for weekly).
training_days should be the number of non-rest days.
Return ONLY the JSON, no other text.`;

type ParsedDay = {
  day_number: number;
  name: string;
  is_rest_day: boolean;
  exercises: string[];
};

type ParsedPlan = {
  plan_name: string;
  cycle_days: number;
  training_days: number;
  days: ParsedDay[];
};

export default function PlanImportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => setApiKey(s.claudeApiKey));
  }, []);

  const pickImage = async (fromCamera: boolean) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    };

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setParsedPlan(null);
    }
  };

  const handleScan = async () => {
    if (!imageUri) return;

    if (!apiKey) {
      Alert.alert(
        'API Key Required',
        'Set your Claude API key in Settings to use AI scanning.',
      );
      return;
    }

    setScanning(true);
    try {
      const text = await callClaudeWithImage(imageUri, PLAN_IMPORT_PROMPT, apiKey, 4096);

      let parsed: ParsedPlan;
      try {
        parsed = JSON.parse(text) as ParsedPlan;
      } catch {
        Alert.alert(
          'Parse Error',
          'Could not parse the plan from this image. Try a clearer screenshot with visible plan structure.',
        );
        return;
      }

      if (!parsed.plan_name || !Array.isArray(parsed.days)) {
        Alert.alert('Invalid Response', 'The scanned image did not contain a recognizable training plan.');
        return;
      }

      setParsedPlan(parsed);
    } catch (e: any) {
      Alert.alert('Scan failed', e.message ?? 'Unknown error');
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async () => {
    if (!parsedPlan || !user) return;

    const importStamp = Date.now();
    const planState: CreatePlanState = {
      plan_name: parsedPlan.plan_name,
      cycle_days: parsedPlan.cycle_days,
      training_days: parsedPlan.training_days,
      days: parsedPlan.days.map(
        (d, i): DayConfig => ({
          uid: `scan-${importStamp}-${i}-${d.day_number}`,
          day_number: d.day_number,
          name: d.name,
          is_rest_day: d.is_rest_day,
          muscle_groups: [],
          muscle_ids: [],
          // Scan liefert nur Namenstrings; Zuordnung zu exercise_id erfolgt später im Planner.
          exercises: [],
        }),
      ),
    };

    setSaving(true);
    try {
      await savePlan(user.id, planState);
      Alert.alert('Imported!', `"${parsedPlan.plan_name}" has been saved to your plans.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Import from Screenshot</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {!apiKey && (
          <TouchableOpacity
            style={styles.warningBox}
            onPress={() =>
              Alert.alert(
                'API Key Required',
                'Go to Settings → SCAN / AI and enter your Claude API key to enable scanning.',
              )
            }
          >
            <Text style={styles.warningText}>
              ⚠ Claude API key not set. Tap here to learn how to configure it.
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.instruction}>
          Take a screenshot of your training plan from another app
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
            <Text style={styles.photoBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
            <Text style={styles.photoBtnText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <View style={styles.previewSection}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity
              style={[styles.scanBtn, (!apiKey || scanning) && styles.btnDisabled]}
              onPress={handleScan}
              disabled={!apiKey || scanning}
            >
              {scanning ? (
                <ActivityIndicator color={Colors.TEXT} />
              ) : (
                <Text style={styles.scanBtnText}>Scan Plan</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {parsedPlan && (
          <View style={styles.planPreview}>
            <Text style={styles.planPreviewTitle}>Plan Preview</Text>

            <View style={styles.planMeta}>
              <Text style={styles.planName}>{parsedPlan.plan_name}</Text>
              <Text style={styles.planMetaText}>
                {parsedPlan.cycle_days}-day cycle · {parsedPlan.training_days} training days
              </Text>
            </View>

            {parsedPlan.days.map((day) => (
              <View key={day.day_number} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>
                    Day {day.day_number}: {day.name}
                  </Text>
                  {day.is_rest_day && (
                    <View style={styles.restBadge}>
                      <Text style={styles.restBadgeText}>Rest</Text>
                    </View>
                  )}
                </View>
                {!day.is_rest_day && day.exercises.length > 0 && (
                  <View style={styles.exerciseList}>
                    {day.exercises.map((ex, idx) => (
                      <Text key={idx} style={styles.exerciseItem}>
                        • {ex}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setParsedPlan(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.importBtn, saving && styles.btnDisabled]}
                onPress={handleImport}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.TEXT} />
                ) : (
                  <Text style={styles.importBtnText}>Import Plan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    gap: 12,
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backBtnText: { color: Colors.PRIMARY, fontSize: 16, fontWeight: '600' },
  title: { color: Colors.TEXT, fontSize: 18, fontWeight: '700', flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20 },

  warningBox: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.ERROR + '88',
    padding: 14,
  },
  warningText: { color: Colors.ERROR, fontSize: 13, lineHeight: 18 },

  instruction: { color: Colors.TEXT_SECONDARY, fontSize: 15, lineHeight: 22 },

  buttonRow: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1,
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 14,
    alignItems: 'center',
  },
  photoBtnText: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 14 },

  previewSection: { gap: 12 },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: Colors.SURFACE_2,
  },
  scanBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  scanBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },

  planPreview: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 16,
    gap: 12,
  },
  planPreviewTitle: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  planMeta: { gap: 4 },
  planName: { color: Colors.TEXT, fontSize: 18, fontWeight: '700' },
  planMetaText: { color: Colors.TEXT_SECONDARY, fontSize: 13 },

  dayCard: {
    backgroundColor: Colors.SURFACE_2,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayName: { color: Colors.TEXT, fontSize: 14, fontWeight: '600', flex: 1 },
  restBadge: {
    backgroundColor: Colors.BORDER,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  restBadgeText: { color: Colors.TEXT_SECONDARY, fontSize: 11 },
  exerciseList: { gap: 2 },
  exerciseItem: { color: Colors.TEXT_SECONDARY, fontSize: 13 },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.SURFACE_2,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.TEXT_SECONDARY, fontWeight: '600', fontSize: 15 },
  importBtn: {
    flex: 2,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  importBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 15 },

  btnDisabled: { opacity: 0.5 },
});
