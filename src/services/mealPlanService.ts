import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDjzBDnbMEY-j2ngJnUIij6Afg8H28o_yA');

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
  servings: number;
  prepTime: number; // in minutes
  completed: boolean;
}

export interface MealPlan {
  day: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  completedCalories: number;
  completedProtein: number;
  completedCarbs: number;
  completedFat: number;
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  };
}

const PROMPT_TEMPLATE = `Generate a detailed 7-day meal plan. For each meal, include specific nutritional information and preparation details. Consider the following preferences:

Diet Type: {dietType}
Goals: {goals}
Restrictions: {restrictions}

Format the response as a valid JSON array with 7 objects, one for each day. Each object should have:
- day: Day of the week
- totalCalories: Total daily calories
- totalProtein: Total daily protein in grams
- totalCarbs: Total daily carbs in grams
- totalFat: Total daily fat in grams
- completedCalories: Total completed calories (starts at 0)
- completedProtein: Total completed protein (starts at 0)
- completedCarbs: Total completed carbs (starts at 0)
- completedFat: Total completed fat (starts at 0)
- meals: Object with breakfast, lunch, dinner, and snacks arrays

Each meal should have:
- name: Meal name
- calories: Calories per serving
- protein: Protein in grams
- carbs: Carbs in grams
- fat: Fat in grams
- ingredients: Array of ingredients with amounts
- instructions: Cooking instructions
- servings: Number of servings
- prepTime: Preparation time in minutes
- completed: Completion status (starts as false)

Example format:
[
  {
    "day": "Monday",
    "totalCalories": 2000,
    "totalProtein": 150,
    "totalCarbs": 200,
    "totalFat": 67,
    "completedCalories": 0,
    "completedProtein": 0,
    "completedCarbs": 0,
    "completedFat": 0,
    "meals": {
      "breakfast": [
        {
          "name": "Protein Oatmeal",
          "calories": 350,
          "protein": 20,
          "carbs": 45,
          "fat": 12,
          "ingredients": ["1 cup oats", "1 scoop protein powder", "1 banana"],
          "instructions": "Cook oats with water, stir in protein powder, top with sliced banana",
          "servings": 1,
          "prepTime": 10,
          "completed": false
        }
      ],
      "lunch": [],
      "dinner": [],
      "snacks": []
    }
  }
]`;

