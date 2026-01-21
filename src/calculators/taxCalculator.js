/**
 * UK Income Tax Calculator
 *
 * Calculates income tax based on historical UK tax rates and bands.
 * Supports pension withdrawals where 25% is tax-free (Pension Commencement Lump Sum).
 *
 * @module taxCalculator
 */

import { getTaxData } from '../data/ukTaxData.js';
import { isValidYear, isValidAmount } from '../utils/validators.js';
import { YEAR_RANGE } from '../config/defaults.js';

/**
 * Tax calculation result
 * @typedef {Object} TaxCalculationResult
 * @property {number} grossIncome - Original gross income
 * @property {number} taxFreeAmount - Amount that is tax-free
 * @property {number} taxableAmount - Amount subject to tax (after personal allowance)
 * @property {number} taxPaid - Total tax paid
 * @property {number} netIncome - Income after tax
 * @property {Object} breakdown - Detailed breakdown by tax band
 * @property {number} breakdown.personalAllowance - Personal allowance used
 * @property {number} breakdown.basicRateTax - Tax paid at basic rate
 * @property {number} breakdown.higherRateTax - Tax paid at higher rate
 * @property {number} breakdown.additionalRateTax - Tax paid at additional rate
 * @property {number} breakdown.basicRateAmount - Income taxed at basic rate
 * @property {number} breakdown.higherRateAmount - Income taxed at higher rate
 * @property {number} breakdown.additionalRateAmount - Income taxed at additional rate
 */

/**
 * Calculate UK income tax for a given income and tax year
 *
 * @param {number} grossIncome - Total gross income in GBP
 * @param {number} year - Tax year (e.g., 2000 for tax year 2000/01)
 * @param {boolean} [isPensionWithdrawal=false] - Whether this is a pension withdrawal (25% tax-free PCLS)
 * @returns {TaxCalculationResult} Breakdown of tax calculation
 * @throws {Error} If year is outside supported range (2000-2026)
 * @throws {Error} If grossIncome is negative
 *
 * @example
 * // Regular income
 * const result = calculateIncomeTax(50000, 2024);
 * console.log(result.taxPaid); // £7,486
 *
 * @example
 * // Pension withdrawal (25% tax-free)
 * const result = calculateIncomeTax(100000, 2024, true);
 * console.log(result.taxFreeAmount); // £25,000
 */
export function calculateIncomeTax(grossIncome, year, isPensionWithdrawal = false) {
  // Validate inputs
  if (!isValidYear(year)) {
    throw new Error(`Year ${year} is outside supported range (${YEAR_RANGE.min}-${YEAR_RANGE.max})`);
  }

  if (!isValidAmount(grossIncome)) {
    throw new Error('Gross income must be a non-negative number');
  }

  // Handle zero income
  if (grossIncome === 0) {
    return createZeroTaxResult(year);
  }

  // Get tax data for the year
  const taxData = getTaxData(year);

  // Calculate tax-free amount (25% for pension withdrawals, 0 otherwise)
  const taxFreeAmount = isPensionWithdrawal ? grossIncome * 0.25 : 0;

  // Income subject to tax rules (before personal allowance)
  const incomeForTax = grossIncome - taxFreeAmount;

  // Calculate personal allowance (may be reduced for high earners - not implemented for simplicity)
  const personalAllowance = Math.min(taxData.personalAllowance, incomeForTax);

  // Taxable income (after personal allowance)
  const taxableAmount = Math.max(0, incomeForTax - taxData.personalAllowance);

  // Calculate tax by band
  const breakdown = calculateTaxByBand(taxableAmount, taxData);

  // Total tax paid
  const taxPaid = breakdown.basicRateTax + breakdown.higherRateTax + breakdown.additionalRateTax;

  // Net income
  const netIncome = grossIncome - taxPaid;

  return {
    grossIncome,
    taxFreeAmount,
    taxableAmount,
    taxPaid,
    netIncome,
    breakdown: {
      personalAllowance,
      ...breakdown
    }
  };
}

/**
 * Calculate tax breakdown by band
 *
 * @param {number} taxableAmount - Income after personal allowance
 * @param {Object} taxData - Tax data for the year
 * @returns {Object} Tax breakdown by band
 */
