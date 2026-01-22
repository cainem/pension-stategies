# Product Definition Document (PDD)
## Pension Strategy Comparison Tool

**Version:** 2.0  
**Date:** January 20, 2026  
**Status:** Draft

---

## 1. Executive Summary

This document defines a client-side web application that enables users to compare pension withdrawal strategies over a configurable time period (default 25 years). The application will be hosted on GitHub Pages with no server-side processing, using JavaScript for all calculations and dynamic content.

### 1.1 Available Strategies

**6 Base Strategies:**
1. **Physical Gold**: Withdraw pension, pay tax, purchase CGT-exempt gold coins
2. **Gold ETF SIPP**: Keep pension invested in a Gold ETF tracker within a SIPP
3. **S&P 500 SIPP**: Keep pension invested in an S&P 500 tracker within a SIPP
4. **Nasdaq 100 SIPP**: Keep pension invested in a Nasdaq 100 tracker within a SIPP
5. **FTSE 100 SIPP**: Keep pension invested in a FTSE 100 tracker within a SIPP
6. **US Long Treasury SIPP**: Keep pension invested in US 20+ year Treasury bond ETF within a SIPP

**15 Combination Strategies (50/50 splits):**
Includes various pairings of the above base strategies (e.g., Gold + S&P 500, S&P 500 + US Treasuries, etc.)

Users select **any 2 strategies** to compare side-by-side.

---

## 2. Problem Statement

Pension holders face complex decisions about withdrawal strategies. The relative merits of:
- Taking a lump sum to purchase physical assets (gold) vs.
- Keeping funds invested in market-tracking instruments (equities)
- Diversifying across multiple asset classes

...are not immediately apparent due to:
- Complex tax implications
- Transaction and storage costs
- Market volatility
- Currency fluctuations (for non-GBP assets)
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
| Starting Year | Year selector | 2001 | 1980 - 2026* |
| Annual Withdrawal Rate | Percentage | 5% | 1% - 10% |
| Comparison Period | Years | 25 | 5 - 30 |
| Strategy 1 | Dropdown | Physical Gold | Any of 21 strategies |
| Strategy 2 | Dropdown | S&P 500 SIPP | Any of 21 strategies |

*Note: Some indices have limited historical data:
- Nasdaq 100: Available from 1985 onwards
- FTSE 100: Available from 1984 onwards
- US Treasury: Available from 1980 onwards

### 4.2 Advanced Settings (Collapsible)

| Setting | Default | Range |
|---------|---------|-------|
| Gold Transaction Fee | 3% | 0% - 10% |
| Gold Storage Fee | 0% | 0% - 5% |
| SIPP Management Fee | 0.5% | 0% - 3% |
| Maintain Purchasing Power | Enabled | Boolean |

### 4.3 Gold Strategy Calculations

#### Initial Setup (Year 0)
1. Calculate tax on full pension withdrawal:
   - 25% tax-free lump sum (PCLS)
   - Remaining 75% taxed at applicable income tax rates for that year
   - Personal allowance applied
2. Calculate net amount after tax
3. Apply transaction fee (default 2%) for gold purchase
4. Calculate gold quantity purchased at Jan 1st spot price

#### Annual Operations (Years 1-N)
1. **Storage fee**: Deduct annual storage fee (default 0%) by selling gold
2. **Withdrawal**: Calculate target withdrawal. By default, this is adjusted for UK CPI inflation annually to maintain purchasing power.
3. Apply transaction fee (default 3%) on gold sale
4. No income tax on gold sales (physical gold coins are CGT-exempt)
5. Reduce gold holdings by equivalent weight at Jan 1st spot price
6. Track remaining gold quantity and GBP value

### 4.4 SIPP Strategy Calculations (S&P 500, Nasdaq 100, FTSE 100)

#### Initial Setup (Year 0)
1. Full pension amount remains in SIPP (no initial tax)
2. Calculate units purchased at Jan 1st synthetic price

#### Annual Operations (Years 1-N)
1. **Management fee**: Apply fee (default 0.5%) on total balance
2. **Withdrawal**: Calculate target withdrawal. By default, this is adjusted for UK CPI inflation annually to maintain purchasing power.
3. Apply income tax at applicable rates:
   - 25% tax-free portion (PCLS)
   - Remaining 75% taxed as income
   - Personal allowance applied
