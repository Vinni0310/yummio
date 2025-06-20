import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Clock, Users, Star, Wine } from 'lucide-react-native';
import { MaterialCard } from './MaterialCard';

const { width } = Dimensions.get('window');

interface Recipe {
  id: string;
  title: string;
  image: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  difficulty: string;
  rating: number;
  type: 'food' | 'cocktail' | 'drinks' | 'breakfast' | 'lunch' | 'desserts';
  collection: string;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { colors } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push(`/recipe/${recipe.id}`);
  };

  const onImageLoad = () => {
    setImageLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <MaterialCard variant="elevated" style={styles.card}>
        <TouchableOpacity onPress={handlePress} activeOpacity={1}>
          <View style={styles.imageContainer}>
            <ShimmerPlaceholder
              style={styles.image}
              visible={imageLoaded}
              shimmerColors={[colors.surfaceVariant, colors.outline, colors.surfaceVariant]}
              LinearGradient={LinearGradient}
            >
              <Animated.Image
                source={
                  recipe.image
                    ? { uri: recipe.image }
                    : require('../assets/images/placeholder.jpg')
                }
                style={[styles.image, { opacity: fadeAnim }]}
                resizeMode="cover"
                onLoad={onImageLoad}
                onError={onImageLoad}
              />
            </ShimmerPlaceholder>

            {recipe.type === 'cocktail' && (
              <View style={[styles.cinnamonRim, { borderColor: colors.tertiary }]} />
            )}

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />

            <View style={[styles.typeIndicator, {
              backgroundColor: recipe.type === 'cocktail' || recipe.type === 'drinks'
                ? colors.tertiaryContainer
                : colors.primaryContainer,
            }]}>
              {(recipe.type === 'cocktail' || recipe.type === 'drinks') ? (
                <Wine size={16} color={colors.onTertiaryContainer} strokeWidth={2} />
              ) : (
                <Text style={styles.typeText}>🍽️</Text>
              )}
            </View>

            <View style={[styles.rating, { backgroundColor: colors.scrim + '80' }]}>
              <Star size={12} color={colors.tertiary} fill={colors.tertiary} strokeWidth={1} />
              <Text style={[styles.ratingText, { color: colors.onPrimary }]}>
                {recipe.rating}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={2}>
              {recipe.title}
            </Text>

            <View style={styles.timeContainer}>
              <Clock size={14} color={colors.onSurfaceVariant} strokeWidth={2} />
              <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
                {recipe.totalTime}m • {recipe.difficulty}
              </Text>
            </View>

            <View style={styles.meta}>
              <View style={[styles.difficultyBadge, { backgroundColor: colors.secondaryContainer }]}>
                <Text style={[styles.difficultyText, { color: colors.onSecondaryContainer }]}>
                  {recipe.difficulty}
                </Text>
              </View>
              <Text style={[styles.collection, { color: colors.onSurfaceVariant }]}>
                {recipe.collection}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </MaterialCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  cinnamonRim: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 12,
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  typeIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
  },
  rating: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    lineHeight: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  collection: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});