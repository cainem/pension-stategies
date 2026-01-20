/**
 * Exchange Rates Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  exchangeRates,
  getExchangeRate,
  usdToGbp,
  gbpToUsd,
  getAvailableYears
} from '../../src/data/exchangeRates.js';

describe('exchangeRates data', () => {
  it('given_exchangeRatesData_when_checkingStructure_then_hasAllYears2000To2026', () => {
    const years = Object.keys(exchangeRates).map(Number);
    for (let year = 2000; year <= 2026; year++) {
      expect(years).toContain(year);
    }
  });

  it('given_exchangeRatesData_when_checkingValues_then_allValuesArePositiveNumbers', () => {
    Object.values(exchangeRates).forEach(rate => {
      expect(typeof rate).toBe('number');
      expect(rate).toBeGreaterThan(0);
    });
  });

  it('given_exchangeRatesData_when_checkingValues_then_allRatesAreReasonable', () => {
    // GBP/USD has historically been between 1.0 and 2.5
    Object.values(exchangeRates).forEach(rate => {
      expect(rate).toBeGreaterThan(1.0);
      expect(rate).toBeLessThan(2.5);
    });
  });

  it('given_year2017_when_gettingRate_then_showsBrexitImpact', () => {
    // GBP weakened significantly after Brexit vote (June 2016)
    expect(exchangeRates[2017]).toBeLessThan(exchangeRates[2016]);
    expect(exchangeRates[2017]).toBeLessThan(1.3);
  });

  it('given_year2008_when_gettingRate_then_showsStrongPound', () => {
    // GBP was strong before the financial crisis
    expect(exchangeRates[2008]).toBeGreaterThan(1.9);
  });
});

describe('getExchangeRate', () => {
  it('given_validYear_when_gettingRate_then_returnsRate', () => {
    const rate = getExchangeRate(2000);
    expect(rate).toBe(exchangeRates[2000]);
  });

  it('given_allValidYears_when_gettingRates_then_returnsAllRates', () => {
    for (let year = 2000; year <= 2026; year++) {
      expect(() => getExchangeRate(year)).not.toThrow();
      expect(getExchangeRate(year)).toBe(exchangeRates[year]);
    }
  });

  it('given_invalidYear_when_gettingRate_then_throwsError', () => {
    expect(() => getExchangeRate(1979)).toThrow('Exchange rate data not available');
    expect(() => getExchangeRate(2027)).toThrow('Exchange rate data not available');
  });
});

describe('usdToGbp', () => {
  it('given_usdAmount_when_converting_then_returnsCorrectGbp', () => {
    // If 1 GBP = 1.5 USD, then 150 USD = 100 GBP
    const rate2000 = exchangeRates[2000]; // ~1.62
    const gbp = usdToGbp(162, 2000);
    expect(gbp).toBeCloseTo(162 / rate2000, 2);
  });

  it('given_zeroUsd_when_converting_then_returnsZero', () => {
    const gbp = usdToGbp(0, 2000);
    expect(gbp).toBe(0);
  });

  it('given_largeUsdAmount_when_converting_then_returnsCorrectGbp', () => {
    const gbp = usdToGbp(1000000, 2020);
    expect(gbp).toBeCloseTo(1000000 / exchangeRates[2020], 2);
  });
});

describe('gbpToUsd', () => {
  it('given_gbpAmount_when_converting_then_returnsCorrectUsd', () => {
    const rate2000 = exchangeRates[2000];
    const usd = gbpToUsd(100, 2000);
    expect(usd).toBeCloseTo(100 * rate2000, 2);
  });

  it('given_zeroGbp_when_converting_then_returnsZero', () => {
    const usd = gbpToUsd(0, 2000);
    expect(usd).toBe(0);
  });

  it('given_roundTripConversion_when_converting_then_returnsOriginalValue', () => {
    const originalGbp = 1000;
    const usd = gbpToUsd(originalGbp, 2015);
    const gbpBack = usdToGbp(usd, 2015);
    expect(gbpBack).toBeCloseTo(originalGbp, 10);
  });
});

describe('getAvailableYears', () => {
  it('given_exchangeRatesData_when_gettingAvailableYears_then_returnsArrayOfNumbers', () => {
    const years = getAvailableYears();
    expect(Array.isArray(years)).toBe(true);
    years.forEach(year => {
      expect(typeof year).toBe('number');
    });
  });

  it('given_exchangeRatesData_when_gettingAvailableYears_then_isSorted', () => {
    const years = getAvailableYears();
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });

  it('given_exchangeRatesData_when_gettingAvailableYears_then_includes2000And2026', () => {
    const years = getAvailableYears();
    expect(years).toContain(2000);
    expect(years).toContain(2026);
  });
});
