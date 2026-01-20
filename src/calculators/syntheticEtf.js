/**
 * Synthetic ETF Price Calculator
 *
 * Calculates what GBP-denominated Total Return accumulating ETFs
 * would have been priced at before the funds existed.
 *
 * Supports multiple indices:
 * - S&P 500 (VUAG equivalent) - USD, requires currency conversion
 * - Nasdaq 100 (EQQQ/CNDX equivalent) - USD, requires currency conversion
 * - FTSE 100 (VUKE equivalent) - GBP, no currency conversion needed
 *
 * This allows fair comparison of SIPP strategies across the full date range.
 *
 * @module syntheticEtf
 */

import { getSP500TotalReturn } from '../data/sp500TotalReturn.js';
import { getNasdaq100TotalReturn, hasDataForYear as hasNasdaq100Data } from '../data/nasdaq100TotalReturn.js';
import { getFTSE100TotalReturn, hasDataForYear as hasFTSE100Data } from '../data/ftse100TotalReturn.js';
import { getGoldPrice } from '../data/goldPrices.js';
import { getExchangeRate } from '../data/exchangeRates.js';
import { isValidYear } from '../utils/validators.js';
import { YEAR_RANGE } from '../config/defaults.js';

/**
 * Supported index types
 */
export const INDEX_TYPES = {
  SP500: 'sp500',
  NASDAQ100: 'nasdaq100',
  FTSE100: 'ftse100',
  GOLD_ETF: 'goldEtf'
};

/**
 * Index configurations
 * Each index has its own base year and reference price
 */
export const INDEX_CONFIG = {
  [INDEX_TYPES.SP500]: {
    name: 'S&P 500',
    baseYear: 2019,
    basePriceGbp: 44.30,  // VUAG approximate price at start of 2019
    currency: 'USD',
    requiresCurrencyConversion: true,
    getIndexValue: getSP500TotalReturn,
    earliestYear: 1980
  },
  [INDEX_TYPES.NASDAQ100]: {
    name: 'Nasdaq 100',
    baseYear: 2019,
    basePriceGbp: 150.00,  // EQQQ/CNDX approximate price at start of 2019
    currency: 'USD',
    requiresCurrencyConversion: true,
    getIndexValue: getNasdaq100TotalReturn,
    earliestYear: 1985
  },
  [INDEX_TYPES.FTSE100]: {
    name: 'FTSE 100',
    baseYear: 2019,
    basePriceGbp: 55.00,  // VUKE approximate price at start of 2019
    currency: 'GBP',
    requiresCurrencyConversion: false,
    getIndexValue: getFTSE100TotalReturn,
    earliestYear: 1984
  },
  [INDEX_TYPES.GOLD_ETF]: {
    name: 'Gold ETF',
    baseYear: 2019,
    basePriceGbp: 99.70,  // iShares Physical Gold ETC (SGLN) approximate price at start of 2019
    currency: 'GBP',
    requiresCurrencyConversion: false,  // Gold prices already in GBP
    getIndexValue: getGoldPrice,
    earliestYear: 1980
  }
};

/**
 * Legacy exports for backward compatibility
 */
export const BASE_YEAR = INDEX_CONFIG[INDEX_TYPES.SP500].baseYear;
export const BASE_PRICE_GBP = INDEX_CONFIG[INDEX_TYPES.SP500].basePriceGbp;

/**
 * Calculate synthetic ETF price for a given index and year
 *
 * Formula for USD indices (S&P 500, Nasdaq 100):
 * syntheticPriceGBP = (indexValue[year] / indexValue[baseYear])
 *                     * basePriceGBP
 *                     * (baseExchangeRate / exchangeRate[year])
 *
 * Formula for GBP indices (FTSE 100):
 * syntheticPriceGBP = (indexValue[year] / indexValue[baseYear])
 *                     * basePriceGBP
 *
 * @param {number} year - The year to calculate the price for
 * @param {string} [indexType='sp500'] - The index type (sp500, nasdaq100, ftse100)
 * @returns {number} Synthetic ETF price in GBP
 * @throws {Error} If year is outside supported range or index not available for year
 *
 * @example
 * // Get S&P 500 ETF price for 2010
 * const price = getSyntheticPrice(2010, 'sp500');
 *
 * // Get FTSE 100 ETF price for 2010
 * const ftsePrice = getSyntheticPrice(2010, 'ftse100');
 */
