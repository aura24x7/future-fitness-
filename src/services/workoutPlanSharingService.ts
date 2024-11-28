import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SharedWorkoutPlan, 
  WorkoutPlanInvite, 
  SyncOptions, 
  SyncResult,
  WorkoutPlanStats 
} from '../types/workoutSharing';

const STORAGE_KEYS = {
  SHARED_PLANS: '@workout_shared_plans',
  INVITES: '@workout_invites',
  SYNC_STATUS: '@workout_sync_status',
};

class WorkoutPlanSharingService {
  // Local Storage Methods
  private async getStoredPlans(): Promise<SharedWorkoutPlan[]> {
    try {
      const plansJson = await AsyncStorage.getItem(STORAGE_KEYS.SHARED_PLANS);
      return plansJson ? JSON.parse(plansJson) : [];
    } catch (error) {
      console.error('Error getting stored plans:', error);
      return [];
    }
  }

  private async storePlan(plan: SharedWorkoutPlan): Promise<void> {
    try {
      const plans = await this.getStoredPlans();
      const updatedPlans = [...plans, plan];
      await AsyncStorage.setItem(STORAGE_KEYS.SHARED_PLANS, JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Error storing plan:', error);
      throw new Error('Failed to store workout plan');
    }
  }

  // Plan Creation and Management
  async createShareablePlan(
    userId: string,
    userName: string,
    title: string,
    schedule: SharedWorkoutPlan['schedule'],
    options: {
      description?: string;
      visibility?: SharedWorkoutPlan['sharing']['visibility'];
      allowModification?: boolean;
    } = {}
  ): Promise<SharedWorkoutPlan> {
    const now = new Date().toISOString();
    const plan: SharedWorkoutPlan = {
      id: `plan_${Date.now()}`,
      type: 'workout_plan',
      title,
      description: options.description,
      metadata: {
        author: {
          id: userId,
          name: userName,
        },
        createdAt: now,
        lastModified: now,
        difficulty: this.calculateOverallDifficulty(schedule),
        targetAreas: this.extractTargetAreas(schedule),
        estimatedTimePerSession: this.calculateAverageTime(schedule),
        totalWorkouts: Object.keys(schedule).length,
      },
      schedule,
      sharing: {
        shareId: `share_${Date.now()}`,
        visibility: options.visibility || 'private',
        allowModification: options.allowModification ?? true,
      },
      status: 'active',
    };

    await this.storePlan(plan);
    return plan;
  }

  async getPlanById(planId: string): Promise<SharedWorkoutPlan | null> {
    try {
      const plans = await this.getStoredPlans();
      return plans.find(plan => plan.id === planId) || null;
    } catch (error) {
      console.error('Error getting plan:', error);
      return null;
    }
  }

  async updatePlan(planId: string, updates: Partial<SharedWorkoutPlan>): Promise<SharedWorkoutPlan> {
    const plans = await this.getStoredPlans();
    const planIndex = plans.findIndex(p => p.id === planId);
    
    if (planIndex === -1) {
      throw new Error('Plan not found');
    }

    const updatedPlan = {
      ...plans[planIndex],
      ...updates,
      metadata: {
        ...plans[planIndex].metadata,
        lastModified: new Date().toISOString(),
      },
    };

    plans[planIndex] = updatedPlan;
    await AsyncStorage.setItem(STORAGE_KEYS.SHARED_PLANS, JSON.stringify(plans));
    
    return updatedPlan;
  }

  // Sharing Methods
  async sharePlan(planId: string, recipientId: string, message?: string): Promise<WorkoutPlanInvite> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const invite: WorkoutPlanInvite = {
      id: `invite_${Date.now()}`,
      planId,
      senderId: plan.metadata.author.id,
      senderName: plan.metadata.author.name,
      recipientId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
      message,
    };

    // Store invite
    const invites = await this.getStoredInvites();
    await AsyncStorage.setItem(
      STORAGE_KEYS.INVITES,
      JSON.stringify([...invites, invite])
    );

    return invite;
  }

  async getReceivedInvites(userId: string): Promise<WorkoutPlanInvite[]> {
    const invites = await this.getStoredInvites();
    return invites.filter(invite => 
      invite.recipientId === userId && 
      invite.status === 'pending' &&
      new Date(invite.expiresAt) > new Date()
    );
  }

  // Helper Methods
  private calculateOverallDifficulty(schedule: SharedWorkoutPlan['schedule']): string {
    const difficulties = Object.values(schedule).map(workout => workout.difficulty);
    const avgDifficulty = difficulties.reduce((sum, diff) => {
      const value = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;
      return sum + value;
    }, 0) / difficulties.length;

    return avgDifficulty <= 1.5 ? 'easy' : avgDifficulty <= 2.5 ? 'medium' : 'hard';
  }

  private extractTargetAreas(schedule: SharedWorkoutPlan['schedule']): string[] {
    const areas = new Set<string>();
    Object.values(schedule).forEach(workout => {
      workout.targetMuscleGroups.forEach(group => areas.add(group));
    });
    return Array.from(areas);
  }

  private calculateAverageTime(schedule: SharedWorkoutPlan['schedule']): number {
    const times = Object.values(schedule).map(workout => workout.estimatedDuration);
    return Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
  }

  private async getStoredInvites(): Promise<WorkoutPlanInvite[]> {
    try {
      const invitesJson = await AsyncStorage.getItem(STORAGE_KEYS.INVITES);
      return invitesJson ? JSON.parse(invitesJson) : [];
    } catch (error) {
      console.error('Error getting stored invites:', error);
      return [];
    }
  }
}

export const workoutPlanSharingService = new WorkoutPlanSharingService();
