import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AIIcon } from '../assets/icons/icons';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

interface Props {
  isLoading: boolean;
  progress?: number;
  onComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreenComponent: React.FC<Props> = ({ 
  isLoading, 
  progress = 0, 
  onComplete 
}) => {
  const opacity = useSharedValue(1);
  const [shouldRender, setShouldRender] = React.useState(true);

  const onAnimationComplete = useCallback(() => {
    setShouldRender(false);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    if (!isLoading) {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onAnimationComplete)();
      });
    } else {
      opacity.value = 1;
      setShouldRender(true);
    }
  }, [isLoading, opacity, onAnimationComplete]);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: opacity.value === 0 ? 'none' : 'auto',
  }));

  if (!shouldRender) return null;

  return (
    <Animated.View 
      style={[styles.container, animatedStyles]}
      pointerEvents={isLoading ? 'auto' : 'none'}
    >
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <AIIcon size={80} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
  },
  gradient: {
    flex: 1,
    width,
    height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreenComponent; 