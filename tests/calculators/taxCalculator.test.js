/**
 * Tax Calculator Tests
 *
 * Tests for UK income tax calculations across different tax years.
 * All tests follow the naming convention: given_[precondition]_when_[action]_then_[expectedResult]
 */

import { describe, test, expect } from 'vitest';
import {
  calculateIncomeTax,
  calculateEffectiveTaxRate,
  getMarginalTaxRate,
  getTaxBands
} from '../../src/calculators/taxCalculator.js';

describe('calculateIncomeTax', () => {
  describe('input validation', () => {
    test('given_yearOutsideRange_when_calculating_then_throwsError', () => {
      expect(() => calculateIncomeTax(50000, 1999)).toThrow('Year 1999 is outside supported range (2000-2026)');
      expect(() => calculateIncomeTax(50000, 2027)).toThrow('Year 2027 is outside supported range (2000-2026)');
    });

    test('given_negativeIncome_when_calculating_then_throwsError', () => {
      expect(() => calculateIncomeTax(-1000, 2024)).toThrow('Gross income must be a non-negative number');
    });

    test('given_nonNumericIncome_when_calculating_then_throwsError', () => {
      expect(() => calculateIncomeTax('50000', 2024)).toThrow('Gross income must be a non-negative number');
      expect(() => calculateIncomeTax(null, 2024)).toThrow('Gross income must be a non-negative number');
    });
  });

  describe('zero and minimal income', () => {
    test('given_zeroIncome_when_calculating_then_returnsZeroTax', () => {
      const result = calculateIncomeTax(0, 2024);

      expect(result.grossIncome).toBe(0);
      expect(result.taxFreeAmount).toBe(0);
      expect(result.taxableAmount).toBe(0);
      expect(result.taxPaid).toBe(0);
      expect(result.netIncome).toBe(0);
    });

    test('given_incomeBelowPersonalAllowance_when_calculating_then_returnsZeroTax', () => {
      // 2024 personal allowance is £12,570
      const result = calculateIncomeTax(10000, 2024);

      expect(result.grossIncome).toBe(10000);
      expect(result.taxableAmount).toBe(0);
      expect(result.taxPaid).toBe(0);
      expect(result.netIncome).toBe(10000);
      expect(result.breakdown.personalAllowance).toBe(10000);
    });

    test('given_incomeExactlyAtPersonalAllowance_when_calculating_then_returnsZeroTax', () => {
      const result = calculateIncomeTax(12570, 2024);

      expect(result.taxableAmount).toBe(0);
      expect(result.taxPaid).toBe(0);
      expect(result.netIncome).toBe(12570);
    });
  });

  describe('basic rate only (2024)', () => {
    test('given_incomeInBasicRateBand_when_calculating_then_appliesBasicRateOnly', () => {
      // £30,000 gross: £12,570 allowance, £17,430 taxable at 20%
      const result = calculateIncomeTax(30000, 2024);

      expect(result.grossIncome).toBe(30000);
      expect(result.taxableAmount).toBe(17430);
      expect(result.breakdown.basicRateAmount).toBe(17430);
      expect(result.breakdown.basicRateTax).toBe(3486);  // 17430 * 0.20
      expect(result.breakdown.higherRateAmount).toBe(0);
      expect(result.breakdown.higherRateTax).toBe(0);
      expect(result.taxPaid).toBe(3486);
      expect(result.netIncome).toBe(26514);
    });

    test('given_incomeAtTopOfBasicRate_when_calculating_then_appliesBasicRateOnly', () => {
      // £50,270 is the top of basic rate band (12570 + 37700)
      const result = calculateIncomeTax(50270, 2024);

      expect(result.taxableAmount).toBe(37700);
      expect(result.breakdown.basicRateAmount).toBe(37700);
      expect(result.breakdown.basicRateTax).toBe(7540);  // 37700 * 0.20
      expect(result.breakdown.higherRateAmount).toBe(0);
      expect(result.taxPaid).toBe(7540);
    });
  });

  describe('higher rate (2024)', () => {
    test('given_incomeInHigherRateBand_when_calculating_then_appliesHigherRate', () => {
      // £60,000 gross
      // £12,570 allowance
      // £37,700 at basic rate (20%) = £7,540
      // £9,730 at higher rate (40%) = £3,892
      const result = calculateIncomeTax(60000, 2024);

      expect(result.taxableAmount).toBe(47430);
      expect(result.breakdown.basicRateAmount).toBe(37700);
      expect(result.breakdown.basicRateTax).toBe(7540);
      expect(result.breakdown.higherRateAmount).toBe(9730);
      expect(result.breakdown.higherRateTax).toBe(3892);
      expect(result.taxPaid).toBe(11432);
      expect(result.netIncome).toBe(48568);
    });

    test('given_incomeAt100000_when_calculating_then_appliesCorrectTax', () => {
      // £100,000 gross
      // £12,570 allowance
      // £37,700 at basic rate (20%) = £7,540
      // £49,730 at higher rate (40%) = £19,892
      const result = calculateIncomeTax(100000, 2024);

      expect(result.breakdown.basicRateTax).toBe(7540);
      expect(result.breakdown.higherRateTax).toBe(19892);
      expect(result.breakdown.additionalRateTax).toBe(0);
      expect(result.taxPaid).toBe(27432);
      expect(result.netIncome).toBe(72568);
    });
  });

  describe('additional rate (2024)', () => {
    test('given_incomeAboveAdditionalThreshold_when_calculating_then_appliesAdditionalRate', () => {
      // £150,000 gross (2024 threshold is £125,140)
      // £12,570 allowance
      // £37,700 at basic rate (20%) = £7,540
      // £74,870 at higher rate (125140 - 12570 - 37700 = 74870) at 40% = £29,948
      // £24,860 at additional rate (150000 - 125140 = 24860) at 45% = £11,187
      const result = calculateIncomeTax(150000, 2024);

      expect(result.breakdown.basicRateTax).toBe(7540);
      expect(result.breakdown.higherRateTax).toBe(29948);
      expect(result.breakdown.additionalRateTax).toBe(11187);
      expect(result.taxPaid).toBe(48675);
      expect(result.netIncome).toBe(101325);
    });

    test('given_incomeExactlyAtAdditionalThreshold_when_calculating_then_noAdditionalRateTax', () => {
      // £125,140 is exactly at threshold (2024)
      const result = calculateIncomeTax(125140, 2024);

      expect(result.breakdown.additionalRateAmount).toBe(0);
      expect(result.breakdown.additionalRateTax).toBe(0);
    });
  });

  describe('historical tax rates - 22% basic rate era (2000-2007)', () => {
    test('given_income50000In2000_when_calculating_then_applies22PercentBasicRate', () => {
      // 2000: Personal allowance £4,385, basic rate 22%, basic rate limit £28,400
      // £50,000 gross
      // £4,385 allowance
      // £28,400 at basic rate (22%) = £6,248
      // £17,215 at higher rate (40%) = £6,886
      const result = calculateIncomeTax(50000, 2000);

      expect(result.breakdown.personalAllowance).toBe(4385);
      expect(result.breakdown.basicRateAmount).toBe(28400);
      expect(result.breakdown.basicRateTax).toBe(6248);
      expect(result.breakdown.higherRateAmount).toBe(17215);
      expect(result.breakdown.higherRateTax).toBe(6886);
      expect(result.taxPaid).toBe(13134);
    });

    test('given_income30000In2007_when_calculating_then_applies22PercentBasicRate', () => {
      // 2007: Personal allowance £5,225, basic rate 22%
      const result = calculateIncomeTax(30000, 2007);

      expect(result.breakdown.basicRateTax).toBeCloseTo(24775 * 0.22, 2);
    });
  });

  describe('historical tax rates - transition year 2008', () => {
    test('given_income30000In2008_when_calculating_then_applies20PercentBasicRate', () => {
      // 2008: Basic rate reduced to 20%
      // Personal allowance £5,435
      const result = calculateIncomeTax(30000, 2008);

      expect(result.breakdown.basicRateTax).toBeCloseTo(24565 * 0.20, 2);
    });
  });

  describe('historical tax rates - additional rate introduction (2010)', () => {
    test('given_income200000In2010_when_calculating_then_applies50PercentAdditionalRate', () => {
      // 2010: Additional rate 50% introduced at £150,000
      // Personal allowance £6,475, basic rate limit £37,400
      const result = calculateIncomeTax(200000, 2010);

      expect(result.breakdown.additionalRateAmount).toBe(50000);  // 200000 - 150000
      expect(result.breakdown.additionalRateTax).toBe(25000);     // 50000 * 0.50
    });

    test('given_income200000In2009_when_calculating_then_noAdditionalRate', () => {
      // 2009: No additional rate yet
      const result = calculateIncomeTax(200000, 2009);

      expect(result.breakdown.additionalRateTax).toBe(0);
      expect(result.breakdown.higherRateAmount).toBeGreaterThan(0);
    });
  });

  describe('historical tax rates - additional rate reduction (2013)', () => {
    test('given_income200000In2012_when_calculating_then_applies50PercentAdditionalRate', () => {
      const result = calculateIncomeTax(200000, 2012);
      expect(result.breakdown.additionalRateTax).toBe(50000 * 0.50);  // 50% rate
    });

    test('given_income200000In2013_when_calculating_then_applies45PercentAdditionalRate', () => {
      const result = calculateIncomeTax(200000, 2013);
      expect(result.breakdown.additionalRateTax).toBe(50000 * 0.45);  // 45% rate
    });
  });

  describe('pension withdrawal (25% tax-free)', () => {
    test('given_pensionWithdrawal_when_calculating_then_applies25PercentTaxFree', () => {
      // £100,000 pension withdrawal
      // 25% tax-free = £25,000
      // 75% taxable = £75,000
      const result = calculateIncomeTax(100000, 2024, true);

      expect(result.taxFreeAmount).toBe(25000);
      // Taxable portion: £75,000 - £12,570 = £62,430
      expect(result.taxableAmount).toBe(62430);
    });

    test('given_pensionWithdrawal100000_when_calculating_then_correctTaxPaid', () => {
      // £100,000 pension withdrawal
      // 25% tax-free = £25,000
      // 75% taxable = £75,000 (subject to tax rules)
      // After personal allowance: £75,000 - £12,570 = £62,430 taxable
      // Basic rate: £37,700 at 20% = £7,540
      // Higher rate: £24,730 at 40% = £9,892
      const result = calculateIncomeTax(100000, 2024, true);

      expect(result.breakdown.basicRateTax).toBe(7540);
      expect(result.breakdown.higherRateTax).toBe(9892);
      expect(result.taxPaid).toBe(17432);
      expect(result.netIncome).toBe(82568);
    });

    test('given_smallPensionWithdrawal_when_calculating_then_mayPayNoTax', () => {
      // £16,000 pension withdrawal
      // 25% tax-free = £4,000
      // 75% taxable = £12,000
      // After personal allowance: £12,000 - £12,570 = £0 taxable (below allowance)
      const result = calculateIncomeTax(16000, 2024, true);

      expect(result.taxFreeAmount).toBe(4000);
      expect(result.taxableAmount).toBe(0);
      expect(result.taxPaid).toBe(0);
      expect(result.netIncome).toBe(16000);
    });

    test('given_regularIncome_when_calculating_then_noTaxFreeAmount', () => {
      const result = calculateIncomeTax(50000, 2024, false);
      expect(result.taxFreeAmount).toBe(0);
    });
  });

  describe('result structure', () => {
    test('given_anyValidInput_when_calculating_then_returnsCompleteStructure', () => {
      const result = calculateIncomeTax(50000, 2024);

      expect(result).toHaveProperty('grossIncome');
      expect(result).toHaveProperty('taxFreeAmount');
      expect(result).toHaveProperty('taxableAmount');
      expect(result).toHaveProperty('taxPaid');
      expect(result).toHaveProperty('netIncome');
      expect(result).toHaveProperty('breakdown');
      expect(result.breakdown).toHaveProperty('personalAllowance');
      expect(result.breakdown).toHaveProperty('basicRateTax');
      expect(result.breakdown).toHaveProperty('higherRateTax');
      expect(result.breakdown).toHaveProperty('additionalRateTax');
      expect(result.breakdown).toHaveProperty('basicRateAmount');
      expect(result.breakdown).toHaveProperty('higherRateAmount');
      expect(result.breakdown).toHaveProperty('additionalRateAmount');
    });

    test('given_validIncome_when_calculating_then_netIncomeEqualsGrossMinusTax', () => {
      const result = calculateIncomeTax(75000, 2024);
      expect(result.netIncome).toBe(result.grossIncome - result.taxPaid);
    });

    test('given_validIncome_when_calculating_then_taxAmountsSumToTaxPaid', () => {
      const result = calculateIncomeTax(200000, 2024);
      const sumOfTaxes = result.breakdown.basicRateTax +
                         result.breakdown.higherRateTax +
                         result.breakdown.additionalRateTax;
      expect(sumOfTaxes).toBe(result.taxPaid);
    });
  });
});

