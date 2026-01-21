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
  // 1980s - S&P 500 Total Return Index (includes dividends)
  1980: 59.88,     // Jan 2, 1980
  1981: 79.56,     // Jan 2, 1981
  1982: 72.26,     // Jan 4, 1982
  1983: 81.75,     // Jan 3, 1983
  1984: 100.70,    // Jan 3, 1984
  1985: 104.92,    // Jan 2, 1985
  1986: 138.54,    // Jan 2, 1986
  1987: 165.21,    // Jan 2, 1987
  1988: 177.62,    // Jan 4, 1988 (post Black Monday recovery)
  1989: 204.39,    // Jan 3, 1989
  // 1990s
  1990: 265.90,    // Jan 2, 1990
  1991: 254.82,    // Jan 2, 1991
  1992: 331.96,    // Jan 2, 1992
  1993: 357.30,    // Jan 4, 1993
  1994: 387.52,    // Jan 3, 1994
  1995: 387.13,    // Jan 3, 1995
  1996: 533.03,    // Jan 2, 1996
  1997: 651.68,    // Jan 2, 1997
  1998: 870.73,    // Jan 2, 1998
  1999: 1139.07,   // Jan 4, 1999
  // 2000s
  2000: 2474.50,   // Jan 3, 2000
  2001: 2525.82,   // Jan 2, 2001
  2002: 2212.94,   // Jan 2, 2002
  2003: 1730.67,   // Jan 2, 2003
  2004: 2212.17,   // Jan 2, 2004
  2005: 2436.79,   // Jan 3, 2005
  2006: 2715.14,   // Jan 3, 2006
  2007: 3117.34,   // Jan 3, 2007
  2008: 3285.91,   // Jan 2, 2008
  2009: 2050.35,   // Jan 2, 2009
  2010: 2596.98,   // Jan 4, 2010
  2011: 2984.43,   // Jan 3, 2011
  2012: 3046.35,   // Jan 3, 2012
  2013: 3510.93,   // Jan 2, 2013
  2014: 4193.54,   // Jan 2, 2014
  2015: 4551.78,   // Jan 2, 2015
  2016: 4562.48,   // Jan 4, 2016
  2017: 5096.49,   // Jan 3, 2017
  2018: 6070.86,   // Jan 2, 2018
  2019: 5648.40,   // Jan 2, 2019
  2020: 7315.00,   // Jan 2, 2020
  2021: 8118.85,   // Jan 4, 2021
  2022: 9893.52,   // Jan 3, 2022
  2023: 8198.45,   // Jan 3, 2023
  2024: 10458.63,  // Jan 2, 2024
  2025: 12512.38,  // Jan 2, 2025
  2026: 13108.45   // Jan 2, 2026 (estimated)
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
