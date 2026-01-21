# AGENTS.md
## Pension Strategy Comparison Tool - Agent Guidelines

This document provides guidance for AI agents working on this codebase.

---

## Project Overview

A client-side web application comparing UK pension withdrawal strategies across multiple asset classes:

**Base Strategies (5):**
1. **Physical Gold - Outside Pension**: Withdraw pension, pay tax, buy CGT-exempt physical gold
2. **Gold ETF SIPP**: Keep pension in gold ETF within SIPP wrapper
3. **S&P 500 SIPP**: Keep pension in S&P 500 tracker ETF within SIPP
4. **Nasdaq 100 SIPP**: Keep pension in Nasdaq 100 tracker ETF within SIPP
5. **FTSE 100 SIPP**: Keep pension in FTSE 100 tracker ETF within SIPP

**Combined Strategies (10):**
- 50/50 splits between any two base strategies

**Key Constraint**: No server-side processing. Hosted on GitHub Pages. All calculations in JavaScript.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                     (Entry Point)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         main.js                             │
│                  (Application Bootstrap)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          app.js                             │
│                    (Orchestration Layer)                    │
│  - Wires components together                                │
│  - Handles user interactions                                │
│  - Manages calculation flow                                 │
│  - Integrates disclaimers                                   │
└─────────────────────────────────────────────────────────────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Components     │ │   Calculators   │ │      Data       │
│  ┌─────────────┐  │ │ ┌─────────────┐ │ │ ┌─────────────┐ │
│  │ inputForm   │  │ │ │taxCalculator│ │ │ │ goldPrices  │ │
│  ├─────────────┤  │ │ ├─────────────┤ │ │ ├─────────────┤ │
│  │resultsTable │  │ │ │goldStrategy │ │ │ │sp500TotalRet│ │
│  ├─────────────┤  │ │ ├─────────────┤ │ │ ├─────────────┤ │
│  │  summary    │  │ │ │sippStrategy │ │ │ │nasdaq100TR  │ │
│  ├─────────────┤  │ │ ├─────────────┤ │ │ ├─────────────┤ │
│  │   chart     │  │ │ │syntheticEtf │ │ │ │ftse100TR    │ │
│  ├─────────────┤  │ │ ├─────────────┤ │ │ ├─────────────┤ │
│  │ disclaimer  │  │ │ │strategyReg  │ │ │ │exchangeRates│ │
│  ├─────────────┤  │ │ ├─────────────┤ │ │ ├─────────────┤ │
│  │advSettings  │  │ │ │compEngine   │ │ │ │ ukTaxData   │ │
│  └─────────────┘  │ │ ├─────────────┤ │ │ └─────────────┘ │
└───────────────────┘ │ │combinedStrat│ │ └─────────────────┘
                      │ └─────────────┘ │
                      └─────────────────┘
                                │
                                ▼
                      ┌─────────────────────┐
                      │       Utils         │
                      │  ┌───────────────┐  │
                      │  │  formatters   │  │
                      │  ├───────────────┤  │
                      │  │  validators   │  │
                      │  └───────────────┘  │
                      └─────────────────────┘
                                │
                                ▼
                      ┌─────────────────────┐
                      │       Config        │
                      │  ┌───────────────┐  │
                      │  │   defaults    │  │
                      │  └───────────────┘  │
                      └─────────────────────┘
```

---

## Key Features & Business Logic

### 1. Strategy Registry

**Location**: `src/calculators/strategyRegistry.js`

**Purpose**: Central registry of all available strategies with metadata.

**Key Exports**:
```javascript
// Strategy types
STRATEGY_TYPES = { GOLD: 'gold', SIPP: 'sipp', COMBINED: 'combined' }

// Get strategy by ID
getStrategy(id)  // Returns strategy object or throws

// Get available strategies
getBaseStrategies()        // Returns 5 base strategies
getCombinationStrategies() // Returns 10 combined strategies
getAllStrategies()         // Returns all 15 strategies

