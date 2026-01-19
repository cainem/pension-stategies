/**
 * Gold Strategy Calculator
 *
 * Simulates the strategy of withdrawing pension funds, paying income tax,
 * and buying physical gold. Annual withdrawals are funded by selling gold.
 *
 * Key characteristics:
 * - Initial pension withdrawal is taxed (25% tax-free PCLS, 75% taxable)
 * - Gold purchase incurs 2% transaction cost
 * - Annual withdrawals are funded by selling gold (2% transaction cost)
 * - Gold sales are CGT-exempt (UK sovereign coins or bullion)
 * - Uses January 1st gold prices for each year
 *
 * @module goldStrategy
 */

import { getGoldPrice } from '../data/goldPrices.js';
import { calculateIncomeTax } from './taxCalculator.js';
import { isValidYear, isValidAmount } from '../utils/validators.js';
import { COSTS } from '../config/defaults.js';

/**
 * Yearly result for gold strategy
 * @typedef {Object} GoldYearResult
 * @property {number} year - The year
 * @property {number} startGoldOunces - Gold ounces at start of year
 * @property {number} goldPricePerOunce - Gold price at start of year
 * @property {number} startValueGbp - Portfolio value at start of year
 * @property {number} withdrawalGross - Gross withdrawal amount
 * @property {number} goldSold - Ounces of gold sold for withdrawal
 * @property {number} transactionCost - Transaction cost for selling gold
 * @property {number} netWithdrawal - Net cash received after transaction cost
 * @property {number} endGoldOunces - Gold ounces at end of year
 * @property {number} endValueGbp - Portfolio value at end of year
 * @property {string} status - 'active', 'exhausted', or 'depleted'
 */

/**
 * Gold strategy result
 * @typedef {Object} GoldStrategyResult
 * @property {Object} initialWithdrawal - Details of initial pension withdrawal
 * @property {GoldYearResult[]} yearlyResults - Year-by-year breakdown
 * @property {Object} summary - Summary statistics
 */

/**
 * Calculate the gold strategy outcome
 *
 * @param {number} pensionAmount - Starting pension pot in GBP
 * @param {number} startYear - Year to start the strategy
 * @param {number} withdrawalRate - Annual withdrawal rate as percentage (e.g., 4 for 4%)
 * @param {number} years - Number of years to simulate
 * @returns {GoldStrategyResult} Complete strategy results
 * @throws {Error} If inputs are invalid
 *
 * @example
 * const result = calculateGoldStrategy(500000, 2000, 4, 25);
 * console.log(result.summary.totalWithdrawn);
 */
export function calculateGoldStrategy(pensionAmount, startYear, withdrawalRate, years) {
  // Validate inputs
  validateInputs(pensionAmount, startYear, withdrawalRate, years);

  // Step 1: Initial pension withdrawal and tax
  const initialWithdrawal = calculateInitialWithdrawal(pensionAmount, startYear);

  // Step 2: Buy gold with net proceeds
  const goldPurchase = calculateGoldPurchase(initialWithdrawal.netAmount, startYear);

  // Step 3: Calculate annual withdrawals
  const annualWithdrawalAmount = pensionAmount * (withdrawalRate / 100);
  const yearlyResults = calculateYearlyWithdrawals(
    goldPurchase.goldOunces,
    startYear,
    annualWithdrawalAmount,
    years
  );

  // Step 4: Calculate summary
  const summary = calculateSummary(
    pensionAmount,
    initialWithdrawal,
    goldPurchase,
    yearlyResults,
    annualWithdrawalAmount
  );

  return {
    initialWithdrawal: {
      grossPension: pensionAmount,
      taxCalculation: initialWithdrawal.taxResult,
      netAfterTax: initialWithdrawal.netAmount,
      goldPurchaseCost: goldPurchase.transactionCost,
      amountInvested: goldPurchase.netInvested,
      goldPriceAtPurchase: goldPurchase.pricePerOunce,
      goldOuncesPurchased: goldPurchase.goldOunces
    },
    yearlyResults,
    summary
  };
}

/**
 * Validate all inputs
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

  // Check if we have enough data years
  const endYear = startYear + years - 1;
  if (endYear > 2026) {
    throw new Error(`Not enough data: strategy ends in ${endYear}, but data only available until 2026`);
  }
}

/**
 * Calculate the initial pension withdrawal and tax
 */
function calculateInitialWithdrawal(pensionAmount, year) {
  const taxResult = calculateIncomeTax(pensionAmount, year, true);

  return {
    taxResult,
    netAmount: taxResult.netIncome
  };
}

/**
 * Calculate gold purchase with transaction costs
 */
function calculateGoldPurchase(amountGbp, year) {
  const pricePerOunce = getGoldPrice(year);
  const transactionCostRate = COSTS.goldTransactionPercent / 100;

  // Transaction cost is applied to the purchase
  const transactionCost = amountGbp * transactionCostRate;
  const netInvested = amountGbp - transactionCost;
  const goldOunces = netInvested / pricePerOunce;

  return {
    grossAmount: amountGbp,
    transactionCost,
    netInvested,
    pricePerOunce,
    goldOunces
  };
}

/**
 * Calculate year-by-year withdrawals from gold holdings
 */
