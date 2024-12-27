import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
  exceeded?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  backgroundColor,
  height = 8,
  style,
  animated = true,
  exceeded = false,
}) => {
  const { theme } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const progressStyle = useAnimatedStyle(() => {
    const width = animated
      ? withSpring(clampedProgress, {
          damping: 20,
          stiffness: 90,
        })
      : withTiming(clampedProgress, { duration: 300 });

    return {
      width: `${width}%`,
    };
  });

  const getProgressColor = () => {
    if (color) return color;
    return exceeded
      ? theme.colors.progressWarning
      : theme.colors.progressSuccess;
  };

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: backgroundColor || theme.colors.progressBackground,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: getProgressColor(),
          },
          progressStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
}); 