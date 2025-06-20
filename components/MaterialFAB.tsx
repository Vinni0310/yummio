import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface MaterialFABProps {
  onPress: () => void;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const MaterialFAB: React.FC<MaterialFABProps> = ({
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return colors.secondaryContainer;
      case 'tertiary':
        return colors.tertiaryContainer;
      case 'surface':
        return colors.surfaceContainerHigh;
      case 'primary':
      default:
        return colors.primaryContainer;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40 };
      case 'large':
        return { width: 96, height: 96 };
      case 'medium':
      default:
        return { width: 56, height: 56 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: getBackgroundColor(),
          shadowColor: colors.shadow,
        },
        getSizeStyle(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});