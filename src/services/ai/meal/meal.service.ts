import { MealGeneratorService } from './meal-generator.service';
import { MealPlanPreferences, WeeklyMealPlan } from './types';

class MealService {
    private generator: MealGeneratorService;
    private defaultPreferences: MealPlanPreferences = {
        calorieGoal: 2000,
        mealCount: 3,
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: []
    };

    constructor() {
        this.generator = new MealGeneratorService();
    }

    public async generateWeeklyMealPlan(preferences: Partial<MealPlanPreferences> = {}): Promise<WeeklyMealPlan> {
        try {
            const mergedPreferences = { ...this.defaultPreferences, ...preferences };
            return await this.generator.generateWeeklyMealPlan(mergedPreferences);
        } catch (error) {
            console.error('Error in meal service:', error);
            throw error;
        }
    }
}

export const mealService = new MealService();
