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
import { useProfile } from '../contexts/ProfileContext';

interface CalorieTrackerCardProps {
  targetCalories: number;
  currentCalories: number;
  macros: Macros;
  recommendedMacros: {
    proteins: number;
    carbs: number;
    fats: number;
  };
  date: Date;
  onDateChange?: (date: Date) => void;
}

const CalorieTrackerCard: React.FC<CalorieTrackerCardProps> = ({
  targetCalories,
  currentCalories,
  macros,
  recommendedMacros,
  date,
  onDateChange,
}) => {
  const { isDarkMode } = useTheme();
  const { profile } = useProfile();

  // Use recommended calories from profile if available
  const actualTargetCalories = profile?.metrics?.recommendedCalories || targetCalories;

  const size = 200;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = radius * 2 * Math.PI;

  const macroNutrients = [
    { 
      name: 'Carbs', 
      value: macros.carbs || 0, 
      color: colors.macros.carbs, 
      icon: 'nutrition', 
      unit: 'g',
      target: recommendedMacros.carbs
    },
    { 
      name: 'Protein', 
      value: macros.protein || 0, 
      color: colors.macros.protein, 
      icon: 'fish', 
      unit: 'g',
      target: recommendedMacros.proteins
    },
    { 
      name: 'Fats', 
      value: macros.fat || 0, 
      color: colors.macros.fats, 
      icon: 'water', 
      unit: 'g',
      target: recommendedMacros.fats
    },
  ];

  const progress = React.useMemo(() => {
    if (actualTargetCalories <= 0) return 0;
    return (currentCalories || 0) / actualTargetCalories;
  }, [currentCalories, actualTargetCalories]);

  const isExceeding = progress > 1;
  const remainingCalories = Math.max(0, actualTargetCalories - (currentCalories || 0));
  const exceededCalories = isExceeding ? Math.round(currentCalories - actualTargetCalories) : 0;

  const strokeDashoffset = React.useMemo(() => 
    circumference * (1 - Math.min(progress, 1)),
    [circumference, progress]
  );

  const getProgressColor = (isExceeding: boolean, isDarkMode: boolean) => {
    if (isExceeding) {
      return isDarkMode ? colors.progress.error.dark : colors.progress.error.light;
    }
    return isDarkMode ? colors.progress.success.dark : colors.progress.success.light;
  };

  const getMacroProgressColor = (current: number, target: number, baseColor: string) => {
    const progress = current / target;
    if (progress > 1) {
      return colors.progress.error.light;
    }
    return baseColor;
  };

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
        style={[
          styles.headerGradient,
          { paddingVertical: spacing.tiny }
        ]}
      />

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
              stroke={getProgressColor(isExceeding, isDarkMode)}
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
            { 
              color: isExceeding 
                ? (isDarkMode ? colors.progress.error.dark : colors.progress.error.light)
                : (isDarkMode ? colors.text.primary.dark : colors.text.primary.light)
            }
          ]}>
            {Math.round(currentCalories || 0)}
          </Text>
          <Text style={[
            styles.calorieSubtext,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            Total kcal
          </Text>
          {isExceeding && (
            <Text style={[
              styles.warningText,
              { color: isDarkMode ? colors.progress.error.dark : colors.progress.error.light }
            ]}>
              +{exceededCalories} kcal over limit
            </Text>
          )}
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
                  <Ionicons name={macro.icon as any} size={14} color={getMacroProgressColor(macro.value, macro.target, macro.color)} />
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
                { 
                  color: getMacroProgressColor(macro.value, macro.target, 
                    isDarkMode ? colors.text.primary.dark : colors.text.primary.light
                  )
                }
              ]}>
                {macro.value}{macro.unit}
                {macro.value > macro.target && (
                  <Text style={[styles.macroExcess, { color: colors.progress.error.light }]}>
                    {" "}(+{Math.round(macro.value - macro.target)})
                  </Text>
                )}
              </Text>
              <Text style={[
                styles.macroTarget,
                { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
              ]}>
                of {macro.target}{macro.unit}
              </Text>
              <View style={[
                styles.progressBarContainer,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}>
                <View style={[
                  styles.progressBar,
                  {
                    width: `${Math.min((macro.value / macro.target) * 100, 100)}%`,
                    backgroundColor: getMacroProgressColor(macro.value, macro.target, macro.color),
                  }
                ]} />
              </View>
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
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
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
  macroTarget: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  macroExcess: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    width: '100%',
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default CalorieTrackerCard;
