/**
 * Nasdaq 100 Total Return Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  nasdaq100TotalReturn,
  getNasdaq100TotalReturn,
  getAvailableYears,
  getEarliestYear,
  hasDataForYear
} from '../../src/data/nasdaq100TotalReturn.js';

describe('nasdaq100TotalReturn data', () => {
  it('given_nasdaq100Data_when_checkingStructure_then_hasAllYears1985To2026', () => {
    const years = Object.keys(nasdaq100TotalReturn).map(Number);
    // Nasdaq 100 launched in 1985
    for (let year = 1985; year <= 2026; year++) {
      expect(years).toContain(year);
    }
  });

  it('given_nasdaq100Data_when_checkingStructure_then_hasNoYearsBefore1985', () => {
    const years = Object.keys(nasdaq100TotalReturn).map(Number);
    const yearsBeforeLaunch = years.filter(y => y < 1985);
    expect(yearsBeforeLaunch).toHaveLength(0);
  });

  it('given_nasdaq100Data_when_checkingValues_then_allValuesArePositiveNumbers', () => {
    Object.values(nasdaq100TotalReturn).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });

  it('given_year1985_when_gettingValue_then_returnsBaseValue', () => {
    // Base value at launch is 100
    const value = nasdaq100TotalReturn[1985];
    expect(value).toBe(100);
  });

  it('given_year2000_when_gettingValue_then_showsDotComPeak', () => {
    // 1999 saw 101.95% return - 2000 should show the peak
    expect(nasdaq100TotalReturn[2000]).toBeGreaterThan(nasdaq100TotalReturn[1999]);
    expect(nasdaq100TotalReturn[2000]).toBeGreaterThan(2000);
  });

  it('given_year2003_when_gettingValue_then_showsDotComCrash', () => {
    // Market dropped significantly after dot-com crash
    expect(nasdaq100TotalReturn[2003]).toBeLessThan(nasdaq100TotalReturn[2000]);
    // Should have lost more than 50% from peak
    expect(nasdaq100TotalReturn[2003] / nasdaq100TotalReturn[2000]).toBeLessThan(0.5);
  });

  it('given_year2009_when_gettingValue_then_showsFinancialCrisis', () => {
    // Market dropped in 2008-2009 financial crisis (-41.89%)
    expect(nasdaq100TotalReturn[2009]).toBeLessThan(nasdaq100TotalReturn[2008]);
  });

  it('given_year2023_when_gettingValue_then_showsTechCrash2022', () => {
    // 2022 saw -32.97% return
    expect(nasdaq100TotalReturn[2023]).toBeLessThan(nasdaq100TotalReturn[2022]);
  });

  it('given_longTerm_when_comparingValues_then_showsOverallUpwardTrend', () => {
    expect(nasdaq100TotalReturn[2025]).toBeGreaterThan(nasdaq100TotalReturn[1985]);
    // Should have massive growth over 40 years (100x+)
    expect(nasdaq100TotalReturn[2025] / nasdaq100TotalReturn[1985]).toBeGreaterThan(100);
  });
});

describe('getNasdaq100TotalReturn', () => {
  it('given_validYear_when_gettingValue_then_returnsValue', () => {
    const value = getNasdaq100TotalReturn(2000);
    expect(value).toBe(nasdaq100TotalReturn[2000]);
  });

  it('given_allValidYears_when_gettingValues_then_returnsAllValues', () => {
    for (let year = 1985; year <= 2026; year++) {
      expect(() => getNasdaq100TotalReturn(year)).not.toThrow();
      expect(getNasdaq100TotalReturn(year)).toBe(nasdaq100TotalReturn[year]);
    }
  });

  it('given_yearBeforeLaunch_when_gettingValue_then_throwsError', () => {
    expect(() => getNasdaq100TotalReturn(1984)).toThrow('Nasdaq 100 Total Return data not available');
    expect(() => getNasdaq100TotalReturn(1984)).toThrow('Index launched in 1985');
  });

  it('given_yearAfterRange_when_gettingValue_then_throwsError', () => {
    expect(() => getNasdaq100TotalReturn(2027)).toThrow('Nasdaq 100 Total Return data not available');
  });
});

describe('getAvailableYears', () => {
  it('given_nasdaq100Data_when_gettingAvailableYears_then_returnsArrayOfNumbers', () => {
    const years = getAvailableYears();
    expect(Array.isArray(years)).toBe(true);
    years.forEach(year => {
      expect(typeof year).toBe('number');
    });
  });

  it('given_nasdaq100Data_when_gettingAvailableYears_then_isSorted', () => {
    const years = getAvailableYears();
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });

  it('given_nasdaq100Data_when_gettingAvailableYears_then_startsAt1985', () => {
    const years = getAvailableYears();
    expect(years[0]).toBe(1985);
  });
});

describe('getEarliestYear', () => {
  it('given_nasdaq100Data_when_gettingEarliestYear_then_returns1985', () => {
    expect(getEarliestYear()).toBe(1985);
  });
});

describe('hasDataForYear', () => {
  it('given_validYear_when_checkingAvailability_then_returnsTrue', () => {
    expect(hasDataForYear(1985)).toBe(true);
    expect(hasDataForYear(2000)).toBe(true);
    expect(hasDataForYear(2026)).toBe(true);
  });

  it('given_yearBeforeLaunch_when_checkingAvailability_then_returnsFalse', () => {
    expect(hasDataForYear(1984)).toBe(false);
    expect(hasDataForYear(1980)).toBe(false);
  });

  it('given_yearAfterRange_when_checkingAvailability_then_returnsFalse', () => {
    expect(hasDataForYear(2027)).toBe(false);
  });
});
