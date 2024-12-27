# Calorie Tracking Sync Plan

## Current Implementation Analysis
1. The `CalorieTrackerCard` component currently receives `targetCalories` as a prop
2. Profile screen calculates recommended calories using `calculateRecommendedCalories` utility
3. The dashboard was using a hardcoded 2000 calorie limit

## Implementation Plan

### Phase 1: Context Setup [COMPLETED]
1. Create/Update Profile Context
   - [x] Analyze current ProfileContext implementation
   - [x] Review profile calculation utilities
   - [x] Add recommended calories to ProfileContext
   - [x] Implement calorie calculation in userProfileService
   - [x] Add proper error handling and loading states

### Phase 2: Dashboard Integration [COMPLETED]
1. Update DashboardScreen
   - [x] Import and use ProfileContext
   - [x] Replace hardcoded 2000 calories with user's recommended calories
   - [x] Add proper error handling for cases where profile data isn't loaded

### Phase 3: State Management [COMPLETED]
1. Implement Proper State Updates
   - [x] Ensure calorie updates are reflected immediately across components
   - [x] Add loading states while calculations are being performed
   - [x] Handle edge cases (no profile data, incomplete data)

### Phase 4: Testing [IN PROGRESS]
1. Test Implementation
   - [ ] Verify calorie sync across screens
   - [ ] Test different user profiles and goals
   - [ ] Ensure no UI/UX changes as per requirements

## Implementation Progress

### Completed Changes
1. Added useProfile hook to DashboardScreen
2. Updated loadTodayStats to use profile-based calorie calculation
3. Added fallback values for cases where profile data isn't available
4. Ensured no UI/UX changes were made
5. Maintained all existing functionality

### Next Steps
1. Test the implementation with different user profiles
2. Verify calorie syncing works correctly
3. Test edge cases and error handling