describe('calculateEffectiveTaxRate', () => {
  test('given_zeroIncome_when_calculating_then_returnsZero', () => {
    expect(calculateEffectiveTaxRate(0, 0)).toBe(0);
  });

  test('given_negativeIncome_when_calculating_then_returnsZero', () => {
    expect(calculateEffectiveTaxRate(-1000, 0)).toBe(0);
  });

  test('given_validIncomeAndTax_when_calculating_then_returnsCorrectRate', () => {
    // £50,000 income, £10,000 tax = 20% effective rate
    expect(calculateEffectiveTaxRate(50000, 10000)).toBe(0.20);
  });

  test('given_incomeWithTaxResult_when_calculating_then_matchesExpected', () => {
    const result = calculateIncomeTax(100000, 2024);
    const effectiveRate = calculateEffectiveTaxRate(result.grossIncome, result.taxPaid);
    // Tax paid is £27,432 on £100,000 = 27.432%
    expect(effectiveRate).toBeCloseTo(0.27432, 4);
  });
});

describe('getMarginalTaxRate', () => {
  test('given_yearOutsideRange_when_gettingRate_then_throwsError', () => {
    expect(() => getMarginalTaxRate(50000, 1999)).toThrow('Year 1999 is outside supported range (2000-2026)');
  });

  test('given_zeroIncome_when_gettingRate_then_returnsZero', () => {
    expect(getMarginalTaxRate(0, 2024)).toBe(0);
  });

  test('given_incomeBelowPersonalAllowance_when_gettingRate_then_returnsZero', () => {
    expect(getMarginalTaxRate(10000, 2024)).toBe(0);
  });

  test('given_incomeInBasicRateBand_when_gettingRate_then_returnsBasicRate', () => {
    expect(getMarginalTaxRate(30000, 2024)).toBe(0.20);
    expect(getMarginalTaxRate(30000, 2000)).toBe(0.22);  // 22% in 2000
  });

  test('given_incomeInHigherRateBand_when_gettingRate_then_returnsHigherRate', () => {
    expect(getMarginalTaxRate(60000, 2024)).toBe(0.40);
  });

  test('given_incomeInAdditionalRateBand_when_gettingRate_then_returnsAdditionalRate', () => {
    expect(getMarginalTaxRate(150000, 2024)).toBe(0.45);
    expect(getMarginalTaxRate(200000, 2010)).toBe(0.50);  // 50% in 2010
  });

  test('given_highIncomePreAdditionalRate_when_gettingRate_then_returnsHigherRate', () => {
    // Before 2010, no additional rate existed
    expect(getMarginalTaxRate(200000, 2009)).toBe(0.40);
  });
});

