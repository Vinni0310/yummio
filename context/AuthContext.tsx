import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user database - in a real app, this would be handled by your backend
const MOCK_USERS = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@yummio.com',
    password: 'password123',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
  {
    id: '2',
    name: 'Chef Sarah',
    email: 'sarah@yummio.com',
    password: 'chef2024',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user session on app start
  useEffect(() => {
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Please fill in all fields' };
      }

      if (!validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials against mock database
      const foundUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' };
      }

      const userData: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        avatar: foundUser.avatar,
      };

      // Store user session
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An error occurred during sign in' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Validate input
      if (!name || !email || !password) {
        return { success: false, error: 'Please fill in all fields' };
      }

      if (!validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (!validatePassword(password)) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase(),
        avatar: `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`,
      };

      // In a real app, you would send this to your backend
      // For demo purposes, we'll just add to our mock database
      MOCK_USERS.push({
        ...newUser,
        password,
      });

      // Store user session
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An error occurred during sign up' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email) {
        return { success: false, error: 'Please enter your email address' };
      }

      if (!validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists
      const foundUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!foundUser) {
        return { success: false, error: 'No account found with this email address' };
      }

      // In a real app, you would send a password reset email
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An error occurred while resetting password' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};