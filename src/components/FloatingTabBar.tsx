import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTabBar } from '../context/TabBarContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.7;

export const FloatingTabBar = ({ state, navigation, descriptors }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { tabBarVisible } = useTabBar();

  const animatedStyles = useAnimatedStyle(() => {
    const translateY = interpolate(
      tabBarVisible.value,
      [0, 1],
      [100, 0],
      'clamp'
    );

    return {
      transform: [{ translateY: withTiming(translateY, { duration: 200 }) }],
      opacity: withTiming(tabBarVisible.value, { duration: 200 }),
    };
  });

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
      case 'Challenges':
        return focused ? 'trophy' : 'trophy-outline';
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
        animatedStyles,
        { bottom: insets.bottom + 30 },
      ]}
    >
      <View style={styles.tabBar}>
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
              style={styles.tab}
            >
              <Animated.View>
                <Ionicons
                  name={getIcon(route.name, isFocused)}
                  size={24}
                  color={isFocused ? '#007AFF' : '#8E8E93'}
                />
              </Animated.View>
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
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 25,
    padding: 8,
    width: TAB_BAR_WIDTH,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
});
