import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';
import { Ionicons } from '@expo/vector-icons';
import { mockMealService } from '../services/mockData';
import { MealLog, MealType } from '../types/calorie';
import Card from '../components/Card';
import DateSelector from '../components/DateSelector';
import MealPlanLoadingScreen from '../components/MealPlanLoadingScreen';
import { useFocusEffect } from '@react-navigation/native';
import { mealPlanService, MealPlan, Meal } from '../services/mealPlanService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';

const STORAGE_KEY = '@meal_plan';

type Props = NativeStackScreenProps<RootStackParamList, 'FoodLog'>;

const FoodLogScreen: React.FC<Props> = ({ navigation, route }) => {
  // State for managing meals and UI
  const [meals, setMeals] = useState<{ [key: string]: MealLog[] }>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalMacros, setTotalMacros] = useState({ proteins: 0, carbs: 0, fats: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Constants for AsyncStorage keys
  const MEALS_STORAGE_KEY = '@meals';
  const getStorageKeyForDate = (date: Date) => `${MEALS_STORAGE_KEY}_${date.toISOString().split('T')[0]}`;

  // Load saved meals on mount and when date changes
  useEffect(() => {
    loadSavedMeals();
  }, [selectedDate]);

  const loadSavedMeals = async () => {
    try {
      setIsLoading(true);
      const storageKey = getStorageKeyForDate(selectedDate);
      const savedMeals = await AsyncStorage.getItem(storageKey);
      
      if (savedMeals) {
        const parsedMeals = JSON.parse(savedMeals);
        console.log('Loaded meals:', parsedMeals);
        setMeals(parsedMeals);
        updateTotals(parsedMeals);
      } else {
        // Initialize empty meal structure
        const emptyMeals = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        };
        console.log('Initializing empty meals structure');
        setMeals(emptyMeals);
        updateTotals(emptyMeals);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
      Alert.alert('Error', 'Failed to load meals');
    } finally {
      setIsLoading(false);
    }
  };

  const saveMeals = async (updatedMeals: { [key: string]: MealLog[] }) => {
    try {
      const storageKey = getStorageKeyForDate(selectedDate);
      console.log('Saving meals with key:', storageKey);
      console.log('Meals to save:', updatedMeals);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedMeals));
    } catch (error) {
      console.error('Error saving meals:', error);
      Alert.alert('Error', 'Failed to save meals');
    }
  };

  const updateTotals = (currentMeals: { [key: string]: MealLog[] }) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // Only count completed meals
    Object.values(currentMeals).forEach(mealArray => {
      mealArray.forEach(meal => {
        if (meal.completed) {
          totalCalories += meal.calories || 0;
          totalProtein += meal.protein || 0;
          totalCarbs += meal.carbs || 0;
          totalFat += meal.fat || 0;
        }
      });
    });

    setTotalCalories(totalCalories);
    setTotalMacros({
      proteins: totalProtein,
      carbs: totalCarbs,
      fats: totalFat
    });
  };

  const handleCustomMealSave = async (newMeal: MealLog) => {
    try {
      console.log('Saving custom meal:', newMeal);
      const updatedMeals = { ...meals };
      
      // Convert MealType enum to lowercase string for object key
      const mealTypeKey = newMeal.mealType.toLowerCase();
      
      // Initialize array if it doesn't exist
      if (!updatedMeals[mealTypeKey]) {
        updatedMeals[mealTypeKey] = [];
      }

      // Add the new meal to the appropriate category
      const mealWithId = {
        ...newMeal,
        id: `${newMeal.name}-${Date.now()}`,
        date: selectedDate
      };

      updatedMeals[mealTypeKey] = [...updatedMeals[mealTypeKey], mealWithId];
      console.log('Updated meals structure:', updatedMeals);

      // Update state and storage
      setMeals(updatedMeals);
      await saveMeals(updatedMeals);
      updateTotals(updatedMeals);

      // Navigate back to the food log screen
      navigation.goBack();
    } catch (error) {
      console.error('Error saving custom meal:', error);
      Alert.alert('Error', 'Failed to save meal');
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      setIsGeneratingPlan(true);
      const generatedPlan = await mealPlanService.generateMealPlan();
      
      // Preserve existing meals and merge with AI-generated ones
      const existingMeals = { ...meals };
      
      // Convert AI-generated plan to our meal structure and merge with existing meals
      const newMeals = {
        breakfast: [
          ...existingMeals.breakfast,
          ...generatedPlan[selectedDate.getDay()].meals.breakfast.map(meal => ({
            id: `${meal.name}-${Date.now()}`,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            completed: false,
            mealType: MealType.Breakfast,
            ingredients: meal.ingredients || [],
            instructions: meal.instructions || '',
            servings: meal.servings || 1,
            prepTime: meal.prepTime || 0
          }))
        ],
        lunch: [
          ...existingMeals.lunch,
          ...generatedPlan[selectedDate.getDay()].meals.lunch.map(meal => ({
            id: `${meal.name}-${Date.now()}`,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            completed: false,
            mealType: MealType.Lunch,
            ingredients: meal.ingredients || [],
            instructions: meal.instructions || '',
            servings: meal.servings || 1,
            prepTime: meal.prepTime || 0
          }))
        ],
        dinner: [
          ...existingMeals.dinner,
          ...generatedPlan[selectedDate.getDay()].meals.dinner.map(meal => ({
            id: `${meal.name}-${Date.now()}`,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            completed: false,
            mealType: MealType.Dinner,
            ingredients: meal.ingredients || [],
            instructions: meal.instructions || '',
            servings: meal.servings || 1,
            prepTime: meal.prepTime || 0
          }))
        ],
        snack: [
          ...existingMeals.snack,
          ...generatedPlan[selectedDate.getDay()].meals.snacks.map(meal => ({
            id: `${meal.name}-${Date.now()}`,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            completed: false,
            mealType: MealType.Snack,
            ingredients: meal.ingredients || [],
            instructions: meal.instructions || '',
            servings: meal.servings || 1,
            prepTime: meal.prepTime || 0
          }))
        ]
      };

      setMeals(newMeals);
      await saveMeals(newMeals);
      updateTotals(newMeals);
      
      setTimeout(() => {
        setIsGeneratingPlan(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setIsGeneratingPlan(false);
      Alert.alert('Error', 'Failed to generate meal plan');
    }
  };

  const getMealsByType = () => {
    return Object.entries(meals)
      .map(([type, mealArray]) => ({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        data: mealArray
      }))
      .filter(section => section.data.length > 0);
  };

  const handleMealComplete = async (mealId: string, isCompleted: boolean) => {
    try {
      const updatedMeals = { ...meals };
      
      // Find and update the meal in the correct category
      Object.keys(updatedMeals).forEach(mealType => {
        const mealIndex = updatedMeals[mealType].findIndex(meal => meal.id === mealId);
        if (mealIndex !== -1) {
          updatedMeals[mealType][mealIndex] = {
            ...updatedMeals[mealType][mealIndex],
            completed: isCompleted
          };
        }
      });

      // Update state and storage
      setMeals(updatedMeals);
      await saveMeals(updatedMeals);
      updateTotals(updatedMeals);
    } catch (error) {
      console.error('Error updating meal completion:', error);
      Alert.alert('Error', 'Failed to update meal status');
    }
  };

  const renderMealItem = (meal: MealLog) => {
    return (
      <View style={styles.mealContainer}>
        <View style={styles.mealContent}>
          <View style={styles.mealHeader}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => handleMealComplete(meal.id!, !meal.completed)}
            >
              <View style={[
                styles.checkbox,
                meal.completed && styles.checkboxChecked
              ]}>
                {meal.completed && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mealContentTouchable}
              onPress={() => handleMealPress(meal)}
              onLongPress={() => handleDeleteMeal(meal)}
            >
              <View style={styles.mealIconContainer}>
                <View style={[styles.mealIcon, { backgroundColor: getMealTypeColor(meal.mealType) }]}>
                  <Ionicons name={getMealTypeIcon(meal.mealType)} size={24} color="#FFF" />
                </View>
              </View>
              
              <View style={styles.mealInfo}>
                <Text style={[
                  styles.mealName,
                  meal.completed && styles.mealNameCompleted
                ]}>{meal.name}</Text>
                <Text style={styles.macroLabel}>
                  {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.mealDetails}>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Calories</Text>
                <Text style={styles.macroValue}>{meal.calories}</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{meal.protein}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{meal.carbs}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{meal.fat}g</Text>
              </View>
            </View>

            {meal.ingredients && meal.ingredients.length > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={styles.ingredientsLabel}>Ingredients</Text>
                <Text style={styles.ingredients}>
                  {meal.ingredients.join(', ')}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={48} color="#A0A0A0" />
      <Text style={styles.emptyStateText}>
        No meals planned for this day.{'\n'}
        Generate a meal plan or add custom meals.
      </Text>
    </View>
  );

  const getMealTypeColor = (type: MealType) => {
    switch (type) {
      case MealType.Breakfast:
        return '#FF9800';
      case MealType.Lunch:
        return '#4CAF50';
      case MealType.Dinner:
        return '#2196F3';
      default:
        return '#9C27B0';
    }
  };

  const getMealTypeIcon = (type: MealType) => {
    switch (type) {
      case MealType.Breakfast:
        return 'sunny-outline';
      case MealType.Lunch:
        return 'restaurant-outline';
      case MealType.Dinner:
        return 'moon-outline';
      default:
        return 'cafe-outline';
    }
  };

  const handleGenerateButtonPress = () => {
    if (isGeneratingPlan) return; // Prevent multiple generations
    handleGenerateMealPlan();
  };

  const handleAddMeal = () => {
    navigation.navigate('AddCustomMeal', {
      meal: undefined,
      onSave: handleCustomMealSave,
      selectedDate: selectedDate.toISOString(),
      isEditing: false
    });
  };

  const handleMealPress = (meal: MealLog) => {
    navigation.navigate('AddCustomMeal', {
      meal,
      onSave: handleCustomMealSave,
      selectedDate: selectedDate.toISOString(),
      isEditing: true
    });
  };

  const handleDeleteMeal = (meal: MealLog) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mockMealService.deleteMeal(meal.id);
              setMeals(currentMeals => ({
                ...currentMeals,
                [meal.mealType]: currentMeals[meal.mealType].filter(m => m.id !== meal.id)
              }));
              // Recalculate totals
              const remainingMeals = meals[meal.mealType].filter(m => m.id !== meal.id);
              const calories = remainingMeals.reduce((sum, m) => sum + m.calories, 0);
              const macros = remainingMeals.reduce(
                (acc, m) => ({
                  proteins: acc.proteins + m.protein,
                  carbs: acc.carbs + m.carbs,
                  fats: acc.fats + m.fat,
                }),
                { proteins: 0, carbs: 0, fats: 0 }
              );
              setTotalCalories(calories);
              setTotalMacros(macros);
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const { handleScroll } = useScrollToTabBar();

  const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

  return (
    <View style={styles.container}>
      <MealPlanLoadingScreen 
        visible={isGeneratingPlan} 
        onGenerationComplete={() => setTimeout(() => setIsGeneratingPlan(false), 2000)}
        onSuccess={() => setIsGeneratingPlan(false)}
      />
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      
      {/* Summary Section */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <Text style={styles.summarySubtitle}>{selectedDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.generateButton, isGeneratingPlan && styles.disabledButton]}
              onPress={handleGenerateButtonPress}
              disabled={isGeneratingPlan}
            >
              <LinearGradient
                colors={['#4C51BF', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateButtonGradient}
              >
                {isGeneratingPlan ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.generateButtonContent}>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>AI Plan</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleAddMeal}
            >
              <Ionicons name="add-circle" size={32} color="#2962FF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Calories</Text>
            <Text style={styles.macroValue}>{totalCalories}</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{totalMacros.proteins}g</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{totalMacros.carbs}g</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>{totalMacros.fats}g</Text>
          </View>
        </View>
      </Card>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2962FF" style={styles.loader} />
      ) : (
        <AnimatedSectionList
          sections={getMealsByType()}
          keyExtractor={(item, index) => item?.id || `${item?.name}-${index}`}
          renderItem={({ item }) => item && renderMealItem(item)}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={renderEmptyComponent}
          style={styles.mealList}
          contentContainerStyle={styles.mealListContent}
          stickySectionHeadersEnabled={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  mealList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mealListContent: {
    paddingBottom: 20,
  },
  sectionHeaderContainer: {
    backgroundColor: '#F5F6FA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2962FF',
  },
  mealContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealContent: {
    flexDirection: 'column',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    marginRight: 12,
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
  },
  mealIconContainer: {
    marginRight: 12,
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  mealNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  mealDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calorieInfo: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  calorieValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  ingredients: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 12,
    lineHeight: 20,
  },
  ingredientsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  loader: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  mealContentTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButton: {
    overflow: 'hidden',
    borderRadius: 12,
    marginRight: 8,
  },
  generateButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default FoodLogScreen;
