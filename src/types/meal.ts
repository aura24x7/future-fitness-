import firestore from '@react-native-firebase/firestore';

export interface MacroNutrients {
  proteins: number;
  carbs: number;
  fats: number;
}

// Simplified Meal interface - only keeping essential fields
export interface Meal {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp?: string;
  macros?: MacroNutrients;
}

export interface MealMacros {
  proteins: number;
  carbs: number;
  fats: number;
}

export interface MealHydration {
  water: number;
  otherBeverages?: number;
}

export interface MealLog extends MealDocument {
  macros: MealMacros;
  hydration: MealHydration;
  notes?: string;
  tags?: string[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface MealDetails {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  completed: boolean;
  mealType: MealType;
  date: string;  // ISO string format
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  weekNumber: number; // Week number in the year
  timeOfDay: string; // HH:mm format
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface DailyMealSummary {
  date: string;
  dayOfWeek: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
  meals: MealDetails[];
}

export interface WeeklyMealSummary extends Omit<DailyMealSummary, 'date'> {
  weekId: string;
  startDate: string;
  endDate: string;
}

export interface MealDocument {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: firestore.Timestamp;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
  syncStatus: 'pending' | 'synced';
  version: number;
  localId: string;
  lastSynced: string;
  pendingOperations: Array<{
    type: 'create' | 'update' | 'delete';
    timestamp: string;
  }>;
}
