/**
 * Default Configuration Values
 */

export const DEFAULTS = {
  pensionAmount: 500000,
  startYear: 2000,
  withdrawalRate: 4,
  comparisonYears: 25
};

export const YEAR_RANGE = {
  min: 1980,
  max: 2026
};

export const LIMITS = {
  pensionAmount: {
    min: 10000,
    max: 10000000
  },
  withdrawalRate: {
    min: 1,
    max: 10
  },
  comparisonYears: {
    min: 5,
    max: 30
  }
};

// Transaction costs
export const COSTS = {
  goldTransactionPercent: 2,      // 2% buy/sell cost for gold
  sippManagementFeePercent: 0.5   // 0.5% annual management fee
};

// Pension rules
export const PENSION_RULES = {
  taxFreePercent: 25  // 25% of pension withdrawal is tax-free
};
