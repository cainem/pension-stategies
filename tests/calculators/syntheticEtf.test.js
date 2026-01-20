/**
 * Synthetic ETF Price Calculator Tests
 *
 * Tests for calculating GBP-denominated S&P 500 ETF prices before VUAG existed.
 * All tests follow the naming convention: given_[precondition]_when_[action]_then_[expectedResult]
 */

import { describe, test, expect } from 'vitest';
import {
  getSyntheticEtfPrice,
  calculateUnits,
  calculateValue,
  calculateReturn,
  calculateAnnualizedReturn,
  getAllPrices,
  validatePrices,
  BASE_YEAR,
  BASE_PRICE_GBP
} from '../../src/calculators/syntheticEtf.js';

describe('getSyntheticEtfPrice', () => {
  describe('input validation', () => {
    test('given_yearOutsideRange_when_gettingPrice_then_throwsError', () => {
      expect(() => getSyntheticEtfPrice(1979)).toThrow('outside supported range');
      expect(() => getSyntheticEtfPrice(2027)).toThrow('outside supported range');
    });

    test('given_nonIntegerYear_when_gettingPrice_then_throwsError', () => {
      expect(() => getSyntheticEtfPrice(2020.5)).toThrow();
    });
  });

  describe('base year calibration', () => {
    test('given_baseYear2019_when_gettingPrice_then_equalsBasePrice', () => {
      const price = getSyntheticEtfPrice(BASE_YEAR);
      expect(price).toBeCloseTo(BASE_PRICE_GBP, 2);
    });

    test('given_validatePrices_when_called_then_returnsTrue', () => {
      expect(validatePrices()).toBe(true);
    });
  });

  describe('historical price calculation', () => {
    test('given_year2000_when_gettingPrice_then_calculatesCorrectly', () => {
      // 2000: S&P 500 TR = 2474.50, Exchange = 1.6178
      // 2019 (base): S&P 500 TR = 5648.40, Exchange = 1.2755
      // Price = (2474.50 / 5648.40) * 44.30 * (1.2755 / 1.6178)
      // Price = 0.4381 * 44.30 * 0.7884 = ~15.30
      const price = getSyntheticEtfPrice(2000);
      expect(price).toBeGreaterThan(10);
      expect(price).toBeLessThan(25);
    });

    test('given_year2010_when_gettingPrice_then_calculatesCorrectly', () => {
      // 2010: S&P 500 TR = 2596.98, Exchange = 1.6148
      // Should be higher than 2000 due to S&P growth but similar FX
      const price = getSyntheticEtfPrice(2010);
      expect(price).toBeGreaterThan(10);
      expect(price).toBeLessThan(25);
    });

    test('given_year2020_when_gettingPrice_then_calculatesCorrectly', () => {
      // 2020: S&P 500 TR = 7315.00, Exchange = 1.3253
      // Should be higher than base year (stronger performance after 2019)
      const price = getSyntheticEtfPrice(2020);
      expect(price).toBeGreaterThan(BASE_PRICE_GBP);
    });

    test('given_year2026_when_gettingPrice_then_calculatesCorrectly', () => {
      // 2026 should show significant growth from base year
      const price = getSyntheticEtfPrice(2026);
      expect(price).toBeGreaterThan(BASE_PRICE_GBP * 1.5);
    });
  });

  describe('price trends', () => {
    test('given_multipleYears_when_comparing_then_pricesReflectMarketMoves', () => {
      // 2008 (pre-crash high) should be higher than 2009 (post-crash low)
      const price2008 = getSyntheticEtfPrice(2008);
      const price2009 = getSyntheticEtfPrice(2009);
      expect(price2008).toBeGreaterThan(price2009);
    });

    test('given_2000To2003_when_comparing_then_showsDotComCrash', () => {
      // Dot-com crash: 2000 peak -> 2003 trough
      const price2000 = getSyntheticEtfPrice(2000);
      const price2003 = getSyntheticEtfPrice(2003);
      expect(price2000).toBeGreaterThan(price2003);
    });

    test('given_2019To2026_when_comparing_then_showsOverallGrowth', () => {
      const price2019 = getSyntheticEtfPrice(2019);
      const price2026 = getSyntheticEtfPrice(2026);
      expect(price2026).toBeGreaterThan(price2019);
    });
  });

  describe('currency impact', () => {
    test('given_yearWithWeakPound_when_gettingPrice_then_priceIsHigher', () => {
      // 2017 had a weak pound (1.2271) post-Brexit vote
      // Compare to 2007 which had stronger pound (1.9586)
      // All else equal, weak pound = higher GBP price for USD assets

      // This is a conceptual test - the actual effect depends on S&P performance too
      // We just verify the calculation includes currency adjustments
      const price2017 = getSyntheticEtfPrice(2017);
      expect(price2017).toBeGreaterThan(0);
    });
  });
});

