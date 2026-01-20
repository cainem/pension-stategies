/**
 * S&P 500 Total Return Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  sp500TotalReturn,
  getSP500TotalReturn,
  getAvailableYears
} from '../../src/data/sp500TotalReturn.js';

describe('sp500TotalReturn data', () => {
  it('given_sp500Data_when_checkingStructure_then_hasAllYears2000To2026', () => {
    const years = Object.keys(sp500TotalReturn).map(Number);
    for (let year = 2000; year <= 2026; year++) {
      expect(years).toContain(year);
    }
  });

  it('given_sp500Data_when_checkingValues_then_allValuesArePositiveNumbers', () => {
    Object.values(sp500TotalReturn).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });

  it('given_year2000_when_gettingValue_then_returnsReasonableValue', () => {
    // S&P 500 TR was around 2400-2500 at start of 2000
    const value = sp500TotalReturn[2000];
    expect(value).toBeGreaterThan(2000);
    expect(value).toBeLessThan(3000);
  });

  it('given_year2003_when_gettingValue_then_showsDotComCrash', () => {
    // Market dropped significantly after dot-com crash
    expect(sp500TotalReturn[2003]).toBeLessThan(sp500TotalReturn[2000]);
  });

  it('given_year2009_when_gettingValue_then_showsFinancialCrisis', () => {
    // Market dropped in 2008-2009 financial crisis
    expect(sp500TotalReturn[2009]).toBeLessThan(sp500TotalReturn[2008]);
  });

  it('given_longTerm_when_comparingValues_then_showsOverallUpwardTrend', () => {
    expect(sp500TotalReturn[2025]).toBeGreaterThan(sp500TotalReturn[2000]);
    // Should have significant growth over 25 years
    expect(sp500TotalReturn[2025] / sp500TotalReturn[2000]).toBeGreaterThan(3);
  });
});

describe('getSP500TotalReturn', () => {
  it('given_validYear_when_gettingValue_then_returnsValue', () => {
    const value = getSP500TotalReturn(2000);
    expect(value).toBe(sp500TotalReturn[2000]);
  });

  it('given_allValidYears_when_gettingValues_then_returnsAllValues', () => {
    for (let year = 2000; year <= 2026; year++) {
      expect(() => getSP500TotalReturn(year)).not.toThrow();
      expect(getSP500TotalReturn(year)).toBe(sp500TotalReturn[year]);
    }
  });

  it('given_invalidYear_when_gettingValue_then_throwsError', () => {
    expect(() => getSP500TotalReturn(1979)).toThrow('S&P 500 Total Return data not available');
    expect(() => getSP500TotalReturn(2027)).toThrow('S&P 500 Total Return data not available');
  });
});

describe('getAvailableYears', () => {
  it('given_sp500Data_when_gettingAvailableYears_then_returnsArrayOfNumbers', () => {
    const years = getAvailableYears();
    expect(Array.isArray(years)).toBe(true);
    years.forEach(year => {
      expect(typeof year).toBe('number');
    });
  });

  it('given_sp500Data_when_gettingAvailableYears_then_isSorted', () => {
    const years = getAvailableYears();
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });

  it('given_sp500Data_when_gettingAvailableYears_then_includes2000And2026', () => {
    const years = getAvailableYears();
    expect(years).toContain(2000);
    expect(years).toContain(2026);
  });
});
