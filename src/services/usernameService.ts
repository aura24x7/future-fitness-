import { firestore } from '../firebase/firebaseInit';
import { collection, doc, getDoc, getDocs, query, where, setDoc, runTransaction } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class UsernameService {
  /**
   * Check if a username is available
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    if (!this.isValidUsername(username)) {
      return true; // Invalid usernames are considered "taken"
    }
    
    const formattedUsername = this.formatUsername(username);
    const usernameDoc = doc(firestore, 'usernames', formattedUsername);
    const docSnap = await getDoc(usernameDoc);
    return docSnap.exists();
  }
  
  /**
   * Format username to ensure it meets requirements
   */
  formatUsername(username: string): string {
    // Convert to lowercase, remove disallowed chars
    return username.toLowerCase()
      .replace(/[^a-z0-9_\.]/g, '')
      .substring(0, 15);
  }
  
  /**
   * Validate username against requirements
   */
  isValidUsername(username: string): boolean {
    const formatted = this.formatUsername(username);
    return formatted.length >= 3 && 
           formatted.length <= 15 && 
           /^[a-z0-9_\.]+$/.test(formatted);
  }
  
  /**
   * Claim a username for a user
   */
  async claimUsername(uid: string, username: string): Promise<boolean> {
    const formattedUsername = this.formatUsername(username);
    
    if (!this.isValidUsername(formattedUsername)) {
      return false;
    }
    
    try {
      // First check if user document exists
      const userDoc = doc(firestore, 'users', uid);
      const userSnapshot = await getDoc(userDoc);
      
      // If user document doesn't exist, create it with basic info
      if (!userSnapshot.exists()) {
        console.log('User document does not exist. Creating basic profile first...');
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        // Create a basic user document
        const now = new Date();
        await setDoc(userDoc, {
          uid: uid,
          username: formattedUsername,
          displayName: currentUser?.displayName || 'User',
          email: currentUser?.email || '',
          createdAt: now,
          updatedAt: now
        });
        
        // Then create username document directly
        const usernameDoc = doc(firestore, 'usernames', formattedUsername);
        await setDoc(usernameDoc, {
          uid,
          createdAt: now
        });
        
        return true;
      }
      
      // If user document exists, use a transaction to ensure atomicity
      await runTransaction(firestore, async (transaction) => {
        const usernameDoc = doc(firestore, 'usernames', formattedUsername);
        const usernameSnapshot = await transaction.get(usernameDoc);
        
        if (usernameSnapshot.exists()) {
          throw new Error('Username already taken');
        }
        
        // Update user document with username
        transaction.update(userDoc, { username: formattedUsername });
        
        // Create username document
        transaction.set(usernameDoc, {
          uid,
          createdAt: new Date()
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error claiming username:', error);
      return false;
    }
  }
  
  /**
   * Generate username suggestions based on display name
   */
  generateUsernameSuggestions(displayName: string): string[] {
    const base = this.formatUsername(displayName);
    const suggestions: string[] = [base];
    
    // Add some random numbers
    for (let i = 0; i < 3; i++) {
      const randomNum = Math.floor(Math.random() * 1000);
      suggestions.push(`${base}${randomNum}`);
    }
    
    // Add some fitness-related suffixes
    const suffixes = ['fit', 'fitness', 'health', 'active'];
    for (const suffix of suffixes) {
      if (base.length + suffix.length <= 15) {
        suggestions.push(`${base}_${suffix}`);
      }
    }
    
    return suggestions.filter(s => s.length >= 3 && s.length <= 15);
  }
  
  /**
   * Generate a unique username based on display name
   */
  async generateUniqueUsername(displayName: string): Promise<string> {
    const suggestions = this.generateUsernameSuggestions(displayName);
    
    for (const suggestion of suggestions) {
      if (!(await this.isUsernameTaken(suggestion))) {
        return suggestion;
      }
    }
    
    // If all suggestions are taken, create a totally random one
    for (let i = 0; i < 10; i++) {
      const random = `user_${Math.floor(Math.random() * 10000)}`;
      if (!(await this.isUsernameTaken(random))) {
        return random;
      }
    }
    
    throw new Error('Could not generate a unique username');
  }
}

export const usernameService = new UsernameService(); 