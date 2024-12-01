import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { analyzeFoodImage, FoodAnalysisResult, saveFoodAnalysis } from '../services/foodRecognitionService';
import { Ionicons } from '@expo/vector-icons';

type ScannedFoodDetailsParams = {
  imageUri: string;
  imageBase64?: string;
};

type RouteParams = {
  ScannedFoodDetails: ScannedFoodDetailsParams;
};

const ScannedFoodDetailsScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'ScannedFoodDetails'>>();
  const navigation = useNavigation();
  const { imageUri, imageBase64 } = route.params;
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [foodData, setFoodData] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const analyzeFoodData = async () => {
      if (!imageBase64) {
        setError('No image data available');
        setIsAnalyzing(false);
        return;
      }

      try {
        console.log('Starting food analysis...');
        const result = await analyzeFoodImage(imageBase64);
        console.log('Analysis complete:', result);
        setFoodData(result);
      } catch (err) {
        console.error('Error analyzing food:', err);
        setError('Failed to analyze food image. Please try again.');
        Alert.alert('Error', 'Failed to analyze food image. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeFoodData();
  }, [imageBase64]);

  const navigateToFoodLog = () => {
    navigation.navigate('TabNavigator', { screen: 'FoodLog' });
  };

  const handleSaveToLog = async () => {
    if (!foodData) return;

    setIsSaving(true);
    try {
      await saveFoodAnalysis(foodData);
      Alert.alert(
        'Success',
        'Food has been added to your log!',
        [
          {
            text: 'View Food Log',
            onPress: navigateToFoodLog,
          },
          {
            text: 'Scan Another',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.error('Error saving food:', err);
      Alert.alert('Error', 'Failed to save food to log. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isAnalyzing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing your food...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: imageUri }} style={styles.image} />
        
        {foodData && (
          <View style={styles.detailsContainer}>
            <Text style={styles.foodName}>{foodData.foodName}</Text>
            
            <View style={styles.nutritionContainer}>
              <Text style={styles.sectionTitle}>Nutrition Information</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{foodData.nutritionInfo.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{foodData.nutritionInfo.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{foodData.nutritionInfo.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{foodData.nutritionInfo.fat}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {foodData.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{foodData.description}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveToLog}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Add to Food Log</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  nutritionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: '25%',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ScannedFoodDetailsScreen;
