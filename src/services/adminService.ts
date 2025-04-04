import { runUsernameMigration } from '../scripts/migrateExistingUsers';
import { firestore } from '../firebase/firebaseInit';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Service for administrative functions that should only be available to admin users
 */
class AdminService {
  /**
   * Check if the current user is an admin
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        return false;
      }
      
      // Check admin status in Firestore
      const userDoc = doc(firestore, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (!userSnapshot.exists()) {
        return false;
      }
      
      // Check if the user has admin role or isAdmin flag
      const userData = userSnapshot.data();
      return userData.role === 'admin' || userData.isAdmin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
  
  /**
   * Run the username migration process for all users
   * This function should only be available to admin users
   */
  async runUsernameMigration(): Promise<{
    success: boolean;
    stats?: {
      total: number;
      migrated: number;
      skipped: number;
      errors: number;
    };
    error?: any;
  }> {
    try {
      // Check if the current user is an admin
      const isAdmin = await this.isCurrentUserAdmin();
      
      if (!isAdmin) {
        throw new Error('Unauthorized: Only admin users can run migrations');
      }
      
      // Run the migration
      console.log('Running username migration from admin service...');
      const result = await runUsernameMigration();
      return result;
    } catch (error) {
      console.error('Error running username migration:', error);
      return {
        success: false,
        error
      };
    }
  }
}

export const adminService = new AdminService(); 