import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface MaterialCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  style?: ViewStyle;
  onPress?: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  children,
  variant = 'elevated',
  style,
}) => {
  const { colors } = useTheme();

  const getCardStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.surfaceContainerHighest,
          elevation: 0,
          shadowOpacity: 0,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.outline,
          elevation: 0,
          shadowOpacity: 0,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surfaceContainerLow,
          elevation: 1,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        };
    }
  };

  return (
    <View style={[styles.card, getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});