import { format as formatFn, parseISO, startOfDay, isSameDay as isSameDayFn } from 'date-fns';

// Constants
export const MEALS_STORAGE_KEY = '@meals';

/**
 * Get the day of the week as a string
 * @param date The date to get the day of week for
 * @returns The day of week as a string (e.g., 'Sunday', 'Monday', etc.)
 */
export const getDayOfWeek = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
};

/**
 * Normalizes a date by setting it to the start of day
 * @param date The date to normalize
 * @returns A new Date object set to the start of the given day
 */
export const normalizeDate = (date: Date): Date => {
    return startOfDay(new Date(date));
};

/**
 * Generates a storage key for a specific date
 * @param date The date to generate the key for
 * @returns A string key in the format '@meals_YYYY-MM-DD'
 */
export const getStorageKeyForDate = (date: Date): string => {
    const normalizedDate = normalizeDate(date);
    return `${MEALS_STORAGE_KEY}_${formatDate(normalizedDate, 'yyyy-MM-dd')}`;
};

/**
 * Checks if two dates are the same day
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns boolean indicating if dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return isSameDayFn(normalizeDate(date1), normalizeDate(date2));
};

/**
 * Gets the start of day for a given date
 * @param date The date to get start of day for
 * @returns Date object set to start of the given day
 */
export const getStartOfDay = (date: Date): Date => {
    return normalizeDate(date);
};

/**
 * Formats a date for display
 * @param date The date to format
 * @param formatString Optional format string (defaults to 'MMMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, formatString: string = 'MMMM d, yyyy'): string => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatFn(dateObj, formatString);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Gets the formatted today date
 * @returns Formatted today date string
 */
export const getFormattedToday = (): string => {
    return formatDate(new Date());
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
