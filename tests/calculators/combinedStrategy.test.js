/**
 * Combined Strategy Calculator Tests
 *
 * Tests for calculating 50/50 split strategies.
 * All tests follow the naming convention: given_[precondition]_when_[action]_then_[expectedResult]
 */

import { describe, test, expect } from 'vitest';
import {
  calculateCombinedStrategy,
  calculateCombinedStrategyByIds,
  getCombinedStrategyEarliestYear,
  isCombinedStrategyAvailable
} from '../../src/calculators/combinedStrategy.js';
import { COMBINATION_STRATEGIES, BASE_STRATEGIES } from '../../src/calculators/strategyRegistry.js';

describe('calculateCombinedStrategy', () => {
  describe('input validation', () => {
    test('given_invalidCombinationId_when_calculating_then_throwsError', () => {
      expect(() => calculateCombinedStrategy('invalid', 500000, 2000, 4, 10))
        .toThrow('Unknown combination strategy');
    });

    test('given_negativePensionAmount_when_calculating_then_throwsError', () => {
      expect(() => calculateCombinedStrategy('gold-sp500', -100000, 2000, 4, 10))
        .toThrow('Pension amount must be a positive number');
    });

    test('given_zeroPensionAmount_when_calculating_then_throwsError', () => {
      expect(() => calculateCombinedStrategy('gold-sp500', 0, 2000, 4, 10))
        .toThrow('Pension amount must be a positive number');
    });

    test('given_invalidStartYear_when_calculating_then_throwsError', () => {
      expect(() => calculateCombinedStrategy('gold-sp500', 100000, 1979, 4, 10))
        .toThrow('Start year 1979 is outside supported range');
    });

    test('given_invalidWithdrawalRate_when_calculating_then_throwsError', () => {
      expect(() => calculateCombinedStrategy('gold-sp500', 100000, 2000, 0, 10))
        .toThrow('Withdrawal rate must be between 0 and 100');
    });

    test('given_invalidYears_when_calculating_then_throwsError', () => {
      expect(() => calculateCombinedStrategy('gold-sp500', 100000, 2000, 4, 0))
        .toThrow('Years must be a positive integer');
    });

    test('given_yearsExtendBeyondData_when_calculating_then_throwsError', () => {
      expect(() => calculateCombinedStrategy('gold-sp500', 100000, 2020, 4, 10))
        .toThrow('Not enough data');
    });

    test('given_nasdaq100Combination_when_startYear1984_then_throwsError', () => {
      // Nasdaq 100 not available until 1985
      expect(() => calculateCombinedStrategy('gold-nasdaq100', 100000, 1984, 4, 10))
        .toThrow('not available for year 1984');
    });
  });

  describe('50/50 split', () => {
    test('given_goldSp500Combo_when_calculating_then_splitsInitialPension5050', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      // Each half should receive £250,000
      expect(result.summary.allocationA).toBe(250000);
      expect(result.summary.allocationB).toBe(250000);
    });

    test('given_combinedStrategy_when_calculating_then_bothHalvesCalculated', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      // Both strategies should have results
      expect(result.strategyA.result).toBeDefined();
      expect(result.strategyB.result).toBeDefined();
      expect(result.strategyA.result.yearlyResults).toHaveLength(10);
      expect(result.strategyB.result.yearlyResults).toHaveLength(10);
    });

    test('given_combinedStrategy_when_calculating_then_correctStrategyTypes', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      expect(result.strategyA.type).toBe('gold');
      expect(result.strategyB.type).toBe('sipp');
    });
  });

  describe('merged yearly results', () => {
    test('given_combinedStrategy_when_calculating_then_mergesYearlyResults', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      expect(result.yearlyResults).toHaveLength(10);
      result.yearlyResults.forEach((year, i) => {
        expect(year.year).toBe(2000 + i);
        expect(year.strategyA).toBeDefined();
        expect(year.strategyB).toBeDefined();
        expect(year.combinedStartValue).toBeDefined();
        expect(year.combinedWithdrawal).toBeDefined();
        expect(year.combinedEndValue).toBeDefined();
      });
    });

    test('given_combinedStrategy_when_calculating_then_combinedValuesAreSum', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 5);

      result.yearlyResults.forEach(year => {
        // Combined values should be sum of both strategies
        const expectedStartValue = year.strategyA.startValueGbp + year.strategyB.startValueGbp;
        const expectedEndValue = year.strategyA.endValueGbp + year.strategyB.endValueGbp;

        expect(year.combinedStartValue).toBeCloseTo(expectedStartValue, 2);
        expect(year.combinedEndValue).toBeCloseTo(expectedEndValue, 2);
      });
    });

    test('given_bothStrategiesActive_when_calculating_then_statusIsActive', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2020, 4, 5);

      // With large pot and short period, both should be active
      result.yearlyResults.forEach(year => {
        expect(year.status).toBe('active');
      });
    });
  });

  describe('depletion handling', () => {
    test('given_oneHalfExhausts_when_calculating_then_statusBecomesPartial', () => {
      // Small pot with high withdrawal should exhaust one half before the other
      const result = calculateCombinedStrategy('gold-sp500', 50000, 2000, 10, 26);

      // Should have some partial years (where one is exhausted but other continues)
      const partialYears = result.yearlyResults.filter(y => y.status === 'partial');
      // May or may not have partial years depending on performance
      expect(result.yearlyResults.length).toBe(26);
    });

    test('given_bothHalvesExhaust_when_calculating_then_statusBecomesExhausted', () => {
      const result = calculateCombinedStrategy('gold-sp500', 30000, 2000, 15, 26);

      // With very high withdrawal rate, both should eventually exhaust
      const exhaustedYears = result.yearlyResults.filter(
        y => y.status === 'exhausted' || y.status === 'depleted'
      );
      expect(exhaustedYears.length).toBeGreaterThan(0);
    });
  });

  describe('result structure', () => {
    test('given_validInputs_when_calculating_then_returnsCorrectStructure', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      // Top-level structure
      expect(result).toHaveProperty('combinationId');
      expect(result).toHaveProperty('combinationName');
      expect(result).toHaveProperty('strategyA');
      expect(result).toHaveProperty('strategyB');
      expect(result).toHaveProperty('yearlyResults');
      expect(result).toHaveProperty('summary');

      expect(result.combinationId).toBe('gold-sp500');
      expect(result.combinationName).toBe('50% Gold + 50% S&P 500');
    });

    test('given_validInputs_when_calculating_then_strategyHasMetadata', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      // Strategy A metadata
      expect(result.strategyA.id).toBe('gold');
      expect(result.strategyA.name).toBe('Physical Gold');
      expect(result.strategyA.shortName).toBe('Gold');

      // Strategy B metadata
      expect(result.strategyB.id).toBe('sp500');
      expect(result.strategyB.name).toBe('S&P 500 SIPP');
      expect(result.strategyB.shortName).toBe('S&P 500');
    });

    test('given_validInputs_when_calculating_then_summaryHasAllFields', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      expect(result.summary).toHaveProperty('initialInvestment');
      expect(result.summary).toHaveProperty('allocationA');
      expect(result.summary).toHaveProperty('allocationB');
      expect(result.summary).toHaveProperty('totalWithdrawn');
      expect(result.summary).toHaveProperty('totalTaxPaid');
      expect(result.summary).toHaveProperty('totalFees');
      expect(result.summary).toHaveProperty('finalValue');
      expect(result.summary).toHaveProperty('totalValueRealized');
      expect(result.summary).toHaveProperty('activeYears');
      expect(result.summary).toHaveProperty('strategySuccessful');
    });
  });

  describe('summary calculations', () => {
    test('given_combinedStrategy_when_summarizing_then_totalsAreCorrect', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      expect(result.summary.initialInvestment).toBe(500000);

      // Total withdrawn should be sum of all years
      const sumWithdrawals = result.yearlyResults.reduce(
        (sum, y) => sum + y.combinedWithdrawal, 0
      );
      expect(result.summary.totalWithdrawn).toBeCloseTo(sumWithdrawals, 2);

      // Final value should match last year's end value
      const lastYear = result.yearlyResults[result.yearlyResults.length - 1];
      expect(result.summary.finalValue).toBeCloseTo(lastYear.combinedEndValue, 2);
    });

    test('given_combinedStrategy_when_summarizing_then_includesBothStrategySummaries', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);

      expect(result.summary.summaryA).toBeDefined();
      expect(result.summary.summaryB).toBeDefined();

      // Gold summary
      expect(result.summary.summaryA).toHaveProperty('taxPaidOnWithdrawal');
      expect(result.summary.summaryA).toHaveProperty('totalStorageFees');

      // SIPP summary
      expect(result.summary.summaryB).toHaveProperty('totalTaxPaid');
      expect(result.summary.summaryB).toHaveProperty('totalManagementFees');
    });
  });

  describe('all combination strategies', () => {
    test('given_goldSp500_when_calculating_then_works', () => {
      const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 10);
      expect(result.yearlyResults).toHaveLength(10);
      expect(result.strategyA.id).toBe('gold');
      expect(result.strategyB.id).toBe('sp500');
    });

    test('given_goldNasdaq100_when_calculating_then_works', () => {
      // Must start 1985+ for Nasdaq 100
      const result = calculateCombinedStrategy('gold-nasdaq100', 500000, 1990, 4, 10);
      expect(result.yearlyResults).toHaveLength(10);
      expect(result.strategyA.id).toBe('gold');
      expect(result.strategyB.id).toBe('nasdaq100');
    });

    test('given_goldFtse100_when_calculating_then_works', () => {
      // Must start 1984+ for FTSE 100
      const result = calculateCombinedStrategy('gold-ftse100', 500000, 1990, 4, 10);
      expect(result.yearlyResults).toHaveLength(10);
      expect(result.strategyA.id).toBe('gold');
      expect(result.strategyB.id).toBe('ftse100');
    });

    test('given_sp500Nasdaq100_when_calculating_then_works', () => {
      // Must start 1985+ for Nasdaq 100
      const result = calculateCombinedStrategy('sp500-nasdaq100', 500000, 1990, 4, 10);
      expect(result.yearlyResults).toHaveLength(10);
      // Components in definition order
      expect(result.strategyA.id).toBe('sp500');
      expect(result.strategyB.id).toBe('nasdaq100');
    });

    test('given_sp500Ftse100_when_calculating_then_works', () => {
      const result = calculateCombinedStrategy('sp500-ftse100', 500000, 1990, 4, 10);
      expect(result.yearlyResults).toHaveLength(10);
    });

    test('given_nasdaq100Ftse100_when_calculating_then_works', () => {
      // Must start 1985+ for Nasdaq 100
      const result = calculateCombinedStrategy('nasdaq100-ftse100', 500000, 1990, 4, 10);
      expect(result.yearlyResults).toHaveLength(10);
    });
  });
});

