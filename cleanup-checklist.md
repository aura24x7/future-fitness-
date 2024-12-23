# Future Fitness App Cleanup Checklist

## Phase 1: Service Cleanup
### Workout Services (Keep Dashboard UI)
- [x] Remove `src/services/workoutTrackingService.ts`
- [x] Remove `src/services/workoutSocialService.ts`
- [x] Remove `src/services/workoutSharingService.ts`
- [x] Create mock workout service for dashboard
- [x] Update dashboard to use mock data
- [x] Keep workout-related types for future implementation

### Food Services (Keep SimpleFoodLog)
- [x] Keep `src/services/simpleFoodLogService.ts` (actively used in dashboard) ✓ VERIFIED
- [x] Keep `src/services/ai/naturalLanguageFood/naturalLanguageFoodService.ts` (crucial for food recognition) ✓ VERIFIED
- [x] Keep `src/services/foodRecognitionService.ts` (crucial for food scanning) ✓ VERIFIED
- [x] Remove meal plan related services:
  - ✓ Removed `src/services/ai/meal/meal-generator.service.ts`
  - ✓ Removed `src/services/ai/meal/meal-validator.service.ts`
  - ✓ Removed `src/services/ai/meal/meal.service.ts`

### Status Update - Phase 1 (2024-12-22)
1. Completed Actions:
   - Created mockWorkoutService for dashboard
   - Updated dashboard to use mock workout data
   - Removed workout services
   - Removed meal plan services and types
   - Cleaned up workout types:
     - ✓ Removed AI-related workout interfaces
     - ✓ Simplified BaseExercise interface
     - ✓ Kept essential workout types for future use
   - Preserved dashboard UI and functionality

2. Current Status:
   - Dashboard now uses mock data for workout stats
   - All workout services removed
   - All meal plan services and types removed
   - Workout types simplified and cleaned up
   - UI elements preserved
   - Navigation structure maintained
   - Types cleaned up and simplified

3. Next Steps:
   - Test dashboard functionality
   - Verify all UI elements work as expected
   - Clean up any remaining workout-related types

3. Workout Services Analysis:
   a. Services to Remove:
      - `src/services/workoutTrackingService.ts` (requires dashboard modification)
      - `src/services/workoutSocialService.ts` (safe to remove)
      - `src/services/workoutSharingService.ts` (safe to remove)
   
   b. Required Changes:
      - Modify dashboard to use mock data instead of workoutTrackingService
      - Keep workout-related UI components and navigation
      - Preserve mock services used in dashboard

4. Mock Services Analysis:
   - Keep `mockWaterService` (used in dashboard)
   - Keep `mockAuth` (used in dashboard)
   - Move mock services to a dedicated test directory
   - Create separate mock data for dashboard

5. Dashboard Preservation:
   - Keep all UI components
   - Keep navigation structure
   - Replace real services with mock data
   - Ensure calorie tracking and water intake features work

6. Testing Requirements:
   - Verify dashboard loads without errors
   - Check all UI elements are visible
   - Confirm navigation works
   - Test water intake tracking
   - Validate calorie tracking

### Cleanup Mock & Unused Services
- [ ] Remove `src/services/mockData.ts`
- [ ] Remove `src/services/gymBuddyAlertService.ts`
- [ ] Clean up unused AI services in `src/services/ai/*`

## Phase 2: Screen Cleanup
### Workout Screens (Keep Dashboard Button)
- [x] Remove `src/screens/WorkoutScreen.tsx`
- [x] Remove `src/screens/WorkoutDetails.tsx`
- [x] Remove `src/screens/CreateWorkoutScreen.tsx`
- [x] Remove `src/screens/SelectWorkoutScreen.tsx`
- [x] Remove `src/screens/AddCustomWorkoutScreen.tsx`
- [x] Remove `src/screens/ShareWorkoutScreen.tsx`

### Status Update - Phase 2 (2024-12-22)
1. Completed Actions:
   - Removed all workout-related screens
   - Updated navigation configuration:
     - ✓ Removed workout screen imports
     - ✓ Removed workout screen routes
     - ✓ Updated navigation types
   - Preserved dashboard UI and functionality

2. Current Status:
   - All workout screens removed
   - Navigation configuration updated
   - UI elements preserved
   - Dashboard functionality maintained

3. Next Steps:
   - Remove food-related screens (keeping SimpleFoodLog)
   - Update food-related navigation
   - Test remaining navigation paths

### Food Screens (Keep SimpleFoodLog)
- [x] Remove `src/screens/FoodLogScreen.tsx`
- [x] Remove `src/screens/AddCustomMealScreen.tsx`
- [x] Remove `src/screens/TrackMealScreen.tsx`
- [x] Keep `src/screens/FoodScannerScreen.tsx`
- [x] Keep `src/screens/ScannedFoodDetailsScreen.tsx`
- [x] Keep `src/screens/FoodTextInputScreen.tsx`

### Status Update - Food Screens (2024-12-22)
1. Completed Actions:
   - Removed unused food-related screens
   - Updated navigation configuration:
     - ✓ Removed unused screen imports
     - ✓ Removed unused screen routes
     - ✓ Updated navigation types
   - Preserved SimpleFoodLog functionality:
     - ✓ Kept FoodScannerScreen
     - ✓ Kept ScannedFoodDetailsScreen
     - ✓ Kept FoodTextInputScreen

2. Current Status:
   - All unnecessary food screens removed
   - Navigation configuration updated
   - SimpleFoodLog functionality preserved
   - UI elements maintained

3. Next Steps:
   - Remove progress-related screens
   - Update progress-related navigation
   - Test remaining navigation paths

