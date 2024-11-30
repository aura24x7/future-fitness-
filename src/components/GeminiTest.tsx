import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { GeminiService } from '../services/ai/core/gemini.service';
import { AIWorkoutPlan } from '../types/workout';
import { AI_CONFIG } from '../config/ai.config';

class GeminiTest {
  static async testConnection() {
    try {
      const isConnected = await GeminiService.testConnection();
      return isConnected ? '✅ Connection successful!' : '❌ Connection failed';
    } catch (err) {
      throw err instanceof Error ? err.message : 'Unknown error occurred';
    }
  }

  static async testGeneration() {
    try {
      const response = await GeminiService.generateWorkoutPlan({
        fitnessLevel: 'beginner',
        duration: 30,
        equipment: ['none'],
        goals: ['general fitness'],
      });
      return JSON.stringify(response, null, 2);
    } catch (err) {
      throw err instanceof Error ? err.message : 'Unknown error occurred';
    }
  }
}

export const GeminiTestComponent = () => {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Initialize GeminiService with config
    try {
      GeminiService.initialize({
        apiKey: AI_CONFIG.GEMINI.API_KEY,
        ...AI_CONFIG.GEMINI.GENERATION,
      });
      
      // Display the API key being used (first 10 chars)
      const key = AI_CONFIG.GEMINI.API_KEY;
      setApiKey(key ? `${key.substring(0, 10)}...` : 'Not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize GeminiService');
    }
  }, []);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult('');
    setError('');
    
    try {
      const result = await GeminiTest.testConnection();
      setResult(result);
    } catch (err) {
      setError(err);
      console.error('Connection test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestGeneration = async () => {
    setIsLoading(true);
    setResult('');
    setError('');
    
    try {
      const result = await GeminiTest.testGeneration();
      setResult(result);
    } catch (err) {
      setError(err);
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gemini AI Test</Text>
        <Text style={styles.apiKey}>API Key: {apiKey}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleTestConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleTestGeneration}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Generate Workout</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
      
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Response:</Text>
          <Text style={styles.result}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  apiKey: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  error: {
    color: '#FF3B30',
    marginVertical: 10,
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  result: {
    fontSize: 14,
    color: '#333',
  },
});