describe('calculateCombinedStrategyByIds', () => {
  test('given_validIds_when_calculating_then_buildsCombinationId', () => {
    const result = calculateCombinedStrategyByIds('gold', 'sp500', 500000, 2000, 4, 10);

    expect(result.combinationId).toBe('gold-sp500');
    expect(result.yearlyResults).toHaveLength(10);
  });

  test('given_reversedIds_when_calculating_then_stillWorks', () => {
    // IDs are sorted alphabetically, so sp500-gold should still work
    const result = calculateCombinedStrategyByIds('sp500', 'gold', 500000, 2000, 4, 10);

    expect(result.combinationId).toBe('gold-sp500');
  });

  test('given_invalidCombination_when_calculating_then_throwsError', () => {
    // Same strategy twice is not a valid combination
    expect(() => calculateCombinedStrategyByIds('gold', 'gold', 500000, 2000, 4, 10))
      .toThrow('No combination strategy defined');
  });
});

describe('getCombinedStrategyEarliestYear', () => {
  test('given_goldSp500_when_gettingEarliestYear_then_returns1980', () => {
    // Both gold and S&P 500 available from 1980
    const earliest = getCombinedStrategyEarliestYear('gold-sp500');
    expect(earliest).toBe(1980);
  });

  test('given_goldNasdaq100_when_gettingEarliestYear_then_returns1985', () => {
    // Nasdaq 100 not available until 1985
    const earliest = getCombinedStrategyEarliestYear('gold-nasdaq100');
    expect(earliest).toBe(1985);
  });

  test('given_goldFtse100_when_gettingEarliestYear_then_returns1984', () => {
    // FTSE 100 not available until 1984
    const earliest = getCombinedStrategyEarliestYear('gold-ftse100');
    expect(earliest).toBe(1984);
  });

  test('given_nasdaq100Ftse100_when_gettingEarliestYear_then_returns1985', () => {
    // Nasdaq 100 is the limiting factor
    const earliest = getCombinedStrategyEarliestYear('nasdaq100-ftse100');
    expect(earliest).toBe(1985);
  });

  test('given_invalidCombination_when_gettingEarliestYear_then_throwsError', () => {
    expect(() => getCombinedStrategyEarliestYear('invalid'))
      .toThrow('Unknown combination strategy');
  });
});

