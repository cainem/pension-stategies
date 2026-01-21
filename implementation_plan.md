# Implementation Plan v2.0
## Pension Strategy Comparison Tool - Multi-Strategy Expansion

**Version:** 2.0  
**Date:** January 20, 2026  
**Status:** Planned

---

## Executive Summary

This plan extends the existing pension strategy comparison tool to support:
- **4 base strategies**: Gold, S&P 500 SIPP, Nasdaq 100 SIPP, FTSE 100 SIPP
- **6 combination strategies**: All 50/50 pairings of the base strategies
- **Configurable fees**: Gold transaction, SIPP management, gold storage
- **Enhanced disclaimers**: CGT exemption requirements, pre-2015 pension rules

---

## Current State

The application currently supports:
- ✅ Gold vs S&P 500 comparison
- ✅ Historical data 1980-2026 (gold, S&P 500 TR, exchange rates, UK tax)
- ✅ Tax calculations for all years
- ✅ Responsive UI with comparison tables
- ✅ Chart.js visualization
- ✅ 322 passing tests

---

## Technology Stack (Unchanged)

| Component | Technology |
|-----------|------------|
| Framework | Vanilla JavaScript + ES6 Modules |
| Styling | CSS3 with CSS Custom Properties |
| Testing | Vitest |
| Build Tool | Vite |
| Hosting | GitHub Pages |

---

## New Project Structure

```
pension-strategies/
├── src/
│   ├── config/
│   │   └── defaults.js              # Updated with new defaults
│   ├── data/
│   │   ├── goldPrices.js            # Existing
│   │   ├── sp500TotalReturn.js      # Existing
│   │   ├── nasdaq100TotalReturn.js  # NEW - Nasdaq 100 TR Index
│   │   ├── ftse100TotalReturn.js    # NEW - FTSE 100 TR Index
│   │   ├── exchangeRates.js         # Existing
│   │   └── ukTaxData.js             # Existing
│   ├── calculators/
│   │   ├── taxCalculator.js         # Existing
│   │   ├── goldStrategy.js          # Updated (storage fee)
│   │   ├── sippStrategy.js          # Refactored → base SIPP logic
│   │   ├── sp500Strategy.js         # NEW - S&P 500 specific
│   │   ├── nasdaq100Strategy.js     # NEW - Nasdaq 100 specific
│   │   ├── ftse100Strategy.js       # NEW - FTSE 100 specific
│   │   ├── combinedStrategy.js      # NEW - 50/50 combinations
│   │   ├── syntheticEtf.js          # Updated for multiple indices
│   │   ├── comparisonEngine.js      # Updated for new strategies
│   │   └── strategyRegistry.js      # NEW - Strategy definitions
│   ├── components/
│   │   ├── inputForm.js             # Updated - strategy selector
│   │   ├── advancedSettings.js      # NEW - collapsible fee config
│   │   ├── resultsTable.js          # Updated - dynamic columns
│   │   ├── summary.js               # Updated - dynamic summary
│   │   ├── disclaimer.js            # NEW - legal disclaimers
│   │   └── chart.js                 # Updated - dynamic strategies
│   └── utils/
│       ├── formatters.js            # Existing
│       └── validators.js            # Existing
├── tests/
│   └── (mirrors src structure)
└── ...
```

---

## Implementation Stages

### Stage 1: Historical Data - Nasdaq 100 & FTSE 100
**Duration:** 1-2 days  
**Priority:** Critical  
**Branch:** `feature/multi-index-data`

#### Tasks:
1. Research and collect Nasdaq 100 Total Return Index (1980-2026, Jan 1st values)
2. Research and collect FTSE 100 Total Return Index (1980-2026, Jan 1st values)
3. Create `nasdaq100TotalReturn.js` data module
4. Create `ftse100TotalReturn.js` data module
5. Write unit tests for data completeness

#### Data Sources:
| Index | Primary Source | Backup Source |
|-------|----------------|---------------|
| Nasdaq 100 TR | Nasdaq.com | Yahoo Finance (^NDX) |
| FTSE 100 TR | FTSE Russell | Yahoo Finance (^FTTR) |

#### Deliverables:
- `src/data/nasdaq100TotalReturn.js`
- `src/data/ftse100TotalReturn.js`
- `tests/data/nasdaq100TotalReturn.test.js`
- `tests/data/ftse100TotalReturn.test.js`

#### Test Cases:
```
given_nasdaq100Data_when_accessingYear1980_then_returnsValidValue
given_nasdaq100Data_when_accessingAllYears_then_allYearsPresent1980to2026
given_ftse100Data_when_accessingYear1980_then_returnsValidValue
given_ftse100Data_when_accessingAllYears_then_allYearsPresent1980to2026
```