4. Reduce ETF holdings by units sold at Jan 1st price
5. Track remaining units and GBP value

### 4.5 Combined Strategy Calculations (50/50)

For combined strategies:
1. Split initial pension 50/50 between the two component strategies
2. Each half follows its respective strategy rules independently
3. Annual withdrawal target is split 50/50 between both halves
4. Results are merged for display (total portfolio value, total withdrawn, etc.)

### 4.6 Tax Calculations

The system must handle historical UK tax regimes from 1980-2026:

| Tax Component | Variability |
|---------------|-------------|
| Personal Allowance | Changes annually (£1,375 in 1980 → £12,570 in 2024) |
| Basic Rate | 30% (1980-1987) → 25% (1988) → 22% (1999) → 20% (2008+) |
| Higher Rate | 60% (1980-1987) → 40% (1988+) |
| Additional Rate | Introduced 2010 at 50%, reduced to 45% in 2013 |

### 4.7 Display Requirements

#### Layout
- Two-column responsive layout
- Selected Strategy 1 on left, Strategy 2 on right
- Side-by-side comparison tables

#### Strategy Selector
- Two dropdowns to select strategies to compare
- Default: Physical Gold vs S&P 500 SIPP
- Options grouped: Base Strategies / Combined (50/50)
- Cannot select same strategy for both

#### Advanced Settings (Collapsible)
- Hidden by default (click to expand)
- Contains fee configuration inputs
- Changes trigger recalculation

#### Year-by-Year Table Columns

**Gold Strategy:**
| Column | Description |
|--------|-------------|
| Year | Calendar year |
| Gold Price (GBP/oz) | Jan 1st spot price |
| Gold Holdings (oz) | Remaining gold quantity |
| Storage Fee | Annual storage cost (in GBP) |
| Withdrawal (Gross) | Target withdrawal amount |
| Transaction Cost | Fee on sale |
| Net Received | After transaction cost |
| Portfolio Value (GBP) | Current value of remaining gold |

**SIPP Strategies (S&P 500 / Nasdaq 100 / FTSE 100):**
| Column | Description |
|--------|-------------|
| Year | Calendar year |
| Unit Price (GBP) | Jan 1st synthetic price |
| Units Held | Remaining ETF units |
| Management Fee | Annual fee (in GBP) |
| Withdrawal (Gross) | Target withdrawal amount |
| Tax Paid | Income tax on withdrawal |
| Net Received | After tax |
| Portfolio Value (GBP) | Current value of remaining ETF |

### 4.8 Edge Cases

1. **Funds Exhausted**: If either strategy runs out of money:
   - Display "EXHAUSTED" in remaining years
   - Show year funds ran out prominently
   - Continue showing the other strategy

2. **Index Not Available**: If selected index doesn't exist for start year:
   - Show warning message
   - Suggest earliest available year for that index

3. **Combined Strategy Partial Exhaustion**:
   - If one half exhausts, continue with remaining half
   - Clearly indicate which portion exhausted

4. **Final Year Summary**:
   - Total withdrawn over period
   - Total tax paid
   - Total fees paid (transaction, storage, management)
   - Remaining portfolio value
   - Effective return percentage

---

## 5. Non-Functional Requirements

### 5.1 Technical Constraints
- **No server-side processing** - GitHub Pages static hosting only
- **Client-side only** - All calculations in JavaScript
- **No external API calls at runtime** - All data hardcoded

### 5.2 Data Requirements

All historical data will be hardcoded in JavaScript files:

