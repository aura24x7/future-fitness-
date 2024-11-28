import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useOnboarding } from '../context/OnboardingContext';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { onboardingData } = useOnboarding();
  const { handleScroll } = useScrollToTabBar();
  const AnimatedScrollView = Animated.ScrollView;
  
  const userStats = {
    workouts: 45,
    calories: 12500,
    hours: 28,
  };

  const GlassBackground = ({ children, style }) => {
    return Platform.OS === 'ios' ? (
      <BlurView
        tint="default"
        intensity={30}
        style={[styles.glassBackground, style]}
      >
        <View style={styles.glassContent}>
          {children}
        </View>
      </BlurView>
    ) : (
      <View style={[styles.glassBackgroundAndroid, style]}>
        <View style={styles.glassContent}>
          {children}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#818cf8', '#a5b4fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      <GlassBackground style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.profileTopSection}>
            <View style={styles.profileImageSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/100' }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.editProfileGradient}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfoSection}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>@johndoe</Text>
            <View style={styles.joinedSection}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.joinedText}>Joined December 2023</Text>
            </View>
          </View>
        </View>
      </GlassBackground>

      <AnimatedScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={[styles.section, styles.glassEffect]}
        >
          <Text style={styles.sectionTitle}>
            <Ionicons name="body-outline" size={20} color="#6366f1" /> Basic Information
          </Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>
                {onboardingData.height?.value || 175} cm
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {onboardingData.weight?.value || 70} kg
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Goal</Text>
              <Text style={styles.infoValue}>
                {onboardingData.fitnessGoal?.replace(/_/g, ' ').toLowerCase() || 'Weight Loss'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Activity Level</Text>
              <Text style={styles.infoValue}>
                {onboardingData.activityLevel?.toLowerCase() || 'Moderate'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={[styles.statCard, styles.glassEffect]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="fitness-outline" size={24} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>{userStats.workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={[styles.statCard, styles.glassEffect]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="flame-outline" size={24} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>{userStats.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={[styles.statCard, styles.glassEffect]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={24} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>{userStats.hours}h</Text>
            <Text style={styles.statLabel}>Time</Text>
          </LinearGradient>
        </View>

        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={[styles.section, styles.glassEffect]}
        >
          <Text style={styles.sectionTitle}>
            <Ionicons name="settings-outline" size={20} color="#6366f1" /> Settings
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="person-outline" size={24} color="#6366f1" />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="notifications-outline" size={24} color="#6366f1" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="lock-closed-outline" size={24} color="#6366f1" />
              <Text style={styles.menuItemText}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '40%',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
  },
  headerInner: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  glassBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassBackgroundAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  glassContent: {
    backgroundColor: 'transparent',
  },
  profileTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileImageSection: {
    position: 'relative',
  },
  avatarContainer: {
    padding: 2,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  editProfileButton: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editProfileGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userInfoSection: {
    marginTop: 8,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  joinedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinedText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.1,
  },
  content: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  glassEffect: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  infoItem: {
    width: '50%',
    padding: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ProfileScreen;
