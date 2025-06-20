import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface MaterialChipProps {
  label: string;
  onPress?: () => void;
  variant?: 'assist' | 'filter' | 'input' | 'suggestion';
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const MaterialChip: React.FC<MaterialChipProps> = ({
  label,
  onPress,
  variant = 'assist',
  selected = false,
  disabled = false,
  icon,
  style,
}) => {
  const { colors } = useTheme();

  const getChipStyle = () => {
    if (disabled) {
      return {
        backgroundColor: colors.onSurface,
        opacity: 0.12,
      };
    }

    if (selected) {
      return {
        backgroundColor: colors.secondaryContainer,
        borderColor: 'transparent',
      };
    }

    switch (variant) {
      case 'filter':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.outline,
        };
      case 'input':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.outline,
        };
      case 'suggestion':
        return {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: 'transparent',
        };
      case 'assist':
      default:
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.outline,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.onSurface;
    if (selected) return colors.onSecondaryContainer;
    return colors.onSurfaceVariant;
  };

  return (
    <TouchableOpacity
      style={[styles.chip, getChipStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && <>{icon}</>}
      <Text style={[styles.label, { color: getTextColor() }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
    minHeight: 32,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});