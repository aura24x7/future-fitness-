import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, Platform, Switch, ViewStyle, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useOnboarding } from '../context/OnboardingContext';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { calculateBMI, calculateBMR, calculateTDEE, calculateRecommendedCalories } from '../utils/profileCalculations';
import { userProfileService } from '../services/userProfileService';
import { Timestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

type Gender = 'MALE' | 'FEMALE' | 'OTHER';
type ValidGender = 'MALE' | 'FEMALE';

// Utility functions
const getValidGender = (gender?: string): 'MALE' | 'FEMALE' => {
  if (!gender || gender === 'OTHER') return 'MALE';
  return gender as 'MALE' | 'FEMALE';
};

const getValidActivityLevel = (level?: string): 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'SUPER_ACTIVE' => {
  if (!level) return 'SEDENTARY';
  return level as 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'SUPER_ACTIVE';
};

const getBMICategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 18.5) return { category: 'Underweight', color: '#3B82F6' };
  if (bmi < 25) return { category: 'Normal', color: '#10B981' };
  if (bmi < 30) return { category: 'Overweight', color: '#F59E0B' };
  return { category: 'Obese', color: '#EF4444' };
};

const getCalorieAdjustmentDescription = (
  fitnessGoal: string | undefined
): { description: string; color: string } => {
  switch (fitnessGoal) {
    case 'LOSE_WEIGHT':
      return { 
        description: '20% calorie deficit for steady weight loss',
        color: '#3B82F6' // blue
      };
    case 'BUILD_MUSCLE':
      return { 
        description: '10% calorie surplus for muscle gain',
        color: '#10B981' // green
      };
    case 'IMPROVE_FITNESS':
    case 'MAINTAIN_HEALTH':
    default:
      return { 
        description: 'Maintenance calories for your activity level',
        color: '#8B5CF6' // purple
      };
  }
};

const formatValue = (value?: number, unit?: string) => {
  if (!value || !unit) return '--';
  return `${value} ${unit}`;
};

const formatGender = (gender?: string) => {
  if (!gender) return '--';
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
};

