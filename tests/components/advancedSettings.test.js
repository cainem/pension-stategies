/**
 * Advanced Settings Component Tests
 *
 * Tests for the configurable fee settings.
 * Note: UI rendering tests are skipped as they require jsdom environment.
 * The component is tested through integration with calculators.
 *
 * All tests follow the naming convention: given_[precondition]_when_[action]_then_[expectedResult]
 */

import { describe, test, expect } from 'vitest';
import { COSTS } from '../../src/config/defaults.js';
import { calculateGoldStrategy } from '../../src/calculators/goldStrategy.js';
import { calculateSippStrategy, INDEX_TYPES } from '../../src/calculators/sippStrategy.js';
import { calculateCombinedStrategy } from '../../src/calculators/combinedStrategy.js';
import { compareStrategies } from '../../src/calculators/comparisonEngine.js';

describe('configurable fees integration', () => {
  describe('default config values', () => {
    test('given_defaultCosts_when_checking_then_hasExpectedValues', () => {
      expect(COSTS.goldTransactionPercent).toBe(3);  // 3% realistic dealer cost
      expect(COSTS.goldStorageFeePercent).toBe(0);   // 0% assumes home storage
      expect(COSTS.sippManagementFeePercent).toBe(0.5);
    });
  });

  describe('goldStrategy with config', () => {
    test('given_lowerTransactionFee_when_calculating_then_moreFundsInvested', () => {
      const defaultResult = calculateGoldStrategy(100000, 2020, 4, 5);
      const customResult = calculateGoldStrategy(100000, 2020, 4, 5, {
        goldTransactionPercent: 1.0
      });

      // Lower transaction fee = more gold purchased
      expect(customResult.initialWithdrawal.goldOuncesPurchased)
        .toBeGreaterThan(defaultResult.initialWithdrawal.goldOuncesPurchased);
    });

    test('given_storageFeeSetting_when_calculating_then_appliesStorageCosts', () => {
      const defaultResult = calculateGoldStrategy(100000, 2020, 4, 5);
      const customResult = calculateGoldStrategy(100000, 2020, 4, 5, {
        goldStorageFeePercent: 0.5
      });

      // Default is 0%, custom has storage fees
      expect(defaultResult.summary.totalStorageFees).toBe(0);
      expect(customResult.summary.totalStorageFees).toBeGreaterThan(0);
    });

    test('given_zeroFees_when_calculating_then_noFeesApplied', () => {
      const result = calculateGoldStrategy(100000, 2020, 4, 5, {
        goldTransactionPercent: 0,
        goldStorageFeePercent: 0
      });

      expect(result.summary.totalTransactionCosts).toBe(0);
      expect(result.summary.totalStorageFees).toBe(0);
    });
  });

  describe('sippStrategy with config', () => {
    test('given_lowerManagementFee_when_calculating_then_lowerTotalFees', () => {
      const defaultResult = calculateSippStrategy(100000, 2020, 4, 5);
      const customResult = calculateSippStrategy(100000, 2020, 4, 5, INDEX_TYPES.SP500, {
        sippManagementFeePercent: 0.25
      });

      expect(customResult.summary.totalManagementFees)
        .toBeLessThan(defaultResult.summary.totalManagementFees);
    });

    test('given_higherManagementFee_when_calculating_then_lowerFinalValue', () => {
      const defaultResult = calculateSippStrategy(100000, 2020, 4, 5);
      const highFeeResult = calculateSippStrategy(100000, 2020, 4, 5, INDEX_TYPES.SP500, {
        sippManagementFeePercent: 1.0
      });

      expect(highFeeResult.summary.finalValue)
        .toBeLessThan(defaultResult.summary.finalValue);
    });

    test('given_zeroManagementFee_when_calculating_then_noFeesDeducted', () => {
      const result = calculateSippStrategy(100000, 2020, 4, 5, INDEX_TYPES.SP500, {
        sippManagementFeePercent: 0
      });

      expect(result.summary.totalManagementFees).toBe(0);
    });

    test('given_customFeeWithNasdaq_when_calculating_then_usesCustomFee', () => {
      const defaultResult = calculateSippStrategy(100000, 2000, 4, 5, INDEX_TYPES.NASDAQ100);
      const customResult = calculateSippStrategy(100000, 2000, 4, 5, INDEX_TYPES.NASDAQ100, {
        sippManagementFeePercent: 0.2
      });

      expect(customResult.summary.totalManagementFees)
        .toBeLessThan(defaultResult.summary.totalManagementFees);
    });
  });

  describe('combinedStrategy with config', () => {
    test('given_customGoldFees_when_calculating_then_affectsGoldHalf', () => {
      const defaultResult = calculateCombinedStrategy('gold-sp500', 100000, 2020, 4, 5);
      const customResult = calculateCombinedStrategy('gold-sp500', 100000, 2020, 4, 5, {
        goldTransactionPercent: 1.0
      });

      // Gold side should have lower transaction costs
      expect(customResult.strategyA.result.summary.totalTransactionCosts)
        .toBeLessThan(defaultResult.strategyA.result.summary.totalTransactionCosts);
    });

    test('given_customSippFees_when_calculating_then_affectsSippHalf', () => {
      const defaultResult = calculateCombinedStrategy('gold-sp500', 100000, 2020, 4, 5);
      const customResult = calculateCombinedStrategy('gold-sp500', 100000, 2020, 4, 5, {
        sippManagementFeePercent: 0.25
      });

      // SIPP side should have lower management fees
      expect(customResult.strategyB.result.summary.totalManagementFees)
        .toBeLessThan(defaultResult.strategyB.result.summary.totalManagementFees);
    });

    test('given_allCustomFees_when_calculating_then_totalFeesLower', () => {
      const defaultResult = calculateCombinedStrategy('gold-sp500', 100000, 2020, 4, 5);
      const customResult = calculateCombinedStrategy('gold-sp500', 100000, 2020, 4, 5, {
        goldTransactionPercent: 1.0,
        goldStorageFeePercent: 0.3,
        sippManagementFeePercent: 0.25
      });

      expect(customResult.summary.totalFees)
        .toBeLessThan(defaultResult.summary.totalFees);
    });

    test('given_sippOnlyCombination_when_customFees_then_bothSidesAffected', () => {
      const defaultResult = calculateCombinedStrategy('sp500-nasdaq100', 100000, 2000, 4, 5);
      const customResult = calculateCombinedStrategy('sp500-nasdaq100', 100000, 2000, 4, 5, {
        sippManagementFeePercent: 0.2
      });

      // Both SIPP sides should have lower fees
      expect(customResult.strategyA.result.summary.totalManagementFees)
        .toBeLessThan(defaultResult.strategyA.result.summary.totalManagementFees);
      expect(customResult.strategyB.result.summary.totalManagementFees)
        .toBeLessThan(defaultResult.strategyB.result.summary.totalManagementFees);
    });
  });

  describe('comparisonEngine with config', () => {
    test('given_customFees_when_comparing_then_bothStrategiesAffected', () => {
      const defaultComparison = compareStrategies(100000, 2020, 4, 5);
      const customComparison = compareStrategies(100000, 2020, 4, 5, {
        goldTransactionPercent: 1.0,
        sippManagementFeePercent: 0.25
      });

      // Gold strategy should have lower transaction costs
      expect(customComparison.gold.summary.totalTransactionCosts)
        .toBeLessThan(defaultComparison.gold.summary.totalTransactionCosts);

      // SIPP strategy should have lower management fees
      expect(customComparison.sipp.summary.totalManagementFees)
        .toBeLessThan(defaultComparison.sipp.summary.totalManagementFees);
    });

    test('given_emptyConfig_when_comparing_then_usesDefaults', () => {
      const noConfigResult = compareStrategies(100000, 2020, 4, 5);
      const emptyConfigResult = compareStrategies(100000, 2020, 4, 5, {});

      expect(emptyConfigResult.gold.summary.totalTransactionCosts)
        .toBe(noConfigResult.gold.summary.totalTransactionCosts);
      expect(emptyConfigResult.sipp.summary.totalManagementFees)
        .toBe(noConfigResult.sipp.summary.totalManagementFees);
    });

    test('given_partialConfig_when_comparing_then_usesDefaultsForMissing', () => {
      const defaultComparison = compareStrategies(100000, 2020, 4, 5);
      const partialConfigResult = compareStrategies(100000, 2020, 4, 5, {
        goldTransactionPercent: 1.0
        // sippManagementFeePercent not specified
      });

      // Gold should have custom fees
      expect(partialConfigResult.gold.summary.totalTransactionCosts)
        .toBeLessThan(defaultComparison.gold.summary.totalTransactionCosts);

      // SIPP should use default fees
      expect(partialConfigResult.sipp.summary.totalManagementFees)
        .toBe(defaultComparison.sipp.summary.totalManagementFees);
    });
  });

  describe('fee impact analysis', () => {
    test('given_doublingTransactionFee_when_calculating_then_transactionCostsDouble', () => {
      const normalFee = calculateGoldStrategy(100000, 2020, 4, 5, {
        goldTransactionPercent: 2
      });
      const doubleFee = calculateGoldStrategy(100000, 2020, 4, 5, {
        goldTransactionPercent: 4
      });

      // Transaction costs should approximately double
      const ratio = doubleFee.summary.totalTransactionCosts / normalFee.summary.totalTransactionCosts;
      expect(ratio).toBeCloseTo(2, 0);
    });

    test('given_extremeLowFees_when_calculating_then_producesReasonableResults', () => {
      const result = calculateGoldStrategy(100000, 2020, 4, 5, {
        goldTransactionPercent: 0.1,
        goldStorageFeePercent: 0.1
      });

      // Should still produce valid results
      expect(result.summary.totalWithdrawn).toBeGreaterThan(0);
      expect(result.summary.finalGoldValue).toBeGreaterThan(0);
    });

    test('given_extremeHighFees_when_calculating_then_significantlyReducesReturns', () => {
      const lowFeeResult = calculateSippStrategy(100000, 2020, 4, 5, INDEX_TYPES.SP500, {
        sippManagementFeePercent: 0.1
      });
      const highFeeResult = calculateSippStrategy(100000, 2020, 4, 5, INDEX_TYPES.SP500, {
        sippManagementFeePercent: 3.0
      });

      // High fees should significantly reduce final value
      expect(highFeeResult.summary.finalValue)
        .toBeLessThan(lowFeeResult.summary.finalValue * 0.9);
    });
  });
});

