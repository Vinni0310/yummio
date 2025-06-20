import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Link,
  Camera,
  Upload,
  Sparkles,
  Loader,
} from 'lucide-react-native';

export default function AddRecipeScreen() {
  const { colors } = useTheme();
  const { type } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const getTitle = () => {
    switch (type) {
      case 'social':
        return 'Save from Social Media';
      case 'image':
        return 'Save from Image';
      case 'ai':
        return 'Generate AI Recipe';
      case 'link':
        return 'Save Recipe Link';
      case 'manual':
        return 'Add Recipe Manually';
      default:
        return 'Add Recipe';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'social':
        return Link;
      case 'image':
        return Camera;
      case 'ai':
        return Sparkles;
      case 'link':
        return Link;
      case 'manual':
        return Upload;
      default:
        return Upload;
    }
  };

  const handleExtractRecipe = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to a sample AI-generated recipe
      router.replace('/recipe/1');
    }, 2000);
  };

  const IconComponent = getIcon();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.primary + '10']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <IconComponent size={48} color={colors.primary} strokeWidth={1.5} />
          </View>
        </View>

        {type === 'social' && (
          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Social Media URL
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Paste a link from Instagram, TikTok, Pinterest, or other platforms
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="https://instagram.com/p/..."
              placeholderTextColor={colors.textSecondary}
              value={linkUrl}
              onChangeText={setLinkUrl}
              multiline
            />

            <TouchableOpacity
              style={[styles.extractButton, { 
                backgroundColor: linkUrl.trim() ? colors.primary : colors.border 
              }]}
              onPress={handleExtractRecipe}
              disabled={!linkUrl.trim() || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Loader size={20} color="white" strokeWidth={2} />
                  <Text style={styles.buttonText}>Extracting Recipe...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Extract Recipe</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {type === 'image' && (
          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Upload Recipe Image
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Take a photo or upload an image of a recipe to extract the ingredients and instructions
            </Text>
            
            <TouchableOpacity style={[styles.uploadArea, { 
              backgroundColor: colors.surface, 
              borderColor: colors.border 
            }]}>
              <Camera size={48} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.uploadText, { color: colors.text }]}>
                Tap to take photo or upload image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.extractButton, { backgroundColor: colors.border }]}
              disabled
            >
              <Text style={styles.buttonText}>Scan Recipe</Text>
            </TouchableOpacity>
          </View>
        )}

        {type === 'ai' && (
          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              AI Recipe Generator
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Describe what you'd like to cook and our AI will create a recipe for you
            </Text>
            
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="I want to make a chocolate cake for my birthday party that serves 8 people..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.extractButton, { backgroundColor: colors.primary }]}
              onPress={handleExtractRecipe}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Loader size={20} color="white" strokeWidth={2} />
                  <Text style={styles.buttonText}>Generating Recipe...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Generate Recipe</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {type === 'link' && (
          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Recipe Website URL
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Paste a link from recipe websites, blogs, or cooking platforms
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="https://example.com/recipe/..."
              placeholderTextColor={colors.textSecondary}
              value={linkUrl}
              onChangeText={setLinkUrl}
            />

            <TouchableOpacity
              style={[styles.extractButton, { 
                backgroundColor: linkUrl.trim() ? colors.primary : colors.border 
              }]}
              onPress={handleExtractRecipe}
              disabled={!linkUrl.trim() || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Loader size={20} color="white" strokeWidth={2} />
                  <Text style={styles.buttonText}>Importing Recipe...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Import Recipe</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textArea: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  uploadArea: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 16,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  extractButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});