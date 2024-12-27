# Macronutrients Implementation Plan

## Overview
This document outlines the plan for implementing macronutrient calculations and tracking in the Future Fitness application, integrating it with the existing calorie tracking system.

## Current System Analysis
- We already have calorie calculations based on user's onboarding data (height, weight, age, gender, activity level, and goals)
- Calorie tracking component exists on dashboard with basic macro tracking
- Basic macro distribution is already implemented but needs enhancement

## Implementation Phases

### Phase 1: Enhanced Macronutrient Calculation
1. Update `profileCalculations.ts`:
   - Enhance `calculateMacroDistribution` function
   - Add more precise calculations based on:
     - User's weight goal (bulk/cut/maintain)
     - Activity level
     - Body composition
     - Training intensity

2. Calculation Formulas:
   - **Protein**: 
     - Weight loss: 2.2-2.4g per kg of body weight
     - Maintenance: 1.8-2.0g per kg of body weight
     - Weight gain: 2.0-2.2g per kg of body weight
   - **Fats**:
     - Minimum: 0.8g per kg of body weight
     - Range: 20-30% of total calories
   - **Carbs**:
     - Remaining calories after protein and fat allocation
     - Adjust based on activity level and goals

### Phase 2: Data Structure Updates
1. Update Types:
   - Enhance `MacroData` interface in `useCalorieTracking.ts`
   - Add new fields for macro targets and actual consumption
   - Add macro breakdown for each meal

2. Storage Updates:
   - Modify AsyncStorage structure to store detailed macro data
   - Add version control for data structure updates

### Phase 3: UI/UX Implementation
1. Update CalorieTrackerCard:
   - Add detailed macro breakdown
   - Show progress bars for each macro
   - Add tooltips with recommended ranges

2. Add New Components:
   - MacronutrientBreakdown component
   - Detailed macro analytics view
   - Meal macro distribution view

### Phase 4: Integration with Meal Tracking
1. Update Meal Logging:
   - Add macro information to meal entries
   - Implement macro calculation for custom meals
   - Add macro information to food database

2. Enhance Dashboard:
   - Show macro progress alongside calorie progress
   - Add macro-specific insights and recommendations
   - Implement macro trend analysis

### Phase 5: Testing and Validation
1. Unit Tests:
   - Test all calculation functions
   - Validate edge cases
   - Test data persistence

2. Integration Tests:
   - Test UI updates
   - Validate data flow
   - Test synchronization between components

3. User Testing:
   - Validate accuracy of recommendations
   - Test usability of new features
   - Gather feedback on UI/UX

## Technical Dependencies
- Update existing calculation utilities
- Enhance storage mechanisms
- Add new UI components
- Update type definitions

## Success Metrics
- Accurate macro calculations based on user profile
- Seamless integration with existing calorie tracking
- Intuitive UI for macro tracking
- Positive user feedback on new features

## Timeline
- Phase 1: 1 week
- Phase 2: 1 week
- Phase 3: 2 weeks
- Phase 4: 2 weeks
- Phase 5: 1 week

Total estimated time: 7 weeks 