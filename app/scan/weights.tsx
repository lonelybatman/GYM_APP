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
import { getSettings, saveExtraWeights } from '../../lib/local-storage';

const WEIGHT_SCAN_PROMPT = `Look at this weight stack. List ALL the weight numbers visible on the weight plates or labels, in kg.
Return ONLY a JSON array of numbers, no other text. Example: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
Do not include units, just numbers. If you see both kg and lbs markings, return only the kg values.`;

export default function WeightScanScreen() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [parsedNumbers, setParsedNumbers] = useState<number[]>([]);
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
      setParsedNumbers([]);
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
      const text = await callClaudeWithImage(imageUri, WEIGHT_SCAN_PROMPT, apiKey);

      let numbers: number[] = [];
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          numbers = parsed.filter((n) => typeof n === 'number' && !isNaN(n));
        }
      } catch {
        // Fallback: extract numbers with regex
        const matches = text.match(/[\d.]+/g);
        if (matches) {
          numbers = matches.map((m) => parseFloat(m)).filter((n) => !isNaN(n));
        }
      }

      if (numbers.length === 0) {
        Alert.alert('No numbers found', 'Could not detect weight numbers from the image. Try a clearer photo.');
      } else {
        setParsedNumbers(numbers);
      }
    } catch (e: any) {
      Alert.alert('Scan failed', e.message ?? 'Unknown error');
    } finally {
      setScanning(false);
    }
  };

  const removeNumber = (index: number) => {
    setParsedNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (parsedNumbers.length === 0) return;
    setSaving(true);
    try {
      await saveExtraWeights({ available_kg: parsedNumbers });
      Alert.alert('Saved', `Saved ${parsedNumbers.length} weight increments.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save');
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
        <Text style={styles.title}>Scan Weight Stack</Text>
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

        <Text style={styles.instruction}>Take a photo of the weight stack labels</Text>

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
                <Text style={styles.scanBtnText}>Scan Numbers</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {parsedNumbers.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsLabel}>Detected weights (tap to remove):</Text>
            <View style={styles.chipsRow}>
              {parsedNumbers.map((num, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.chip}
                  onPress={() => removeNumber(idx)}
                >
                  <Text style={styles.chipText}>{num} kg ✕</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.TEXT} />
              ) : (
                <Text style={styles.saveBtnText}>Save {parsedNumbers.length} Weights</Text>
              )}
            </TouchableOpacity>
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
  title: { color: Colors.TEXT, fontSize: 20, fontWeight: '700' },

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

  resultsSection: { gap: 14 },
  resultsLabel: { color: Colors.TEXT_SECONDARY, fontSize: 13 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.SURFACE_2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY + '66',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 13 },

  saveBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },

  btnDisabled: { opacity: 0.5 },
});
