/**
 * UK Income Tax Data by Tax Year
 * Source: HMRC, legislation.gov.uk
 *
 * Tax years run from 6 April to 5 April the following year.
 * For simplicity, we use the calendar year that contains most of the tax year.
 * e.g., 2000 represents tax year 2000/01 (6 April 2000 - 5 April 2001)
 *
 * Key historical changes:
 * - 2008: Basic rate reduced from 22% to 20%
 * - 2010: Additional rate (50%) introduced for income over £150,000
 * - 2013: Additional rate reduced to 45%
 * - 2010-2017: Personal allowance increased significantly
 * - 2023: Additional rate threshold reduced to £125,140
 */

export const ukTaxData = {
  2000: {
    personalAllowance: 4385,
    basicRate: 0.22,
    basicRateLimit: 28400,      // Taxable income up to this amount at basic rate
    higherRate: 0.40,
    higherRateLimit: null,      // No upper limit (no additional rate yet)
    additionalRate: null,
    additionalRateThreshold: null
  },
  2001: {
    personalAllowance: 4535,
    basicRate: 0.22,
    basicRateLimit: 29400,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2002: {
    personalAllowance: 4615,
    basicRate: 0.22,
    basicRateLimit: 29900,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2003: {
    personalAllowance: 4615,
    basicRate: 0.22,
    basicRateLimit: 30500,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2004: {
    personalAllowance: 4745,
    basicRate: 0.22,
    basicRateLimit: 31400,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2005: {
    personalAllowance: 4895,
    basicRate: 0.22,
    basicRateLimit: 32400,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2006: {
    personalAllowance: 5035,
    basicRate: 0.22,
    basicRateLimit: 33300,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2007: {
    personalAllowance: 5225,
    basicRate: 0.22,
    basicRateLimit: 34600,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2008: {
    // Basic rate reduced from 22% to 20%
    personalAllowance: 5435,
    basicRate: 0.20,
    basicRateLimit: 36000,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2009: {
    personalAllowance: 6475,
    basicRate: 0.20,
    basicRateLimit: 37400,
    higherRate: 0.40,
    higherRateLimit: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  2010: {
    // Additional rate introduced at 50%
    personalAllowance: 6475,
    basicRate: 0.20,
    basicRateLimit: 37400,
    higherRate: 0.40,
    higherRateLimit: 150000,    // Higher rate up to £150,000
    additionalRate: 0.50,
    additionalRateThreshold: 150000
  },
  2011: {
    personalAllowance: 7475,
    basicRate: 0.20,
    basicRateLimit: 35000,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.50,
    additionalRateThreshold: 150000
  },
  2012: {
    personalAllowance: 8105,
    basicRate: 0.20,
    basicRateLimit: 34370,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.50,
    additionalRateThreshold: 150000
  },
  2013: {
    // Additional rate reduced to 45%
    personalAllowance: 9440,
    basicRate: 0.20,
    basicRateLimit: 32010,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2014: {
    personalAllowance: 10000,
    basicRate: 0.20,
    basicRateLimit: 31865,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2015: {
    personalAllowance: 10600,
    basicRate: 0.20,
    basicRateLimit: 31785,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2016: {
    personalAllowance: 11000,
    basicRate: 0.20,
    basicRateLimit: 32000,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2017: {
    personalAllowance: 11500,
    basicRate: 0.20,
    basicRateLimit: 33500,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2018: {
    personalAllowance: 11850,
    basicRate: 0.20,
    basicRateLimit: 34500,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2019: {
    personalAllowance: 12500,
    basicRate: 0.20,
    basicRateLimit: 37500,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2020: {
    personalAllowance: 12500,
    basicRate: 0.20,
    basicRateLimit: 37500,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2021: {
    personalAllowance: 12570,
    basicRate: 0.20,
    basicRateLimit: 37700,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2022: {
    personalAllowance: 12570,
    basicRate: 0.20,
    basicRateLimit: 37700,
    higherRate: 0.40,
    higherRateLimit: 150000,
    additionalRate: 0.45,
    additionalRateThreshold: 150000
  },
  2023: {
    // Additional rate threshold reduced to £125,140
    personalAllowance: 12570,
    basicRate: 0.20,
    basicRateLimit: 37700,
    higherRate: 0.40,
    higherRateLimit: 125140,
    additionalRate: 0.45,
    additionalRateThreshold: 125140
  },
  2024: {
    personalAllowance: 12570,
    basicRate: 0.20,
    basicRateLimit: 37700,
    higherRate: 0.40,
    higherRateLimit: 125140,
    additionalRate: 0.45,
    additionalRateThreshold: 125140
  },
  2025: {
    personalAllowance: 12570,
    basicRate: 0.20,
    basicRateLimit: 37700,
    higherRate: 0.40,
    higherRateLimit: 125140,
    additionalRate: 0.45,
    additionalRateThreshold: 125140
  },
  2026: {
    // Frozen allowances continue
    personalAllowance: 12570,
    basicRate: 0.20,
    basicRateLimit: 37700,
    higherRate: 0.40,
    higherRateLimit: 125140,
    additionalRate: 0.45,
    additionalRateThreshold: 125140
  }
};

/**
 * Get tax data for a specific year
 * @param {number} year - The year to get tax data for
 * @returns {Object} Tax data for the year
 * @throws {Error} If year is not in the dataset
 */
export function getTaxData(year) {
  if (!(year in ukTaxData)) {
    throw new Error(`UK tax data not available for year ${year}`);
  }
  return ukTaxData[year];
}

/**
 * Get personal allowance for a specific year
 * @param {number} year - The year
 * @returns {number} Personal allowance amount
 */
export function getPersonalAllowance(year) {
  return getTaxData(year).personalAllowance;
}

/**
 * Check if additional rate exists for a year
 * @param {number} year - The year
 * @returns {boolean} True if additional rate applies
 */
export function hasAdditionalRate(year) {
  const data = getTaxData(year);
  return data.additionalRate !== null;
}

/**
 * Get all available years
 * @returns {number[]} Array of years with data
 */
export function getAvailableYears() {
  return Object.keys(ukTaxData).map(Number).sort((a, b) => a - b);
}

export default ukTaxData;
