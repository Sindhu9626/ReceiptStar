import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import {checkCurrentUser} from '../src/checkLogin';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  let name;
  if(checkCurrentUser != null) {
    name = "(tabs)"
  }
  else {
    name = "loginScreen"
  }
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", }}>
      {/* first screen (redirected to from app/index) */}
      <Stack.Screen name="loadingWelcome" />
      {/* your tabs group */}
      <Stack.Screen name={name} />
    </Stack>
    
  );
}