// Year availability
isStrategyAvailableForYear(strategyId, year)
getStrategyEarliestYear(strategyId)
getStrategiesAvailableForYear(year)
```

### 2. Tax Calculation Engine

**Location**: `src/calculators/taxCalculator.js`

**Purpose**: Calculate UK income tax based on historical tax regimes (1980-2026).

**Key Rules**:
- Personal allowance varies by year (£4,385 in 2000 → £12,570 in 2024)
- Basic rate: 22% (2000-2007), 20% (2008+)
- Higher rate: 40%
- Additional rate: 50% (2010-2012), 45% (2013+)
- Pension withdrawals: 25% is tax-free, 75% is taxable

**Function Signature**:
```javascript
calculateIncomeTax(grossIncome, year, isPensionWithdrawal = false)
// Returns: { grossIncome, taxFreeAmount, taxableAmount, taxPaid, netIncome, breakdown }
```

### 3. Gold Strategy Calculator

**Location**: `src/calculators/goldStrategy.js`

**Purpose**: Simulate withdrawing pension to buy physical gold.

**Key Rules**:
- Initial withdrawal: Pay income tax on full amount (25% tax-free)
- Gold purchase: 2% transaction cost (configurable)
- Annual withdrawal: Sell gold to fund income
- Gold sale: 2% transaction cost, NO income tax (CGT-exempt physical gold)
- Storage fee: 0.5% per year (configurable)
- Prices: January 1st spot price each year

**Function Signature**:
```javascript
calculateGoldStrategy(pensionAmount, startYear, withdrawalRate, years, config)
// Returns: { initialTax, yearlyResults[], summary }
```

### 4. SIPP Strategy Calculator

**Location**: `src/calculators/sippStrategy.js`

**Purpose**: Simulate keeping pension in various index tracker ETFs within SIPP.

**Supported Indices**:
- S&P 500 (USD, currency conversion required)
- Nasdaq 100 (USD, currency conversion required)
- FTSE 100 (GBP, no conversion)
- Gold ETF (GBP, no conversion)

**Key Rules**:
- No initial tax (stays in SIPP)
- 0.5% annual management fee on total balance (configurable)
- Annual withdrawal taxed: 25% tax-free, 75% taxable as income
- Prices: Synthetic ETF prices calculated from index total return

**Function Signature**:
```javascript
calculateSippStrategy(pensionAmount, startYear, withdrawalRate, years, indexType, config)
// Returns: { yearlyResults[], summary }
```

### 5. Synthetic ETF Pricing

**Location**: `src/calculators/syntheticEtf.js`

**Purpose**: Calculate what GBP-denominated Total Return accumulating ETFs would have been priced at historically.

**Supported Indices**:
| Index | Base Year | Base Price | Currency | Earliest Year |
|-------|-----------|------------|----------|---------------|
| S&P 500 | 2019 | £44.30 | USD | 1980 |
| Nasdaq 100 | 2019 | £150.00 | USD | 1985 |
| FTSE 100 | 2019 | £55.00 | GBP | 1984 |
| Gold ETF | 2019 | £99.70 | GBP | 1980 |

**Formula (USD indices)**:
```
syntheticPriceGBP = (indexValue[year] / indexValue[baseYear]) 
                   * basePriceGBP 
                   * (baseExchangeRate / exchangeRate[year])
```

### 6. Combined Strategy Calculator

**Location**: `src/calculators/combinedStrategy.js`

**Purpose**: Calculate 50/50 split strategies between any two base strategies.

**Function Signature**:
```javascript
calculateCombinedStrategy(combinationId, pensionAmount, startYear, withdrawalRate, years, config)
// Returns: { strategyA, strategyB, yearlyResults[], summary }
```

### 7. Comparison Engine

**Location**: `src/calculators/comparisonEngine.js`

**Purpose**: Compare any two strategies and determine winner.

**Function Signature**:
```javascript
compareAnyStrategies(strategy1Id, strategy2Id, pensionAmount, startYear, withdrawalRate, years, config)
// Returns: { strategy1, strategy2, yearlyComparison[], summary }
```

### 8. Disclaimer Component

**Location**: `src/components/disclaimer.js`

**Purpose**: Show relevant legal disclaimers based on selected strategies.

**Disclaimers Include**:
- General disclaimer (always shown)
- Gold CGT exemption (for physical gold strategies)
- Pre-2015 pension rules (when start year < 2015)
- SIPP fees (for SIPP strategies)
- Currency risk (for USD indices)
- Gold ETF vs Physical Gold (when comparing gold options)
- Prices: January 1st spot price each year

**Function Signature**:
```javascript
calculateGoldStrategy(pensionAmount, startYear, withdrawalRate, years)
// Returns: { initialTax, yearlyResults[], summary }
```

### 3. SIPP Strategy Calculator

**Location**: `src/calculators/sippStrategy.js`

**Purpose**: Simulate keeping pension in S&P 500 tracker within SIPP.

**Key Rules**:
- No initial tax (stays in SIPP)
- 0.5% annual management fee on total balance
- Annual withdrawal: 4% of original gross amount
- Withdrawal tax: 25% tax-free, 75% taxable as income
- Prices: Synthetic VUAG price (S&P 500 TR Index converted to GBP)

**Function Signature**:
```javascript
calculateSippStrategy(pensionAmount, startYear, withdrawalRate, years)
// Returns: { yearlyResults[], summary }
```

### 4. Synthetic ETF Pricing

**Location**: `src/calculators/syntheticEtf.js`

**Purpose**: Calculate what a GBP-denominated S&P 500 accumulating ETF would have been priced at before VUAG existed (2019).

**Formula**:
```
syntheticPriceGBP = (sp500TRIndex[year] / sp500TRIndex[baseYear]) * basePriceGBP * (baseExchangeRate / exchangeRate[year])
```

---

## Data Modules

### Historical Data Structure

All data modules export objects keyed by year (1980-2026 where available):

```javascript
// goldPrices.js - GBP per troy ounce, Jan 1st
export const goldPrices = {
  1980: 306.25,
  // ... through 2026
};

