/**
 * UK Tax Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ukTaxData,
  getTaxData,
  getPersonalAllowance,
  hasAdditionalRate,
  getAvailableYears
} from '../../src/data/ukTaxData.js';

describe('ukTaxData structure', () => {
  it('given_ukTaxData_when_checkingStructure_then_hasAllYears2000To2026', () => {
    const years = Object.keys(ukTaxData).map(Number);
    for (let year = 2000; year <= 2026; year++) {
      expect(years).toContain(year);
    }
  });

  it('given_ukTaxData_when_checkingStructure_then_hasRequiredFields', () => {
    const requiredFields = [
      'personalAllowance',
      'basicRate',
      'basicRateLimit',
      'higherRate'
    ];

    Object.entries(ukTaxData).forEach(([_year, data]) => {
      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });
    });
  });

  it('given_ukTaxData_when_checkingValues_then_personalAllowanceIsPositive', () => {
    Object.values(ukTaxData).forEach(data => {
      expect(data.personalAllowance).toBeGreaterThan(0);
    });
  });

  it('given_ukTaxData_when_checkingValues_then_taxRatesAreBetween0And1', () => {
    Object.values(ukTaxData).forEach(data => {
      expect(data.basicRate).toBeGreaterThan(0);
      expect(data.basicRate).toBeLessThan(1);
      expect(data.higherRate).toBeGreaterThan(0);
      expect(data.higherRate).toBeLessThan(1);
      if (data.additionalRate !== null) {
        expect(data.additionalRate).toBeGreaterThan(0);
        expect(data.additionalRate).toBeLessThan(1);
      }
    });
  });
});

describe('ukTaxData historical accuracy', () => {
  it('given_year2000_when_checkingTaxData_then_hasCorrectPersonalAllowance', () => {
    expect(ukTaxData[2000].personalAllowance).toBe(4385);
  });

  it('given_year2000To2007_when_checkingBasicRate_then_is22Percent', () => {
    for (let year = 2000; year <= 2007; year++) {
      expect(ukTaxData[year].basicRate).toBe(0.22);
    }
  });

  it('given_year2008Onwards_when_checkingBasicRate_then_is20Percent', () => {
    for (let year = 2008; year <= 2026; year++) {
      expect(ukTaxData[year].basicRate).toBe(0.20);
    }
  });

  it('given_yearBefore2010_when_checkingAdditionalRate_then_doesNotExist', () => {
    for (let year = 2000; year < 2010; year++) {
      expect(ukTaxData[year].additionalRate).toBeNull();
    }
  });

  it('given_year2010To2012_when_checkingAdditionalRate_then_is50Percent', () => {
    for (let year = 2010; year <= 2012; year++) {
      expect(ukTaxData[year].additionalRate).toBe(0.50);
    }
  });

  it('given_year2013Onwards_when_checkingAdditionalRate_then_is45Percent', () => {
    for (let year = 2013; year <= 2026; year++) {
      expect(ukTaxData[year].additionalRate).toBe(0.45);
    }
  });

  it('given_year2024_when_checkingPersonalAllowance_then_is12570', () => {
    expect(ukTaxData[2024].personalAllowance).toBe(12570);
  });

  it('given_year2023Onwards_when_checkingAdditionalThreshold_then_is125140', () => {
    for (let year = 2023; year <= 2026; year++) {
      expect(ukTaxData[year].additionalRateThreshold).toBe(125140);
    }
  });

  it('given_personalAllowanceOverTime_when_comparing_then_generallyIncreases', () => {
    // Personal allowance has generally increased over time
    expect(ukTaxData[2020].personalAllowance).toBeGreaterThan(ukTaxData[2000].personalAllowance);
    expect(ukTaxData[2024].personalAllowance).toBeGreaterThan(ukTaxData[2010].personalAllowance);
  });
});

describe('getTaxData', () => {
  it('given_validYear_when_gettingTaxData_then_returnsData', () => {
    const data = getTaxData(2000);
    expect(data).toBe(ukTaxData[2000]);
    expect(data.personalAllowance).toBe(4385);
  });

  it('given_allValidYears_when_gettingTaxData_then_returnsAllData', () => {
    for (let year = 2000; year <= 2026; year++) {
      expect(() => getTaxData(year)).not.toThrow();
      expect(getTaxData(year)).toBe(ukTaxData[year]);
    }
  });

  it('given_invalidYear_when_gettingTaxData_then_throwsError', () => {
    expect(() => getTaxData(1979)).toThrow('UK tax data not available');
    expect(() => getTaxData(2027)).toThrow('UK tax data not available');
  });
});

describe('getPersonalAllowance', () => {
  it('given_validYear_when_gettingPersonalAllowance_then_returnsCorrectAmount', () => {
    expect(getPersonalAllowance(2000)).toBe(4385);
    expect(getPersonalAllowance(2024)).toBe(12570);
  });

  it('given_invalidYear_when_gettingPersonalAllowance_then_throwsError', () => {
    expect(() => getPersonalAllowance(1979)).toThrow();
  });
});

describe('hasAdditionalRate', () => {
  it('given_yearBefore2010_when_checkingAdditionalRate_then_returnsFalse', () => {
    expect(hasAdditionalRate(2000)).toBe(false);
    expect(hasAdditionalRate(2009)).toBe(false);
  });

  it('given_year2010Onwards_when_checkingAdditionalRate_then_returnsTrue', () => {
    expect(hasAdditionalRate(2010)).toBe(true);
    expect(hasAdditionalRate(2024)).toBe(true);
  });

  it('given_invalidYear_when_checkingAdditionalRate_then_throwsError', () => {
    expect(() => hasAdditionalRate(1979)).toThrow();
  });
});

describe('getAvailableYears', () => {
  it('given_ukTaxData_when_gettingAvailableYears_then_returnsArrayOfNumbers', () => {
    const years = getAvailableYears();
    expect(Array.isArray(years)).toBe(true);
    years.forEach(year => {
      expect(typeof year).toBe('number');
    });
  });

  it('given_ukTaxData_when_gettingAvailableYears_then_isSorted', () => {
    const years = getAvailableYears();
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });

  it('given_ukTaxData_when_gettingAvailableYears_then_includes2000And2026', () => {
    const years = getAvailableYears();
    expect(years).toContain(2000);
    expect(years).toContain(2026);
  });

  it('given_ukTaxData_when_gettingAvailableYears_then_has47Years', () => {
    const years = getAvailableYears();
    expect(years).toHaveLength(47); // 1980-2026 inclusive
  });
});
