# Friend and Notification System Enhancement Plan

## Current State & Problem Statement

The Future Fitness app currently has a basic "Groups" social feature that has been repurposed to show individual users (friends). However, the current implementation has several limitations:

1. **Mock Data Usage**: The system uses mock data instead of actual user records from Firebase
2. **Limited Friend Addition**: Adding friends adds a generic "New Friend" with random ID without user search capability
3. **Non-functional Notifications**: When sending meal/workout reminders, the app shows success messages but doesn't actually send notifications
4. **UI/UX Issues**: The UI shows "Groups" in tab labels while displaying individuals

The screenshot below shows the current UI:
- Tab labeled "Groups" but shows individual users
- "Add Friend" button adds random generic users
- Notification button shows alerts but doesn't send actual notifications

## Enhancement Goals

1. Replace mock data with actual Firebase integration
2. Implement user search by unique ID
3. Create a real notification system between connected users
4. Improve UI/UX for finding and connecting with friends
5. Add additional social features (activity sharing, progress comparison)

## Implementation Plan

### ✅ Phase 1: User Search & Connection (Foundation)

**Objective**: Replace mock friend addition with real user search and connection functionality.

#### Key Files to Create/Modify:

1. **New File: `src/screens/FriendSearchScreen.tsx`**
   - Create a new screen for searching users
   - Implement search by unique ID
   - Display search results and allow adding connections

2. **Modify: `src/components/ProfileGroups/GroupsSection.tsx`**
   - Change the "Add Friend" button to navigate to FriendSearchScreen
   - Update to load real connections from Firebase

3. **Modify: `src/services/userService.ts`**
   - Add methods for searching users by ID
   - Add methods for creating/managing connections
   - Update getConnections to pull real data

#### Detailed Implementation:

```typescript
// src/screens/FriendSearchScreen.tsx (New)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { userService } from '../../services/userService';

const FriendSearchScreen: React.FC = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await userService.findUserByUniqueId(searchQuery.trim());
      setSearchResults(results ? [results] : []);
      if (!results) {
        setError('No user found with that ID');
      }
    } catch (err) {
      setError('Error searching for user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddFriend = async (userId: string) => {
    try {
      const currentUserId = userService.getCurrentUserId();
      await userService.addConnection(currentUserId, userId);
      // Show success and navigate back
      navigation.goBack();
    } catch (err) {
      setError('Failed to add connection');
      console.error(err);
    }
  };
  
  return (
    // UI implementation...
  );
};
```

```typescript
// src/services/userService.ts (Update)
class UserService {
  // Existing methods...
  
  async findUserByUniqueId(uniqueId: string) {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where("uid", "==", uniqueId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }
  
  getCurrentUserId() {
    const auth = getAuth();
    return auth.currentUser?.uid;
  }
  
  async addConnection(currentUserId: string, targetUserId: string) {
    try {
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
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  }
  
  async getConnections(userId: string) {
    try {
      const connectionsRef = collection(firestore, 'connections');
      const q = query(connectionsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const connections = [];
      for (const doc of querySnapshot.docs) {
        const connection = doc.data();
        const userInfo = await this.findUserById(connection.connectedUserId);
        connections.push(userInfo);
      }
      
      return connections;
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error;
    }
  }
}
```

```typescript
// Update GroupsSection.tsx
export const GroupsSection: React.FC = () => {
  // Existing code...
  
  const handleAddFriend = () => {
    navigation.navigate('FriendSearch');
  };
  
  const loadFriends = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const currentUserId = userService.getCurrentUserId();
      if (!currentUserId) {
        setError('You must be logged in to view connections');
        setLoading(false);
        return;
      }
      
      const connections = await userService.getConnections(currentUserId);
      setFriends(connections);
    } catch (err) {
      console.error('Error loading friends:', err);
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };
  
  // Remaining code...
}
```

#### Expected Outcomes of Phase 1:
- Users can search for other users by their unique ID
- Users can add connections with real data from Firebase
- The friends list shows actual users instead of mock data

