/**
 * US Long Treasury Total Return Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  usLongTreasuryTotalReturn,
  getUSLongTreasuryTotalReturn,
  getAvailableYears
} from '../../src/data/usLongTreasuryTotalReturn.js';

describe('usLongTreasuryTotalReturn data', () => {
  it('given_treasuryData_when_checkingStructure_then_hasAllYears1980To2026', () => {
    const years = Object.keys(usLongTreasuryTotalReturn).map(Number);
    for (let year = 1980; year <= 2026; year++) {
      expect(years).toContain(year);
    }
  });

  it('given_treasuryData_when_checkingValues_then_allValuesArePositiveNumbers', () => {
    Object.values(usLongTreasuryTotalReturn).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });

  it('given_year1980_when_gettingValue_then_returnsBaseValue', () => {
    // Base year normalized to 100
    const value = usLongTreasuryTotalReturn[1980];
    expect(value).toBe(100.00);
  });

  it('given_year1982_when_gettingValue_then_showsVolckerImpact', () => {
    // Volcker rate hikes hurt bonds in early 1980s
    expect(usLongTreasuryTotalReturn[1982]).toBeLessThan(usLongTreasuryTotalReturn[1980]);
  });

  it('given_year1983_when_gettingValue_then_showsRecovery', () => {
    // Huge rally as rates began falling
    expect(usLongTreasuryTotalReturn[1983]).toBeGreaterThan(usLongTreasuryTotalReturn[1982]);
    expect(usLongTreasuryTotalReturn[1983] / usLongTreasuryTotalReturn[1982]).toBeGreaterThan(1.3);
  });

  it('given_year2008_when_gettingValue_then_showsFlightToSafety', () => {
    // Financial crisis led to flight to safety in Treasuries
    expect(usLongTreasuryTotalReturn[2008]).toBeGreaterThan(usLongTreasuryTotalReturn[2007]);
  });

  it('given_year2009_when_gettingValue_then_showsQEBoost', () => {
    // QE led to strong Treasury performance
    expect(usLongTreasuryTotalReturn[2009]).toBeGreaterThan(usLongTreasuryTotalReturn[2008]);
  });

  it('given_year2023_when_gettingValue_then_showsRateHikeImpact', () => {
    // 2022-2023 aggressive Fed rate hikes devastated long bonds
    expect(usLongTreasuryTotalReturn[2023]).toBeLessThan(usLongTreasuryTotalReturn[2022]);
    // Should be significantly lower
    expect(usLongTreasuryTotalReturn[2023] / usLongTreasuryTotalReturn[2022]).toBeLessThan(0.75);
  });

  it('given_longTerm_when_comparingValues_then_showsOverallUpwardTrend', () => {
    // Despite recent losses, should be up from 1980 base
    expect(usLongTreasuryTotalReturn[2026]).toBeGreaterThan(usLongTreasuryTotalReturn[1980]);
    // Should have grown significantly over 45+ years with reinvested coupons
    expect(usLongTreasuryTotalReturn[2026] / usLongTreasuryTotalReturn[1980]).toBeGreaterThan(10);
  });
});

describe('getUSLongTreasuryTotalReturn', () => {
  it('given_validYear_when_gettingValue_then_returnsValue', () => {
    const value = getUSLongTreasuryTotalReturn(2000);
    expect(value).toBe(usLongTreasuryTotalReturn[2000]);
  });

  it('given_allValidYears_when_gettingValues_then_returnsAllValues', () => {
    for (let year = 1980; year <= 2026; year++) {
      expect(() => getUSLongTreasuryTotalReturn(year)).not.toThrow();
      expect(getUSLongTreasuryTotalReturn(year)).toBe(usLongTreasuryTotalReturn[year]);
    }
  });

  it('given_invalidYear_when_gettingValue_then_throwsError', () => {
    expect(() => getUSLongTreasuryTotalReturn(1979)).toThrow('US Long Treasury Total Return data not available');
    expect(() => getUSLongTreasuryTotalReturn(2027)).toThrow('US Long Treasury Total Return data not available');
  });
});

describe('getAvailableYears', () => {
  it('given_treasuryData_when_gettingAvailableYears_then_returnsArrayOfNumbers', () => {
    const years = getAvailableYears();
    expect(Array.isArray(years)).toBe(true);
    years.forEach(year => {
      expect(typeof year).toBe('number');
    });
  });

  it('given_treasuryData_when_gettingAvailableYears_then_isSorted', () => {
    const years = getAvailableYears();
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });

  it('given_treasuryData_when_gettingAvailableYears_then_includes1980And2026', () => {
    const years = getAvailableYears();
    expect(years).toContain(1980);
    expect(years).toContain(2026);
  });

  it('given_treasuryData_when_gettingAvailableYears_then_has47Years', () => {
    const years = getAvailableYears();
    expect(years.length).toBe(47); // 1980-2026 = 47 years
  });
});
