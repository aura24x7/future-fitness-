import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, YStack, Input, Button } from 'tamagui';
import { useWeight } from '../../contexts/WeightContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addWeeks } from 'date-fns';

interface WeightGoalFormProps {
  onSuccess?: () => void;
}

export const WeightGoalForm: React.FC<WeightGoalFormProps> = ({ onSuccess }) => {
  const { weightStats, weightSettings, setWeightGoal, error } = useWeight();
  const [targetWeight, setTargetWeight] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState('0.5');
  const [targetDate, setTargetDate] = useState(addWeeks(new Date(), 12)); // 12 weeks default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!targetWeight || !weeklyGoal || isSubmitting || !weightStats) return;

    try {
      setIsSubmitting(true);
      const targetWeightValue = parseFloat(targetWeight);
      const weeklyGoalValue = parseFloat(weeklyGoal);
      
      if (isNaN(targetWeightValue) || isNaN(weeklyGoalValue)) return;

      await setWeightGoal({
        startWeight: weightStats.currentWeight,
        targetWeight: targetWeightValue,
        startDate: new Date(),
        targetDate,
        weeklyGoal: weeklyGoalValue,
        milestones: [],
      });

      onSuccess?.();
    } catch (err) {
      console.error('Error setting weight goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <YStack space="$3" padding="$4">
      <Text fontSize={20} fontWeight="600">
        Set Weight Goal
      </Text>

      <View style={styles.inputContainer}>
        <Input
          flex={1}
          value={targetWeight}
          onChangeText={setTargetWeight}
          placeholder={`Target weight in ${weightSettings.unit}`}
          keyboardType="decimal-pad"
        />
        <Text marginLeft="$2" fontSize={16}>
          {weightSettings.unit}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Input
          flex={1}
          value={weeklyGoal}
          onChangeText={setWeeklyGoal}
          placeholder="Weekly goal"
          keyboardType="decimal-pad"
        />
        <Text marginLeft="$2" fontSize={16}>
          {weightSettings.unit}/week
        </Text>
      </View>

      <Button
        onPress={() => setShowDatePicker(true)}
        variant="outlined"
      >
        Target Date: {targetDate.toLocaleDateString()}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={targetDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setTargetDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {error && (
        <Text color="$red10" fontSize={14}>
          {error}
        </Text>
      )}

      <Button
        onPress={handleSubmit}
        disabled={!targetWeight || !weeklyGoal || isSubmitting}
        themeInverse={true}
      >
        {isSubmitting ? 'Saving...' : 'Set Goal'}
      </Button>
    </YStack>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 