import { Exercise } from './workout';

export type WorkoutPlanVisibility = 'private' | 'public' | 'friends';
export type WorkoutPlanStatus = 'active' | 'archived' | 'draft';
export type SyncStatus = 'pending' | 'synced' | 'failed' | 'conflict';

export interface WorkoutPlanMetadata {
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  lastModified: string;
  difficulty: string;
  targetAreas: string[];
  estimatedTimePerSession: number;
  totalWorkouts: number;
}

export interface DailyWorkout {
  exercises: Exercise[];
  estimatedDuration: number;
  estimatedCalories: number;
  difficulty: string;
  targetMuscleGroups: string[];
  notes?: string;
}

export interface SharedWorkoutPlan {
  id: string;
  type: 'workout_plan';
  title: string;
  description?: string;
  metadata: WorkoutPlanMetadata;
  schedule: {
    [dayOfWeek: string]: DailyWorkout;
  };
  sharing: {
    shareId: string;
    qrCode?: string;
    visibility: WorkoutPlanVisibility;
    allowModification: boolean;
  };
  status: WorkoutPlanStatus;
}

export interface WorkoutPlanInvite {
  id: string;
  planId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
  expiresAt: string;
  message?: string;
}

export interface SyncOptions {
  startDate: Date;
  replaceExisting: boolean;
  skipConflicts: boolean;
  modifyPlan: boolean;
}

export interface SyncResult {
  status: SyncStatus;
  conflicts?: {
    date: string;
    existingWorkout: DailyWorkout;
    newWorkout: DailyWorkout;
  }[];
  syncedDates: string[];
  errorMessage?: string;
}

export interface WorkoutPlanStats {
  totalShares: number;
  activeUsers: number;
  averageRating: number;
  completionRate: number;
  successRate: number;
}