### ✅ Phase 2: Real Notification System

**Objective**: Implement actual notifications between connected users.

#### Key Files to Create/Modify:

1. **New File: `src/services/notificationService.ts`**
   - Create service for sending and receiving notifications
   - Integrate with Firebase for persistence

2. **Update: `src/components/ProfileGroups/IndividualProfileSection.tsx`**
   - Implement real notification sending
   - Update UI to show notification status

3. **New Files: Firebase Cloud Functions**
   - Implement cloud functions for push notifications

#### Detailed Implementation:

```typescript
// src/services/notificationService.ts (New)
import { firestore, functions } from '../firebase/firebaseInit';
import { collection, doc, setDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export interface Notification {
  id: string;
  senderId: string;
  recipientId: string;
  type: 'workout' | 'meal' | 'other';
  message: string;
  createdAt: Date;
  read: boolean;
}

class NotificationService {
  async sendNotification(senderId: string, recipientId: string, type: 'workout' | 'meal' | 'other', message: string) {
    try {
      const notificationRef = doc(collection(firestore, 'notifications'));
      
      await setDoc(notificationRef, {
        id: notificationRef.id,
        senderId,
        recipientId,
        type,
        message,
        createdAt: new Date(),
        read: false
      });
      
      // Call Firebase Cloud Function to trigger push notification
      const functionRef = httpsCallable(functions, 'sendPushNotification');
      await functionRef({
        recipientId,
        message,
        type
      });
      
      return notificationRef.id;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
  
  async getNotifications(userId: string) {
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const q = query(notificationsRef, where("recipientId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }
  
  async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(firestore, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
```

```typescript
// src/components/ProfileGroups/IndividualProfileSection.tsx (Update)
import React, { useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';

export function IndividualProfileSection({ profile, navigation }) {
  const { colors } = useTheme();
  const [isSending, setIsSending] = useState(false);
  
  const handleSendNotification = () => {
    Alert.alert(
      'Send Notification',
      `Send a notification to ${profile.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Workout Reminder',
          onPress: async () => {
            try {
              setIsSending(true);
              const currentUserId = userService.getCurrentUserId();
              
              await notificationService.sendNotification(
                currentUserId, 
                profile.id, 
                'workout',
                `It's time for your workout!`
              );
              
              Alert.alert('Success', `Workout reminder sent to ${profile.name}!`);
            } catch (error) {
              Alert.alert('Error', 'Failed to send notification');
              console.error(error);
            } finally {
              setIsSending(false);
            }
          },
        },
        {
          text: 'Send Meal Reminder',
          onPress: async () => {
            try {
              setIsSending(true);
              const currentUserId = userService.getCurrentUserId();
              
              await notificationService.sendNotification(
                currentUserId, 
                profile.id, 
                'meal',
                `Time to log your meal!`
              );
              
              Alert.alert('Success', `Meal reminder sent to ${profile.name}!`);
            } catch (error) {
              Alert.alert('Error', 'Failed to send notification');
              console.error(error);
            } finally {
              setIsSending(false);
            }
          },
        },
      ],
    );
  };
  
  // Rest of component remains largely the same
  // ...
}
```

**Firebase Cloud Function (functions/index.js)**:
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { recipientId, message, type } = data;
  
  // Get user's device tokens
  const userRef = admin.firestore().collection('users').doc(recipientId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  
  if (!userData || !userData.fcmTokens || userData.fcmTokens.length === 0) {
    return { success: false, error: 'No device tokens found' };
  }
  
  // Get sender info for the notification
  const senderRef = admin.firestore().collection('users').doc(context.auth.uid);
  const senderDoc = await senderRef.get();
  const senderData = senderDoc.data();
  const senderName = senderData?.displayName || 'A friend';
  
  // Send to each device
  const notifications = userData.fcmTokens.map(token => {
    return admin.messaging().send({
      token,
      notification: {
        title: type === 'workout' ? 'Workout Reminder' : 'Meal Reminder',
        body: `${senderName}: ${message}`
      },
      data: {
        type,
        senderId: context.auth.uid
      }
    }).catch(error => {
      // Token might be invalid
      console.error('Error sending notification:', error);
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        // Remove the invalid token
        const tokens = userData.fcmTokens.filter(t => t !== token);
        userRef.update({ fcmTokens: tokens });
      }
    });
  });
  
  try {
    await Promise.all(notifications);
    return { success: true };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return { success: false, error: error.message };
  }
});

// Also create a function to update FCM tokens
exports.updateFcmToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { token } = data;
  const userId = context.auth.uid;
  
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  
  const userData = userDoc.data();
  const tokens = userData.fcmTokens || [];
  
  if (!tokens.includes(token)) {
    tokens.push(token);
    await userRef.update({ fcmTokens: tokens });
  }
  
  return { success: true };
});
```

