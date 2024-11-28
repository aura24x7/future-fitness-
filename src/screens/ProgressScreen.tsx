import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import Animated from 'react-native-reanimated';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
  const { handleScroll } = useScrollToTabBar();
  const AnimatedScrollView = Animated.ScrollView;

  const weightData = [
    { value: 80, label: 'Jan' },
    { value: 79, label: 'Feb' },
    { value: 78, label: 'Mar' },
    { value: 77.5, label: 'Apr' },
    { value: 76.8, label: 'May' },
    { value: 76, label: 'Jun' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#818cf8', '#a5b4fc', '#e0e7ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.backgroundGradient}
      />
      
      <LinearGradient
        colors={['#6366f1', '#818cf8', '#a5b4fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>Your</Text>
          <Text style={styles.headerTitle}>Progress</Text>
          <View style={styles.headerLine} />
        </View>
      </LinearGradient>

      <AnimatedScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>
            <Ionicons name="trending-down" size={20} color="#6366f1" /> Weight Progress
          </Text>
          
          <View style={styles.chartWrapper}>
            <View style={styles.chartContainer}>
              <LineChart
                data={weightData}
                width={width - 80}
                height={200}
                spacing={40}
                initialSpacing={20}
                endSpacing={20}
                color="#6366f1"
                thickness={3}
                startFillColor="rgba(99, 102, 241, 0.3)"
                endFillColor="rgba(99, 102, 241, 0.01)"
                startOpacity={0.9}
                endOpacity={0.2}
                backgroundColor="transparent"
                rulesColor="rgba(107, 114, 128, 0.1)"
                rulesType="solid"
                yAxisColor="transparent"
                xAxisColor="transparent"
                adjustToWidth
                pointerConfig={{
                  pointerStripHeight: 120,
                  pointerStripColor: 'rgba(99, 102, 241, 0.1)',
                  pointerStripWidth: 2,
                  pointerColor: '#6366f1',
                  radius: 6,
                  pointerLabelWidth: 100,
                  pointerLabelHeight: 90,
                  activatePointersOnLongPress: true,
                  autoAdjustPointerLabelPosition: false,
                  pointerLabelComponent: (items: any) => {
                    const item = items[0];
                    return (
                      <View style={styles.tooltipContainer}>
                        <Text style={styles.tooltipValue}>{item.value} kg</Text>
                        <Text style={styles.tooltipLabel}>{item.label}</Text>
                      </View>
                    );
                  },
                }}
                maxValue={82}
                minValue={74}
                hideRules
                hideYAxisText
                xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 12 }}
                curved
              />
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={[styles.statCard, styles.glassEffect]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="scale-outline" size={24} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>-4 kg</Text>
            <Text style={styles.statLabel}>Total Weight Loss</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={[styles.statCard, styles.glassEffect]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy-outline" size={24} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>80%</Text>
            <Text style={styles.statLabel}>Goal Progress</Text>
          </LinearGradient>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>
            <Ionicons name="ribbon-outline" size={20} color="#6366f1" /> Recent Achievements
          </Text>
          <View style={styles.achievementItem}>
            <LinearGradient
              colors={['#6366f1', '#818cf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.achievementBadge}
            >
              <Ionicons name="fitness" size={20} color="#fff" />
            </LinearGradient>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>Workout Streak</Text>
              <Text style={styles.achievementDesc}>Completed 5 workouts in a row</Text>
            </View>
          </View>
          <View style={styles.achievementItem}>
            <LinearGradient
              colors={['#6366f1', '#818cf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.achievementBadge}
            >
              <Ionicons name="nutrition" size={20} color="#fff" />
            </LinearGradient>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>Goal Reached</Text>
              <Text style={styles.achievementDesc}>Hit protein target for 7 days</Text>
            </View>
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    height: 100,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerLine: {
    width: 30,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    marginTop: 6,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chartWrapper: {
    width: '100%',
    paddingVertical: 10,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tooltipValue: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tooltipLabel: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  glassEffect: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
  },
  achievementBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#4b5563',
  },
});

export default ProgressScreen;
