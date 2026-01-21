/**
 * Gold Prices Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  goldPrices,
  getGoldPrice,
  getAvailableYears
} from '../../src/data/goldPrices.js';

describe('goldPrices data', () => {
  it('given_goldPricesData_when_checkingStructure_then_hasAllYears2000To2026', () => {
    const years = Object.keys(goldPrices).map(Number);
    for (let year = 2000; year <= 2026; year++) {
      expect(years).toContain(year);
    }
  });

  it('given_goldPricesData_when_checkingValues_then_allValuesArePositiveNumbers', () => {
    Object.values(goldPrices).forEach(price => {
      expect(typeof price).toBe('number');
      expect(price).toBeGreaterThan(0);
    });
  });

  it('given_year2000_when_gettingPrice_then_returnsReasonableValue', () => {
    // Gold was around £170-180 per oz in early 2000
    const price = goldPrices[2000];
    expect(price).toBeGreaterThan(150);
    expect(price).toBeLessThan(200);
  });

  it('given_year2011_when_gettingPrice_then_showsGoldBullMarket', () => {
    // Gold peaked during 2011 financial crisis
    const price = goldPrices[2011];
    expect(price).toBeGreaterThan(800);
  });

  it('given_year2026_when_gettingPrice_then_showsMajorSurge', () => {
    // Gold surged significantly in 2025-2026
    const price = goldPrices[2026];
    expect(price).toBeGreaterThan(3000);
  });

  it('given_recentYears_when_comparingPrices_then_showsOverallUpwardTrend', () => {
    expect(goldPrices[2025]).toBeGreaterThan(goldPrices[2000]);
    // Should have at least 10x increase over 25 years
    expect(goldPrices[2025] / goldPrices[2000]).toBeGreaterThan(10);
  });
});

describe('getGoldPrice', () => {
  it('given_validYear_when_gettingPrice_then_returnsPrice', () => {
    const price = getGoldPrice(2000);
    expect(price).toBe(goldPrices[2000]);
  });

  it('given_allValidYears_when_gettingPrices_then_returnsAllPrices', () => {
    for (let year = 2000; year <= 2026; year++) {
      expect(() => getGoldPrice(year)).not.toThrow();
      expect(getGoldPrice(year)).toBe(goldPrices[year]);
    }
  });

  it('given_invalidYear_when_gettingPrice_then_throwsError', () => {
    expect(() => getGoldPrice(1979)).toThrow('Gold price data not available');
    expect(() => getGoldPrice(2027)).toThrow('Gold price data not available');
  });
});

describe('getAvailableYears', () => {
  it('given_goldPricesData_when_gettingAvailableYears_then_returnsArrayOfNumbers', () => {
    const years = getAvailableYears();
    expect(Array.isArray(years)).toBe(true);
    years.forEach(year => {
      expect(typeof year).toBe('number');
    });
  });

  it('given_goldPricesData_when_gettingAvailableYears_then_isSorted', () => {
    const years = getAvailableYears();
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });

  it('given_goldPricesData_when_gettingAvailableYears_then_includes2000And2026', () => {
    const years = getAvailableYears();
    expect(years).toContain(2000);
    expect(years).toContain(2026);
  });
});
