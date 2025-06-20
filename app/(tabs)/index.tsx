import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import {
  Search, Filter, Plus, BookOpen, Sun, Moon
} from 'lucide-react-native';
import { RecipeCard } from '@/components/RecipeCard';
import { AddRecipeModal } from '@/components/AddRecipeModal';
import { YummioLogo } from '@/components/YummioLogo';
import { MaterialCard } from '@/components/MaterialCard';
import { MaterialFAB } from '@/components/MaterialFAB';
import { MaterialChip } from '@/components/MaterialChip';

const { width } = Dimensions.get('window');

// ✅ Type definition for recipes
type Recipe = {
  id: string;
  title: string;
  image: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  type: 'food' | 'cocktail' | 'drinks' | 'breakfast' | 'lunch' | 'desserts';
  collection: string;
};

// ✅ Recipes with proper type
const recipes: Recipe[] = [
  {
    id: '1',
    title: 'Cinnamon Apple Pie Cocktail',
    image: 'https://images.pexels.com/photos/1268558/pexels-photo-1268558.jpeg',
    prepTime: 5,
    cookTime: 0,
    totalTime: 5,
    difficulty: 'Easy',
    rating: 4.8,
    type: 'drinks',
    collection: 'Drinks & Cocktails',
  },
  {
    id: '2',
    title: 'Fluffy Pancakes',
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    difficulty: 'Easy',
    rating: 4.9,
    type: 'food',
    collection: 'Breakfast',
  },
  {
    id: '3',
    title: 'Chocolate Chip Cookies',
    image: 'https://images.pexels.com/photos/890577/pexels-photo-890577.jpeg',
    prepTime: 15,
    cookTime: 12,
    totalTime: 27,
    difficulty: 'Medium',
    rating: 4.7,
    type: 'food',
    collection: 'Desserts',
  },
  {
    id: '4',
    title: 'Avocado Toast',
    image: 'https://images.pexels.com/photos/573285/pexels-photo-573285.jpeg',
    prepTime: 10,
    cookTime: 5,
    totalTime: 15,
    difficulty: 'Easy',
    rating: 4.6,
    type: 'breakfast',
    collection: 'Breakfast',
  }
];

const filterCategories = [
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' },
];

export default function RecipesScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleLogoPress = () => {
    console.log('Yummio logo pressed! 🍳');
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || recipe.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Theme Toggle Button */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.themeToggle,
          {
            backgroundColor: colors.surfaceContainerHigh,
            shadowColor: colors.shadow,
          },
        ]}
        accessibilityLabel="Toggle theme"
      >
        {isDark ? (
          <Sun size={20} color={colors.onSurfaceVariant} />
        ) : (
          <Moon size={20} color={colors.onSurfaceVariant} />
        )}
      </TouchableOpacity>

      {/* Header with Material Design 3 styling */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <YummioLogo
              size="medium"
              animated={true}
              interactive={true}
              onPress={handleLogoPress}
            />
          </View>

          {/* Search Bar with Material Design 3 styling */}
          <MaterialCard variant="outlined" style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
              <TextInput
                style={[styles.searchInput, { color: colors.onSurface }]}
                placeholder="Search recipes..."
                placeholderTextColor={colors.onSurfaceVariant}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.filterButton}>
                <Filter size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </MaterialCard>

          {/* Filter Chips */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filterCategories.map((category) => (
              <MaterialChip
                key={category.id}
                label={category.label}
                variant="filter"
                selected={selectedFilter === category.id}
                onPress={() => setSelectedFilter(category.id)}
                style={styles.filterChip}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredRecipes.length === 0 ? (
          <MaterialCard variant="filled" style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceContainerHighest }]}>
              <BookOpen size={48} color={colors.onSurfaceVariant} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
              {searchQuery || selectedFilter !== 'all' ? 'No recipes found' : 'No recipes yet'}
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.onSurfaceVariant }]}>
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Tap the + button to start adding your favorite recipes'
              }
            </Text>
          </MaterialCard>
        ) : (
          <View style={styles.recipesGrid}>
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Material Design 3 FAB */}
      <MaterialFAB
        onPress={() => setShowAddModal(true)}
        icon={<Plus size={24} color={colors.onPrimaryContainer} strokeWidth={2} />}
        style={styles.fab}
      />

      <AddRecipeModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 50,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    padding: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: { 
    paddingBottom: 16,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerContent: { 
    paddingHorizontal: 20, 
    paddingTop: 10,
    gap: 16,
  },
  titleContainer: { 
    marginBottom: 8, 
    alignItems: 'center' 
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    padding: 4,
  },
  filtersContainer: {
    marginHorizontal: -20,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    marginRight: 0,
  },
  content: { 
    flex: 1 
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  recipesGrid: {
    gap: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
  },
});