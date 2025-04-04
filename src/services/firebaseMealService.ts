import { SimpleFoodItem } from './simpleFoodLogService';
import { MealDocument } from '../types/meal';
import { firebaseCore } from './firebase/firebaseCore';

// Import from our compatibility layer
import { firestore, auth, Timestamp } from '../firebase/firebaseInstances';

export interface FirebaseMealDocument {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: number;
  servingUnit?: string;
  timestamp: any; // Using 'any' to accommodate both Date and Timestamp
  syncedAt: string;
  version: number;
}

class FirebaseMealService {
  private static instance: FirebaseMealService;
  private activeListeners: Map<string, () => void> = new Map();
  private initialized = false;

  private constructor() {}

  public static getInstance(): FirebaseMealService {
    if (!FirebaseMealService.instance) {
      FirebaseMealService.instance = new FirebaseMealService();
    }
    return FirebaseMealService.instance;
  }

  private async initialize() {
    try {
      if (this.initialized) {
        return;
      }

      // No need to initialize - our compatibility layer handles this
      
      console.log('[FirebaseMealService] Initialized');
      this.initialized = true;
    } catch (error) {
      console.error('[FirebaseMealService] Initialization failed:', error);
      throw error;
    }
  }

  async addMeal(meal: SimpleFoodItem): Promise<void> {
    await this.initialize();
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');

    const mealsRef = firestore().collection('users').doc(user.uid).collection('meals');
    
    // Create the base meal data object
    const mealData: Partial<FirebaseMealDocument> = {
      userId: user.uid,
      name: meal.name,
      calories: meal.calories,
      protein: meal.macros.protein,
      carbs: meal.macros.carbs,
      fat: meal.macros.fat,
      timestamp: Timestamp.fromDate(new Date(meal.timestamp)),
      syncedAt: new Date().toISOString(),
      version: 1
    };
    
    // Only add servingSize if it's defined
    if (meal.servingSize !== undefined) {
      mealData.servingSize = meal.servingSize;
    }
    
    // Only add servingUnit if it's defined
    if (meal.servingUnit !== undefined) {
      mealData.servingUnit = meal.servingUnit;
    }

    await mealsRef.doc(meal.id).set(mealData);
    console.log(`[FirebaseMealService] Meal ${meal.id} saved to Firestore`);
  }

  async getMeal(id: string): Promise<FirebaseMealDocument | null> {
    await this.initialize();
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');

    const mealRef = firestore().collection('users').doc(user.uid).collection('meals').doc(id);
    const snapshot = await mealRef.get();

    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data
    } as FirebaseMealDocument;
  }

  async deleteMeal(id: string): Promise<void> {
    await this.initialize();
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');

    const mealRef = firestore().collection('users').doc(user.uid).collection('meals').doc(id);
    await mealRef.delete();

    console.log(`[FirebaseMealService] Meal ${id} deleted from Firestore`);
  }

  async getMeals(): Promise<FirebaseMealDocument[]> {
    await this.initialize();
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');

    const mealsRef = firestore().collection('users').doc(user.uid).collection('meals');
    const snapshot = await mealsRef.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseMealDocument[];
  }

  async getMealsInRange(startDate: Date, endDate: Date): Promise<FirebaseMealDocument[]> {
    await this.initialize();
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const mealsRef = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('meals')
      .where('timestamp', '>=', startTimestamp)
      .where('timestamp', '<=', endTimestamp);

    const snapshot = await mealsRef.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseMealDocument[];
  }

  async syncLocalMealsToFirebase(meals: SimpleFoodItem[]): Promise<void> {
    await this.initialize();
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const db = firestore();
      
      // Web Firebase doesn't have a direct batch equivalent, so handle each meal
      for (const meal of meals) {
        const mealData: Omit<FirebaseMealDocument, 'id'> = {
          userId: user.uid,
          name: meal.name,
          calories: meal.calories,
          protein: meal.macros.protein,
          carbs: meal.macros.carbs,
          fat: meal.macros.fat,
          servingSize: meal.servingSize,
          servingUnit: meal.servingUnit,
          timestamp: Timestamp.fromDate(new Date(meal.timestamp)),
          syncedAt: new Date().toISOString(),
          version: 1
        };

        const mealRef = firestore().collection('users').doc(user.uid).collection('meals').doc(meal.id);
        await mealRef.set(mealData);
      }

      console.log(`[FirebaseMealService] Successfully synced ${meals.length} meals to Firestore`);
    } catch (error) {
      console.error('[FirebaseMealService] Error syncing meals to Firestore:', error);
      throw error;
    }
  }

  async subscribeToMealUpdates(mealId: string, callback: (meal: FirebaseMealDocument | null) => void): Promise<() => void> {
    try {
      await this.initialize();
      
      if (this.activeListeners.has(mealId)) {
        console.log(`[FirebaseMealService] Already listening to meal ${mealId}`);
        return () => {};
      }

      const user = auth().currentUser;
      if (!user) {
        console.error('[FirebaseMealService] Cannot subscribe: User not authenticated');
        if (typeof callback === 'function') {
          callback(null);
        }
        return () => {};
      }

      const mealRef = firestore().collection('users').doc(user.uid).collection('meals').doc(mealId);
      
      const unsubscribe = mealRef.onSnapshot(
        (snapshot) => {
          if (typeof callback === 'function') {
            if (snapshot.exists) {
              callback({
                id: snapshot.id,
                ...snapshot.data()
              } as FirebaseMealDocument);
            } else {
              callback(null);
            }
          }
        },
        (error) => {
          console.error(`[FirebaseMealService] Error listening to meal ${mealId}:`, error);
          if (typeof callback === 'function') {
            callback(null);
          }
        }
      );

      this.activeListeners.set(mealId, unsubscribe);
      return () => {
        unsubscribe();
        this.activeListeners.delete(mealId);
      };
    } catch (error) {
      console.error('[FirebaseMealService] Error setting up subscription:', error);
      if (typeof callback === 'function') {
        callback(null);
      }
      return () => {};
    }
  }

  unsubscribeFromMealUpdates(mealId: string): void {
    const unsubscribe = this.activeListeners.get(mealId);
    if (unsubscribe) {
      unsubscribe();
      this.activeListeners.delete(mealId);
    }
  }
}

export const firebaseMealService = FirebaseMealService.getInstance();