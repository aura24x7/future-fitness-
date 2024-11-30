import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { GeminiService } from '../services/ai/core/gemini.service';
import { WorkoutService, WorkoutPlan } from '../services/ai/features/workout.service';
import { AI_CONFIG } from '../config/ai.config';

export const AITest: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize Gemini service
        GeminiService.initialize({
            apiKey: AI_CONFIG.GEMINI.API_KEY,
            temperature: AI_CONFIG.GEMINI.GENERATION.temperature,
        });
    }, []);

    const testConnection = async () => {
        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const gemini = GeminiService.getInstance();
            const isConnected = await gemini.testConnection();
            setResult(isConnected ? '✅ Connection successful!' : '❌ Connection failed');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const generateWorkout = async () => {
        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const workoutService = new WorkoutService();
            const workout = await workoutService.generateWorkout({
                difficulty: 'beginner',
                duration: 30,
                equipment: ['none'],
                targetMuscles: ['full body'],
                fitnessGoals: ['general fitness'],
                limitations: []
            });

            setResult(JSON.stringify(workout, null, 2));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Services Test</Text>
                <Text style={styles.subtitle}>API Key: {AI_CONFIG.GEMINI.API_KEY.substring(0, 10)}...</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.testButton]}
                    onPress={testConnection}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        Test Connection
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.generateButton]}
                    onPress={generateWorkout}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        Generate Workout
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Processing...</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Error</Text>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Result</Text>
                    <Text style={styles.resultText}>{result}</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    buttonContainer: {
        padding: 20,
        gap: 10,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    testButton: {
        backgroundColor: '#2196F3',
    },
    generateButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorContainer: {
        margin: 20,
        padding: 15,
        backgroundColor: '#ffebee',
        borderRadius: 8,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#c62828',
        marginBottom: 10,
    },
    errorText: {
        color: '#333',
    },
    resultContainer: {
        margin: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    resultText: {
        color: '#333',
        fontFamily: 'monospace',
    },
});
