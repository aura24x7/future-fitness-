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
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { isDarkMode } = useTheme();

  return (
    <BlurView 
      intensity={isDarkMode ? 40 : 80} 
      tint={isDarkMode ? "dark" : "light"} 
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode 
            ? 'rgba(0, 0, 0, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
        }
      ]}
    >
      <View style={[
        styles.content,
        {
          backgroundColor: isDarkMode 
            ? 'rgba(0, 0, 0, 0.3)' 
            : 'rgba(255, 255, 255, 0.3)',
        }
      ]}>
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
                  style={[
                    styles.tabButton,
                    isFocused && [
                      styles.focusedTab,
                      {
                        backgroundColor: isDarkMode 
                          ? colors.text.accent.dark 
                          : colors.text.accent.light,
                      }
                    ]
                  ]}
                >
                  <FoodScannerIcon
                    focused={isFocused}
                    color={isFocused 
                      ? isDarkMode ? '#FFFFFF' : '#FFFFFF'
                      : isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light
                    }
                    size={24}
                  />
                  <Text style={[
                    styles.label,
                    isFocused 
                      ? styles.focusedLabel
                      : [
                          styles.unfocusedLabel,
                          { 
                            color: isDarkMode 
                              ? colors.text.secondary.dark 
                              : colors.text.secondary.light 
                          }
                        ]
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
              style={[
                styles.tabButton,
                isFocused && [
                  styles.focusedTab,
                  {
                    backgroundColor: isDarkMode 
                      ? colors.text.accent.dark 
                      : colors.text.accent.light,
                  }
                ]
              ]}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused 
                  ? isDarkMode ? '#FFFFFF' : '#FFFFFF'
                  : isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light
                }
              />
              <Text
                style={[
                  styles.label,
                  isFocused 
                    ? styles.focusedLabel
                    : [
                        styles.unfocusedLabel,
                        { 
                          color: isDarkMode 
                            ? colors.text.secondary.dark 
                            : colors.text.secondary.light 
                        }
                      ]
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
    borderRadius: 8,
    marginHorizontal: 4,
  },
  focusedTab: {
    backgroundColor: colors.text.accent.light,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  focusedLabel: {
    color: '#FFFFFF',
  },
  unfocusedLabel: {
    color: colors.text.secondary.light,
  },
});

export default CustomTabBar;
