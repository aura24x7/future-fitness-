import { collection, query, where, getDocs, Timestamp, writeBatch, doc, getDoc } from '@react-native-firebase/firestore';
import { auth } from '@react-native-firebase/auth';
import { format } from 'date-fns';

interface DailyMealSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

interface WeeklyMealSummary extends Omit<DailyMealSummary, 'date'> {
  weekId: string;
  startDate: string;
  endDate: string;
}

class MealAggregationService {
  private static instance: MealAggregationService;

  private constructor() {}

  static getInstance(): MealAggregationService {
    if (!MealAggregationService.instance) {
      MealAggregationService.instance = new MealAggregationService();
    }
    return MealAggregationService.instance;
  }

  private getCurrentUserId(): string {
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');
    return user.uid;
  }

  async aggregateDailyMeals(date: Date): Promise<DailyMealSummary> {
    const userId = this.getCurrentUserId();
    
    // Normalize date to noon to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setHours(12, 0, 0, 0);
    
    const startOfDay = new Date(normalizedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(normalizedDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('[MealAggregation] Aggregating meals for:', {
      date: format(date, 'yyyy-MM-dd'),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    const mealsRef = collection(firestore(), `users/${userId}/meals`);
    const q = query(
      mealsRef,
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay))
    );

    const querySnapshot = await getDocs(q);
    const summary: DailyMealSummary = {
      date: format(date, 'yyyy-MM-dd'),
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealCount: 0,
    };

    console.log('[MealAggregation] Found meals:', querySnapshot.size);

    querySnapshot.forEach((doc) => {
      const meal = doc.data();
      console.log('[MealAggregation] Processing meal:', {
        id: doc.id,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat
      });
      
      summary.totalCalories += Number(meal.calories) || 0;
      summary.totalProtein += Number(meal.protein) || 0;
      summary.totalCarbs += Number(meal.carbs) || 0;
      summary.totalFat += Number(meal.fat) || 0;
      summary.mealCount++;
    });

    console.log('[MealAggregation] Summary calculated:', summary);

    // Store the summary
    const summaryRef = doc(firestore(), `users/${userId}/mealSummaries/${summary.date}`);
    await writeBatch(firestore()).set(summaryRef, summary).commit();

    return summary;
  }

  async aggregateWeeklyMeals(startDate: Date): Promise<WeeklyMealSummary> {
    const userId = this.getCurrentUserId();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const weekId = format(startDate, 'yyyy-[W]ww');
    let summary: WeeklyMealSummary = {
      weekId,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealCount: 0,
    };

    // Aggregate daily summaries for the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dailySummary = await this.aggregateDailyMeals(currentDate);

      summary.totalCalories += dailySummary.totalCalories;
      summary.totalProtein += dailySummary.totalProtein;
      summary.totalCarbs += dailySummary.totalCarbs;
      summary.totalFat += dailySummary.totalFat;
      summary.mealCount += dailySummary.mealCount;
    }

    // Store the weekly summary
    const summaryRef = doc(firestore(), `users/${userId}/mealSummaries/weekly/${weekId}`);
    await writeBatch(firestore()).set(summaryRef, summary).commit();

    return summary;
  }

  async getWeeklySummary(startDate: Date): Promise<WeeklyMealSummary | null> {
    const userId = this.getCurrentUserId();
    const weekId = format(startDate, 'yyyy-[W]ww');
    const summaryRef = doc(firestore(), `users/${userId}/mealSummaries/weekly/${weekId}`);
    const snapshot = await getDoc(summaryRef);

    if (snapshot.exists()) {
      return snapshot.data() as WeeklyMealSummary;
    }

    // If no summary exists, generate it
    return this.aggregateWeeklyMeals(startDate);
  }

  async getDailySummary(date: Date): Promise<DailyMealSummary | null> {
    const userId = this.getCurrentUserId();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    console.log('[MealAggregation] Getting daily summary for:', dateStr);
    
    const summaryRef = doc(firestore(), `users/${userId}/mealSummaries/${dateStr}`);
    const snapshot = await getDoc(summaryRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as DailyMealSummary;
      console.log('[MealAggregation] Found existing summary:', data);
      return data;
    }

    console.log('[MealAggregation] No existing summary, generating new one');
    // If no summary exists, generate it
    return this.aggregateDailyMeals(date);
  }
}

export const mealAggregationService = MealAggregationService.getInstance(); 