import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface AuthError {
  code: string;
  message: string;
}

class AuthService {
  async signUp(email: string, password: string, displayName?: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      if (displayName) {
        await userCredential.user.updateProfile({
          displayName
        });
      }
      return userCredential;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async signIn(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async updateUserProfile(displayName: string): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      await user.updateProfile({
        displayName
      });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  private handleAuthError(error: any): AuthError {
    console.error('Auth error:', error);
    return {
      code: error.code || 'auth/unknown',
      message: error.message || 'An unknown error occurred'
    };
  }
}

export const authService = new AuthService();
