import React, { useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useOnboarding } from '../context/OnboardingContext';
import { useProfile } from '../context/ProfileContext';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { calculateBMI, calculateBMR, calculateTDEE, calculateRecommendedCalories } from '../utils/profileCalculations';
import { userProfileService } from '../services/userProfileService';

const { width } = Dimensions.get('window');

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

const ProfileScreen = () => {
  const { onboardingData } = useOnboarding();
  const { profile, loading } = useProfile();
  const { handleScroll } = useScrollToTabBar();
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const AnimatedScrollView = Animated.ScrollView;

  // Initialize or update profile when onboarding data changes
  useEffect(() => {
    const syncProfileWithOnboarding = async () => {
      try {
        if (onboardingData) {
          // Try to get existing profile
          const existingProfile = await userProfileService.getProfile();
          
          if (!existingProfile) {
            // If no profile exists, create one
            await userProfileService.createUserProfile(onboardingData);
          } else {
            // If profile exists, update it
            await userProfileService.updateProfile({
              activityLevel: onboardingData.lifestyle,
              workoutPreference: onboardingData.workoutPreference,
              dietaryPreference: onboardingData.dietaryPreference,
            });
          }
        }
      } catch (error) {
        console.error('Error syncing profile:', error);
      }
    };

    syncProfileWithOnboarding();
  }, [onboardingData]);

  const formatLifestyle = (lifestyle: string) => {
    if (!lifestyle) return '--';
    return lifestyle
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatWorkoutType = (workoutType: string) => {
    if (!workoutType) return '--';
    return workoutType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDietType = (dietType: string) => {
    if (!dietType) return '--';
    return dietType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const calculateDailyCalories = (onboardingData: any) => {
    if (
      onboardingData.height?.value &&
      onboardingData.weight?.value &&
      onboardingData.birthday &&
      onboardingData.gender &&
      onboardingData.lifestyle &&
      onboardingData.weightGoal &&
      onboardingData.targetWeight?.value
    ) {
      const heightUnit = onboardingData.height.unit || 'cm';
      const weightUnit = onboardingData.weight.unit || 'kg';
      const units = heightUnit === 'cm' ? 'metric' : 'imperial';

      // Calculate age from birthday
      const today = new Date();
      const birthDate = new Date(onboardingData.birthday);
      const age = today.getFullYear() - birthDate.getFullYear();

      // Calculate BMR
      const bmr = calculateBMR(
        onboardingData.weight.value,
        onboardingData.height.value,
        age,
        onboardingData.gender,
        units
      );

      // Calculate TDEE
      const tdee = calculateTDEE(bmr, onboardingData.lifestyle);

      // Calculate weight difference
      const weightDiff = onboardingData.targetWeight.value - onboardingData.weight.value;
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
  };

  const userData = useMemo(() => {
    return {
      name: onboardingData?.name || '--',
      lifestyle: formatLifestyle(onboardingData?.lifestyle),
      workoutType: formatWorkoutType(onboardingData?.workoutPreference),
      dietType: formatDietType(onboardingData?.dietaryPreference),
      dailyCalories: calculateDailyCalories(onboardingData),
    };
  }, [onboardingData]);

  // Calculate BMI
  const bmiData = useMemo(() => {
    if (onboardingData.height?.value && onboardingData.weight?.value) {
      const heightUnit = onboardingData.height.unit || 'cm';
      const weightUnit = onboardingData.weight.unit || 'kg';
      const units = heightUnit === 'cm' ? 'metric' : 'imperial';
      
      const bmi = calculateBMI(
        onboardingData.weight.value,
        onboardingData.height.value,
        units
      );
      return { value: bmi, ...getBMICategory(bmi) };
    }
    return null;
  }, [onboardingData.height, onboardingData.weight]);

  // Calculate Daily Calories with target weight consideration
  const calorieData = useMemo(() => {
    if (
      onboardingData.height?.value &&
      onboardingData.weight?.value &&
      onboardingData.birthday &&
      onboardingData.gender &&
      onboardingData.lifestyle &&
      onboardingData.weightGoal &&
      onboardingData.targetWeight?.value
    ) {
      const heightUnit = onboardingData.height.unit || 'cm';
      const weightUnit = onboardingData.weight.unit || 'kg';
      const units = heightUnit === 'cm' ? 'metric' : 'imperial';

      // Calculate age from birthday
      const today = new Date();
      const birthDate = new Date(onboardingData.birthday);
      const age = today.getFullYear() - birthDate.getFullYear();

      // Calculate BMR
      const bmr = calculateBMR(
        onboardingData.weight.value,
        onboardingData.height.value,
        age,
        onboardingData.gender,
        units
      );

      // Calculate TDEE
      const tdee = calculateTDEE(bmr, onboardingData.lifestyle);

      // Calculate weight difference
      const weightDiff = onboardingData.targetWeight.value - onboardingData.weight.value;
      const isWeightLoss = weightDiff < 0;
      const isWeightGain = weightDiff > 0;

      // Adjust calories based on weight goal
      let recommendedCalories = tdee;
      if (isWeightLoss) {
        recommendedCalories = tdee - 500; // 500 calorie deficit for healthy weight loss
      } else if (isWeightGain) {
        recommendedCalories = tdee + 300; // 300 calorie surplus for muscle gain
      }

      const adjustment = getCalorieAdjustmentDescription(onboardingData.weightGoal);

      return {
        bmr,
        tdee,
        recommendedCalories,
        ...adjustment
      };
    }
    return null;
  }, [onboardingData]);

  // Calculate user's age
  const userAge = useMemo(() => {
    if (onboardingData.birthday) {
      const today = new Date();
      const birthDate = new Date(onboardingData.birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return null;
  }, [onboardingData.birthday]);

  const userStats = {
    workouts: profile?.stats?.totalWorkouts || 0,
    calories: profile?.stats?.totalCaloriesBurned || 0,
    hours: profile?.stats?.totalHours || 0,
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

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

    console.log('Calculated age:', age);

    const bmr = calculateBMR(
      onboardingData.weight.value,
      onboardingData.height.value,
      age,
      onboardingData.gender,
      onboardingData.weight.unit === 'kg' ? 'metric' : 'imperial'
    );

    console.log('BMR calculated:', bmr);
    console.log('Lifestyle:', onboardingData.lifestyle);

    const tdee = calculateTDEE(bmr, onboardingData.lifestyle);
    console.log('TDEE calculated:', tdee);
    console.log('Weight Goal:', onboardingData.weightGoal);

    const calories = calculateRecommendedCalories(tdee, onboardingData.weightGoal);
    console.log('Final calories calculated:', calories);
    
    return calories;
  }, [onboardingData]);

  const GlassBackground = ({ children, style }) => {
    return Platform.OS === 'ios' ? (
      <BlurView
        tint={isDarkMode ? "dark" : "light"}
        intensity={isDarkMode ? 50 : 30}
        style={[styles.glassBackground, style]}
      >
        <View style={[styles.glassContent, { backgroundColor: 'transparent' }]}>
          {children}
        </View>
      </BlurView>
    ) : (
      <View style={[
        styles.glassBackgroundAndroid,
        { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' },
        style
      ]}>
        <View style={[styles.glassContent, { backgroundColor: 'transparent' }]}>
          {children}
        </View>
      </View>
    );
  };

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
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.editProfileButton}>
                <LinearGradient
                  colors={isDarkMode ? 
                    ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] :
                    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.15)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.editProfileGradient}
                >
                  <Text style={[styles.editProfileText, { color: colors.text }]}>
                    Edit Profile
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={handleSettingsPress}
              >
                <LinearGradient
                  colors={isDarkMode ? 
                    ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] :
                    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.15)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.settingsGradient}
                >
                  <Ionicons 
                    name="settings-outline" 
                    size={20} 
                    color={colors.text} 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.userInfoSection}>
            <Text style={[styles.userName, { color: colors.text }]}>{onboardingData.name || 'User'}</Text>
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
                {profile?.joinedDate ? `Joined ${new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'New Member'}
              </Text>
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
          colors={isDarkMode ? 
            ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)'] :
            ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
          }
          style={[styles.section, styles.glassEffect]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="body-outline" size={20} color={colors.primary} /> Basic Information
          </Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Height</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {onboardingData.height?.value || '--'} {onboardingData.height?.unit || 'cm'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Weight</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {onboardingData.weight?.value || '--'} {onboardingData.weight?.unit || 'kg'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Target Weight</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {onboardingData.targetWeight?.value || '--'} {onboardingData.targetWeight?.unit || 'kg'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>BMI</Text>
              <View>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {bmiData?.value?.toFixed(1) || '--'}
                </Text>
                {bmiData && (
                  <Text style={[styles.bmiCategory, { color: bmiData.color }]}>
                    {bmiData.category}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Weight Goal</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {onboardingData.weightGoal?.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ') || '--'}
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
                {onboardingData.gender?.charAt(0).toUpperCase() + 
                 onboardingData.gender?.slice(1).toLowerCase() || '--'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Lifestyle</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {userData.lifestyle}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Diet Type</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {userData.dietType}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Workout Type</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {userData.workoutType}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Daily Calories</Text>
              <View>
                <Text style={styles.infoValue}>
                  {calculatedCalories ? `${calculatedCalories.toLocaleString()} kcal` : '--'}
                </Text>
                {calculatedCalories && (
                  <Text style={[styles.calorieDescription, { color: colors.primary }]}>
                    {onboardingData?.weightGoal === 'LOSE_WEIGHT' ? '20% calorie deficit' :
                     onboardingData?.weightGoal === 'GAIN_WEIGHT' ? '10% calorie surplus' :
                     'Maintenance calories'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <LinearGradient
            colors={isDarkMode ? 
              ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)'] :
              ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
            }
            style={[styles.statCard, styles.glassEffect]}
          >
            <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)' }]}>
              <Ionicons name="body-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{userData.lifestyle}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lifestyle</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={isDarkMode ? 
              ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)'] :
              ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
            }
            style={[styles.statCard, styles.glassEffect]}
          >
            <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)' }]}>
              <Ionicons name="barbell-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{userData.workoutType}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Workout Type</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={isDarkMode ? 
              ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)'] :
              ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
            }
            style={[styles.statCard, styles.glassEffect]}
          >
            <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)' }]}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{userStats.hours}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hours</Text>
          </LinearGradient>
        </View>

        <LinearGradient
          colors={isDarkMode ? 
            ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)'] :
            ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
          }
          style={[styles.section, styles.glassEffect]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="settings-outline" size={20} color={colors.primary} /> Settings
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.logoutButtonText, { color: colors.text }]}>Log Out</Text>
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
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editProfileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  editProfileGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingsGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
