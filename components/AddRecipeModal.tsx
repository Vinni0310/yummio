import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { X, Instagram, Camera, Sparkles, Link, CirclePlus as PlusCircle } from 'lucide-react-native';
import { MaterialCard } from './MaterialCard';
import { MaterialButton } from './MaterialButton';

const { height } = Dimensions.get('window');

interface AddRecipeModalProps {
  visible: boolean;
  onClose: () => void;
}

const addOptions = [
  {
    id: 'social',
    title: 'Save from Social Media',
    subtitle: 'Instagram, TikTok, Pinterest',
    icon: Instagram,
    color: '#E1306C',
  },
  {
    id: 'image',
    title: 'Save from Image',
    subtitle: 'Scan recipe from photo',
    icon: Camera,
    color: '#4A90E2',
  },
  {
    id: 'ai',
    title: 'Generate AI Recipe',
    subtitle: 'Create with AI assistance',
    icon: Sparkles,
    color: '#9B59B6',
  },
  {
    id: 'link',
    title: 'Save Recipe Link',
    subtitle: 'From websites and blogs',
    icon: Link,
    color: '#F39C12',
  },
  {
    id: 'manual',
    title: 'Add Recipe Manually',
    subtitle: 'Type in your own recipe',
    icon: PlusCircle,
    color: '#27AE60',
  },
];

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleOptionPress = (optionId: string) => {
    onClose();
    
    switch (optionId) {
      case 'social':
        router.push('/add-recipe?type=social');
        break;
      case 'image':
        router.push('/add-recipe?type=image');
        break;
      case 'ai':
        router.push('/add-recipe?type=ai');
        break;
      case 'link':
        router.push('/add-recipe?type=link');
        break;
      case 'manual':
        router.push('/add-recipe?type=manual');
        break;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.scrim + '80' }]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <MaterialCard
            variant="elevated"
            style={[styles.modal, { backgroundColor: colors.surfaceContainerHigh }]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                Add Recipe
              </Text>
              <TouchableOpacity 
                onPress={onClose} 
                style={[styles.closeButton, { backgroundColor: colors.surfaceContainerHighest }]}
              >
                <X size={24} color={colors.onSurfaceVariant} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.options}>
              {addOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option, 
                    { 
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.outlineVariant,
                    }
                  ]}
                  onPress={() => handleOptionPress(option.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                    <option.icon size={24} color={option.color} strokeWidth={2} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: colors.onSurface }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.onSurfaceVariant }]}>
                      {option.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </MaterialCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: '100%',
    maxHeight: height * 0.8,
    borderRadius: 28,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});