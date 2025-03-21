import firestore from '@react-native-firebase/firestore';

const MIN_AGE = 13;
const MAX_AGE = 120;

export const isValidDateFormat = (dateString: string): boolean => {
  // Check if the string matches YYYY-MM-DD format
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateFormatRegex.test(dateString);
};

export const isValidAge = (dateString: string): boolean => {
  const birthDate = new Date(dateString);
  const today = new Date();
  
  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= MIN_AGE && age <= MAX_AGE;
};

export const convertToTimestamp = (dateString: string): firestore.Timestamp => {
  if (!isValidDateFormat(dateString)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  
  return firestore.Timestamp.fromDate(date);
};

export const formatDateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const validateBirthday = (dateString: string): { isValid: boolean; error?: string } => {
  if (!dateString) {
    return { isValid: false, error: 'Birthday is required' };
  }
  
  if (!isValidDateFormat(dateString)) {
    return { isValid: false, error: 'Invalid date format. Expected YYYY-MM-DD' };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date' };
  }
  
  if (date > new Date()) {
    return { isValid: false, error: 'Birthday cannot be in the future' };
  }
  
  if (!isValidAge(dateString)) {
    return { isValid: false, error: `Age must be between ${MIN_AGE} and ${MAX_AGE} years` };
  }
  
  return { isValid: true };
}; 