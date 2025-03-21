import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { collection, doc, setDoc, getDoc, query, where, getDocs, Timestamp, writeBatch, FirestoreDataConverter, deleteDoc } from '@react-native-firebase/firestore';
import { MealDocument } from '../types/meal';
import { SyncOptions } from '../types/sync';
import SyncService from './syncService';
import { analyticsService } from './analyticsService';
import offlineQueueService from './offlineQueueService';
import NetInfo from '@react-native-community/netinfo';

interface PendingOperation {
  type: 'create' | 'update' | 'delete';
  timestamp: string;
}

interface LocalMealDocument extends MealDocument {
  localId: string;
  lastSynced: string;
  pendingOperations: PendingOperation[];
  metadata?: MealMetadata;
  [key: string]: any; // Allow dynamic field access
}

interface MealData {
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  version?: number;
  [key: string]: any;
}

interface StorageUsageData {
  totalDocuments: number;
  totalSize: number;
  collectionName: string;
  syncOptions?: SyncOptions;
}

interface FetchError extends Error {
  code?: string;
}

function isFetchError(error: unknown): error is FetchError {
  return error instanceof Error && ('code' in error || true);
}

interface VersionInfo {
  version: number;
  lastModified: string;
  modifiedBy: string;
  deviceId: string;
}

interface MealMetadata {
  conflictResolutions?: {
    timestamp: string;
    resolvedBy: string;
    previousVersions: string[];
  }[];
  versionHistory?: VersionInfo[];
  integrityChecks?: {
    timestamp: string;
    status: "passed" | "failed";
    issues?: string[];
  }[];
}

const STORAGE_KEYS = {
  MEALS: (userId: string) => `@meals:${userId}`,
  PENDING_OPS: '@pendingOperations',
};

export class MealStorageService {
  private static instance: MealStorageService;
  private syncService: SyncService;
  private networkListener: any;
  private isOnline: boolean = true;
  private isFirstLoad: boolean = true;

  private constructor() {
    this.syncService = SyncService.getInstance();
    this.setupNetworkListener();
    this.checkFirstLoad();
  }

  static getInstance(): MealStorageService {
    if (!MealStorageService.instance) {
      MealStorageService.instance = new MealStorageService();
    }
    return MealStorageService.instance;
  }

  private getCurrentUserId(): string {
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');
    return user.uid;
  }