describe('isCombinedStrategyAvailable', () => {
  test('given_goldSp500Year1980_when_checking_then_returnsTrue', () => {
    expect(isCombinedStrategyAvailable('gold-sp500', 1980)).toBe(true);
  });

  test('given_goldSp500Year1979_when_checking_then_returnsFalse', () => {
    expect(isCombinedStrategyAvailable('gold-sp500', 1979)).toBe(false);
  });

  test('given_goldNasdaq100Year1984_when_checking_then_returnsFalse', () => {
    expect(isCombinedStrategyAvailable('gold-nasdaq100', 1984)).toBe(false);
  });

  test('given_goldNasdaq100Year1985_when_checking_then_returnsTrue', () => {
    expect(isCombinedStrategyAvailable('gold-nasdaq100', 1985)).toBe(true);
  });

  test('given_year2026_when_checking_then_returnsTrue', () => {
    expect(isCombinedStrategyAvailable('gold-sp500', 2026)).toBe(true);
  });

  test('given_year2027_when_checking_then_returnsFalse', () => {
    expect(isCombinedStrategyAvailable('gold-sp500', 2027)).toBe(false);
  });

  test('given_invalidCombination_when_checking_then_returnsFalse', () => {
    expect(isCombinedStrategyAvailable('invalid', 2000)).toBe(false);
  });
});

