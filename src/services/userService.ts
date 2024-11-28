import { getFirestore, collection, doc, getDoc, query, where, limit, getDocs, FieldPath } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  following?: string[];
  followers?: string[];
}

class UserService {
  private db = getFirestore();
  private auth = getAuth();

  // Get current user
  getCurrentUser = async (): Promise<User | null> => {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(this.db, 'users', currentUser.uid));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() as Omit<User, 'id'> } : null;
  };

  // Search users by name or email
  searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];

    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const queryLower = query.toLowerCase();
    
    try {
      const nameQuery = query(
        collection(this.db, 'users'),
        where('nameLower', '>=', queryLower),
        where('nameLower', '<=', queryLower + '\uf8ff'),
        limit(10)
      );

      const emailQuery = query(
        collection(this.db, 'users'),
        where('emailLower', '>=', queryLower),
        where('emailLower', '<=', queryLower + '\uf8ff'),
        limit(10)
      );

      const [nameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(emailQuery)
      ]);

      const users = new Map<string, User>();

      // Add users from name search
      nameSnapshot.docs.forEach(doc => {
        if (doc.id !== currentUser.uid) {
          users.set(doc.id, { id: doc.id, ...doc.data() as Omit<User, 'id'> });
        }
      });

      // Add users from email search
      emailSnapshot.docs.forEach(doc => {
        if (doc.id !== currentUser.uid && !users.has(doc.id)) {
          users.set(doc.id, { id: doc.id, ...doc.data() as Omit<User, 'id'> });
        }
      });

      return Array.from(users.values());
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  };

  // Get user's following list
  getFollowing = async (userId: string): Promise<string[]> => {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      const userData = userDoc.data();
      return userData?.following || [];
    } catch (error) {
      console.error('Error getting following list:', error);
      return [];
    }
  };

  // Get user's followers
  getFollowers = async (userId: string): Promise<string[]> => {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      const userData = userDoc.data();
      return userData?.followers || [];
    } catch (error) {
      console.error('Error getting followers list:', error);
      return [];
    }
  };

  // Get multiple users by IDs
  getUsersByIds = async (userIds: string[]): Promise<User[]> => {
    if (!userIds.length) return [];

    try {
      const usersQuery = query(
        collection(this.db, 'users'),
        where(FieldPath.documentId(), 'in', userIds)
      );

      const usersSnapshot = await getDocs(usersQuery);

      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<User, 'id'>,
      }));
    } catch (error) {
      console.error('Error getting users by IDs:', error);
      throw error;
    }
  };
}

export const userService = new UserService();
