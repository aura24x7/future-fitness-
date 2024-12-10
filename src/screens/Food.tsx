import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { useTheme } from '../theme/ThemeProvider'
import {
  MealCard,
  NutritionInfo,
  SearchBar,
  FoodText,
  FilterChip,
  NutritionChart
} from '../components/themed/FoodComponents'

function Food() {
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? 'dark' : 'light'
  
  // Preserve existing state and add new state
  const [selectedCategory, setSelectedCategory] = useState('all')
  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snacks']

  return (
    <ScrollView style={styles.container}>
      {/* Search Section - Maintaining existing layout */}
      <View style={styles.searchSection}>
        <SearchBar theme={theme}>
          <FoodText theme={theme} variant="body">
            Search meals...
          </FoodText>
        </SearchBar>
        
        {/* Categories - New feature */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
          {categories.map((category) => (
            <FilterChip 
              key={category}
              theme={theme}
              selected={category === selectedCategory}
              onPress={() => setSelectedCategory(category)}
            >
              <FoodText theme={theme} variant="caption">
                {category.toUpperCase()}
              </FoodText>
            </FilterChip>
          ))}
        </ScrollView>
      </View>

      {/* Nutrition Overview - New feature */}
      <View style={styles.nutritionSection}>
        <FoodText theme={theme} variant="title">
          Nutrition Overview
        </FoodText>
        <NutritionChart theme={theme}>
          {/* Your existing chart implementation */}
        </NutritionChart>
      </View>

      {/* Meals Section - Preserving current structure */}
      <View style={styles.mealsSection}>
        <MealCard theme={theme}>
          <FoodText theme={theme} variant="title">
            {/* Your existing meal title */}
          </FoodText>
          <NutritionInfo theme={theme}>
            <FoodText theme={theme} variant="subtitle">
              Nutrition Information
            </FoodText>
            {/* Your existing nutrition details */}
          </NutritionInfo>
        </MealCard>
      </View>
    </View>
  )
}

// Maintain existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mealsSection: {
    paddingHorizontal: 16,
  },
})

export default Food 