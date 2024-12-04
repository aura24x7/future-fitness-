import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { resetOnboarding } = useOnboarding();
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleResetOnboarding = async () => {
    try {
      await resetOnboarding();
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    onPress, 
    value, 
    isSwitch 
  }: { 
    icon: string; 
    title: string; 
    onPress?: () => void; 
    value?: boolean;
    isSwitch?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: theme.colors.cardBackground }
      ]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
        <Text style={[styles.settingItemText, { color: theme.colors.text }]}>
          {title}
        </Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#767577', true: theme.colors.primary }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={24}
          color={theme.colors.secondaryText}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            Appearance
          </Text>
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            onPress={toggleTheme}
            value={isDarkMode}
            isSwitch
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            Account
          </Text>
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() => {}}
          />
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            onPress={() => {}}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            Profile
          </Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleResetOnboarding}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="refresh-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Reset Onboarding</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            Support
          </Text>
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => {}}
          />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  signOutButton: {
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