#### Expected Outcomes of Phase 2:
- Users can send real notifications to their connections
- Notifications are stored in Firebase
- Push notifications are delivered to recipients
- Basic notification history is implemented

### ✅ Phase 3: Improve UI/UX

**Objective**: Create a better user experience for finding and connecting with friends.

#### Key Files to Create/Modify:

1. **New File: `src/screens/ConnectionRequestsScreen.tsx`**
   - Display incoming and outgoing connection requests
   - Allow accepting/rejecting requests

2. **Update: `src/screens/FriendSearchScreen.tsx`**
   - Enhance with improved search capabilities 
   - Add user suggestions

3. **Update: `src/components/ProfileGroups/ProfileGroupsScreen.tsx`**
   - Rename text labels from "Groups" to "Friends" or "Connections"
   - Add navigation to connection requests

#### Detailed Implementation:

```typescript
// Update userService.ts for connection requests
class UserService {
  // Add these methods to existing service
  
  async sendConnectionRequest(senderId: string, recipientId: string) {
    const connectionRef = doc(firestore, 'connections', `${senderId}_${recipientId}`);
    await setDoc(connectionRef, {
      userId: senderId,
      connectedUserId: recipientId,
      createdAt: new Date(),
      status: 'pending',
      initiatedBy: senderId
    });
  }
  
  async acceptConnection(connectionId: string) {
    const connectionRef = doc(firestore, 'connections', connectionId);
    await updateDoc(connectionRef, {
      status: 'accepted',
      acceptedAt: new Date()
    });
  }
  
  async rejectConnection(connectionId: string) {
    const connectionRef = doc(firestore, 'connections', connectionId);
    await updateDoc(connectionRef, {
      status: 'rejected',
      rejectedAt: new Date()
    });
  }
  
  async getPendingRequests(userId: string) {
    // Get incoming requests (where I'm the connectedUserId and status is pending)
    const incomingRef = collection(firestore, 'connections');
    const incomingQuery = query(
      incomingRef, 
      where("connectedUserId", "==", userId),
      where("status", "==", "pending")
    );
    
    const incomingSnapshot = await getDocs(incomingQuery);
    const incoming = [];
    
    for (const doc of incomingSnapshot.docs) {
      const data = doc.data();
      const senderInfo = await this.findUserById(data.userId);
      incoming.push({
        connectionId: doc.id,
        ...data,
        sender: senderInfo
      });
    }
    
    // Get outgoing requests (where I'm the userId and status is pending)
    const outgoingRef = collection(firestore, 'connections');
    const outgoingQuery = query(
      outgoingRef, 
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    
    const outgoingSnapshot = await getDocs(outgoingQuery);
    const outgoing = [];
    
    for (const doc of outgoingSnapshot.docs) {
      const data = doc.data();
      const receiverInfo = await this.findUserById(data.connectedUserId);
      outgoing.push({
        connectionId: doc.id,
        ...data,
        receiver: receiverInfo
      });
    }
    
    return { incoming, outgoing };
  }
}
```

