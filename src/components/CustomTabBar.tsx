import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FoodScannerIcon from './FoodScannerIcon';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <BlurView intensity={80} tint="light" style={styles.container}>
      <View style={styles.content}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = isFocused ? 'home' : 'home-outline';
              break;
            case 'Food':
              iconName = isFocused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Workout':
              iconName = isFocused ? 'fitness' : 'fitness-outline';
              break;
            case 'Progress':
              iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = isFocused ? 'person' : 'person-outline';
              break;
            case 'FoodScanner':
              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={[styles.tabButton, isFocused && styles.focusedTab]}
                >
                  <FoodScannerIcon
                    focused={isFocused}
                    color={isFocused ? '#007AFF' : '#8E8E93'}
                    size={24}
                  />
                  <Text style={[
                    styles.label,
                    isFocused ? styles.focusedLabel : styles.unfocusedLabel,
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            default:
              iconName = 'help-outline';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabButton, isFocused && styles.focusedTab]}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? '#007AFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.label,
                  isFocused ? styles.focusedLabel : styles.unfocusedLabel,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingVertical: 8,
  },
  focusedTab: {
    backgroundColor: '#007AFF',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  focusedLabel: {
    color: '#ffffff',
  },
  unfocusedLabel: {
    color: '#8E8E93',
  },
});

export default CustomTabBar;
