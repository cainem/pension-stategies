# Copilot Instructions

## Project: Pension Strategy Comparison Tool

A client-side web application comparing UK pension withdrawal strategies (Gold vs S&P 500 SIPP). Hosted on GitHub Pages with no server-side processing.

---

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Type** | Static site with client-side JavaScript |
| **Framework** | Vanilla JS + Vite |
| **Testing** | Vitest |
| **Hosting** | GitHub Pages |

## Project Structure

```
src/
├── calculators/    # Core calculation logic (tax, gold, SIPP strategies)
├── components/     # UI components (form, tables, summary)
├── data/           # Hardcoded historical data (prices, tax rates)
└── utils/          # Formatting and validation utilities
tests/              # Mirror of src/ structure
```

## Key Constraints

- **No server-side code** - All logic runs in browser
- **No runtime API calls** - Historical data is hardcoded
- **UK tax compliance** - Calculations must be accurate

---

## ⚠️ Important: Start of Conversation

**At the start of a new conversation, please read the [AGENTS.md](../AGENTS.md) file.**

It contains:
- Detailed architecture overview
- Business logic explanations
- Tax calculation rules
- Testing requirements and naming conventions
- Common tasks with step-by-step guidance
- Troubleshooting tips

---

## Quick Commands

```bash
npm run dev          # Start dev server
npm test             # Run tests
npm run test:coverage # Tests with coverage
npm run build        # Production build
```

## Test Naming Convention

All tests must follow: `given_[precondition]_when_[action]_then_[expectedResult]`
