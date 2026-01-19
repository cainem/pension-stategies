# Implementation Plan
## Pension Strategy Comparison Tool

**Version:** 1.0  
**Date:** January 19, 2026

---

## Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Vanilla JavaScript + ES6 Modules | No build step required, GitHub Pages compatible |
| Styling | CSS3 with CSS Custom Properties | Native, no dependencies |
| Testing | Vitest | Fast, modern, ESM-native, works with vanilla JS |
| Build Tool | Vite | Minimal config, excellent dev experience, test integration |
| Hosting | GitHub Pages | As specified in requirements |

---

## Project Structure

```
pension-strategies/
├── index.html                    # Main entry point
├── css/
│   └── styles.css               # All styling
├── src/
│   ├── main.js                  # Application entry point
│   ├── app.js                   # Main application orchestration
│   ├── config/
│   │   └── defaults.js          # Default configuration values
│   ├── data/
│   │   ├── goldPrices.js        # Historical gold prices (GBP)
│   │   ├── sp500TotalReturn.js  # S&P 500 TR Index values
│   │   ├── exchangeRates.js     # GBP/USD exchange rates
│   │   └── ukTaxData.js         # UK tax bands and rates by year
│   ├── calculators/
│   │   ├── taxCalculator.js     # UK income tax calculations
│   │   ├── goldStrategy.js      # Gold strategy calculations
│   │   ├── sippStrategy.js      # S&P 500 SIPP calculations
│   │   └── syntheticEtf.js      # Synthetic VUAG price calculation
│   ├── components/
│   │   ├── inputForm.js         # User input form component
│   │   ├── resultsTable.js      # Results table renderer
│   │   └── summary.js           # Final summary component
│   └── utils/
│       ├── formatters.js        # Currency/number formatting
│       └── validators.js        # Input validation
├── tests/
│   ├── data/
│   │   └── ukTaxData.test.js
│   ├── calculators/
│   │   ├── taxCalculator.test.js
│   │   ├── goldStrategy.test.js
│   │   ├── sippStrategy.test.js
│   │   └── syntheticEtf.test.js
│   ├── components/
│   │   ├── inputForm.test.js
│   │   └── resultsTable.test.js
│   └── utils/
│       ├── formatters.test.js
│       └── validators.test.js
├── docs/
│   ├── pdd.md
│   ├── implementation_plan.md
│   └── AGENTS.md
├── package.json
├── vite.config.js
└── README.md
```

---

## Implementation Stages

### Stage 1: Project Setup & Infrastructure
**Duration:** 1 day  
**Priority:** Critical

#### Tasks:
1. Initialize npm project with package.json
2. Configure Vite for development and production builds
3. Configure Vitest for testing
4. Configure ESLint for code quality
5. Create basic HTML structure
6. Set up CSS with custom properties for theming
7. Create folder structure
8. Configure GitHub Actions for deployment
9. Add VS Code settings for consistent development

#### Deliverables:
- Working dev server (`npm run dev`)
- Test runner (`npm test`)
- Linter (`npm run lint`)
- Build command (`npm run build`)
- Basic responsive two-column layout

#### Acceptance Criteria:
- [ ] `npm run dev` starts local development server
- [ ] `npm test` runs test suite
- [ ] `npm run lint` checks code quality with no errors
- [ ] `npm run build` creates production build
- [ ] HTML passes W3C validation
- [ ] CSS uses custom properties for key values
- [ ] ESLint configured for ES6 modules

---

### Stage 2: Historical Data Collection & Hardcoding
**Duration:** 2 days  
**Priority:** Critical

#### Tasks:
1. Research and collect gold prices (GBP) for Jan 1st, 2000-2026
2. Research and collect S&P 500 Total Return Index values for Jan 1st, 2000-2026
3. Research and collect GBP/USD exchange rates for Jan 1st, 2000-2026
4. Research UK tax history:
   - Personal allowance by year
   - Basic rate and threshold by year
   - Higher rate and threshold by year
   - Additional rate (from 2010) and threshold by year
