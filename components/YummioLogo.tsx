import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ChefHat, Sparkles } from 'lucide-react-native';

interface YummioLogoProps {
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  interactive?: boolean;
  onPress?: () => void;
}

export const YummioLogo: React.FC<YummioLogoProps> = ({
  size = 'medium',
  animated = true,
  interactive = false,
  onPress,
}) => {
  const { colors } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const sparkleScale = useSharedValue(0.5);
  const hatBounce = useSharedValue(0);
  const textShimmer = useSharedValue(0);
  
  // Size configurations
  const sizeConfig = {
    small: { logoSize: 40, fontSize: 16, hatSize: 20 },
    medium: { logoSize: 60, fontSize: 24, hatSize: 28 },
    large: { logoSize: 80, fontSize: 32, hatSize: 36 },
  };
  
  const config = sizeConfig[size];

  useEffect(() => {
    if (animated) {
      // Continuous sparkle animation
      sparkleOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.linear }),
          withTiming(0, { duration: 1500, easing: Easing.linear })
        ),
        -1,
        false
      );

      sparkleScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1500, easing: Easing.out(Easing.back(1.5)) }),
          withTiming(0.5, { duration: 1500, easing: Easing.linear })
        ),
        -1,
        false
      );

      // Subtle hat bounce
      hatBounce.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 2000, easing: Easing.linear }),
          withTiming(0, { duration: 2000, easing: Easing.linear })
        ),
        -1,
        false
      );

      // Text shimmer effect
      textShimmer.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        true
      );
    }
  }, [animated]);

  const handlePress = () => {
    if (interactive && onPress) {
      // Bounce animation on press
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1.05, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );

      // Rotation animation
      rotation.value = withSequence(
        withTiming(10, { duration: 150 }),
        withTiming(-10, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );

      onPress();
    }
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const hatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: hatBounce.value },
    ],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
    transform: [
      { scale: sparkleScale.value },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => {
    const shimmerPosition = interpolate(
      textShimmer.value,
      [0, 1],
      [-100, 100]
    );
    
    return {
      shadowOpacity: interpolate(
        textShimmer.value,
        [0, 0.5, 1],
        [0.3, 0.6, 0.3]
      ),
    };
  });

  const LogoContent = (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Background glow */}
      <View style={[
        styles.glow,
        {
          width: config.logoSize + 20,
          height: config.logoSize + 20,
          backgroundColor: colors.primaryContainer,
        }
      ]} />
      
      {/* Main logo circle */}
      <View style={[
        styles.logoCircle,
        {
          width: config.logoSize,
          height: config.logoSize,
          backgroundColor: colors.primary,
        }
      ]}>
        {/* Chef hat */}
        <Animated.View style={[styles.hatContainer, hatAnimatedStyle]}>
          <ChefHat 
            size={config.hatSize} 
            color={colors.onPrimary} 
            strokeWidth={2}
          />
        </Animated.View>
        
        {/* Sparkles */}
        <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleAnimatedStyle]}>
          <Sparkles size={8} color={colors.tertiary} strokeWidth={2} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle2, sparkleAnimatedStyle]}>
          <Sparkles size={6} color={colors.tertiary} strokeWidth={2} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle3, sparkleAnimatedStyle]}>
          <Sparkles size={7} color={colors.tertiary} strokeWidth={2} />
        </Animated.View>
      </View>
      
      {/* App name with Fredoka font */}
      <Animated.Text
        style={[
          styles.appName,
          {
            fontSize: config.fontSize,
            color: colors.primary,
            fontFamily: 'Fredoka-Regular',
            shadowColor: colors.primary,
          },
          textAnimatedStyle,
        ]}
      >
        Yummio
      </Animated.Text>
      
      {/* Tagline for larger sizes */}
      {size !== 'small' && (
        <Text style={[
          styles.tagline,
          {
            color: colors.onSurfaceVariant,
            fontSize: config.fontSize * 0.4,
            fontFamily: 'Inter-Medium',
          }
        ]}>
          Save. Cook. Savor.
        </Text>
      )}
    </Animated.View>
  );

  if (interactive) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        {LogoContent}
      </TouchableOpacity>
    );
  }

  return LogoContent;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.3,
  },
  logoCircle: {
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hatContainer: {
    zIndex: 2,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 1,
  },
  sparkle1: {
    top: '15%',
    right: '20%',
  },
  sparkle2: {
    bottom: '25%',
    left: '15%',
  },
  sparkle3: {
    top: '30%',
    left: '25%',
  },
  appName: {
    marginTop: 12,
    textAlign: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    fontWeight: '400',
  },
  tagline: {
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});