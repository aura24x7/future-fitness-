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
import { LinearGradient } from 'expo-linear-gradient';
import { useMeals } from '../contexts/MealContext';
import { normalizeDate } from '../utils/dateUtils';

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
  const { meals, updateMeals } = useMeals();

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
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'TabNavigator',
            state: {
              routes: [{ name: 'FoodLog' }],
              index: 2, // FoodLog is the third tab (0-based index)
            },
          },
        ],
      })
    );
  };

  const handleSaveToLog = async () => {
    if (!foodData) return;

    setIsSaving(true);
    try {
      // Create the meal object with normalized date
      const currentDate = normalizeDate(new Date());
      const mealType = foodData.mealType.toLowerCase();
      const newMeal = {
        id: `${Date.now()}-${foodData.foodName.toLowerCase().replace(/\s+/g, '-')}`,
        name: foodData.foodName,
        calories: foodData.nutritionInfo.calories,
        protein: foodData.nutritionInfo.protein,
        carbs: foodData.nutritionInfo.carbs,
        fat: foodData.nutritionInfo.fat,
        completed: true,
        mealType,
        ingredients: foodData.ingredients,
        servingSize: foodData.servingSize,
        date: currentDate.toISOString(),
      };

      // First save to AsyncStorage
      await saveFoodAnalysis(foodData, currentDate);

      // Then update MealContext
      const updatedMeals = { ...meals };
      if (!updatedMeals[mealType]) {
        updatedMeals[mealType] = [];
      }
      updatedMeals[mealType].push(newMeal);
      
      console.log('Saving meal with date:', currentDate);
      console.log('Updated meals:', updatedMeals);
      
      await updateMeals(updatedMeals);

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
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
        </View>
        
        {foodData && (
          <View style={styles.detailsContainer}>
            <Text style={styles.foodName}>{foodData.foodName || 'Unable to identify'}</Text>
            
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{foodData.description}</Text>
            </View>

            <View style={styles.nutritionContainer}>
              <Text style={styles.sectionTitle}>Nutrition Information</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionValue}>
                      {foodData.nutritionInfo.calories || '0'}
                    </Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                </View>
                <View style={styles.nutritionItem}>
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionValue}>
                      {foodData.nutritionInfo.protein || '0'}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                </View>
                <View style={styles.nutritionItem}>
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionValue}>
                      {foodData.nutritionInfo.carbs || '0'}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                </View>
                <View style={styles.nutritionItem}>
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionValue}>
                      {foodData.nutritionInfo.fat || '0'}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSaveToLog}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Add to Food Log</Text>
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
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  foodName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 24,
  },
  nutritionContainer: {
    marginBottom: 24,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  nutritionItem: {
    width: '48%',
    marginBottom: 12,
  },
  nutritionCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScannedFoodDetailsScreen;
