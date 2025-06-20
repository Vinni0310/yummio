import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { router } from 'expo-router';
import { User, Settings, Moon, Sun, Download, Upload, Bell, CircleHelp as HelpCircle, ChevronRight, Mail, Shield, LogOut, Globe, Ruler } from 'lucide-react-native';
import { MaterialCard } from '@/components/MaterialCard';

export default function AccountScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { measurementSystem, setMeasurementSystem } = useLocation();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const settingsOptions = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      type: 'toggle',
      value: true,
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      icon: isDark ? Moon : Sun,
      type: 'toggle',
      value: isDark,
      onToggle: toggleTheme,
    },
    {
      id: 'measurements',
      title: 'Measurement System',
      subtitle: measurementSystem === 'metric' ? 'Metric (kg, ml, °C)' : 'Imperial (lbs, cups, °F)',
      icon: Ruler,
      type: 'toggle',
      value: measurementSystem === 'imperial',
      onToggle: () => setMeasurementSystem(measurementSystem === 'metric' ? 'imperial' : 'metric'),
    },
  ];

  const actionOptions = [
    {
      id: 'backup',
      title: 'Backup Data',
      subtitle: 'Export your recipes and lists',
      icon: Download,
      type: 'action',
    },
    {
      id: 'import',
      title: 'Import Data',
      subtitle: 'Import from file or other apps',
      icon: Upload,
      type: 'action',
    },
  ];

  const supportOptions = [
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      type: 'action',
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: Mail,
      type: 'action',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      type: 'action',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Account</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <MaterialCard variant="elevated" style={styles.profileCard}>
          {user ? (
            <>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
                  <User size={32} color={colors.onPrimaryContainer} strokeWidth={2} />
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.onSurface }]}>
                  {user.name}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>
                  {user.email}
                </Text>
                <View style={[styles.providerBadge, { backgroundColor: colors.secondaryContainer }]}>
                  <Text style={[styles.providerText, { color: colors.onSecondaryContainer }]}>
                    Email Account
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
                <User size={32} color={colors.onPrimaryContainer} strokeWidth={2} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.onSurface }]}>
                  Guest User
                </Text>
                <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>
                  Sign in to sync your recipes
                </Text>
                <TouchableOpacity 
                  style={[styles.signInButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/auth')}
                >
                  <Text style={[styles.signInButtonText, { color: colors.onPrimary }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <TouchableOpacity style={styles.editProfile}>
            <ChevronRight size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
          </TouchableOpacity>
        </MaterialCard>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Settings</Text>
          <MaterialCard variant="elevated">
            {settingsOptions.map((option, index) => (
              <View key={option.id}>
                <View style={styles.optionRow}>
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionIcon, { backgroundColor: colors.primaryContainer }]}>
                      <option.icon size={20} color={colors.onPrimaryContainer} strokeWidth={2} />
                    </View>
                    <View>
                      <Text style={[styles.optionTitle, { color: colors.onSurface }]}>
                        {option.title}
                      </Text>
                      {option.subtitle && (
                        <Text style={[styles.optionSubtitle, { color: colors.onSurfaceVariant }]}>
                          {option.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Switch
                    value={option.value}
                    onValueChange={option.onToggle}
                    trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
                    thumbColor={option.value ? colors.primary : colors.outline}
                  />
                </View>
                {index < settingsOptions.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
                )}
              </View>
            ))}
          </MaterialCard>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Data Management</Text>
          <MaterialCard variant="elevated">
            {actionOptions.map((option, index) => (
              <View key={option.id}>
                <TouchableOpacity style={styles.optionRow}>
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionIcon, { backgroundColor: colors.secondaryContainer }]}>
                      <option.icon size={20} color={colors.onSecondaryContainer} strokeWidth={2} />
                    </View>
                    <View>
                      <Text style={[styles.optionTitle, { color: colors.onSurface }]}>
                        {option.title}
                      </Text>
                      {option.subtitle && (
                        <Text style={[styles.optionSubtitle, { color: colors.onSurfaceVariant }]}>
                          {option.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
                </TouchableOpacity>
                {index < actionOptions.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
                )}
              </View>
            ))}
          </MaterialCard>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Support</Text>
          <MaterialCard variant="elevated">
            {supportOptions.map((option, index) => (
              <View key={option.id}>
                <TouchableOpacity style={styles.optionRow}>
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionIcon, { backgroundColor: colors.tertiaryContainer }]}>
                      <option.icon size={20} color={colors.onTertiaryContainer} strokeWidth={2} />
                    </View>
                    <Text style={[styles.optionTitle, { color: colors.onSurface }]}>
                      {option.title}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
                </TouchableOpacity>
                {index < supportOptions.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
                )}
              </View>
            ))}
          </MaterialCard>
        </View>

        {/* Sign Out Section */}
        {user && (
          <View style={styles.section}>
            <MaterialCard variant="elevated">
              <TouchableOpacity style={styles.optionRow} onPress={handleSignOut}>
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: colors.errorContainer }]}>
                    <LogOut size={20} color={colors.onErrorContainer} strokeWidth={2} />
                  </View>
                  <Text style={[styles.optionTitle, { color: colors.error }]}>
                    Sign Out
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
              </TouchableOpacity>
            </MaterialCard>
          </View>
        )}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.primary }]}>Yummio</Text>
          <Text style={[styles.appVersion, { color: colors.onSurfaceVariant }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appTagline, { color: colors.onSurfaceVariant }]}>
            Save. Cook. Savor.
          </Text>
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
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 32,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  providerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  providerText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  signInButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signInButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  editProfile: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 20,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontStyle: 'italic',
  },
});