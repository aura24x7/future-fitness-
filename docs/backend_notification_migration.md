# Future Fitness Backend Notification Migration Plan

## Overview
This document outlines the step-by-step plan to migrate Future Fitness's notification system from local notifications to a scalable, future-proof backend notification system with Firebase Cloud Messaging (FCM) integration.

## Current System Analysis

### Existing Implementation
- Development build already running with Expo SDK 52.0.19
- Using `expo-notifications` for local notifications
- Firebase Authentication and Firestore already integrated
- Notification service implemented as singleton in `src/services/notificationService.ts`
- `GymBuddyAlertService` using Firestore for alerts
- Custom notification channels for Android

### Current Features to Preserve
- Local notification scheduling
- Custom notification channels
- Interactive notifications (accept/decline for gym invites)
- Background notification handling
- Custom vibration patterns
- Platform-specific implementations (iOS/Android)

## Backend Architecture

### Directory Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── notifications/
│   │       ├── pushNotificationController.ts
│   │       └── schedulerController.ts
│   ├── services/
│   │   └── notifications/
│   │       ├── notificationService.ts
│   │       ├── tokenService.ts
│   │       └── schedulerService.ts
│   ├── models/
│   │   └── notifications/
│   │       ├── notification.model.ts
│   │       └── deviceToken.model.ts
│   ├── config/
│   │   ├── firebase.ts
│   │   └── environment.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── rateLimiter.ts
│   └── utils/
│       ├── logger.ts
│       └── errorHandler.ts
├── tests/
│   └── notifications/
├── scripts/
├── package.json
└── README.md
```

### Key Components

#### 1. Notification Service Layer
```typescript
// backend/src/services/notifications/notificationService.ts
export class NotificationService {
  constructor(
    private tokenService: TokenService,
    private logger: Logger
  ) {}

  async sendNotification(params: NotificationParams): Promise<NotificationResult> {
    try {
      const tokens = await this.tokenService.getValidTokensForUser(params.userId);
      const message = this.createNotificationMessage(params);
      
      const results = await Promise.allSettled(
        tokens.map(token => this.sendToDevice(token, message))
      );

      await this.handleNotificationResults(results, params);
      return this.aggregateResults(results);
    } catch (error) {
      this.logger.error('Failed to send notification', { error, params });
      throw new NotificationError(error.message);
    }
  }

  private async handleNotificationResults(results: PromiseSettledResult[], params: NotificationParams) {
    // Handle invalid tokens, retry logic, and analytics
  }
}
```

#### 2. Token Management
```typescript
// backend/src/services/notifications/tokenService.ts
export class TokenService {
  async getValidTokensForUser(userId: string): Promise<string[]> {
    const userDevices = await this.getUserDevices(userId);
    return this.filterValidTokens(userDevices);
  }

  async updateToken(userId: string, oldToken: string, newToken: string): Promise<void> {
    await this.validateToken(newToken);
    await this.storeToken(userId, newToken);
    if (oldToken) {
      await this.removeToken(oldToken);
    }
  }
}
```

## Migration Phases

### Phase 1: Backend Setup (1 week)
1. Initialize backend project structure
2. Set up development environment
3. Configure Firebase Admin SDK
4. Implement base services and utilities
5. Set up logging and monitoring

### Phase 2: Core Services Implementation (1 week)
1. Implement TokenService
2. Implement NotificationService
3. Set up error handling and retry mechanisms
4. Implement rate limiting and quotas
5. Add analytics and monitoring

### Phase 3: Mobile Client Integration (1 week)
1. Update mobile notification service
2. Implement token refresh mechanism
3. Add error handling and offline support
4. Update background handlers
5. Implement notification actions

### Phase 4: Testing and Validation (1 week)
1. Unit tests for all services
2. Integration tests
3. Load testing
4. Failure scenario testing
5. Cross-platform testing

### Phase 5: Production Deployment (1 week)
1. Set up CI/CD pipeline
2. Configure production environment
3. Set up monitoring and alerts
4. Gradual rollout
5. Documentation updates

## Technical Requirements

### Backend Requirements
- Node.js 18+ with TypeScript
- Express.js for API endpoints
- Jest for testing
- Winston for logging
- Firebase Admin SDK
- Redis for rate limiting (optional)

### Client Requirements
✓ Expo SDK 52.0.19 (Already implemented)
✓ Development build running (Already implemented)
- Updated notification permissions (In progress)
- Firebase SDK integration (In progress)

### Security Implementation
```typescript
// backend/src/middleware/auth.ts
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new AuthError('No token provided');

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    next(new AuthError('Invalid token'));
  }
};

