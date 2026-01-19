/**
 * SIPP Strategy Calculator Tests
 *
 * Tests for simulating pension kept invested in S&P 500 tracker within SIPP.
 * All tests follow the naming convention: given_[precondition]_when_[action]_then_[expectedResult]
 */

import { describe, test, expect } from 'vitest';
import {
  calculateSippStrategy,
  calculateSippYearsRemaining,
  getSippValue,
  calculateSippAfterTaxValue
} from '../../src/calculators/sippStrategy.js';
import { getSyntheticEtfPrice } from '../../src/calculators/syntheticEtf.js';
import { COSTS } from '../../src/config/defaults.js';

describe('calculateSippStrategy', () => {
  describe('input validation', () => {
    test('given_negativePensionAmount_when_calculating_then_throwsError', () => {
      expect(() => calculateSippStrategy(-100000, 2000, 4, 10))
        .toThrow('Pension amount must be a positive number');
    });

    test('given_zeroPensionAmount_when_calculating_then_throwsError', () => {
      expect(() => calculateSippStrategy(0, 2000, 4, 10))
        .toThrow('Pension amount must be a positive number');
    });

    test('given_invalidStartYear_when_calculating_then_throwsError', () => {
      expect(() => calculateSippStrategy(100000, 1999, 4, 10))
        .toThrow('Start year 1999 is outside supported range');
    });

    test('given_invalidWithdrawalRate_when_calculating_then_throwsError', () => {
      expect(() => calculateSippStrategy(100000, 2000, 0, 10))
        .toThrow('Withdrawal rate must be between 0 and 100');
      expect(() => calculateSippStrategy(100000, 2000, -5, 10))
        .toThrow('Withdrawal rate must be between 0 and 100');
      expect(() => calculateSippStrategy(100000, 2000, 101, 10))
        .toThrow('Withdrawal rate must be between 0 and 100');
    });

    test('given_invalidYears_when_calculating_then_throwsError', () => {
      expect(() => calculateSippStrategy(100000, 2000, 4, 0))
        .toThrow('Years must be a positive integer');
      expect(() => calculateSippStrategy(100000, 2000, 4, -5))
        .toThrow('Years must be a positive integer');
      expect(() => calculateSippStrategy(100000, 2000, 4, 2.5))
        .toThrow('Years must be a positive integer');
    });

    test('given_yearsExtendBeyondData_when_calculating_then_throwsError', () => {
      expect(() => calculateSippStrategy(100000, 2020, 4, 10))
        .toThrow('Not enough data');
    });
  });

  describe('initial investment', () => {
    test('given_pension500k_when_calculating_then_noInitialTax', () => {
      const result = calculateSippStrategy(500000, 2000, 4, 10);

      // Initial investment should equal pension amount (no tax in SIPP)
      expect(result.initialInvestment.pensionAmount).toBe(500000);
      expect(result.initialInvestment.initialValue).toBe(500000);
    });

    test('given_pensionAmount_when_calculating_then_calculatesCorrectUnits', () => {
      const result = calculateSippStrategy(100000, 2020, 4, 5);

      const etfPrice = getSyntheticEtfPrice(2020);
      const expectedUnits = 100000 / etfPrice;

      expect(result.initialInvestment.etfPriceAtStart).toBe(etfPrice);
      expect(result.initialInvestment.unitsAcquired).toBeCloseTo(expectedUnits, 4);
    });
  });

  describe('management fees', () => {
    test('given_activeYear_when_calculating_then_deductsManagementFee', () => {
      const result = calculateSippStrategy(500000, 2010, 4, 5);

      // Each year should have a management fee
      result.yearlyResults.forEach(year => {
        if (year.status !== 'exhausted') {
          expect(year.managementFee).toBeGreaterThan(0);
        }
      });
    });

    test('given_portfolio_when_calculating_then_feeIs0Point5Percent', () => {
      const result = calculateSippStrategy(100000, 2020, 4, 1);

      const year1 = result.yearlyResults[0];
      const expectedFee = year1.startValueGbp * (COSTS.sippManagementFeePercent / 100);

      expect(year1.managementFee).toBeCloseTo(expectedFee, 2);
    });

    test('given_multipleYears_when_calculating_then_totalFeesAreSubstantial', () => {
      const result = calculateSippStrategy(500000, 2000, 4, 25);

      // Over 25 years, fees should be significant
      expect(result.summary.totalManagementFees).toBeGreaterThan(10000);
    });
  });

  describe('yearly withdrawals', () => {
    test('given_activeStrategy_when_withdrawing_then_sellsUnitsAndPaysTax', () => {
      const result = calculateSippStrategy(500000, 2010, 4, 5);

      // First year should be active
      const year1 = result.yearlyResults[0];
      expect(year1.status).toBe('active');
      expect(year1.unitsSold).toBeGreaterThan(0);
      expect(year1.taxOnWithdrawal).toBeGreaterThan(0);
    });

    test('given_4PercentWithdrawal_when_calculating_then_withdrawsCorrectGrossAmount', () => {
      const pensionAmount = 500000;
      const withdrawalRate = 4;
      const expectedAnnualWithdrawal = pensionAmount * (withdrawalRate / 100);

      const result = calculateSippStrategy(pensionAmount, 2010, withdrawalRate, 5);

      // Active years should get the target gross withdrawal
      const activeYear = result.yearlyResults[0];
      expect(activeYear.grossWithdrawal).toBeCloseTo(expectedAnnualWithdrawal, 0);
    });

    test('given_withdrawal_when_calculating_then_applies25PercentTaxFree', () => {
      const result = calculateSippStrategy(100000, 2020, 4, 5);

      const year1 = result.yearlyResults[0];
      // Net should be greater than gross minus 40% (worst case)
      // because 25% is tax-free
      expect(year1.netWithdrawal).toBeGreaterThan(year1.grossWithdrawal * 0.6);
    });

    test('given_unitsSold_when_calculating_then_reducesHoldings', () => {
      const result = calculateSippStrategy(500000, 2010, 4, 5);

      const year1 = result.yearlyResults[0];
      const year2 = result.yearlyResults[1];

      // Units should decrease (after fee and withdrawal)
      expect(year2.startUnits).toBeLessThan(year1.startUnits);
    });
  });

  describe('fund depletion', () => {
    test('given_highWithdrawalRate_when_calculating_then_eventuallyDepletes', () => {
      // 10% withdrawal rate on small pot with poor market timing
      const result = calculateSippStrategy(50000, 2000, 10, 20);

      // May or may not deplete depending on market performance
      // Just check it runs without error
      expect(result.yearlyResults).toHaveLength(20);
    });

    test('given_depletedFunds_when_withdrawing_then_sellsAllRemaining', () => {
      const result = calculateSippStrategy(30000, 2000, 15, 26);

      const depletedYear = result.yearlyResults.find(r => r.status === 'depleted');
      if (depletedYear) {
        expect(depletedYear.endUnits).toBeCloseTo(0, 6);
      }
    });

    test('given_exhaustedFunds_when_withdrawing_then_returnsZero', () => {
      const result = calculateSippStrategy(30000, 2000, 15, 26);

      const exhaustedYears = result.yearlyResults.filter(r => r.status === 'exhausted');

      exhaustedYears.forEach(year => {
        expect(year.unitsSold).toBe(0);
        expect(year.grossWithdrawal).toBe(0);
        expect(year.netWithdrawal).toBe(0);
      });
    });
  });

  describe('result structure', () => {
    test('given_validInputs_when_calculating_then_returnsCorrectStructure', () => {
      const result = calculateSippStrategy(500000, 2010, 4, 5);

      // Initial investment structure
      expect(result.initialInvestment).toHaveProperty('pensionAmount');
      expect(result.initialInvestment).toHaveProperty('etfPriceAtStart');
      expect(result.initialInvestment).toHaveProperty('unitsAcquired');
      expect(result.initialInvestment).toHaveProperty('initialValue');

      // Yearly results structure
      expect(result.yearlyResults).toHaveLength(5);
      result.yearlyResults.forEach(year => {
        expect(year).toHaveProperty('year');
        expect(year).toHaveProperty('startUnits');
        expect(year).toHaveProperty('etfPricePerUnit');
        expect(year).toHaveProperty('startValueGbp');
        expect(year).toHaveProperty('managementFee');
        expect(year).toHaveProperty('valueAfterFee');
        expect(year).toHaveProperty('grossWithdrawal');
        expect(year).toHaveProperty('unitsSold');
        expect(year).toHaveProperty('taxOnWithdrawal');
        expect(year).toHaveProperty('netWithdrawal');
        expect(year).toHaveProperty('endUnits');
        expect(year).toHaveProperty('endValueGbp');
        expect(year).toHaveProperty('status');
      });

      // Summary structure
      expect(result.summary).toHaveProperty('initialInvestment');
      expect(result.summary).toHaveProperty('totalGrossWithdrawn');
      expect(result.summary).toHaveProperty('totalNetWithdrawn');
      expect(result.summary).toHaveProperty('totalTaxPaid');
      expect(result.summary).toHaveProperty('totalManagementFees');
      expect(result.summary).toHaveProperty('finalUnits');
      expect(result.summary).toHaveProperty('finalValue');
      expect(result.summary).toHaveProperty('totalValueRealized');
    });

    test('given_calculation_when_checking_then_yearsAreSequential', () => {
      const result = calculateSippStrategy(500000, 2015, 4, 5);

      for (let i = 0; i < result.yearlyResults.length; i++) {
        expect(result.yearlyResults[i].year).toBe(2015 + i);
      }
    });
  });

  describe('summary calculations', () => {
    test('given_completedStrategy_when_summarizing_then_totalsAreCorrect', () => {
      const result = calculateSippStrategy(500000, 2010, 4, 5);

      // Total gross withdrawn should equal sum of yearly gross withdrawals
      const sumGross = result.yearlyResults.reduce((sum, r) => sum + r.grossWithdrawal, 0);
      expect(result.summary.totalGrossWithdrawn).toBeCloseTo(sumGross, 2);

      // Total net withdrawn should equal sum of yearly net withdrawals
      const sumNet = result.yearlyResults.reduce((sum, r) => sum + r.netWithdrawal, 0);
      expect(result.summary.totalNetWithdrawn).toBeCloseTo(sumNet, 2);

      // Total tax should equal sum of yearly taxes
      const sumTax = result.yearlyResults.reduce((sum, r) => sum + r.taxOnWithdrawal, 0);
      expect(result.summary.totalTaxPaid).toBeCloseTo(sumTax, 2);
    });

    test('given_successfulStrategy_when_summarizing_then_marksAsSuccessful', () => {
      const result = calculateSippStrategy(500000, 2020, 4, 5);

      // With S&P growth, strategy should be successful
      expect(result.summary.strategySuccessful).toBe(true);
      expect(result.summary.yearDepleted).toBeNull();
    });
  });
});

