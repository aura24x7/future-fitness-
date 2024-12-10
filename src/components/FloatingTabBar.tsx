import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabBar } from '../context/TabBarContext';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.7;

export const FloatingTabBar = ({ state, navigation, descriptors }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { isTabBarVisible } = useTabBar();
  const { isDarkMode } = useTheme();
  const translateY = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isTabBarVisible ? 0 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isTabBarVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isTabBarVisible]);

  const getIcon = (routeName: string, focused: boolean) => {
    switch (routeName) {
      case 'Dashboard':
        return focused ? 'home' : 'home-outline';
      case 'Workout':
        return focused ? 'barbell' : 'barbell-outline';
      case 'FoodLog':
        return focused ? 'restaurant' : 'restaurant-outline';
      case 'Progress':
        return focused ? 'trending-up' : 'trending-up-outline';
      case 'Groups':
        return focused ? 'people' : 'people-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          bottom: insets.bottom + 30,
        },
      ]}
    >
      <View style={[
        styles.tabBar,
        {
          backgroundColor: isDarkMode ? colors.background.card.dark : colors.background.card.light,
          borderColor: isDarkMode ? colors.border.dark : colors.border.light,
          borderWidth: 1,
          ...Platform.select({
            ios: {
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOpacity: isDarkMode ? 0.3 : 0.25,
            },
            android: {
              elevation: isDarkMode ? 8 : 5,
            },
          }),
        }
      ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
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

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={[
                styles.tab,
                isFocused && {
                  backgroundColor: isDarkMode 
                    ? colors.background.secondary.dark 
                    : colors.background.secondary.light,
                  borderRadius: 20,
                }
              ]}
            >
              <View>
                <Ionicons
                  name={getIcon(route.name, isFocused)}
                  size={24}
                  color={isFocused 
                    ? isDarkMode ? colors.text.accent.dark : colors.text.accent.light
                    : isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light
                  }
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 10,
    width: TAB_BAR_WIDTH,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    minWidth: 40,
    minHeight: 40,
  },
});

export default FloatingTabBar;