// backend/src/middleware/rateLimiter.ts
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
```

## Monitoring and Analytics

### Logging Strategy
```typescript
// backend/src/utils/logger.ts
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Metrics Collection
- Request/Response times
- Token refresh rates
- Notification delivery success rates
- Error rates and types
- Device platform distribution

## Success Criteria
1. 99.9% notification delivery rate
2. <1s notification delivery time
3. Zero token registration failures
4. Successful background notification handling
5. All existing features maintained
6. No disruption to existing alert system
7. Proper error handling and logging
8. Scalable architecture

## Documentation Requirements
1. API documentation
2. System architecture documentation
3. Deployment guides
4. Monitoring dashboard setup
5. Troubleshooting guides
6. Client integration guides

## Rollback Strategy
1. Maintain dual notification capability during migration
2. Keep local notification fallback
3. Feature flags for gradual rollout
4. Automated rollback scripts
5. Monitoring alerts for quick response

## Backend Components

### Firebase Cloud Functions (Serverless Backend)
```typescript
// functions/src/notifications/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const sendNotification = functions.https.onCall(async (data, context) => {
  // Authenticate request
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { userId, title, body, data: notificationData } = data;
  
  // Get user's device tokens
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const deviceTokens = userDoc.data()?.deviceTokens || [];

  // Send to all user devices
  const notifications = deviceTokens.map(({ token }) => 
    admin.messaging().send({
      token,
      notification: { title, body },
      data: notificationData,
    })
  );

  return Promise.all(notifications);
});

// Schedule notifications
export const scheduleWorkoutReminders = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    // Query users with scheduled workouts
    const usersWithWorkouts = await admin.firestore()
      .collection('workouts')
      .where('scheduledFor', '>=', new Date())
      .get();

    // Send notifications
    const notifications = [];
    for (const doc of usersWithWorkouts.docs) {
      const workout = doc.data();
      notifications.push(sendWorkoutReminder(workout));
    }

    return Promise.all(notifications);
  });
```

### Notification Types and Handlers
```typescript
// functions/src/notifications/types.ts
export const notificationHandlers = {
  GYM_INVITE: async (data: GymInviteData) => {
    return {
      title: 'New Gym Buddy Request',
      body: `${data.senderName} wants to work out with you!`,
      data: {
        type: 'GYM_INVITE',
        alertId: data.alertId,
        senderId: data.senderId
      }
    };
  },
  
  WORKOUT_REMINDER: async (data: WorkoutData) => {
    return {
      title: 'Workout Reminder',
      body: `Don't forget your ${data.workoutType} session today!`,
      data: {
        type: 'WORKOUT_REMINDER',
        workoutId: data.workoutId
      }
    };
  }
};
```

### Analytics and Monitoring Backend
```typescript
// functions/src/analytics/notification-metrics.ts
export const trackNotificationMetrics = functions.firestore
  .document('notifications/{notificationId}')
  .onWrite(async (change, context) => {
    const notification = change.after.data();
    
    await admin.analytics().logEvent('notification_status_change', {
      status: notification.status,
      type: notification.type,
      deliveryTime: notification.deliveredAt - notification.createdAt,
      userId: notification.userId
    });
  });
```

### Notification Queue Management
```typescript
// functions/src/notifications/queue.ts
export const processNotificationQueue = functions.firestore
  .document('notificationQueue/{queueId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    try {
      // Send notification
      await admin.messaging().send({
        token: notification.token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      });

      // Update status
      await snap.ref.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      // Handle errors and retry logic
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        retryCount: admin.firestore.FieldValue.increment(1)
      });
    }
  });
``` 