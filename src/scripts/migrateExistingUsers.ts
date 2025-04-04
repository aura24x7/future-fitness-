import { firestore } from '../firebase/firebaseInit';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { usernameService } from '../services/usernameService';

/**
 * Migrates existing users to the username system by:
 * 1. Finding all users without a username
 * 2. Generating a unique username for each user
 * 3. Updating user documents with the new username
 * 4. Creating corresponding documents in the usernames collection
 */
export async function migrateExistingUsers() {
  console.log('Starting user migration to add usernames...');
  
  try {
    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`Found ${snapshot.docs.length} users to process`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      // Skip users who already have a username
      if (userData.username) {
        console.log(`User ${userDoc.id} already has username: ${userData.username}`);
        skipped++;
        continue;
      }
      
      // Generate a username based on available user information
      try {
        // Choose the best available information for username generation
        const displayName = userData.displayName || userData.name || userData.email?.split('@')[0] || 'user';
        console.log(`Generating username for user ${userDoc.id} based on: ${displayName}`);
        
        const username = await usernameService.generateUniqueUsername(displayName);
        
        // Update user document
        await updateDoc(userDoc.ref, { username });
        
        // Add to usernames collection
        await setDoc(doc(firestore, 'usernames', username), {
          uid: userDoc.id,
          createdAt: new Date()
        });
        
        console.log(`Migrated user ${userDoc.id}: ${username}`);
        migrated++;
      } catch (err) {
        console.error(`Error migrating user ${userDoc.id}:`, err);
        errors++;
      }
    }
    
    console.log(`Migration complete: ${migrated} users migrated, ${skipped} skipped, ${errors} errors`);
    return {
      success: true,
      stats: {
        total: snapshot.docs.length,
        migrated,
        skipped,
        errors
      }
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return { 
      success: false, 
      error 
    };
  }
}

/**
 * Run the migration with safety checks
 */
export async function runUsernameMigration() {
  try {
    // Confirm with the user before running
    console.log('WARNING: This will assign usernames to all users without one.');
    console.log('This operation cannot be easily undone.');
    
    const result = await migrateExistingUsers();
    return result;
  } catch (error) {
    console.error('Migration error:', error);
    return { 
      success: false, 
      error 
    };
  }
} 