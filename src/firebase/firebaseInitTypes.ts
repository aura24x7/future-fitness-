/**
 * Type-safe wrapper for the Firebase initialization module
 */
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Functions } from 'firebase/functions';
import { FirebaseApp } from 'firebase/app';

// Import the actual implementation
import * as FirebaseInit from './firebaseInit';

// Define the types for the exported objects
export const firebaseApp: FirebaseApp = FirebaseInit.firebaseApp;
export const auth: Auth = FirebaseInit.auth;
export const firestore: Firestore = FirebaseInit.firestore;
export const storage: FirebaseStorage = FirebaseInit.storage;
export const functions: Functions = FirebaseInit.functions;
export const firebaseConfig = FirebaseInit.firebaseConfig;
export const isFirebaseInitialized = FirebaseInit.isFirebaseInitialized; 