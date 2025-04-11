const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { AccessToken } = require('livekit-server-sdk');
// Load environment variables
require('dotenv').config();

admin.initializeApp();

/**
 * Cloud function to send push notifications to users
 * This is called by the friendNotificationService when sending a notification
 */
exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { recipientId, senderName, message, type } = data;
  
  // Get user's device tokens
  const userRef = admin.firestore().collection('users').doc(recipientId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  
  if (!userData || !userData.fcmTokens || userData.fcmTokens.length === 0) {
    return { success: false, error: 'No device tokens found' };
  }
  
  // Prepare notification content
  const notificationTitle = type === 'workout' ? 'Workout Reminder' : type === 'meal' ? 'Meal Reminder' : 'Notification';
  const notificationBody = `${senderName || 'A friend'}: ${message}`;
  
  // Send to each device
  const notifications = userData.fcmTokens.map(token => {
    return admin.messaging().send({
      token,
      notification: {
        title: notificationTitle,
        body: notificationBody
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

/**
 * Cloud function to update FCM tokens when a device registers
 */
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

/**
 * Automatically create notifications in Firestore when a new connection is created
 */
exports.onConnectionCreated = functions.firestore
  .document('connections/{connectionId}')
  .onCreate(async (snapshot, context) => {
    const connectionData = snapshot.data();
    const { userId, connectedUserId, status } = connectionData;
    
    // Only notify if the connection is active
    if (status !== 'active' && status !== 'accepted') {
      return null;
    }
    
    try {
      // Get user info
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data() || {};
      const userName = userData.displayName || userData.name || 'A new user';
      
      // Create a notification for the connected user
      const notificationRef = admin.firestore().collection('notifications').doc();
      await notificationRef.set({
        id: notificationRef.id,
        senderId: userId,
        senderName: userName,
        recipientId: connectedUserId,
        type: 'other',
        message: `${userName} has connected with you!`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error creating connection notification:', error);
      return { success: false };
    }
  });

/**
 * Cloud function to generate LiveKit tokens for voice agent
 */
exports.createLiveKitToken = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId } = data;
  
  // Create LiveKit token
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: userId,
    }
  );
  
  // Define room for onboarding
  at.addGrant({ 
    roomJoin: true, 
    room: 'onboarding-room',
    canPublish: true,
    canSubscribe: true
  });

  // Generate token
  const token = at.toJwt();
  return { token };
}); 