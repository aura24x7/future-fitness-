import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { useTheme } from '../theme/ThemeProvider'
import {
  SummaryCard,
  MealSectionCard,
  FoodItemRow,
  MacroDisplay,
  FoodLogText,
  NavButton
} from '../components/themed/FoodLogComponents'

export const FoodLog = () => {
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? 'dark' : 'light'

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <NavButton theme={theme}>
          <FoodLogText theme={theme} variant="title">
            Food Log
          </FoodLogText>
        </NavButton>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <NavButton theme={theme}>
          {/* Left arrow */}
        </NavButton>
        <FoodLogText theme={theme} variant="sectionTitle">
          Tuesday, December 10 (Today)
        </FoodLogText>
        <NavButton theme={theme}>
          {/* Right arrow */}
        </NavButton>
      </View>

      <ScrollView style={styles.content}>
        {/* Daily Summary */}
        <SummaryCard theme={theme}>
          <FoodLogText theme={theme} variant="sectionTitle">
            Daily Summary
          </FoodLogText>
          <View style={styles.macroRow}>
            <MacroDisplay>
              <FoodLogText theme={theme} variant="macroValue">
                0
              </FoodLogText>
              <FoodLogText theme={theme} variant="macroLabel">
                Calories
              </FoodLogText>
            </MacroDisplay>
            <MacroDisplay>
              <FoodLogText theme={theme} variant="macroValue">
                0.0g
              </FoodLogText>
              <FoodLogText theme={theme} variant="macroLabel">
                Protein
              </FoodLogText>
            </MacroDisplay>
            <MacroDisplay>
              <FoodLogText theme={theme} variant="macroValue">
                0.0g
              </FoodLogText>
              <FoodLogText theme={theme} variant="macroLabel">
                Carbs
              </FoodLogText>
            </MacroDisplay>
            <MacroDisplay>
              <FoodLogText theme={theme} variant="macroValue">
                0.0g
              </FoodLogText>
              <FoodLogText theme={theme} variant="macroLabel">
                Fat
              </FoodLogText>
            </MacroDisplay>
          </View>
        </SummaryCard>

        {/* Meals */}
        <MealSectionCard theme={theme}>
          <View style={styles.mealHeader}>
            <FoodLogText theme={theme} variant="sectionTitle">
              Breakfast
            </FoodLogText>
            {/* Add button */}
          </View>
          <FoodItemRow theme={theme}>
            <View style={styles.foodInfo}>
              <FoodLogText theme={theme} variant="foodName">
                Idli with Sambar and Chutney
              </FoodLogText>
              <FoodLogText theme={theme} variant="calories">
                518 cal
              </FoodLogText>
            </View>
            <View style={styles.macroInfo}>
              <FoodLogText theme={theme} variant="macroLabel">
                P: 17g • C: 72g • F: 18g
              </FoodLogText>
            </View>
          </FoodItemRow>
        </MealSectionCard>

        {/* Repeat for Lunch */}
        <MealSectionCard theme={theme}>
          <View style={styles.mealHeader}>
            <FoodLogText theme={theme} variant="sectionTitle">
              Lunch
            </FoodLogText>
          </View>
          <FoodItemRow theme={theme}>
            <View style={styles.foodInfo}>
              <FoodLogText theme={theme} variant="foodName">
                Vegetable Pulao with Raita
              </FoodLogText>
              <FoodLogText theme={theme} variant="calories">
                602 cal
              </FoodLogText>
            </View>
            <View style={styles.macroInfo}>
              <FoodLogText theme={theme} variant="macroLabel">
                P: 20g • C: 90g • F: 18g
              </FoodLogText>
            </View>
          </FoodItemRow>
        </MealSectionCard>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
  },
  macroInfo: {
    marginLeft: 8,
  },
})

export default FoodLog 