import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CHALLENGE_TYPES, getRecommendedGoal } from '../utils/challengeUtils';

interface ChallengeGoalInputProps {
  type: string;
  value: number;
  onChange: (value: number) => void;
  durationDays: number;
}

const ChallengeGoalInput: React.FC<ChallengeGoalInputProps> = ({
  type,
  value,
  onChange,
  durationDays,
}) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const selectedType = CHALLENGE_TYPES.find(t => t.id === type);
  const recommendedGoal = getRecommendedGoal(type, durationDays);

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const adjustValue = (increment: boolean) => {
    const currentValue = parseInt(localValue, 10) || 0;
    const step = type === 'calories' ? 100 : type === 'duration' ? 15 : 1;
    const newValue = increment ? currentValue + step : Math.max(0, currentValue - step);
    setLocalValue(newValue.toString());
    onChange(newValue);
  };

  const handleUseRecommended = () => {
    setLocalValue(recommendedGoal.toString());
    onChange(recommendedGoal);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Challenge Goal</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => adjustValue(false)}
        >
          <Ionicons name="remove" size={24} color="#6366F1" />
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <TextInput
            style={styles.input}
            value={localValue}
            onChangeText={handleChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.unit}>{selectedType?.unitLabel}</Text>
        </View>

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => adjustValue(true)}
        >
          <Ionicons name="add" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {recommendedGoal > 0 && (
        <TouchableOpacity
          style={styles.recommendedButton}
          onPress={handleUseRecommended}
        >
          <Ionicons name="bulb-outline" size={16} color="#6366F1" />
          <Text style={styles.recommendedText}>
            Recommended: {recommendedGoal} {selectedType?.unitLabel}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.hint}>
        {selectedType?.examples[0]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  adjustButton: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    padding: 0,
  },
  unit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  recommendedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  recommendedText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ChallengeGoalInput;
