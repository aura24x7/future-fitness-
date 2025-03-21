import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { sanitizeData } from '../utils/firebaseUtils';
import { Milestone, MilestoneType, MilestoneProgress, MILESTONE_THRESHOLDS } from '../types/milestone';

class MilestoneService {
  private static instance: MilestoneService;
  private readonly COLLECTION = 'milestones';

  private constructor() {}

  static getInstance(): MilestoneService {
    if (!MilestoneService.instance) {
      MilestoneService.instance = new MilestoneService();
    }
    return MilestoneService.instance;
  }

  private getMilestonesCollection(userId: string) {
    return firestore().collection(this.COLLECTION);
  }

  async createMilestone(
    userId: string,
    type: MilestoneType,
    targetValue: number,
    title: string,
    description: string
  ): Promise<Milestone> {
    try {
      const milestone: Milestone = {
        id: `${type}_${Date.now()}`,
        userId,
        type,
        title,
        description,
        targetValue,
        currentValue: 0,
        achieved: false,
        createdAt: new Date(),
      };

      const milestoneRef = this.getMilestonesCollection(userId).doc(milestone.id);
      const milestoneData = sanitizeData({
        ...milestone,
        createdAt: firestore.Timestamp.fromDate(milestone.createdAt),
      });

      await milestoneRef.set(milestoneData);

      return milestone;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw new Error('Failed to create milestone');
    }
  }

  async updateMilestoneProgress(
    milestoneId: string,
    currentValue: number
  ): Promise<MilestoneProgress> {
    try {
      const docRef = this.getMilestonesCollection('').doc(milestoneId);
      const milestoneDoc = await docRef.get();

      if (!milestoneDoc.exists()) {
        throw new Error('Milestone not found');
      }

      const milestone = milestoneDoc.data() as Milestone;
      const percentage = Math.min((currentValue / milestone.targetValue) * 100, 100);
      const remainingValue = Math.max(milestone.targetValue - currentValue, 0);
      const isAchieved = currentValue >= milestone.targetValue;

      if (isAchieved && !milestone.achieved) {
        await docRef.update({
          currentValue,
          achieved: true,
          achievedDate: firestore.Timestamp.now(),
        });
      } else {
        await docRef.update({ currentValue });
      }

      return { percentage, remainingValue, isAchieved };
    } catch (error) {
      console.error('Error updating milestone progress:', error);
      throw new Error('Failed to update milestone progress');
    }
  }

  async getUserMilestones(userId: string): Promise<Milestone[]> {
    try {
      const q = this.getMilestonesCollection('').where('userId', '==', userId);
      const snapshot = await q.get();
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        achievedDate: doc.data().achievedDate?.toDate(),
      })) as Milestone[];
    } catch (error) {
      console.error('Error getting user milestones:', error);
      throw new Error('Failed to get user milestones');
    }
  }

  async checkAndCreateMilestones(
    userId: string,
    type: MilestoneType,
    currentValue: number
  ): Promise<Milestone[]> {
    try {
      const thresholds = MILESTONE_THRESHOLDS[type];
      const newMilestones: Milestone[] = [];

      for (const threshold of thresholds) {
        const existingMilestones = await this.getUserMilestones(userId);
        const hasThreshold = existingMilestones.some(
          m => m.type === type && m.targetValue === threshold
        );

        if (!hasThreshold) {
          const title = this.getMilestoneTitle(type, threshold);
          const description = this.getMilestoneDescription(type, threshold);
          const milestone = await this.createMilestone(
            userId,
            type,
            threshold,
            title,
            description
          );
          newMilestones.push(milestone);
        }
      }

      return newMilestones;
    } catch (error) {
      console.error('Error checking and creating milestones:', error);
      throw new Error('Failed to check and create milestones');
    }
  }

  private getMilestoneTitle(type: MilestoneType, threshold: number): string {
    switch (type) {
      case 'weight_goal':
        return `${threshold}kg Weight Change Achievement`;
      case 'activity_streak':
        return `${threshold} Day Activity Streak`;
      case 'workout_count':
        return `${threshold} Workouts Completed`;
      case 'calorie_goal':
        return `${threshold} Days of Meeting Calorie Goals`;
      case 'macro_goal':
        return `${threshold} Days of Meeting Macro Goals`;
      default:
        return `${threshold} Achievement`;
    }
  }

  private getMilestoneDescription(type: MilestoneType, threshold: number): string {
    switch (type) {
      case 'weight_goal':
        return `Achieved a ${threshold}kg change in weight`;
      case 'activity_streak':
        return `Maintained an activity streak for ${threshold} days`;
      case 'workout_count':
        return `Completed ${threshold} workouts`;
      case 'calorie_goal':
        return `Met calorie goals for ${threshold} days`;
      case 'macro_goal':
        return `Met macro nutrient goals for ${threshold} days`;
      default:
        return `Reached ${threshold} milestone`;
    }
  }
}

export const milestoneService = MilestoneService.getInstance();