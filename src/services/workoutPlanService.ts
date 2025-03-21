import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { WorkoutPlan, SharedWorkoutPlanView, WorkoutPlanShare } from '../types/workout';
import { firebaseCore } from './firebase/firebaseCore';

class WorkoutPlanService {
  private static instance: WorkoutPlanService;
  private plansCollection: ReturnType<typeof firestore>['Collection'] | null = null;
  private sharesCollection: ReturnType<typeof firestore>['Collection'] | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): WorkoutPlanService {
    if (!WorkoutPlanService.instance) {
      WorkoutPlanService.instance = new WorkoutPlanService();
    }
    return WorkoutPlanService.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      console.log('[WorkoutPlanService] Initializing...');
      await firebaseCore.ensureInitialized();
      
      const db = firebaseCore.getFirestore();
      this.plansCollection = db.collection('workoutPlans');
      this.sharesCollection = db.collection('workoutPlanShares');
      
      this.initialized = true;
      console.log('[WorkoutPlanService] Initialized successfully');
    } catch (error) {
      console.error('[WorkoutPlanService] Initialization failed:', error);
      throw error;
    }
  }

  private getPlansCollection() {
    if (!this.plansCollection) {
      throw new Error('[WorkoutPlanService] Service not initialized');
    }
    return this.plansCollection;
  }

  private getSharesCollection() {
    if (!this.sharesCollection) {
      throw new Error('[WorkoutPlanService] Service not initialized');
    }
    return this.sharesCollection;
  }

  private getCurrentUserId(): string {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  // CRUD Operations
  async createWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'ownerId' | 'createdAt'>): Promise<string> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const newPlan: WorkoutPlan = {
      ...plan,
      id: '',
      ownerId: userId,
      createdAt: new Date(),
      lastModified: new Date(),
      isShared: false,
      sharedWith: [],
    };

    const docRef = await this.getPlansCollection().add(newPlan);
    await this.getPlansCollection().doc(docRef.id).update({ id: docRef.id });
    return docRef.id;
  }

  async getWorkoutPlan(planId: string): Promise<WorkoutPlan | null> {
    await this.initialize();
    
    const doc = await this.getPlansCollection().doc(planId).get();
    return doc.exists ? (doc.data() as WorkoutPlan) : null;
  }

  async updateWorkoutPlan(planId: string, updates: Partial<WorkoutPlan>): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const plan = await this.getWorkoutPlan(planId);
    
    if (!plan) {
      throw new Error('Workout plan not found');
    }
    
    if (plan.ownerId !== userId) {
      throw new Error('Not authorized to update this plan');
    }

    await this.getPlansCollection().doc(planId).update({
      ...updates,
      lastModified: new Date(),
    });
  }

  async deleteWorkoutPlan(planId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const plan = await this.getWorkoutPlan(planId);
    
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    if (plan.ownerId !== userId) {
      throw new Error('Not authorized to delete this plan');
    }

    // Delete all shares first
    const shares = await this.getSharesCollection()
      .where('planId', '==', planId)
      .get();
    
    const batch = firestore().batch();
    shares.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(this.getPlansCollection().doc(planId));
    
    await batch.commit();
  }

  // Sharing Operations
  async shareWorkoutPlan(planId: string, targetUserId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const plan = await this.getWorkoutPlan(planId);
    
    if (!plan) {
      throw new Error('Workout plan not found');
    }
    
    if (plan.ownerId !== userId) {
      throw new Error('Not authorized to share this plan');
    }

    const share: WorkoutPlanShare = {
      planId,
      sharedBy: userId,
      sharedWith: targetUserId,
      sharedAt: new Date(),
      status: 'pending',
    };

    await this.getSharesCollection().add(share);
    await this.getPlansCollection().doc(planId).update({
      isShared: true,
      sharedWith: firestore.FieldValue.arrayUnion(targetUserId),
    });
  }

  async getSharedWorkoutPlans(): Promise<SharedWorkoutPlanView[]> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    const shares = await this.getSharesCollection()
      .where('sharedWith', '==', userId)
      .get();

    const plans: SharedWorkoutPlanView[] = [];
    
    for (const shareDoc of shares.docs) {
      const share = shareDoc.data() as WorkoutPlanShare;
      const plan = await this.getWorkoutPlan(share.planId);
      
      if (plan) {
        const sharedByUser = await auth().getUser(share.sharedBy);
        plans.push({
          ...plan,
          sharedBy: {
            id: sharedByUser.uid,
            name: sharedByUser.displayName || sharedByUser.email || 'Unknown User',
          },
          sharedAt: share.sharedAt,
          status: share.status,
        });
      }
    }

    return plans;
  }

  async acceptSharedPlan(planId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    const shareDoc = await this.getSharesCollection()
      .where('planId', '==', planId)
      .where('sharedWith', '==', userId)
      .where('status', '==', 'pending')
      .get();

    if (shareDoc.empty) {
      throw new Error('Share not found or already processed');
    }

    await shareDoc.docs[0].ref.update({ status: 'accepted' });
  }

  async rejectSharedPlan(planId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    const shareDoc = await this.getSharesCollection()
      .where('planId', '==', planId)
      .where('sharedWith', '==', userId)
      .where('status', '==', 'pending')
      .get();

    if (shareDoc.empty) {
      throw new Error('Share not found or already processed');
    }

    const batch = firestore().batch();
    batch.update(shareDoc.docs[0].ref, { status: 'rejected' });
    batch.update(this.getPlansCollection().doc(planId), {
      sharedWith: firestore.FieldValue.arrayRemove(userId),
    });

    await batch.commit();
  }

  async unshareWorkoutPlan(planId: string, targetUserId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const plan = await this.getWorkoutPlan(planId);
    
    if (!plan) {
      throw new Error('Workout plan not found');
    }
    
    if (plan.ownerId !== userId) {
      throw new Error('Not authorized to unshare this plan');
    }

    await this.getPlansCollection().doc(planId).update({
      sharedWith: firestore.FieldValue.arrayRemove(targetUserId),
    });

    // Remove share records
    const shareSnapshot = await this.getSharesCollection()
      .where('planId', '==', planId)
      .where('sharedWith', '==', targetUserId)
      .get();

    const batch = firestore().batch();
    shareSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}

export const workoutPlanService = WorkoutPlanService.getInstance();