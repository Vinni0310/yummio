import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  isDark: boolean;
  colors: {
    // Material Design 3 Color Tokens
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    error: string;
    onError: string;
    errorContainer: string;
    onErrorContainer: string;
    background: string;
    onBackground: string;
    surface: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
    shadow: string;
    scrim: string;
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
    surfaceDim: string;
    surfaceBright: string;
    surfaceContainerLowest: string;
    surfaceContainerLow: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    surfaceContainerHighest: string;
    
    // Legacy colors for backward compatibility
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    cinnamon: string;
    apple: string;
    butter: string;
    mint: string;
    success: string;
    warning: string;
  };
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Material Design 3 Light Theme - Food & Recipe Focused
  const lightColors = {
    // Primary - Warm Orange (cooking/warmth)
    primary: '#D97706',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFEDD5',
    onPrimaryContainer: '#7C2D12',
    
    // Secondary - Sage Green (fresh herbs)
    secondary: '#84CC16',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F0FDF4',
    onSecondaryContainer: '#365314',
    
    // Tertiary - Warm Red (tomatoes/spices)
    tertiary: '#DC2626',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FEE2E2',
    onTertiaryContainer: '#7F1D1D',
    
    // Error
    error: '#B91C1C',
    onError: '#FFFFFF',
    errorContainer: '#FECACA',
    onErrorContainer: '#7F1D1D',
    
    // Neutral
    background: '#FFFBF7',
    onBackground: '#1C1B1F',
    surface: '#FFFFFF',
    onSurface: '#1C1B1F',
    surfaceVariant: '#F5F5F4',
    onSurfaceVariant: '#44403C',
    outline: '#78716C',
    outlineVariant: '#D6D3D1',
    
    // Surface containers
    surfaceDim: '#DDD7D0',
    surfaceBright: '#FFFBF7',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F9F7F4',
    surfaceContainer: '#F3F1EE',
    surfaceContainerHigh: '#EDE9E6',
    surfaceContainerHighest: '#E7E3E0',
    
    // Inverse
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#FFB366',
    
    // System
    shadow: '#000000',
    scrim: '#000000',
    
    // Legacy compatibility
    text: '#1C1B1F',
    textSecondary: '#44403C',
    border: '#D6D3D1',
    accent: '#DC2626',
    cinnamon: '#92400E',
    apple: '#84CC16',
    butter: '#FCD34D',
    mint: '#10B981',
    success: '#16A34A',
    warning: '#D97706',
  };

  // Material Design 3 Dark Theme
  const darkColors = {
    // Primary
    primary: '#FFB366',
    onPrimary: '#7C2D12',
    primaryContainer: '#9A3412',
    onPrimaryContainer: '#FFEDD5',
    
    // Secondary
    secondary: '#A3E635',
    onSecondary: '#365314',
    secondaryContainer: '#4D7C0F',
    onSecondaryContainer: '#F0FDF4',
    
    // Tertiary
    tertiary: '#F87171',
    onTertiary: '#7F1D1D',
    tertiaryContainer: '#991B1B',
    onTertiaryContainer: '#FEE2E2',
    
    // Error
    error: '#F87171',
    onError: '#7F1D1D',
    errorContainer: '#991B1B',
    onErrorContainer: '#FECACA',
    
    // Neutral
    background: '#141218',
    onBackground: '#E6E1E5',
    surface: '#1C1B1F',
    onSurface: '#E6E1E5',
    surfaceVariant: '#292524',
    onSurfaceVariant: '#A8A29E',
    outline: '#78716C',
    outlineVariant: '#44403C',
    
    // Surface containers
    surfaceDim: '#141218',
    surfaceBright: '#3B383E',
    surfaceContainerLowest: '#0F0D13',
    surfaceContainerLow: '#1C1B1F',
    surfaceContainer: '#201F23',
    surfaceContainerHigh: '#2B292D',
    surfaceContainerHighest: '#363438',
    
    // Inverse
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#313033',
    inversePrimary: '#D97706',
    
    // System
    shadow: '#000000',
    scrim: '#000000',
    
    // Legacy compatibility
    text: '#E6E1E5',
    textSecondary: '#A8A29E',
    border: '#44403C',
    accent: '#F87171',
    cinnamon: '#F59E0B',
    apple: '#A3E635',
    butter: '#FACC15',
    mint: '#34D399',
    success: '#4ADE80',
    warning: '#FBBF24',
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    isDark,
    colors: isDark ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};