#### Acceptance Criteria:
- [ ] Nasdaq 100 TR data complete for 1980-2026
- [ ] FTSE 100 TR data complete for 1980-2026
- [ ] Data sources documented in code comments
- [ ] Unit tests verify data structure

---

### Stage 2: Strategy Registry & Architecture
**Duration:** 1 day  
**Priority:** Critical  
**Branch:** `feature/strategy-registry`

#### Tasks:
1. Create `strategyRegistry.js` defining all strategies
2. Define strategy metadata (id, name, type, dataSource, etc.)
3. Define combination strategy pairs
4. Update `comparisonEngine.js` to use registry

#### Strategy Definitions:

**Base Strategies:**
| ID | Name | Type | Data Source |
|----|------|------|-------------|
| `gold` | Physical Gold | gold | goldPrices.js |
| `sp500` | S&P 500 SIPP | sipp | sp500TotalReturn.js |
| `nasdaq100` | Nasdaq 100 SIPP | sipp | nasdaq100TotalReturn.js |
| `ftse100` | FTSE 100 SIPP | sipp | ftse100TotalReturn.js |

**Combination Strategies:**
| ID | Name | Components |
|----|------|------------|
| `gold-sp500` | 50% Gold + 50% S&P 500 | gold, sp500 |
| `gold-nasdaq100` | 50% Gold + 50% Nasdaq 100 | gold, nasdaq100 |
| `gold-ftse100` | 50% Gold + 50% FTSE 100 | gold, ftse100 |
| `sp500-nasdaq100` | 50% S&P 500 + 50% Nasdaq 100 | sp500, nasdaq100 |
| `sp500-ftse100` | 50% S&P 500 + 50% FTSE 100 | sp500, ftse100 |
| `nasdaq100-ftse100` | 50% Nasdaq 100 + 50% FTSE 100 | nasdaq100, ftse100 |

#### Deliverables:
- `src/calculators/strategyRegistry.js`
- `tests/calculators/strategyRegistry.test.js`

#### Test Cases:
```
given_strategyRegistry_when_gettingBaseStrategies_then_returns4Strategies
given_strategyRegistry_when_getCombinationStrategies_then_returns6Strategies
given_strategyRegistry_when_gettingStrategyById_then_returnsCorrectMetadata
given_combinationStrategy_when_gettingComponents_then_returnsBothBaseIds
```

---

### Stage 3: Synthetic ETF Calculator Refactor
**Duration:** 1 day  
**Priority:** Critical  
**Branch:** `feature/multi-index-etf`

#### Tasks:
1. Refactor `syntheticEtf.js` to support multiple indices
2. Create `getSyntheticPrice(index, year)` function
3. Each index uses its own base year normalization
4. FTSE 100 is already GBP-denominated (no currency conversion needed)

#### Synthetic Price Formulas:

**S&P 500 & Nasdaq 100 (USD → GBP):**
```javascript
syntheticPriceGBP = (indexValue[year] / indexValue[baseYear]) 
                   * basePriceGBP 
                   * (baseExchangeRate / exchangeRate[year])
```

**FTSE 100 (already GBP):**
```javascript
syntheticPriceGBP = (indexValue[year] / indexValue[baseYear]) * basePriceGBP
```

#### Deliverables:
- Updated `src/calculators/syntheticEtf.js`
- Updated `tests/calculators/syntheticEtf.test.js`

#### Test Cases:
```
given_sp500Index_when_calculatingSyntheticPrice_then_appliesCurrencyConversion
given_nasdaq100Index_when_calculatingSyntheticPrice_then_appliesCurrencyConversion
given_ftse100Index_when_calculatingSyntheticPrice_then_noCurrencyConversion
given_allIndices_when_calculatingPrices_then_allReturnValidGBPValues
```

---

### Stage 4: Individual Strategy Calculators
**Duration:** 2 days  
**Priority:** Critical  
**Branch:** `feature/individual-strategies`

#### Tasks:
1. Refactor `sippStrategy.js` into reusable base class/function
2. Create `sp500Strategy.js` using S&P 500 data
3. Create `nasdaq100Strategy.js` using Nasdaq 100 data
4. Create `ftse100Strategy.js` using FTSE 100 data
5. Update `goldStrategy.js` to support storage fee

#### Gold Strategy Updates:
```javascript
// New parameter: storageFeePctPerYear (default 0.7%)
// Applied annually as % of current gold value
// Deducted by selling gold to cover the fee
```

#### Deliverables:
- Updated `src/calculators/goldStrategy.js`
- Updated `src/calculators/sippStrategy.js` (base logic)
- New `src/calculators/sp500Strategy.js`
- New `src/calculators/nasdaq100Strategy.js`
- New `src/calculators/ftse100Strategy.js`
- Updated/new test files

