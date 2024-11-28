import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, subDays } from 'date-fns';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const GlassContainer = ({ children }) => {
    return Platform.OS === 'ios' ? (
      <BlurView intensity={30} tint="light" style={styles.glassContainer}>
        {children}
      </BlurView>
    ) : (
      <View style={[styles.glassContainer, styles.glassContainerAndroid]}>
        {children}
      </View>
    );
  };

  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <LinearGradient
      colors={['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.05)']}
      style={styles.container}
    >
      <GlassContainer>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={handlePrevDay}
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-back" size={24} color="#6366f1" />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {format(selectedDate, 'MMMM d')}
              {isToday(selectedDate) && (
                <Text style={styles.todayText}> (Today)</Text>
              )}
            </Text>
            <Text style={styles.dayText}>
              {format(selectedDate, 'EEEE')}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNextDay}
            style={[
              styles.arrowButton,
              isToday(selectedDate) && styles.disabledButton,
            ]}
            disabled={isToday(selectedDate)}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isToday(selectedDate) ? '#a5b4fc' : '#6366f1'}
            />
          </TouchableOpacity>
        </View>
      </GlassContainer>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  glassContainerAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  arrowButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  todayText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6366f1',
  },
  dayText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default DateSelector;
