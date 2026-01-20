/**
 * Strategy Registry
 *
 * Defines all available pension withdrawal strategies and their metadata.
 * This central registry enables dynamic strategy selection and comparison.
 *
 * @module strategyRegistry
 */

/**
 * Strategy types
 */
export const STRATEGY_TYPES = {
  GOLD: 'gold',
  SIPP: 'sipp',
  COMBINED: 'combined'
};

/**
 * Base strategy definitions
 */
export const BASE_STRATEGIES = {
  gold: {
    id: 'gold',
    name: 'Physical Gold - Outside Pension',
    shortName: 'Physical Gold',
    type: STRATEGY_TYPES.GOLD,
    description: 'Withdraw pension, pay tax, buy CGT-exempt gold coins',
    dataSource: 'goldPrices',
    currency: 'GBP',
    requiresCurrencyConversion: false,
    earliestYear: 1980,
    fees: ['transactionFee', 'storageFee'],
    taxEvents: {
      onInitialWithdrawal: true,
      onAnnualWithdrawal: false,  // Gold sales are CGT-exempt
      onFinalValue: false
    }
  },

  goldEtf: {
    id: 'goldEtf',
    name: 'Gold ETF SIPP',
    shortName: 'Gold ETF',
    type: STRATEGY_TYPES.SIPP,
    description: 'Keep pension invested in Gold ETF tracker within SIPP',
    dataSource: 'goldPrices',
    currency: 'GBP',
    requiresCurrencyConversion: false,
    earliestYear: 1980,
    fees: ['managementFee'],
    taxEvents: {
      onInitialWithdrawal: false,
      onAnnualWithdrawal: true,  // SIPP withdrawals are taxable
      onFinalValue: true
    }
  },

  sp500: {
    id: 'sp500',
    name: 'S&P 500 SIPP',
    shortName: 'S&P 500',
    type: STRATEGY_TYPES.SIPP,
    description: 'Keep pension invested in S&P 500 tracker within SIPP',
    dataSource: 'sp500TotalReturn',
    currency: 'USD',
    requiresCurrencyConversion: true,
    earliestYear: 1980,
    fees: ['managementFee'],
    taxEvents: {
      onInitialWithdrawal: false,
      onAnnualWithdrawal: true,  // SIPP withdrawals are taxable
      onFinalValue: true
    }
  },

  nasdaq100: {
    id: 'nasdaq100',
    name: 'Nasdaq 100 SIPP',
    shortName: 'Nasdaq 100',
    type: STRATEGY_TYPES.SIPP,
    description: 'Keep pension invested in Nasdaq 100 tracker within SIPP',
    dataSource: 'nasdaq100TotalReturn',
    currency: 'USD',
    requiresCurrencyConversion: true,
    earliestYear: 1985,  // Index launched Jan 31, 1985
    fees: ['managementFee'],
    taxEvents: {
      onInitialWithdrawal: false,
      onAnnualWithdrawal: true,
      onFinalValue: true
    }
  },

  ftse100: {
    id: 'ftse100',
    name: 'FTSE 100 SIPP',
    shortName: 'FTSE 100',
    type: STRATEGY_TYPES.SIPP,
    description: 'Keep pension invested in FTSE 100 tracker within SIPP',
    dataSource: 'ftse100TotalReturn',
    currency: 'GBP',
    requiresCurrencyConversion: false,  // Already in GBP
    earliestYear: 1984,  // Index launched Jan 3, 1984
    fees: ['managementFee'],
    taxEvents: {
      onInitialWithdrawal: false,
      onAnnualWithdrawal: true,
      onFinalValue: true
    }
  }
};

/**
 * Combination strategy definitions (50/50 splits)
 */