  private async getLocalMeals(): Promise<Record<string, LocalMealDocument>> {
    const userId = this.getCurrentUserId();
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.MEALS(userId));
    return stored ? JSON.parse(stored) : {};
  }

  private async saveLocalMeals(meals: Record<string, LocalMealDocument>): Promise<void> {
    const userId = this.getCurrentUserId();
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS(userId), JSON.stringify(meals));
  }

  private async checkFirstLoad(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const firstLoadKey = `@first_load_${userId}`;
      const hasLoaded = await AsyncStorage.getItem(firstLoadKey);
      
      if (!hasLoaded) {
        this.isFirstLoad = true;
        // Will trigger full sync on first network connection
      }
    } catch (error) {
      console.error('[MealStorage] Error checking first load:', error);
    }
  }

  private setupNetworkListener(): void {
    this.networkListener = NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = !!state.isConnected;
      
      if (this.isOnline && (wasOffline || this.isFirstLoad)) {
        this.forceFullSync();
        this.isFirstLoad = false;
      }
    });
  }

  private async forceFullSync(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      console.log('[MealStorage] Performing full sync for user:', userId);
      
      // Force load all historical data
      await this.loadUserMeals();
      
      // Mark first load complete
      const firstLoadKey = `@first_load_${userId}`;
      await AsyncStorage.setItem(firstLoadKey, 'true');
      
      // Trigger analytics refresh
      await analyticsService.refreshData();
      
      console.log('[MealStorage] Full sync completed');
    } catch (error) {
      console.error('[MealStorage] Error during full sync:', error);
    }
  }

  private async processPendingOperations(): Promise<void> {
    const meals = await this.getLocalMeals();
    const pendingMeals = Object.values(meals).filter(meal => 
      meal.pendingOperations && meal.pendingOperations.length > 0
    );

    for (const meal of pendingMeals) {
      const lastOperation = meal.pendingOperations[meal.pendingOperations.length - 1];
      await offlineQueueService.enqueueOperation({
        id: meal.id,
        collection: 'meals',
        operation: lastOperation.type,
        data: meal,
        priority: 'high'
      });
    }
  }

  async addMeal(meal: Omit<MealDocument, 'id' | 'userId' | 'syncStatus' | 'version'>): Promise<string> {
    const userId = this.getCurrentUserId();
    console.log(`[MealStorage] Adding meal for user: ${userId}`);
    const now = Timestamp.now();
    
    // Create a new document reference in Firestore
    const mealsRef = collection(firestore(), 'users', userId, 'meals');
    const newDocRef = doc(mealsRef);
    console.log(`[MealStorage] Created doc reference: ${newDocRef.path}`);

    const newMeal: LocalMealDocument = {
      ...meal,
      id: newDocRef.id,
      localId: `local_${Date.now()}`,
      userId,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      version: 1,
      pendingOperations: [{
        type: 'create',
        timestamp: new Date().toISOString(),
      }],
    };

    // Save locally first
    const meals = await this.getLocalMeals();
    meals[newMeal.id] = newMeal;
    await this.saveLocalMeals(meals);
    console.log(`[MealStorage] Saved meal locally: ${newDocRef.id}`);

    // If offline, queue the operation
    if (!this.isOnline) {
      await offlineQueueService.enqueueOperation({
        id: newMeal.id,
        collection: 'meals',
        operation: 'create',
        data: newMeal,
        priority: 'high'
      });
      return newMeal.id;
    }

    // If online, try to save to Firestore
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`[MealStorage] Attempting to save meal to Firestore (attempt ${retryCount + 1}): ${newDocRef.id}`);
        
        await setDoc(newDocRef, {
          ...newMeal,
          pendingOperations: undefined,
          localId: undefined,
          lastSynced: undefined,
        });

        // Verify the save was successful
        const savedDoc = await getDoc(newDocRef);
        if (!savedDoc.exists()) {
          throw new Error('Verification failed: Document not found after save');
        }

        console.log(`[MealStorage] Successfully saved and verified meal in Firestore: ${newDocRef.id}`);

        // Log analytics
        await analyticsService.logStorageUsage({
          totalDocuments: Object.keys(meals).length,
          totalSize: 0,
          collectionName: 'meals',
        });

        return newMeal.id;
      } catch (error: unknown) {
        console.error(`[MealStorage] Error saving meal to Firestore (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount === maxRetries) {
          console.log(`[MealStorage] Max retries reached, queueing for later sync`);
          
          await offlineQueueService.enqueueOperation({
            id: newMeal.id,
            collection: 'meals',
            operation: 'create',
            data: newMeal,
            priority: 'high'
          });

          const errorCode = isFetchError(error) ? (error.code || 'UNKNOWN') : 'UNKNOWN';
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

          await analyticsService.logSyncError({
            operation: 'create',
            errorCode,
            errorMessage,
          });
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    return newMeal.id;
  }

  async updateMeal(id: string, updates: Partial<Omit<MealDocument, 'id' | 'userId' | 'version'>>): Promise<void> {
    const userId = this.getCurrentUserId();
    const meals = await this.getLocalMeals();
    const meal = meals[id];
    
    if (!meal) throw new Error('Meal not found');

    const updatedMeal: LocalMealDocument = {
      ...meal,
      ...updates,
      updatedAt: Timestamp.now(),
      syncStatus: 'pending',
      version: meal.version + 1,
      pendingOperations: [
        ...(meal.pendingOperations || []),
        {
          type: 'update',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      // Update in Firestore first
      const mealRef = doc(firestore(), `users/${userId}/meals/${id}`);
      await setDoc(mealRef, {
        ...updatedMeal,
        pendingOperations: undefined,
        localId: undefined,
        lastSynced: undefined,
      }, { merge: true });

      // Then update locally
      meals[id] = updatedMeal;
      await this.saveLocalMeals(meals);

      // Schedule sync for later
      await this.syncService.scheduleSync({
        id: updatedMeal.id,
        collection: 'meals',
        document: updatedMeal,
      }, 'update');
    } catch (error) {
      console.error('Error updating meal:', error);
      // Still update locally if Firestore fails
      meals[id] = updatedMeal;
      await this.saveLocalMeals(meals);

      // Schedule sync for later
      await this.syncService.scheduleSync({
        id: updatedMeal.id,
        collection: 'meals',
        document: updatedMeal,
      }, 'update');
    }
  }

  async deleteMeal(id: string): Promise<void> {
    const userId = this.getCurrentUserId();
    const meals = await this.getLocalMeals();
    const meal = meals[id];
    
    if (!meal) throw new Error('Meal not found');

    try {
      console.log(`[MealStorage] Deleting meal: ${id}`);
      
      // If online, delete from Firestore first
      if (this.isOnline) {
        try {
          const mealRef = doc(firestore(), `users/${userId}/meals/${id}`);
          await deleteDoc(mealRef);
          console.log(`[MealStorage] Successfully deleted meal from Firestore: ${id}`);
          
          // Delete locally after successful Firestore deletion
          delete meals[id];
          await this.saveLocalMeals(meals);
          
          // Trigger analytics refresh
          await analyticsService.refreshData();
        } catch (error) {
          console.error('[MealStorage] Error deleting from Firestore:', error);
          // If Firestore delete fails, queue for later deletion and keep local copy
          await this.queueForDeletion(meal);
          throw new Error('Failed to delete from Firestore');
        }
      } else {
        // If offline, delete locally and queue for later deletion
        delete meals[id];
        await this.saveLocalMeals(meals);
        await this.queueForDeletion(meal);
      }

      // Clear any cached data
      await this.clearCaches();
    } catch (error) {
      console.error('[MealStorage] Error in deleteMeal:', error);
      throw error;
    }
  }

  private async queueForDeletion(meal: LocalMealDocument): Promise<void> {
    console.log(`[MealStorage] Queueing meal for deletion: ${meal.id}`);
    
    // Mark for deletion
    meal.syncStatus = 'pending';
    meal.pendingOperations = [
      ...(meal.pendingOperations || []),
      {
        type: 'delete',
        timestamp: new Date().toISOString(),
      },
    ];

    // Add to offline queue
    await offlineQueueService.enqueueOperation({
      id: meal.id,
      collection: 'meals',
      operation: 'delete',
      data: meal,
      priority: 'high'
    });

    // Schedule sync for later
    await this.syncService.scheduleSync({
      id: meal.id,
      collection: 'meals',
      document: meal,
    }, 'delete');
  }

  private async clearCaches(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const cacheKeys = [
        `@meals_cache_${userId}`,
        `@daily_meals_${userId}`,
        `@weekly_meals_${userId}`,
        `@monthly_meals_${userId}`
      ];
      
      await Promise.all(cacheKeys.map(key => AsyncStorage.removeItem(key)));
    } catch (error) {
      console.error('[MealStorage] Error clearing caches:', error);
    }
  }

  async getMeal(id: string): Promise<MealDocument | null> {
    try {
      const userId = this.getCurrentUserId();
      // Try to get from Firestore first
      const mealRef = doc(firestore(), `users/${userId}/meals/${id}`);
      const snapshot = await getDoc(mealRef);
      
      if (snapshot.exists()) {
        return snapshot.data() as MealDocument;
      }

      // If not in Firestore, check local storage
      const meals = await this.getLocalMeals();
      return meals[id] || null;
    } catch (error) {
      console.error('Error getting meal:', error);
      // Fallback to local storage if Firestore fails
      const meals = await this.getLocalMeals();
      return meals[id] || null;
    }
  }

  async getMealsInRange(startDate: Date, endDate: Date): Promise<MealDocument[]> {
    try {
      const userId = this.getCurrentUserId();
      // Try to get from Firestore first
      const mealsRef = collection(firestore(), 'users', userId, 'meals');
      const q = query(
        mealsRef,
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      const firestoreMeals = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as MealDocument));

      // Merge with local meals
      const localMeals = await this.getLocalMeals();
      const localMealsInRange = Object.values(localMeals).filter(meal => {
        const mealDate = meal.timestamp.toDate();
        return mealDate >= startDate && mealDate <= endDate;
      });

      // Combine and deduplicate meals
      const allMeals = [...firestoreMeals, ...localMealsInRange];
      const uniqueMeals = allMeals.reduce((acc, meal) => {
        if (!acc[meal.id] || acc[meal.id].version < meal.version) {
          acc[meal.id] = meal;
        }
        return acc;
      }, {} as Record<string, MealDocument>);

      return Object.values(uniqueMeals).sort(
        (a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
      );
    } catch (error) {
      console.error('Error getting meals in range:', error);
      // Fallback to local storage if Firestore fails
      const meals = await this.getLocalMeals();
      return Object.values(meals).filter(meal => {
        const mealDate = meal.timestamp.toDate();
        return mealDate >= startDate && mealDate <= endDate;
      }).sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime());
    }
  }

  async loadUserMeals(): Promise<void> {
    let retryAttempt = 0;
    const maxRetries = 3;
    const retryDelay = 1000;

    while (retryAttempt <= maxRetries) {
      try {
        const userId = this.getCurrentUserId();
        console.log(`[MealStorage] Loading meals for user: ${userId} (Attempt ${retryAttempt + 1}/${maxRetries + 1})`);
        
        // Get existing local meals with validation
        const localMeals = await this.getLocalMeals();
        console.log(`[MealStorage] Found ${Object.keys(localMeals).length} meals in local storage`);
        
        // Handle any corrupted or missing data
        await this.handleMissingData(userId, localMeals);
        
        // Verify user document with retry
        const userDocRef = doc(firestore(), 'users', userId);
        await this.retryOperation(async () => {
          await setDoc(userDocRef, {
            lastUpdated: Timestamp.now()
          }, { merge: true });
        }, 2);
        console.log(`[MealStorage] User document verified/created`);
        
        // Get meals collection with validation
        const mealsRef = collection(firestore(), 'users', userId, 'meals');
        console.log(`[MealStorage] Fetching meals from: ${mealsRef.path}`);
        
        // Fetch meals with timeout
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 10000)
        );
        const fetchPromise = getDocs(mealsRef);
        
        const snapshot = await Promise.race([fetchPromise, timeoutPromise])
          .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[MealStorage] Error fetching meals:`, errorMessage);
            if (retryAttempt < maxRetries) {
              retryAttempt++;
              return null;
            }
            throw new Error(errorMessage);
          });
        
        if (!snapshot) continue;
        
        console.log(`[MealStorage] Found ${snapshot.docs.length} meals in Firestore`);
        
        // Enhanced validation and merge
        let mergedCount = 0;
        let validationErrors = 0;
        let integrityErrors = 0;
        
        const processedMeals = new Set<string>();
        const updatedMeals = { ...localMeals };
        
        for (const doc of snapshot.docs) {
          try {
            const data = doc.data() as MealData;
            
            // Enhanced validation with type checking
            if (!this.validateMealDocument(data)) {
              console.warn(`[MealStorage] Validation failed for meal: ${doc.id}`);
              validationErrors++;
              continue;
            }

            const firestoreMeal: MealDocument = {
              id: doc.id,
              userId: data.userId,
              name: data.name,
              calories: data.calories,
              protein: data.protein,
              carbs: data.carbs,
              fat: data.fat,
              timestamp: data.timestamp || Timestamp.now(),
              createdAt: data.createdAt || Timestamp.now(),
              updatedAt: data.updatedAt || Timestamp.now(),
              version: data.version || 1,
              syncStatus: 'synced',
              localId: `local_${Date.now()}`,
              lastSynced: new Date().toISOString(),
              pendingOperations: []
            };

            const { merged, action } = await this.mergeMealDocuments(
              localMeals[doc.id],
              firestoreMeal,
              processedMeals
            );

            if (action === 'skipped') {
              integrityErrors++;
            } else {
              updatedMeals[doc.id] = merged;
              mergedCount++;
            }
          } catch (error) {
            console.error(`[MealStorage] Error processing meal ${doc.id}:`, error);
            validationErrors++;
          }
        }
        
        // Save merged meals with retry
        await this.retryOperation(async () => {
          await this.saveLocalMeals(updatedMeals);
        }, 2);
        
        console.log(`[MealStorage] Merged and saved ${mergedCount} meals to local storage`);
        if (validationErrors > 0) {
          console.warn(`[MealStorage] Encountered ${validationErrors} validation errors`);
        }
        if (integrityErrors > 0) {
          console.warn(`[MealStorage] Encountered ${integrityErrors} integrity errors`);
        }

        // Success - exit retry loop
        break;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[MealStorage] Error in loadUserMeals (Attempt ${retryAttempt + 1}/${maxRetries + 1}):`, errorMessage);
        
        if (retryAttempt < maxRetries) {
          retryAttempt++;
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryAttempt));
        } else {
          console.log(`[MealStorage] Using cached data after all retries failed`);
        }
      }
    }
  }

  // Helper method for retrying operations
  private async retryOperation(operation: () => Promise<any>, maxRetries: number): Promise<any> {
    let lastError: unknown;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    throw lastError;
  }

  private validateMealDocument(data: any): boolean {
    // Required fields validation
    const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'userId'];
    const hasRequiredFields = requiredFields.every(field => {
      const value = data[field];
      return value !== undefined && value !== null;
    });

    if (!hasRequiredFields) {
      console.warn('[MealStorage] Missing required fields in meal document');
      return false;
    }

    // Numeric fields validation
    const numericFields = ['calories', 'protein', 'carbs', 'fat'];
    const validNumericFields = numericFields.every(field => {
      const value = data[field];
      return typeof value === 'number' && !isNaN(value) && value >= 0 && value < 100000; // Reasonable upper limit
    });

    if (!validNumericFields) {
      console.warn('[MealStorage] Invalid numeric values in meal document');
      return false;
    }

    // Timestamp validation
    const timestampFields = ['timestamp', 'createdAt', 'updatedAt'];
    const validTimestamps = timestampFields.every(field => {
      const value = data[field];
      return !value || (value instanceof Timestamp && value.toDate() <= new Date());
    });

    if (!validTimestamps) {
      console.warn('[MealStorage] Invalid timestamp values in meal document');
      return false;
    }

    // Version validation
    if (data.version !== undefined && (!Number.isInteger(data.version) || data.version < 1)) {
      console.warn('[MealStorage] Invalid version number in meal document');
      return false;
    }

    return true;
  }

  private async updateVersionAndMetadata(
    meal: LocalMealDocument,
    operation: 'create' | 'update' | 'delete'
  ): Promise<LocalMealDocument> {
    const deviceId = await AsyncStorage.getItem('@device_id') || `device_${Date.now()}`;
    const userId = this.getCurrentUserId();
    
    const versionInfo: VersionInfo = {
      version: (meal.version || 1) + 1,
      lastModified: new Date().toISOString(),
      modifiedBy: userId,
      deviceId
    };

    // Initialize metadata with empty arrays if not present
    const metadata: Required<MealMetadata> = {
      versionHistory: [],
      integrityChecks: [],
      conflictResolutions: []
    };

    // Safely copy existing metadata if present
    if (meal.metadata) {
      if (meal.metadata.versionHistory) {
        metadata.versionHistory = [...meal.metadata.versionHistory];
      }
      if (meal.metadata.integrityChecks) {
        metadata.integrityChecks = [...meal.metadata.integrityChecks];
      }
      if (meal.metadata.conflictResolutions) {
        metadata.conflictResolutions = [...meal.metadata.conflictResolutions];
      }
    }

    metadata.versionHistory.push(versionInfo);

    // Add integrity check
    const integrityCheck = await this.performIntegrityCheck(meal);
    metadata.integrityChecks.push({
      timestamp: new Date().toISOString(),
      status: integrityCheck.passed ? 'passed' : 'failed',
      issues: integrityCheck.issues
    });

    return {
      ...meal,
      version: versionInfo.version,
      updatedAt: Timestamp.now(),
      metadata,
      syncStatus: 'pending'
    };
  }

  private async performIntegrityCheck(meal: LocalMealDocument): Promise<{ passed: boolean; issues?: string[] }> {
    const issues: string[] = [];

    // Check required fields
    const requiredFields = ['id', 'userId', 'name', 'calories', 'protein', 'carbs', 'fat'];
    for (const field of requiredFields) {
      if (meal[field] === undefined || meal[field] === null) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    // Validate numeric values
    const numericFields = ['calories', 'protein', 'carbs', 'fat'];
    for (const field of numericFields) {
      const value = meal[field];
      if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100000) {
        issues.push(`Invalid numeric value for ${field}: ${value}`);
      }
    }

    // Validate timestamps
    const timestampFields = ['timestamp', 'createdAt', 'updatedAt'];
    for (const field of timestampFields) {
      const value = meal[field];
      if (!(value instanceof Timestamp) || value.toDate() > new Date()) {
        issues.push(`Invalid timestamp for ${field}`);
      }
    }

    // Check version consistency
    if (!meal.version || meal.version < 1) {
      issues.push(`Invalid version number: ${meal.version}`);
    }

    // Verify metadata integrity if it exists
    if (meal.metadata?.versionHistory?.length) {
      const versions = meal.metadata.versionHistory.map(v => v.version);
      const isSequential = versions.every((v, i) => i === 0 || v === versions[i - 1] + 1);
      if (!isSequential) {
        issues.push('Version history is not sequential');
      }
    }

    return {
      passed: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  private async resolveConflicts(
    localMeal: LocalMealDocument,
    remoteMeal: MealDocument
  ): Promise<LocalMealDocument> {
    // If versions are the same, use the most recently updated one
    if (localMeal.version === remoteMeal.version) {
      if (remoteMeal.updatedAt > localMeal.updatedAt) {
        return {
          ...remoteMeal,
          localId: localMeal.localId,
          pendingOperations: localMeal.pendingOperations,
          metadata: {
            ...localMeal.metadata,
            conflictResolutions: [
              ...(localMeal.metadata?.conflictResolutions || []),
              {
                timestamp: new Date().toISOString(),
                resolvedBy: 'system',
                previousVersions: [localMeal.version.toString()]
              }
            ]
          }
        } as LocalMealDocument;
      }
      return localMeal;
    }

    // If remote version is newer, merge changes
    if (remoteMeal.version > localMeal.version) {
      const mergedMeal: LocalMealDocument = {
        ...remoteMeal,
        localId: localMeal.localId,
        pendingOperations: localMeal.pendingOperations,
        metadata: {
          ...localMeal.metadata,
          conflictResolutions: [
            ...(localMeal.metadata?.conflictResolutions || []),
            {
              timestamp: new Date().toISOString(),
              resolvedBy: 'system',
              previousVersions: [localMeal.version.toString()]
            }
          ]
        }
      };

      // Perform integrity check after merge
      const integrityCheck = await this.performIntegrityCheck(mergedMeal);
      if (!integrityCheck.passed) {
        console.warn(`[MealStorage] Integrity check failed after conflict resolution:`, integrityCheck.issues);
        // Keep local version if merge results in integrity issues
        return localMeal;
      }

      return mergedMeal;
    }

    // If local version is newer, keep it
    return localMeal;
  }

  private async mergeMealDocuments(
    localMeal: LocalMealDocument | undefined,
    firestoreMeal: MealDocument,
    processedMeals: Set<string>
  ): Promise<{
    merged: LocalMealDocument;
    action: 'created' | 'updated' | 'skipped';
  }> {
    // Check for duplicate IDs
    if (processedMeals.has(firestoreMeal.id)) {
      console.warn(`[MealStorage] Duplicate meal ID detected: ${firestoreMeal.id}`);
      return {
        merged: localMeal || firestoreMeal as LocalMealDocument,
        action: 'skipped'
      };
    }
    processedMeals.add(firestoreMeal.id);

    // If no local meal exists, use Firestore version
    if (!localMeal) {
      const newLocalMeal: LocalMealDocument = {
        ...firestoreMeal,
        localId: `local_${Date.now()}`,
        lastSynced: new Date().toISOString(),
        pendingOperations: [],
        metadata: {
          versionHistory: [{
            version: firestoreMeal.version,
            lastModified: new Date().toISOString(),
            modifiedBy: firestoreMeal.userId,
            deviceId: 'initial_sync'
          }],
          integrityChecks: []
        }
      };
      return { merged: newLocalMeal, action: 'created' };
    }

    // Resolve any conflicts
    const resolvedMeal = await this.resolveConflicts(localMeal, firestoreMeal);
    return {
      merged: resolvedMeal,
      action: resolvedMeal === localMeal ? 'skipped' : 'updated'
    };
  }

  private async handleMissingData(userId: string, meals: Record<string, LocalMealDocument>): Promise<void> {
    try {
      // Check for corrupted meals
      const corruptedMealIds = Object.entries(meals)
        .filter(([_, meal]) => !this.validateMealDocument(meal))
        .map(([id]) => id);

      if (corruptedMealIds.length > 0) {
        console.warn(`[MealStorage] Found ${corruptedMealIds.length} corrupted meals`);
        
        // Try to recover from Firestore
        for (const mealId of corruptedMealIds) {
          const mealRef = doc(firestore(), `users/${userId}/meals/${mealId}`);
          const snapshot = await getDoc(mealRef);
          
          if (snapshot.exists()) {
            const data = snapshot.data() as MealData;
            if (this.validateMealDocument(data)) {
              meals[mealId] = {
                ...data,
                id: mealId,
                localId: `local_${Date.now()}`,
                lastSynced: new Date().toISOString(),
                pendingOperations: [],
                syncStatus: 'synced'
              } as LocalMealDocument;
              console.log(`[MealStorage] Recovered meal ${mealId} from Firestore`);
            } else {
              // If Firestore data is also corrupted, delete the meal
              delete meals[mealId];
              console.warn(`[MealStorage] Deleted corrupted meal ${mealId}`);
            }
          } else {
            // If meal doesn't exist in Firestore, delete it locally
            delete meals[mealId];
            console.warn(`[MealStorage] Deleted missing meal ${mealId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error handling missing data:', error);
    }
  }

  public cleanup(): void {
    if (this.networkListener) {
      this.networkListener();
    }
  }
}