# Calorie Tracking Synchronization Fix

## 1. Root Cause Analysis

### 1.1 Problem Statement
The user's daily calorie recommendation is not syncing properly between components in the application. When a user updates their profile, the new calorie target is not reflected in the calorie tracker on the dashboard.

### 1.2 Current Data Flow
1. **Profile Updates**:
   - User updates profile in `ProfileScreen`
   - Changes are saved via `userProfileService.createUserProfile()`
   - `onboardingData` is updated in `OnboardingContext`

2. **Calorie Calculation**:
   - `useCalorieTracking` hook calculates target calories
   - Initial value is hardcoded to 1726
   - Recalculation happens when `onboardingData` changes

3. **Data Propagation**:
   - `MealContext` uses `useCalorieTracking` hook
   - `CalorieTrackerCard` gets data from `MealContext`
   - `nutritionGoals` are derived from `calorieData`

### 1.3 Identified Issues
1. **Initialization Timing**:
   - `useCalorieTracking` sets initial value before profile data loads
   - No proper synchronization between profile updates and calorie recalculation

2. **Data Persistence**:
   - Calorie data is stored in AsyncStorage
   - Updates to profile don't trigger immediate recalculation
   - Stale data can persist between sessions

3. **Multiple Sources of Truth**:
   - Profile screen calculates calories independently
   - `useCalorieTracking` has its own calculation
   - No centralized calculation service

## 2. Implementation Plan

### Phase 1: Centralize Calorie Calculations ✅
**Goal**: Create a single source of truth for all calorie-related calculations.

#### Steps:
1. Create Calorie Service: ✅
   ```typescript
   // src/services/calorieService.ts
   - Move all calorie calculations to a single service ✅
   - Implement standardized calculation methods ✅
   - Add validation and error handling ✅
   ```

2. Update Hooks: ✅
   ```typescript
   // src/hooks/useCalorieTracking.ts
   - Remove duplicate calculations ✅
   - Use calorieService for all calculations ✅
   - Implement proper initialization ✅
   ```

3. Update Components: ✅
   ```typescript
   // Update ProfileScreen and EditProfileScreen
   - Use calorieService for calculations ✅
   - Fix type definitions ✅
   - Handle edge cases (e.g., 'OTHER' gender) ✅
   ```

### Phase 2: Implement Real-Time Updates
**Goal**: Ensure immediate synchronization of calorie data across components.

#### Steps:
1. Update Profile Service:
   ```typescript
   // src/services/userProfileService.ts
   - Add event emitter for profile updates
   - Trigger calorie recalculation on changes
   ```

2. Enhance MealContext:
   ```typescript
   // src/contexts/MealContext.tsx
   - Subscribe to profile update events
   - Update nutrition goals immediately
   - Implement proper error handling
   ```

### Phase 3: Improve Data Persistence
**Goal**: Ensure consistent data storage and retrieval.

#### Steps:
1. Update Storage Strategy:
   ```typescript
   // src/utils/storage.ts
   - Implement versioned storage
   - Add data validation
   - Handle migration of old data
   ```

2. Enhance Synchronization:
   ```typescript
   // src/hooks/useCalorieTracking.ts
   - Add proper loading states
   - Handle race conditions
   - Implement retry mechanisms
   ```

### Phase 4: Testing and Validation
**Goal**: Ensure reliability and accuracy of the implementation.

#### Steps:
1. Test Cases:
   - Profile updates
   - App restart scenarios
   - Edge cases (missing data)
   - Performance testing

2. Validation:
   - UI/UX consistency
   - Data accuracy
   - Error handling
   - Performance metrics

## 3. Implementation Steps

### 3.1 Phase 1 Implementation ✅
1. Create new calorie service file ✅
2. Move calculation logic ✅
3. Add validation ✅
4. Update existing components ✅

### 3.2 Phase 2 Implementation
1. Modify profile updates
2. Implement event system
3. Update context providers
4. Test synchronization

### 3.3 Phase 3 Implementation
1. Update storage structure
2. Add validation
3. Implement migration
4. Test persistence

### 3.4 Phase 4 Implementation
1. Write test cases
2. Perform validation
3. Fix any issues
4. Document changes

## 4. Success Criteria
1. Profile updates reflect immediately in calorie tracker
2. Consistent calculations across app
3. Proper error handling
4. No UI/UX changes
5. Improved maintainability

## 5. Monitoring and Maintenance
1. Add logging for critical operations
2. Monitor performance metrics
3. Track error rates
4. Plan for future scaling

## 6. Timeline
- Phase 1: 2 days ✅
- Phase 2: 2 days
- Phase 3: 1 day
- Phase 4: 2 days
Total: 7 days

## 7. Risk Management
1. **Data Migration**:
   - Backup existing data
   - Implement rollback mechanism
   - Test migration thoroughly

2. **Performance**:
   - Monitor calculation overhead
   - Implement caching if needed
   - Profile critical operations

3. **User Experience**:
   - Maintain existing UI/UX
   - Add loading states
   - Handle edge cases gracefully