```typescript
// src/screens/ConnectionRequestsScreen.tsx (New)
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { userService } from '../../services/userService';
import { useTheme } from '../../theme/ThemeProvider';

const ConnectionRequestsScreen: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadRequests();
  }, []);
  
  const loadRequests = async () => {
    try {
      setLoading(true);
      const currentUserId = userService.getCurrentUserId();
      const pendingRequests = await userService.getPendingRequests(currentUserId);
      setRequests(pendingRequests);
    } catch (err) {
      setError('Failed to load connection requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccept = async (connectionId) => {
    try {
      await userService.acceptConnection(connectionId);
      // Refresh the list
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleReject = async (connectionId) => {
    try {
      await userService.rejectConnection(connectionId);
      // Refresh the list
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };
  
  // Render UI for incoming and outgoing requests with accept/reject buttons
  // ...
};
```

#### Expected Outcomes of Phase 3:
- Friend requests with accept/reject flows
- Improved search with multiple search criteria
- Better UI consistent with app design
- Clearer status indicators for connections

### Phase 4: Additional Social Features

**Objective**: Enhance social interaction between users.

#### Key Files to Create/Modify:

1. **New Feature: Activity Sharing**
   - Create activity sharing UI and logic
   - Allow users to share workout achievements

2. **New Feature: Progress Comparison**
   - Implement progress comparison charts between friends
   - Add privacy settings for shared data

#### Detailed Implementation:

This phase would involve creating multiple new components and services for activity sharing and progress comparison. Details would be elaborated when we reach this phase.

## Technical Specifications

### Firebase Collection Structure

#### Users Collection
```
users/
  {userId}/
    uid: string
    displayName: string
    email: string
    photoURL: string
    fitnessGoals: string[]
    fcmTokens: string[]  // for push notifications
    privacySettings: {
      public: boolean
      shareActivity: boolean
      shareProgress: boolean
    }
    createdAt: timestamp
```

#### Connections Collection
```
connections/
  {userId_connectedUserId}/
    userId: string
    connectedUserId: string
    status: 'pending' | 'accepted' | 'rejected'
    initiatedBy: string
    createdAt: timestamp
    acceptedAt: timestamp (optional)
    rejectedAt: timestamp (optional)
```

#### Notifications Collection
```
notifications/
  {notificationId}/
    senderId: string
    recipientId: string
    type: 'workout' | 'meal' | 'other'
    message: string
    createdAt: timestamp
    read: boolean
```

### Firebase Security Rules

```
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data and public profiles
    match /users/{userId} {
      allow read: if request.auth.uid == userId || 
                   resource.data.privacySettings.public == true;
      allow write: if request.auth.uid == userId;
    }
    
    // Connections can be read by either user
    match /connections/{connectionId} {
      allow read: if connectionId.split('_')[0] == request.auth.uid || 
                   connectionId.split('_')[1] == request.auth.uid;
      allow create: if connectionId.split('_')[0] == request.auth.uid;
      allow update: if connectionId.split('_')[0] == request.auth.uid || 
                     connectionId.split('_')[1] == request.auth.uid;
    }
    
    // Notifications can be read by recipient, created by anyone
    match /notifications/{notificationId} {
      allow read: if resource.data.recipientId == request.auth.uid;
      allow create: if request.resource.data.senderId == request.auth.uid;
      allow update: if resource.data.recipientId == request.auth.uid;
    }
  }
}
```

## Testing Strategy

For each phase, we should implement:

1. **Unit Tests**:
   - Test individual service methods
   - Ensure proper error handling

2. **Integration Tests**:
   - Test Firebase integration
   - Verify data flows correctly between components

3. **UI Tests**:
   - Verify UI components render correctly
   - Test user flows and interactions

4. **Manual Testing**:
   - Verify notifications are received
   - Test friend requests work properly
   - Ensure search functionality returns expected results

## Conclusion

This phased approach allows for incremental implementation while providing value at each stage. The plan focuses on:

1. Building a solid foundation with real user connections
2. Implementing a functional notification system
3. Enhancing the user experience
4. Adding more social features to increase engagement

Each phase builds upon the previous one, ensuring a cohesive and robust social system for the Future Fitness app. 