// sp500TotalReturn.js - S&P 500 Total Return Index
export const sp500TotalReturn = {
  1980: 135.76,
  // ... through 2026
};

// nasdaq100TotalReturn.js - Nasdaq 100 Total Return (from 1985)
export const nasdaq100TotalReturn = {
  1985: 250.00,
  // ... through 2026
};

// ftse100TotalReturn.js - FTSE 100 Total Return (from 1984)
export const ftse100TotalReturn = {
  1984: 1000.00,
  // ... through 2026
};

// exchangeRates.js - GBP per USD
export const exchangeRates = {
  1980: 0.4297,
  // ... through 2026
};

// ukTaxData.js - Tax bands and rates
export const ukTaxData = {
  2000: {
    personalAllowance: 4385,
    basicRate: 0.22,
    basicRateThreshold: 28400,
    higherRate: 0.40,
    higherRateThreshold: null,
    additionalRate: null,
    additionalRateThreshold: null
  },
  // ... through 2026
};
```

### Data Availability by Year

| Data Module | Earliest Year | Latest Year |
|-------------|---------------|-------------|
| Gold Prices | 1980 | 2026 |
| S&P 500 TR | 1980 | 2026 |
| Nasdaq 100 TR | 1985 | 2026 |
| FTSE 100 TR | 1984 | 2026 |
| Exchange Rates | 1980 | 2026 |
| UK Tax Data | 1980 | 2026 |

---

## Testing Requirements

### Naming Convention

All tests MUST follow this pattern:
```
given_[precondition]_when_[action]_then_[expectedResult]
```

**Examples**:
```javascript
test('given_income50000_when_calculatingTaxFor2000_then_appliesCorrectRates', () => {
  // test implementation
});

test('given_exhaustedFunds_when_withdrawing_then_returnsExhaustedStatus', () => {
  // test implementation
});
```

### Test File Location

Tests mirror the source structure:
```
src/calculators/taxCalculator.js  →  tests/calculators/taxCalculator.test.js
src/components/disclaimer.js      →  tests/components/disclaimer.test.js
src/utils/formatters.js           →  tests/utils/formatters.test.js
```

### Coverage Requirements

| Area | Target | Current |
|------|--------|---------|
| Calculators | 100% branch | 91% |
| Components | 90% line | 10%* |
| Data modules | 100% | 100% |
| Utils | 100% | 100% |
| Config | 100% | 100% |

*Components have low coverage due to DOM dependencies. Core logic is tested.

- **Minimum 90% line coverage**
- **100% branch coverage for calculators**
- All edge cases must be tested:
  - Zero values
  - Negative values (should error)
  - Boundary conditions (exactly at thresholds)
  - Fund exhaustion scenarios

---

## Code Style Guidelines

### Module Pattern

All modules use ES6 exports:
```javascript
// Named exports for functions
export function calculateTax(income, year) { }

