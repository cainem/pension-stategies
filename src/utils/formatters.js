/**
 * Formatting Utilities
 */

/**
 * Format a number as GBP currency
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a number with thousand separators
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param {number} value - Value to format (e.g., 0.05 for 5%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format gold weight in troy ounces
 * @param {number} ounces - Weight in troy ounces
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted weight string
 */
export function formatOunces(ounces, decimals = 4) {
  if (typeof ounces !== 'number' || isNaN(ounces)) {
    return '—';
  }

  return `${formatNumber(ounces, decimals)} oz`;
}

/**
 * Format ETF units
 * @param {number} units - Number of units
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted units string
 */
export function formatUnits(units, decimals = 4) {
  if (typeof units !== 'number' || isNaN(units)) {
    return '—';
  }

  return formatNumber(units, decimals);
}
