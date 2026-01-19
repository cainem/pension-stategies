# AGENTS.md
## Pension Strategy Comparison Tool - Agent Guidelines

This document provides guidance for AI agents working on this codebase.

---

## Project Overview

A client-side web application comparing two UK pension withdrawal strategies:
1. **Gold Strategy**: Withdraw pension, pay tax, buy physical gold
2. **S&P 500 SIPP Strategy**: Keep pension invested in S&P 500 tracker ETF

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
└─────────────────────────────────────────────────────────────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Components     │ │   Calculators   │ │      Data       │
│  ┌─────────────┐  │ │ ┌─────────────┐ │ │ ┌─────────────┐ │
│  │ inputForm   │  │ │ │taxCalculator│ │ │ │ goldPrices  │ │
│  ├─────────────┤  │ │ ├─────────────┤ │ │ ├─────────────┤ │
│  │resultsTable │  │ │ │goldStrategy │ │ │ │sp500TotalRe │ │
│  ├─────────────┤  │ │ ├─────────────┤ │ │ ├─────────────┤ │
│  │  summary    │  │ │ │sippStrategy │ │ │ │exchangeRates│ │
│  └─────────────┘  │ │ ├─────────────┤ │ │ ├─────────────┤ │
└───────────────────┘ │ │syntheticEtf │ │ │ │ ukTaxData   │ │
                      │ └─────────────┘ │ │ └─────────────┘ │
                      └─────────────────┘ └─────────────────┘
                                │                   │
                                └─────────┬─────────┘
                                          ▼
                              ┌─────────────────────┐
                              │       Utils         │
                              │  ┌───────────────┐  │
                              │  │  formatters   │  │
                              │  ├───────────────┤  │
                              │  │  validators   │  │
                              │  └───────────────┘  │
                              └─────────────────────┘
```

---

## Key Features & Business Logic

### 1. Tax Calculation Engine

**Location**: `src/calculators/taxCalculator.js`

**Purpose**: Calculate UK income tax based on historical tax regimes.

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

### 2. Gold Strategy Calculator

**Location**: `src/calculators/goldStrategy.js`

**Purpose**: Simulate withdrawing pension to buy physical gold.

**Key Rules**:
- Initial withdrawal: Pay income tax on full amount (25% tax-free)
- Gold purchase: 2% transaction cost
- Annual withdrawal: 4% of original gross amount
- Gold sale: 2% transaction cost, NO income tax (CGT-exempt physical gold)
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

All data modules export objects keyed by year:

```javascript
// goldPrices.js
export const goldPrices = {
  2000: 182.45,  // GBP per troy ounce, Jan 1st
  2001: 175.23,
  // ...
};

// ukTaxData.js
export const ukTaxData = {
  2000: {
    personalAllowance: 4385,
    basicRate: 0.22,
    basicRateThreshold: 28400,
    higherRate: 0.40,
    higherRateThreshold: null, // No upper limit in 2000
    additionalRate: null,       // Didn't exist
    additionalRateThreshold: null
  },
  // ...
};
```

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
src/utils/formatters.js           →  tests/utils/formatters.test.js
```

### Coverage Requirements

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
4. Update `src/data/exchangeRates.js` with Jan 1st GBP/USD rate
5. Add test cases for the new year
6. Update valid year range in validators

### Modifying Tax Calculation Logic

1. Update `src/calculators/taxCalculator.js`
2. Update corresponding tests in `tests/calculators/taxCalculator.test.js`
3. Ensure all branches are covered
4. Verify against HMRC examples if available

### Adding a New Strategy

1. Create new calculator in `src/calculators/`
2. Create corresponding test file in `tests/calculators/`
3. Update `app.js` to include new strategy
4. Update `resultsTable.js` to render new strategy
5. Update `summary.js` to include in comparison

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
- Ensure year is within valid range (2000-2026)

### Tax calculation mismatch
- Verify personal allowance for that year
- Check if additional rate applies (post-2010 only)
- Verify 25% tax-free is being applied for pension withdrawals

### Synthetic ETF price seems wrong
- Check S&P 500 TR Index value
- Verify GBP/USD exchange rate direction
- Ensure base year normalization is correct

### Tests failing after data update
- Run full test suite
- Check boundary condition tests
- Verify no typos in data entries
