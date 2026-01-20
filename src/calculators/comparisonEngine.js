/**
 * Comparison Engine
 *
 * Provides side-by-side comparison of Gold and SIPP pension strategies.
 * Combines results from both calculators into a unified comparison view.
 *
 * @module comparisonEngine
 */

import { calculateGoldStrategy } from './goldStrategy.js';
import { calculateSippStrategy, calculateSippAfterTaxValue } from './sippStrategy.js';
import { isValidYear, isValidAmount } from '../utils/validators.js';

/**
 * Year-by-year comparison result
 * @typedef {Object} YearComparison
 * @property {number} year - The year
 * @property {Object} gold - Gold strategy data for this year
 * @property {Object} sipp - SIPP strategy data for this year
 * @property {Object} difference - Calculated differences
 */

/**
 * Full comparison result
 * @typedef {Object} ComparisonResult
 * @property {Object} inputs - Original inputs
 * @property {Object} gold - Complete gold strategy result
 * @property {Object} sipp - Complete SIPP strategy result
 * @property {YearComparison[]} yearlyComparison - Year-by-year comparison
 * @property {Object} summary - Comparison summary with winner determination
 */

/**
 * Compare Gold and SIPP pension strategies
 *
 * @param {number} pensionAmount - Starting pension pot in GBP
 * @param {number} startYear - Year to start both strategies
 * @param {number} withdrawalRate - Annual withdrawal rate as percentage
 * @param {number} years - Number of years to simulate
 * @param {Object} [config={}] - Optional configuration overrides for fees
 * @param {number} [config.goldTransactionPercent] - Gold transaction cost percentage
 * @param {number} [config.goldStorageFeePercent] - Gold storage fee percentage
 * @param {number} [config.sippManagementFeePercent] - SIPP management fee percentage
 * @returns {ComparisonResult} Complete comparison of both strategies
 * @throws {Error} If inputs are invalid
 *
 * @example
 * const comparison = compareStrategies(500000, 2000, 4, 25);
 * console.log(comparison.summary.winner);
 *
 * // With custom fees
 * const customComparison = compareStrategies(500000, 2000, 4, 25, {
 *   goldTransactionPercent: 1.5,
 *   sippManagementFeePercent: 0.3
 * });
 */
export function compareStrategies(pensionAmount, startYear, withdrawalRate, years, config = {}) {
  // Validate inputs
  validateInputs(pensionAmount, startYear, withdrawalRate, years);

  // Run both strategies with config
  const goldResult = calculateGoldStrategy(pensionAmount, startYear, withdrawalRate, years, config);
  const sippResult = calculateSippStrategy(pensionAmount, startYear, withdrawalRate, years, undefined, config);

  // Build year-by-year comparison
  const yearlyComparison = buildYearlyComparison(goldResult, sippResult, years);

  // Calculate comparison summary
  const summary = calculateComparisonSummary(goldResult, sippResult, startYear, years);

  return {
    inputs: {
      pensionAmount,
      startYear,
      withdrawalRate,
      years,
      endYear: startYear + years - 1
    },
    gold: goldResult,
    sipp: sippResult,
    yearlyComparison,
    summary
  };
}

/**
 * Validate inputs for comparison
 */
function validateInputs(pensionAmount, startYear, withdrawalRate, years) {
  if (!isValidAmount(pensionAmount) || pensionAmount <= 0) {
    throw new Error('Pension amount must be a positive number');
  }

  if (!isValidYear(startYear)) {
    throw new Error(`Start year ${startYear} is outside supported range (2000-2026)`);
  }

  if (typeof withdrawalRate !== 'number' || withdrawalRate <= 0 || withdrawalRate > 100) {
    throw new Error('Withdrawal rate must be between 0 and 100');
  }

  if (typeof years !== 'number' || !Number.isInteger(years) || years < 1) {
    throw new Error('Years must be a positive integer');
  }

  const endYear = startYear + years - 1;
  if (endYear > 2026) {
    throw new Error(`Not enough data: comparison ends in ${endYear}, but data only available until 2026`);
  }
}

