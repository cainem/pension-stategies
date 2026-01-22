/**
 * S&P 500 Total Return Index Values
 * Source: S&P Dow Jones Indices, January 1st (or first trading day) each year
 *
 * The Total Return Index includes reinvested dividends, which is what an
 * accumulating ETF like VUAG would track.
 *
 * Base: Dec 31, 1987 = 247.08
 */

export const sp500TotalReturn = {
  // 1980s - Re-based to Jan 1988 = 247.08
  1980: 75.67,
  1981: 100.20,
  1982: 95.28,
  1983: 115.68,
  1984: 141.71,
  1985: 150.43,
  1986: 198.16,
  1987: 234.80,
  1988: 247.08,
  1989: 287.97,
  // 1990s
  1990: 378.63,
  1991: 366.62,
  1992: 478.63,
  1993: 515.34,
  1994: 566.82,
  1995: 574.24,
  1996: 789.18,
  1997: 970.30,
  1998: 1293.90,
  1999: 1663.69,
  // 2000s
  2000: 2013.73,
  2001: 1830.48,
  2002: 1613.02,
  2003: 1256.54,
  2004: 1617.05,
  2005: 1792.82,
  2006: 1880.85,
  2007: 2178.02,
  2008: 2297.59,
  2009: 1448.17,
  // 2010s
  2010: 1831.51,
  2011: 2107.33,
  2012: 2151.80,
  2013: 2496.08,
  2014: 3304.56,
  2015: 3756.96,
  2016: 3808.80,
  2017: 4264.34,
  2018: 5195.24,
  2019: 4967.69,
  // 2020s
  2020: 6532.02,
  2021: 7733.91,
  2022: 9954.31,
  2023: 8151.59,
  2024: 10294.64,
  2025: 12998.01,
  2026: 13907.87  // Estimated (7% growth from 2025)
};

/**
 * Get S&P 500 Total Return Index value for a specific year
 * @param {number} year - The year to get the value for
 * @returns {number} S&P 500 TR Index value
 * @throws {Error} If year is not in the dataset
 */
export function getSP500TotalReturn(year) {
  if (!(year in sp500TotalReturn)) {
    throw new Error(`S&P 500 Total Return data not available for year ${year}`);
  }
  return sp500TotalReturn[year];
}

/**
 * Get all available years
 * @returns {number[]} Array of years with data
 */
export function getAvailableYears() {
  return Object.keys(sp500TotalReturn).map(Number).sort((a, b) => a - b);
}

export default sp500TotalReturn;
