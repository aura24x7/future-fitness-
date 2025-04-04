import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { YStack, Button, Text } from 'tamagui';
import { Plus } from 'lucide-react-native';
import { ExerciseFormData } from '../../types/workout';
import ExerciseForm from './ExerciseForm';

interface ExerciseListProps {
    exercises: ExerciseFormData[];
    onChange: (exercises: ExerciseFormData[]) => void;
}

const DEFAULT_EXERCISE: ExerciseFormData = {
    exerciseName: '',
    sets: 0,
    reps: 0,
    instructions: '',
    workoutDuration: 0,
    intensityLevel: 'medium',
};

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onChange }) => {
    const handleAddExercise = useCallback(() => {
        onChange([...exercises, { ...DEFAULT_EXERCISE }]);
    }, [exercises, onChange]);

    const handleExerciseChange = useCallback(
        (index: number, updatedExercise: ExerciseFormData) => {
            onChange(exercises.map((ex, i) => (i === index ? updatedExercise : ex)));
        },
        [exercises, onChange]
    );

    const handleDeleteExercise = useCallback(
        (index: number) => {
            onChange(exercises.filter((_, i) => i !== index));
        },
        [exercises, onChange]
    );

    return (
        <YStack space="$4">
            {exercises.map((exercise, index) => (
                <ExerciseForm
                    key={index}
                    exercise={exercise}
                    onChange={(updated) => handleExerciseChange(index, updated)}
                    onDelete={() => handleDeleteExercise(index)}
                />
            ))}
            <Button
                onPress={handleAddExercise}
                icon={Plus}
                backgroundColor="$blue8"
            >
                <Text color="white">Add Exercise</Text>
            </Button>
        </YStack>
    );
};

export default ExerciseList; 