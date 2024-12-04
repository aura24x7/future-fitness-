import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/uuid';
import { WeeklyWorkoutPlan } from '../types/workout';
import { ShareWorkoutPayload, WorkoutShare, ShareRecipient } from '../types/sharing';

const SHARED_WORKOUTS_KEY = '@shared_workouts';
const SHARING_ACTIVITIES_KEY = '@sharing_activities';

interface SharedWorkout {
  id: string;
  workoutPlan: WeeklyWorkoutPlan;
  sharedBy: {
    id: string;
    name: string;
  };
  recipients: ShareRecipient[];
  message?: string;
  sharedAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

class WorkoutSharingService {
  private static instance: WorkoutSharingService;
  
  private constructor() {}

  public static getInstance(): WorkoutSharingService {
    if (!WorkoutSharingService.instance) {
      WorkoutSharingService.instance = new WorkoutSharingService();
    }
    return WorkoutSharingService.instance;
  }

  /**
   * Share a workout plan with multiple recipients (individuals and groups)
   */
  async shareWorkout(
    payload: ShareWorkoutPayload
  ): Promise<WorkoutShare> {
    try {
      console.log('Sharing workout:', payload);
      const sharedWorkouts = await this.getSharedWorkouts();
      
      // Create recipients list combining individuals and groups
      const recipients: ShareRecipient[] = [
        ...payload.recipients.individuals.map(id => ({
          id,
          type: 'individual' as const,
          status: 'pending',
        })),
        ...payload.recipients.groups.map(id => ({
          id,
          type: 'group' as const,
          status: 'pending',
        })),
      ];

      const newShare: SharedWorkout = {
        id: generateUUID(),
        workoutPlan: payload.workoutPlan,
        sharedBy: {
          id: payload.sharedBy.id,
          name: payload.sharedBy.name,
        },
        recipients,
        message: payload.message,
        sharedAt: new Date(),
        status: 'pending',
      };

      // Store the share
      await AsyncStorage.setItem(
        SHARED_WORKOUTS_KEY,
        JSON.stringify([...sharedWorkouts, newShare])
      );

      // Create sharing activities for each recipient
      const activities = recipients.map(recipient => ({
        id: generateUUID(),
        workoutId: newShare.id,
        recipientId: recipient.id,
        recipientType: recipient.type,
        status: 'pending' as const,
      }));

      const existingActivities = await this.getSharingActivities();
      await AsyncStorage.setItem(
        SHARING_ACTIVITIES_KEY,
        JSON.stringify([...existingActivities, ...activities])
      );

      console.log('Successfully shared workout with activities:', {
        share: newShare,
        activities,
      });

      return {
        id: newShare.id,
        workoutPlan: newShare.workoutPlan,
        sharedBy: payload.sharedBy,
        recipients,
        message: payload.message,
        createdAt: newShare.sharedAt,
        status: 'pending',
      };
    } catch (error) {
      console.error('Error sharing workout:', error);
      throw new Error('Failed to share workout');
    }
  }

  /**
   * Get all shared workouts for the current user (both sent and received)
   */
  async getSharedWorkouts(): Promise<SharedWorkout[]> {
    try {
      const data = await AsyncStorage.getItem(SHARED_WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting shared workouts:', error);
      return [];
    }
  }

  /**
   * Get all sharing activities
   */
  private async getSharingActivities() {
    try {
      const data = await AsyncStorage.getItem(SHARING_ACTIVITIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sharing activities:', error);
      return [];
    }
  }

  /**
   * Get pending shared workouts for a recipient (individual or group)
   */
  async getPendingWorkouts(recipientId: string): Promise<WorkoutShare[]> {
    try {
      const activities = await this.getSharingActivities();
      const pendingActivities = activities.filter(
        activity => 
          activity.recipientId === recipientId && 
          activity.status === 'pending'
      );

      const sharedWorkouts = await this.getSharedWorkouts();
      return pendingActivities.map(activity => {
        const workout = sharedWorkouts.find(w => w.id === activity.workoutId);
        if (!workout) return null;

        return {
          id: workout.id,
          workoutPlan: workout.workoutPlan,
          sharedBy: workout.sharedBy,
          recipients: workout.recipients,
          message: workout.message,
          createdAt: workout.sharedAt,
          status: workout.status,
        };
      }).filter(Boolean) as WorkoutShare[];
    } catch (error) {
      console.error('Error getting pending workouts:', error);
      return [];
    }
  }

  /**
   * Accept a shared workout
   */
  async acceptWorkout(workoutId: string, recipientId: string): Promise<void> {
    try {
      // Update sharing activity status
      const activities = await this.getSharingActivities();
      const updatedActivities = activities.map(activity =>
        activity.workoutId === workoutId && activity.recipientId === recipientId
          ? { ...activity, status: 'accepted', acceptedAt: new Date() }
          : activity
      );

      await AsyncStorage.setItem(
        SHARING_ACTIVITIES_KEY,
        JSON.stringify(updatedActivities)
      );

      // Update shared workout recipient status
      const sharedWorkouts = await this.getSharedWorkouts();
      const updatedWorkouts = sharedWorkouts.map(workout => {
        if (workout.id !== workoutId) return workout;

        const updatedRecipients = workout.recipients.map(recipient =>
          recipient.id === recipientId
            ? { ...recipient, status: 'accepted', acceptedAt: new Date() }
            : recipient
        );

        return {
          ...workout,
          recipients: updatedRecipients,
          status: updatedRecipients.every(r => r.status === 'accepted')
            ? 'completed'
            : workout.status,
        };
      });

      await AsyncStorage.setItem(
        SHARED_WORKOUTS_KEY,
        JSON.stringify(updatedWorkouts)
      );
    } catch (error) {
      console.error('Error accepting workout:', error);
      throw new Error('Failed to accept workout');
    }
  }
}

export const workoutSharingService = WorkoutSharingService.getInstance();
