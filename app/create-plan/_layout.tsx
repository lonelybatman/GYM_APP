import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function CreatePlanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.BACKGROUND },
        animation: 'slide_from_right',
      }}
    />
  );
}
