import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { YStack, Text, XStack, useTheme } from 'tamagui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme as useCustomTheme } from '../theme/ThemeProvider';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const { width } = Dimensions.get('window');

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  subtitle?: string;
  colors?: string[];
  delay?: number;
}

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  colors: customColors,
  delay = 0
}) => {
  const theme = useTheme();
  const { isDarkMode } = useCustomTheme();
  
  const defaultColors = isDarkMode 
    ? [colors.background.card.dark, colors.background.secondary.dark]
    : [colors.background.card.light, colors.background.secondary.light];
  
  const gradientColors = customColors || defaultColors;
  
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 500 });
      progress.value = withTiming(1, { duration: 1000 });
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, 100]) + '%',
  }));

  return (
    <AnimatedYStack 
      style={animatedStyle}
      width={(width - 48) / 2}
      borderRadius="$4"
      overflow="hidden"
      elevation={5}
      shadowColor={isDarkMode ? '$gray12' : '$gray8'}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={isDarkMode ? 0.3 : 0.1}
    >
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16, borderRadius: 16 }}
      >
        <XStack space="$2" alignItems="center" marginBottom="$2">
          <YStack
            backgroundColor={isDarkMode ? '$gray3' : '$background'}
            padding="$2"
            borderRadius="$3"
            opacity={0.9}
          >
            <Ionicons 
              name={icon} 
              size={20} 
              color={isDarkMode ? colors.text.accent.dark : colors.text.accent.light} 
            />
          </YStack>
          <Text 
            fontSize="$3" 
            color={isDarkMode ? '$gray11Light' : '$gray11'}
          >
            {title}
          </Text>
        </XStack>

        <Text 
          fontSize="$7" 
          fontWeight="bold" 
          color={isDarkMode ? '$gray12Light' : '$gray12'}
        >
          {value}
        </Text>

        {subtitle && (
          <Text 
            fontSize="$2" 
            color={isDarkMode ? '$gray10Light' : '$gray10'} 
            marginTop="$1"
          >
            {subtitle}
          </Text>
        )}

        <YStack
          height={2}
          backgroundColor={isDarkMode ? '$gray4' : '$gray5'}
          borderRadius="$1"
          marginTop="$3"
          overflow="hidden"
        >
          <Animated.View
            style={[
              {
                height: '100%',
                backgroundColor: isDarkMode ? colors.text.accent.dark : colors.text.accent.light,
                borderRadius: 2,
              },
              progressStyle,
            ]}
          />
        </YStack>
      </AnimatedLinearGradient>
    </AnimatedYStack>
  );
};
