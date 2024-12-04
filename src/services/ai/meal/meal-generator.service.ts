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
- Meals per day: ${preferences.mealCount || 3}
- Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Preferred Cuisines: ${preferences.cuisinePreferences?.join(', ') || 'Regional cuisine based on location'}

RESPONSE FORMAT:
For each meal, provide ingredients in this EXACT format:
{
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": number,
      "unit": "g/ml/cups/tbsp/tsp/pieces"
    }
  ]
}

Example ingredient:
{
  "ingredients": [
    { "item": "chicken breast", "amount": 200, "unit": "g" },
    { "item": "olive oil", "amount": 2, "unit": "tbsp" },
    { "item": "brown rice", "amount": 1, "unit": "cup" }
  ]
}

IMPORTANT:
- All ingredients MUST have specific quantities
- Use common household measurements (cups, tablespoons, teaspoons) or metric units (g, ml)
- Be precise with measurements
- Include all ingredients needed for the recipe

PERSONALIZATION INSTRUCTIONS:
1. Create meals that are culturally relevant to the user's location
2. Use local names for dishes where appropriate
3. Consider regional ingredients and cooking methods
4. Adapt portion sizes to meet the exact calorie requirements
5. Account for activity level in meal timing and composition
6. For ${dayOfWeek}, consider:
   - Weekend days: More elaborate, traditional meals
   - Weekdays: Quick, practical versions of local favorites
   - Meal timing based on typical regional eating patterns

RESPONSE MUST BE A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:
{
  "dayOfWeek": "${dayOfWeek}",
  "totalCalories": ${adjustedCalories},
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "meals": {
    "breakfast": [
      {
        "name": "Local Breakfast Name (English Name)",
        "description": "Brief cultural context or significance",
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "ingredients": [
          {
            "item": "ingredient name",
            "amount": 0,
            "unit": "g/ml/pieces"
          }
        ],
        "instructions": "1. Step one...",
        "servings": 1,
        "prepTime": 0,
        "tips": "Optional cultural or preparation tips"
      }
    ],
    "lunch": [Array of meal objects],
    "dinner": [Array of meal objects],
    "snacks": [Array of meal objects]
  }
}

STRICT RULES:
1. Response must be PURE JSON
2. NO markdown or comments
3. ALL numeric values must be numbers (not strings)
4. NO trailing commas
5. Arrays must be properly terminated
6. All fields shown are REQUIRED
7. Calories and macros must sum exactly to daily total
8. Each meal must be unique and culturally appropriate
9. Use local language names with English translations
10. Quantities must be precise and realistic

Generate the meal plan now:`;
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
