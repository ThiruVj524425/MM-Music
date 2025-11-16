import { AppNavigator } from '@/navigation/AppNavigator';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
