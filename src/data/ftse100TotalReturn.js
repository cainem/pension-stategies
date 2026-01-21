/**
 * FTSE 100 Total Return Index Values (GBP)
 * Source: FTSE Russell, Bloomberg, January 1st (or first trading day) each year
 *
 * The Total Return Index includes reinvested dividends, which is what an
 * accumulating ETF tracking the FTSE 100 would follow.
 *
 * The FTSE 100 was launched on January 3, 1984 with a base value of 1000.
 * Data starts from 1984.
 *
 * Note: This index is already denominated in GBP - no currency conversion needed.
 * Note: Values before 1984 are not available as the index did not exist.
 */

export const ftse100TotalReturn = {
  // 1984-1989 - Early years (index launched Jan 3, 1984)
  1984: 1000.00,   // Base value at launch
  1985: 1189.00,   // Jan 2, 1985 (+18.9%)
  1986: 1452.58,   // Jan 2, 1986 (+22.17%)
  1987: 1892.80,   // Jan 2, 1987 (+30.31%)
  1988: 1717.25,   // Jan 4, 1988 (-9.27% - post Black Monday)
  1989: 1923.18,   // Jan 3, 1989 (+11.99%)

  // 1990s
  1990: 2458.32,   // Jan 2, 1990 (+27.83%)
  1991: 2227.29,   // Jan 2, 1991 (-9.40%)
  1992: 2649.17,   // Jan 2, 1992 (+18.94%)
  1993: 3016.67,   // Jan 4, 1993 (+13.87%)
  1994: 3648.61,   // Jan 3, 1994 (+20.95%)
  1995: 3407.09,   // Jan 3, 1995 (-6.62%)
  1996: 4166.56,   // Jan 2, 1996 (+22.29%)
  1997: 4732.09,   // Jan 2, 1997 (+13.57%)
  1998: 5901.64,   // Jan 2, 1998 (+24.72%)
  1999: 6584.16,   // Jan 4, 1999 (+11.56%)

  // 2000s
  2000: 7823.93,   // Jan 3, 2000 (+18.83%)
  2001: 6790.87,   // Jan 2, 2001 (-13.20%)
  2002: 5814.88,   // Jan 2, 2002 (-14.37%)
  2003: 4337.34,   // Jan 2, 2003 (-25.41%)
  2004: 5327.65,   // Jan 2, 2004 (+22.83%)
  2005: 6010.92,   // Jan 3, 2005 (+12.82%)
  2006: 7373.83,   // Jan 3, 2006 (+22.68%)
  2007: 8412.82,   // Jan 3, 2007 (+14.09%)
  2008: 8686.58,   // Jan 2, 2008 (+3.25%)
  2009: 5606.19,   // Jan 2, 2009 (-35.46%)

  // 2010s
  2010: 7196.65,   // Jan 4, 2010 (+28.37%)
  2011: 8078.05,   // Jan 3, 2011 (+12.24%)
  2012: 7817.54,   // Jan 3, 2012 (-3.23%)
  2013: 8572.65,   // Jan 2, 2013 (+9.66%)
  2014: 10044.45,  // Jan 2, 2014 (+17.17%)
  2015: 10226.25,  // Jan 2, 2015 (+1.81%)
  2016: 9796.29,   // Jan 4, 2016 (-4.20%)
  2017: 11290.02,  // Jan 3, 2017 (+15.25%)
  2018: 12506.64,  // Jan 2, 2018 (+10.78%)
  2019: 11339.10,  // Jan 2, 2019 (-9.34%)

  // 2020s
  2020: 13574.66,  // Jan 2, 2020 (+19.72%)
  2021: 10880.65,  // Jan 4, 2021 (-19.85% - COVID crash carry-over)
  2022: 12936.89,  // Jan 3, 2022 (+18.90%)
  2023: 13481.26,  // Jan 3, 2023 (+4.21%)
  2024: 13801.66,  // Jan 2, 2024 (+2.38%)
  2025: 15062.65,  // Jan 2, 2025 (+9.14%)
  2026: 15413.96   // Jan 2, 2026 (+2.33% - estimated YTD)
};

/**
 * Get FTSE 100 Total Return Index value for a specific year
 * @param {number} year - The year to get the value for
 * @returns {number} FTSE 100 TR Index value (GBP)
 * @throws {Error} If year is not in the dataset
 */
export function getFTSE100TotalReturn(year) {
  if (!(year in ftse100TotalReturn)) {
    throw new Error(`FTSE 100 Total Return data not available for year ${year}. Index launched in 1984.`);
  }
  return ftse100TotalReturn[year];
}

/**
 * Get all available years
 * @returns {number[]} Array of years with data
 */
export function getAvailableYears() {
  return Object.keys(ftse100TotalReturn).map(Number).sort((a, b) => a - b);
}

/**
 * Get the earliest year with data
 * @returns {number} Earliest year (1984)
 */
export function getEarliestYear() {
  return 1984;
}

/**
 * Check if data is available for a given year
 * @param {number} year - Year to check
 * @returns {boolean} True if data available
 */
export function hasDataForYear(year) {
  return year in ftse100TotalReturn;
}

export default ftse100TotalReturn;
