import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../constants/colors';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { CreatePlanProvider } from '../lib/create-plan-store';

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.BACKGROUND, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.BACKGROUND },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-plan" />
      <Stack.Screen
        name="exercise-builder"
        options={{
          animation: 'none',
          presentation: 'card',
          contentStyle: { backgroundColor: Colors.BACKGROUND },
        }}
      />
      <Stack.Screen name="day-overview" />
      <Stack.Screen name="plan-detail" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="set-tracking" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CreatePlanProvider>
          <StatusBar style="light" backgroundColor={Colors.BACKGROUND} />
          <RootNavigator />
        </CreatePlanProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
