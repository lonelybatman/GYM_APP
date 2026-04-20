import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

// This tab immediately redirects to the create plan flow.
// It exists as a tab so the "+" button in the navigation bar works.
export default function NewScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/create-plan/step1');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.BACKGROUND, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.PRIMARY} />
    </View>
  );
}
