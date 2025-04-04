# Username System Implementation Plan

## Project Context & Problem Statement

Future Fitness currently uses Firebase Authentication UIDs as the primary identifier for users. While functional for backend operations, these UIDs present several challenges for the friend search feature:

1. **Poor User Experience**: Firebase UIDs are long, complex strings (e.g., `K2jdhf83nkHJD73jdk`) that are difficult for users to remember and share.
2. **Limited Search Options**: The current implementation only allows exact UID matching, making it difficult for users to find friends.
3. **Friction in Social Connections**: Users need an easy way to share their identity with friends to establish connections.

Currently, the friend search feature in our FriendSearchScreen.tsx allows users to search by the exact Firebase UID, which is not user-friendly and limits the app's social capabilities.

## Progress Summary

- ✅ **Phase 1: Username Service** - Created the username service for validation, checking availability, and claiming usernames
- ✅ **Phase 2: Onboarding Flow Update** - Modified user registration and onboarding to include username selection
- ✅ **Phase 3: Update Friend Search Feature** - Updated search functionality to use usernames instead of UIDs
- ✅ **Phase 4: Profile Updates** - Updated user profiles to display usernames and added username change feature
- ✅ **Phase 5: Existing User Migration** - Created script to generate usernames for existing users
- ⬜ **Phase 6: Testing** - Comprehensive testing of the username system

## Solution Overview

We will implement a username system that provides each user with a unique, human-readable identifier. This username will:

1. Be created during user onboarding
2. Serve as a searchable identifier for the friend search feature
3. Be displayed in user profiles and friend lists
4. Be easily shareable between users

This implementation will enhance the social connectivity of the app while providing a more intuitive user experience.

## Technical Specifications

### Data Structure Updates

#### Firebase User Collection Update

```typescript
// Current User Structure
users/
  {userId}/  // Firebase Auth UID
    uid: string
    displayName: string
    email: string
    photoURL: string
    fitnessGoals: string[]
    fcmTokens: string[]
    // Other fields...

// Updated User Structure
users/
  {userId}/  // Firebase Auth UID remains primary key
    uid: string
    username: string  // New field: unique, lowercase, 3-15 chars
    displayName: string
    email: string
    photoURL: string
    fitnessGoals: string[]
    fcmTokens: string[]
    // Other fields...
```

#### New Usernames Collection (for uniqueness enforcement)

```typescript
usernames/
  {username}/  // The actual username as document ID
    uid: string  // Reference to user's Firebase Auth UID
    createdAt: timestamp
```

### Firebase Security Rules

Add the following rules to ensure username uniqueness and security:

```
service cloud.firestore {
  match /databases/{database}/documents {
    // User document rules
    match /users/{userId} {
      // Existing rules...
      
      // Username validation
      function isValidUsername(username) {
        return username.size() >= 3 
          && username.size() <= 15 
          && username.matches('^[a-z0-9_\\.]+$');
      }
      
      // Allow create/update only if username is valid and not taken
      allow create: if request.auth.uid == userId && 
                     isValidUsername(request.resource.data.username) &&
                     !exists(/databases/$(database)/documents/usernames/$(request.resource.data.username));
      
      allow update: if request.auth.uid == userId && 
                     (request.resource.data.username == resource.data.username || 
                      (isValidUsername(request.resource.data.username) &&
                       !exists(/databases/$(database)/documents/usernames/$(request.resource.data.username))));
    }
    
    // Usernames collection for enforcing uniqueness
    match /usernames/{username} {
      allow read;
      allow create: if request.auth.uid == request.resource.data.uid &&
                     !exists(/databases/$(database)/documents/usernames/$(username));
      allow delete: if request.auth.uid == resource.data.uid;
    }
  }
}
```

## Implementation Plan

### Phase 1: Username Service ✅

Create a new service that will handle username validation, availability checks, and suggestions.

#### New File: `src/services/usernameService.ts`

```typescript
import { firestore } from '../firebase/firebaseInit';
import { collection, doc, setDoc, query, where, getDocs, runTransaction } from 'firebase/firestore';

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
      // First check if user document exists - BUGFIX: This check prevents the "No document to update" error
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
      
      // Use a transaction to ensure atomicity
      await runTransaction(firestore, async (transaction) => {
        const usernameDoc = doc(firestore, 'usernames', formattedUsername);
        const userDoc = doc(firestore, 'users', uid);
        
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
```

