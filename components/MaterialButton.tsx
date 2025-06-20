import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface MaterialButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const MaterialButton: React.FC<MaterialButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      opacity: disabled ? 0.38 : 1,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.onSurface : colors.primary,
          elevation: disabled ? 0 : 1,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: disabled ? 0 : 0.2,
          shadowRadius: 2,
        };
      case 'tonal':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.onSurface : colors.secondaryContainer,
          elevation: 0,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.onSurface : colors.outline,
          elevation: 0,
        };
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.onSurface : colors.surfaceContainerLow,
          elevation: disabled ? 0 : 1,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: disabled ? 0 : 0.2,
          shadowRadius: 2,
        };
      case 'text':
      default:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          elevation: 0,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'filled':
        return { color: disabled ? colors.onSurface : colors.onPrimary };
      case 'tonal':
        return { color: disabled ? colors.onSurface : colors.onSecondaryContainer };
      case 'outlined':
      case 'text':
        return { color: disabled ? colors.onSurface : colors.primary };
      case 'elevated':
        return { color: disabled ? colors.onSurface : colors.primary };
      default:
        return { color: colors.primary };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 12, paddingVertical: 8, minHeight: 32 };
      case 'large':
        return { paddingHorizontal: 24, paddingVertical: 16, minHeight: 56 };
      case 'medium':
      default:
        return { paddingHorizontal: 16, paddingVertical: 12, minHeight: 40 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && <>{icon}</>}
      <Text style={[styles.text, getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});