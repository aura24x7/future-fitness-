import { GeminiService } from '../core/gemini.service';
import { MealPlanPreferences, WeeklyMealPlan } from './types';
import { MealValidator } from './meal-validator.service';
import { userProfileService } from '../../userProfileService';
import { OnboardingData } from '../../../context/OnboardingContext';

export class MealGeneratorService {
    private geminiService: GeminiService;
    private validator: MealValidator;

    constructor() {
        this.geminiService = GeminiService.getInstance();
        this.validator = new MealValidator();
    }

    private generateMealPlanPrompt(preferences: MealPlanPreferences, profile: OnboardingData, dayOfWeek: string): string {
        const activityMultipliers = {
            SEDENTARY: 1.2,
            LIGHTLY_ACTIVE: 1.375,
            MODERATELY_ACTIVE: 1.55,
            VERY_ACTIVE: 1.725,
            SUPER_ACTIVE: 1.9
        };

        const goalMultipliers = {
            LOSE_WEIGHT: 0.8,
            MAINTAIN_WEIGHT: 1.0,
            GAIN_WEIGHT: 1.1
        };

        // Calculate adjusted calories based on BMR, activity level, and goal
        const bmr = profile.metrics?.bmr || preferences.calorieGoal || 2000;
        const activityMultiplier = profile.lifestyle ? activityMultipliers[profile.lifestyle] : 1.2;
        const goalMultiplier = profile.weightGoal ? goalMultipliers[profile.weightGoal] : 1.0;
        const adjustedCalories = Math.round(bmr * activityMultiplier * goalMultiplier);

        return `You are a specialized meal plan generator with expertise in regional cuisines and personalized nutrition. Generate a meal plan for ${dayOfWeek} following these rules EXACTLY.

USER PROFILE:
- Location: ${profile.country || 'Not specified'}, ${profile.state || ''}
- Diet Type: ${profile.dietaryPreference || 'No specific preference'}
- Lifestyle: ${profile.lifestyle || 'Regular'}
- Weight Goal: ${profile.weightGoal || 'Maintain'}

NUTRITIONAL REQUIREMENTS:
- Daily BMR: ${bmr} calories
- Adjusted Daily Calories: ${adjustedCalories} calories (based on activity level and goal)
- Meals per day: ${preferences.mealCount || 3} plus 2 snacks
- Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Preferred Cuisines: ${preferences.cuisinePreferences?.join(', ') || 'Regional cuisine based on location'}

MEAL DISTRIBUTION:
- Breakfast: 25% of daily calories
- Lunch: 30% of daily calories
- Dinner: 30% of daily calories
- Snacks: 15% of daily calories (divided between 2 snacks)

IMPORTANT INSTRUCTIONS:
1. Create meals that are culturally relevant to the user's location
2. Use local names for dishes where appropriate
3. Use local ingredients and cooking methods
4. Adapt portion sizes to meet calorie requirements
5. Account for activity level in meal timing
6. Include 2 healthy snacks between meals

RESPONSE FORMAT REQUIREMENTS:
1. Must be valid JSON
2. No comments in JSON
3. No placeholders (like "number" or "...")
4. All numeric values must be actual numbers
5. All arrays must be properly populated
6. No trailing commas

EXAMPLE MEAL STRUCTURE:
{
  "name": "Masala Dosa",
  "description": "South Indian rice and lentil crepe with potato filling",
  "calories": 350,
  "protein": 12,
  "carbs": 45,
  "fat": 15,
  "ingredients": [
    {
      "item": "dosa batter",
      "amount": 200,
      "unit": "g"
    }
  ],
  "instructions": "1. Heat griddle...",
  "servings": 1,
  "prepTime": 20,
  "tips": "Ensure batter is fermented well",
  "mealType": "breakfast"
}

GENERATE RESPONSE IN THIS EXACT STRUCTURE:
{
  "dayOfWeek": "${dayOfWeek}",
  "totalCalories": ${adjustedCalories},
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "meals": {
    "breakfast": [{
      "name": "",
      "description": "",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "ingredients": [{
        "item": "",
        "amount": 0,
        "unit": ""
      }],
      "instructions": "",
      "servings": 1,
      "prepTime": 0,
      "tips": "",
      "mealType": "breakfast"
    }],
    "lunch": [{
      "name": "",
      "description": "",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "ingredients": [{
        "item": "",
        "amount": 0,
        "unit": ""
      }],
      "instructions": "",
      "servings": 1,
      "prepTime": 0,
      "tips": "",
      "mealType": "lunch"
    }],
    "dinner": [{
      "name": "",
      "description": "",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "ingredients": [{
        "item": "",
        "amount": 0,
        "unit": ""
      }],
      "instructions": "",
      "servings": 1,
      "prepTime": 0,
      "tips": "",
      "mealType": "dinner"
    }],
    "snacks": [{
      "name": "",
      "description": "",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "ingredients": [{
        "item": "",
        "amount": 0,
        "unit": ""
      }],
      "instructions": "",
      "servings": 1,
      "prepTime": 0,
      "tips": "",
      "mealType": "snack"
    }]
  }
}`;
    }

    public async generateWeeklyMealPlan(preferences: MealPlanPreferences): Promise<WeeklyMealPlan> {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weeklyPlan: WeeklyMealPlan = { weeklyPlan: [] };

        try {
            console.log('Starting personalized weekly meal plan generation...');
            
            // Get user profile for personalization
            const profile = await userProfileService.getProfile();
            if (!profile) {
                throw new Error('User profile not found');
            }

            // Generate a unique plan for each day
            for (const day of daysOfWeek) {
                console.log(`Generating culturally-tailored meal plan for ${day}...`);
                const prompt = this.generateMealPlanPrompt(preferences, profile, day);
                
                const result = await this.geminiService.generateStructuredResponse(prompt);
                console.log(`Received personalized response for ${day}`);
                
                if (!result || !result.meals) {
                    throw new Error(`Invalid meal plan structure for ${day}`);
                }

                // Validate the day's plan
                const validatedDayPlan = this.validator.validateDailyPlan({
                    ...result,
                    dayOfWeek: day
                });

                weeklyPlan.weeklyPlan.push(validatedDayPlan);
                console.log(`Successfully added personalized plan for ${day}`);
                
                // Add a delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log('Personalized weekly meal plan generation completed');
            return weeklyPlan;
        } catch (error) {
            console.error('Error generating personalized weekly meal plan:', error);
            throw error;
        }
    }
}

export const mealGeneratorService = new MealGeneratorService();
