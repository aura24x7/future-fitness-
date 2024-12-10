import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDate } from '../utils/dateUtils';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { colors } from '../theme/colors';
import { Macros } from '../contexts/MealContext';
import { useTheme } from '../theme/ThemeProvider';

interface CalorieTrackerCardProps {
  targetCalories: number;
  currentCalories: number;
  macros: Macros;
  date: Date;
  onDateChange?: (date: Date) => void;
}

const CalorieTrackerCard: React.FC<CalorieTrackerCardProps> = ({
  targetCalories,
  currentCalories,
  macros,
  date,
  onDateChange,
}) => {
  const { isDarkMode } = useTheme();

  const size = 200;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = radius * 2 * Math.PI;

  const macroNutrients = [
    { name: 'Carbs', value: macros.carbs || 0, color: colors.macros.carbs, icon: 'nutrition', unit: 'g' },
    { name: 'Protein', value: macros.proteins || 0, color: colors.macros.protein, icon: 'fish', unit: 'g' },
    { name: 'Fats', value: macros.fats || 0, color: colors.macros.fats, icon: 'water', unit: 'g' },
  ];

  const progress = React.useMemo(() => 
    Math.min((currentCalories || 0) / targetCalories, 1),
    [currentCalories, targetCalories]
  );

  const strokeDashoffset = React.useMemo(() => 
    circumference * (1 - progress),
    [circumference, progress]
  );

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode ? colors.background.card.dark : colors.background.card.light,
        borderColor: isDarkMode ? colors.border.dark : colors.border.light,
        borderWidth: 1,
        ...Platform.select({
          ios: {
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
          },
          android: {
            elevation: isDarkMode ? 4 : 3,
          },
        }),
      }
    ]}>
      <LinearGradient
        colors={[
          isDarkMode ? `${colors.accent}15` : `${colors.accent}08`,
          'transparent'
        ]}
        style={styles.headerGradient}
      >
        <View style={styles.dateContainer}>
          <Text style={[
            styles.dateText,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>
            {formatDate(date, 'MMMM dd')}
          </Text>
          <TouchableOpacity 
            onPress={() => onDateChange?.(new Date())} 
            style={[
              styles.calendarButton,
              {
                backgroundColor: isDarkMode 
                  ? colors.background.secondary.dark 
                  : colors.background.secondary.light,
              }
            ]}
          >
            <Ionicons 
              name="calendar" 
              size={20} 
              color={isDarkMode ? colors.text.accent.dark : colors.text.accent.light}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.circleContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={center}>
            <Circle
              stroke={isDarkMode ? colors.progress.background.dark : colors.progress.background.light}
              fill="none"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={isDarkMode ? colors.progress.success.dark : colors.progress.success.light}
              fill="none"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        <View style={styles.calorieTextContainer}>
          <Text style={[
            styles.calorieText,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>
            {Math.round(currentCalories || 0)}
          </Text>
          <Text style={[
            styles.calorieSubtext,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            Total kcal
          </Text>
        </View>
      </View>

      <View style={styles.macroContainer}>
        {macroNutrients.map((macro) => (
          <View
            key={macro.name}
            style={[
              styles.macroCard,
              {
                backgroundColor: isDarkMode 
                  ? colors.background.secondary.dark 
                  : colors.background.secondary.light,
                borderColor: isDarkMode ? colors.border.dark : colors.border.light,
                borderWidth: 1,
              }
            ]}
          >
            <View style={styles.macroContent}>
              <View style={styles.macroHeader}>
                <View style={[
                  styles.macroIconContainer,
                  {
                    backgroundColor: isDarkMode 
                      ? `${macro.color}15` 
                      : `${macro.color}10`
                  }
                ]}>
                  <Ionicons name={macro.icon as any} size={14} color={macro.color} />
                  <Text style={[
                    styles.macroName,
                    { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
                  ]}>
                    {macro.name}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.macroValue,
                { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
              ]}>
                {Math.round(macro.value)}{macro.unit}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    margin: spacing.small,
    marginBottom: spacing.medium,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerGradient: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  calendarButton: {
    padding: spacing.tiny,
    borderRadius: 8,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.medium,
  },
  calorieTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  calorieText: {
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  calorieSubtext: {
    fontSize: 16,
    fontWeight: '500',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
  },
  macroCard: {
    flex: 1,
    marginHorizontal: spacing.tiny,
    padding: spacing.small,
    borderRadius: 12,
  },
  macroContent: {
    alignItems: 'flex-start',
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.tiny,
  },
  macroIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.tiny,
    padding: spacing.tiny,
    borderRadius: 6,
  },
  macroName: {
    fontSize: 12,
    fontWeight: '500',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalorieTrackerCard;