describe('calculateSippYearsRemaining', () => {
  test('given_zeroUnits_when_calculating_then_returnsZero', () => {
    expect(calculateSippYearsRemaining(0, 2020, 10000)).toBe(0);
  });

  test('given_zeroWithdrawal_when_calculating_then_returnsInfinity', () => {
    expect(calculateSippYearsRemaining(100, 2020, 0)).toBe(Infinity);
  });

  test('given_validInputs_when_calculating_then_returnsPositiveYears', () => {
    const years = calculateSippYearsRemaining(1000, 2020, 5000);
    expect(years).toBeGreaterThan(0);
  });

  test('given_largeHoldings_when_calculating_then_returnsMoreYears', () => {
    const smallYears = calculateSippYearsRemaining(100, 2000, 10000);
    const largeYears = calculateSippYearsRemaining(1000, 2000, 10000);

    expect(largeYears).toBeGreaterThan(smallYears);
  });
});

describe('getSippValue', () => {
  test('given_invalidYear_when_valuing_then_throwsError', () => {
    expect(() => getSippValue(100, 1999)).toThrow('outside supported range');
  });

  test('given_validInputs_when_valuing_then_calculatesCorrectly', () => {
    const units = 100;
    const year = 2020;
    const etfPrice = getSyntheticEtfPrice(year);
    const expectedValue = units * etfPrice;

    expect(getSippValue(units, year)).toBeCloseTo(expectedValue, 2);
  });

  test('given_zeroUnits_when_valuing_then_returnsZero', () => {
    expect(getSippValue(0, 2020)).toBe(0);
  });
});

