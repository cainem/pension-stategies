/**
 * Input Validation Utilities
 */

import { LIMITS, YEAR_RANGE } from '../config/defaults.js';

/**
 * Validate all form inputs
 * @param {Object} inputs - Form input values
 * @param {number} inputs.pensionAmount - Starting pension amount
 * @param {number} inputs.startYear - Starting year
 * @param {number} inputs.withdrawalRate - Annual withdrawal rate percentage
 * @param {number} inputs.comparisonYears - Number of years to compare
 * @returns {Object} Validation result with valid flag and errors array
 */
export function validateInputs(inputs) {
  const errors = [];

  // Validate pension amount
  const pensionValidation = validatePensionAmount(inputs.pensionAmount);
  if (!pensionValidation.valid) {
    errors.push(pensionValidation.error);
  }

  // Validate start year
  const yearValidation = validateStartYear(inputs.startYear);
  if (!yearValidation.valid) {
    errors.push(yearValidation.error);
  }

  // Validate withdrawal rate
  const rateValidation = validateWithdrawalRate(inputs.withdrawalRate);
  if (!rateValidation.valid) {
    errors.push(rateValidation.error);
  }

  // Validate comparison years
  const yearsValidation = validateComparisonYears(inputs.comparisonYears);
  if (!yearsValidation.valid) {
    errors.push(yearsValidation.error);
  }

  // Validate that comparison doesn't extend beyond available data
  if (yearValidation.valid && yearsValidation.valid) {
    const endYear = inputs.startYear + inputs.comparisonYears;
    // Allow 1 year beyond max for final calculation
    if (endYear > YEAR_RANGE.max + 1) {
      errors.push(`Comparison period extends beyond available data (max end year: ${YEAR_RANGE.max + 1})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate pension amount
 * @param {number} amount - Pension amount to validate
 * @returns {Object} Validation result
 */
export function validatePensionAmount(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'Pension amount must be a number' };
  }
  if (amount < LIMITS.pensionAmount.min) {
    return { valid: false, error: `Pension amount must be at least £${LIMITS.pensionAmount.min.toLocaleString()}` };
  }
  if (amount > LIMITS.pensionAmount.max) {
    return { valid: false, error: `Pension amount cannot exceed £${LIMITS.pensionAmount.max.toLocaleString()}` };
  }
  return { valid: true };
}

/**
 * Validate start year
 * @param {number} year - Start year to validate
 * @returns {Object} Validation result
 */
export function validateStartYear(year) {
  if (typeof year !== 'number' || isNaN(year) || !Number.isInteger(year)) {
    return { valid: false, error: 'Start year must be a whole number' };
  }
  if (year < YEAR_RANGE.min) {
    return { valid: false, error: `Start year cannot be before ${YEAR_RANGE.min}` };
  }
  if (year > YEAR_RANGE.max) {
    return { valid: false, error: `Start year cannot be after ${YEAR_RANGE.max}` };
  }
  return { valid: true };
}

/**
 * Validate withdrawal rate
 * @param {number} rate - Withdrawal rate percentage to validate
 * @returns {Object} Validation result
 */
export function validateWithdrawalRate(rate) {
  if (typeof rate !== 'number' || isNaN(rate)) {
    return { valid: false, error: 'Withdrawal rate must be a number' };
  }
  if (rate < LIMITS.withdrawalRate.min) {
    return { valid: false, error: `Withdrawal rate must be at least ${LIMITS.withdrawalRate.min}%` };
  }
  if (rate > LIMITS.withdrawalRate.max) {
    return { valid: false, error: `Withdrawal rate cannot exceed ${LIMITS.withdrawalRate.max}%` };
  }
  return { valid: true };
}

/**
 * Validate comparison years
 * @param {number} years - Number of comparison years to validate
 * @returns {Object} Validation result
 */
export function validateComparisonYears(years) {
  if (typeof years !== 'number' || isNaN(years) || !Number.isInteger(years)) {
    return { valid: false, error: 'Comparison period must be a whole number' };
  }
  if (years < LIMITS.comparisonYears.min) {
    return { valid: false, error: `Comparison period must be at least ${LIMITS.comparisonYears.min} years` };
  }
  if (years > LIMITS.comparisonYears.max) {
    return { valid: false, error: `Comparison period cannot exceed ${LIMITS.comparisonYears.max} years` };
  }
  return { valid: true };
}

// ============================================================
// Simple boolean validators for use in calculators
// ============================================================

/**
 * Check if a year is valid (within supported range)
 * @param {number} year - Year to validate
 * @returns {boolean} True if year is valid
 */
export function isValidYear(year) {
  return typeof year === 'number' &&
         !isNaN(year) &&
         Number.isInteger(year) &&
         year >= YEAR_RANGE.min &&
         year <= YEAR_RANGE.max;
}

/**
 * Check if an amount is valid (non-negative number)
 * @param {number} amount - Amount to validate
 * @returns {boolean} True if amount is valid
 */
export function isValidAmount(amount) {
  return typeof amount === 'number' &&
         !isNaN(amount) &&
         amount >= 0;
}
