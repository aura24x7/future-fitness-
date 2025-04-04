import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, YStack, Input, Button, Select } from 'tamagui';
import { useActivity } from '../../contexts/ActivityContext';
import { ActivityLevel, ActivityType } from '../../types/activity';

interface ActivityLogFormProps {
  onSuccess?: () => void;
}

export const ActivityLogForm: React.FC<ActivityLogFormProps> = ({ onSuccess }) => {
  const { activityTypes, activitySettings, addActivityLog, error } = useActivity();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [duration, setDuration] = useState(activitySettings.defaultDuration.toString());
  const [level, setLevel] = useState<ActivityLevel>('moderate');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityLevels: { value: ActivityLevel; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
    { value: 'very_high', label: 'Very High' },
  ];

  const handleSubmit = async () => {
    if (!selectedType || !duration || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const durationValue = parseInt(duration, 10);
      if (isNaN(durationValue)) return;

      await addActivityLog(level, durationValue, selectedType, notes);
      setSelectedType(null);
      setDuration(activitySettings.defaultDuration.toString());
      setLevel('moderate');
      setNotes('');
      onSuccess?.();
    } catch (err) {
      console.error('Error submitting activity log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityTypesByCategory = activityTypes.reduce((acc, type) => {
    const category = type.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {} as Record<string, ActivityType[]>);

  return (
    <YStack space="$3" padding="$4">
      <Text fontSize={20} fontWeight="600">
        Log Activity
      </Text>

      {/* Activity Type Selection */}
      <Select
        value={selectedType?.id}
        onValueChange={(value) => {
          const type = activityTypes.find(t => t.id === value);
          setSelectedType(type || null);
        }}
      >
        <Select.Trigger>
          <Select.Value placeholder="Select Activity Type" />
        </Select.Trigger>
        <Select.Content>
          {Object.entries(activityTypesByCategory).map(([category, types]) => (
            <Select.Group key={category}>
              <Select.Label>{category.replace('_', ' ').toUpperCase()}</Select.Label>
              {types.map((type, index) => (
                <Select.Item key={type.id} value={type.id} index={index}>
                  <Select.ItemText>{type.name}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
          ))}
        </Select.Content>
      </Select>

      {/* Duration Input */}
      <View style={styles.inputContainer}>
        <Input
          flex={1}
          value={duration}
          onChangeText={setDuration}
          placeholder="Duration"
          keyboardType="number-pad"
        />
        <Text marginLeft="$2" fontSize={16}>
          minutes
        </Text>
      </View>

      {/* Intensity Level Selection */}
      <Select
        value={level}
        onValueChange={(value) => setLevel(value as ActivityLevel)}
      >
        <Select.Trigger>
          <Select.Value placeholder="Select Intensity Level" />
        </Select.Trigger>
        <Select.Content>
          {activityLevels.map((level, index) => (
            <Select.Item key={level.value} value={level.value} index={index}>
              <Select.ItemText>{level.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Content>
      </Select>

      {/* Notes Input */}
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
        disabled={!selectedType || !duration || isSubmitting}
        themeInverse={true}
      >
        {isSubmitting ? 'Saving...' : 'Log Activity'}
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