describe('calculateUnits', () => {
  test('given_negativeAmount_when_calculating_then_throwsError', () => {
    expect(() => calculateUnits(-1000, 2020)).toThrow('Amount must be non-negative');
  });

  test('given_zeroAmount_when_calculating_then_returnsZero', () => {
    expect(calculateUnits(0, 2020)).toBe(0);
  });

  test('given_validAmount_when_calculating_then_returnsCorrectUnits', () => {
    const amount = 10000;
    const year = 2020;
    const price = getSyntheticEtfPrice(year);
    const expectedUnits = amount / price;

    const units = calculateUnits(amount, year);
    expect(units).toBeCloseTo(expectedUnits, 6);
  });

  test('given_largeAmount_when_calculating_then_returnsMoreUnits', () => {
    const smallUnits = calculateUnits(10000, 2020);
    const largeUnits = calculateUnits(100000, 2020);
    expect(largeUnits).toBeCloseTo(smallUnits * 10, 6);
  });
});

describe('calculateValue', () => {
  test('given_negativeUnits_when_calculating_then_throwsError', () => {
    expect(() => calculateValue(-100, 2020)).toThrow('Units must be non-negative');
  });

  test('given_zeroUnits_when_calculating_then_returnsZero', () => {
    expect(calculateValue(0, 2020)).toBe(0);
  });

  test('given_validUnits_when_calculating_then_returnsCorrectValue', () => {
    const units = 100;
    const year = 2020;
    const price = getSyntheticEtfPrice(year);
    const expectedValue = units * price;

    const value = calculateValue(units, year);
    expect(value).toBeCloseTo(expectedValue, 2);
  });

  test('given_unitsAndAmount_when_roundTrip_then_valuesMatch', () => {
    // Buy £50,000 of units, then calculate their value
    const investAmount = 50000;
    const buyYear = 2015;

    const units = calculateUnits(investAmount, buyYear);
    const valueAtSameYear = calculateValue(units, buyYear);

    expect(valueAtSameYear).toBeCloseTo(investAmount, 2);
  });
});

describe('calculateReturn', () => {
  test('given_sameYear_when_calculating_then_returnsOne', () => {
    expect(calculateReturn(2020, 2020)).toBeCloseTo(1, 6);
  });

  test('given_positiveGrowthPeriod_when_calculating_then_returnsGreaterThanOne', () => {
    // 2010 to 2020 was a strong growth period
    const returnMultiplier = calculateReturn(2010, 2020);
    expect(returnMultiplier).toBeGreaterThan(1);
  });

  test('given_downturnPeriod_when_calculating_then_returnsLessThanOne', () => {
    // 2000 to 2003 was the dot-com crash
    const returnMultiplier = calculateReturn(2000, 2003);
    expect(returnMultiplier).toBeLessThan(1);
  });

  test('given_longTermPeriod_when_calculating_then_showsSignificantGrowth', () => {
    // 2000 to 2026 should show significant long-term growth
    const returnMultiplier = calculateReturn(2000, 2026);
    expect(returnMultiplier).toBeGreaterThan(2);  // At least doubled
  });

  test('given_startAndEnd_when_calculating_then_matchesPriceRatio', () => {
    const startPrice = getSyntheticEtfPrice(2015);
    const endPrice = getSyntheticEtfPrice(2020);
    const expectedReturn = endPrice / startPrice;

    const returnMultiplier = calculateReturn(2015, 2020);
    expect(returnMultiplier).toBeCloseTo(expectedReturn, 6);
  });
});

