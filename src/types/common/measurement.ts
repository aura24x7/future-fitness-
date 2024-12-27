/**
 * Represents a measurement value with its unit
 */
export interface Measurement {
  value: number;
  unit: 'cm' | 'ft' | 'kg' | 'lbs';
}

/**
 * Type guard to check if a value is a valid Measurement
 */
export function isMeasurement(value: any): value is Measurement {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.value === 'number' &&
    typeof value.unit === 'string' &&
    ['cm', 'ft', 'kg', 'lbs'].includes(value.unit)
  );
} 