const formatDate = (date?: string | Date) => {
  if (!date) return 'New Member';
  return `Joined ${new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
};

const formatLifestyle = (lifestyle?: string) => {
  if (!lifestyle) return '--';
  return lifestyle
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatWorkoutType = (workoutType?: string) => {
  if (!workoutType) return '--';
  return workoutType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatDietType = (dietType?: string) => {
  if (!dietType) return '--';
  return dietType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface ProfileStats {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  totalHours: number;
}

interface UserStats {
  workouts: number;
  calories: number;
  hours: number;
}

interface UserProfile {
  email?: string;
  stats?: ProfileStats;
  joinedDate?: string;
  state?: string;
}

interface GlassBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface OnboardingData {
  name?: string;
  height?: { value: number; unit: string };
  weight?: { value: number; unit: string };
  targetWeight?: { value: number; unit: string };
  birthday?: string;
  gender?: Gender;
  lifestyle?: string;
  workoutPreference?: string;
  dietaryPreference?: string;
  weightGoal?: string;
}

const ProfileScreen = () => {
  const { onboardingData, resetOnboarding } = useOnboarding();
  const { profile, loading, syncProfile, refreshProfile } = useProfile();
  const { handleScroll } = useScrollToTabBar();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { logout } = useAuth();
  const AnimatedScrollView = Animated.ScrollView;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize or update profile when component mounts or focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshProfile();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadProfileData();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const userData = useMemo(() => {
    return {
      name: profile?.name || '--',
      lifestyle: formatLifestyle(profile?.activityLevel),
      workoutType: formatWorkoutType(profile?.workoutPreference),
      dietType: formatDietType(profile?.dietaryPreference),
      dailyCalories: profile?.metrics?.recommendedCalories || '--',
    };
  }, [profile]);

  // Calculate BMI
  const bmiData = useMemo(() => {
    if (profile?.height?.value && profile?.weight?.value) {
      const heightUnit = profile.height.unit || 'cm';
      const weightUnit = profile.weight.unit || 'kg';
      const units = heightUnit === 'cm' ? 'metric' : 'imperial';
      
      const bmi = calculateBMI(
        profile.weight.value,
        profile.height.value,
        units
      );
      return { value: bmi, ...getBMICategory(bmi) };
    }
    return null;
  }, [profile?.height, profile?.weight]);

  // Calculate Daily Calories with target weight consideration
  const calorieData = useMemo(() => {
    if (
      profile?.height?.value &&
      profile?.weight?.value &&
      profile?.birthday &&
      profile?.gender &&
      profile?.activityLevel &&
      profile?.weightGoal &&
      profile?.targetWeight?.value
    ) {
      const heightUnit = profile.height.unit || 'cm';
      const weightUnit = profile.weight.unit || 'kg';
      const units = heightUnit === 'cm' ? 'metric' : 'imperial';

      // Calculate age from birthday
      const today = new Date();
      const birthDate = profile.birthday instanceof Timestamp ? 
        profile.birthday.toDate() : 
        new Date(profile.birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Validate gender and activity level before calculations
      const validGender = getValidGender(profile.gender as string);
      const validActivityLevel = getValidActivityLevel(profile.activityLevel || 'SEDENTARY');

      // Calculate BMR using validated gender
      const bmr = calculateBMR(
        profile.weight.value,
        profile.height.value,
        age,
        validGender,
        units
      );

      // Calculate TDEE with validated activity level
      const tdee = calculateTDEE(bmr, validActivityLevel);

      // Calculate weight difference
      const weightDiff = profile.targetWeight.value - profile.weight.value;
      const isWeightLoss = weightDiff < 0;
      const isWeightGain = weightDiff > 0;

      // Adjust calories based on weight goal
      let recommendedCalories = tdee;
      if (isWeightLoss) {
        recommendedCalories = tdee - 500; // 500 calorie deficit for healthy weight loss
      } else if (isWeightGain) {
        recommendedCalories = tdee + 300; // 300 calorie surplus for muscle gain
      }

      return recommendedCalories;
    }
    return null;
  }, [profile]);

  // Calculate user's age
  const userAge = useMemo(() => {
    if (profile?.birthday) {
      const today = new Date();
      const birthDate = profile.birthday instanceof Timestamp ? 
        profile.birthday.toDate() : 
        new Date(profile.birthday);
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return null;
  }, [profile?.birthday]);

  const userStats = useMemo(() => ({
    workouts: 0,
    calories: 0,
    hours: 0
  }), []);

  const calculatedCalories = useMemo(() => {
    if (!onboardingData?.weight?.value || !onboardingData?.height?.value || !onboardingData?.gender || !onboardingData?.birthday) {
      console.log('Missing required data for calorie calculation:', { onboardingData });
      return null;
    }

    // Calculate age from birthday
    const today = new Date();
    const birthDate = new Date(onboardingData.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const bmr = calculateBMR(
      onboardingData.weight.value,
      onboardingData.height.value,
      age,
      (onboardingData.gender as Gender) || 'MALE',
      onboardingData.weight.unit === 'kg' ? 'metric' : 'imperial'
    );

    const tdee = calculateTDEE(bmr, onboardingData.lifestyle || '');
    const calories = calculateRecommendedCalories(tdee, onboardingData.weightGoal || '');
    
    return calories;
  }, [onboardingData]);

  const handleResetOnboarding = async () => {
    try {
      await resetOnboarding();
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    try {
      // Reset onboarding data first
      await resetOnboarding();
      
      // Perform the logout which will clear auth data
      await logout();
      
      // Navigation will be handled by AuthContext's state change
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Logout Error',
        'An error occurred while logging out. Please try again.'
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const GlassBackground: React.FC<GlassBackgroundProps> = ({ children, style }) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView
          tint={isDarkMode ? "dark" : "light"}
          intensity={isDarkMode ? 50 : 30}
          style={[styles.glassBackground, style]}
        >
          {children}
        </BlurView>
      );
    }

    return (
      <View 
        style={[
          styles.glassBackground,
          {
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
          },
          style
        ]}
      >
        {children}
      </View>
    );
  };

  const renderUserInfo = () => (
    <View style={styles.userInfoSection}>
      <Text style={[styles.userName, { color: colors.text }]}>{profile?.name || 'User'}</Text>
      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
        {profile?.email || '@user'}
      </Text>
      <View style={styles.joinedSection}>
        <Ionicons 
          name="calendar-outline" 
          size={14} 
          color={colors.textSecondary} 
        />
        <Text style={[styles.joinedText, { color: colors.textSecondary }]}>
          New Member
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDarkMode ? 
          [colors.primary, '#2d3748', colors.background] :
          [colors.primary, '#818cf8', '#a5b4fc']
        }
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
                <TouchableOpacity style={[
                  styles.editAvatarButton,
                  { backgroundColor: colors.primary }
                ]}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            {renderUserInfo()}
          </View>
        </View>
      </GlassBackground>

      <AnimatedScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View
          style={[
            styles.section,
            styles.glassEffect,
            {
              backgroundColor: isDarkMode ? colors.cardBackground : colors.background,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderWidth: 1,
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="person-outline" size={20} color={colors.primary} /> Basic Information
          </Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Height</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatValue(profile?.height?.value, profile?.height?.unit)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Weight</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatValue(profile?.weight?.value, profile?.weight?.unit)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Target Weight</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatValue(profile?.targetWeight?.value, profile?.targetWeight?.unit)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>BMI</Text>
              <View>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {profile?.metrics?.bmi?.toFixed(1) || '--'}
                </Text>
                {profile?.metrics?.bmi && (
                  <Text style={[styles.bmiCategory, { color: getBMICategory(profile.metrics.bmi).color }]}>
                    {getBMICategory(profile.metrics.bmi).category}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Weight Goal</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatLifestyle(profile?.weightGoal)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Age</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {userAge || '--'} years
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Gender</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatGender(profile?.gender)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Lifestyle</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatLifestyle(profile?.activityLevel)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Diet Type</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDietType(profile?.dietaryPreference)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Workout Type</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatWorkoutType(profile?.workoutPreference)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Daily Calories</Text>
              <View>
                <Text style={[styles.infoValue, { color: colors.text, fontSize: 18, fontWeight: '700' }]}>
                  {profile?.metrics?.recommendedCalories ? 
                    `${profile.metrics.recommendedCalories.toLocaleString()} kcal` : 
                    '--'}
                </Text>
                {profile?.metrics?.recommendedCalories && (
                  <Text style={[styles.calorieDescription, { 
                    color: isDarkMode ? colors.primary : '#6366F1',
                    fontWeight: '600'
                  }]}>
                    {getCalorieAdjustmentDescription(profile.weightGoal).description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.section,
            styles.glassEffect,
            {
              backgroundColor: isDarkMode ? colors.cardBackground : colors.background,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderWidth: 1,
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="settings-outline" size={20} color={colors.primary} /> Settings
          </Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="moon-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleResetOnboarding}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="refresh-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Reset Onboarding</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
              opacity: isLoggingOut ? 0.7 : 1,
            }
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#ef4444" style={{ marginRight: 10 }} />
          ) : (
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          )}
          <Text style={[styles.logoutButtonText, { 
            color: '#ef4444',
            fontWeight: '600'
          }]}>{isLoggingOut ? 'Logging out...' : 'Log Out'}</Text>
        </TouchableOpacity>
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerInner: {
    marginTop: 20,
  },
  profileTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileImageSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
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
  bmiCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  calorieDescription: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    flexWrap: 'wrap',
    maxWidth: width * 0.35,
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
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
  },
  logoutButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  glassBackground: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
      },
      android: {
        elevation: 3,
      },
    }),
  },
  glassContent: {
    padding: 20,
  },
});

export default ProfileScreen;