// Default export for main module functionality
export default {
  calculateTax,
  getTaxBands
};
```

### Error Handling

Validation errors throw descriptive errors:
```javascript
if (year < 2000 || year > 2026) {
  throw new Error(`Year ${year} is outside supported range (2000-2026)`);
}
```

### Documentation

All public functions have JSDoc comments:
```javascript
/**
 * Calculate UK income tax for a given income and tax year
 * @param {number} grossIncome - Total gross income in GBP
 * @param {number} year - Tax year (e.g., 2000)
 * @param {boolean} isPensionWithdrawal - Whether this is a pension withdrawal (25% tax-free)
 * @returns {TaxCalculationResult} Breakdown of tax calculation
 * @throws {Error} If year is outside supported range
 */
export function calculateIncomeTax(grossIncome, year, isPensionWithdrawal = false) {
```

---

## Common Tasks for Agents

### Adding a New Tax Year

1. Update `src/data/ukTaxData.js` with new year's data
2. Update `src/data/goldPrices.js` with Jan 1st gold price
3. Update `src/data/sp500TotalReturn.js` with Jan 1st index value
4. Update `src/data/nasdaq100TotalReturn.js` with Jan 1st index value
5. Update `src/data/ftse100TotalReturn.js` with Jan 1st index value
6. Update `src/data/exchangeRates.js` with Jan 1st GBP/USD rate
7. Add test cases for the new year
8. Update valid year range in `src/config/defaults.js`

### Modifying Tax Calculation Logic

1. Update `src/calculators/taxCalculator.js`
2. Update corresponding tests in `tests/calculators/taxCalculator.test.js`
3. Ensure all branches are covered
4. Verify against HMRC examples if available

### Adding a New Base Strategy

1. Add data module in `src/data/` if needed
2. Add index type to `src/calculators/syntheticEtf.js` INDEX_TYPES
3. Add strategy to `src/calculators/strategyRegistry.js` BASE_STRATEGIES
4. Add convenience function to `src/calculators/sippStrategy.js` if SIPP-based
5. Update `src/calculators/comparisonEngine.js` STRATEGY_TO_INDEX mapping
6. Add combined strategies for the new base strategy
7. Update tests for new strategy counts
8. Update disclaimers if needed

### Adding a New Combined Strategy

1. Add to COMBINATION_STRATEGIES in `src/calculators/strategyRegistry.js`
2. Ensure both component strategies exist
3. Set earliestYear to max of both components' earliest years
4. Update tests for new strategy count

### Fixing a Calculation Bug

1. First, write a failing test that demonstrates the bug
2. Fix the calculation
3. Ensure the test passes
4. Check no other tests were broken

---

## Build & Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment

The site is deployed to GitHub Pages automatically via GitHub Actions when pushing to the `main` branch.

**Build output**: `dist/` folder

**GitHub Pages source**: `gh-pages` branch (auto-generated)

---

## Important Constraints

1. **No server-side code** - Everything must work client-side
2. **No runtime API calls** - All data is hardcoded
3. **No external dependencies at runtime** - Only dev dependencies for building/testing
4. **UK tax law compliance** - Tax calculations must be accurate
5. **Accessibility** - WCAG 2.1 AA compliance

---

## Data Sources Reference

When updating historical data, use these authoritative sources:

| Data | Primary Source | Backup Source |
|------|----------------|---------------|
| Gold Prices | LBMA Gold Price | World Gold Council |
| S&P 500 TR | S&P Dow Jones Indices | Yahoo Finance |
| GBP/USD | Bank of England | FRED (Federal Reserve) |
| UK Tax Rates | HMRC | legislation.gov.uk |

---

## Troubleshooting Common Issues

### "Year not found in data"
- Check all data modules have the required year
- Ensure year is within valid range (1980-2026)
- Check if strategy has later earliest year (Nasdaq: 1985, FTSE: 1984)

### Tax calculation mismatch
- Verify personal allowance for that year
- Check if additional rate applies (post-2010 only)
- Verify 25% tax-free is being applied for pension withdrawals

### Synthetic ETF price seems wrong
- Check index total return value for that year
- Verify GBP/USD exchange rate direction (for USD indices)
- Ensure base year normalization is correct
- Check if currency conversion is needed for the index type

### Tests failing after data update
- Run full test suite
- Check boundary condition tests
- Verify no typos in data entries
- Update strategy count expectations if adding strategies

### Strategy not appearing in dropdown
- Check strategy is in BASE_STRATEGIES or COMBINATION_STRATEGIES
- Verify strategy has all required fields (id, name, shortName, etc.)
- Check browser console for JavaScript errors
