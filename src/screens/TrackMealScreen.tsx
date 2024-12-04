import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { mockMealService } from '../services/mockData';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const TrackMealScreen = ({ navigation, route }) => {
  const editingMeal = route.params?.meal;
  const [mealData, setMealData] = useState({
    name: editingMeal?.name || '',
    type: editingMeal?.type || 'breakfast',
    calories: editingMeal?.calories?.toString() || '',
    proteins: editingMeal?.macros?.proteins?.toString() || '',
    carbs: editingMeal?.macros?.carbs?.toString() || '',
    fats: editingMeal?.macros?.fats?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const handleSave = async () => {
    if (!mealData.name.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    if (!mealData.calories || isNaN(Number(mealData.calories)) || Number(mealData.calories) <= 0) {
      Alert.alert('Error', 'Please enter valid calories');
      return;
    }

    try {
      setLoading(true);

      // Convert all numeric values and ensure they're valid
      const proteins = Number(mealData.proteins) || 0;
      const carbs = Number(mealData.carbs) || 0;
      const fats = Number(mealData.fats) || 0;

      // Validate macronutrients
      if (proteins < 0 || carbs < 0 || fats < 0) {
        Alert.alert('Error', 'Macronutrients cannot be negative');
        return;
      }

      const mealPayload = {
        id: editingMeal?.id || Date.now().toString(),
        name: mealData.name.trim(),
        type: mealData.type,
        calories: Number(mealData.calories),
        timestamp: new Date().toISOString(),
        macros: {
          proteins,
          carbs,
          fats,
        },
      };

      if (editingMeal) {
        await mockMealService.updateMeal(mealPayload);
      } else {
        await mockMealService.trackMeal(mealPayload);
      }

      // Show success alert and navigate after user acknowledges
      Alert.alert(
        'Success!',
        `${mealData.name} has been ${editingMeal ? 'updated' : 'added'} to your food log.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to FoodLog screen
              navigation.navigate('FoodLog');
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{editingMeal ? 'Edit Meal' : 'Track Meal'}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Input
            label="Meal Name"
            placeholder="e.g., Grilled Chicken Salad"
            value={mealData.name}
            onChangeText={(text) => setMealData({ ...mealData, name: text })}
          />

          <Text style={styles.label}>Meal Type</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  mealData.type === type && styles.mealTypeButtonActive,
                ]}
                onPress={() => setMealData({ ...mealData, type })}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    mealData.type === type && styles.mealTypeTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.macrosContainer}>
            <View style={styles.macroInput}>
              <Input
                label="Calories"
                placeholder="0"
                value={mealData.calories}
                onChangeText={(text) => setMealData({ ...mealData, calories: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.macrosTitle}>Macronutrients (g)</Text>
          <View style={styles.macrosContainer}>
            <View style={styles.macroInput}>
              <Input
                label="Protein"
                placeholder="0"
                value={mealData.proteins}
                onChangeText={(text) => setMealData({ ...mealData, proteins: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.macroInput}>
              <Input
                label="Carbs"
                placeholder="0"
                value={mealData.carbs}
                onChangeText={(text) => setMealData({ ...mealData, carbs: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.macroInput}>
              <Input
                label="Fats"
                placeholder="0"
                value={mealData.fats}
                onChangeText={(text) => setMealData({ ...mealData, fats: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Button
            title={loading ? 'Saving...' : 'Save Meal'}
            onPress={handleSave}
            disabled={loading}
          />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  mealTypeButtonActive: {
    backgroundColor: '#4c669f',
  },
  mealTypeText: {
    color: '#666',
    fontSize: 14,
  },
  mealTypeTextActive: {
    color: '#fff',
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  macroInput: {
    flex: 1,
  },
});

export default TrackMealScreen;
