import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'tamagui';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { useTheme } from '../../theme/ThemeProvider';

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  workoutDays?: Date[]; // Days that have workouts
  highlightToday?: boolean;
  numWeeks?: number; // Number of weeks to display
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedDate,
  onSelectDate,
  workoutDays = [],
  highlightToday = true,
  numWeeks = 1,
}) => {
  const { colors, isDarkMode } = useTheme();
  const [dateRange, setDateRange] = useState<Date[]>([]);

  useEffect(() => {
    // Generate the date range
    const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
    const range: Date[] = [];
    
    for (let i = 0; i < numWeeks * 7; i++) {
      range.push(addDays(startDate, i));
    }
    
    setDateRange(range);
  }, [selectedDate, numWeeks]);

  const hasWorkout = (date: Date): boolean => {
    return workoutDays.some(workoutDate => isSameDay(workoutDate, date));
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dateRange.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);
          const workout = hasWorkout(date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                isSelected && { 
                  backgroundColor: colors.primary,
                },
                !isSelected && isCurrentDay && highlightToday && {
                  borderColor: colors.primary,
                  borderWidth: 1,
                }
              ]}
              onPress={() => onSelectDate(date)}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color: isSelected
                      ? 'white'
                      : colors.text,
                  },
                ]}
              >
                {format(date, 'EEE')}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: isSelected
                      ? 'white'
                      : colors.text,
                    fontWeight: isCurrentDay ? 'bold' : 'normal',
                  },
                ]}
              >
                {format(date, 'd')}
              </Text>
              
              {workout && (
                <View
                  style={[
                    styles.workoutIndicator,
                    {
                      backgroundColor: isSelected
                        ? 'white'
                        : colors.primary,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  dayButton: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  dayName: {
    fontSize: 14,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  workoutIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
});

export default WeekCalendar; 