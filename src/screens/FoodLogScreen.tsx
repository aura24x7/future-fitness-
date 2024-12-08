import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  ScrollView,
} from 'react-native';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';
import { Ionicons } from '@expo/vector-icons';
import { mealService } from '../services/ai/meal/meal.service';
import { WeeklyMealPlan, MealDetails, DailyMealPlan } from '../services/ai/meal/types';
import { MealType } from '../types/calorie';
import Card from '../components/Card';
import DateSelector from '../components/DateSelector';
import MealPlanLoadingScreen from '../components/MealPlanLoadingScreen';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isToday } from 'date-fns';
import { useMeals } from '../contexts/MealContext';
import { getStorageKeyForDate, MEALS_STORAGE_KEY, getDayOfWeek } from '../utils/dateUtils';

const STORAGE_KEY = '@meal_plan';

type Props = NativeStackScreenProps<RootStackParamList, 'FoodLog'>;

const FoodLogScreen: React.FC<Props> = ({ navigation, route }) => {
  const { meals, updateMeals, totalCalories, totalMacros, selectedDate, setSelectedDate, completeMeal } = useMeals();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState('');
  const { handleScroll } = useScrollToTabBar();

  // Define sections for SectionList
  const sections = useMemo(() => {
    if (!meals) return [];

    return [
      {
        title: 'Breakfast',
        type: MealType.Breakfast,
        data: meals.breakfast || []
      },
      {
        title: 'Lunch',
        type: MealType.Lunch,
        data: meals.lunch || []
      },
      {
        title: 'Dinner',
        type: MealType.Dinner,
        data: meals.dinner || []
      },
      {
        title: 'Snacks',
        type: MealType.Snacks,
        data: meals.snacks || []
      }
    ];
  }, [meals]);

  // Update selected day when date changes
  useEffect(() => {
    const dayOfWeek = getDayOfWeek(new Date());
    setSelectedDay(dayOfWeek);
  }, [selectedDate]);

  // Load saved meals on mount and when date changes
  useEffect(() => {
    loadSavedMeals();
  }, [selectedDate, weeklyMealPlan]);

  const loadSavedMeals = async () => {
    try {
      setIsLoading(true);
      
      // First try to load from weekly meal plan if available
      if (weeklyMealPlan) {
        const dayPlan = weeklyMealPlan.weeklyPlan.find(
          plan => plan.dayOfWeek === selectedDay
        );
        
        if (dayPlan) {
          // Ensure each meal has an ID before updating
          const mealsWithIds = {
            breakfast: (dayPlan.meals.breakfast || []).map(meal => ({
              ...meal,
              id: `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
            })),
            lunch: (dayPlan.meals.lunch || []).map(meal => ({
              ...meal,
              id: `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
            })),
            dinner: (dayPlan.meals.dinner || []).map(meal => ({
              ...meal,
              id: `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
            })),
            snacks: (dayPlan.meals.snacks || []).map(meal => ({
              ...meal,
              id: `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
            }))
          };
          updateMeals(mealsWithIds);
          return;
        }
      }
      
      // If no weekly plan, try to load saved meals for the date
      const storageKey = getStorageKeyForDate(selectedDate);
      const savedMealsString = await AsyncStorage.getItem(storageKey);
      
      if (savedMealsString) {
        const savedMeals = JSON.parse(savedMealsString);
        // Ensure IDs are present in saved meals
        const mealsWithIds = {
          breakfast: (savedMeals.breakfast || []).map(meal => ({
            ...meal,
            id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
          })),
          lunch: (savedMeals.lunch || []).map(meal => ({
            ...meal,
            id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
          })),
          dinner: (savedMeals.dinner || []).map(meal => ({
            ...meal,
            id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
          })),
          snacks: (savedMeals.snacks || []).map(meal => ({
            ...meal,
            id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
          }))
        };
        updateMeals(mealsWithIds);
      }
    } catch (error) {
      console.error('Error loading saved meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleGenerateButtonPress = async () => {
    try {
      setIsGeneratingPlan(true);
      
      // Get user preferences from context or use defaults
      const preferences = {
        calorieGoal: 2000, // You can get this from user settings or context
        mealCount: 3,
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: []
      };

      // Generate the meal plan
      const newWeeklyPlan = await mealService.generateWeeklyMealPlan(preferences);
      
      // Save the plan
      await saveWeeklyPlan(newWeeklyPlan);
      
      // Update state
      setWeeklyMealPlan(newWeeklyPlan);
      
      // Load the meals for the current day
      const dayPlan = newWeeklyPlan.weeklyPlan.find(
        plan => plan.dayOfWeek === selectedDay
      );
      if (dayPlan) {
        updateMeals(dayPlan.meals);
      }

    } catch (error) {
      console.error('Error generating meal plan:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleAddMeal = () => {
    navigation.navigate('AddMeal', {
      onSave: handleCustomMealSave,
      date: selectedDate,
    });
  };

  const renderMealItem = useCallback((item: MealDetails) => {
    // Ensure each meal has a stable unique ID
    const mealId = item.id || `${item.name}-${item.mealType}-${selectedDate.toISOString()}`;
    const isCompleted = Boolean(item.completed);
    const mealTypeColors = {
      [MealType.Breakfast]: '#FFD700',
      [MealType.Lunch]: '#98FB98',
      [MealType.Dinner]: '#DDA0DD',
      [MealType.Snacks]: '#87CEEB',
    };

    // Ensure macros are defined with default values
    const macros = {
      proteins: item.protein || 0,
      carbs: item.carbs || 0,
      fats: item.fat || 0
    };

    // Ensure mealType is valid and consistent
    const validMealType = item.mealType === 'snack' ? MealType.Snacks : item.mealType || MealType.Snacks;

    const handleMealCheckboxPress = async () => {
      try {
        await handleMealComplete(mealId, !isCompleted, validMealType);
      } catch (error) {
        console.error('Error toggling meal completion:', error);
      }
    };

    return (
      <View style={styles.mealContainer}>
        <View style={styles.mealContent}>
          <View style={styles.mealHeader}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={handleMealCheckboxPress}
            >
              <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                {isCompleted && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mealContentTouchable}
              onPress={() => navigation.navigate('MealDetails', { meal: {...item, id: mealId, mealType: validMealType} })}
            >
              <View style={[styles.mealIcon, { backgroundColor: mealTypeColors[validMealType] }]}>
                <Ionicons name="restaurant-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.mealInfo}>
                <Text style={[styles.mealName, isCompleted && styles.mealNameCompleted]}>
                  {item.name}
                </Text>
                <Text style={styles.macroValue}>{item.calories || 0} cal</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.mealDetails}>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{macros.proteins}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{macros.carbs}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{macros.fats}g</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }, [navigation, selectedDate, handleMealComplete]);

  const handleCustomMealSave = async (newMeal: MealDetails) => {
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
      
      // Update meals through context
      updateMeals(updatedMeals);
    } catch (error) {
      console.error('Error saving custom meal:', error);
    }
  };

  const handleMealComplete = async (mealId: string, isCompleted: boolean, mealType: MealType) => {
    try {
      // Get the meal array for the specific type
      const mealTypeKey = mealType.toString().toLowerCase();
      
      // Validate meal type key
      if (!['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealTypeKey)) {
        console.error('Invalid meal type:', mealType);
        return;
      }

      // Find the meal and ensure it has an ID
      const meal = meals[mealTypeKey]?.find(m => {
        const currentMealId = m.id || `${m.name}-${m.mealType}-${selectedDate.toISOString()}`;
        return currentMealId === mealId;
      });

      if (meal) {
        // Use the completeMeal function from context
        await completeMeal(mealId, isCompleted);
      } else {
        console.error('Meal not found:', mealId);
      }
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };

  const loadWeeklyPlan = async () => {
    try {
      setIsLoading(true);
      const savedPlan = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedPlan) {
        const plan = JSON.parse(savedPlan);
        setWeeklyMealPlan(plan);
        
        // Load the selected day's meals
        const dayPlan = plan.weeklyPlan.find(
          p => p.dayOfWeek === selectedDay
        );
        if (dayPlan) {
          updateMeals(dayPlan.meals);
        }
      }
    } catch (error) {
      console.error('Error loading weekly plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWeeklyPlan = async (plan: WeeklyMealPlan) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch (error) {
      console.error('Error saving weekly plan:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F3F4F6',
    },
    header: {
      backgroundColor: '#FFFFFF',
      paddingTop: 15,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    dateSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    dateText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
    },
    summaryCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      margin: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    summaryContent: {
      padding: 16,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1D1D1F',
      marginBottom: 16,
      letterSpacing: -0.5,
    },
    summaryStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1D1D1F',
      marginTop: 4,
    },
    statLabel: {
      fontSize: 13,
      color: '#86868B',
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: '#E5E7EB',
    },
    sectionHeader: {
      backgroundColor: '#FFFFFF',
      paddingVertical: 12,
      paddingHorizontal: 15,
      marginTop: 10,
      marginHorizontal: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#1F2937',
    },
    addButton: {
      padding: 8,
    },
    mealContainer: {
      marginBottom: 12,
      backgroundColor: '#F5F5F7',
      borderRadius: 12,
      overflow: 'hidden',
    },
    mealContent: {
      padding: 12,
    },
    mealHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkboxContainer: {
      marginRight: 12,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#0A84FF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#0A84FF',
    },
    mealContentTouchable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    mealIconContainer: {
      marginRight: 12,
    },
    mealIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mealInfo: {
      flex: 1,
    },
    mealName: {
      fontSize: 16,
      fontWeight: '500',
      color: '#1F2937',
      marginBottom: 2,
    },
    mealNameCompleted: {
      textDecorationLine: 'line-through',
      color: '#86868B',
    },
    mealDetails: {
      marginTop: 12,
    },
    macroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    macroItem: {
      alignItems: 'center',
      flex: 1,
    },
    macroLabel: {
      fontSize: 13,
      color: '#86868B',
      marginBottom: 2,
    },
    macroValue: {
      fontSize: 15,
      fontWeight: '500',
      color: '#1F2937',
    },
    divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 12,
    },
    ingredientsLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: '#1F2937',
      marginBottom: 4,
    },
    ingredientsList: {
      marginTop: 8,
    },
    ingredientItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 2,
      paddingHorizontal: 4,
    },
    ingredientText: {
      marginLeft: 8,
      color: '#4A5568',
      fontSize: 14,
    },
    buttonContainer: {
      padding: 16,
      paddingBottom: 32,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    generateButton: {
      backgroundColor: '#0A84FF',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={handlePrevDay}>
            <Ionicons name="chevron-back" size={24} color="#6366F1" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {format(selectedDate, 'EEEE, MMMM d')}
            {isToday(selectedDate) && ' (Today)'}
          </Text>
          <TouchableOpacity onPress={handleNextDay}>
            <Ionicons name="chevron-forward" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={24} color="#1D1D1F" />
              <Text style={styles.statValue}>{totalCalories.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={24} color="#1D1D1F" />
              <Text style={styles.statValue}>{totalMacros.proteins.toFixed(1)}g</Text>
              <Text style={styles.statLabel}>Protein</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="leaf-outline" size={24} color="#1D1D1F" />
              <Text style={styles.statValue}>{totalMacros.carbs.toFixed(1)}g</Text>
              <Text style={styles.statLabel}>Carbs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={24} color="#1D1D1F" />
              <Text style={styles.statValue}>{totalMacros.fats.toFixed(1)}g</Text>
              <Text style={styles.statLabel}>Fat</Text>
            </View>
          </View>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => renderMealItem(item)}
        renderSectionHeader={({ section: { title, type } }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddMeal()}
              >
                <Ionicons name="add" size={24} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.generateButton]}
          onPress={handleGenerateButtonPress}
          disabled={isGeneratingPlan}
        >
          {isGeneratingPlan ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Generate Meal Plan</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FoodLogScreen;
