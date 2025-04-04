// TODO: Uncomment when Supabase is configured
// import { supabase } from '../lib/supabase';
import { collection, doc, getDocs, getDoc, setDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../firebase/firebaseInit';

// Interface for user data
export interface UserData {
  id: string;
  name: string;
  email?: string;
  status?: string;
  goals?: string[];
  last_active?: string;
  username?: string;
}

// Mock data for development
const mockUsers = [
  {
    id: '1',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    last_active: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    last_active: new Date().toISOString(),
  },
];

class UserService {
  async findUserById(userId: string): Promise<UserData | null> {
    try {
      // First try Firebase
      if (this.isFirebaseEnabled()) {
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            id: userDoc.id,
            name: userData.displayName || userData.name || 'Unknown User',
            email: userData.email,
            status: userData.status || 'Active user',
            goals: userData.goals || [],
            last_active: userData.lastActive || userData.last_active || new Date().toISOString()
          };
        }
      }
      
      // Fallback to mock data
      const user = mockUsers.find(u => u.id === userId);
      return user || null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }
  
  async findUserByUsername(username: string): Promise<UserData | null> {
    try {
      if (this.isFirebaseEnabled()) {
        // First, format the username
        const formattedUsername = username.toLowerCase().trim();
        
        // Check usernames collection first (more efficient)
        const usernameDoc = doc(firestore, 'usernames', formattedUsername);
        const usernameSnapshot = await getDoc(usernameDoc);
        
        if (usernameSnapshot.exists()) {
          const uid = usernameSnapshot.data().uid;
          const userDoc = await getDoc(doc(firestore, 'users', uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as any;
            return {
              id: userDoc.id,
              name: userData.displayName || 'Unknown User',
              username: userData.username,
              email: userData.email,
              status: userData.status || 'Active user',
              goals: userData.goals || [],
              last_active: userData.lastActive || userData.last_active || new Date().toISOString()
            };
          }
        }
        
        // Fallback to direct query on users collection
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("username", "==", formattedUsername));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data() as any;
          return {
            id: querySnapshot.docs[0].id,
            name: userData.displayName || 'Unknown User',
            username: userData.username,
            email: userData.email,
            status: userData.status || 'Active user',
            goals: userData.goals || [],
            last_active: userData.lastActive || userData.last_active || new Date().toISOString()
          };
        }
      }
      
      // No user found
      return null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }
  
  async findUserByUniqueId(query: string): Promise<UserData | null> {
    try {
      // First try to find by username (more common scenario)
      const userByUsername = await this.findUserByUsername(query);
      if (userByUsername) {
        return userByUsername;
      }
      
      // Fallback to original UID search logic
      if (this.isFirebaseEnabled()) {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("uid", "==", query));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          return {
            id: querySnapshot.docs[0].id,
            name: userData.displayName || userData.name || 'Unknown User',
            username: userData.username,
            email: userData.email,
            status: userData.status || 'Active user',
            goals: userData.goals || [],
            last_active: userData.lastActive || userData.last_active || new Date().toISOString()
          };
        }
      }
      
      // Fallback to mock data
      const user = mockUsers.find(u => u.id === query);
      return user || null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserData> {
    try {
      return {
        id: '0',
        name: 'Current User',
        email: 'current@example.com',
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }
  
  getCurrentUserId(): string {
    if (this.isFirebaseEnabled()) {
      const auth = getAuth();
      return auth.currentUser?.uid || '0';
    }
    return '0'; // Mock current user ID
  }

  async getConnections(): Promise<UserData[]> {
    try {
      if (this.isFirebaseEnabled()) {
        const currentUserId = this.getCurrentUserId();
        const connectionsRef = collection(firestore, 'connections');
        
        // Get connections where current user is the sender AND status is accepted
        const outgoingQuery = query(
          connectionsRef, 
          where("userId", "==", currentUserId),
          where("status", "==", "accepted")
        );
        
        // Get connections where current user is the recipient AND status is accepted
        const incomingQuery = query(
          connectionsRef, 
          where("connectedUserId", "==", currentUserId),
          where("status", "==", "accepted")
        );
        
        const connections = [];
        
        // Process outgoing connections
        const outgoingSnapshot = await getDocs(outgoingQuery);
        for (const doc of outgoingSnapshot.docs) {
          const connection = doc.data();
          const userInfo = await this.findUserById(connection.connectedUserId);
          if (userInfo) {
            connections.push(userInfo);
          }
        }
        
        // Process incoming connections
        const incomingSnapshot = await getDocs(incomingQuery);
        for (const doc of incomingSnapshot.docs) {
          const connection = doc.data();
          const userInfo = await this.findUserById(connection.userId);
          if (userInfo) {
            connections.push(userInfo);
          }
        }
        
        if (connections.length > 0) {
          return connections;
        }
      }
      
      // Fallback to mock data
      return mockUsers;
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error;
    }
  }

  async addConnection(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      if (this.isFirebaseEnabled()) {
        // Check if connection already exists
        const connectionId = `${currentUserId}_${targetUserId}`;
        const reverseConnectionId = `${targetUserId}_${currentUserId}`;
        
        const connectionRef = doc(firestore, 'connections', connectionId);
        const reverseConnectionRef = doc(firestore, 'connections', reverseConnectionId);
        
        const connectionDoc = await getDoc(connectionRef);
        const reverseConnectionDoc = await getDoc(reverseConnectionRef);
        
        if (connectionDoc.exists() || reverseConnectionDoc.exists()) {
          throw new Error('Connection already exists');
        }
        
        // Add to connections collection
        await setDoc(connectionRef, {
          userId: currentUserId,
          connectedUserId: targetUserId,
          createdAt: new Date(),
          status: 'active'
        });
        
        return true;
      }
      
      // Mock implementation
      console.log('Connection added with user:', targetUserId);
      return true;
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  }
  
  /**
   * Send a connection request to another user
   */
  async sendConnectionRequest(senderId: string, recipientId: string): Promise<boolean> {
    try {
      if (this.isFirebaseEnabled()) {
        // Check if connection or request already exists
        const connectionId = `${senderId}_${recipientId}`;
        const reverseConnectionId = `${recipientId}_${senderId}`;
        
        const connectionRef = doc(firestore, 'connections', connectionId);
        const reverseConnectionRef = doc(firestore, 'connections', reverseConnectionId);
        
        const connectionDoc = await getDoc(connectionRef);
        const reverseConnectionDoc = await getDoc(reverseConnectionRef);
        
        if (connectionDoc.exists() || reverseConnectionDoc.exists()) {
          throw new Error('Connection or request already exists');
        }
        
        // Create a new pending connection
        await setDoc(connectionRef, {
          userId: senderId,
          connectedUserId: recipientId,
          createdAt: new Date(),
          status: 'pending',
          initiatedBy: senderId
        });
        
        return true;
      }
      
      // Mock implementation
      console.log('Connection request sent to user:', recipientId);
      return true;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  }
  
  /**
   * Accept a connection request
   */
  async acceptConnection(connectionId: string): Promise<void> {
    try {
      if (this.isFirebaseEnabled()) {
        const connectionRef = doc(firestore, 'connections', connectionId);
        const connectionDoc = await getDoc(connectionRef);
        
        if (!connectionDoc.exists()) {
          throw new Error('Connection request not found');
        }
        
        await setDoc(connectionRef, {
          ...connectionDoc.data(),
          status: 'accepted',
          acceptedAt: new Date()
        }, { merge: true });
      } else {
        console.log('Accepted connection request:', connectionId);
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
      throw error;
    }
  }
  
  /**
   * Reject a connection request
   */
  async rejectConnection(connectionId: string): Promise<void> {
    try {
      if (this.isFirebaseEnabled()) {
        const connectionRef = doc(firestore, 'connections', connectionId);
        const connectionDoc = await getDoc(connectionRef);
        
        if (!connectionDoc.exists()) {
          throw new Error('Connection request not found');
        }
        
        await setDoc(connectionRef, {
          ...connectionDoc.data(),
          status: 'rejected',
          rejectedAt: new Date()
        }, { merge: true });
      } else {
        console.log('Rejected connection request:', connectionId);
      }
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      throw error;
    }
  }
  
  /**
   * Get all pending connection requests for a user
   */
  async getPendingRequests(userId: string): Promise<{ incoming: any[]; outgoing: any[] }> {
    try {
      const incoming: any[] = [];
      const outgoing: any[] = [];
      
      if (this.isFirebaseEnabled()) {
        // Get incoming requests (where I'm the connectedUserId and status is pending)
        const incomingRef = collection(firestore, 'connections');
        const incomingQuery = query(
          incomingRef, 
          where("connectedUserId", "==", userId),
          where("status", "==", "pending")
        );
        
        const incomingSnapshot = await getDocs(incomingQuery);
        
        for (const doc of incomingSnapshot.docs) {
          const data = doc.data();
          const senderInfo = await this.findUserById(data.userId);
          if (senderInfo) {
            incoming.push({
              connectionId: doc.id,
              ...data,
              sender: senderInfo
            });
          }
        }
        
        // Get outgoing requests (where I'm the userId and status is pending)
        const outgoingRef = collection(firestore, 'connections');
        const outgoingQuery = query(
          outgoingRef, 
          where("userId", "==", userId),
          where("status", "==", "pending")
        );
        
        const outgoingSnapshot = await getDocs(outgoingQuery);
        
        for (const doc of outgoingSnapshot.docs) {
          const data = doc.data();
          const receiverInfo = await this.findUserById(data.connectedUserId);
          if (receiverInfo) {
            outgoing.push({
              connectionId: doc.id,
              ...data,
              receiver: receiverInfo
            });
          }
        }
      } else {
        // Mock data
        incoming.push({
          connectionId: 'mock_in_1',
          userId: 'mock_sender_1',
          connectedUserId: userId,
          status: 'pending',
          createdAt: new Date(),
          sender: { 
            id: 'mock_sender_1', 
            name: 'Mock Sender 1',
            status: 'Active user'
          }
        });
        
        outgoing.push({
          connectionId: 'mock_out_1',
          userId: userId,
          connectedUserId: 'mock_receiver_1',
          status: 'pending',
          createdAt: new Date(),
          receiver: { 
            id: 'mock_receiver_1', 
            name: 'Mock Receiver 1',
            status: 'Active user'
          }
        });
      }
      
      return { incoming, outgoing };
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return { incoming: [], outgoing: [] };
    }
  }
  
  // Helper method to check if Firebase is available
  private isFirebaseEnabled(): boolean {
    try {
      return !!firestore;
    } catch (error) {
      return false;
    }
  }
}

export const userService = new UserService();
