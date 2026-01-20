/**
 * Synthetic ETF Price Calculator
 *
 * Calculates what a GBP-denominated S&P 500 Total Return accumulating ETF
 * (like VUAG) would have been priced at before the fund existed (2019).
 *
 * This allows fair comparison of the SIPP strategy across the full date range.
 *
 * @module syntheticEtf
 */

import { getSP500TotalReturn } from '../data/sp500TotalReturn.js';
import { getExchangeRate } from '../data/exchangeRates.js';
import { isValidYear } from '../utils/validators.js';
import { YEAR_RANGE } from '../config/defaults.js';

/**
 * Base year for synthetic ETF calculation (when VUAG was launched)
 * VUAG launched in May 2019, so we use 2019 as our reference year
 */
export const BASE_YEAR = 2019;

/**
 * Reference price for the synthetic ETF at the base year (in GBP)
 * This is the actual VUAG price at the start of 2019 (approximately)
 * We'll normalize all calculations to this base
 */
export const BASE_PRICE_GBP = 44.30;

/**
 * Calculate synthetic ETF price for a given year
 *
 * Formula:
 * syntheticPriceGBP = (sp500TRIndex[year] / sp500TRIndex[baseYear])
 *                     * basePriceGBP
 *                     * (baseExchangeRate / exchangeRate[year])
 *
 * The formula accounts for:
 * 1. S&P 500 Total Return performance relative to base year
 * 2. GBP/USD exchange rate changes (since S&P 500 is in USD)
 *
 * @param {number} year - The year to calculate the price for
 * @returns {number} Synthetic ETF price in GBP
 * @throws {Error} If year is outside supported range (2000-2026)
 *
 * @example
 * // Get price for 2010
 * const price = getSyntheticEtfPrice(2010);
 * console.log(price); // ~20.35 GBP
 */
export function getSyntheticEtfPrice(year) {
  if (!isValidYear(year)) {
    throw new Error(`Year ${year} is outside supported range (${YEAR_RANGE.min}-${YEAR_RANGE.max})`);
  }

  const sp500Year = getSP500TotalReturn(year);
  const sp500Base = getSP500TotalReturn(BASE_YEAR);

  const exchangeRateYear = getExchangeRate(year);
  const exchangeRateBase = getExchangeRate(BASE_YEAR);

  // Calculate the synthetic price
  // Performance ratio × base price × currency adjustment
  const performanceRatio = sp500Year / sp500Base;
  const currencyAdjustment = exchangeRateBase / exchangeRateYear;

  const syntheticPrice = performanceRatio * BASE_PRICE_GBP * currencyAdjustment;

  return syntheticPrice;
}

/**
 * Calculate the number of ETF units that can be purchased with a given GBP amount
 *
 * @param {number} amountGbp - Amount in GBP to invest
 * @param {number} year - The year of purchase (for price lookup)
 * @returns {number} Number of ETF units (can be fractional)
 * @throws {Error} If year is outside supported range
 * @throws {Error} If amount is negative
 */
export function calculateUnits(amountGbp, year) {
  if (amountGbp < 0) {
    throw new Error('Amount must be non-negative');
  }

  if (amountGbp === 0) {
    return 0;
  }

  const pricePerUnit = getSyntheticEtfPrice(year);
  return amountGbp / pricePerUnit;
}

/**
 * Calculate the GBP value of a given number of ETF units at a specific year
 *
 * @param {number} units - Number of ETF units
 * @param {number} year - The year to value the units at
 * @returns {number} Value in GBP
 * @throws {Error} If year is outside supported range
 * @throws {Error} If units is negative
 */
export function calculateValue(units, year) {
  if (units < 0) {
    throw new Error('Units must be non-negative');
  }

  if (units === 0) {
    return 0;
  }

  const pricePerUnit = getSyntheticEtfPrice(year);
  return units * pricePerUnit;
}

/**
 * Calculate the return (as a multiplier) between two years
 *
 * @param {number} startYear - Starting year
 * @param {number} endYear - Ending year
 * @returns {number} Return multiplier (e.g., 1.5 = 50% gain)
 * @throws {Error} If either year is outside supported range
 *
 * @example
 * // Calculate return from 2010 to 2020
 * const returnMultiplier = calculateReturn(2010, 2020);
 * console.log(returnMultiplier); // ~2.82 (182% gain)
 */
export function calculateReturn(startYear, endYear) {
  const startPrice = getSyntheticEtfPrice(startYear);
  const endPrice = getSyntheticEtfPrice(endYear);

  return endPrice / startPrice;
}

/**
 * Calculate annualized return between two years
 *
 * @param {number} startYear - Starting year
 * @param {number} endYear - Ending year
 * @returns {number} Annualized return as decimal (e.g., 0.08 = 8% per year)
 * @throws {Error} If either year is outside supported range
 * @throws {Error} If startYear >= endYear
 */
export function calculateAnnualizedReturn(startYear, endYear) {
  if (startYear >= endYear) {
    throw new Error('End year must be after start year');
  }

  const years = endYear - startYear;
  const totalReturn = calculateReturn(startYear, endYear);

  // Annualized return = (totalReturn)^(1/years) - 1
  return Math.pow(totalReturn, 1 / years) - 1;
}

/**
 * Get all synthetic ETF prices for the available year range
 *
 * @returns {Object} Object mapping year to price
 */
export function getAllPrices() {
  const prices = {};

  for (let year = 2000; year <= 2026; year++) {
    prices[year] = getSyntheticEtfPrice(year);
  }

  return prices;
}

/**
 * Validate that synthetic prices are internally consistent
 * (useful for testing/debugging)
 *
 * @returns {boolean} True if prices are consistent
 */
export function validatePrices() {
  // The base year price should equal BASE_PRICE_GBP
  const baseYearPrice = getSyntheticEtfPrice(BASE_YEAR);
  return Math.abs(baseYearPrice - BASE_PRICE_GBP) < 0.01;
}

export default {
  getSyntheticEtfPrice,
  calculateUnits,
  calculateValue,
  calculateReturn,
  calculateAnnualizedReturn,
  getAllPrices,
  validatePrices,
  BASE_YEAR,
  BASE_PRICE_GBP
};
