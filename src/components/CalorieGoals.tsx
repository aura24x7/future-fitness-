import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, CircleProps } from 'react-native-svg';
import { format, addDays, startOfWeek } from 'date-fns';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Professional Color Palette
const COLORS = {
  primary: '#6366F1', // Indigo primary
  secondary: '#F8FAFC', // Light background
  consumed: '#FF6B6B', // Warm red for calories consumed
  burned: '#4ADE80', // Energetic green for calories burned
  water: '#60A5FA', // Fresh blue for water intake
  text: {
    primary: '#1E293B', // Slate 800
    secondary: '#64748B', // Slate 500
    light: '#94A3B8', // Slate 400
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F1F5F9', // Slate 100
    accent: '#E2E8F0', // Slate 200
  }
};

// Mock data for testing
const MOCK_DATA = {
  caloriesConsumed: 1850, // out of 2500 daily goal
  caloriesBurned: 420,    // calories burned through exercise
  waterIntake: 1800,      // 1.8L out of 2.5L daily goal
  dailyCalorieGoal: 2500,
  dailyWaterGoal: 2500,   // 2.5L in ml
};

interface CalorieGoalsProps {
  caloriesConsumed?: number;
  caloriesBurned?: number;
  waterIntake?: number;
  dailyCalorieGoal?: number;
  dailyWaterGoal?: number;
}

const CalorieGoals: React.FC<CalorieGoalsProps> = ({
  caloriesConsumed = MOCK_DATA.caloriesConsumed,
  caloriesBurned = MOCK_DATA.caloriesBurned,
  waterIntake = MOCK_DATA.waterIntake,
  dailyCalorieGoal = MOCK_DATA.dailyCalorieGoal,
  dailyWaterGoal = MOCK_DATA.dailyWaterGoal,
}) => {
  const { width } = Dimensions.get('window');
  const size = width * 0.75;
  const strokeWidth = 12;
  const center = size / 2;
  
  // Calculate different radiuses for concentric circles
  const outerRadius = (size - strokeWidth) / 2;
  const middleRadius = outerRadius - strokeWidth - 8;
  const innerRadius = middleRadius - strokeWidth - 8;

  // Calculate circumferences
  const outerCircumference = outerRadius * 2 * Math.PI;
  const middleCircumference = middleRadius * 2 * Math.PI;
  const innerCircumference = innerRadius * 2 * Math.PI;

  // Get week dates
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      day: format(date, 'EEE').slice(0, 3),
      date: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
    };
  });

  // Calculate progress
  const consumedProgress = Math.min(caloriesConsumed / dailyCalorieGoal, 1);
  const burnedProgress = Math.min(caloriesBurned / dailyCalorieGoal, 1);
  const waterProgress = Math.min(waterIntake / dailyWaterGoal, 1);

  // Calculate total progress (weighted average)
  const totalProgress = Math.round(
    ((consumedProgress + burnedProgress + waterProgress) / 3) * 100
  );

  const CircleRing: React.FC<CircleProps & { 
    color: string, 
    progress: number, 
    radius: number,
    circum: number 
  }> = ({ color, progress, radius, circum, ...props }) => {
    const strokeDashoffset = circum - (progress * circum);
    return (
      <Circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circum} ${circum}`}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${center} ${center})`}
        {...props}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Date selector */}
      <View style={styles.dateContainer}>
        {weekDates.map((item, index) => (
          <View
            key={index}
            style={[
              styles.dateItem,
              item.isToday && styles.activeDateItem,
            ]}
          >
            <Text style={[
              styles.dateText,
              item.isToday && styles.activeDateText,
            ]}>
              {item.day}
            </Text>
            <Text style={[
              styles.dateNumber,
              item.isToday && styles.activeDateNumber,
            ]}>
              {item.date}
            </Text>
          </View>
        ))}
      </View>

      {/* Progress circles */}
      <View style={styles.progressContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circles */}
          <Circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke={COLORS.background.accent}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={center}
            cy={center}
            r={middleRadius}
            fill="none"
            stroke={COLORS.background.accent}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke={COLORS.background.accent}
            strokeWidth={strokeWidth}
          />
          
          {/* Calories Consumed (Red - Outer Ring) */}
          <CircleRing
            color={COLORS.consumed}
            progress={consumedProgress}
            radius={outerRadius}
            circum={outerCircumference}
          />
          
          {/* Calories Burned (Green - Middle Ring) */}
          <CircleRing
            color={COLORS.burned}
            progress={burnedProgress}
            radius={middleRadius}
            circum={middleCircumference}
          />
          
          {/* Water Intake (Blue - Inner Ring) */}
          <CircleRing
            color={COLORS.water}
            progress={waterProgress}
            radius={innerRadius}
            circum={innerCircumference}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.percentageText}>{totalProgress}%</Text>
          <Text style={styles.labelText}>Daily Goals</Text>
        </View>
      </View>

      {/* Bottom stats */}
      <View style={styles.iconContainer}>
        <View style={styles.iconItem}>
          <Ionicons name="restaurant-outline" size={20} color={COLORS.consumed} />
          <Text style={styles.iconText}>Consumed</Text>
          <Text style={[styles.statsText, { color: COLORS.consumed }]}>
            {caloriesConsumed} cal
          </Text>
        </View>
        <View style={styles.iconItem}>
          <Ionicons name="flame-outline" size={20} color={COLORS.burned} />
          <Text style={styles.iconText}>Burned</Text>
          <Text style={[styles.statsText, { color: COLORS.burned }]}>
            {caloriesBurned} cal
          </Text>
        </View>
        <View style={styles.iconItem}>
          <Ionicons name="water-outline" size={20} color={COLORS.water} />
          <Text style={styles.iconText}>Water</Text>
          <Text style={[styles.statsText, { color: COLORS.water }]}>
            {(waterIntake / 1000).toFixed(1)}L
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 40,
  },
  activeDateItem: {
    backgroundColor: COLORS.background.secondary,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeDateText: {
    color: COLORS.primary,
  },
  activeDateNumber: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  iconItem: {
    alignItems: 'center',
  },
  iconText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 6,
    fontWeight: '500',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default CalorieGoals;
