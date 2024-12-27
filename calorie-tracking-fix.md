# Calorie Tracking Synchronization Fix

## Root Cause Analysis
The current calorie tracking system has multiple sources of truth for calorie calculations, leading to inconsistencies across different parts of the application. This causes confusion for users and potential inaccuracies in tracking progress.

## Implementation Plan

### Phase 1: Centralize Calorie Calculations ✅
1. Create a centralized calorie service ✅
   - Implement BMR calculation ✅
   - Implement TDEE calculation ✅
   - Implement macro distribution calculation ✅
   - Add validation for input values ✅

2. Update existing components to use the centralized service ✅
   - Modify useCalorieTracking hook ✅
   - Update CalorieTrackerCard component ✅
   - Update EditProfileScreen ✅
   - Update ProfileScreen ✅

### Phase 2: Implement Real-time Updates ✅
1. Add event emitting capabilities to userProfileService ✅
2. Create event emitter service for handling profile updates ✅
3. Update ProfileContext to subscribe to profile updates ✅
4. Enhance MealContext to subscribe to profile updates ✅
5. Test real-time updates functionality ✅

### Phase 3: Improve Data Persistence
1. Implement local storage caching for profile data ✅
   - Create StorageService for managing local data ✅
   - Add methods for saving and retrieving profile data ✅
   - Implement sync queue for offline changes ✅

2. Add offline support for calorie tracking
   - Create SyncService for managing data synchronization ✅
   - Implement network state detection ✅
   - Add offline queue for profile updates ✅
   - Handle offline meal tracking (pending)

3. Implement sync queue for offline changes ✅
   - Add queue management in StorageService ✅
   - Implement periodic sync in SyncService ✅
   - Handle sync conflicts ✅

4. Add conflict resolution for concurrent updates
   - Implement conflict detection ✅
   - Add conflict resolution strategies (pending)
   - Create UI for manual conflict resolution (pending)

## Success Criteria
- [x] All calorie calculations use the centralized service
- [x] Profile updates trigger immediate UI updates across all components
- [ ] Calorie tracking remains accurate during offline usage
- [ ] No data loss during sync conflicts
- [ ] Improved user experience with consistent calorie data

## Testing Plan
1. Unit tests for calorie calculation functions
2. Integration tests for profile update propagation
3. End-to-end tests for offline functionality
4. Performance testing for sync operations
5. User acceptance testing 