export function getSyntheticPrice(year, indexType = INDEX_TYPES.SP500) {
  const config = INDEX_CONFIG[indexType];
  
  if (!config) {
    throw new Error(`Unknown index type: ${indexType}. Valid types: ${Object.keys(INDEX_CONFIG).join(', ')}`);
  }

  if (!isValidYear(year)) {
    throw new Error(`Year ${year} is outside supported range (${YEAR_RANGE.min}-${YEAR_RANGE.max})`);
  }

  if (year < config.earliestYear) {
    throw new Error(`${config.name} data not available for year ${year}. Earliest available: ${config.earliestYear}`);
  }

  const indexValueYear = config.getIndexValue(year);
  const indexValueBase = config.getIndexValue(config.baseYear);

  // Calculate performance ratio
  const performanceRatio = indexValueYear / indexValueBase;

  let syntheticPrice;

  if (config.requiresCurrencyConversion) {
    // USD indices need currency conversion
    const exchangeRateYear = getExchangeRate(year);
    const exchangeRateBase = getExchangeRate(config.baseYear);
    const currencyAdjustment = exchangeRateBase / exchangeRateYear;
    syntheticPrice = performanceRatio * config.basePriceGbp * currencyAdjustment;
  } else {
    // GBP indices (FTSE 100) - no currency conversion needed
    syntheticPrice = performanceRatio * config.basePriceGbp;
  }

  return syntheticPrice;
}

/**
 * Legacy function for backward compatibility
 * Calculate synthetic ETF price for S&P 500 (default behavior)
 *
 * @param {number} year - The year to calculate the price for
 * @returns {number} Synthetic ETF price in GBP
 * @throws {Error} If year is outside supported range (1980-2026)
 *
 * @example
 * // Get price for 2010
 * const price = getSyntheticEtfPrice(2010);
 * console.log(price); // ~15.30 GBP
 */
export function getSyntheticEtfPrice(year) {
  return getSyntheticPrice(year, INDEX_TYPES.SP500);
}

/**
 * Calculate the number of ETF units that can be purchased with a given GBP amount
 *
 * @param {number} amountGbp - Amount in GBP to invest
 * @param {number} year - The year of purchase (for price lookup)
 * @param {string} [indexType='sp500'] - The index type
 * @returns {number} Number of ETF units (can be fractional)
 * @throws {Error} If year is outside supported range
 * @throws {Error} If amount is negative
 */
export function calculateUnits(amountGbp, year, indexType = INDEX_TYPES.SP500) {
  if (amountGbp < 0) {
    throw new Error('Amount must be non-negative');
  }

  if (amountGbp === 0) {
    return 0;
  }

  const pricePerUnit = getSyntheticPrice(year, indexType);
  return amountGbp / pricePerUnit;
}

/**
 * Calculate the GBP value of a given number of ETF units at a specific year
 *
 * @param {number} units - Number of ETF units
 * @param {number} year - The year to value the units at
 * @param {string} [indexType='sp500'] - The index type
 * @returns {number} Value in GBP
 * @throws {Error} If year is outside supported range
 * @throws {Error} If units is negative
 */
export function calculateValue(units, year, indexType = INDEX_TYPES.SP500) {
  if (units < 0) {
    throw new Error('Units must be non-negative');
  }

  if (units === 0) {
    return 0;
  }

  const pricePerUnit = getSyntheticPrice(year, indexType);
  return units * pricePerUnit;
}

/**
 * Calculate the return (as a multiplier) between two years for a given index
 *
 * @param {number} startYear - Starting year
 * @param {number} endYear - Ending year
 * @param {string} [indexType='sp500'] - The index type
 * @returns {number} Return multiplier (e.g., 1.5 = 50% gain)
 * @throws {Error} If either year is outside supported range
 *
 * @example
 * // Calculate S&P 500 return from 2010 to 2020
 * const returnMultiplier = calculateReturn(2010, 2020, 'sp500');
 * console.log(returnMultiplier); // ~2.82 (182% gain)
 */
