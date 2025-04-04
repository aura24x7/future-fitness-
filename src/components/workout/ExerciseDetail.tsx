import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, YStack, XStack, Separator } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../../types/workout';
import { useTheme } from '../../theme/ThemeProvider';

interface ExerciseDetailProps {
  exercise: Exercise;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const getIntensityColor = (intensity: string = 'medium', isDarkMode: boolean): string => {
  switch (intensity) {
    case 'low':
      return isDarkMode ? '#4ADE80' : '#22C55E';
    case 'medium':
      return isDarkMode ? '#FACC15' : '#F59E0B';
    case 'high':
      return isDarkMode ? '#F87171' : '#EF4444';
    default:
      return isDarkMode ? '#A1A1AA' : '#71717A';
  }
};

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({
  exercise,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { colors, isDarkMode } = useTheme();
  const intensityColor = getIntensityColor(exercise.intensityLevel || 'medium', isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={18} fontWeight="bold" color={colors.text}>
          {exercise.exerciseName}
        </Text>
        {showActions && (
          <XStack space="$2">
            {onEdit && (
              <Ionicons
                name="pencil"
                size={20}
                color={colors.primary}
                onPress={onEdit}
              />
            )}
            {onDelete && (
              <Ionicons
                name="trash-outline"
                size={20}
                color="#EF4444"
                onPress={onDelete}
              />
            )}
          </XStack>
        )}
      </XStack>

      <Separator marginVertical="$2" />

      <YStack space="$2">
        <XStack space="$4">
          <InfoItem
            label="Sets"
            value={`${exercise.sets || 0}`}
            iconName="barbell-outline"
            color={colors.primary}
          />
          <InfoItem
            label="Reps"
            value={`${exercise.reps || 0}`}
            iconName="repeat-outline"
            color={colors.primary}
          />
          <InfoItem
            label="Duration"
            value={`${exercise.workoutDuration || 0} min`}
            iconName="time-outline"
            color={colors.primary}
          />
        </XStack>

        <XStack marginTop="$2" space="$4">
          <InfoItem
            label="Intensity"
            value={(exercise.intensityLevel || 'medium').charAt(0).toUpperCase() + (exercise.intensityLevel || 'medium').slice(1)}
            iconName="fitness-outline"
            color={intensityColor}
          />
          <InfoItem
            label="Calories"
            value={exercise.caloriesBurned ? `${exercise.caloriesBurned} cal` : 'N/A'}
            iconName="flame-outline"
            color="#F59E0B"
          />
        </XStack>

        <View style={styles.instructionsContainer}>
          <Text fontSize={14} fontWeight="600" color={colors.text}>
            Instructions
          </Text>
          <Text
            fontSize={14}
            color={colors.textSecondary}
            marginTop="$1"
          >
            {exercise.instructions || 'No instructions provided.'}
          </Text>
        </View>
      </YStack>
    </View>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  iconName: any; // Using 'any' temporarily to avoid TypeScript issues with Ionicons names
  color: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, iconName, color }) => {
  const { colors } = useTheme();
  
  return (
    <YStack alignItems="center" space="$1">
      <Ionicons name={iconName} size={22} color={color} />
      <Text fontSize={16} fontWeight="600" color={colors.text}>
        {value}
      </Text>
      <Text fontSize={12} color={colors.textSecondary}>
        {label}
      </Text>
    </YStack>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  instructionsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
});

export default ExerciseDetail; 