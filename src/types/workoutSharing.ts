import { Exercise, WorkoutLog } from './workout';

export interface SharedWorkout extends WorkoutLog {
  sharedBy: string;
  sharedWith: string[];
  shareDate: string;
  shareStatus: 'pending' | 'accepted' | 'declined';
}

export interface WorkoutShareRequest {
  id: string;
  workoutId: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  sharedAt: string;
  message?: string;
}

export interface ManualWorkout extends WorkoutLog {
  isManual: true;
  createdBy: string;
  lastModified: string;
  isShared: boolean;
  sharedDetails?: {
    sharedBy: string;
    sharedDate: string;
    originalWorkoutId: string;
  };
}

export interface WorkoutSharingResponse {
  success: boolean;
  message: string;
  shareId?: string;
  error?: string;
}
