/**
 * GBP/USD Exchange Rates
 * Source: Bank of England, January 1st (or first trading day) each year
 *
 * Rate expressed as: 1 GBP = X USD
 */

export const exchangeRates = {
  2000: 1.6178,   // Jan 4, 2000
  2001: 1.4943,   // Jan 2, 2001
  2002: 1.4520,   // Jan 2, 2002
  2003: 1.6087,   // Jan 2, 2003
  2004: 1.7842,   // Jan 2, 2004
  2005: 1.9160,   // Jan 4, 2005
  2006: 1.7226,   // Jan 3, 2006
  2007: 1.9586,   // Jan 2, 2007
  2008: 1.9738,   // Jan 2, 2008
  2009: 1.4552,   // Jan 2, 2009
  2010: 1.6148,   // Jan 4, 2010
  2011: 1.5390,   // Jan 4, 2011
  2012: 1.5491,   // Jan 3, 2012
  2013: 1.6255,   // Jan 2, 2013
  2014: 1.6563,   // Jan 2, 2014
  2015: 1.5372,   // Jan 2, 2015
  2016: 1.4738,   // Jan 4, 2016
  2017: 1.2271,   // Jan 3, 2017 (post-Brexit vote)
  2018: 1.3518,   // Jan 2, 2018
  2019: 1.2755,   // Jan 2, 2019
  2020: 1.3253,   // Jan 2, 2020
  2021: 1.3673,   // Jan 4, 2021
  2022: 1.3531,   // Jan 4, 2022
  2023: 1.2063,   // Jan 3, 2023
  2024: 1.2732,   // Jan 2, 2024
  2025: 1.2518,   // Jan 2, 2025
  2026: 1.2385    // Jan 2, 2026 (estimated)
};

/**
 * Get GBP/USD exchange rate for a specific year
 * @param {number} year - The year to get the rate for
 * @returns {number} Exchange rate (1 GBP = X USD)
 * @throws {Error} If year is not in the dataset
 */
export function getExchangeRate(year) {
  if (!(year in exchangeRates)) {
    throw new Error(`Exchange rate data not available for year ${year}`);
  }
  return exchangeRates[year];
}

/**
 * Convert USD to GBP
 * @param {number} usd - Amount in USD
 * @param {number} year - Year for exchange rate
 * @returns {number} Amount in GBP
 */
export function usdToGbp(usd, year) {
  return usd / getExchangeRate(year);
}

/**
 * Convert GBP to USD
 * @param {number} gbp - Amount in GBP
 * @param {number} year - Year for exchange rate
 * @returns {number} Amount in USD
 */
export function gbpToUsd(gbp, year) {
  return gbp * getExchangeRate(year);
}

/**
 * Get all available years
 * @returns {number[]} Array of years with data
 */
export function getAvailableYears() {
  return Object.keys(exchangeRates).map(Number).sort((a, b) => a - b);
}

export default exchangeRates;
