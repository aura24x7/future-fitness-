import { OnboardingData } from '../contexts/OnboardingContext';

/**
 * Interface for the data collected during voice onboarding
 */
export interface VoiceOnboardingData {
  name?: string;
  age?: number; 
  gender?: string;
  currentWeight?: number;
  targetWeight?: number;
  targetDate?: string;
  fitnessGoal?: string;
  activityLevel?: string;
  dietaryRestrictions?: string;
  isComplete?: boolean;
}

/**
 * Converts voice agent data to the format expected by the OnboardingContext
 */
export const mapVoiceDataToOnboardingData = (voiceData: VoiceOnboardingData): OnboardingData => {
  // Calculate birthday from age if provided
  let birthday: Date | undefined = undefined;
  if (voiceData.age) {
    const today = new Date();
    birthday = new Date(today.setFullYear(today.getFullYear() - voiceData.age));
  }

  // Map gender string to enum format
  let genderEnum: "MALE" | "FEMALE" | "OTHER" | undefined = undefined;
  if (voiceData.gender) {
    const gender = voiceData.gender.toLowerCase();
    if (gender.includes('male') || gender.includes('man')) {
      genderEnum = 'MALE';
    } else if (gender.includes('female') || gender.includes('woman')) {
      genderEnum = 'FEMALE';
    } else {
      genderEnum = 'OTHER';
    }
  }

  // Map activity level to the expected format
  let lifestyle: string | undefined = undefined;
  if (voiceData.activityLevel) {
    const activityLevel = voiceData.activityLevel.toLowerCase();
    if (activityLevel.includes('sedentary') || activityLevel.includes('not active')) {
      lifestyle = 'SEDENTARY';
    } else if (activityLevel.includes('lightly')) {
      lifestyle = 'LIGHTLY_ACTIVE';
    } else if (activityLevel.includes('moderately')) {
      lifestyle = 'MODERATELY_ACTIVE';
    } else if (activityLevel.includes('very')) {
      lifestyle = 'VERY_ACTIVE';
    } else if (activityLevel.includes('extremely') || activityLevel.includes('super')) {
      lifestyle = 'SUPER_ACTIVE';
    } else {
      lifestyle = 'SEDENTARY'; // Default
    }
  }

  // Map fitness goal to weight goal
  let weightGoal: string | undefined = undefined;
  if (voiceData.fitnessGoal) {
    const goal = voiceData.fitnessGoal.toLowerCase();
    if (goal.includes('lose') || goal.includes('weight loss')) {
      weightGoal = 'LOSE_WEIGHT';
    } else if (goal.includes('gain') || goal.includes('build muscle')) {
      weightGoal = 'GAIN_WEIGHT';
    } else {
      weightGoal = 'MAINTAIN_WEIGHT';
    }
  }

  // Parse target date string to Date
  let weightTargetDate: Date | undefined = undefined;
  if (voiceData.targetDate) {
    try {
      // Try to handle various date formats
      if (voiceData.targetDate.toLowerCase().includes('month')) {
        // Handle "in X months" format
        const monthsMatch = voiceData.targetDate.match(/(\d+)\s*month/);
        if (monthsMatch && monthsMatch[1]) {
          const months = parseInt(monthsMatch[1]);
          const date = new Date();
          date.setMonth(date.getMonth() + months);
          weightTargetDate = date;
        }
      } else {
        // Try to parse as a standard date
        const parsedDate = new Date(voiceData.targetDate);
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) {
          weightTargetDate = parsedDate;
        }
      }
    } catch (error) {
      console.error('[voiceOnboardingAdapter] Error parsing target date:', error);
    }
  }

  return {
    name: voiceData.name,
    birthday,
    gender: genderEnum,
    weight: voiceData.currentWeight ? {
      value: voiceData.currentWeight,
      unit: 'kg'
    } : undefined,
    targetWeight: voiceData.targetWeight ? {
      value: voiceData.targetWeight,
      unit: 'kg'
    } : undefined,
    weightTargetDate,
    fitnessGoal: voiceData.fitnessGoal,
    lifestyle,
    dietaryPreference: voiceData.dietaryRestrictions,
    weightGoal,
    // We set these default values to ensure a complete profile
    height: {
      value: 170, // Default value, user can update later
      unit: 'cm'
    },
    workoutPreference: 'GENERAL_FITNESS', // Default value
    onboardingComplete: true
  };
};

/**
 * Validates voice onboarding data to ensure all required fields are present
 * Returns an array of missing field names, or an empty array if all fields are present
 */
export const validateVoiceData = (voiceData: VoiceOnboardingData): string[] => {
  const missingFields: string[] = [];

  if (!voiceData.name) missingFields.push('name');
  if (voiceData.age === undefined || voiceData.age === null) missingFields.push('age');
  if (!voiceData.gender) missingFields.push('gender');
  if (voiceData.currentWeight === undefined || voiceData.currentWeight === null) missingFields.push('current weight');
  if (voiceData.targetWeight === undefined || voiceData.targetWeight === null) missingFields.push('target weight');
  if (!voiceData.fitnessGoal) missingFields.push('fitness goal');
  if (!voiceData.activityLevel) missingFields.push('activity level');

  return missingFields;
};

export default {
  mapVoiceDataToOnboardingData,
  validateVoiceData
}; 