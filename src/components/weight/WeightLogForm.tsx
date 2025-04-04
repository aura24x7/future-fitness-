import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, YStack, Input, Button } from 'tamagui';
import { useWeight } from '../../contexts/WeightContext';
import { WeightUnit } from '../../types/weight';

interface WeightLogFormProps {
  onSuccess?: () => void;
}

export const WeightLogForm: React.FC<WeightLogFormProps> = ({ onSuccess }) => {
  const { addWeightLog, weightSettings, error } = useWeight();
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!weight || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const weightValue = parseFloat(weight);
      if (isNaN(weightValue)) return;

      await addWeightLog(weightValue, notes);
      setWeight('');
      setNotes('');
      onSuccess?.();
    } catch (err) {
      console.error('Error submitting weight log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <YStack space="$3" padding="$4">
      <Text fontSize={20} fontWeight="600">
        Log Weight
      </Text>
      
      <View style={styles.inputContainer}>
        <Input
          flex={1}
          value={weight}
          onChangeText={setWeight}
          placeholder={`Enter weight in ${weightSettings.unit}`}
          keyboardType="decimal-pad"
          autoFocus
        />
        <Text marginLeft="$2" fontSize={16}>
          {weightSettings.unit}
        </Text>
      </View>

      <Input
        value={notes}
        onChangeText={setNotes}
        placeholder="Add notes (optional)"
        multiline
      />

      {error && (
        <Text color="$red10" fontSize={14}>
          {error}
        </Text>
      )}

      <Button
        onPress={handleSubmit}
        disabled={!weight || isSubmitting}
        themeInverse={true}
      >
        {isSubmitting ? 'Saving...' : 'Save Weight'}
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