import { format as formatFn, startOfDay, isSameDay as isSameDayFn } from 'date-fns';

// Constants
export const MEALS_STORAGE_KEY = '@meals';

/**
 * Generates a storage key for a specific date
 * @param date The date to generate the key for
 * @returns A string key in the format '@meals_YYYY-MM-DD'
 */
export const getStorageKeyForDate = (date: Date): string => {
    return `${MEALS_STORAGE_KEY}_${formatDate(date)}`;
};

/**
 * Checks if two dates are the same day
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns boolean indicating if dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return isSameDayFn(date1, date2);
};

/**
 * Gets the start of day for a given date
 * @param date The date to get start of day for
 * @returns Date object set to start of the given day
 */
export const getStartOfDay = (date: Date): Date => {
    return startOfDay(date);
};

/**
 * Formats a date for display
 * @param date The date to format
 * @param formatString Optional format string (defaults to 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export const formatDate = (date: Date, formatString: string = 'yyyy-MM-dd'): string => {
    return formatFn(date, formatString);
};

// Export renamed format function for components that need it
export const format = formatFn;
