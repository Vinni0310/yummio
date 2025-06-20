import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader } from 'lucide-react-native';
import { YummioLogo } from '@/components/YummioLogo';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function AuthScreen() {
  const { colors } = useTheme();
  const { signIn, signUp, resetPassword, isLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const clearErrors = () => setErrors({});
  const clearForm = () => setFormData({ name: '', email: '', password: '', confirmPassword: '' });

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    clearErrors();
    clearForm();
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (mode !== 'reset') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (mode === 'signup') {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    clearErrors();

    try {
      let result;

      switch (mode) {
        case 'signin':
          result = await signIn(formData.email, formData.password);
          if (result.success) {
            router.replace('/(tabs)');
          } else {
            setErrors({ general: result.error || 'Sign in failed' });
          }
          break;

        case 'signup':
          result = await signUp(formData.name, formData.email, formData.password);
          if (result.success) {
            router.replace('/(tabs)');
          } else {
            setErrors({ general: result.error || 'Sign up failed' });
          }
          break;

        case 'reset':
          result = await resetPassword(formData.email);
          if (result.success) {
            Alert.alert(
              'Password Reset',
              'If an account with this email exists, you will receive password reset instructions.',
              [{ text: 'OK', onPress: () => handleModeChange('signin') }]
            );
          } else {
            setErrors({ general: result.error || 'Password reset failed' });
          }
          break;
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to your account';
      case 'signup': return 'Join the Yummio community';
      case 'reset': return 'Enter your email to reset your password';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'reset': return 'Send Reset Link';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[colors.background, colors.primary + '20']}
          style={styles.gradient}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <YummioLogo size="large" animated={true} interactive={false} />
            </View>

            {/* Auth Form */}
            <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.formHeader}>
                <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {getSubtitle()}
                </Text>
              </View>

              {/* Error Message */}
              {errors.general && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.general}
                  </Text>
                </View>
              )}

              {/* Demo Credentials */}
              {mode === 'signin' && (
                <View style={[styles.demoContainer, { backgroundColor: colors.primary + '10' }]}>
                  <Text style={[styles.demoTitle, { color: colors.primary }]}>Demo Credentials</Text>
                  <Text style={[styles.demoText, { color: colors.textSecondary }]}>
                    Email: demo@yummio.com{'\n'}Password: password123
                  </Text>
                </View>
              )}

              <View style={styles.form}>
                {/* Name Field (Sign Up Only) */}
                {mode === 'signup' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
                    <View style={[
                      styles.inputContainer,
                      { backgroundColor: colors.background, borderColor: errors.name ? colors.error : colors.border }
                    ]}>
                      <User size={20} color={colors.textSecondary} strokeWidth={2} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter your full name"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.name && (
                      <Text style={[styles.fieldError, { color: colors.error }]}>{errors.name}</Text>
                    )}
                  </View>
                )}

                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                  <View style={[
                    styles.inputContainer,
                    { backgroundColor: colors.background, borderColor: errors.email ? colors.error : colors.border }
                  ]}>
                    <Mail size={20} color={colors.textSecondary} strokeWidth={2} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.email}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.email && (
                    <Text style={[styles.fieldError, { color: colors.error }]}>{errors.email}</Text>
                  )}
                </View>

                {/* Password Field (Not for Reset) */}
                {mode !== 'reset' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                    <View style={[
                      styles.inputContainer,
                      { backgroundColor: colors.background, borderColor: errors.password ? colors.error : colors.border }
                    ]}>
                      <Lock size={20} color={colors.textSecondary} strokeWidth={2} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.password}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff size={20} color={colors.textSecondary} strokeWidth={2} />
                        ) : (
                          <Eye size={20} color={colors.textSecondary} strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={[styles.fieldError, { color: colors.error }]}>{errors.password}</Text>
                    )}
                  </View>
                )}

                {/* Confirm Password Field (Sign Up Only) */}
                {mode === 'signup' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                    <View style={[
                      styles.inputContainer,
                      { backgroundColor: colors.background, borderColor: errors.confirmPassword ? colors.error : colors.border }
                    ]}>
                      <Lock size={20} color={colors.textSecondary} strokeWidth={2} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Confirm your password"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? (
                          <EyeOff size={20} color={colors.textSecondary} strokeWidth={2} />
                        ) : (
                          <Eye size={20} color={colors.textSecondary} strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text style={[styles.fieldError, { color: colors.error }]}>{errors.confirmPassword}</Text>
                    )}
                  </View>
                )}

                {/* Forgot Password Link (Sign In Only) */}
                {mode === 'signin' && (
                  <TouchableOpacity 
                    style={styles.forgotPassword}
                    onPress={() => handleModeChange('reset')}
                  >
                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                      Forgot your password?
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader size={20} color="white" strokeWidth={2} />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>{getButtonText()}</Text>
                      <ArrowRight size={20} color="white" strokeWidth={2} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Mode Switch */}
                <View style={styles.modeSwitch}>
                  {mode === 'signin' && (
                    <Text style={[styles.modeSwitchText, { color: colors.textSecondary }]}>
                      Don't have an account?{' '}
                      <Text 
                        style={[styles.modeSwitchLink, { color: colors.primary }]}
                        onPress={() => handleModeChange('signup')}
                      >
                        Sign up
                      </Text>
                    </Text>
                  )}
                  
                  {mode === 'signup' && (
                    <Text style={[styles.modeSwitchText, { color: colors.textSecondary }]}>
                      Already have an account?{' '}
                      <Text 
                        style={[styles.modeSwitchLink, { color: colors.primary }]}
                        onPress={() => handleModeChange('signin')}
                      >
                        Sign in
                      </Text>
                    </Text>
                  )}
                  
                  {mode === 'reset' && (
                    <Text style={[styles.modeSwitchText, { color: colors.textSecondary }]}>
                      Remember your password?{' '}
                      <Text 
                        style={[styles.modeSwitchLink, { color: colors.primary }]}
                        onPress={() => handleModeChange('signin')}
                      >
                        Sign in
                      </Text>
                    </Text>
                  )}
                </View>

                {/* Guest Access */}
                <TouchableOpacity
                  style={[styles.guestButton, { borderColor: colors.border }]}
                  onPress={() => router.replace('/(tabs)')}
                  disabled={isLoading}
                >
                  <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>
                    Continue as Guest
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  formContainer: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  demoContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  fieldError: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  modeSwitch: {
    alignItems: 'center',
    marginTop: 8,
  },
  modeSwitchText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  modeSwitchLink: {
    fontFamily: 'Inter-SemiBold',
  },
  guestButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 12,
  },
  guestButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});