describe('getTaxBands', () => {
  test('given_yearOutsideRange_when_gettingBands_then_throwsError', () => {
    expect(() => getTaxBands(1999)).toThrow('Year 1999 is outside supported range (2000-2026)');
  });

  test('given_year2024_when_gettingBands_then_returnsFourBands', () => {
    const bands = getTaxBands(2024);

    expect(bands).toHaveLength(4);
    expect(bands[0].name).toBe('Personal Allowance');
    expect(bands[1].name).toBe('Basic Rate');
    expect(bands[2].name).toBe('Higher Rate');
    expect(bands[3].name).toBe('Additional Rate');
  });

  test('given_year2009_when_gettingBands_then_returnsThreeBands', () => {
    // No additional rate in 2009
    const bands = getTaxBands(2009);

    expect(bands).toHaveLength(3);
    expect(bands[0].name).toBe('Personal Allowance');
    expect(bands[1].name).toBe('Basic Rate');
    expect(bands[2].name).toBe('Higher Rate');
  });

  test('given_year2024_when_gettingBands_then_hasCorrectThresholds', () => {
    const bands = getTaxBands(2024);

    expect(bands[0].from).toBe(0);
    expect(bands[0].to).toBe(12570);

    expect(bands[1].from).toBe(12570);
    expect(bands[1].to).toBe(50270);  // 12570 + 37700

    expect(bands[2].from).toBe(50270);
    expect(bands[2].to).toBe(125140);

    expect(bands[3].from).toBe(125140);
    expect(bands[3].to).toBe(Infinity);
  });

  test('given_year2000_when_gettingBands_then_hasCorrect22PercentBasicRate', () => {
    const bands = getTaxBands(2000);

    expect(bands[1].rate).toBe(0.22);
  });

  test('given_year2008_when_gettingBands_then_hasCorrect20PercentBasicRate', () => {
    const bands = getTaxBands(2008);

    expect(bands[1].rate).toBe(0.20);
  });
});