5. Create data modules with proper exports
6. Document data sources in code comments

#### Deliverables:
- `goldPrices.js` - Gold spot prices
- `sp500TotalReturn.js` - S&P 500 TR Index
- `exchangeRates.js` - GBP/USD rates
- `ukTaxData.js` - Complete tax regime history

#### Acceptance Criteria:
- [ ] All data files contain Jan 1st values for years 2000-2026
- [ ] Data sources documented in comments
- [ ] Data exported as ES6 modules
- [ ] Unit tests verify data structure and completeness

#### Test Cases:
```
given_goldPrices_when_accessingYear2000_then_returnsValidPrice
given_goldPrices_when_accessingAllYears_then_allYearsPresent
given_ukTaxData_when_accessingYear2000_then_returnsCorrectPersonalAllowance
given_ukTaxData_when_accessingYear2010_then_includesAdditionalRate
```

---

### Stage 3: Tax Calculator Module
**Duration:** 2 days  
**Priority:** Critical

#### Tasks:
1. Implement `calculateIncomeTax(grossIncome, year)` function
2. Handle personal allowance
3. Handle basic rate band
4. Handle higher rate band
5. Handle additional rate (post-2010)
6. Implement pension-specific tax (25% tax-free)
7. Handle edge cases (income below personal allowance, etc.)

#### Deliverables:
- `taxCalculator.js` with full tax calculation logic
- Comprehensive test suite

#### Acceptance Criteria:
- [ ] Correctly calculates tax for all years 2000-2026
- [ ] Handles 25% tax-free pension portion
- [ ] Returns breakdown: { grossIncome, taxFree, taxable, taxPaid, netIncome }
- [ ] All branches covered by unit tests

#### Test Cases:
```
given_income10000_when_calculatingTaxFor2000_then_appliesCorrectPersonalAllowance
given_income50000_when_calculatingTaxFor2000_then_appliesBasicAndHigherRates
given_income200000_when_calculatingTaxFor2015_then_appliesAdditionalRate
given_pensionWithdrawal_when_calculatingTax_then_applies25PercentTaxFree
given_incomeZero_when_calculatingTax_then_returnsZeroTax
given_incomeBelowAllowance_when_calculatingTax_then_returnsZeroTax
given_incomeExactlyAtBasicThreshold_when_calculatingTax_then_noHigherRateTax
```

---

### Stage 4: Synthetic ETF Price Calculator
**Duration:** 1 day  
**Priority:** Critical

#### Tasks:
1. Implement synthetic VUAG price calculation
2. Formula: `syntheticPrice = (sp500TRIndex / baseIndex) * baseGBP / exchangeRate`
3. Normalize to sensible GBP unit price
4. Create lookup function by year

#### Deliverables:
- `syntheticEtf.js` with price calculation logic
- Test suite

#### Acceptance Criteria:
- [ ] Returns GBP price for any year 2000-2026
- [ ] Accounts for S&P 500 total return
- [ ] Accounts for GBP/USD exchange rate
- [ ] Consistent scaling across all years

#### Test Cases:
```
given_year2000_when_calculatingSyntheticPrice_then_returnsBasePrice
given_year2020_when_calculatingSyntheticPrice_then_reflectsGrowth
given_exchangeRateIncrease_when_calculatingPrice_then_reducesGBPPrice
given_sp500Increase_when_calculatingPrice_then_increasesGBPPrice
```

---

### Stage 5: Gold Strategy Calculator
**Duration:** 2 days  
**Priority:** Critical

#### Tasks:
1. Implement initial pension withdrawal calculation
   - Calculate tax on full withdrawal
   - Apply 25% tax-free portion
   - Deduct tax from remaining 75%
2. Calculate gold purchase
   - Net amount after tax
   - Apply 2% transaction cost
   - Calculate ounces at spot price
3. Implement annual withdrawal calculation
   - Calculate 4% of original gross
   - Apply 2% transaction cost
   - Calculate ounces sold
   - Update remaining balance
