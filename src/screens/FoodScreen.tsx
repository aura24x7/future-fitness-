import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

export const FoodScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const meals = [
    {
      id: '1',
      name: 'Breakfast',
      time: '8:00 AM',
      calories: 450,
      items: ['Oatmeal', 'Banana', 'Greek Yogurt'],
    },
    {
      id: '2',
      name: 'Lunch',
      time: '12:30 PM',
      calories: 650,
      items: ['Grilled Chicken Salad', 'Quinoa', 'Avocado'],
    },
    {
      id: '3',
      name: 'Dinner',
      time: '7:00 PM',
      calories: 550,
      items: ['Salmon', 'Brown Rice', 'Steamed Vegetables'],
    },
  ];

  const nutritionSummary = {
    calories: 1650,
    protein: 120,
    carbs: 180,
    fat: 55,
  };

  const MealCard = ({ meal }) => (
    <TouchableOpacity
      style={[
        styles.mealCard,
        { backgroundColor: theme.colors.cardBackground }
      ]}
    >
      <View style={styles.mealHeader}>
        <View>
          <Text style={[styles.mealName, { color: theme.colors.text }]}>
            {meal.name}
          </Text>
          <Text style={[styles.mealTime, { color: theme.colors.secondaryText }]}>
            {meal.time}
          </Text>
        </View>
        <View style={styles.caloriesBadge}>
          <Ionicons name="flame-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.caloriesText, { color: theme.colors.text }]}>
            {meal.calories} cal
          </Text>
        </View>
      </View>

      <View style={styles.mealItems}>
        {meal.items.map((item, index) => (
          <View key={index} style={styles.mealItem}>
            <Ionicons
              name="restaurant-outline"
              size={16}
              color={theme.colors.secondaryText}
            />
            <Text style={[styles.itemText, { color: theme.colors.text }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}>
          <Ionicons name="search" size={20} color={theme.colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search foods..."
            placeholderTextColor={theme.colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={isDarkMode ? 
              [theme.colors.primary, '#2d3748'] :
              [theme.colors.primary, '#818cf8']
            }
            style={styles.summaryCard}
          >
            <Text style={styles.summaryTitle}>Today's Nutrition</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {nutritionSummary.calories}
                </Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {nutritionSummary.protein}g
                </Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {nutritionSummary.carbs}g
                </Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {nutritionSummary.fat}g
                </Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.mealsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Today's Meals
          </Text>
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  cameraButton: {
    padding: 12,
    borderRadius: 12,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  mealsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  mealCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mealItems: {
    gap: 8,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
