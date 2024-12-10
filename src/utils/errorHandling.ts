export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public screen?: string,
    public action?: string,
    public technicalDetails?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  // Validation Errors (1000-1999)
  INVALID_INPUT: '1000',
  REQUIRED_FIELD_MISSING: '1001',
  INVALID_DATE: '1002',
  INVALID_EMAIL: '1003',
  INVALID_PASSWORD: '1004',
  INVALID_PHONE: '1005',
  INVALID_MEASUREMENT: '1006',

  // Navigation Errors (2000-2999)
  NAVIGATION_FAILED: '2000',
  SCREEN_NOT_FOUND: '2001',
  INVALID_ROUTE: '2002',

  // Data Errors (3000-3999)
  DATA_NOT_FOUND: '3000',
  SAVE_FAILED: '3001',
  LOAD_FAILED: '3002',
  UPDATE_FAILED: '3003',

  // Network Errors (4000-4999)
  NETWORK_ERROR: '4000',
  API_ERROR: '4001',
  TIMEOUT: '4002',

  // Authentication Errors (5000-5999)
  AUTH_FAILED: '5000',
  SESSION_EXPIRED: '5001',
  INVALID_TOKEN: '5002',

  // Permission Errors (6000-6999)
  PERMISSION_DENIED: '6000',
  UNAUTHORIZED: '6001',

  // Device Errors (7000-7999)
  DEVICE_ERROR: '7000',
  STORAGE_ERROR: '7001',
  CAMERA_ERROR: '7002',

  // Unknown Errors (9000-9999)
  UNKNOWN_ERROR: '9000',
  UNEXPECTED_ERROR: '9001'
} as const;

export const getErrorMessage = (error: AppError): string => {
  const baseMessage = error.message;
  const details = [];

  if (error.screen) {
    details.push(`Screen: ${error.screen}`);
  }
  if (error.action) {
    details.push(`Action: ${error.action}`);
  }
  if (error.code) {
    details.push(`Error Code: ${error.code}`);
  }

  return details.length > 0
    ? `${baseMessage}\n${details.join('\n')}`
    : baseMessage;
};

export const logError = (error: AppError | Error): void => {
  if (error instanceof AppError) {
    console.error('=== App Error ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Screen:', error.screen);
    console.error('Action:', error.action);
    if (error.technicalDetails) {
      console.error('Technical Details:', error.technicalDetails);
    }
  } else {
    console.error('=== Unexpected Error ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
};

export const handleError = (error: AppError | Error): void => {
  logError(error);
  // Here you can add additional error handling logic like:
  // - Sending error reports to a monitoring service
  // - Showing user-friendly error messages
  // - Performing recovery actions
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateMeasurement = (value: number, unit: string): boolean => {
  switch (unit.toLowerCase()) {
    case 'cm':
      return value >= 30 && value <= 300;
    case 'ft':
      return value >= 1 && value <= 10;
    case 'kg':
      return value >= 20 && value <= 500;
    case 'lbs':
      return value >= 44 && value <= 1100;
    default:
      return false;
  }
};

export const handleDateFormatError = (error: Error, fallbackValue: string = ''): string => {
  console.error('Date formatting error:', error);
  return fallbackValue;
};