### Progress Screens (Keep Dashboard UI)
- [x] Remove `src/screens/ProgressScreen.tsx`
- [x] Remove `src/components/WorkoutCharts.tsx`
- [x] Remove `src/components/charts/ActivityBarChart.tsx`

### Status Update - Progress Screens (2024-12-22)
1. Completed Actions:
   - Removed progress-related screens and components:
     - ✓ Removed ProgressScreen.tsx
     - ✓ Removed WorkoutCharts.tsx
     - ✓ Removed ActivityBarChart.tsx
   - Updated navigation configuration:
     - ✓ Removed progress screen imports
     - ✓ Removed progress screen routes
     - ✓ Updated navigation types

2. Current Status:
   - All progress-related screens removed
   - Navigation configuration updated
   - Dashboard functionality maintained
   - UI elements preserved

3. Next Steps:
   - Remove deprecated onboarding screens
   - Update onboarding-related navigation
   - Test remaining navigation paths

### Group & Profile Screens (Keep Essential)
- [x] Keep essential group screens:
  - ✓ `src/screens/ProfileGroupsScreen.tsx`
  - ✓ `src/screens/GroupDetailsScreen.tsx`
  - ✓ `src/screens/CreateGroupScreen.tsx`
  - ✓ `src/screens/InviteMembersScreen.tsx`
  - ✓ `src/screens/ManageInvitesScreen.tsx`
  - ✓ `src/screens/AddIndividualScreen.tsx`
- [x] Remove deprecated group screens:
  - ✓ `src/screens/GroupWorkoutsScreen.tsx`
  - ✓ `src/screens/GroupChallengesScreen.tsx`
  - ✓ `src/screens/GroupAnalyticsScreen.tsx`

### Status Update - Group & Profile Screens (2024-12-22)
1. Completed Actions:
   - Removed deprecated group-related screens:
     - ✓ Removed GroupWorkoutsScreen.tsx
     - ✓ Removed GroupChallengesScreen.tsx
     - ✓ Removed GroupAnalyticsScreen.tsx
   - Updated navigation configuration:
     - ✓ Removed deprecated screen imports
     - ✓ Removed deprecated screen routes
     - ✓ Updated navigation types

2. Current Status:
   - All deprecated group screens removed
   - Essential group functionality preserved
   - Navigation configuration updated
   - UI elements maintained

3. Next Steps:
   - Remove deprecated onboarding screens
   - Update onboarding-related navigation
   - Test remaining navigation paths

### Remove Duplicate Screens
- [x] Remove `src/screens/Dashboard.tsx` (keep DashboardScreen.tsx)
- [x] Remove `src/screens/Food.tsx` (redundant)
- [x] Remove `src/screens/FoodLog.tsx` (redundant)
- [x] Remove `src/screens/WelcomeScreen.tsx` (keep onboarding/WelcomeScreen.tsx)

### Status Update - Duplicate Screen Removal (2024-12-22)
1. Completed Actions:
   - Removed duplicate dashboard screen:
     - ✓ Removed Dashboard.tsx (kept DashboardScreen.tsx)
     - ✓ DashboardScreen.tsx has full feature set and UI components
   - Removed duplicate welcome screen:
     - ✓ Removed WelcomeScreen.tsx (kept onboarding/WelcomeScreen.tsx)
     - ✓ onboarding/WelcomeScreen.tsx has better theming and TypeScript support

2. Current Status:
   - No more duplicate screens in the codebase
   - Main screens properly organized in their respective folders
   - Navigation configuration remains intact

3. Next Steps:
   - Remove deprecated onboarding screens
   - Update onboarding-related navigation
   - Test remaining navigation paths

## Phase 3: Component Cleanup
### Workout Components
- [ ] Remove `src/components/WorkoutGeneratorTest.tsx`
- [ ] Remove `src/components/ManualWorkoutForm.tsx`
- [ ] Remove `src/components/ShareWorkoutModal.tsx`
- [ ] Keep workout-related UI components in dashboard

### Food Components
- [ ] Keep `src/components/SimpleFoodLogSection.tsx`
- [ ] Keep `src/components/UndoHistoryViewer.tsx`
- [ ] Keep `src/components/AnimatedFoodLogItem.tsx`
- [ ] Keep food recognition and scanning related components
- [ ] Remove meal plan related components not used in dashboard

### AI Components
- [ ] Remove `src/components/AITest.tsx`
- [ ] Remove `src/components/GeminiTest.tsx`

## Phase 4: Context Cleanup
### Merge Context Directories
- [ ] Move active contexts from `src/context` to `src/contexts`
- [ ] Remove empty `src/context` directory

### Remove Unused Contexts
- [ ] Remove `src/contexts/GymBuddyAlertContext.tsx`

## Phase 5: Type Cleanup
- [x] Keep essential types in `src/types/workout.ts` for future implementation
- [x] Remove unused food-related types except those used by SimpleFoodLog
- [x] Clean up unused interfaces and types

## Important Notes
1. **DO NOT modify**:
   - Dashboard UI and functionality
   - SimpleFoodLog section
   - Food recognition and scanning features
   - Group and profile related features
   - Any UI elements for future features (workout, progress)

2. **Keep for Future**:
   - Basic workout types and interfaces
   - UI components used in dashboard
   - Navigation structure for future features
   - All group and profile related code

3. **Testing Requirements**:
   - After each phase, test dashboard functionality
   - Ensure SimpleFoodLog works correctly
   - Verify food recognition and scanning works
   - Test all group and profile features
   - Verify all UI elements are visible and clickable
