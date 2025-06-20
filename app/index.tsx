import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { YummioLogo } from '@/components/YummioLogo';

export default function IndexScreen() {
  const { colors } = useTheme();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Navigate based on auth state
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    }
  }, [user, isLoading]);

  // Show loading screen while checking auth state
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <YummioLogo size="large" animated={true} interactive={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});