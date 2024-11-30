import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  ScrollView,
  Alert,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';
import { Ionicons } from '@expo/vector-icons';
import { mealPlanService, WeeklyMealPlan, MealDetails, DailyMealPlan } from '../services/ai/meal.service';
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

const STORAGE_KEY = '@meal_plan';
const MEALS_STORAGE_KEY = '@meals';

// Function to generate storage key for a specific date
const getStorageKeyForDate = (date: Date) => 
  `${MEALS_STORAGE_KEY}_${date.toISOString().split('T')[0]}`;

// Function to get day of week from date
const getDayOfWeek = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Helper function to calculate days difference
const getDaysDifference = (currentDay: string, targetDay: string): number => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentIndex = days.indexOf(currentDay);
  const targetIndex = days.indexOf(targetDay);
  
  let difference = targetIndex - currentIndex;
  
  // Adjust to get the shortest path (forward or backward)
  if (difference > 3) {
    difference -= 7;
  } else if (difference < -3) {
    difference += 7;
  }
  
  return difference;
};

type Props = NativeStackScreenProps<RootStackParamList, 'FoodLog'>;

const FoodLogScreen: React.FC<Props> = ({ navigation, route }) => {
  // State management
  const [meals, setMeals] = useState<{ [key: string]: MealDetails[] }>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalMacros, setTotalMacros] = useState({ proteins: 0, carbs: 0, fats: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(getDayOfWeek(new Date()));

  // Update selected day when date changes
  useEffect(() => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    if (dayOfWeek !== selectedDay) {
      setSelectedDay(dayOfWeek);
    }
  }, [selectedDate]);

  // Update selected date when day changes
  useEffect(() => {
    const currentDayOfWeek = getDayOfWeek(selectedDate);
    if (currentDayOfWeek !== selectedDay) {
      const daysUntilTarget = getDaysDifference(currentDayOfWeek, selectedDay);
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + daysUntilTarget);
      setSelectedDate(newDate);
    }
  }, [selectedDay]);

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

  // Load saved meals on mount and when date changes
  useEffect(() => {
    loadSavedMeals();
  }, [selectedDate]);

  const loadSavedMeals = async () => {
    try {
      setIsLoading(true);
      const storageKey = getStorageKeyForDate(selectedDate);
      const savedMealsString = await AsyncStorage.getItem(storageKey);
      
      if (savedMealsString) {
        const savedMeals = JSON.parse(savedMealsString);
        setMeals(savedMeals);
        updateTotals(savedMeals);
      } else {
        // If no saved meals, check weekly meal plan
        if (weeklyMealPlan) {
          const dayPlan = weeklyMealPlan.weeklyPlan.find(
            plan => plan.dayOfWeek === selectedDay
          );
          if (dayPlan) {
            setMeals(dayPlan.meals);
            updateTotals(dayPlan.meals);
          } else {
            // Reset meals if no plan found for the day
            setMeals({
              breakfast: [],
              lunch: [],
              dinner: [],
              snacks: []
            });
            updateTotals({
              breakfast: [],
              lunch: [],
              dinner: [],
              snacks: []
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMeals = async (mealsToSave: { [key: string]: MealDetails[] }) => {
    try {
      const storageKey = getStorageKeyForDate(selectedDate);
      await AsyncStorage.setItem(storageKey, JSON.stringify(mealsToSave));
    } catch (error) {
      console.error('Error saving meals:', error);
    }
  };

  const updateTotals = (currentMeals: { [key: string]: MealDetails[] }) => {
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
          setMeals(dayPlan.meals);
          updateTotals(dayPlan.meals);
        }
      }
    } catch (error) {
      console.error('Error loading weekly plan:', error);
      Alert.alert('Error', 'Failed to load meal plan');
    } finally {
      setIsLoading(false);
    }
  };

  const saveWeeklyPlan = async (plan: WeeklyMealPlan) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch (error) {
      console.error('Error saving weekly plan:', error);
      Alert.alert('Error', 'Failed to save meal plan');
    }
  };

  const handleMealComplete = async (mealId: string, isCompleted: boolean) => {
    try {
      if (!weeklyMealPlan) return;

      // Create a deep copy of the weekly plan
      const updatedWeeklyPlan = {
        ...weeklyMealPlan,
        weeklyPlan: weeklyMealPlan.weeklyPlan.map(dayPlan => {
          if (dayPlan.dayOfWeek === selectedDay) {
            // Update the meals for the selected day
            const updatedMeals = { ...dayPlan.meals };
            Object.keys(updatedMeals).forEach(mealType => {
              updatedMeals[mealType] = updatedMeals[mealType].map(meal => {
                if (meal.id === mealId) {
                  return { ...meal, completed: isCompleted };
                }
                return meal;
              });
            });
            return {
              ...dayPlan,
              meals: updatedMeals
            };
          }
          return dayPlan;
        })
      };

      // Update states
      setWeeklyMealPlan(updatedWeeklyPlan);
      
      // Update the current day's meals
      const currentDayPlan = updatedWeeklyPlan.weeklyPlan.find(
        p => p.dayOfWeek === selectedDay
      );
      if (currentDayPlan) {
        setMeals(currentDayPlan.meals);
        updateTotals(currentDayPlan.meals);
      }

      // Save the updated plan
      await saveWeeklyPlan(updatedWeeklyPlan);
    } catch (error) {
      console.error('Error updating meal:', error);
      Alert.alert('Error', 'Failed to update meal');
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      setIsGeneratingPlan(true);
      
      // Generate weekly meal plan
      const newWeeklyPlan = await mealPlanService.generateWeeklyMealPlan({
        calorieGoal: 2000,
        mealCount: 4,
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: []
      });

      // Add IDs and meal types to all meals
      const planWithIds = {
        weeklyPlan: newWeeklyPlan.weeklyPlan.map(dayPlan => ({
          ...dayPlan,
          meals: {
            breakfast: dayPlan.meals.breakfast.map(meal => ({
              ...meal,
              id: `${meal.name}-${dayPlan.dayOfWeek}-${Date.now()}-${Math.random()}`,
              completed: false,
              mealType: MealType.Breakfast
            })),
            lunch: dayPlan.meals.lunch.map(meal => ({
              ...meal,
              id: `${meal.name}-${dayPlan.dayOfWeek}-${Date.now()}-${Math.random()}`,
              completed: false,
              mealType: MealType.Lunch
            })),
            dinner: dayPlan.meals.dinner.map(meal => ({
              ...meal,
              id: `${meal.name}-${dayPlan.dayOfWeek}-${Date.now()}-${Math.random()}`,
              completed: false,
              mealType: MealType.Dinner
            })),
            snacks: dayPlan.meals.snacks.map(meal => ({
              ...meal,
              id: `${meal.name}-${dayPlan.dayOfWeek}-${Date.now()}-${Math.random()}`,
              completed: false,
              mealType: MealType.Snack
            }))
          }
        }))
      };

      // Save the complete weekly plan
      await saveWeeklyPlan(planWithIds);
      setWeeklyMealPlan(planWithIds);

      // Update the current day's meals
      const selectedDayPlan = planWithIds.weeklyPlan.find(
        plan => plan.dayOfWeek === selectedDay
      );
      if (selectedDayPlan) {
        setMeals(selectedDayPlan.meals);
        updateTotals(selectedDayPlan.meals);
      }

      Alert.alert('Success', 'Weekly meal plan generated successfully!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleMealPress = (meal: MealDetails) => {
    navigation.navigate('AddCustomMeal', {
      meal,
      onSave: handleCustomMealSave,
      selectedDate: selectedDate.toISOString(),
      isEditing: true
    });
  };

  const handleDeleteMeal = (meal: MealDetails) => {
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

  const { handleScroll } = useScrollToTabBar();

  const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

  const renderMealItem = (meal: MealDetails) => {
    // Ensure meal type is valid, default to Snack if undefined
    const mealType = meal.mealType || MealType.Snack;
    
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
                <View style={[styles.mealIcon, { backgroundColor: getMealTypeColor(mealType) }]}>
                  <Ionicons name={getMealTypeIcon(mealType)} size={24} color="#FFF" />
                </View>
              </View>
              
              <View style={styles.mealInfo}>
                <Text style={[
                  styles.mealName,
                  meal.completed && styles.mealNameCompleted
                ]}>{meal.name}</Text>
                <Text style={styles.macroLabel}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
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

  // Load weekly plan when component mounts
  useEffect(() => {
    loadWeeklyPlan();
  }, []);

  // Update meals when selected day changes
  useEffect(() => {
    if (weeklyMealPlan) {
      const dayPlan = weeklyMealPlan.weeklyPlan.find(
        plan => plan.dayOfWeek === selectedDay
      );
      if (dayPlan) {
        setMeals(dayPlan.meals);
        updateTotals(dayPlan.meals);
      } else {
        // Reset meals if no plan found for the day
        setMeals({
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        });
        updateTotals({
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        });
      }
    }
  }, [selectedDay, weeklyMealPlan]);

  const sections = Object.keys(meals).map(type => ({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    type,
    data: meals[type],
  }));

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

      <AnimatedSectionList
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
  ingredients: {
    fontSize: 13,
    color: '#86868B',
    lineHeight: 18,
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

export default FoodLogScreen;
