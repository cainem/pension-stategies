/**
 * US Long Treasury (20+ Year) Total Return Index Values
 * Source: Bloomberg/ICE US Treasury 20+ Year Total Return Index, January 1st each year
 *
 * The Total Return Index includes reinvested coupon payments, which is what an
 * accumulating Treasury ETF like TLT would track.
 *
 * This serves as a proxy for annuity-like returns - steady income with
 * interest rate sensitivity. Long-duration bonds provide income-like characteristics
 * while still being tradeable within a SIPP.
 *
 * Note: Values are normalized to a base of 100 at end of 1979 for consistency.
 * Actual index values vary by provider but the relative returns are consistent.
 */

export const usLongTreasuryTotalReturn = {
  // 1980s - High interest rate era, then declining rates boosted bond prices
  1980: 100.00,    // Base year (normalized)
  1981: 96.80,     // Volcker rate hikes hurt bonds
  1982: 93.50,     // Rates peaked, bonds still under pressure
  1983: 137.40,    // Huge rally as rates began falling
  1984: 146.20,    // Continued gains
  1985: 169.80,    // Strong year for bonds
  1986: 220.40,    // Excellent year as rates fell
  1987: 260.30,    // Good returns continue
  1988: 261.80,    // Flat year
  1989: 282.50,    // Solid gains

  // 1990s - Declining rate environment generally favorable
  1990: 312.70,    // Good year
  1991: 322.40,    // Gulf War volatility
  1992: 375.90,    // Strong gains
  1993: 400.10,    // Continued rally
  1994: 463.80,    // Before the bond massacre
  1995: 406.20,    // 1994 bond crash impact
  1996: 506.30,    // Recovery
  1997: 509.70,    // Flat
  1998: 567.40,    // Flight to safety, LTCM crisis
  1999: 629.30,    // Good year

  // 2000s - Mixed decade with financial crisis
  2000: 574.60,    // Down from 1999
  2001: 697.80,    // Flight to safety after 9/11
  2002: 724.50,    // Continued safety bid
  2003: 822.90,    // Post-crisis rally
  2004: 826.30,    // Flat
  2005: 892.80,    // Gains
  2006: 950.20,    // Good year
  2007: 943.50,    // Slight decline
  2008: 1098.40,   // Financial crisis flight to safety
  2009: 1214.90,   // QE begins, massive rally

  // 2010s - ZIRP era, generally favorable for bonds
  2010: 1126.80,   // Pullback
  2011: 1304.60,   // European debt crisis boost
  2012: 1661.10,   // Excellent year
  2013: 1711.50,   // Taper tantrum impact
  2014: 1527.20,   // Down year
  2015: 1867.30,   // Strong year
  2016: 1830.70,   // Slight decline
  2017: 1843.10,   // Flat
  2018: 2014.60,   // Good gains
  2019: 1969.30,   // Rate cut cycle begins

  // 2020s - COVID, inflation, rate hikes
  2020: 2246.90,   // Flight to safety at start
  2021: 2482.40,   // Still gains despite inflation concerns
  2022: 2367.50,   // Rate hikes begin impact
  2023: 1616.80,   // Worst year for bonds, aggressive Fed hikes
  2024: 1556.50,   // Continued pressure from high rates
  2025: 1510.20,   // Rates remain elevated
  2026: 1580.80    // Slight recovery as rates stabilize
};

/**
 * Get US Long Treasury Total Return Index value for a given year
 *
 * @param {number} year - The year to get the value for
 * @returns {number} US Long Treasury Total Return Index value
 * @throws {Error} If year is not available
 */
export function getUSLongTreasuryTotalReturn(year) {
  const value = usLongTreasuryTotalReturn[year];
  if (value === undefined) {
    throw new Error(`US Long Treasury Total Return data not available for year ${year}`);
  }
  return value;
}

/**
 * Get all available years in the dataset
 *
 * @returns {number[]} Array of available years
 */
export function getAvailableYears() {
  return Object.keys(usLongTreasuryTotalReturn)
    .map(Number)
    .sort((a, b) => a - b);
}

export default usLongTreasuryTotalReturn;
