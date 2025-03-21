import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMeals } from '../contexts/MealContext';
import { useSimpleFoodLog } from '../contexts/SimpleFoodLogContext';
import MealTypeSelector from '../components/MealTypeSelector';
import { MealType } from '../types/calorie';
import { Text } from 'tamagui';
import { useTheme } from '../theme/ThemeProvider';

interface FoodDetailScreenProps {
  route: {
    params: {
      food: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    };
  };
}

const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({ route }) => {
  const { food } = route.params;
  const navigation = useNavigation();
  const { addMeal, selectedDate } = useMeals();
  const { addFoodItem } = useSimpleFoodLog();
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);
  const { colors } = useTheme();

  const handleAddToLog = () => {
    setShowMealTypeSelector(true);
  };

  const handleMealTypeSelect = async (mealType: MealType) => {
    try {
      // Save to MealContext
      const newMeal = {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        completed: true,
        mealType: mealType,
        date: selectedDate,
      };
      await addMeal(newMeal);

      // Save to SimpleFoodLog
      const simpleFoodItem = {
        name: food.name,
        calories: food.calories,
        macros: {
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        },
        servingSize: 1, // Default serving size
        servingUnit: 'serving' // Default serving unit
      };
      await addFoodItem(simpleFoodItem);
      
      Alert.alert(
        'Food Added Successfully',
        `Added ${newMeal.name} (${mealType}) to your log:\n` +
        `• ${food.calories} calories\n` +
        `• ${food.protein}g protein\n` +
        `• ${food.carbs}g carbs\n` +
        `• ${food.fat}g fat`,
        [{ text: 'OK' }]
      );
      
      navigation.goBack();
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food to log. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Existing content remains unchanged */}
      
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddToLog}
      >
        <Text color="white" fontSize={16} fontWeight="600">
          Add to Food Log
        </Text>
      </TouchableOpacity>

      <MealTypeSelector
        isOpen={showMealTypeSelector}
        onClose={() => setShowMealTypeSelector(false)}
        onSelect={handleMealTypeSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
});

export default FoodDetailScreen; 