/**
 * UK Consumer Price Index (CPI) Data
 * Source: Office for National Statistics (ONS) - Series D7BT
 *
 * This module provides historical UK inflation rates and a cumulative
 * price index for adjusting withdrawals to maintain purchasing power.
 *
 * Base: 1980 = 100.00
 */

// Annual CPI Inflation Rates (%)
export const ukInflationRates = {
  1980: 18.0, 1981: 11.9, 1982: 8.6, 1983: 4.6, 1984: 5.0,
  1985: 6.1, 1986: 3.4, 1987: 4.2, 1988: 4.9, 1989: 7.8,
  1990: 9.5, 1991: 5.9, 1992: 3.7, 1993: 1.6, 1994: 2.4,
  1995: 3.5, 1996: 2.4, 1997: 3.1, 1998: 3.4, 1999: 1.5,
  2000: 0.8, 2001: 1.2, 2002: 1.3, 2003: 1.4, 2004: 1.3,
  2005: 2.1, 2006: 2.3, 2007: 2.3, 2008: 3.6, 2009: 2.2,
  2010: 3.3, 2011: 4.5, 2012: 2.8, 2013: 2.6, 2014: 1.5,
  2015: 0.0, 2016: 0.7, 2017: 2.7, 2018: 2.5, 2019: 1.8,
  2020: 0.9, 2021: 2.6, 2022: 9.1, 2023: 7.3, 2024: 2.3,
  2025: 2.1, 2026: 2.0 // Estimated
};

/**
 * Cumulative CPI Index (1980 = 100.00)
 * Calculated as: Index[n] = Index[n-1] * (1 + Rate[n-1]/100)
 */
export const ukCpiIndex = {
  1980: 100.00,
  1981: 118.00,
  1982: 132.04,
  1983: 143.40,
  1984: 150.00,
  1985: 157.50,
  1986: 167.11,
  1987: 172.79,
  1988: 180.05,
  1989: 188.87,
  1990: 203.60,
  1991: 222.94,
  1992: 236.10,
  1993: 244.83,
  1994: 248.75,
  1995: 254.72,
  1996: 263.63,
  1997: 269.96,
  1998: 278.33,
  1999: 287.79,
  2000: 292.11,
  2001: 294.45,
  2002: 297.98,
  2003: 301.85,
  2004: 306.08,
  2005: 310.06,
  2006: 316.57,
  2007: 323.85,
  2008: 331.30,
  2009: 343.23,
  2010: 350.78,
  2011: 362.35,
  2012: 378.66,
  2013: 389.26,
  2014: 399.38,
  2015: 405.37,
  2016: 405.37,
  2017: 408.21,
  2018: 419.23,
  2019: 429.71,
  2020: 437.45,
  2021: 441.38,
  2022: 452.86,
  2023: 494.07,
  2024: 530.14,
  2025: 542.33,
  2026: 553.72
};

/**
 * Get the inflation multiplier between two years
 *
 * @param {number} startYear - The base year
 * @param {number} targetYear - The year to adjust it to
 * @returns {number} Multiplier (e.g., 1.5 for 50% increase)
 */
export function getInflationMultiplier(startYear, targetYear) {
  if (!ukCpiIndex[startYear] || !ukCpiIndex[targetYear]) {
    throw new Error(`Inflation data not available for years ${startYear} or ${targetYear}`);
  }
  return ukCpiIndex[targetYear] / ukCpiIndex[startYear];
}

/**
 * Adjust an amount from a start year to a target year's purchasing power
 *
 * @param {number} amount - Amount in startYear GBP
 * @param {number} startYear - The base year
 * @param {number} targetYear - The year to adjust it to
 * @returns {number} Adjusted amount
 */
export function adjustForInflation(amount, startYear, targetYear) {
  return amount * getInflationMultiplier(startYear, targetYear);
}

/**
 * Get annual inflation rate for a given year
 * @param {number} year - The year
 * @returns {number} Percentage rate (e.g., 2.5)
 */
export function getInflationRate(year) {
  if (ukInflationRates[year] === undefined) {
    throw new Error(`Inflation rate data not available for year ${year}`);
  }
  return ukInflationRates[year];
}

export default {
  ukInflationRates,
  ukCpiIndex,
  getInflationMultiplier,
  adjustForInflation,
  getInflationRate
};
