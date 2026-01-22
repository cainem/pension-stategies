/**
 * UK CPI Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ukCpiIndex,
  getInflationMultiplier,
  adjustForInflation
} from '../../src/data/ukCpi.js';

describe('ukCpi data', () => {
  it('given_cpiData_when_checkingStructure_then_containsExpectedYears', () => {
    expect(ukCpiIndex[1980]).toBe(100.00);
    expect(ukCpiIndex[2024]).toBeGreaterThan(500); // Cumulative inflation since 1980
  });

  it('given_multiplier_when_yearsAreSame_then_returnsOne', () => {
    expect(getInflationMultiplier(2000, 2000)).toBe(1);
  });

  it('given_multiplier_when_forwardInTime_then_returnsGreaterThanOne', () => {
    expect(getInflationMultiplier(2000, 2010)).toBeGreaterThan(1);
  });

  it('given_adjustForInflation_when_called_then_calculatesCorrectAmount', () => {
    const amount = 1000;
    const startYear = 1980;
    const targetYear = 1981;
    // 1980 inflation was 18.0%
    const expected = 1180;
    expect(adjustForInflation(amount, startYear, targetYear)).toBeCloseTo(expected, 0);
  });

  it('given_invalidYear_when_called_then_throwsError', () => {
    expect(() => getInflationMultiplier(1979, 2020)).toThrow();
    expect(() => getInflationMultiplier(2020, 2027)).toThrow();
  });
});
