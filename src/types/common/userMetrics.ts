import { Measurement } from './measurement';

/**
 * Represents the physical metrics of a user
 */
export interface UserMetrics {
  height: Measurement;
  weight: Measurement;
  targetWeight?: Measurement;
} 