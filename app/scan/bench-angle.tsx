import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { callClaudeWithImage } from '../../lib/claude-vision';
import { getSettings, linkRasterToDegree } from '../../lib/local-storage';

const BENCH_ANGLE_PROMPT = `This is a photo of a gym bench. Determine the angle of the backrest relative to horizontal (0° = flat, 90° = fully upright).
Return ONLY a single integer number representing the angle in degrees. No text, no units, just the number.
If the bench appears flat, return 0. If fully upright, return 90.`;

export default function BenchAngleScanScreen() {
  const router = useRouter();
  const { benchId, rasterNumber } = useLocalSearchParams<{
    benchId: string;
    rasterNumber: string;
  }>();

  const [apiKey, setApiKey] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detectedAngle, setDetectedAngle] = useState<number | null>(null);
  const [angleInput, setAngleInput] = useState('');
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
      setDetectedAngle(null);
      setAngleInput('');
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
      const text = await callClaudeWithImage(imageUri, BENCH_ANGLE_PROMPT, apiKey);

      const match = text.match(/[\d]+/);
      const angle = match ? parseInt(match[0], 10) : 0;
      setDetectedAngle(angle);
      setAngleInput(String(angle));
    } catch (e: any) {
      Alert.alert('Scan failed', e.message ?? 'Unknown error');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    const angle = parseInt(angleInput, 10);
    if (isNaN(angle) || angle < 0 || angle > 90) {
      Alert.alert('Invalid angle', 'Please enter a value between 0 and 90 degrees.');
      return;
    }
    if (!benchId || !rasterNumber) {
      Alert.alert('Error', 'Missing bench ID or raster number.');
      return;
    }

    setSaving(true);
    try {
      await linkRasterToDegree(benchId, parseInt(rasterNumber, 10), angle);
      router.back();
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
        <Text style={styles.title}>Scan Bench Angle</Text>
      </View>

      <View style={styles.content}>
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
          Take a photo of the bench at the current raster position
        </Text>
        {rasterNumber && (
          <Text style={styles.subInstruction}>Raster position: {rasterNumber}</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
            <Text style={styles.photoBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
            <Text style={styles.photoBtnText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity
              style={[styles.scanBtn, (!apiKey || scanning) && styles.btnDisabled]}
              onPress={handleScan}
              disabled={!apiKey || scanning}
            >
              {scanning ? (
                <ActivityIndicator color={Colors.TEXT} />
              ) : (
                <Text style={styles.scanBtnText}>Detect Angle</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {detectedAngle !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Detected angle: {detectedAngle}°</Text>
            <Text style={styles.resultSublabel}>Correct if needed:</Text>
            <View style={styles.angleInputRow}>
              <TextInput
                style={styles.angleInput}
                value={angleInput}
                onChangeText={setAngleInput}
                keyboardType="numeric"
                maxLength={2}
                placeholder="0–90"
                placeholderTextColor={Colors.TEXT_SECONDARY}
              />
              <Text style={styles.degreeSuffix}>°</Text>
            </View>
          </View>
        )}

        {(detectedAngle !== null || angleInput !== '') && (
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.TEXT} />
            ) : (
              <Text style={styles.saveBtnText}>Save Angle</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
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

  content: { flex: 1, padding: 20, gap: 16 },

  warningBox: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.ERROR + '88',
    padding: 14,
  },
  warningText: { color: Colors.ERROR, fontSize: 13, lineHeight: 18 },

  instruction: { color: Colors.TEXT_SECONDARY, fontSize: 15, lineHeight: 22 },
  subInstruction: { color: Colors.TEXT_SECONDARY, fontSize: 13 },

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

  resultBox: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 16,
    gap: 8,
  },
  resultLabel: { color: Colors.PRIMARY, fontSize: 18, fontWeight: '700' },
  resultSublabel: { color: Colors.TEXT_SECONDARY, fontSize: 13 },
  angleInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  angleInput: {
    backgroundColor: Colors.SURFACE_2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    color: Colors.TEXT,
    padding: 10,
    fontSize: 16,
    width: 70,
    textAlign: 'center',
  },
  degreeSuffix: { color: Colors.TEXT, fontSize: 16, fontWeight: '600' },

  saveBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },

  btnDisabled: { opacity: 0.5 },
});
