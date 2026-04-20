import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../lib/auth-context';
import { signOut } from '../../lib/auth';
import {
  getSettings,
  updateSettings,
  getExtraWeights,
  saveExtraWeights,
} from '../../lib/local-storage';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [bodyBenchVisible, setBodyBenchVisible] = useState(false);

  // Scan / AI
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const apiKeyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extra Weights
  const [extraWeightsText, setExtraWeightsText] = useState('');

  useEffect(() => {
    getSettings().then((s) => {
      setBodyBenchVisible(s.body_bench_visible);
      setClaudeApiKey(s.claudeApiKey);
    });
    getExtraWeights().then((cfg) => {
      setExtraWeightsText(cfg.available_kg.join(', '));
    });
  }, []);

  const handleBodyBenchToggle = async (value: boolean) => {
    setBodyBenchVisible(value);
    await updateSettings({ body_bench_visible: value });
  };

  const handleApiKeyChange = (value: string) => {
    setClaudeApiKey(value);
    if (apiKeyDebounceRef.current) clearTimeout(apiKeyDebounceRef.current);
    apiKeyDebounceRef.current = setTimeout(() => {
      updateSettings({ claudeApiKey: value });
    }, 500);
  };

  const handleApiKeyBlur = () => {
    if (apiKeyDebounceRef.current) clearTimeout(apiKeyDebounceRef.current);
    updateSettings({ claudeApiKey: claudeApiKey });
  };

  const handleExtraWeightsBlur = () => {
    const parsed = extraWeightsText
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    saveExtraWeights({ available_kg: parsed });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Email</Text>
            <Text style={styles.cardValue}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        {/* Exercise Builder */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EXERCISE BUILDER</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Show Body Position (Bench+Cable)</Text>
            <Switch
              value={bodyBenchVisible}
              onValueChange={handleBodyBenchToggle}
              trackColor={{ false: Colors.BORDER, true: Colors.PRIMARY }}
              thumbColor={Colors.TEXT}
            />
          </View>
        </View>

        {/* Scan / AI */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SCAN / AI</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Claude API Key</Text>
            <View style={styles.apiKeyRow}>
              <TextInput
                style={styles.apiKeyInput}
                value={claudeApiKey}
                onChangeText={handleApiKeyChange}
                onBlur={handleApiKeyBlur}
                placeholder="sk-ant-..."
                placeholderTextColor={Colors.TEXT_SECONDARY}
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.toggleVisibilityBtn}
                onPress={() => setShowApiKey((v) => !v)}
              >
                <Text style={styles.toggleVisibilityText}>{showApiKey ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Extra Weights */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EXTRA WEIGHTS</Text>
          <View style={styles.cardColumn}>
            <Text style={styles.cardLabel}>Available Increments (kg)</Text>
            <TextInput
              style={styles.extraWeightsInput}
              value={extraWeightsText}
              onChangeText={setExtraWeightsText}
              onBlur={handleExtraWeightsBlur}
              placeholder="e.g. 1.25, 2.5, 5"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.signOutBtn, signingOut && styles.disabled]}
            onPress={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator color={Colors.ERROR} />
            ) : (
              <Text style={styles.signOutText}>Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  title: { color: Colors.TEXT, fontWeight: '700', fontSize: 28, marginBottom: 32 },

  section: { marginBottom: 24 },
  sectionLabel: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },

  card: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardColumn: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 16,
    gap: 10,
  },
  cardLabel: { color: Colors.TEXT_SECONDARY, fontSize: 14 },
  cardValue: { color: Colors.TEXT, fontSize: 14, fontWeight: '500' },

  apiKeyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  apiKeyInput: {
    flex: 1,
    backgroundColor: Colors.SURFACE_2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    color: Colors.TEXT,
    padding: 8,
    fontSize: 13,
  },
  toggleVisibilityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toggleVisibilityText: {
    color: Colors.PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },

  extraWeightsInput: {
    backgroundColor: Colors.SURFACE_2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    color: Colors.TEXT,
    padding: 10,
    fontSize: 14,
  },

  signOutBtn: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ERROR + '88',
    padding: 16,
    alignItems: 'center',
  },
  signOutText: { color: Colors.ERROR, fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.6 },
});