| Data Type | Source | Years | Frequency |
|-----------|--------|-------|-----------|
| Gold spot price (GBP) | LBMA / World Gold Council | 1980-2026 | Jan 1st annually |
| S&P 500 Total Return Index | S&P Dow Jones Indices | 1980-2026 | Jan 1st annually |
| Nasdaq 100 Total Return Index | Nasdaq | 1985-2026 | Jan 1st annually |
| FTSE 100 Total Return Index | FTSE Russell | 1984-2026 | Jan 1st annually |
| US Long Treasury TR Index | Bloomberg / ICE | 1980-2026 | Jan 1st annually |
| UK CPI Inflation | ONS | 1980-2026 | Annual |
| GBP/USD Exchange Rate | Bank of England | 1980-2026 | Jan 1st annually |
| UK Tax Bands | HMRC historical data | 1980-2026 | Annual |

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
| Nasdaq 100 TR Index | Nasdaq.com / Yahoo Finance (^NDX) |
| FTSE 100 TR Index | FTSE Russell / Yahoo Finance (^FTTR) |
| US Treasuries | Bloomberg/ICE US Treasury 20+ Year TR |
| UK Inflation | ONS Consumer Price Index (CPI) |
| GBP/USD Rates | Bank of England historical data |
| UK Tax History | HMRC / legislation.gov.uk |

---

## 7. Important Disclaimers

### 7.1 Gold CGT Exemption
Physical gold held in the form of **UK legal tender coins** (e.g., Sovereigns, Britannias) is exempt from Capital Gains Tax. Gold bullion bars may also be CGT-exempt if purchased from LBMA-approved dealers. **This model assumes CGT-exempt gold coins are held.**

### 7.2 Pre-2015 Pension Rules
Prior to April 2015 ("Pension Freedoms"), full withdrawal of pension funds was heavily restricted:
- Most savers were required to purchase an annuity
- Flexible drawdown was limited
- "Trivial commutation" rules applied for small pots

**This model allows full withdrawal for historical comparison purposes only - such withdrawals would not have been possible before 2015 for most pension holders.**

### 7.3 General Disclaimer
This tool is for **illustrative purposes only** and does not constitute financial advice. Past performance does not guarantee future results. Tax rules may change. Consult a qualified financial advisor before making pension decisions.

---

## 8. Assumptions

1. **Pension Withdrawal Flexibility**: The model assumes full withdrawal was permissible (see disclaimer about pre-2015 rules).

2. **Physical Gold**: The model assumes purchase of CGT-exempt UK legal tender gold coins.

3. **Single Annual Transaction**: All withdrawals occur on January 1st of each year at that day's price.

4. **Inflation Adjustment**: The model can adjust withdrawals for inflation using UK CPI data to maintain purchasing power.

5. **Only Income Source**: The pension withdrawal is assumed to be the user's only income (personal allowance fully available).

6. **Synthetic ETF Pricing**: Pre-2019 VUAG prices are synthetically calculated from index values and exchange rates.

7. **FTSE 100 GBP-Denominated**: FTSE 100 requires no currency conversion (already in GBP).

8. **50/50 Splits**: Combination strategies split the pension exactly 50/50 at the start, with each half operating independently.

---

## 9. Out of Scope (Version 2.0)

- Annuity strategy (different mechanics - not drawdown-based)
- Custom split ratios (e.g., 60/40)
- More than 2 strategies compared simultaneously
- PDF export
- Saving/loading configurations
- Currency other than GBP
- Tax implications of death/inheritance
- State pension integration
- Lifetime Allowance considerations (abolished 2024)

---

## 10. Success Criteria

1. Users can select any 2 of 21 strategies to compare
2. Advanced settings allow fee configuration
3. Year-by-year calculations display correctly for all strategies
4. Tax calculations are accurate for all years 1980-2026
5. Edge cases (exhausted funds, index unavailability) handled gracefully
6. Disclaimers clearly visible
7. All calculations match manual verification
8. Site loads and functions without any server-side processing
9. All code is unit tested with >90% coverage

---

## 11. Glossary

| Term | Definition |
|------|------------|
| SIPP | Self-Invested Personal Pension |
| CGT | Capital Gains Tax |
| PCLS | Pension Commencement Lump Sum (25% tax-free) |
| VUAG | Vanguard S&P 500 UCITS ETF (Accumulating) |
| Spot Price | Current market price for immediate delivery |
| Total Return Index | Index including reinvested dividends |
| Personal Allowance | Amount of income not subject to tax |
| Drawdown | Withdrawing funds from a pension |
| Pension Freedoms | April 2015 reforms allowing flexible pension access |