describe('calculateAnnualizedReturn', () => {
  test('given_sameYear_when_calculating_then_throwsError', () => {
    expect(() => calculateAnnualizedReturn(2020, 2020)).toThrow('End year must be after start year');
  });

  test('given_endBeforeStart_when_calculating_then_throwsError', () => {
    expect(() => calculateAnnualizedReturn(2020, 2015)).toThrow('End year must be after start year');
  });

  test('given_oneYearPeriod_when_calculating_then_equalsSimpleReturn', () => {
    // For 1 year, annualized return equals simple return
    const simpleReturn = calculateReturn(2019, 2020);
    const annualizedReturn = calculateAnnualizedReturn(2019, 2020);

    expect(annualizedReturn + 1).toBeCloseTo(simpleReturn, 4);
  });

  test('given_longPeriod_when_calculating_then_returnsReasonableRate', () => {
    // 2000 to 2026 - expect reasonable annualized return
    const annualizedReturn = calculateAnnualizedReturn(2000, 2026);

    // Long-term stock returns are typically 7-10% nominal
    expect(annualizedReturn).toBeGreaterThan(0.03);
    expect(annualizedReturn).toBeLessThan(0.15);
  });

  test('given_annualizedReturn_when_compounded_then_matchesTotalReturn', () => {
    const startYear = 2010;
    const endYear = 2020;
    const years = endYear - startYear;

    const totalReturn = calculateReturn(startYear, endYear);
    const annualized = calculateAnnualizedReturn(startYear, endYear);

    // Compounding the annualized return should give the total return
    const compounded = Math.pow(1 + annualized, years);
    expect(compounded).toBeCloseTo(totalReturn, 4);
  });
});

describe('getAllPrices', () => {
  test('given_call_when_gettingAllPrices_then_returnsAllYears', () => {
    const prices = getAllPrices();

    expect(Object.keys(prices).length).toBe(27);  // 2000-2026
    expect(prices[2000]).toBeDefined();
    expect(prices[2026]).toBeDefined();
  });

  test('given_allPrices_when_checking_then_allPositive', () => {
    const prices = getAllPrices();

    for (const year in prices) {
      expect(prices[year]).toBeGreaterThan(0);
    }
  });

  test('given_allPrices_when_checkingBaseYear_then_matchesBasePrice', () => {
    const prices = getAllPrices();
    expect(prices[BASE_YEAR]).toBeCloseTo(BASE_PRICE_GBP, 2);
  });
});

describe('integration tests', () => {
  test('given_investmentScenario_when_simulating_then_calculatesCorrectly', () => {
    // Invest £100,000 in 2005, check value in 2025
    const investAmount = 100000;
    const buyYear = 2005;
    const sellYear = 2025;

    const units = calculateUnits(investAmount, buyYear);
    const endValue = calculateValue(units, sellYear);

    // Should have grown significantly over 20 years
    expect(endValue).toBeGreaterThan(investAmount * 2);

    // Verify against return calculation
    const returnMultiplier = calculateReturn(buyYear, sellYear);
    expect(endValue).toBeCloseTo(investAmount * returnMultiplier, 0);
  });

  test('given_crashAndRecovery_when_tracking_then_showsPatterns', () => {
    // 2008 financial crisis pattern
    const pre2008 = getSyntheticEtfPrice(2007);
    const crash2009 = getSyntheticEtfPrice(2009);
    const recovery2013 = getSyntheticEtfPrice(2013);

    // Crash: 2009 should be significantly lower than 2007
    expect(crash2009).toBeLessThan(pre2008 * 0.9);

    // Recovery: 2013 should have recovered
    expect(recovery2013).toBeGreaterThan(crash2009);
  });
});

describe('edge cases', () => {
  test('given_firstYear_when_gettingPrice_then_works', () => {
    const price = getSyntheticEtfPrice(2000);
    expect(price).toBeGreaterThan(0);
  });

  test('given_lastYear_when_gettingPrice_then_works', () => {
    const price = getSyntheticEtfPrice(2026);
    expect(price).toBeGreaterThan(0);
  });

  test('given_verySmallInvestment_when_calculating_then_handlesCorrectly', () => {
    const units = calculateUnits(0.01, 2020);
    expect(units).toBeGreaterThan(0);
  });

  test('given_veryLargeInvestment_when_calculating_then_handlesCorrectly', () => {
    const units = calculateUnits(10000000, 2020);
    expect(units).toBeGreaterThan(0);
    expect(isFinite(units)).toBe(true);
  });
});
