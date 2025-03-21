import firestore from '@react-native-firebase/firestore';
import { UserProfile, UserData, OnboardingData, UserSettings } from '../types/profile';

class FirestoreService {
  private getUserRef(userId: string) {
    return firestore().collection('users').doc(userId);
  }

  async createUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const userRef = this.getUserRef(userId);
    const timestamp = firestore.Timestamp.now();
    
    await userRef.set({
      profile: {
        ...profile,
        createdAt: timestamp,
        lastLogin: timestamp,
      }
    }, { merge: true });
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const userRef = this.getUserRef(userId);
    await userRef.update({
      'profile': {
        ...profile,
        updatedAt: firestore.Timestamp.now(),
      }
    });
  }

  async getUserData(userId: string): Promise<UserData | null> {
    const userRef = this.getUserRef(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return userDoc.data() as UserData;
  }

  async updateOnboardingData(
    userId: string, 
    onboardingData: Partial<OnboardingData>
  ): Promise<void> {
    const userRef = this.getUserRef(userId);
    await userRef.update({
      'onboarding': {
        ...onboardingData,
        updatedAt: firestore.Timestamp.now(),
      }
    });
  }

  async updateUserSettings(
    userId: string, 
    settings: Partial<UserSettings>
  ): Promise<void> {
    const userRef = this.getUserRef(userId);
    await userRef.update({
      'settings': {
        ...settings,
        updatedAt: firestore.Timestamp.now(),
      }
    });
  }

  async markOnboardingComplete(userId: string): Promise<void> {
    const userRef = this.getUserRef(userId);
    await userRef.update({
      'onboarding.completed': true,
      'onboarding.completedAt': firestore.Timestamp.now(),
    });
  }

  // Helper method to handle offline data sync
  async syncOfflineData(userId: string): Promise<void> {
    // This will be implemented in Phase 5 when we add offline capabilities
    // For now, it's a placeholder for the future implementation
  }
}

export default new FirestoreService();
