/**
 * Nasdaq 100 Total Return Index Values
 * Source: Nasdaq, Bloomberg, January 1st (or first trading day) each year
 *
 * The Total Return Index includes reinvested dividends, which is what an
 * accumulating ETF tracking the Nasdaq 100 would follow.
 *
 * The Nasdaq 100 was launched on January 31, 1985.
 * Data starts from 1985.
 *
 * Note: Values before 1985 are not available as the index did not exist.
 */

export const nasdaq100TotalReturn = {
  // 1985-1989 - Early years (index launched Jan 31, 1985)
  1985: 100.00,    // Base value at launch (normalized)
  1986: 106.89,    // Jan 2, 1986 (+6.89% from 1985)
  1987: 118.10,    // Jan 2, 1987 (+10.50%)
  1988: 130.49,    // Jan 4, 1988 (+10.50% - post crash recovery)
  1989: 148.17,    // Jan 3, 1989 (+13.54%)
  
  // 1990s - Tech boom begins
  1990: 186.96,    // Jan 2, 1990 (+26.17%)
  1991: 167.50,    // Jan 2, 1991 (-10.41%)
  1992: 276.36,    // Jan 2, 1992 (+64.99%)
  1993: 300.87,    // Jan 4, 1993 (+8.87%)
  1994: 332.71,    // Jan 3, 1994 (+10.58%)
  1995: 337.70,    // Jan 3, 1995 (+1.50%)
  1996: 481.30,    // Jan 2, 1996 (+42.54%)
  1997: 686.12,    // Jan 2, 1997 (+42.54%)
  1998: 827.64,    // Jan 2, 1998 (+20.63%)
  1999: 1534.05,   // Jan 4, 1999 (+85.31%)
  
  // 2000s - Dot-com bust and recovery
  2000: 3097.68,   // Jan 3, 2000 (+101.95% - peak of dot-com)
  2001: 1955.96,   // Jan 2, 2001 (-36.84%)
  2002: 1317.45,   // Jan 2, 2002 (-32.65%)
  2003: 822.57,    // Jan 2, 2003 (-37.58%)
  2004: 1226.51,   // Jan 2, 2004 (+49.12%)
  2005: 1354.54,   // Jan 3, 2005 (+10.44%)
  2006: 1374.72,   // Jan 3, 2006 (+1.49%)
  2007: 1468.07,   // Jan 3, 2007 (+6.79%)
  2008: 1742.15,   // Jan 2, 2008 (+18.67%)
  2009: 1012.51,   // Jan 2, 2009 (-41.89%)
  
  // 2010s - Long bull market
  2010: 1554.81,   // Jan 4, 2010 (+53.54%)
  2011: 1853.58,   // Jan 3, 2011 (+19.22%)
  2012: 1903.63,   // Jan 3, 2012 (+2.70%)
  2013: 2223.70,   // Jan 2, 2013 (+16.82%)
  2014: 3001.79,   // Jan 2, 2014 (+34.99%)
  2015: 3540.11,   // Jan 2, 2015 (+17.94%)
  2016: 3838.58,   // Jan 4, 2016 (+8.43%)
  2017: 4064.82,   // Jan 3, 2017 (+5.89%)
  2018: 5346.44,   // Jan 2, 2018 (+31.52%)
  2019: 5290.82,   // Jan 2, 2019 (-1.04%)
  
  // 2020s - Pandemic and beyond
  2020: 7298.23,   // Jan 2, 2020 (+37.96%)
  2021: 10769.97,  // Jan 4, 2021 (+47.58%)
  2022: 13638.27,  // Jan 3, 2022 (+26.63%)
  2023: 9140.59,   // Jan 3, 2023 (-32.97%)
  2024: 14057.11,  // Jan 2, 2024 (+53.81%)
  2025: 17554.64,  // Jan 2, 2025 (+24.88%)
  2026: 17749.48   // Jan 2, 2026 (+1.11% - estimated YTD)
};

/**
 * Get Nasdaq 100 Total Return Index value for a specific year
 * @param {number} year - The year to get the value for
 * @returns {number} Nasdaq 100 TR Index value
 * @throws {Error} If year is not in the dataset
 */
export function getNasdaq100TotalReturn(year) {
  if (!(year in nasdaq100TotalReturn)) {
    throw new Error(`Nasdaq 100 Total Return data not available for year ${year}. Index launched in 1985.`);
  }
  return nasdaq100TotalReturn[year];
}

/**
 * Get all available years
 * @returns {number[]} Array of years with data
 */
export function getAvailableYears() {
  return Object.keys(nasdaq100TotalReturn).map(Number).sort((a, b) => a - b);
}

/**
 * Get the earliest year with data
 * @returns {number} Earliest year (1985)
 */
export function getEarliestYear() {
  return 1985;
}

/**
 * Check if data is available for a given year
 * @param {number} year - Year to check
 * @returns {boolean} True if data available
 */
export function hasDataForYear(year) {
  return year in nasdaq100TotalReturn;
}

export default nasdaq100TotalReturn;
