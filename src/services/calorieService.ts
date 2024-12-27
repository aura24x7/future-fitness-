import { UserProfile } from '../types/profile';
import { UserMetrics } from '../types/common/userMetrics';
import { MacroDistribution } from '../types/nutrition';
import { ProgressState, CalorieProgress, MacroProgress } from '../types/progress';
import { calculateMacroDistribution } from '../utils/profileCalculations';

interface NutritionGoalsInput {
  height?: { value: number; unit: 'cm' | 'ft' };
  weight?: { value: number; unit: 'kg' | 'lbs' };
  gender?: string;
  birthday?: Date | null;
  activityLevel?: string;
  weightGoal?: string;
}

interface NutritionGoals {
  bmi: number;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macroDistribution: MacroDistribution;
}

class CalorieService {
  calculateNutritionGoals(profile: NutritionGoalsInput): NutritionGoals {
    const height = profile.height?.value || 0;
    const weight = profile.weight?.value || 0;
    const age = profile.birthday ? Math.floor((new Date().getTime() - profile.birthday.getTime()) / 31557600000) : 0;
    const gender = profile.gender || 'other';
    const activityLevel = profile.activityLevel || 'sedentary';

    // Calculate BMI
    const heightInMeters = profile.height?.unit === 'cm' ? height / 100 : height * 0.3048;
    const weightInKg = profile.weight?.unit === 'kg' ? weight : weight * 0.453592;
    const bmi = heightInMeters > 0 ? +(weightInKg / (heightInMeters * heightInMeters)).toFixed(1) : 0;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age + 5;
    } else if (gender === 'female') {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age - 161;
    } else {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age - 78;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const tdee = Math.round(bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers]);

    // Calculate daily calories based on weight goal using fixed calorie adjustments
    let dailyCalories = tdee;
    if (profile.weightGoal === 'LOSE_WEIGHT') {
      dailyCalories = Math.max(1200, tdee - 500); // 500 calorie deficit for weight loss
    } else if (profile.weightGoal === 'GAIN_WEIGHT') {
      dailyCalories = tdee + 500; // 500 calorie surplus for weight gain
    }

    // Use central macro distribution calculation and map to correct property names
    const macros = calculateMacroDistribution(
      dailyCalories,
      profile.weightGoal || 'MAINTAIN_WEIGHT'
    );
    
    const macroDistribution: MacroDistribution = {
      protein: macros.proteins,
      carbs: macros.carbs,
      fats: macros.fats
    };

    return {
      bmi,
      bmr: Math.round(bmr),
      tdee,
      dailyCalories: Math.round(dailyCalories),
      macroDistribution,
    };
  }

  calculateProgressState(current: number, target: number): ProgressState {
    if (target <= 0) {
      return {
        progress: 0,
        displayValue: 0,
        exceeded: false,
      };
    }

    const progress = (current / target) * 100;
    const exceeded = progress > 100;

    return {
      progress: progress,
      displayValue: exceeded ? 100 : progress,
      exceeded,
    };
  }

  calculateCalorieProgress(consumed: number, target: number): CalorieProgress {
    const progressState = this.calculateProgressState(consumed, target);
    const remaining = Math.max(0, target - consumed);

    return {
      ...progressState,
      remaining,
      total: target,
    };
  }

  calculateMacroProgress(current: number, target: number): MacroProgress {
    const progressState = this.calculateProgressState(current, target);

    return {
      ...progressState,
      current,
      target,
    };
  }
}

export const calorieService = new CalorieService(); 