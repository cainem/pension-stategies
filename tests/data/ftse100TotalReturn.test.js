/**
 * FTSE 100 Total Return Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ftse100TotalReturn,
  getFTSE100TotalReturn,
  getAvailableYears,
  getEarliestYear,
  hasDataForYear
} from '../../src/data/ftse100TotalReturn.js';

describe('ftse100TotalReturn data', () => {
  it('given_ftse100Data_when_checkingStructure_then_hasAllYears1984To2026', () => {
    const years = Object.keys(ftse100TotalReturn).map(Number);
    // FTSE 100 launched in 1984
    for (let year = 1984; year <= 2026; year++) {
      expect(years).toContain(year);
    }
  });

  it('given_ftse100Data_when_checkingStructure_then_hasNoYearsBefore1984', () => {
    const years = Object.keys(ftse100TotalReturn).map(Number);
    const yearsBeforeLaunch = years.filter(y => y < 1984);
    expect(yearsBeforeLaunch).toHaveLength(0);
  });

  it('given_ftse100Data_when_checkingValues_then_allValuesArePositiveNumbers', () => {
    Object.values(ftse100TotalReturn).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });

  it('given_year1984_when_gettingValue_then_returnsBaseValue', () => {
    // Base value at launch is 1000
    const value = ftse100TotalReturn[1984];
    expect(value).toBe(1000);
  });

  it('given_year1988_when_gettingValue_then_showsBlackMondayImpact', () => {
    // 1987 had Black Monday, 1988 should show lower value
    expect(ftse100TotalReturn[1988]).toBeLessThan(ftse100TotalReturn[1987]);
  });

  it('given_year2003_when_gettingValue_then_showsDotComCrash', () => {
    // Market dropped significantly after dot-com crash
    expect(ftse100TotalReturn[2003]).toBeLessThan(ftse100TotalReturn[2000]);
  });

  it('given_year2009_when_gettingValue_then_showsFinancialCrisis', () => {
    // Market dropped in 2008-2009 financial crisis (-35.46%)
    expect(ftse100TotalReturn[2009]).toBeLessThan(ftse100TotalReturn[2008]);
  });

  it('given_year2021_when_gettingValue_then_showsCovidCrashCarryover', () => {
    // COVID crash effects visible in early 2021 value
    expect(ftse100TotalReturn[2021]).toBeLessThan(ftse100TotalReturn[2020]);
  });

  it('given_longTerm_when_comparingValues_then_showsOverallUpwardTrend', () => {
    expect(ftse100TotalReturn[2025]).toBeGreaterThan(ftse100TotalReturn[1984]);
    // Should have significant growth over 40+ years (10x+)
    expect(ftse100TotalReturn[2025] / ftse100TotalReturn[1984]).toBeGreaterThan(10);
  });

  it('given_ftse100_when_comparingGrowthToSP500_then_showsLowerGrowth', () => {
    // FTSE 100 historically has lower returns than S&P 500
    // 15x growth over 40 years for FTSE vs 200x+ for S&P 500
    const ftseGrowth = ftse100TotalReturn[2025] / ftse100TotalReturn[1984];
    expect(ftseGrowth).toBeGreaterThan(10);
    expect(ftseGrowth).toBeLessThan(50);
  });
});

describe('getFTSE100TotalReturn', () => {
  it('given_validYear_when_gettingValue_then_returnsValue', () => {
    const value = getFTSE100TotalReturn(2000);
    expect(value).toBe(ftse100TotalReturn[2000]);
  });

  it('given_allValidYears_when_gettingValues_then_returnsAllValues', () => {
    for (let year = 1984; year <= 2026; year++) {
      expect(() => getFTSE100TotalReturn(year)).not.toThrow();
      expect(getFTSE100TotalReturn(year)).toBe(ftse100TotalReturn[year]);
    }
  });

  it('given_yearBeforeLaunch_when_gettingValue_then_throwsError', () => {
    expect(() => getFTSE100TotalReturn(1983)).toThrow('FTSE 100 Total Return data not available');
    expect(() => getFTSE100TotalReturn(1983)).toThrow('Index launched in 1984');
  });

  it('given_yearAfterRange_when_gettingValue_then_throwsError', () => {
    expect(() => getFTSE100TotalReturn(2027)).toThrow('FTSE 100 Total Return data not available');
  });
});

describe('getAvailableYears', () => {
  it('given_ftse100Data_when_gettingAvailableYears_then_returnsArrayOfNumbers', () => {
    const years = getAvailableYears();
    expect(Array.isArray(years)).toBe(true);
    years.forEach(year => {
      expect(typeof year).toBe('number');
    });
  });

  it('given_ftse100Data_when_gettingAvailableYears_then_isSorted', () => {
    const years = getAvailableYears();
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });

  it('given_ftse100Data_when_gettingAvailableYears_then_startsAt1984', () => {
    const years = getAvailableYears();
    expect(years[0]).toBe(1984);
  });
});

describe('getEarliestYear', () => {
  it('given_ftse100Data_when_gettingEarliestYear_then_returns1984', () => {
    expect(getEarliestYear()).toBe(1984);
  });
});

describe('hasDataForYear', () => {
  it('given_validYear_when_checkingAvailability_then_returnsTrue', () => {
    expect(hasDataForYear(1984)).toBe(true);
    expect(hasDataForYear(2000)).toBe(true);
    expect(hasDataForYear(2026)).toBe(true);
  });

  it('given_yearBeforeLaunch_when_checkingAvailability_then_returnsFalse', () => {
    expect(hasDataForYear(1983)).toBe(false);
    expect(hasDataForYear(1980)).toBe(false);
  });

  it('given_yearAfterRange_when_checkingAvailability_then_returnsFalse', () => {
    expect(hasDataForYear(2027)).toBe(false);
  });
});