export const mealPlanService = {
  generateMealPlan: async (preferences?: {
    dietType: string;
    goals: string[];
    restrictions: string[];
  }): Promise<MealPlan[]> => {
    try {
      const startTime = Date.now();
      const defaultPreferences = {
        dietType: 'balanced',
        goals: ['weight maintenance', 'healthy eating'],
        restrictions: [],
      };

      const mergedPreferences = { ...defaultPreferences, ...preferences };
      const prompt = PROMPT_TEMPLATE
        .replace('{dietType}', mergedPreferences.dietType)
        .replace('{goals}', mergedPreferences.goals.join(', '))
        .replace('{restrictions}', mergedPreferences.restrictions.join(', '));

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 2048
        }
      });
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      // Enhanced text cleanup
      text = text
        .replace(/```json\n?|\n?```/g, '') // Remove code block markers
        .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
        .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
        .replace(/\n/g, '') // Remove newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Improved JSON array extraction
      let jsonText = text;
      const startBracket = text.indexOf('[');
      const endBracket = text.lastIndexOf(']');
      
      if (startBracket !== -1 && endBracket !== -1 && startBracket < endBracket) {
        jsonText = text.substring(startBracket, endBracket + 1);
      } else {
        console.error('No valid JSON array structure found');
        return mealPlanService.getFallbackMealPlan();
      }

      try {
        // Attempt to parse the JSON
        const mealPlan = JSON.parse(jsonText) as MealPlan[];
        
        // Validate the meal plan structure
        if (!Array.isArray(mealPlan)) {
          console.error('Parsed result is not an array');
          return mealPlanService.getFallbackMealPlan();
        }

        if (mealPlan.length === 0) {
          console.error('Meal plan array is empty');
          return mealPlanService.getFallbackMealPlan();
        }

        // Normalize and validate each day's data
        const normalizedPlan = mealPlan.map((day, index) => {
          // Ensure meals object exists
          const meals = day.meals || {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
          };

          return {
            day: day.day || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index % 7],
            totalCalories: Number(day.totalCalories) || 2000,
            totalProtein: Number(day.totalProtein) || 150,
            totalCarbs: Number(day.totalCarbs) || 200,
            totalFat: Number(day.totalFat) || 67,
            completedCalories: 0,
            completedProtein: 0,
            completedCarbs: 0,
            completedFat: 0,
            meals: {
              breakfast: normalizeMeals(meals.breakfast),
              lunch: normalizeMeals(meals.lunch),
              dinner: normalizeMeals(meals.dinner),
              snacks: normalizeMeals(meals.snacks)
            }
          };
        });

        // Ensure minimum loading time
        const elapsed = Date.now() - startTime;
        if (elapsed < 2000) {
          await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
        }

        return normalizedPlan;
      } catch (parseError) {
        console.error('Error parsing meal plan:', parseError);
        console.error('JSON text that failed to parse:', jsonText);
        return mealPlanService.getFallbackMealPlan();
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      return mealPlanService.getFallbackMealPlan();
    }
  },
  getFallbackMealPlan: (): MealPlan[] => {
    const breakfastOptions: Meal[] = [
      {
        name: "Oatmeal with Berries",
        calories: 350,
        protein: 15,
        carbs: 55,
        fat: 8,
        ingredients: [
          "1 cup oats",
          "1 cup mixed berries",
          "1 tbsp honey",
          "1/4 cup almonds"
        ],
        instructions: "Cook oats with water, top with berries, honey, and almonds.",
        servings: 1,
        prepTime: 10,
        completed: false
      },
      {
        name: "Greek Yogurt Parfait",
        calories: 300,
        protein: 20,
        carbs: 35,
        fat: 10,
        ingredients: [
          "1 cup Greek yogurt",
          "1/2 cup granola",
          "1 banana",
          "1 tbsp honey"
        ],
        instructions: "Layer yogurt, granola, and sliced banana. Drizzle with honey.",
        servings: 1,
        prepTime: 5,
        completed: false
      },
      {
        name: "Protein Pancakes",
        calories: 400,
        protein: 25,
        carbs: 45,
        fat: 12,
        ingredients: [
          "1 scoop protein powder",
          "1 banana",
          "2 eggs",
          "1/2 cup oats",
          "1 tbsp maple syrup"
        ],
        instructions: "Blend ingredients, cook on griddle until golden brown.",
        servings: 1,
        prepTime: 15,
        completed: false
      },
      {
        name: "Avocado Toast with Eggs",
        calories: 380,
        protein: 18,
        carbs: 35,
        fat: 22,
        ingredients: [
          "2 slices whole grain bread",
          "1 avocado",
          "2 eggs",
          "Salt and pepper"
        ],
        instructions: "Toast bread, mash avocado, fry eggs, assemble.",
        servings: 1,
        prepTime: 12,
        completed: false
      },
      {
        name: "Breakfast Burrito",
        calories: 450,
        protein: 28,
        carbs: 48,
        fat: 18,
        ingredients: [
          "2 eggs",
          "1 whole wheat tortilla",
          "1/4 cup black beans",
          "1/4 cup cheese",
          "Salsa"
        ],
        instructions: "Scramble eggs, warm tortilla, combine ingredients.",
        servings: 1,
        prepTime: 15,
        completed: false
      }
    ];

    const lunchOptions: Meal[] = [
      {
        name: "Quinoa Chicken Bowl",
        calories: 450,
        protein: 35,
        carbs: 45,
        fat: 15,
        ingredients: [
          "1 cup quinoa",
          "150g chicken breast",
          "1 cup mixed vegetables",
          "1 tbsp olive oil"
        ],
        instructions: "Cook quinoa. Grill chicken. Steam vegetables. Combine with olive oil.",
        servings: 1,
        prepTime: 20,
        completed: false
      },
      {
        name: "Mediterranean Salad",
        calories: 400,
        protein: 25,
        carbs: 30,
        fat: 20,
        ingredients: [
          "2 cups mixed greens",
          "100g chickpeas",
          "50g feta cheese",
          "10 olives",
          "2 tbsp olive oil"
        ],
        instructions: "Combine all ingredients in a bowl. Drizzle with olive oil.",
        servings: 1,
        prepTime: 10,
        completed: false
      },
      {
        name: "Tuna Wrap",
        calories: 420,
        protein: 32,
        carbs: 38,
        fat: 16,
        ingredients: [
          "1 can tuna",
          "1 whole wheat wrap",
          "1 tbsp mayo",
          "Lettuce",
          "Tomato"
        ],
        instructions: "Mix tuna with mayo, assemble wrap with vegetables.",
        servings: 1,
        prepTime: 10,
        completed: false
      },
      {
        name: "Buddha Bowl",
        calories: 480,
        protein: 22,
        carbs: 65,
        fat: 18,
        ingredients: [
          "1 cup brown rice",
          "1 cup roasted chickpeas",
          "2 cups mixed vegetables",
          "1 tbsp tahini"
        ],
        instructions: "Cook rice, roast chickpeas and vegetables, drizzle with tahini.",
        servings: 1,
        prepTime: 25,
        completed: false
      },
      {
        name: "Turkey Pesto Sandwich",
        calories: 440,
        protein: 28,
        carbs: 42,
        fat: 20,
        ingredients: [
          "2 slices whole grain bread",
          "100g turkey breast",
          "1 tbsp pesto",
          "1 slice mozzarella",
          "Spinach"
        ],
        instructions: "Assemble sandwich with all ingredients.",
        servings: 1,
        prepTime: 8,
        completed: false
      }
    ];

    const dinnerOptions: Meal[] = [
      {
        name: "Grilled Salmon",
        calories: 500,
        protein: 40,
        carbs: 30,
        fat: 25,
        ingredients: [
          "200g salmon fillet",
          "1 cup brown rice",
          "2 cups broccoli",
          "1 tbsp olive oil",
          "1 lemon"
        ],
        instructions: "Grill salmon with lemon. Cook rice. Steam broccoli.",
        servings: 1,
        prepTime: 25,
        completed: false
      },
      {
        name: "Turkey Stir-Fry",
        calories: 450,
        protein: 35,
        carbs: 40,
        fat: 20,
        ingredients: [
          "150g ground turkey",
          "2 cups mixed vegetables",
          "1 cup brown rice",
          "2 tbsp soy sauce"
        ],
        instructions: "Cook rice. Stir-fry turkey and vegetables with soy sauce.",
        servings: 1,
        prepTime: 20,
        completed: false
      },
      {
        name: "Baked Chicken Breast",
        calories: 520,
        protein: 45,
        carbs: 35,
        fat: 22,
        ingredients: [
          "200g chicken breast",
          "1 cup quinoa",
          "2 cups roasted vegetables",
          "2 tbsp olive oil",
          "Herbs and spices"
        ],
        instructions: "Season and bake chicken, cook quinoa, roast vegetables.",
        servings: 1,
        prepTime: 30,
        completed: false
      },
      {
        name: "Vegetarian Chili",
        calories: 380,
        protein: 22,
        carbs: 58,
        fat: 12,
        ingredients: [
          "2 cups mixed beans",
          "1 cup vegetables",
          "1 can diced tomatoes",
          "Spices",
          "1/4 cup cheese"
        ],
        instructions: "Combine ingredients in pot, simmer until done.",
        servings: 1,
        prepTime: 35,
        completed: false
      },
      {
        name: "Shrimp Scampi",
        calories: 460,
        protein: 32,
        carbs: 45,
        fat: 20,
        ingredients: [
          "200g shrimp",
          "2 cups whole wheat pasta",
          "3 cloves garlic",
          "2 tbsp olive oil",
          "1 lemon"
        ],
        instructions: "Cook pasta, sauté shrimp with garlic and oil, combine.",
        servings: 1,
        prepTime: 20,
        completed: false
      }
    ];

    const snackOptions: Meal[] = [
      {
        name: "Protein Smoothie",
        calories: 200,
        protein: 20,
        carbs: 25,
        fat: 5,
        ingredients: [
          "1 scoop protein powder",
          "1 banana",
          "1 cup almond milk",
          "1 tbsp peanut butter"
        ],
        instructions: "Blend all ingredients until smooth.",
        servings: 1,
        prepTime: 5,
        completed: false
      },
      {
        name: "Mixed Nuts and Fruit",
        calories: 150,
        protein: 6,
        carbs: 15,
        fat: 10,
        ingredients: [
          "30g mixed nuts",
          "1 apple"
        ],
        instructions: "Portion nuts and slice apple.",
        servings: 1,
        prepTime: 2,
        completed: false
      },
      {
        name: "Hummus with Vegetables",
        calories: 180,
        protein: 8,
        carbs: 20,
        fat: 8,
        ingredients: [
          "1/2 cup hummus",
          "2 cups mixed vegetables"
        ],
        instructions: "Serve hummus with cut vegetables.",
        servings: 1,
        prepTime: 5,
        completed: false
      },
      {
        name: "Greek Yogurt with Honey",
        calories: 160,
        protein: 15,
        carbs: 18,
        fat: 4,
        ingredients: [
          "1 cup Greek yogurt",
          "1 tbsp honey",
          "1/4 cup berries"
        ],
        instructions: "Mix yogurt with honey, top with berries.",
        servings: 1,
        prepTime: 3,
        completed: false
      },
      {
        name: "Rice Cakes with Almond Butter",
        calories: 220,
        protein: 7,
        carbs: 22,
        fat: 12,
        ingredients: [
          "2 rice cakes",
          "2 tbsp almond butter",
          "1 banana"
        ],
        instructions: "Spread almond butter on rice cakes, top with sliced banana.",
        servings: 1,
        prepTime: 4,
        completed: false
      }
    ];

    // Create a shuffled array of indices for each meal type
    const shuffleArray = (array: number[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const breakfastIndices = shuffleArray([...Array(breakfastOptions.length).keys()]);
    const lunchIndices = shuffleArray([...Array(lunchOptions.length).keys()]);
    const dinnerIndices = shuffleArray([...Array(dinnerOptions.length).keys()]);
    const snackIndices = shuffleArray([...Array(snackOptions.length).keys()]);

    return Array(7).fill(null).map((_, index) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      totalCalories: 2000,
      totalProtein: 150,
      totalCarbs: 200,
      totalFat: 67,
      completedCalories: 0,
      completedProtein: 0,
      completedCarbs: 0,
      completedFat: 0,
      meals: {
        breakfast: [breakfastOptions[breakfastIndices[index % breakfastOptions.length]]],
        lunch: [lunchOptions[lunchIndices[index % lunchOptions.length]]],
        dinner: [dinnerOptions[dinnerIndices[index % dinnerOptions.length]]],
        snacks: [snackOptions[snackIndices[index % snackOptions.length]]]
      }
    }));
  }
};

// Helper function to normalize meals array
const normalizeMeals = (meals: any[] = []): Meal[] => {
  if (!Array.isArray(meals)) return [];
  
  return meals.map(meal => ({
    name: String(meal?.name || 'Untitled Meal'),
    calories: Number(meal?.calories) || 0,
    protein: Number(meal?.protein) || 0,
    carbs: Number(meal?.carbs) || 0,
    fat: Number(meal?.fat) || 0,
    ingredients: Array.isArray(meal?.ingredients) 
      ? meal.ingredients.map(String)
      : [],
    instructions: String(meal?.instructions || ''),
    servings: Number(meal?.servings) || 1,
    prepTime: Number(meal?.prepTime) || 15,
    completed: Boolean(meal?.completed)
  }));
};
