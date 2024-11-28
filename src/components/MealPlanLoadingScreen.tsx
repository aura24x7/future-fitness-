import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Modal, Dimensions, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  visible: boolean;
  onSuccess?: () => void;
  onGenerationComplete?: () => void;
}

const { width } = Dimensions.get('window');

const MealPlanLoadingScreen: React.FC<Props> = ({ visible, onSuccess, onGenerationComplete }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successRef = useRef<LottieView>(null);
  const loadingRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      setShowSuccess(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // When success state is triggered
      if (showSuccess) {
        successRef.current?.play();
        
        // Call onSuccess after animation
        const successTimer = setTimeout(() => {
          onSuccess?.();
        }, 2000);

        return () => clearTimeout(successTimer);
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, showSuccess]);

  useEffect(() => {
    if (visible && onGenerationComplete) {
      setShowSuccess(true);
    }
  }, [visible, onGenerationComplete]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['rgba(0,0,0,0.95)', 'rgba(20,20,20,0.95)']}
            style={styles.container}
          >
            <View style={styles.card}>
              {!showSuccess ? (
                <View style={styles.content}>
                  <Text style={styles.title}>Creating Your Meal Plan</Text>
                  <Text style={styles.subtitle}>
                    Crafting a personalized nutrition plan based on your goals
                  </Text>
                  <View style={styles.lottieContainer}>
                    <LottieView
                      ref={loadingRef}
                      source={require('../../assets/animations/loading-bar.json')}
                      autoPlay
                      loop
                      style={styles.lottie}
                    />
                  </View>
                  <View style={styles.stepsContainer}>
                    <Text style={styles.step}>• Analyzing preferences</Text>
                    <Text style={styles.step}>• Calculating optimal macros</Text>
                    <Text style={styles.step}>• Designing balanced meals</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.successContent}>
                  <LottieView
                    ref={successRef}
                    source={require('../../assets/animations/success-animation.json')}
                    style={styles.successAnimation}
                    loop={false}
                  />
                  <Text style={styles.successTitle}>Plan Generated!</Text>
                  <Text style={styles.successText}>
                    Your personalized meal plan is ready
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: 'rgba(30,30,30,0.9)',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  lottieContainer: {
    width: '100%',
    height: 8,
    marginBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  stepsContainer: {
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  step: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successAnimation: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  successText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MealPlanLoadingScreen;
