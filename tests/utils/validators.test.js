/**
 * Validator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateInputs,
  validatePensionAmount,
  validateStartYear,
  validateWithdrawalRate,
  validateComparisonYears,
  isValidYear,
  isValidAmount
} from '../../src/utils/validators.js';

describe('validatePensionAmount', () => {
  it('given_validAmount_when_validating_then_returnsValid', () => {
    const result = validatePensionAmount(500000);
    expect(result.valid).toBe(true);
  });

  it('given_minimumAmount_when_validating_then_returnsValid', () => {
    const result = validatePensionAmount(10000);
    expect(result.valid).toBe(true);
  });

  it('given_maximumAmount_when_validating_then_returnsValid', () => {
    const result = validatePensionAmount(10000000);
    expect(result.valid).toBe(true);
  });

  it('given_amountBelowMinimum_when_validating_then_returnsError', () => {
    const result = validatePensionAmount(9999);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('given_amountAboveMaximum_when_validating_then_returnsError', () => {
    const result = validatePensionAmount(10000001);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot exceed');
  });

  it('given_nonNumber_when_validating_then_returnsError', () => {
    const result = validatePensionAmount('500000');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a number');
  });

  it('given_NaN_when_validating_then_returnsError', () => {
    const result = validatePensionAmount(NaN);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a number');
  });

  it('given_negativeAmount_when_validating_then_returnsError', () => {
    const result = validatePensionAmount(-50000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least');
  });
});

describe('validateStartYear', () => {
  it('given_validYear_when_validating_then_returnsValid', () => {
    const result = validateStartYear(2000);
    expect(result.valid).toBe(true);
  });

  it('given_year2025_when_validating_then_returnsValid', () => {
    const result = validateStartYear(2026);
    expect(result.valid).toBe(true);
  });

  it('given_yearBefore1980_when_validating_then_returnsError', () => {
    const result = validateStartYear(1979);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot be before');
  });

  it('given_yearAfter2026_when_validating_then_returnsError', () => {
    const result = validateStartYear(2027);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot be after');
  });

  it('given_nonInteger_when_validating_then_returnsError', () => {
    const result = validateStartYear(2000.5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('whole number');
  });

  it('given_nonNumber_when_validating_then_returnsError', () => {
    const result = validateStartYear('2000');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('whole number');
  });
});

describe('validateWithdrawalRate', () => {
  it('given_validRate_when_validating_then_returnsValid', () => {
    const result = validateWithdrawalRate(4);
    expect(result.valid).toBe(true);
  });

  it('given_minimumRate_when_validating_then_returnsValid', () => {
    const result = validateWithdrawalRate(1);
    expect(result.valid).toBe(true);
  });

  it('given_maximumRate_when_validating_then_returnsValid', () => {
    const result = validateWithdrawalRate(10);
    expect(result.valid).toBe(true);
  });

  it('given_rateBelowMinimum_when_validating_then_returnsError', () => {
    const result = validateWithdrawalRate(0.5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('given_rateAboveMaximum_when_validating_then_returnsError', () => {
    const result = validateWithdrawalRate(10.5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot exceed');
  });

  it('given_decimalRate_when_validating_then_returnsValid', () => {
    const result = validateWithdrawalRate(3.5);
    expect(result.valid).toBe(true);
  });

  it('given_nonNumber_when_validating_then_returnsError', () => {
    const result = validateWithdrawalRate('4');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a number');
  });
});

describe('validateComparisonYears', () => {
  it('given_validYears_when_validating_then_returnsValid', () => {
    const result = validateComparisonYears(25);
    expect(result.valid).toBe(true);
  });

  it('given_minimumYears_when_validating_then_returnsValid', () => {
    const result = validateComparisonYears(5);
    expect(result.valid).toBe(true);
  });

  it('given_maximumYears_when_validating_then_returnsValid', () => {
    const result = validateComparisonYears(30);
    expect(result.valid).toBe(true);
  });

  it('given_yearsBelowMinimum_when_validating_then_returnsError', () => {
    const result = validateComparisonYears(4);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('given_yearsAboveMaximum_when_validating_then_returnsError', () => {
    const result = validateComparisonYears(31);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot exceed');
  });

  it('given_nonInteger_when_validating_then_returnsError', () => {
    const result = validateComparisonYears(25.5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('whole number');
  });
});

describe('validateInputs', () => {
  it('given_allValidInputs_when_validating_then_returnsValid', () => {
    const inputs = {
      pensionAmount: 500000,
      startYear: 2000,
      withdrawalRate: 4,
      comparisonYears: 25
    };
    const result = validateInputs(inputs);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('given_multipleInvalidInputs_when_validating_then_returnsAllErrors', () => {
    const inputs = {
      pensionAmount: 5000,      // Below minimum
      startYear: 1979,          // Before 1980
      withdrawalRate: 15,       // Above maximum
      comparisonYears: 3        // Below minimum
    };
    const result = validateInputs(inputs);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(4);
  });

  it('given_comparisonExtendsBeyondData_when_validating_then_returnsError', () => {
    const inputs = {
      pensionAmount: 500000,
      startYear: 2020,
      withdrawalRate: 4,
      comparisonYears: 10  // Would end in 2030, beyond 2026
    };
    const result = validateInputs(inputs);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('beyond available data'))).toBe(true);
  });

  it('given_comparisonEndsAtMaxYear_when_validating_then_returnsValid', () => {
    const inputs = {
      pensionAmount: 500000,
      startYear: 2020,
      withdrawalRate: 4,
      comparisonYears: 6  // Ends in 2026, which is allowed
    };
    const result = validateInputs(inputs);
    expect(result.valid).toBe(true);
  });
});

// ============================================================
// Simple boolean validators (used by calculators)
// ============================================================

describe('isValidYear', () => {
  it('given_yearWithinRange_when_validating_then_returnsTrue', () => {
    expect(isValidYear(2000)).toBe(true);
    expect(isValidYear(2010)).toBe(true);
    expect(isValidYear(2026)).toBe(true);
  });

  it('given_yearBelowRange_when_validating_then_returnsFalse', () => {
    expect(isValidYear(1979)).toBe(false);
    expect(isValidYear(1900)).toBe(false);
  });

  it('given_yearAboveRange_when_validating_then_returnsFalse', () => {
    expect(isValidYear(2027)).toBe(false);
    expect(isValidYear(2100)).toBe(false);
  });

  it('given_nonInteger_when_validating_then_returnsFalse', () => {
    expect(isValidYear(2020.5)).toBe(false);
  });

  it('given_nonNumber_when_validating_then_returnsFalse', () => {
    expect(isValidYear('2020')).toBe(false);
    expect(isValidYear(null)).toBe(false);
    expect(isValidYear(undefined)).toBe(false);
    expect(isValidYear(NaN)).toBe(false);
  });
});

describe('isValidAmount', () => {
  it('given_positiveNumber_when_validating_then_returnsTrue', () => {
    expect(isValidAmount(100000)).toBe(true);
    expect(isValidAmount(0.01)).toBe(true);
    expect(isValidAmount(1000000)).toBe(true);
  });

  it('given_zero_when_validating_then_returnsTrue', () => {
    expect(isValidAmount(0)).toBe(true);
  });

  it('given_negativeNumber_when_validating_then_returnsFalse', () => {
    expect(isValidAmount(-1)).toBe(false);
    expect(isValidAmount(-1000)).toBe(false);
  });

  it('given_nonNumber_when_validating_then_returnsFalse', () => {
    expect(isValidAmount('50000')).toBe(false);
    expect(isValidAmount(null)).toBe(false);
    expect(isValidAmount(undefined)).toBe(false);
    expect(isValidAmount(NaN)).toBe(false);
  });
});