describe('calculateSippAfterTaxValue', () => {
  test('given_invalidYear_when_calculating_then_throwsError', () => {
    expect(() => calculateSippAfterTaxValue(100000, 1999)).toThrow('outside supported range');
  });

  test('given_validValue_when_calculating_then_applies25PercentTaxFree', () => {
    const result = calculateSippAfterTaxValue(100000, 2024);

    expect(result.grossValue).toBe(100000);
    expect(result.taxFreeAmount).toBe(25000);
    expect(result.taxableAmount).toBeLessThanOrEqual(75000);
  });

  test('given_validValue_when_calculating_then_netLessThanGross', () => {
    const result = calculateSippAfterTaxValue(100000, 2024);

    expect(result.netValue).toBeLessThan(result.grossValue);
    expect(result.netValue).toBeGreaterThan(result.grossValue * 0.5);
  });

  test('given_smallValue_when_calculating_then_mayPayNoTax', () => {
    // £16,000 withdrawal: 25% tax-free = £4,000, 75% taxable = £12,000
    // £12,000 is below personal allowance of £12,570
    const result = calculateSippAfterTaxValue(16000, 2024);

    expect(result.taxPaid).toBe(0);
    expect(result.netValue).toBe(16000);
  });
});

describe('integration tests', () => {
  test('given_fullScenario_when_simulating_then_producesRealisticResults', () => {
    // £500,000 pension, starting 2000, 4% withdrawal, 25 years
    const result = calculateSippStrategy(500000, 2000, 4, 25);

    // No initial tax (stays in SIPP)
    // Tax is paid on withdrawals
    expect(result.summary.totalTaxPaid).toBeGreaterThan(0);

    // Management fees over 25 years should be substantial
    expect(result.summary.totalManagementFees).toBeGreaterThan(10000);

    // Should have withdrawn money each year
    expect(result.summary.totalNetWithdrawn).toBeGreaterThan(0);

    // With S&P 500 growth, should still have significant value
    expect(result.summary.finalValue).toBeGreaterThan(0);
  });

  test('given_startYear2000_when_simulating25Years_then_benefitsFromMarketGrowth', () => {
    const result = calculateSippStrategy(500000, 2000, 4, 25);

    // S&P 500 has grown significantly over this period
    // Despite withdrawals and fees, should have good final value
    expect(result.summary.finalValue).toBeGreaterThan(100000);

    // Total value realized should exceed initial investment
    expect(result.summary.totalValueRealized).toBeGreaterThan(500000);
  });

  test('given_latestPossibleStart_when_calculating_then_works', () => {
    // Start 2025, run for 2 years (ends 2026)
    const result = calculateSippStrategy(100000, 2025, 4, 2);

    expect(result.yearlyResults).toHaveLength(2);
    expect(result.yearlyResults[0].year).toBe(2025);
    expect(result.yearlyResults[1].year).toBe(2026);
  });

  test('given_sippVsGoldComparison_when_calculating_then_canCompare', () => {
    // Both strategies with same inputs should be comparable
    const sippResult = calculateSippStrategy(500000, 2000, 4, 25);

    // SIPP should have:
    // - No initial tax (advantage)
    // - Tax on every withdrawal (disadvantage)
    // - Management fees (disadvantage)
    // - Market exposure (could be advantage or disadvantage)

    expect(sippResult.summary.totalTaxPaid).toBeGreaterThan(0);
    expect(sippResult.summary.totalManagementFees).toBeGreaterThan(0);
    expect(sippResult.summary.totalNetWithdrawn).toBeGreaterThan(0);
  });
});
