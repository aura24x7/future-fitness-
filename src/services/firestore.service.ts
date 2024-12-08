import { firestore } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';

export interface UserProfile {
  name: string;
  email: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface WorkoutPreferences {
  preferredDays: string[];
  preferredTimes: string[];
  workoutDuration: number;
}

export interface OnboardingData {
  fitnessGoals: string[];
  currentFitnessLevel: string;
  weightGoal: number;
  dietaryPreferences: string[];
  workoutPreferences: WorkoutPreferences;
  completed: boolean;
}

export interface UserSettings {
  notifications: boolean;
  measurementUnit: string;
  language: string;
}

export interface UserData {
  profile: UserProfile;
  onboarding?: OnboardingData;
  settings?: UserSettings;
}

class FirestoreService {
  private getUserRef(userId: string): DocumentReference<DocumentData> {
    return doc(firestore, 'users', userId);
  }

  async createUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const userRef = this.getUserRef(userId);
    const timestamp = serverTimestamp();
    
    await setDoc(userRef, {
      profile: {
        ...profile,
        createdAt: timestamp,
        lastLogin: timestamp,
      }
    }, { merge: true });
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const userRef = this.getUserRef(userId);
    await updateDoc(userRef, {
      'profile': {
        ...profile,
        updatedAt: serverTimestamp(),
      }
    });
  }

  async getUserData(userId: string): Promise<UserData | null> {
    const userRef = this.getUserRef(userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return userDoc.data() as UserData;
  }

  async updateOnboardingData(
    userId: string, 
    onboardingData: Partial<OnboardingData>
  ): Promise<void> {
    const userRef = this.getUserRef(userId);
    await updateDoc(userRef, {
      'onboarding': {
        ...onboardingData,
        updatedAt: serverTimestamp(),
      }
    });
  }

  async updateUserSettings(
    userId: string, 
    settings: Partial<UserSettings>
  ): Promise<void> {
    const userRef = this.getUserRef(userId);
    await updateDoc(userRef, {
      'settings': {
        ...settings,
        updatedAt: serverTimestamp(),
      }
    });
  }

  async markOnboardingComplete(userId: string): Promise<void> {
    const userRef = this.getUserRef(userId);
    await updateDoc(userRef, {
      'onboarding.completed': true,
      'onboarding.completedAt': serverTimestamp(),
    });
  }

  // Helper method to handle offline data sync
  async syncOfflineData(userId: string): Promise<void> {
    // This will be implemented in Phase 5 when we add offline capabilities
    // For now, it's a placeholder for the future implementation
  }
}

export const firestoreService = new FirestoreService();