export const COMBINATION_STRATEGIES = {
  'gold-sp500': {
    id: 'gold-sp500',
    name: '50% Gold + 50% S&P 500',
    shortName: 'Gold/S&P 500',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between gold and S&P 500 SIPP',
    components: ['gold', 'sp500'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1980  // Max of component earliest years
  },

  'gold-nasdaq100': {
    id: 'gold-nasdaq100',
    name: '50% Gold + 50% Nasdaq 100',
    shortName: 'Gold/Nasdaq',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between gold and Nasdaq 100 SIPP',
    components: ['gold', 'nasdaq100'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1985  // Nasdaq 100 constraint
  },

  'gold-ftse100': {
    id: 'gold-ftse100',
    name: '50% Gold + 50% FTSE 100',
    shortName: 'Gold/FTSE',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between gold and FTSE 100 SIPP',
    components: ['gold', 'ftse100'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1984  // FTSE 100 constraint
  },

  'sp500-nasdaq100': {
    id: 'sp500-nasdaq100',
    name: '50% S&P 500 + 50% Nasdaq 100',
    shortName: 'S&P/Nasdaq',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between S&P 500 and Nasdaq 100 SIPPs',
    components: ['sp500', 'nasdaq100'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1985  // Nasdaq 100 constraint
  },

  'sp500-ftse100': {
    id: 'sp500-ftse100',
    name: '50% S&P 500 + 50% FTSE 100',
    shortName: 'S&P/FTSE',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between S&P 500 and FTSE 100 SIPPs',
    components: ['sp500', 'ftse100'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1984  // FTSE 100 constraint
  },

  'nasdaq100-ftse100': {
    id: 'nasdaq100-ftse100',
    name: '50% Nasdaq 100 + 50% FTSE 100',
    shortName: 'Nasdaq/FTSE',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between Nasdaq 100 and FTSE 100 SIPPs',
    components: ['nasdaq100', 'ftse100'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1985  // Nasdaq 100 constraint
  },

  // Gold ETF SIPP combined strategies
  'goldEtf-sp500': {
    id: 'goldEtf-sp500',
    name: '50% Gold ETF + 50% S&P 500',
    shortName: 'Gold ETF/S&P 500',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between Gold ETF and S&P 500 SIPPs',
    components: ['goldEtf', 'sp500'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1980
  },

  'goldEtf-nasdaq100': {
    id: 'goldEtf-nasdaq100',
    name: '50% Gold ETF + 50% Nasdaq 100',
    shortName: 'Gold ETF/Nasdaq',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between Gold ETF and Nasdaq 100 SIPPs',
    components: ['goldEtf', 'nasdaq100'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1985  // Nasdaq 100 constraint
  },

  'goldEtf-ftse100': {
    id: 'goldEtf-ftse100',
    name: '50% Gold ETF + 50% FTSE 100',
    shortName: 'Gold ETF/FTSE',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between Gold ETF and FTSE 100 SIPPs',
    components: ['goldEtf', 'ftse100'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1984  // FTSE 100 constraint
  },

  'gold-goldEtf': {
    id: 'gold-goldEtf',
    name: '50% Physical Gold + 50% Gold ETF',
    shortName: 'Physical/ETF Gold',
    type: STRATEGY_TYPES.COMBINED,
    description: 'Split pension 50/50 between Physical Gold and Gold ETF SIPP',
    components: ['gold', 'goldEtf'],
    splitRatio: [0.5, 0.5],
    earliestYear: 1980
  }
};

/**
 * All strategies combined
 */
export const ALL_STRATEGIES = {
  ...BASE_STRATEGIES,
  ...COMBINATION_STRATEGIES
};

/**
 * Get a strategy by ID
 * @param {string} strategyId - The strategy ID
 * @returns {Object} Strategy definition
 * @throws {Error} If strategy not found
 */
export function getStrategy(strategyId) {
  const strategy = ALL_STRATEGIES[strategyId];
  if (!strategy) {
    throw new Error(`Strategy '${strategyId}' not found. Available: ${Object.keys(ALL_STRATEGIES).join(', ')}`);
  }
  return strategy;
}

/**
 * Get all base strategies
 * @returns {Object[]} Array of base strategy definitions
 */
export function getBaseStrategies() {
  return Object.values(BASE_STRATEGIES);
}

/**
 * Get all combination strategies
 * @returns {Object[]} Array of combination strategy definitions
 */
export function getCombinationStrategies() {
  return Object.values(COMBINATION_STRATEGIES);
}

/**
 * Get all strategies
 * @returns {Object[]} Array of all strategy definitions
 */
export function getAllStrategies() {
  return Object.values(ALL_STRATEGIES);
}

/**
 * Get strategies by type
 * @param {string} type - Strategy type (gold, sipp, combined)
 * @returns {Object[]} Array of matching strategy definitions
 */
export function getStrategiesByType(type) {
  return Object.values(ALL_STRATEGIES).filter(s => s.type === type);
}

/**
 * Check if a strategy is available for a given start year
 * @param {string} strategyId - The strategy ID
 * @param {number} startYear - The start year
 * @returns {boolean} True if strategy data is available
 */
export function isStrategyAvailableForYear(strategyId, startYear) {
  const strategy = getStrategy(strategyId);
  return startYear >= strategy.earliestYear;
}

/**
 * Get the earliest available year for a strategy
 * @param {string} strategyId - The strategy ID
 * @returns {number} Earliest year with data
 */
export function getStrategyEarliestYear(strategyId) {
  const strategy = getStrategy(strategyId);
  return strategy.earliestYear;
}

/**
 * Get strategies available for a given start year
 * @param {number} startYear - The start year
 * @returns {Object[]} Array of available strategy definitions
 */
export function getStrategiesAvailableForYear(startYear) {
  return Object.values(ALL_STRATEGIES).filter(s => startYear >= s.earliestYear);
}

/**
 * Check if two strategies can be compared
 * @param {string} strategy1Id - First strategy ID
 * @param {string} strategy2Id - Second strategy ID
 * @returns {Object} Validity and earliest common year
 */
export function canCompareStrategies(strategy1Id, strategy2Id) {
  if (strategy1Id === strategy2Id) {
    return {
      valid: false,
      reason: 'Cannot compare a strategy with itself'
    };
  }

  const strategy1 = getStrategy(strategy1Id);
  const strategy2 = getStrategy(strategy2Id);
  const earliestCommonYear = Math.max(strategy1.earliestYear, strategy2.earliestYear);

  return {
    valid: true,
    earliestCommonYear,
    strategy1EarliestYear: strategy1.earliestYear,
    strategy2EarliestYear: strategy2.earliestYear
  };
}

/**
 * Get component strategies for a combined strategy
 * @param {string} strategyId - The combined strategy ID
 * @returns {Object[]} Array of component strategy definitions
 */
export function getComponentStrategies(strategyId) {
  const strategy = getStrategy(strategyId);

  if (strategy.type !== STRATEGY_TYPES.COMBINED) {
    throw new Error(`Strategy '${strategyId}' is not a combined strategy`);
  }

  return strategy.components.map(componentId => getStrategy(componentId));
}

/**
 * Check if a strategy is a combined strategy
 * @param {string} strategyId - The strategy ID
 * @returns {boolean} True if combined
 */
export function isCombinedStrategy(strategyId) {
  const strategy = getStrategy(strategyId);
  return strategy.type === STRATEGY_TYPES.COMBINED;
}

/**
 * Get default strategies for comparison
 * @returns {Object} Default strategy IDs
 */
export function getDefaultStrategies() {
  return {
    strategy1: 'gold',
    strategy2: 'sp500'
  };
}

/**
 * Get strategies grouped for UI display
 * @returns {Object} Strategies grouped by category
 */
export function getStrategiesGroupedForDisplay() {
  return {
    base: {
      label: 'Base Strategies',
      strategies: getBaseStrategies()
    },
    combined: {
      label: 'Combined (50/50)',
      strategies: getCombinationStrategies()
    }
  };
}

export default {
  STRATEGY_TYPES,
  BASE_STRATEGIES,
  COMBINATION_STRATEGIES,
  ALL_STRATEGIES,
  getStrategy,
  getBaseStrategies,
  getCombinationStrategies,
  getAllStrategies,
  getStrategiesByType,
  isStrategyAvailableForYear,
  getStrategyEarliestYear,
  getStrategiesAvailableForYear,
  canCompareStrategies,
  getComponentStrategies,
  isCombinedStrategy,
  getDefaultStrategies,
  getStrategiesGroupedForDisplay
};
