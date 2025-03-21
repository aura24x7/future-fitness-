import { OnboardingData } from '../contexts/OnboardingContext';

export const calculateBMI = (weight: number, height: number, units: 'metric' | 'imperial'): number => {
  if (units === 'imperial') {
    // Convert imperial to metric
    weight = weight * 0.453592; // lbs to kg
    height = height * 0.0254; // inches to meters
  } else {
    height = height / 100; // cm to meters
  }
  return Number((weight / (height * height)).toFixed(1));
};

export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: 'MALE' | 'FEMALE',
  units: 'metric' | 'imperial'
): number => {
  if (units === 'imperial') {
    // Convert imperial to metric
    weight = weight * 0.453592; // lbs to kg
    height = height * 2.54; // inches to cm
  }

  // Mifflin-St Jeor Equation
  return gender === 'MALE'
    ? Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5)
    : Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
};

export const calculateTDEE = (
  bmr: number,
  lifestyle: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'SUPER_ACTIVE'
): number => {
  const activityMultipliers = {
    SEDENTARY: 1.2,      // Sedentary
    LIGHTLY_ACTIVE: 1.375, // Lightly active
    MODERATELY_ACTIVE: 1.55,      // Moderately active
    VERY_ACTIVE: 1.725,      // Very active
    SUPER_ACTIVE: 1.9     // Super active
  };

  const multiplier = lifestyle ? activityMultipliers[lifestyle] : activityMultipliers.SEDENTARY;
  return Math.round(bmr * multiplier);
};

export const calculateRecommendedCalories = (
  tdee: number,
  weightGoal: string
): number => {
  switch (weightGoal) {
    case 'LOSE_WEIGHT':
      return Math.max(1200, Math.round(tdee - 500)); // 500 calorie deficit for weight loss
    case 'GAIN_WEIGHT':
      return Math.round(tdee + 500); // 500 calorie surplus for weight gain
    default:
      return Math.round(tdee); // Maintenance
  }
};

export const calculateMacroDistribution = (
  calories: number,
  weightGoal: string
): { proteins: number; carbs: number; fats: number } => {
  let proteinPercentage: number;
  let carbsPercentage: number;
  let fatsPercentage: number;

  switch (weightGoal) {
    case 'GAIN_WEIGHT':
      proteinPercentage = 0.3;  // 30%
      carbsPercentage = 0.5;    // 50%
      fatsPercentage = 0.2;     // 20%
      break;
    case 'LOSE_WEIGHT':
      proteinPercentage = 0.35; // 35%
      carbsPercentage = 0.4;    // 40%
      fatsPercentage = 0.25;    // 25%
      break;
    default:
      proteinPercentage = 0.3;  // 30%
      carbsPercentage = 0.45;   // 45%
      fatsPercentage = 0.25;    // 25%
  }

  // Convert percentages to grams
  // Protein & Carbs = 4 calories per gram
  // Fat = 9 calories per gram
  return {
    proteins: Math.round((calories * proteinPercentage) / 4),
    carbs: Math.round((calories * carbsPercentage) / 4),
    fats: Math.round((calories * fatsPercentage) / 9),
  };
};