#### Test Cases:
```
given_goldStrategy_when_applyingStorageFee_then_reducesGoldByFeeAmount
given_sp500Strategy_when_calculating_then_usesCorrectIndexData
given_nasdaq100Strategy_when_calculating_then_usesCorrectIndexData
given_ftse100Strategy_when_calculating_then_usesCorrectIndexData
given_ftse100Strategy_when_calculating_then_noCurrencyConversion
```

---

### Stage 5: Combined Strategy Calculator
**Duration:** 1 day  
**Priority:** Critical  
**Branch:** `feature/combined-strategy`

#### Tasks:
1. Create `combinedStrategy.js` for 50/50 splits
2. Split initial pension 50/50 between two strategies
3. Each half follows its own strategy rules
4. Merge yearly results into combined view

#### Logic:
```javascript
function calculateCombinedStrategy(
  pensionAmount,
  strategyA,
  strategyB,
  startYear,
  withdrawalRate,
  years,
  config // fees
) {
  const halfPension = pensionAmount / 2;
  const resultsA = strategyA.calculate(halfPension, ...);
  const resultsB = strategyB.calculate(halfPension, ...);
  return mergeResults(resultsA, resultsB);
}
```

#### Deliverables:
- `src/calculators/combinedStrategy.js`
- `tests/calculators/combinedStrategy.test.js`

#### Test Cases:
```
given_combinedGoldSp500_when_calculating_then_splitsInitialPension5050
given_combinedStrategy_when_calculating_then_mergesYearlyResults
given_combinedStrategy_when_oneHalfExhausts_then_continuesOtherHalf
given_combinedStrategy_when_summarizing_then_combinesBothTotals
```

---

### Stage 6: Configurable Fees & Advanced Settings
**Duration:** 1 day  
**Priority:** High  
**Branch:** `feature/configurable-fees`

#### Tasks:
1. Update `defaults.js` with new configurable values
2. Create `advancedSettings.js` component (collapsible)
3. Wire settings into calculation pipeline
4. Update existing components to pass config

#### New Configuration Values:
```javascript
export const COSTS = {
  goldTransactionPercent: 2,        // Default 2%
  goldStorageFeePercent: 0.7,       // NEW - Default 0.7%
  sippManagementFeePercent: 0.5     // Default 0.5%
};
```

#### Advanced Settings UI:
```
[▼ Advanced Settings]
  ┌─────────────────────────────────────────────┐
  │ Gold Transaction Fee:      [2.0] %          │
  │ Gold Annual Storage Fee:   [0.7] %          │
  │ SIPP Management Fee:       [0.5] %          │
  └─────────────────────────────────────────────┘
```

#### Deliverables:
- Updated `src/config/defaults.js`
- New `src/components/advancedSettings.js`
- Updated `src/app.js` to wire settings
- `tests/components/advancedSettings.test.js`

#### Test Cases:
```
given_advancedSettings_when_rendered_then_showsDefaultValues
given_advancedSettings_when_collapsed_then_hidesInputs
given_advancedSettings_when_feeChanged_then_emitsUpdateEvent
given_customStorageFee_when_calculatingGold_then_usesCustomValue
```

---

### Stage 7: Strategy Selector UI
**Duration:** 1 day  
**Priority:** High  
**Branch:** `feature/strategy-selector`

#### Tasks:
1. Update `inputForm.js` with strategy dropdowns
2. Add two dropdowns: "Strategy 1" and "Strategy 2"
3. Default to Gold vs S&P 500 SIPP
4. Group options: Base Strategies / Combined Strategies
5. Prevent selecting same strategy for both

#### UI Design:
```
Strategy 1: [▼ Physical Gold                    ]
Strategy 2: [▼ S&P 500 SIPP                     ]

Options (grouped):
─── Base Strategies ───
  Physical Gold
  S&P 500 SIPP
  Nasdaq 100 SIPP
  FTSE 100 SIPP
─── Combined (50/50) ───
  50% Gold + 50% S&P 500
  50% Gold + 50% Nasdaq 100
  50% Gold + 50% FTSE 100
  50% S&P 500 + 50% Nasdaq 100
  50% S&P 500 + 50% FTSE 100
  50% Nasdaq 100 + 50% FTSE 100
```

#### Deliverables:
- Updated `src/components/inputForm.js`
- Updated `tests/components/inputForm.test.js`

#### Test Cases:
```
given_inputForm_when_rendered_then_showsTwoStrategyDropdowns
given_inputForm_when_rendered_then_defaultsToGoldVsSp500
given_inputForm_when_selectingSameStrategy_then_preventsSelection
given_inputForm_when_strategyChanged_then_emitsUpdateEvent
given_inputForm_when_rendered_then_showsGroupedOptions
```

---

