import { getFirestore, collection, doc, onSnapshot, FieldPath, setDoc } from 'firebase/firestore';
import { SharedWorkoutPlan } from '../types/workoutSharing';

type UpdateListener = (plan: SharedWorkoutPlan) => void;
type ErrorListener = (error: Error) => void;

class RealTimeUpdatesService {
  private db = getFirestore();
  private listeners = new Map<string, () => void>();

  // Subscribe to workout plan updates
  subscribeToWorkoutPlan = (
    planId: string,
    onUpdate: UpdateListener,
    onError?: ErrorListener
  ): () => void => {
    // Unsubscribe from existing listener if any
    this.unsubscribeFromWorkoutPlan(planId);

    const workoutPlanRef = doc(this.db, 'workout_plans', planId);
    const unsubscribe = onSnapshot(
      workoutPlanRef,
      (snapshot) => {
        if (snapshot.exists) {
          const planData = snapshot.data() as Omit<SharedWorkoutPlan, 'id'>;
          onUpdate({ id: snapshot.id, ...planData });
        }
      },
      (error) => {
        console.error('Error in workout plan subscription:', error);
        onError?.(error);
      }
    );

    this.listeners.set(planId, unsubscribe);
    return unsubscribe;
  };

  // Unsubscribe from workout plan updates
  unsubscribeFromWorkoutPlan = (planId: string): void => {
    const unsubscribe = this.listeners.get(planId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(planId);
    }
  };

  // Subscribe to multiple workout plans
  subscribeToMultipleWorkoutPlans = (
    planIds: string[],
    onUpdate: (plans: SharedWorkoutPlan[]) => void,
    onError?: ErrorListener
  ): () => void => {
    if (!planIds.length) return () => {};

    const unsubscribe = onSnapshot(
      collection(this.db, 'workout_plans').where(FieldPath.documentId(), 'in', planIds),
      (snapshot) => {
        const plans = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() as Omit<SharedWorkoutPlan, 'id'>,
        }));
        onUpdate(plans);
      },
      (error) => {
        console.error('Error in multiple workout plans subscription:', error);
        onError?.(error);
      }
    );

    return unsubscribe;
  };

  // Subscribe to workout plan progress updates
  subscribeToWorkoutProgress = (
    planId: string,
    userId: string,
    onUpdate: (progress: any) => void,
    onError?: ErrorListener
  ): () => void => {
    const unsubscribe = onSnapshot(
      doc(this.db, 'workout_plans', planId, 'progress', userId),
      (snapshot) => {
        if (snapshot.exists) {
          onUpdate(snapshot.data());
        }
      },
      (error) => {
        console.error('Error in workout progress subscription:', error);
        onError?.(error);
      }
    );

    return unsubscribe;
  };

  // Update workout plan progress
  updateWorkoutProgress = async (
    planId: string,
    userId: string,
    progress: any
  ): Promise<void> => {
    try {
      await setDoc(doc(this.db, 'workout_plans', planId, 'progress', userId), progress, { merge: true });
    } catch (error) {
      console.error('Error updating workout progress:', error);
      throw error;
    }
  };

  // Clean up all subscriptions
  cleanup = (): void => {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  };
}

export const realTimeUpdatesService = new RealTimeUpdatesService();
