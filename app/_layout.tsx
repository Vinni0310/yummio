import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { customFonts } from '../fonts';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

function InnerLayout() {
  useFrameworkReady();
  const { isDark } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="add-recipe" />
        <Stack.Screen name="recipe/[id]" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const [fontsLoaded] = useFonts({
    'Fredoka-Regular': customFonts['Fredoka-Regular'],
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
            <InnerLayout />
          </View>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}