import React, { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Animated } from 'react-native'
import { useTheme } from '../theme/ThemeProvider'
import { colors } from '../theme/colors'
import {
  ExerciseCard,
  ProgressIndicator,
  TimerDisplay,
  WorkoutText
} from '../components/themed/WorkoutComponents'
import {
  AnimatedExerciseCard,
  RestTimerOverlay
} from '../components/themed/WorkoutAnimations'

function Workout() {
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? 'dark' : 'light'
  
  // Animation states
  const fadeAnim = useRef(new Animated.Value(1)).current
  const [isResting, setIsResting] = useState(false)
  const [restTime, setRestTime] = useState(60)

  // Handle exercise completion animation
  const handleExerciseComplete = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start()
  }

  // Handle rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(prev => prev - 1)
      }, 1000)
    } else if (restTime === 0) {
      setIsResting(false)
      setRestTime(60)
    }
    return () => interval && clearInterval(interval)
  }, [isResting, restTime])

  return (
    <View style={styles.container}>
      {/* Timer Section - Maintaining existing layout */}
      <View style={styles.timerSection}>
        <TimerDisplay theme={theme}>
          <WorkoutText theme={theme} variant="timer">
            {isResting ? restTime : "00:00"}
          </WorkoutText>
        </TimerDisplay>
      </View>

      {/* Exercises Section - Enhanced with animations */}
      <ScrollView style={styles.exercisesSection}>
        <AnimatedExerciseCard 
          theme={theme}
          style={{ opacity: fadeAnim }}
        >
          <WorkoutText theme={theme} variant="title">
            {/* Your existing exercise title */}
          </WorkoutText>
          <View style={styles.progressRow}>
            <ProgressIndicator theme={theme} style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.progress.indicator }
                ]} 
              />
            </ProgressIndicator>
            <WorkoutText theme={theme} variant="body">
              {/* Your existing progress text */}
            </WorkoutText>
          </View>
        </AnimatedExerciseCard>
      </ScrollView>

      {/* Rest Timer Overlay */}
      {isResting && (
        <RestTimerOverlay theme={theme}>
          <WorkoutText theme={theme} variant="title">
            Rest Time
          </WorkoutText>
          <WorkoutText theme={theme} variant="timer">
            {restTime}
          </WorkoutText>
        </RestTimerOverlay>
      )}
    </View>
  )
}

// Maintain existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  exercisesSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
})

export default Workout 