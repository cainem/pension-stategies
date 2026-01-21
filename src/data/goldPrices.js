/**
 * Historical Gold Prices (GBP per Troy Ounce)
 * Source: goldprice.org (USD prices converted to GBP using exchange rates)
 * January 1st (or first trading day) each year
 *
 * Note: USD prices from goldprice.org, converted using GBP/USD exchange rates
 */

export const goldPrices = {
  // 1980s - Gold prices in GBP (USD converted using exchange rates)
  1980: 267.13,   // Jan 2, 1980 - $594.75 USD (end of gold spike)
  1981: 205.19,   // Jan 2, 1981 - $490.92 USD
  1982: 197.07,   // Jan 4, 1982 - $376.60 USD
  1983: 274.70,   // Jan 3, 1983 - $444.25 USD
  1984: 258.52,   // Jan 3, 1984 - $374.60 USD
  1985: 282.68,   // Jan 2, 1985 - $326.94 USD
  1986: 233.82,   // Jan 2, 1986 - $338.10 USD
  1987: 282.67,   // Jan 2, 1987 - $416.45 USD
  1988: 239.23,   // Jan 4, 1988 - $447.30 USD
  1989: 225.75,   // Jan 3, 1989 - $408.50 USD
  // 1990s
  1990: 239.38,   // Jan 2, 1990 - $386.20 USD
  1991: 193.06,   // Jan 2, 1991 - $372.55 USD
  1992: 188.15,   // Jan 2, 1992 - $351.65 USD
  1993: 226.88,   // Jan 4, 1993 - $342.72 USD
  1994: 263.64,   // Jan 3, 1994 - $391.07 USD
  1995: 244.69,   // Jan 3, 1995 - $381.45 USD
  1996: 247.78,   // Jan 2, 1996 - $384.87 USD
  1997: 213.55,   // Jan 2, 1997 - $363.55 USD
  1998: 173.40,   // Jan 2, 1998 - $284.86 USD
  1999: 171.88,   // Jan 4, 1999 - $286.04 USD
  // 2000s
  2000: 177.83,   // Jan 4, 2000 (first trading day)
  2001: 174.59,   // Jan 2, 2001
  2002: 180.07,   // Jan 2, 2002
  2003: 214.80,   // Jan 2, 2003
  2004: 227.47,   // Jan 2, 2004
  2005: 244.70,   // Jan 4, 2005
  2006: 296.17,   // Jan 3, 2006
  2007: 320.17,   // Jan 2, 2007
  2008: 447.00,   // Jan 2, 2008
  2009: 554.78,   // Jan 2, 2009
  2010: 612.10,   // Jan 4, 2010
  2011: 892.05,   // Jan 4, 2011
  2012: 1013.61,  // Jan 3, 2012
  2013: 1054.47,  // Jan 2, 2013
  2014: 772.01,   // Jan 2, 2014
  2015: 778.62,   // Jan 2, 2015
  2016: 737.63,   // Jan 4, 2016
  2017: 943.46,   // Jan 3, 2017
  2018: 957.43,   // Jan 2, 2018
  2019: 997.02,   // Jan 2, 2019
  2020: 1146.50,  // Jan 2, 2020 - $1519.50 USD
  2021: 1385.42,  // Jan 4, 2021
  2022: 1336.64,  // Jan 4, 2022
  2023: 1512.00,  // Jan 3, 2023 - $1823.91 USD
  2024: 1620.37,  // Jan 2, 2024 - $2062.90 USD
  2025: 2096.11,  // Jan 2, 2025 - $2623.96 USD
  2026: 3489.36   // Jan 2, 2026 - $4321.48 USD (verified goldprice.org)
};

/**
 * Get gold price for a specific year
 * @param {number} year - The year to get the price for
 * @returns {number} Gold price in GBP per troy ounce
 * @throws {Error} If year is not in the dataset
 */
export function getGoldPrice(year) {
  if (!(year in goldPrices)) {
    throw new Error(`Gold price data not available for year ${year}`);
  }
  return goldPrices[year];
}

/**
 * Get all available years
 * @returns {number[]} Array of years with data
 */
export function getAvailableYears() {
  return Object.keys(goldPrices).map(Number).sort((a, b) => a - b);
}

export default goldPrices;
