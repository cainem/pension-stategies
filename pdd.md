# Product Definition Document (PDD)
## Pension Strategy Comparison Tool

**Version:** 1.0
**Date:** January 19, 2026
**Status:** Draft

---

## 1. Executive Summary

This document defines a client-side web application that enables users to compare two pension withdrawal strategies over a configurable time period (default 25 years). The application will be hosted on GitHub Pages with no server-side processing, using JavaScript for all calculations and dynamic content.

The two strategies compared are:
1. **Gold Strategy**: Withdraw entire pension, pay applicable taxes, purchase physical gold
2. **S&P 500 SIPP Strategy**: Keep pension invested in an S&P 500 tracker within a SIPP

---

## 2. Problem Statement

Pension holders face complex decisions about withdrawal strategies. The relative merits of:
- Taking a lump sum to purchase physical assets (gold) vs.
- Keeping funds invested in market-tracking instruments

...are not immediately apparent due to:
- Complex tax implications
- Transaction costs
- Market volatility
- Changing tax regimes over time

This tool provides a year-by-year comparison to illustrate the trade-offs between these approaches.

---

## 3. Target Users

- UK pension holders considering withdrawal strategies
- Financial advisors comparing strategies for clients
- Individuals interested in gold vs. equity investment performance

---

## 4. Functional Requirements

### 4.1 User Inputs

| Input | Type | Default | Range/Constraints |
|-------|------|---------|-------------------|
| Starting Pension Amount | Currency (GBP) | £500,000 | £10,000 - £10,000,000 |
| Starting Year | Year selector | 2000 | 2000 - 2025 |
| Annual Withdrawal Rate | Percentage | 4% | 1% - 10% |
| Comparison Period | Years | 25 | 5 - 30 |

### 4.2 Gold Strategy Calculations

#### Initial Setup (Year 0)
1. Calculate tax on full pension withdrawal:
   - 25% tax-free lump sum
   - Remaining 75% taxed at applicable income tax rates for that year
   - Personal allowance applied
2. Calculate net amount after tax
3. Apply 2% transaction cost for gold purchase
4. Calculate gold quantity purchased at Jan 1st spot price

#### Annual Withdrawal (Years 1-N)
1. Calculate withdrawal amount: 4% of **original gross pension** (not current balance)
2. No income tax on gold sales (physical gold is CGT-exempt)
3. Apply 2% transaction cost on sale
4. Reduce gold holdings by equivalent weight at Jan 1st spot price
5. Track remaining gold quantity and GBP value

### 4.3 S&P 500 SIPP Strategy Calculations

#### Initial Setup (Year 0)
1. Full pension amount remains in SIPP (no initial tax)
2. Apply 0.5% annual management fee
3. Calculate units purchased at Jan 1st synthetic VUAG price

#### Annual Withdrawal (Years 1-N)
1. Calculate withdrawal amount: 4% of **original gross pension**
2. Apply income tax at applicable rates:
   - 25% tax-free portion
   - Remaining 75% taxed as income
   - Personal allowance applied
3. Apply 0.5% management fee on remaining balance
4. Reduce ETF holdings by units sold at Jan 1st price
5. Track remaining units and GBP value

### 4.4 Tax Calculations

The system must handle historical UK tax regimes including:

| Tax Component | Variability |
|---------------|-------------|
| Personal Allowance | Changes annually (£4,385 in 2000 → £12,570 in 2024) |
| Basic Rate Band | Changes over time |
| Basic Rate | 22% → 20% (changed in 2008) |
| Higher Rate Band | Changes over time |
| Higher Rate | 40% |
| Additional Rate | Introduced 2010 at 50%, reduced to 45% in 2013 |

### 4.5 Display Requirements

#### Layout
- Two-column responsive layout
- Gold strategy on left, S&P 500 strategy on right
- Side-by-side comparison tables

#### Year-by-Year Table Columns

**Gold Strategy:**
| Column | Description |
|--------|-------------|
| Year | Calendar year |
| Gold Price (GBP/oz) | Jan 1st spot price |
| Gold Holdings (oz) | Remaining gold quantity |
| Withdrawal (Gross) | Target withdrawal amount |
| Transaction Cost | 2% of sale |
| Net Received | After transaction cost |
| Portfolio Value (GBP) | Current value of remaining gold |

