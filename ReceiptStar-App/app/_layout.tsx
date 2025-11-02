import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", }}>
      {/* first screen (redirected to from app/index) */}
      <Stack.Screen name="loadingWelcome" />
      {/* your tabs group */}
      <Stack.Screen name="(tabs)" />
      {/*login */}
      <Stack.Screen name="loginScreen" />
    </Stack>
    
  );
}
