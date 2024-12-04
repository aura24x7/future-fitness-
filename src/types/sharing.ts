import { WeeklyWorkoutPlan } from './workout';
import { User } from './user';

export type ShareRecipientType = 'individual' | 'group';
export type ShareStatus = 'pending' | 'received' | 'accepted';

export interface ShareRecipient {
  id: string;
  type: ShareRecipientType;
  status: ShareStatus;
  receivedAt?: Date;
  acceptedAt?: Date;
}

export interface ShareWorkoutPayload {
  workoutPlan: WeeklyWorkoutPlan;
  message?: string;
  sharedBy: User;
  sharedAt: Date;
  recipients: {
    individuals: string[];
    groups: string[];
  };
}

export interface WorkoutShare {
  id: string;
  workoutPlan: WeeklyWorkoutPlan;
  sharedBy: User;
  recipients: ShareRecipient[];
  message?: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface SharingActivity {
  id: string;
  workoutId: string;
  recipientId: string;
  recipientType: ShareRecipientType;
  status: ShareStatus;
  receivedAt?: Date;
  acceptedAt?: Date;
}