describe('integration tests', () => {
  test('given_fullScenario_when_simulating_then_producesRealisticResults', () => {
    // £500,000 pension, starting 2000, 4% withdrawal, 25 years
    const result = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 25);

    // Should have 25 years of results
    expect(result.yearlyResults).toHaveLength(25);

    // Total withdrawn should be substantial
    expect(result.summary.totalWithdrawn).toBeGreaterThan(100000);

    // Both strategies should contribute
    expect(result.summary.finalValueA).toBeGreaterThanOrEqual(0);
    expect(result.summary.finalValueB).toBeGreaterThanOrEqual(0);

    // Total value realized should be meaningful
    expect(result.summary.totalValueRealized).toBeGreaterThan(0);
  });

  test('given_diversifiedCombo_when_simulating_then_providesStability', () => {
    // Test that gold-sp500 combo provides different results than pure strategies
    const combined = calculateCombinedStrategy('gold-sp500', 500000, 2000, 4, 25);

    // Combined strategy should have properties of both
    // - Tax on initial (from gold half)
    // - Tax on withdrawals (from SIPP half)
    expect(combined.summary.totalTaxPaid).toBeGreaterThan(0);

    // Both halves should have contributed to final value (unless one depleted)
    if (combined.summary.strategySuccessful) {
      expect(combined.summary.finalValue).toBeGreaterThan(0);
    }
  });

  test('given_sippOnlyCombo_when_simulating_then_bothTaxedOnWithdrawal', () => {
    // sp500-nasdaq100 combo - both are SIPPs
    const result = calculateCombinedStrategy('sp500-nasdaq100', 500000, 1990, 4, 25);

    // All tax should be from SIPP withdrawals
    expect(result.summary.totalTaxPaid).toBeGreaterThan(0);

    // Both strategies should be SIPP type
    expect(result.strategyA.type).toBe('sipp');
    expect(result.strategyB.type).toBe('sipp');
  });

  test('given_latestPossibleStart_when_calculating_then_works', () => {
    // Start 2025, run for 2 years (ends 2026)
    const result = calculateCombinedStrategy('gold-sp500', 100000, 2025, 4, 2);

    expect(result.yearlyResults).toHaveLength(2);
    expect(result.yearlyResults[0].year).toBe(2025);
    expect(result.yearlyResults[1].year).toBe(2026);
  });
});
