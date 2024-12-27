export class UnitConversion {
  /**
   * Convert feet to centimeters
   */
  static ftToCm(feet: number): number {
    return feet * 30.48;
  }

  /**
   * Convert centimeters to feet
   */
  static cmToFt(cm: number): number {
    return cm / 30.48;
  }

  /**
   * Convert pounds to kilograms
   */
  static lbsToKg(lbs: number): number {
    return lbs * 0.453592;
  }

  /**
   * Convert kilograms to pounds
   */
  static kgToLbs(kg: number): number {
    return kg * 2.20462;
  }

  /**
   * Format a number to 2 decimal places
   */
  static formatNumber(num: number): number {
    return Math.round(num * 100) / 100;
  }

  /**
   * Convert height between units
   */
  static convertHeight(value: number, fromUnit: 'cm' | 'ft', toUnit: 'cm' | 'ft'): number {
    if (fromUnit === toUnit) return value;
    return fromUnit === 'cm' ? this.cmToFt(value) : this.ftToCm(value);
  }

  /**
   * Convert weight between units
   */
  static convertWeight(value: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number {
    if (fromUnit === toUnit) return value;
    return fromUnit === 'kg' ? this.kgToLbs(value) : this.lbsToKg(value);
  }
} 