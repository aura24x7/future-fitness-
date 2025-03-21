import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomTaskbar = () => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleWorkoutsPress = () => {
    Alert.alert(
      "Coming Soon!",
      "The workouts feature will be available in future updates."
    );
  };

  const handleFoodLogPress = () => {
    Alert.alert(
      "Coming Soon!",
      "The food log feature will be available in future updates."
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('ProfileGroups')}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconWrapper, {
            backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#22C55E20',
          }]}>
            <Ionicons
              name="people"
              size={24}
              color="#22C55E"
            />
          </View>
          <Text style={[styles.label, { 
            color: colors.text,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 4
          }]}>Social</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={handleFoodLogPress}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconWrapper, {
            backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : '#6366F120',
          }]}>
            <Ionicons
              name="restaurant-outline"
              size={24}
              color="#6366F1"
            />
          </View>
          <Text style={[styles.label, { 
            color: colors.text,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 4
          }]}>Food Log</Text>
        </View>
      </TouchableOpacity>

      {/* Center Plus Button */}
      <TouchableOpacity
        style={[styles.centerButton, {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        }]}
        onPress={() => navigation.navigate('FoodTextInput')}
      >
        <LinearGradient
          colors={isDarkMode ? 
            ['#818CF8', '#6366F1'] : 
            ['#6366F1', '#4F46E5']
          }
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('Analytics')}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconWrapper, {
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#EF444420',
          }]}>
            <Ionicons
              name="stats-chart"
              size={24}
              color="#EF4444"
            />
          </View>
          <Text style={[styles.label, { 
            color: colors.text,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 4
          }]}>Progress</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={handleWorkoutsPress}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconWrapper, {
            backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#F59E0B20',
          }]}>
            <Ionicons
              name="barbell-outline"
              size={24}
              color="#F59E0B"
            />
          </View>
          <Text style={[styles.label, { 
            color: colors.text,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 4
          }]}>Workouts</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    width: width,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default BottomTaskbar;