export function calculateReturn(startYear, endYear, indexType = INDEX_TYPES.SP500) {
  const startPrice = getSyntheticPrice(startYear, indexType);
  const endPrice = getSyntheticPrice(endYear, indexType);

  return endPrice / startPrice;
}

/**
 * Calculate annualized return between two years for a given index
 *
 * @param {number} startYear - Starting year
 * @param {number} endYear - Ending year
 * @param {string} [indexType='sp500'] - The index type
 * @returns {number} Annualized return as decimal (e.g., 0.08 = 8% per year)
 * @throws {Error} If either year is outside supported range
 * @throws {Error} If startYear >= endYear
 */
export function calculateAnnualizedReturn(startYear, endYear, indexType = INDEX_TYPES.SP500) {
  if (startYear >= endYear) {
    throw new Error('End year must be after start year');
  }

  const years = endYear - startYear;
  const totalReturn = calculateReturn(startYear, endYear, indexType);

  // Annualized return = (totalReturn)^(1/years) - 1
  return Math.pow(totalReturn, 1 / years) - 1;
}

/**
 * Get all synthetic ETF prices for a given index across its available year range
 *
 * @param {string} [indexType='sp500'] - The index type
 * @returns {Object} Object mapping year to price
 */
export function getAllPrices(indexType = INDEX_TYPES.SP500) {
  const config = INDEX_CONFIG[indexType];
  if (!config) {
    throw new Error(`Unknown index type: ${indexType}`);
  }

  const prices = {};
  const startYear = Math.max(config.earliestYear, YEAR_RANGE.min);
  const endYear = YEAR_RANGE.max;

  for (let year = startYear; year <= endYear; year++) {
    prices[year] = getSyntheticPrice(year, indexType);
  }

  return prices;
}

/**
 * Validate that synthetic prices are internally consistent for an index
 * (useful for testing/debugging)
 *
 * @param {string} [indexType='sp500'] - The index type
 * @returns {boolean} True if prices are consistent
 */
export function validatePrices(indexType = INDEX_TYPES.SP500) {
  const config = INDEX_CONFIG[indexType];
  if (!config) {
    return false;
  }

  // The base year price should equal basePriceGbp
  const baseYearPrice = getSyntheticPrice(config.baseYear, indexType);
  return Math.abs(baseYearPrice - config.basePriceGbp) < 0.01;
}

/**
 * Check if data is available for a given index and year
 *
 * @param {string} indexType - The index type
 * @param {number} year - The year to check
 * @returns {boolean} True if data is available
 */
export function isDataAvailable(indexType, year) {
  const config = INDEX_CONFIG[indexType];
  if (!config) {
    return false;
  }

  if (!isValidYear(year)) {
    return false;
  }

  return year >= config.earliestYear;
}

/**
 * Get the earliest available year for an index
 *
 * @param {string} indexType - The index type
 * @returns {number} Earliest year with data
 */
export function getEarliestYear(indexType) {
  const config = INDEX_CONFIG[indexType];
  if (!config) {
    throw new Error(`Unknown index type: ${indexType}`);
  }
  return config.earliestYear;
}

/**
 * Get configuration for an index
 *
 * @param {string} indexType - The index type
 * @returns {Object} Index configuration
 */
export function getIndexConfig(indexType) {
  const config = INDEX_CONFIG[indexType];
  if (!config) {
    throw new Error(`Unknown index type: ${indexType}`);
  }
  return { ...config };  // Return copy to prevent mutation
}

export default {
  // Core functions
  getSyntheticPrice,
  getSyntheticEtfPrice,  // Legacy
  calculateUnits,
  calculateValue,
  calculateReturn,
  calculateAnnualizedReturn,
  getAllPrices,
  validatePrices,
  
  // Utility functions
  isDataAvailable,
  getEarliestYear,
  getIndexConfig,
  
  // Constants
  INDEX_TYPES,
  INDEX_CONFIG,
  BASE_YEAR,
  BASE_PRICE_GBP
};
