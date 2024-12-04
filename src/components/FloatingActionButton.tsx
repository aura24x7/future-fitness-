import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  const pulse1 = useSharedValue(1.1);
  const pulse2 = useSharedValue(1.2);
  const opacity1 = useSharedValue(0.2);
  const opacity2 = useSharedValue(0.2);

  React.useEffect(() => {
    pulse1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1.1, { duration: 1000 })
      ),
      -1,
      true
    );
    opacity1.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(0.1, { duration: 1000 })
      ),
      -1,
      true
    );

    pulse2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1000 }),
          withTiming(1.2, { duration: 1000 })
        ),
        -1,
        true
      )
    );
    opacity2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: 1000 }),
          withTiming(0.05, { duration: 1000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const pulseStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1.value }],
    opacity: opacity1.value,
  }));

  const pulseStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2.value }],
    opacity: opacity2.value,
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FF8787']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Ionicons name="scan-circle" size={24} color="#FFFFFF" />
            <Text style={styles.text}>Scan Food</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Pulsing Effect */}
      <Animated.View style={[styles.pulseCircle, pulseStyle1]} />
      <Animated.View style={[styles.pulseCircle, pulseStyle2]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradient: {
    height: '100%',
    paddingHorizontal: 24,
  },
  content: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  pulseCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    opacity: 0.2,
    zIndex: -1,
  },
});

export default FloatingActionButton;