/**
 * Build year-by-year comparison data
 */
function buildYearlyComparison(goldResult, sippResult, years) {
  const comparison = [];

  for (let i = 0; i < years; i++) {
    const goldYear = goldResult.yearlyResults[i];
    const sippYear = sippResult.yearlyResults[i];

    comparison.push({
      year: goldYear.year,
      gold: {
        assetValue: goldYear.endValueGbp,
        grossWithdrawal: goldYear.withdrawalGross,
        netWithdrawal: goldYear.netWithdrawal,
        taxPaid: 0, // Gold sales are CGT-exempt
        transactionCosts: goldYear.transactionCost,
        status: goldYear.status
      },
      sipp: {
        assetValue: sippYear.endValueGbp,
        grossWithdrawal: sippYear.grossWithdrawal,
        netWithdrawal: sippYear.netWithdrawal,
        taxPaid: sippYear.taxOnWithdrawal,
        managementFee: sippYear.managementFee,
        status: sippYear.status
      },
      difference: {
        assetValue: goldYear.endValueGbp - sippYear.endValueGbp,
        netWithdrawal: goldYear.netWithdrawal - sippYear.netWithdrawal,
        goldLeadsBy: goldYear.endValueGbp - sippYear.endValueGbp
      }
    });
  }

  return comparison;
}

/**
 * Calculate comparison summary
 */
function calculateComparisonSummary(goldResult, sippResult, startYear, years) {
  const endYear = startYear + years - 1;

  // Calculate gold final value (already after-tax since gold sales are CGT-exempt)
  const goldFinalValue = goldResult.summary.finalGoldValue;
  const goldTotalNetWithdrawn = goldResult.summary.totalWithdrawn;
  const goldTotalValueRealized = goldFinalValue + goldTotalNetWithdrawn;

  // Calculate SIPP after-tax value (need to consider tax on remaining pot)
  const sippGrossValue = sippResult.summary.finalValue;
  const sippAfterTax = calculateSippAfterTaxValue(sippGrossValue, endYear);
  const sippFinalNetValue = sippAfterTax.netValue;
  const sippTotalNetWithdrawn = sippResult.summary.totalNetWithdrawn;
  const sippTotalValueRealized = sippFinalNetValue + sippTotalNetWithdrawn;

  // Determine winner
  const difference = goldTotalValueRealized - sippTotalValueRealized;
  const percentageDifference = (difference / sippTotalValueRealized) * 100;

  let winner;
  if (Math.abs(difference) < 100) {
    winner = 'tie';
  } else if (difference > 0) {
    winner = 'gold';
  } else {
    winner = 'sipp';
  }

  // Get initial tax from gold strategy (using initialWithdrawal structure)
  const goldInitialTaxPaid = goldResult.initialWithdrawal.taxCalculation.taxPaid;

  // Calculate gold gross withdrawn (sum of withdrawalGross from yearly results)
  const goldTotalGrossWithdrawn = goldResult.yearlyResults.reduce((sum, r) => sum + r.withdrawalGross, 0);

  // Calculate metrics
  const goldMetrics = {
    initialTaxPaid: goldInitialTaxPaid,
    totalTransactionCosts: goldResult.summary.totalTransactionCosts,
    totalWithdrawalTax: 0, // Gold sales are CGT-exempt
    totalCosts: goldInitialTaxPaid + goldResult.summary.totalTransactionCosts,
    totalGrossWithdrawn: goldTotalGrossWithdrawn,
    totalNetWithdrawn: goldTotalNetWithdrawn,
    finalAssetValue: goldFinalValue,
    finalAfterTaxValue: goldFinalValue, // Already after-tax
    totalValueRealized: goldTotalValueRealized,
    yearsWithFullWithdrawal: goldResult.yearlyResults.filter(y => y.status === 'active').length,
    yearDepleted: goldResult.summary.yearDepleted,
    strategySuccessful: goldResult.summary.strategySuccessful
  };

  const sippMetrics = {
    initialTaxPaid: 0, // No initial tax in SIPP
    totalManagementFees: sippResult.summary.totalManagementFees,
    totalWithdrawalTax: sippResult.summary.totalTaxPaid,
    totalCosts: sippResult.summary.totalManagementFees + sippResult.summary.totalTaxPaid,
    totalGrossWithdrawn: sippResult.summary.totalGrossWithdrawn,
    totalNetWithdrawn: sippTotalNetWithdrawn,
    finalAssetValue: sippGrossValue,
    finalAfterTaxValue: sippFinalNetValue,
    remainingTaxLiability: sippGrossValue - sippFinalNetValue,
    totalValueRealized: sippTotalValueRealized,
    yearsWithFullWithdrawal: sippResult.summary.fullWithdrawalYears,
    yearDepleted: sippResult.summary.yearDepleted,
    strategySuccessful: sippResult.summary.strategySuccessful
  };

  return {
    winner,
    difference: Math.abs(difference),
    percentageDifference: Math.abs(percentageDifference),
    winnerLeadsBy: winner === 'gold' ? difference : -difference,
    gold: goldMetrics,
    sipp: sippMetrics,
    comparison: {
      initialTaxDifference: goldMetrics.initialTaxPaid - sippMetrics.initialTaxPaid,
      totalCostsDifference: goldMetrics.totalCosts - sippMetrics.totalCosts,
      totalNetWithdrawnDifference: goldMetrics.totalNetWithdrawn - sippMetrics.totalNetWithdrawn,
      finalValueDifference: goldMetrics.finalAfterTaxValue - sippMetrics.finalAfterTaxValue,
      totalValueDifference: goldMetrics.totalValueRealized - sippMetrics.totalValueRealized
    }
  };
}

