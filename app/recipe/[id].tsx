import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/context/LocationContext';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share, Heart, MoveVertical as MoreVertical, Clock, Users, Star, Wine, Copy, Printer, CreditCard as Edit, Trash2, Globe } from 'lucide-react-native';
import { convertIngredientList } from '@/utils/measurements';

const { width } = Dimensions.get('window');

// Mock recipe data
const recipeData = {
  '1': {
    id: '1',
    title: 'Cinnamon Apple Pie Cocktail',
    image: 'https://images.pexels.com/photos/1268558/pexels-photo-1268558.jpeg',
    prepTime: 5,
    cookTime: 0,
    totalTime: 5,
    difficulty: 'Easy',
    rating: 4.8,
    type: 'cocktail',
    description: 'A warm and cozy cocktail that captures the essence of apple pie in a glass. Perfect for autumn evenings or any time you crave something comforting.',
    ingredients: [
      '2 oz bourbon whiskey',
      '1 cup apple cider',
      '0.5 oz cinnamon syrup',
      '0.25 oz lemon juice',
      'Apple slice for garnish',
      'Cinnamon stick for garnish',
      'Ice cubes',
    ],
    instructions: [
      'Add ice cubes to a rocks glass',
      'In a shaker, combine bourbon, apple cider, cinnamon syrup, and lemon juice',
      'Shake vigorously for 10-15 seconds',
      'Strain into the prepared glass over ice',
      'Garnish with an apple slice and cinnamon stick',
      'Serve immediately and enjoy!',
    ],
    nutrition: {
      calories: 180,
      carbs: '12g',
      sugar: '10g',
      alcohol: '14% ABV',
    },
    notes: 'For extra warmth, you can gently warm the apple cider before mixing. The cinnamon rim adds a beautiful presentation - just dip the glass rim in simple syrup then cinnamon sugar.',
  },
};

export default function RecipeDetailScreen() {
  const { colors } = useTheme();
  const { measurementSystem } = useLocation();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [notes, setNotes] = useState('');

  // @ts-ignore
  const recipe = recipeData[id];

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text>Recipe not found</Text>
      </SafeAreaView>
    );
  }

  // Convert ingredients based on measurement system
  const convertedIngredients = convertIngredientList(recipe.ingredients, measurementSystem);

  const tabs = [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'nutrition', label: 'Nutrition' },
  ];

  const menuOptions = [
    { id: 'copy', label: 'Copy recipe to text', icon: Copy },
    { id: 'print', label: 'Print recipe', icon: Printer },
    { id: 'edit', label: 'Edit recipe', icon: Edit },
    { id: 'delete', label: 'Delete recipe', icon: Trash2, destructive: true },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surface }]}>
              <Share size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surface }]}>
              <Heart size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowOptionsMenu(!showOptionsMenu)}
            >
              <MoreVertical size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Options Menu */}
        {showOptionsMenu && (
          <View style={[styles.optionsMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => setShowOptionsMenu(false)}
              >
                <option.icon 
                  size={18} 
                  color={option.destructive ? colors.error : colors.text} 
                  strokeWidth={2} 
                />
                <Text style={[
                  styles.optionText, 
                  { color: option.destructive ? colors.error : colors.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.image} />
          
          {/* Cinnamon rim effect for cocktails */}
          {recipe.type === 'cocktail' && (
            <View style={[styles.cinnamonRim, { borderColor: colors.cinnamon }]} />
          )}
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
        </View>

        {/* Recipe Info */}
        <View style={styles.recipeInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
            <View style={[styles.measurementBadge, { backgroundColor: colors.primary + '20' }]}>
              <Globe size={12} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.measurementText, { color: colors.primary }]}>
                {measurementSystem === 'metric' ? 'Metric' : 'Imperial'}
              </Text>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Prep</Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>{recipe.prepTime}m</Text>
            </View>
            <View style={[styles.timeDivider, { backgroundColor: colors.border }]} />
            <View style={styles.timeItem}>
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Cook</Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>{recipe.cookTime}m</Text>
            </View>
            <View style={[styles.timeDivider, { backgroundColor: colors.border }]} />
            <View style={styles.timeItem}>
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>{recipe.totalTime}m</Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {recipe.description}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === tab.id ? colors.primary : colors.textSecondary }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'ingredients' && (
            <View style={styles.section}>
              <View style={styles.ingredientsHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Ingredients
                </Text>
                <Text style={[styles.measurementNote, { color: colors.textSecondary }]}>
                  Converted to {measurementSystem === 'metric' ? 'metric' : 'imperial'} system
                </Text>
              </View>
              {convertedIngredients.map((ingredient, index) => (
                <View key={index} style={[styles.ingredientItem, { borderColor: colors.border }]}>
                  <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.ingredientText, { color: colors.text }]}>
                    {ingredient}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'instructions' && (
            <View style={styles.section}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'nutrition' && (
            <View style={styles.section}>
              <View style={[styles.nutritionGrid, { backgroundColor: colors.surface }]}>
                {Object.entries(recipe.nutrition).map(([key, value]) => (
                  <View key={key} style={styles.nutritionItem}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Text style={[styles.nutritionValue, { color: colors.text }]}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <Text style={[styles.notesTitle, { color: colors.text }]}>Notes</Text>
          <View style={[styles.notesContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.recipeNotes, { color: colors.textSecondary }]}>
              {recipe.notes}
            </Text>
            <TextInput
              style={[styles.notesInput, { color: colors.text }]}
              placeholder="Add your own notes..."
              placeholderTextColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  optionsMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cinnamonRim: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 12,
    borderWidth: 4,
    borderStyle: 'dashed',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  recipeInfo: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    lineHeight: 36,
    flex: 1,
    marginRight: 12,
  },
  measurementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  measurementText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  timeDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  tabsContainer: {
    paddingLeft: 20,
  },
  tabs: {
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  tabContent: {
    padding: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  ingredientsHeader: {
    marginBottom: 8,
  },
  measurementNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ingredientText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    flex: 1,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  nutritionItem: {
    width: '48%',
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  notesSection: {
    padding: 20,
    paddingBottom: 40,
  },
  notesTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  notesContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  recipeNotes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  notesInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});