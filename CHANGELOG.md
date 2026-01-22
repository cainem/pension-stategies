# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-21

### Added
- **15 investment strategies** to compare:
  - Physical Gold (CGT-exempt UK coins)
  - Gold ETF SIPP
  - S&P 500 SIPP
  - Nasdaq 100 SIPP
  - FTSE 100 SIPP
  - 10 combined 50/50 strategies
- **Historical data from 1980-2026** for accurate backtesting
- **Configurable fees** via Advanced Settings:
  - Gold transaction cost (default 3%)
  - Gold storage fee (default 0.7%)
  - SIPP management fee (default 0.5%)
- **Interactive charts** showing portfolio value and withdrawals over time
- **Detailed yearly breakdown tables** for each strategy
- **Summary comparison** with winner determination
- **Strategy-specific disclaimers** based on selected strategies
- **About page** explaining the tool's purpose and CGT exemption rules
- **Auto-loading results** on page load with sensible defaults
- **Responsive design** for mobile and desktop

### Technical
- Built with vanilla JavaScript and Vite
- 644 tests with 98%+ coverage on calculators
- Deployed to GitHub Pages

## [Unreleased]

## [1.1.0] - 2026-01-22

### Added
- **Inflation-Adjusted Withdrawals**: Strategies now maintain constant purchasing power using historical UK CPI data (1980-2026).
- **New Base Strategies**: 
  - **US Long Treasury SIPP**: long-term US bond tracker (annuity proxy).
  - **Gold ETF SIPP**: Gold tracker within the SIPP wrapper.
- **21 Total Strategies**: Increased from 15 with new asset classes and permutations.
- **Analytics & Cookies**: Google Analytics (GA4) integration with event tracking and a GDPR-compliant cookie notice.
- **Tooltips**: Data tables now include hover descriptions for better metric clarity.

### Changed
- **Premium UI Redesign**: Migrated to a "Premium Light Editorial" aesthetic using Lora (Serif) and Inter (Sans) typography.
- **Data Integrity**: Fixed a significant discrepancy in the S&P 500 Total Return index data around the year 2000.
- **Enhanced Charts**: Improved chart color differentiation and readability.
- **Documentation**: Updated PDD, README, and About page to reflect new financial modeling capabilities.

### Technical
- 100% test coverage maintained across all calculators (now 682 tests).
- Optimized CSS variable system for theme consistency.
