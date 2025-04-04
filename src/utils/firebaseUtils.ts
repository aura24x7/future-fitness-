import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const toFirestoreTimestamp = (date: Date) => {
  return firestore.Timestamp.fromDate(date);
};

export const fromFirestoreTimestamp = (timestamp: any) => {
  if (!timestamp) return null;
  return timestamp.toDate();
};

export const serverTimestamp = () => {
  return firestore.FieldValue.serverTimestamp();
};

export const getCurrentUser = () => {
  return auth().currentUser;
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};

export const getFirestore = () => {
  return firestore();
};

export const createRef = (collection: string, ...pathSegments: string[]) => {
  return firestore().collection(collection).doc(pathSegments.join('/'));
};

export const createQuery = (collection: string) => {
  return firestore().collection(collection);
};

export const batch = () => {
  return firestore().batch();
};

export const sanitizeData = (data: any): any => {
  // Remove undefined values
  const sanitized = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  // Convert Date objects to Firestore Timestamps
  return Object.entries(sanitized).reduce((acc, [key, value]) => {
    if (value instanceof Date) {
      acc[key] = toFirestoreTimestamp(value);
    } else if (value && typeof value === 'object') {
      acc[key] = sanitizeData(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
};