### Stage 8: Dynamic Results & Summary
**Duration:** 1-2 days  
**Priority:** High  
**Branch:** `feature/dynamic-results`

#### Tasks:
1. Update `resultsTable.js` for dynamic column headers
2. Update `summary.js` for dynamic strategy names
3. Update comparison engine for strategy-agnostic comparison
4. Update chart component for dynamic strategies

#### Dynamic Table Columns:
- Gold strategies: Gold Price, Holdings (oz), Storage Fee
- SIPP strategies: Unit Price, Units Held, Management Fee
- Combined: Merged view with both asset types

#### Deliverables:
- Updated `src/components/resultsTable.js`
- Updated `src/components/summary.js`
- Updated `src/components/chart.js`
- Updated `src/calculators/comparisonEngine.js`
- Updated test files

---

### Stage 9: Disclaimers & Legal Notices
**Duration:** 0.5 days  
**Priority:** Medium  
**Branch:** `feature/disclaimers`

#### Tasks:
1. Create `disclaimer.js` component
2. Add disclaimers to UI footer
3. Show relevant disclaimers based on selected strategies

#### Disclaimer Content:

**Gold CGT Exemption:**
> Physical gold held in the form of UK legal tender coins (e.g., Sovereigns, Britannias) is exempt from Capital Gains Tax. Gold bullion bars may also be CGT-exempt if purchased from LBMA-approved dealers. This model assumes CGT-exempt gold.

**Pre-2015 Pension Rules:**
> Prior to April 2015 ("Pension Freedoms"), full withdrawal of pension funds was restricted. Most savers were required to purchase an annuity or enter drawdown with limits. This model allows full withdrawal for historical comparison purposes only - such withdrawals would not have been possible before 2015.

**General Disclaimer:**
> This tool is for illustrative purposes only and does not constitute financial advice. Past performance does not guarantee future results. Consult a qualified financial advisor before making pension decisions.

#### Deliverables:
- `src/components/disclaimer.js`
- Updated `index.html` or `app.js` to include disclaimers

---

### Stage 10: Testing & Documentation
**Duration:** 1 day  
**Priority:** High  
**Branch:** `feature/testing-docs`

#### Tasks:
1. Ensure >90% test coverage
2. Update AGENTS.md with new architecture
3. Update README.md with new features
4. Update PDD.md (already done in this plan)

#### Coverage Targets:
| Area | Target |
|------|--------|
| Calculators | 100% branch coverage |
| Components | 90% line coverage |
| Data modules | 100% completeness tests |
| Utils | 100% coverage |

---

### Stage 11: Final Integration & Deployment
**Duration:** 0.5 days  
**Priority:** High  
**Branch:** `main`

#### Tasks:
1. Merge all feature branches
2. Full integration testing
3. Visual regression check
4. Deploy to GitHub Pages
5. Verify production deployment

---

## Timeline Summary

| Stage | Duration | Dependencies |
|-------|----------|--------------|
| 1. Historical Data | 1-2 days | None |
| 2. Strategy Registry | 1 day | None |
| 3. Synthetic ETF Refactor | 1 day | Stage 1 |
| 4. Individual Strategies | 2 days | Stages 1, 2, 3 |
| 5. Combined Strategy | 1 day | Stage 4 |
| 6. Configurable Fees | 1 day | Stages 4, 5 |
| 7. Strategy Selector UI | 1 day | Stage 2 |
| 8. Dynamic Results | 1-2 days | Stages 4, 5, 7 |
| 9. Disclaimers | 0.5 days | None |
| 10. Testing & Docs | 1 day | All |
| 11. Deployment | 0.5 days | All |

**Total Estimated Duration:** 10-13 days

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Nasdaq 100 data unavailable pre-1985 | Medium | Medium | Index started 1985; use proxy or limit start year |
| FTSE 100 TR data gaps | Low | Medium | Multiple sources available |
| Complex combined strategy logic | Medium | Low | Thorough unit testing |
| UI complexity with 10 strategies | Medium | Medium | Clear grouping, good UX |

---

## Dependencies

### External Data Required:
- Nasdaq 100 Total Return Index (1985-2026)
- FTSE 100 Total Return Index (1984-2026)

### Notes:
- Nasdaq 100 index launched January 1985 (cannot go back to 1980)
- FTSE 100 index launched January 1984 (cannot go back to 1980)
- May need to adjust YEAR_RANGE.min or show warnings for these indices

---

## Success Criteria

1. ✅ All 10 strategies selectable and functional
2. ✅ Fees configurable via advanced settings
3. ✅ Disclaimers visible and accurate
4. ✅ All calculations verified against manual checks
5. ✅ >90% test coverage maintained
6. ✅ Responsive design works on mobile
7. ✅ No performance degradation with new strategies
