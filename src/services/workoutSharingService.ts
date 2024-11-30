import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/uuid';

const SHARED_WORKOUTS_KEY = '@shared_workouts';

export interface SharedWorkout {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  workoutPlan: any[]; // We'll type this properly once we have the workout plan type
  status: 'pending' | 'accepted' | 'rejected';
  sharedAt: Date;
  message?: string;
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
   * Share a workout plan with another user
   */
  async shareWorkout(
    workoutPlan: any[],
    recipientId: string,
    senderName: string,
    message?: string
  ): Promise<SharedWorkout> {
    try {
      console.log('Sharing workout:', { recipientId, senderName, workoutPlan });
      const sharedWorkouts = await this.getSharedWorkouts();
      
      const newShare: SharedWorkout = {
        id: generateUUID(),
        senderId: 'current-user', // TODO: Replace with actual user ID
        senderName,
        recipientId,
        workoutPlan,
        status: 'pending',
        sharedAt: new Date(),
        message,
      };

      console.log('Created new share:', newShare);
      await AsyncStorage.setItem(
        SHARED_WORKOUTS_KEY,
        JSON.stringify([...sharedWorkouts, newShare])
      );
      console.log('Successfully stored shared workout');

      return newShare;
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
      const workouts = data ? JSON.parse(data) : [];
      console.log('Retrieved shared workouts:', workouts);
      return workouts;
    } catch (error) {
      console.error('Error getting shared workouts:', error);
      return [];
    }
  }

  /**
   * Get pending shared workouts received by the current user
   */
  async getPendingReceivedWorkouts(userId: string): Promise<SharedWorkout[]> {
    const sharedWorkouts = await this.getSharedWorkouts();
    return sharedWorkouts.filter(
      workout => workout.recipientId === userId && workout.status === 'pending'
    );
  }

  /**
   * Accept a shared workout
   */
  async acceptSharedWorkout(shareId: string): Promise<void> {
    try {
      const sharedWorkouts = await this.getSharedWorkouts();
      const updatedWorkouts = sharedWorkouts.map(workout => 
        workout.id === shareId 
          ? { ...workout, status: 'accepted' }
          : workout
      );

      await AsyncStorage.setItem(
        SHARED_WORKOUTS_KEY,
        JSON.stringify(updatedWorkouts)
      );
    } catch (error) {
      console.error('Error accepting workout:', error);
      throw new Error('Failed to accept workout');
    }
  }

  /**
   * Reject a shared workout
   */
  async rejectSharedWorkout(shareId: string): Promise<void> {
    try {
      const sharedWorkouts = await this.getSharedWorkouts();
      const updatedWorkouts = sharedWorkouts.map(workout => 
        workout.id === shareId 
          ? { ...workout, status: 'rejected' }
          : workout
      );

      await AsyncStorage.setItem(
        SHARED_WORKOUTS_KEY,
        JSON.stringify(updatedWorkouts)
      );
    } catch (error) {
      console.error('Error rejecting workout:', error);
      throw new Error('Failed to reject workout');
    }
  }

  // For testing - add mock shared workouts
  async addMockSharedWorkouts() {
    try {
      const mockWorkouts: SharedWorkout[] = [
        {
          id: 'share1',
          senderId: 'user2',
          senderName: 'John Doe',
          recipientId: 'current-user',
          workoutPlan: [
            {
              name: 'Full Body Workout',
              exercises: [
                { name: 'Push-ups', sets: 3, reps: 12 },
                { name: 'Squats', sets: 3, reps: 15 },
                { name: 'Plank', sets: 3, duration: '30 seconds' }
              ],
              duration: '45 minutes',
              difficulty: 'Intermediate'
            }
          ],
          status: 'pending',
          sharedAt: new Date(),
          message: 'Hey! Try this workout I created.'
        },
        {
          id: 'share2',
          senderId: 'user3',
          senderName: 'Jane Smith',
          recipientId: 'current-user',
          workoutPlan: [
            {
              name: 'HIIT Cardio',
              exercises: [
                { name: 'Jumping Jacks', sets: 4, duration: '30 seconds' },
                { name: 'Mountain Climbers', sets: 4, duration: '30 seconds' },
                { name: 'Burpees', sets: 4, reps: 10 }
              ],
              duration: '30 minutes',
              difficulty: 'Advanced'
            }
          ],
          status: 'pending',
          sharedAt: new Date(),
          message: 'This is a great cardio workout!'
        },
        {
          id: 'share3',
          senderId: 'current-user',
          senderName: 'Current User',
          recipientId: 'user4',
          workoutPlan: [
            {
              name: 'Beginner Strength',
              exercises: [
                { name: 'Dumbbell Rows', sets: 3, reps: 10 },
                { name: 'Lunges', sets: 3, reps: 12 },
                { name: 'Wall Push-ups', sets: 3, reps: 8 }
              ],
              duration: '35 minutes',
              difficulty: 'Beginner'
            }
          ],
          status: 'accepted',
          sharedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          message: 'Here\'s a beginner-friendly workout!'
        }
      ];

      await AsyncStorage.setItem(SHARED_WORKOUTS_KEY, JSON.stringify(mockWorkouts));
      console.log('Mock shared workouts added successfully');
      return true;
    } catch (error) {
      console.error('Error adding mock shared workouts:', error);
      return false;
    }
  }
}

export const workoutSharingService = WorkoutSharingService.getInstance();
