import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { signIn } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // Navigation handled automatically by auth state change in _layout.tsx
    } catch (e: any) {
      Alert.alert('Login failed', e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo / Title */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>G</Text>
          </View>
          <Text style={styles.appName}>GymTracker</Text>
          <Text style={styles.tagline}>Track smarter. Train harder.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign In</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.TEXT} />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.secondaryBtnText}>
              No account?{'  '}
              <Text style={styles.link}>Create one →</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },

  header: { alignItems: 'center', marginBottom: 48 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { color: Colors.TEXT, fontSize: 36, fontWeight: '900' },
  appName: { color: Colors.TEXT, fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { color: Colors.TEXT_SECONDARY, fontSize: 14, marginTop: 6 },

  form: { gap: 16 },
  formTitle: { color: Colors.TEXT, fontSize: 22, fontWeight: '700', marginBottom: 4 },

  inputGroup: { gap: 6 },
  label: { color: Colors.TEXT_SECONDARY, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    color: Colors.TEXT,
    fontSize: 16,
    padding: 14,
  },

  primaryBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: Colors.TEXT, fontWeight: '700', fontSize: 16 },

  secondaryBtn: { alignItems: 'center', paddingVertical: 8 },
  secondaryBtnText: { color: Colors.TEXT_SECONDARY, fontSize: 14 },
  link: { color: Colors.PRIMARY, fontWeight: '700' },
});
