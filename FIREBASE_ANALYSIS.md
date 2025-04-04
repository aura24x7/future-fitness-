# Future Fitness Firebase Migration Guide

## Application Context
- **Project**: Future Fitness Mobile App
- **Package Manager**: Yarn
- **Current React Native Version**: 0.72.6
- **Current Firebase Version**: @react-native-firebase/app@21.10.1
- **Environment**: React Native CLI (not Expo)

## Step 0: Pre-Migration Checklist
- [ ] Backup your project
- [ ] Create a new git branch: `git checkout -b firebase-migration`
- [ ] Document current Firebase version and dependencies

## Step 1: Clean Project Environment
```bash
# 1. Stop any running instances
yarn stop

# 2. Clear watchman watches
watchman watch-del-all

# 3. Clean yarn cache
yarn cache clean

# 4. Remove existing dependencies
rm -rf node_modules
rm yarn.lock

# 5. Reset Metro bundler cache
yarn start --reset-cache
```

## Step 2: Update Dependencies

### 2.1 Core Dependencies
```bash
# Install core Firebase packages
yarn add @react-native-firebase/app@21.10.1
yarn add @react-native-firebase/firestore@21.10.1
yarn add @react-native-firebase/auth@21.10.1
```

### 2.2 Update package.json
```json
{
  "dependencies": {
    "@react-native-firebase/app": "21.10.1",
    "@react-native-firebase/auth": "21.10.1",
    "@react-native-firebase/firestore": "21.10.1"
  }
}
```

## Step 3: Firebase Configuration Updates

### 3.1 Update Firebase Initialization
```typescript
// src/services/firebase/firebaseInit.ts

import { initializeApp } from '@react-native-firebase/app';
import { initializeFirestore } from '@react-native-firebase/firestore';

export const initializeFirebase = async () => {
  if (isInitialized) return;

  try {
    console.log('[FirebaseInit] Initializing Firebase...');
    
    // Initialize Firebase app
    const app = initializeApp();
    
    // Initialize Firestore with settings
    initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false
    });
    
    isInitialized = true;
    console.log('[FirebaseInit] Firebase initialized successfully');
    return app;
  } catch (error) {
    console.error('[FirebaseInit] Initialization failed:', error);
    throw error;
  }
};
```

### 3.2 Update Core Service
```typescript
// src/services/firebase/firebaseCore.ts

import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { initializeFirebase } from './firebaseInit';

export class FirebaseCore {
  private static instance: FirebaseCore;
  private _auth: FirebaseAuthTypes.Module | null = null;
  private _firestore: FirebaseFirestoreTypes.Module | null = null;
  
  async initialize(): Promise<void> {
    try {
      const app = await initializeFirebase();
      this._auth = auth();
      this._firestore = firestore();
    } catch (error) {
      console.error('[FirebaseCore] Initialization error:', error);
      throw error;
    }
  }
}
```

## Step 4: Update Context Providers

### 4.1 Auth Context
```typescript
// src/contexts/AuthContext.tsx

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseCore } from '../services/firebase/firebaseCore';

export const AuthProvider: React.FC = ({ children }) => {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      // Handle auth state
    });
    return unsubscribe;
  }, []);
};
```

### 4.2 Profile Context
```typescript
// src/contexts/ProfileContext.tsx

import firestore from '@react-native-firebase/firestore';
import { firebaseCore } from '../services/firebase/firebaseCore';

export const ProfileProvider: React.FC = ({ children }) => {
  const loadProfile = async (uid: string) => {
    const userDoc = await firestore()
      .collection('users')
      .doc(uid)
      .get();
    return userDoc.exists ? userDoc.data() : null;
  };
};
```

## Step 5: Validation & Testing

### 5.1 Build and Test
```bash
# 1. Clean and rebuild
yarn clean
yarn build

# 2. Start metro bundler with clean cache
yarn start --reset-cache

# 3. Run on Android
yarn android

# 4. Run on iOS
cd ios
pod install
cd ..
yarn ios
```

### 5.2 Validation Checklist
- [ ] Application launches without Firebase errors
- [ ] User authentication works (login/signup)
- [ ] User profile loads correctly
- [ ] Onboarding process completes
- [ ] Real-time updates work
- [ ] Offline data persists

## Step 6: Error Handling & Recovery

### 6.1 Common Issues
1. **Metro Bundler Issues**
```bash
# Solution 1: Reset Metro
yarn start --reset-cache

# Solution 2: Clear watchman
watchman watch-del-all
```

2. **iOS Build Issues**
```bash
# Solution: Reinstall pods
cd ios
pod deintegrate
pod install
cd ..
```

3. **Android Build Issues**
```bash
# Solution: Clean Android build
cd android
./gradlew clean
cd ..
```

### 6.2 Rollback Procedure
```bash
# 1. Revert to previous branch
git checkout main

# 2. Clean project
yarn clean

# 3. Reinstall dependencies
yarn install

# 4. Reset cache
yarn start --reset-cache
```

## Step 7: Performance Monitoring

### 7.1 Add Performance Logging
```typescript
// src/services/firebase/firebaseCore.ts

import perf from '@react-native-firebase/perf';

const trace = await perf().startTrace('firebase_operation');
try {
  // Operation
  trace.putMetric('success', 1);
} catch (error) {
  trace.putMetric('error', 1);
} finally {
  await trace.stop();
}
```

## References & Support
1. [React Native Firebase v21.10.1 Documentation](https://rnfirebase.io/)
2. [Firebase Android Setup](https://rnfirebase.io/android/setup)
3. [Firebase iOS Setup](https://rnfirebase.io/ios/setup)
4. [Firestore Usage Guide](https://rnfirebase.io/firestore/usage)

## Need Help?
- Create an issue in the project repository
- Check the [React Native Firebase GitHub Issues](https://github.com/invertase/react-native-firebase/issues)
- Contact the development team on Slack 