### Phase 2: Onboarding Flow Update ✅

Modify the user registration and onboarding process to include username selection.

#### New File: `src/screens/onboarding/UsernameSelectionScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usernameService } from '../../services/usernameService';
import { userService } from '../../services/userService';
import { useTheme } from '../../theme/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

// ... rest of implementation
```

#### Update Onboarding Navigation Flow

Added the username selection screen to the onboarding flow by updating the WeightTargetDateScreen to navigate to the UsernameSelectionScreen before proceeding to the Location screen.

```typescript
// In WeightTargetDateScreen
const handleContinue = async () => {
  // Save weight target date data
  // ...
  
  // Navigate to username selection with display name
  const displayName = onboardingData?.name || 'User';
  navigation.navigate('UsernameSelection', {
    displayName
  });
};
```

Updated the RootStackParamList in navigation.ts and the AppNavigator.tsx to include the new screen.

### Phase 3: Update Friend Search Feature ✅

Update the user search functionality to use usernames instead of UIDs.

#### Update `src/services/userService.ts`

```typescript
// Add to userService.ts
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
          const userData = userDoc.data();
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
        const userData = querySnapshot.docs[0].data();
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

// Also update the original search method to try username first, then fallback to UID
async findUserByUniqueId(query: string): Promise<UserData | null> {
  try {
    // First try to find by username (more common scenario)
    const userByUsername = await this.findUserByUsername(query);
    if (userByUsername) {
      return userByUsername;
    }
    
    // Fallback to original UID search logic
    // ... existing code ...
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}
```

#### Update `src/screens/FriendSearchScreen.tsx`

```typescript
// Update UI to reflect username search
<View style={[styles.searchContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
  <Ionicons name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
  <TextInput
    style={[styles.searchInput, { color: colors.text }]}
    placeholder="Search by username"
    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
    value={searchQuery}
    onChangeText={setSearchQuery}
    onSubmitEditing={handleSearch}
    autoCapitalize="none"
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity onPress={() => setSearchQuery('')}>
      <Ionicons name="close-circle" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
    </TouchableOpacity>
  )}
</View>

// Update rendering of user results to show username
renderUserItem = ({ item }) => (
  <View style={[styles.resultCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
    <View style={styles.userInfo}>
      <View style={[styles.userInitial, { backgroundColor: colors.primary }]}>
        <Text style={styles.initialText}>{item.name?.charAt(0) || '?'}</Text>
      </View>
      <View>
        <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.userUsername, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
          @{item.username}
        </Text>
        {item.status && <Text style={[styles.userStatus, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{item.status}</Text>}
        {/* Rest of the component */}
      </View>
    </View>
    {/* Action buttons */}
  </View>
)
```

### Phase 4: Profile Updates ✅

Update user profiles to display and allow changing usernames.

#### Update `src/screens/ProfileScreen.tsx`

```typescript
// Add username display to profile
<View style={styles.usernameContainer}>
  <Text style={[styles.usernameLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
    Username
  </Text>
  <View style={styles.usernameRow}>
    <Text style={[styles.username, { color: colors.text }]}>
      @{userData.username || 'username'}
    </Text>
    <TouchableOpacity 
      style={styles.copyButton} 
      onPress={() => {
        Clipboard.setString(userData.username);
        Alert.alert('Copied', 'Username copied to clipboard');
      }}
    >
      <Ionicons 
        name="copy-outline" 
        size={20} 
        color={colors.primary} 
      />
    </TouchableOpacity>
  </View>
</View>

// Add share profile option
<TouchableOpacity
  style={[styles.shareButton, { backgroundColor: colors.primary }]}
  onPress={() => {
    Share.share({
      message: `Add me on Future Fitness! My username is @${userData.username}`,
    });
  }}
>
  <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
  <Text style={styles.shareButtonText}>Share Profile</Text>
</TouchableOpacity>
```

#### Add Username Change Feature

Create a new screen for changing username:

```typescript
// src/screens/ChangeUsernameScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usernameService } from '../services/usernameService';
import { userService } from '../services/userService';
import { useTheme } from '../theme/ThemeProvider';

const ChangeUsernameScreen: React.FC = ({ navigation }) => {
  // Similar implementation to UsernameSelectionScreen
  // but with focus on changing an existing username
  // ...
};
```

### Phase 5: Existing User Migration ✅

Create a script to generate usernames for existing users:

```typescript
// src/scripts/migrateExistingUsers.ts
import { firestore } from '../firebase/firebaseInit';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { usernameService } from '../services/usernameService';

async function migrateExistingUsers() {
  console.log('Starting user migration to add usernames...');
  
  try {
    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`Found ${snapshot.docs.length} users to process`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      
      // Skip users who already have a username
      if (userData.username) {
        console.log(`User ${doc.id} already has username: ${userData.username}`);
        skipped++;
        continue;
      }
      
      // Generate a username based on display name or email
      const displayName = userData.displayName || userData.name || userData.email?.split('@')[0] || 'user';
      try {
        const username = await usernameService.generateUniqueUsername(displayName);
        
        // Update user document
        await updateDoc(doc.ref, { username });
        
        // Add to usernames collection
        await setDoc(doc(firestore, 'usernames', username), {
          uid: doc.id,
          createdAt: new Date()
        });
        
        console.log(`Migrated user ${doc.id}: ${username}`);
        migrated++;
      } catch (err) {
        console.error(`Error migrating user ${doc.id}:`, err);
      }
    }
    
    console.log(`Migration complete: ${migrated} users migrated, ${skipped} skipped`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration when needed
export async function runUsernameMigration() {
  try {
    await migrateExistingUsers();
    return { success: true };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
}
```

### Phase 6: Testing

#### Unit Tests

Test the username service functionality:

```typescript
// tests/usernameService.test.ts
import { usernameService } from '../src/services/usernameService';

describe('Username Service', () => {
  test('formatUsername correctly formats usernames', () => {
    expect(usernameService.formatUsername('John Doe')).toBe('johndoe');
    expect(usernameService.formatUsername('john.doe@example.com')).toBe('john.doe');
    expect(usernameService.formatUsername('John$%^&*')).toBe('john');
    expect(usernameService.formatUsername('a'.repeat(20))).toBe('a'.repeat(15));
  });
  
  test('isValidUsername validates correctly', () => {
    expect(usernameService.isValidUsername('johndoe')).toBe(true);
    expect(usernameService.isValidUsername('john.doe')).toBe(true);
    expect(usernameService.isValidUsername('john_doe')).toBe(true);
    expect(usernameService.isValidUsername('j')).toBe(false); // Too short
    expect(usernameService.isValidUsername('john-doe')).toBe(false); // Invalid character
    expect(usernameService.isValidUsername('john doe')).toBe(false); // Space not allowed
  });
  
  // Other tests...
});
```

#### Integration Tests

Test the complete user flow from registration to username selection and friend search.

#### Bug Fixes

- ✅ Fixed issue with handling Firestore Timestamp objects in the ConnectionRequestsScreen. Added safe timestamp conversion to properly display request times.
- ✅ Fixed issue with accepted friend requests not appearing in the friends list. Modified the `getConnections` method to properly fetch both outgoing and incoming accepted connections.

#### Manual Testing Checklist

- [  ] New user registration flow includes username selection
- [  ] Username validation works correctly (min/max length, allowed characters)
- [  ] Username uniqueness is enforced
- [  ] Existing users can be found by username
- [  ] User profiles display username correctly
- [  ] Users can share their usernames easily
- [  ] Connection requests show correctly with proper timestamps

## Success Criteria

The implementation will be considered successful when:

1. All new users receive a unique username during onboarding
2. All existing users have been migrated to have usernames
3. Users can search for and find other users using usernames
4. Usernames are displayed in profiles and friend lists
5. Users can share their usernames easily

## Implementation Timeline

- Week 1: Create username service and database structures
- Week 2: Implement onboarding flow updates and username selection screen
- Week 3: Update friend search to use usernames and profile displays
- Week 4: Implement migration script and run for existing users

## Conclusion

This username system will significantly improve the friend search experience in Future Fitness by providing users with human-readable, memorable identifiers. The implementation focuses on creating a seamless user experience while maintaining backward compatibility with existing systems.

By implementing usernames, we'll reduce friction in the social connection process and increase engagement with the app's social features. 