function calculateTaxByBand(taxableAmount, taxData) {
  let remainingIncome = taxableAmount;

  // Basic rate band
  const basicRateAmount = Math.min(remainingIncome, taxData.basicRateLimit);
  const basicRateTax = basicRateAmount * taxData.basicRate;
  remainingIncome = Math.max(0, remainingIncome - taxData.basicRateLimit);

  // Higher rate band
  let higherRateAmount = 0;
  let higherRateTax = 0;

  if (remainingIncome > 0) {
    if (taxData.additionalRate !== null && taxData.additionalRateThreshold !== null) {
      // Calculate the higher rate band width
      // Higher rate applies from end of basic rate to additional rate threshold
      // The additional rate threshold is gross income, but we're working with taxable income
      // So we need to work out how much of the higher rate band we can use
      const higherRateBandWidth = taxData.additionalRateThreshold - taxData.personalAllowance - taxData.basicRateLimit;
      higherRateAmount = Math.min(remainingIncome, higherRateBandWidth);
      remainingIncome = Math.max(0, remainingIncome - higherRateBandWidth);
    } else {
      // No additional rate - all remaining income is at higher rate
      higherRateAmount = remainingIncome;
      remainingIncome = 0;
    }
    higherRateTax = higherRateAmount * taxData.higherRate;
  }

  // Additional rate band
  let additionalRateAmount = 0;
  let additionalRateTax = 0;

  if (remainingIncome > 0 && taxData.additionalRate !== null) {
    additionalRateAmount = remainingIncome;
    additionalRateTax = additionalRateAmount * taxData.additionalRate;
  }

  return {
    basicRateTax,
    higherRateTax,
    additionalRateTax,
    basicRateAmount,
    higherRateAmount,
    additionalRateAmount
  };
}

/**
 * Create a zero tax result
 *
 * @param {number} year - Tax year
 * @returns {TaxCalculationResult} Zero tax result
 */
function createZeroTaxResult(year) {
  // Validate the year but don't need the data
  getTaxData(year);

  return {
    grossIncome: 0,
    taxFreeAmount: 0,
    taxableAmount: 0,
    taxPaid: 0,
    netIncome: 0,
    breakdown: {
      personalAllowance: 0,
      basicRateTax: 0,
      higherRateTax: 0,
      additionalRateTax: 0,
      basicRateAmount: 0,
      higherRateAmount: 0,
      additionalRateAmount: 0
    }
  };
}

/**
 * Calculate effective tax rate
 *
 * @param {number} grossIncome - Total gross income
 * @param {number} taxPaid - Total tax paid
 * @returns {number} Effective tax rate as decimal (e.g., 0.25 for 25%)
 */
export function calculateEffectiveTaxRate(grossIncome, taxPaid) {
  if (grossIncome <= 0) {
    return 0;
  }
  return taxPaid / grossIncome;
}

/**
 * Calculate marginal tax rate for a given income level
 *
 * @param {number} grossIncome - Current gross income
 * @param {number} year - Tax year
 * @returns {number} Marginal tax rate as decimal
 */
export function getMarginalTaxRate(grossIncome, year) {
  if (!isValidYear(year)) {
    throw new Error(`Year ${year} is outside supported range (${YEAR_RANGE.min}-${YEAR_RANGE.max})`);
  }

  if (grossIncome <= 0) {
    return 0;
  }

  const taxData = getTaxData(year);
  const taxableIncome = Math.max(0, grossIncome - taxData.personalAllowance);

  if (taxableIncome === 0) {
    return 0;
  }

  if (taxableIncome <= taxData.basicRateLimit) {
    return taxData.basicRate;
  }

  if (taxData.additionalRate !== null && taxData.additionalRateThreshold !== null) {
    const higherRateLimit = taxData.additionalRateThreshold - taxData.personalAllowance;
    if (taxableIncome <= higherRateLimit) {
      return taxData.higherRate;
    }
    return taxData.additionalRate;
  }

  return taxData.higherRate;
}

/**
 * Get tax bands for a specific year
 *
 * @param {number} year - Tax year
 * @returns {Object[]} Array of tax bands with thresholds and rates
 */
export function getTaxBands(year) {
  if (!isValidYear(year)) {
    throw new Error(`Year ${year} is outside supported range (${YEAR_RANGE.min}-${YEAR_RANGE.max})`);
  }

  const taxData = getTaxData(year);
  const bands = [];

  // Personal allowance band (0% tax)
  bands.push({
    name: 'Personal Allowance',
    rate: 0,
    from: 0,
    to: taxData.personalAllowance
  });

  // Basic rate band
  bands.push({
    name: 'Basic Rate',
    rate: taxData.basicRate,
    from: taxData.personalAllowance,
    to: taxData.personalAllowance + taxData.basicRateLimit
  });

  // Higher rate band
  if (taxData.additionalRate !== null && taxData.additionalRateThreshold !== null) {
    bands.push({
      name: 'Higher Rate',
      rate: taxData.higherRate,
      from: taxData.personalAllowance + taxData.basicRateLimit,
      to: taxData.additionalRateThreshold
    });

    // Additional rate band
    bands.push({
      name: 'Additional Rate',
      rate: taxData.additionalRate,
      from: taxData.additionalRateThreshold,
      to: Infinity
    });
  } else {
    // No additional rate - higher rate extends to infinity
    bands.push({
      name: 'Higher Rate',
      rate: taxData.higherRate,
      from: taxData.personalAllowance + taxData.basicRateLimit,
      to: Infinity
    });
  }

  return bands;
}

export default {
  calculateIncomeTax,
  calculateEffectiveTaxRate,
  getMarginalTaxRate,
  getTaxBands
};
