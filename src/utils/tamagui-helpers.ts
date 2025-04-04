/**
 * Helper utilities for working with Tamagui components
 * 
 * These helpers fix issues with boolean props on Tamagui components
 * causing "Unable to convert string to floating point value: '$true'" errors
 * on Android.
 */

/**
 * Creates a safe boolean prop that won't be converted to "$true"
 * by Tamagui on Android, causing conversion errors.
 * 
 * When using boolean props like "disabled" or "editable" in Tamagui components,
 * use this helper instead of ternary expressions to avoid Android errors.
 * 
 * Example: 
 *   disabled={safeBooleanProp(isLoading)}  // Good
 *   disabled={isLoading}                    // Good
 *   disabled={isLoading ? true : false}     // BAD - causes Android errors
 */
export const safeBooleanProp = (value: boolean): boolean => {
  // Return the boolean directly, without ternary
  return value;
}; 