4. Handle fund exhaustion scenario

#### Deliverables:
- `goldStrategy.js` with complete strategy logic
- Test suite

#### Acceptance Criteria:
- [ ] Correctly calculates initial tax and gold purchase
- [ ] Correctly calculates annual withdrawals
- [ ] Applies 2% transaction cost on all gold trades
- [ ] Tracks gold ounces and GBP value
- [ ] Handles fund exhaustion gracefully

#### Test Cases:
```
given_500000Pension_when_withdrawingIn2000_then_calculatesCorrectTax
given_500000Pension_when_buyingGold_then_applies2PercentFee
given_goldHoldings_when_withdrawing4Percent_then_reducesCorrectOunces
given_lowGoldBalance_when_withdrawing_then_exhaustsFundsGracefully
given_goldPriceIncrease_when_calculatingValue_then_reflectsNewPrice
given_multipleYears_when_simulating_then_tracksRunningBalance
```

---

### Stage 6: SIPP Strategy Calculator
**Duration:** 2 days  
**Priority:** Critical

#### Tasks:
1. Implement initial investment calculation
   - Full amount stays in SIPP
   - Calculate initial units at synthetic price
2. Implement annual management fee (0.5%)
3. Implement annual withdrawal calculation
   - Calculate 4% of original gross
   - Calculate tax on withdrawal (25% tax-free)
   - Calculate units sold
   - Update remaining balance
4. Handle fund exhaustion scenario

#### Deliverables:
- `sippStrategy.js` with complete strategy logic
- Test suite

#### Acceptance Criteria:
- [ ] Full pension amount invested initially
- [ ] Correctly applies 0.5% annual management fee
- [ ] Correctly calculates tax on withdrawals
- [ ] Tracks units and GBP value
- [ ] Handles fund exhaustion gracefully

#### Test Cases:
```
given_500000Pension_when_investingIn2000_then_calculatesCorrectUnits
given_sippBalance_when_applyingManagementFee_then_deducts0Point5Percent
given_withdrawal_when_calculatingTax_then_applies25PercentTaxFree
given_lowBalance_when_withdrawing_then_exhaustsFundsGracefully
given_priceIncrease_when_calculatingValue_then_reflectsGrowth
given_multipleYears_when_simulating_then_tracksRunningBalance
```

---

### Stage 7: Input Form Component
**Duration:** 1 day  
**Priority:** High

#### Tasks:
1. Create form HTML structure
2. Implement input validation
3. Create form state management
4. Implement change handlers
5. Style form responsively

#### Deliverables:
- `inputForm.js` component
- `validators.js` utility module
- Test suites

#### Acceptance Criteria:
- [ ] All inputs have appropriate defaults
- [ ] Validation provides clear error messages
- [ ] Form is accessible (labels, ARIA)
- [ ] Form is responsive

#### Test Cases:
```
given_emptyPensionAmount_when_validating_then_returnsError
given_negativeWithdrawalRate_when_validating_then_returnsError
given_yearBefore2000_when_validating_then_returnsError
given_validInputs_when_validating_then_returnsSuccess
given_nonNumericInput_when_validating_then_returnsError
```

---

### Stage 8: Results Table Component
**Duration:** 2 days  
**Priority:** High

#### Tasks:
1. Create table HTML structure
2. Implement table rendering from calculation results
3. Style tables for side-by-side display
4. Handle "EXHAUSTED" state display
5. Implement responsive behaviour (stack on mobile)
6. Add row highlighting for key events

#### Deliverables:
- `resultsTable.js` component
- `formatters.js` utility module
- Test suites

#### Acceptance Criteria:
- [ ] Tables display all required columns
- [ ] Currency formatting is consistent
- [ ] Exhausted funds clearly indicated
- [ ] Tables are responsive
- [ ] Tables are accessible