function calculateYearlyWithdrawals(startingGoldOunces, startYear, annualWithdrawal, years) {
  const results = [];
  let currentGoldOunces = startingGoldOunces;
  const transactionCostRate = COSTS.goldTransactionPercent / 100;

  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    const goldPrice = getGoldPrice(year);
    const startValue = currentGoldOunces * goldPrice;

    // Determine status and withdrawal
    let status = 'active';
    let withdrawalGross = annualWithdrawal;
    let goldSold = 0;
    let transactionCost = 0;
    let netWithdrawal = 0;

    if (currentGoldOunces <= 0) {
      // Already exhausted
      status = 'exhausted';
      withdrawalGross = 0;
    } else {
      // Calculate how much gold to sell
      // We need to sell enough gold to cover both withdrawal and transaction cost
      // If we sell X ounces: X * price * (1 - txCost) = withdrawal
      // So: X = withdrawal / (price * (1 - txCost))
      const effectivePrice = goldPrice * (1 - transactionCostRate);
      const ouncesNeeded = annualWithdrawal / effectivePrice;

      if (ouncesNeeded >= currentGoldOunces) {
        // Not enough gold - sell everything
        status = 'depleted';
        goldSold = currentGoldOunces;
        const grossSaleValue = goldSold * goldPrice;
        transactionCost = grossSaleValue * transactionCostRate;
        netWithdrawal = grossSaleValue - transactionCost;
        withdrawalGross = netWithdrawal; // Actual withdrawal is what we get
        currentGoldOunces = 0;
      } else {
        // Enough gold - sell what we need
        goldSold = ouncesNeeded;
        const grossSaleValue = goldSold * goldPrice;
        transactionCost = grossSaleValue * transactionCostRate;
        netWithdrawal = grossSaleValue - transactionCost;
        currentGoldOunces -= goldSold;
      }
    }

    const endValue = currentGoldOunces * goldPrice;

    results.push({
      year,
      startGoldOunces: currentGoldOunces + goldSold,
      goldPricePerOunce: goldPrice,
      startValueGbp: startValue,
      withdrawalGross,
      goldSold,
      transactionCost,
      netWithdrawal,
      endGoldOunces: currentGoldOunces,
      endValueGbp: endValue,
      status
    });
  }

  return results;
}

/**
 * Calculate summary statistics
 */
function calculateSummary(pensionAmount, initialWithdrawal, goldPurchase, yearlyResults, targetWithdrawal) {
  const totalWithdrawn = yearlyResults.reduce((sum, r) => sum + r.netWithdrawal, 0);
  const totalTransactionCosts = goldPurchase.transactionCost +
    yearlyResults.reduce((sum, r) => sum + r.transactionCost, 0);

  const activeYears = yearlyResults.filter(r => r.status === 'active').length;
  const depletedYear = yearlyResults.find(r => r.status === 'depleted');
  const exhaustedYear = yearlyResults.find(r => r.status === 'exhausted');

  const lastResult = yearlyResults[yearlyResults.length - 1];
  const finalValue = lastResult.endValueGbp;
  const finalGoldOunces = lastResult.endGoldOunces;

  // Calculate total value received (withdrawals + remaining gold)
  const totalValueRealized = totalWithdrawn + finalValue;

  // Years where full withdrawal was achieved
  const fullWithdrawalYears = yearlyResults.filter(
    r => r.status === 'active' && Math.abs(r.netWithdrawal - targetWithdrawal) < 1
  ).length;

  return {
    initialInvestment: pensionAmount,
    taxPaidOnWithdrawal: initialWithdrawal.taxResult.taxPaid,
    netInvestedInGold: goldPurchase.netInvested,
    initialGoldOunces: goldPurchase.goldOunces,
    targetAnnualWithdrawal: targetWithdrawal,
    totalWithdrawn,
    totalTransactionCosts,
    finalGoldOunces,
    finalGoldValue: finalValue,
    totalValueRealized,
    activeYears,
    fullWithdrawalYears,
    yearDepleted: depletedYear ? depletedYear.year : null,
    yearExhausted: exhaustedYear ? exhaustedYear.year : null,
    strategySuccessful: lastResult.status === 'active'
  };
}

/**
 * Calculate how many years the gold holdings will last
 *
 * @param {number} goldOunces - Starting gold ounces
 * @param {number} startYear - Starting year
 * @param {number} annualWithdrawal - Annual withdrawal amount in GBP
 * @returns {number} Number of years until funds exhausted
 */
export function calculateGoldYearsRemaining(goldOunces, startYear, annualWithdrawal) {
  if (goldOunces <= 0) return 0;
  if (annualWithdrawal <= 0) return Infinity;

  let currentOunces = goldOunces;
  let years = 0;
  const maxYears = 2026 - startYear + 1;
  const transactionCostRate = COSTS.goldTransactionPercent / 100;

  for (let i = 0; i < maxYears && currentOunces > 0; i++) {
    const year = startYear + i;
    if (year > 2026) break;

    const goldPrice = getGoldPrice(year);
    const effectivePrice = goldPrice * (1 - transactionCostRate);
    const ouncesNeeded = annualWithdrawal / effectivePrice;

    if (ouncesNeeded >= currentOunces) {
      // Partial year - calculate fraction
      const fractionOfYear = currentOunces / ouncesNeeded;
      years += fractionOfYear;
      break;
    }

    currentOunces -= ouncesNeeded;
    years++;
  }

  return years;
}

/**
 * Get gold holdings value at a specific year
 *
 * @param {number} goldOunces - Number of gold ounces
 * @param {number} year - Year to value at
 * @returns {number} Value in GBP
 */
export function getGoldValue(goldOunces, year) {
  if (!isValidYear(year)) {
    throw new Error(`Year ${year} is outside supported range (2000-2026)`);
  }

  const price = getGoldPrice(year);
  return goldOunces * price;
}

export default {
  calculateGoldStrategy,
  calculateGoldYearsRemaining,
  getGoldValue
};
