# Meal Storage Implementation Plan

## Current Implementation Analysis ✅

The app currently uses a hybrid storage approach:
- Primary storage: AsyncStorage for local persistence ✅
- Sync layer: Existing SyncService for offline-first operations ✅
- Data structure: Flat meal documents with basic metadata ✅

## New Implementation Design

### 1. Data Schema ✅

```typescript
// Firestore Schema
interface MealDocument {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  syncStatus: 'pending' | 'synced';
  version: number; // For conflict resolution
}

// Local Schema (AsyncStorage)
interface LocalMealDocument extends MealDocument {
  localId: string; // For tracking local changes
  lastSynced?: string;
  pendingOperations?: Array<{
    type: 'create' | 'update' | 'delete';
    timestamp: string;
  }>;
}
```

### 2. Storage Structure ✅

```
Firestore:
users/{userId}/
├── meals/{mealId}          // Individual meal documents
└── mealSummaries/         // Pre-calculated summaries
    ├── daily/{date}      // Daily aggregates
    └── weekly/{weekId}   // Weekly aggregates

AsyncStorage:
@meals:{userId}           // Local meal cache
@pendingOperations       // Queue of unsynced changes
@lastSyncTimestamp      // Last successful sync
```

### 3. Implementation Steps

#### Phase 1: Firebase Setup (1-2 days) ✅
1. Configure Firestore offline persistence ✅
2. Implement security rules: ✅
```typescript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/meals/{mealId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/mealSummaries/{document=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Server-side only
    }
  }
}
```

#### Phase 2: Local Storage Enhancement (2-3 days) ✅
1. Implement MealStorageService: ✅
```typescript
class MealStorageService {
  async addMeal(meal: Omit<MealDocument, 'id'>): Promise<string>;
  async updateMeal(id: string, updates: Partial<MealDocument>): Promise<void>;
  async deleteMeal(id: string): Promise<void>;
  async getMeal(id: string): Promise<MealDocument | null>;
  async getMealsInRange(startDate: Date, endDate: Date): Promise<MealDocument[]>;
}
```

2. Implement offline queue management ✅
3. Add version control for conflict resolution ✅

#### Phase 3: Sync Implementation (2-3 days) ✅
1. Enhance SyncService for meals ✅
2. Implement conflict resolution strategy ✅
3. Add background sync support ✅

#### Phase 4: Analytics Integration (2-3 days) ✅
1. Implement efficient query methods ✅
2. Add server-side aggregation ✅
3. Cache aggregated results locally ✅

### 4. Key Features

#### Offline Support ✅
- Immediate local storage ✅
- Background sync queue ✅
- Conflict resolution using version numbers ✅
- Automatic retry on connection restore ✅

#### Performance Optimization ✅
- Indexed queries for date ranges ✅
- Pre-calculated summaries ✅
- Batch updates for sync ✅
- Local caching of frequently accessed data ✅

#### Data Integrity ✅
- Atomic transactions for critical updates ✅
- Version control for conflict detection ✅
- Data validation at both client and server ✅
- Automatic error recovery ✅

### 5. Migration Strategy ✅

1. Create new storage service ✅
2. Implement parallel write during transition ✅
3. Migrate existing data in background ✅
4. Switch readers to new system ✅
5. Clean up old data ✅

### 6. Testing Plan ⏳

1. Unit tests for storage operations ⏳
2. Integration tests for sync ⏳
3. Offline scenario testing ⏳
4. Performance benchmarks ⏳
5. Migration testing ⏳

## Implementation Timeline

Total: 7-11 days
- Firebase Setup: 1-2 days ✅
- Local Storage: 2-3 days ✅
- Sync Implementation: 2-3 days ✅
- Analytics Integration: 2-3 days ✅

## Monitoring & Maintenance ✅

1. Add Firebase Analytics events for:
   - Sync operations ✅
   - Conflict resolutions ✅
   - Storage usage ✅
   
2. Monitor:
   - Sync success rate ✅
   - Offline queue size ✅
   - Query performance ✅
   - Storage usage ✅

## Rollback Plan ✅

1. Keep old storage system running in parallel ✅
2. Implement feature flags for gradual rollout ✅
3. Maintain data backups ✅
4. Document rollback procedures ✅

Legend:
✅ - Completed
⏳ - Pending
❌ - Blocked/Issues 