/**
 * Get a brief text summary of the comparison
 *
 * @param {ComparisonResult} comparison - The comparison result
 * @returns {string} Human-readable summary
 */
export function getComparisonSummaryText(comparison) {
  const { summary, inputs } = comparison;
  const { winner, difference, percentageDifference } = summary;

  const formatCurrency = (value) => `£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
  const formatPercent = (value) => `${value.toFixed(1)}%`;

  let winnerText;
  if (winner === 'tie') {
    winnerText = 'The strategies are essentially tied';
  } else if (winner === 'gold') {
    winnerText = `Gold strategy wins by ${formatCurrency(difference)} (${formatPercent(percentageDifference)})`;
  } else {
    winnerText = `SIPP strategy wins by ${formatCurrency(difference)} (${formatPercent(percentageDifference)})`;
  }

  return [
    `Comparison: ${formatCurrency(inputs.pensionAmount)} pension, ${inputs.startYear}-${inputs.endYear} (${inputs.years} years), ${inputs.withdrawalRate}% withdrawal`,
    '',
    `Result: ${winnerText}`,
    '',
    'Gold Strategy:',
    `  - Total value realized: ${formatCurrency(summary.gold.totalValueRealized)}`,
    `  - Net withdrawals: ${formatCurrency(summary.gold.totalNetWithdrawn)}`,
    `  - Final value: ${formatCurrency(summary.gold.finalAfterTaxValue)}`,
    `  - Total costs: ${formatCurrency(summary.gold.totalCosts)}`,
    '',
    'SIPP Strategy:',
    `  - Total value realized: ${formatCurrency(summary.sipp.totalValueRealized)}`,
    `  - Net withdrawals: ${formatCurrency(summary.sipp.totalNetWithdrawn)}`,
    `  - Final value (after tax): ${formatCurrency(summary.sipp.finalAfterTaxValue)}`,
    `  - Total costs (fees + tax): ${formatCurrency(summary.sipp.totalCosts)}`
  ].join('\n');
}

/**
 * Find the crossover point where one strategy overtakes the other
 *
 * @param {ComparisonResult} comparison - The comparison result
 * @returns {Object|null} Crossover information or null if no crossover
 */
export function findCrossoverPoint(comparison) {
  const { yearlyComparison } = comparison;

  if (yearlyComparison.length < 2) return null;

  let previousDifference = yearlyComparison[0].difference.goldLeadsBy;
  let crossoverYear = null;
  let crossoverDirection = null;

  for (let i = 1; i < yearlyComparison.length; i++) {
    const currentDifference = yearlyComparison[i].difference.goldLeadsBy;

    // Check if sign changed (crossover occurred)
    if (previousDifference > 0 && currentDifference <= 0) {
      crossoverYear = yearlyComparison[i].year;
      crossoverDirection = 'sipp_overtakes_gold';
      break;
    } else if (previousDifference <= 0 && currentDifference > 0) {
      crossoverYear = yearlyComparison[i].year;
      crossoverDirection = 'gold_overtakes_sipp';
      break;
    }

    previousDifference = currentDifference;
  }

  if (!crossoverYear) return null;

  return {
    year: crossoverYear,
    direction: crossoverDirection,
    yearsFromStart: crossoverYear - comparison.inputs.startYear
  };
}

/**
 * Calculate cumulative net withdrawals by year for both strategies
 *
 * @param {ComparisonResult} comparison - The comparison result
 * @returns {Array} Array of cumulative withdrawal data by year
 */
export function getCumulativeWithdrawals(comparison) {
  const { yearlyComparison } = comparison;

  let goldCumulative = 0;
  let sippCumulative = 0;

  return yearlyComparison.map(year => {
    goldCumulative += year.gold.netWithdrawal;
    sippCumulative += year.sipp.netWithdrawal;

    return {
      year: year.year,
      goldCumulative,
      sippCumulative,
      difference: goldCumulative - sippCumulative
    };
  });
}

/**
 * Get key insights from the comparison
 *
 * @param {ComparisonResult} comparison - The comparison result
 * @returns {string[]} Array of insight strings
 */
export function getKeyInsights(comparison) {
  const insights = [];
  const { summary, inputs } = comparison;

  // Initial tax impact
  if (summary.gold.initialTaxPaid > 0) {
    const taxPercent = (summary.gold.initialTaxPaid / inputs.pensionAmount) * 100;
    insights.push(`Gold strategy paid ${taxPercent.toFixed(1)}% initial tax (£${summary.gold.initialTaxPaid.toLocaleString()})`);
  }

  // SIPP ongoing costs
  insights.push(`SIPP incurred £${summary.sipp.totalManagementFees.toLocaleString()} in management fees over ${inputs.years} years`);

  // Tax comparison
  const goldTotalTax = summary.gold.initialTaxPaid;
  const sippTotalTax = summary.sipp.totalWithdrawalTax + summary.sipp.remainingTaxLiability;

  if (goldTotalTax < sippTotalTax) {
    insights.push(`Gold strategy paid £${(sippTotalTax - goldTotalTax).toLocaleString()} less in total tax`);
  } else if (sippTotalTax < goldTotalTax) {
    insights.push(`SIPP strategy paid £${(goldTotalTax - sippTotalTax).toLocaleString()} less in total tax`);
  }

  // Crossover point
  const crossover = findCrossoverPoint(comparison);
  if (crossover) {
    insights.push(`${crossover.direction === 'sipp_overtakes_gold' ? 'SIPP overtook Gold' : 'Gold overtook SIPP'} in ${crossover.year} (year ${crossover.yearsFromStart + 1})`);
  }

  // Depletion
  if (summary.gold.yearDepleted) {
    insights.push(`Gold strategy depleted in ${summary.gold.yearDepleted}`);
  }
  if (summary.sipp.yearDepleted) {
    insights.push(`SIPP strategy depleted in ${summary.sipp.yearDepleted}`);
  }

  // Winner
  if (summary.winner !== 'tie') {
    const winnerName = summary.winner === 'gold' ? 'Gold' : 'SIPP';
    insights.push(`${winnerName} strategy outperformed by ${summary.percentageDifference.toFixed(1)}% overall`);
  }

  return insights;
}

export default {
  compareStrategies,
  getComparisonSummaryText,
  findCrossoverPoint,
  getCumulativeWithdrawals,
  getKeyInsights
};
