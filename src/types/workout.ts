import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type IntensityLevel = 'low' | 'medium' | 'high';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Exercise {
    exerciseName: string;
    sets: number;           // Must be a positive number
    reps: number;           // Must be a positive number
    instructions: string;
    caloriesBurned?: number; // Either input manually or generated via AI service
    workoutDuration?: number; // Duration in minutes
    intensityLevel?: 'low' | 'medium' | 'high';
}

export interface DayPlan {
    dayName: string;          // e.g., "Monday", "Tuesday", etc.
    isRestDay: boolean;
    notes?: string;
    exercises: Exercise[];
}

export interface WorkoutPlan {
    id: string;
    ownerId: string;
    createdAt: Date;
    days: DayPlan[];
    name?: string;
    description?: string;
    isShared?: boolean;
    sharedWith?: string[]; // Array of group IDs or user IDs
    lastModified?: Date;
}

// Validation types
export interface ValidationError {
    field: string;
    message: string;
}

export interface WorkoutValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Form data types (used when creating/editing)
export interface ExerciseFormData {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    notes?: string;
}

export interface DayPlanFormData {
    exercises: ExerciseFormData[];
}

export interface WorkoutPlanFormData {
    name: string;
    description?: string;
    days: DayPlanFormData[];
}

// Workout Progress Tracking Types
export interface ExerciseProgress {
    id?: string;
    exerciseId: string;  // A unique identifier for the exercise (can be combination of planId + dayIndex + array index)
    planId: string;
    dayIndex: number;
    userId: string;
    date: Date;
    completed: boolean;
    actualSets: number;
    actualReps: number;
    actualWeight: number;
    notes?: string;
    completedAt: Date;
}

export interface WorkoutCompletion {
    id?: string;
    planId: string;
    userId: string;
    dayIndex: number;
    completedDate: Date;
    totalExercises: number;
    completedExercises: number;
    duration: number;
    caloriesBurned: number;
    notes?: string;
    feeling?: 'easy' | 'moderate' | 'challenging' | 'difficult';
}

// Sharing types
export interface WorkoutPlanShare {
    planId: string;
    sharedBy: string;
    sharedWith: string;
    sharedAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface SharedWorkoutPlanView extends WorkoutPlan {
    sharedBy: {
        id: string;
        name: string;
    };
    sharedAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
} 