**S&P 500 Strategy:**
| Column | Description |
|--------|-------------|
| Year | Calendar year |
| Synthetic Price (GBP) | Jan 1st price |
| Units Held | Remaining ETF units |
| Withdrawal (Gross) | Target withdrawal amount |
| Tax Paid | Income tax on withdrawal |
| Management Fee | 0.5% of portfolio |
| Net Received | After tax |
| Portfolio Value (GBP) | Current value of remaining ETF |

### 4.6 Edge Cases

1. **Funds Exhausted**: If either strategy runs out of money:
   - Display "EXHAUSTED" in remaining years
   - Show year funds ran out prominently
   - Continue showing the other strategy

2. **Final Year Summary**:
   - Total withdrawn over period
   - Total tax paid
   - Total fees paid
   - Remaining portfolio value
   - Effective return percentage

---

## 5. Non-Functional Requirements

### 5.1 Technical Constraints
- **No server-side processing** - GitHub Pages static hosting only
- **Client-side only** - All calculations in JavaScript
- **No external API calls at runtime** - All data hardcoded/cached

### 5.2 Data Requirements

All historical data will be hardcoded in JavaScript files:

| Data Type | Source | Frequency |
|-----------|--------|-----------|
| Gold spot price (GBP) | Historical records | Jan 1st annually |
| S&P 500 Total Return Index | Historical records | Jan 1st annually |
| GBP/USD Exchange Rate | Historical records | Jan 1st annually |
| UK Tax Bands | HMRC historical data | Annual |
| UK Personal Allowance | HMRC historical data | Annual |

### 5.3 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript
- No IE11 support required

### 5.4 Accessibility
- Semantic HTML
- Keyboard navigable
- Screen reader compatible tables
- Sufficient colour contrast

---

## 6. Data Sources (for hardcoding)

| Data | Recommended Source |
|------|--------------------|
| Gold Prices | World Gold Council / LBMA historical data |
| S&P 500 TR Index | S&P Global / Yahoo Finance historical |
| GBP/USD Rates | Bank of England historical data |
| UK Tax History | HMRC / legislation.gov.uk |

---

## 7. Assumptions

1. **Pension withdrawal in 2000**: The Finance Act 1995 introduced flexible drawdown options. Full withdrawal was possible but with significant tax implications. The model assumes this was permissible.

2. **Physical Gold**: UK sovereign coins and gold bullion are exempt from Capital Gains Tax. The model assumes purchase of CGT-exempt gold.

3. **Single Annual Transaction**: All withdrawals occur on January 1st of each year at that day's price.

4. **No Inflation Adjustment**: All figures are nominal (not inflation-adjusted).

5. **Only Income Source**: The pension withdrawal is assumed to be the user's only income (personal allowance fully available).

6. **Synthetic ETF Pricing**: Pre-2019 VUAG prices are synthetically calculated from S&P 500 TR Index and GBP/USD rates.

---

## 8. Out of Scope (Version 1.0)

- Inflation adjustment
- Visual charts/graphs
- Multiple concurrent scenarios
- PDF export
- Saving/loading configurations
- Currency other than GBP
- Tax implications of death/inheritance
- State pension integration
- Lifetime Allowance considerations (abolished 2024)

---

## 9. Success Criteria

1. Users can configure all input parameters
2. Year-by-year calculations display correctly for both strategies
3. Tax calculations are accurate for all years 2000-2025
4. Edge case of exhausted funds is handled gracefully
5. All calculations match manual verification
6. Site loads and functions without any server-side processing
7. All code is unit tested with >90% coverage

---

## 10. Glossary

| Term | Definition |
|------|------------|
| SIPP | Self-Invested Personal Pension |
| CGT | Capital Gains Tax |
| VUAG | Vanguard S&P 500 UCITS ETF (Accumulating) |
| Spot Price | Current market price for immediate delivery |
| Total Return Index | Index including reinvested dividends |
| Personal Allowance | Amount of income not subject to tax |
| Drawdown | Withdrawing funds from a pension |
