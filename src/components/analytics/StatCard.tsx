import React, { useEffect } from 'react';
import { Card, YStack, Text, XStack } from 'tamagui';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { Dimensions } from 'react-native';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedCard = Animated.createAnimatedComponent(Card);

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 64) / 3; // 32px padding on each side, 3 cards

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  gradient?: [string, string];
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  gradient = ['#4361EE', '#7209B7'],
  delay = 0,
}) => {
  const { isDarkMode } = useTheme();
  
  // Animation values
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 120,
        mass: 0.8,
      })
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    progress.value = withDelay(delay, withTiming(1, { duration: 1200 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, 100]) + '%',
  }));

  return (
    <AnimatedCard
      style={[
        animatedStyle,
        {
          width: CARD_WIDTH,
          minHeight: CARD_WIDTH * 1.2,
          borderRadius: 20,
          overflow: 'hidden',
        },
      ]}
      elevation={8}
    >
      <AnimatedLinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          padding: CARD_WIDTH * 0.15,
          justifyContent: 'space-between',
        }}
      >
        <YStack space="$2" flex={1}>
          <Text
            color="white"
            fontSize={Math.max(12, CARD_WIDTH * 0.11)}
            opacity={0.9}
            fontWeight="500"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {title}
          </Text>
          <Text
            color="white"
            fontSize={Math.max(20, CARD_WIDTH * 0.2)}
            fontWeight="700"
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {value}
          </Text>
          {description && (
            <Text
              color="white"
              fontSize={Math.max(10, CARD_WIDTH * 0.09)}
              opacity={0.8}
              fontWeight="400"
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {description}
            </Text>
          )}
        </YStack>
        
        {/* Animated progress bar */}
        <XStack
          marginTop="$3"
          height={3}
          backgroundColor={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}
          borderRadius="$2"
          overflow="hidden"
        >
          <Animated.View
            style={[
              {
                height: '100%',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,1)',
                borderRadius: 4,
              },
              progressStyle,
            ]}
          />
        </XStack>
      </AnimatedLinearGradient>
    </AnimatedCard>
  );
};

export default StatCard; 