import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WorkoutGenerator, WorkoutPlan } from '../services/ai/workout-generator';

interface TestProps {
    apiKey: string;
}

export const WorkoutGeneratorTest: React.FC<TestProps> = ({ apiKey }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<WorkoutPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generator = new WorkoutGenerator(apiKey);

    const testGeneration = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const workout = await generator.generateWorkout({
                difficulty: 'beginner',
                duration: 30,
                equipment: ['none'],
                targetMuscles: ['full body']
            });

            setResult(workout);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Workout Generator Test</Text>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={testGeneration}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Generating...' : 'Generate Workout'}
                </Text>
            </TouchableOpacity>

            {isLoading && (
                <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Generated Workout:</Text>
                    <Text style={styles.resultDetail}>Difficulty: {result.difficulty}</Text>
                    <Text style={styles.resultDetail}>Duration: {result.totalDuration} minutes</Text>
                    
                    <Text style={styles.sectionTitle}>Exercises:</Text>
                    {result.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exerciseItem}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Text style={styles.exerciseDetail}>
                                {exercise.sets} sets × {exercise.reps} reps
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 20,
    },
    errorContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#ffebee',
        borderRadius: 8,
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    resultDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    exerciseItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    exerciseName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    exerciseDetail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});
