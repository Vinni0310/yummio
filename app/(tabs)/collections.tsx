import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { Plus, Wine, Coffee, Utensils, Cookie, Cake } from 'lucide-react-native';
import { MaterialCard } from '@/components/MaterialCard';
import { MaterialFAB } from '@/components/MaterialFAB';

const defaultCollections = [
  {
    id: '1',
    name: 'Drinks & Cocktails',
    icon: Wine,
    count: 12,
    image: 'https://images.pexels.com/photos/1268558/pexels-photo-1268558.jpeg',
    color: '#C73E1D',
  },
  {
    id: '2',
    name: 'Breakfast',
    icon: Coffee,
    count: 8,
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
    color: '#F7DC6F',
  },
  {
    id: '3',
    name: 'Lunch',
    icon: Utensils,
    count: 15,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    color: '#52C41A',
  },
  {
    id: '4',
    name: 'Snacks',
    icon: Cookie,
    count: 6,
    image: 'https://images.pexels.com/photos/890577/pexels-photo-890577.jpeg',
    color: '#FAAD14',
  },
  {
    id: '5',
    name: 'Desserts',
    icon: Cake,
    count: 10,
    image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    color: '#D2691E',
  },
];

export default function CollectionsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Collections</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Organize your favorite recipes
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Create New Collection Card */}
        <MaterialCard variant="outlined" style={styles.createCard}>
          <TouchableOpacity style={styles.createCardContent}>
            <View style={[styles.createIcon, { backgroundColor: colors.primaryContainer }]}>
              <Plus size={24} color={colors.onPrimaryContainer} strokeWidth={2} />
            </View>
            <Text style={[styles.createText, { color: colors.onSurface }]}>
              Create New Collection
            </Text>
          </TouchableOpacity>
        </MaterialCard>

        {/* Collections Grid */}
        <View style={styles.collectionsGrid}>
          {defaultCollections.map((collection) => (
            <MaterialCard key={collection.id} variant="elevated" style={styles.collectionCard}>
              <TouchableOpacity>
                <View style={styles.collectionImageContainer}>
                  <Image source={{ uri: collection.image }} style={styles.collectionImage} />
                  <LinearGradient
                    colors={['transparent', collection.color + '80']}
                    style={styles.imageOverlay}
                  />
                  <View style={[styles.collectionIcon, { backgroundColor: collection.color }]}>
                    <collection.icon size={20} color="white" strokeWidth={2} />
                  </View>
                </View>
                
                <View style={styles.collectionInfo}>
                  <Text style={[styles.collectionName, { color: colors.onSurface }]}>
                    {collection.name}
                  </Text>
                  <Text style={[styles.collectionCount, { color: colors.onSurfaceVariant }]}>
                    {collection.count} recipes
                  </Text>
                </View>
              </TouchableOpacity>
            </MaterialCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  createCard: {
    marginBottom: 24,
  },
  createCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  collectionsGrid: {
    gap: 16,
  },
  collectionCard: {
    overflow: 'hidden',
  },
  collectionImageContainer: {
    height: 120,
    position: 'relative',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  collectionIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionInfo: {
    padding: 16,
  },
  collectionName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});