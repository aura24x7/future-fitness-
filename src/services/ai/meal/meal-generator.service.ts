import { GeminiService } from '../core/gemini.service';
import { MealPlanPreferences, WeeklyMealPlan } from './types';
import { MealValidator } from './meal-validator.service';

export class MealGeneratorService {
    private geminiService: GeminiService;
    private validator: MealValidator;

    constructor() {
        this.geminiService = GeminiService.getInstance();
        this.validator = new MealValidator();
    }

    private generateMealPlanPrompt(preferences: MealPlanPreferences, dayOfWeek: string): string {
        return `You are a specialized meal plan generator. Generate a meal plan for ${dayOfWeek} following these rules EXACTLY.

PREFERENCES:
- Daily calories: ${preferences.calorieGoal || 2000} calories
- Meals per day: ${preferences.mealCount || 3}
- Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Cuisines: ${preferences.cuisinePreferences?.join(', ') || 'Any'}

SPECIAL INSTRUCTIONS:
1. Create DIFFERENT meals than other days of the week
2. For ${dayOfWeek}, consider:
   - Weekend days (Sat/Sun): More elaborate breakfast, brunch-style options
   - Weekdays: Quick, easy-to-prepare meals
   - Make meals appropriate for the day (e.g., lighter lunches on workdays)

RESPONSE MUST BE A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:
{
  "dayOfWeek": "${dayOfWeek}",
  "totalCalories": 2000,
  "totalProtein": 150,
  "totalCarbs": 200,
  "totalFat": 65,
  "meals": {
    "breakfast": [
      {
        "name": "Unique Breakfast Name",
        "calories": 350,
        "protein": 12,
        "carbs": 45,
        "fat": 8,
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": "1. Step one...",
        "servings": 1,
        "prepTime": 10
      }
    ],
    "lunch": [Array of UNIQUE meal objects],
    "dinner": [Array of UNIQUE meal objects],
    "snacks": [Array of UNIQUE meal objects]
  }
}

STRICT RULES:
1. Response must be PURE JSON
2. NO markdown, comments or explanations
3. ALL numeric values must be numbers (not strings)
4. NO trailing commas
5. Arrays must be properly terminated
6. All fields shown are REQUIRED
7. Calories and macros must be realistic
8. Each meal must be UNIQUE to this day
9. Names must be descriptive and specific

Generate the meal plan now:`;
    }

    public async generateWeeklyMealPlan(preferences: MealPlanPreferences): Promise<WeeklyMealPlan> {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weeklyPlan: WeeklyMealPlan = { weeklyPlan: [] };

        try {
            console.log('Starting weekly meal plan generation...');
            
            // Generate a unique plan for each day
            for (const day of daysOfWeek) {
                console.log(`Generating unique meal plan for ${day}...`);
                const prompt = this.generateMealPlanPrompt(preferences, day);
                
                const result = await this.geminiService.generateStructuredResponse(prompt);
                console.log(`Received response for ${day}`);
                
                if (!result || !result.meals) {
                    throw new Error(`Invalid meal plan structure for ${day}`);
                }

                // Validate the day's plan
                const validatedDayPlan = this.validator.validateDailyPlan({
                    ...result,
                    dayOfWeek: day
                });

                weeklyPlan.weeklyPlan.push(validatedDayPlan);
                console.log(`Successfully added unique plan for ${day}`);
                
                // Add a delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log('Weekly meal plan generation completed with unique meals for each day');
            return weeklyPlan;
        } catch (error) {
            console.error('Error generating weekly meal plan:', error);
            throw error;
        }
    }
}

export const mealGeneratorService = new MealGeneratorService();
