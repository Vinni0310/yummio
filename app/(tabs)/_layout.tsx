import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BookOpen, Heart, ShoppingCart, User } from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainer,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size, focused }) => (
            <BookOpen 
              color={color} 
              size={size} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, size, focused }) => (
            <Heart 
              color={color} 
              size={size} 
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
          tabBarIcon: ({ color, size, focused }) => (
            <ShoppingCart 
              color={color} 
              size={size} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <User 
              color={color} 
              size={size} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
    </Tabs>
  );
}