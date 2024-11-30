import { GeminiService } from './core/gemini.service';

export interface MealPlanPreferences {
  calorieGoal: number;
  dietaryRestrictions?: string[];
  allergies?: string[];
  cuisinePreferences?: string[];
  mealCount: number;
}

export interface MealDetails {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
  servings: number;
  prepTime: number;
}

export interface DailyMealPlan {
  dayOfWeek: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: {
    breakfast: MealDetails[];
    lunch: MealDetails[];
    dinner: MealDetails[];
    snacks: MealDetails[];
  };
}

export interface WeeklyMealPlan {
  weeklyPlan: DailyMealPlan[];
}

class MealPlanService {
  private geminiService: GeminiService;
  private defaultPreferences: MealPlanPreferences = {
    calorieGoal: 2000,
    mealCount: 3,
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: []
  };

  constructor() {
    this.geminiService = new GeminiService();
  }

  private generateMealPlanPrompt(preferences: MealPlanPreferences): string {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return `Generate a detailed weekly meal plan with the following requirements:
    - Daily calorie goal: ${preferences.calorieGoal} calories
    - Number of meals per day: ${preferences.mealCount}
    - Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
    - Allergies: ${preferences.allergies?.join(', ') || 'None'}
    - Cuisine preferences: ${preferences.cuisinePreferences?.join(', ') || 'Any'}

    Create a meal plan for each day of the week: ${daysOfWeek.join(', ')}

    For each meal, provide:
    - Meal name
    - Calories and macronutrients (protein, carbs, fat)
    - List of ingredients
    - Brief cooking instructions
    - Serving size and preparation time

    Format the response as a JSON object with this structure:
    {
      "weeklyPlan": [
        {
          "dayOfWeek": "Monday",
          "totalCalories": number,
          "totalProtein": number,
          "totalCarbs": number,
          "totalFat": number,
          "meals": {
            "breakfast": [{ meal details }],
            "lunch": [{ meal details }],
            "dinner": [{ meal details }],
            "snacks": [{ meal details }]
          }
        },
        // Repeat for each day of the week
      ]
    }

    Each meal detail must include: name, calories, protein, carbs, fat, ingredients (array), instructions (string), servings (number), and prepTime (in minutes).
    Ensure the total daily calories match the goal, and macronutrients are balanced.
    DO NOT include any dates, only use days of the week.`;
  }

  private validateWeeklyMealPlan(data: any): WeeklyMealPlan {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Basic validation of the response structure
    if (!data.weeklyPlan || !Array.isArray(data.weeklyPlan)) {
      throw new Error('Invalid meal plan structure');
    }

    // Validate each day's plan
    if (data.weeklyPlan.length !== 7) {
      throw new Error('Meal plan must include all 7 days of the week');
    }

    // Validate each day has all required fields and meals
    data.weeklyPlan.forEach((dayPlan: any, index: number) => {
      if (!dayPlan.dayOfWeek || !daysOfWeek.includes(dayPlan.dayOfWeek)) {
        throw new Error(`Invalid day of week for day ${index + 1}`);
      }

      if (!dayPlan.meals || typeof dayPlan.meals !== 'object') {
        throw new Error(`Invalid meals structure for ${dayPlan.dayOfWeek}`);
      }

      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        if (!Array.isArray(dayPlan.meals[mealType])) {
          throw new Error(`Invalid ${mealType} structure for ${dayPlan.dayOfWeek}`);
        }
      });
    });

    return data;
  }

  async generateWeeklyMealPlan(preferences: Partial<MealPlanPreferences> = {}): Promise<WeeklyMealPlan> {
    try {
      const mergedPreferences = { ...this.defaultPreferences, ...preferences };
      const prompt = this.generateMealPlanPrompt(mergedPreferences);
      
      const response = await this.geminiService.generateStructuredResponse<WeeklyMealPlan>(
        prompt,
        this.validateWeeklyMealPlan.bind(this)
      );
      return response;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan. Please try again.');
    }
  }
}

export const mealPlanService = new MealPlanService();
