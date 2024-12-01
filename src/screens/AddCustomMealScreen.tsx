import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MealType } from '../types/calorie';
import { MealLog } from '../services/ai/meal/types';
import { AddCustomMealParams } from '../types/calorie';

export default function AddCustomMealScreen({ route, navigation }) {
  const { onSave, selectedDate, meal, isEditing = false } = route.params;
  const [name, setName] = useState(meal?.name || '');
  const [calories, setCalories] = useState(meal?.calories ? meal.calories.toString() : '');
  const [protein, setProtein] = useState(meal?.protein ? meal.protein.toString() : '');
  const [carbs, setCarbs] = useState(meal?.carbs ? meal.carbs.toString() : '');
  const [fat, setFat] = useState(meal?.fat ? meal.fat.toString() : '');
  const [mealType, setMealType] = useState<MealType>(meal?.mealType || MealType.Breakfast);
  const [ingredients, setIngredients] = useState(meal?.ingredients?.join(', ') || '');

  const handleSave = () => {
    if (!name || !calories) {
      Alert.alert('Error', 'Please enter at least the meal name and calories');
      return;
    }

    const newMeal: MealLog = {
      name,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      mealType,
      ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
      completed: false
    };

    onSave(newMeal);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Meal Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter meal name"
        />

        <Text style={styles.label}>Meal Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={mealType}
            onValueChange={(itemValue) => setMealType(itemValue as MealType)}
            style={styles.picker}
          >
            <Picker.Item label="Breakfast" value={MealType.Breakfast} />
            <Picker.Item label="Lunch" value={MealType.Lunch} />
            <Picker.Item label="Dinner" value={MealType.Dinner} />
            <Picker.Item label="Snack" value={MealType.Snack} />
          </Picker>
        </View>

        <Text style={styles.label}>Calories</Text>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          placeholder="Enter calories"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Protein (g)</Text>
        <TextInput
          style={styles.input}
          value={protein}
          onChangeText={setProtein}
          placeholder="Enter protein in grams"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Carbs (g)</Text>
        <TextInput
          style={styles.input}
          value={carbs}
          onChangeText={setCarbs}
          placeholder="Enter carbs in grams"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Fat (g)</Text>
        <TextInput
          style={styles.input}
          value={fat}
          onChangeText={setFat}
          placeholder="Enter fat in grams"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Ingredients (comma-separated)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder="Enter ingredients, separated by commas"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Meal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
