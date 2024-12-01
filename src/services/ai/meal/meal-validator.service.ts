import { MealDetails, DailyMealPlan, WeeklyMealPlan } from './types';

export class MealValidator {
    public validateMealDetails(meal: any): MealDetails {
        if (!meal || typeof meal !== 'object') {
            throw new Error('Invalid meal structure');
        }

        // Validate required fields
        const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'ingredients', 'instructions', 'servings', 'prepTime'];
        for (const field of requiredFields) {
            if (!(field in meal)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate and coerce types
        const validatedMeal = {
            name: String(meal.name).trim(),
            calories: this.validateNumber(meal.calories, 'calories', 0, 2000),
            protein: this.validateNumber(meal.protein, 'protein', 0, 200),
            carbs: this.validateNumber(meal.carbs, 'carbs', 0, 300),
            fat: this.validateNumber(meal.fat, 'fat', 0, 100),
            ingredients: this.validateArray(meal.ingredients, 'ingredients'),
            instructions: String(meal.instructions).trim(),
            servings: this.validateNumber(meal.servings, 'servings', 1, 10),
            prepTime: this.validateNumber(meal.prepTime, 'prepTime', 0, 180)
        };

        // Validate nutritional coherence
        const calculatedCalories = (validatedMeal.protein * 4) + (validatedMeal.carbs * 4) + (validatedMeal.fat * 9);
        if (Math.abs(calculatedCalories - validatedMeal.calories) > 50) {
            console.warn(`Meal "${validatedMeal.name}" has inconsistent calories. Expected: ${calculatedCalories}, Got: ${validatedMeal.calories}`);
            validatedMeal.calories = Math.round(calculatedCalories);
        }

        return validatedMeal;
    }

    private validateNumber(value: any, field: string, min: number, max: number): number {
        const num = Number(value);
        if (isNaN(num)) {
            throw new Error(`Invalid ${field}: must be a number`);
        }
        if (num < min || num > max) {
            throw new Error(`Invalid ${field}: must be between ${min} and ${max}`);
        }
        return Math.round(num);
    }

    private validateArray(value: any, field: string): string[] {
        if (!Array.isArray(value)) {
            throw new Error(`Invalid ${field}: must be an array`);
        }
        return value.map(item => String(item).trim()).filter(item => item.length > 0);
    }

    public validateDailyPlan(dayPlan: any): DailyMealPlan {
        if (!dayPlan || typeof dayPlan !== 'object') {
            throw new Error('Invalid day plan structure');
        }

        // Validate required fields
        const requiredFields = ['dayOfWeek', 'totalCalories', 'totalProtein', 'totalCarbs', 'totalFat', 'meals'];
        for (const field of requiredFields) {
            if (!(field in dayPlan)) {
                throw new Error(`Missing required field in day plan: ${field}`);
            }
        }

        const meals = dayPlan.meals || {};
        const validatedPlan: DailyMealPlan = {
            dayOfWeek: String(dayPlan.dayOfWeek).trim(),
            totalCalories: this.validateNumber(dayPlan.totalCalories, 'totalCalories', 0, 5000),
            totalProtein: this.validateNumber(dayPlan.totalProtein, 'totalProtein', 0, 400),
            totalCarbs: this.validateNumber(dayPlan.totalCarbs, 'totalCarbs', 0, 600),
            totalFat: this.validateNumber(dayPlan.totalFat, 'totalFat', 0, 200),
            meals: {
                breakfast: this.validateMealArray(meals.breakfast || [], 'breakfast'),
                lunch: this.validateMealArray(meals.lunch || [], 'lunch'),
                dinner: this.validateMealArray(meals.dinner || [], 'dinner'),
                snacks: this.validateMealArray(meals.snacks || [], 'snacks')
            }
        };

        // Validate daily totals
        let calculatedTotals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        };

        Object.values(validatedPlan.meals).forEach(mealArray => {
            mealArray.forEach(meal => {
                calculatedTotals.calories += meal.calories;
                calculatedTotals.protein += meal.protein;
                calculatedTotals.carbs += meal.carbs;
                calculatedTotals.fat += meal.fat;
            });
        });

        // Update totals if they don't match
        if (Math.abs(calculatedTotals.calories - validatedPlan.totalCalories) > 100) {
            console.warn(`Daily totals for ${validatedPlan.dayOfWeek} don't match. Updating...`);
            validatedPlan.totalCalories = calculatedTotals.calories;
            validatedPlan.totalProtein = calculatedTotals.protein;
            validatedPlan.totalCarbs = calculatedTotals.carbs;
            validatedPlan.totalFat = calculatedTotals.fat;
        }

        return validatedPlan;
    }

    private validateMealArray(meals: any[], mealType: string): MealDetails[] {
        if (!Array.isArray(meals)) {
            throw new Error(`Invalid ${mealType} meals: must be an array`);
        }
        return meals.map(meal => this.validateMealDetails(meal));
    }

    public validateWeeklyMealPlan(data: any): WeeklyMealPlan {
        if (!data || !data.weeklyPlan || !Array.isArray(data.weeklyPlan)) {
            throw new Error('Invalid meal plan structure');
        }

        return {
            weeklyPlan: data.weeklyPlan.map((dayPlan: any) => this.validateDailyPlan(dayPlan))
        };
    }
}