#### Test Cases:
```
given_calculationResults_when_rendering_then_displaysAllYears
given_exhaustedFunds_when_rendering_then_showsExhaustedMessage
given_currencyValue_when_formatting_then_displaysPoundSign
given_largeNumber_when_formatting_then_usesThousandsSeparator
given_negativeValue_when_formatting_then_displaysCorrectly
```

---

### Stage 9: Summary Component
**Duration:** 1 day  
**Priority:** High

#### Tasks:
1. Create summary section HTML
2. Calculate totals for each strategy:
   - Total withdrawn
   - Total tax paid
   - Total fees paid
   - Final portfolio value
3. Display winner/comparison

#### Deliverables:
- `summary.js` component
- Test suite

#### Acceptance Criteria:
- [ ] Displays all summary statistics
- [ ] Clearly shows which strategy performed better
- [ ] Handles exhausted funds scenario

#### Test Cases:
```
given_completedSimulation_when_summarizing_then_calculatesCorrectTotals
given_goldStrategyWins_when_summarizing_then_indicatesGoldBetter
given_sippStrategyWins_when_summarizing_then_indicatesSippBetter
given_fundsExhausted_when_summarizing_then_notesExhaustion
```

---

### Stage 10: Application Integration
**Duration:** 1 day  
**Priority:** High

#### Tasks:
1. Wire up form to calculators
2. Implement "Calculate" button handler
3. Integrate all components
4. Add loading states
5. Handle errors gracefully

#### Deliverables:
- `app.js` orchestration module
- `main.js` entry point
- Integration tests

#### Acceptance Criteria:
- [ ] Form submission triggers calculations
- [ ] Results display correctly
- [ ] Errors are caught and displayed
- [ ] Application is usable end-to-end

#### Test Cases:
```
given_validInputs_when_calculating_then_displaysResults
given_invalidInputs_when_calculating_then_displaysErrors
given_calculationError_when_running_then_handlesGracefully
```

---

### Stage 11: Polish & Deployment
**Duration:** 1 day  
**Priority:** Medium

#### Tasks:
1. Final CSS polish
2. Add page metadata (title, description, favicon)
3. Add README documentation
4. Configure GitHub Pages deployment
5. Test production build
6. Cross-browser testing

#### Deliverables:
- Production-ready application
- Complete documentation
- GitHub Pages deployment

#### Acceptance Criteria:
- [ ] Site loads correctly on GitHub Pages
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Lighthouse accessibility score > 90
- [ ] README explains usage

---

## Timeline Summary

| Stage | Description | Duration | Dependencies |
|-------|-------------|----------|--------------|
| 1 | Project Setup | 1 day | None |
| 2 | Historical Data | 2 days | Stage 1 |
| 3 | Tax Calculator | 2 days | Stage 2 |
| 4 | Synthetic ETF | 1 day | Stage 2 |
| 5 | Gold Strategy | 2 days | Stages 3, 2 |
| 6 | SIPP Strategy | 2 days | Stages 3, 4 |
| 7 | Input Form | 1 day | Stage 1 |
| 8 | Results Table | 2 days | Stage 1 |
| 9 | Summary Component | 1 day | Stage 8 |
| 10 | Integration | 1 day | Stages 5-9 |
| 11 | Polish & Deploy | 1 day | Stage 10 |

**Total Estimated Duration:** 16 days

---

## Testing Strategy

### Unit Tests
- All calculator functions
- All utility functions
- All validation functions
- Data module structure

### Component Tests
- Form renders correctly
- Table renders correctly
- Summary renders correctly

### Integration Tests
- End-to-end calculation flow
- Form → Calculation → Display

### Test Naming Convention
All tests follow the pattern:
```
given_[precondition]_when_[action]_then_[expectedResult]
```

### Coverage Target
- Minimum 90% line coverage
- 100% branch coverage for calculator modules

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Incorrect historical data | Multiple source verification, documented sources |
| Tax calculation errors | Extensive test cases, manual verification against HMRC examples |
| Browser compatibility | Use only widely-supported ES6 features |
| Performance with large calculations | Keep calculations simple, no complex loops |
| GitHub Pages caching | Version assets appropriately |
