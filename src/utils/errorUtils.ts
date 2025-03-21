import { FirebaseError } from '@react-native-firebase/app';

export interface AppError extends Error {
  code?: string;
  originalError?: any;
}

/**
 * Creates a standardized error object
 */
export function createError(message: string, originalError?: any): AppError {
  const error: AppError = new Error(message);
  error.originalError = originalError;
  
  if (originalError instanceof FirebaseError) {
    error.code = originalError.code;
  }
  
  return error;
}

/**
 * Safely extracts error message from various error types
 */
export function getErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'User not found';
      case 'auth/wrong-password':
        return 'Invalid password';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/email-already-in-use':
        return 'Email is already registered';
      default:
        return error.message || 'Authentication error occurred';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  // Check common network error patterns
  if (error.message?.includes('network')) return true;
  if (error.message?.includes('offline')) return true;
  if (error.code === 'unavailable') return true;
  
  return false;
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: any): boolean {
  if (!error) return false;
  
  // Check for validation error patterns
  if (error.message?.includes('required')) return true;
  if (error.message?.includes('invalid')) return true;
  if (error.message?.includes('format')) return true;
  
  return false;
}

/**
 * Logs error with consistent format
 */
export function logError(error: any, context?: string): void {
  const errorMessage = getErrorMessage(error);
  const errorCode = error instanceof FirebaseError ? error.code : undefined;
  
  console.error(
    `[Error]${context ? ` [${context}]` : ''}:`,
    errorMessage,
    errorCode ? `(${errorCode})` : '',
    error.originalError || error
  );
}

export const handleFirebaseError = (error: FirebaseError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please try logging in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Please choose a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Invalid password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export const isFirebaseError = (error: any): error is FirebaseError => {
  return error && typeof error === 'object' && 'code' in error;
};