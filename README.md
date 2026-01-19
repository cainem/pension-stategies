# Pension Strategy Comparison Tool

Compare UK pension withdrawal strategies: **Gold vs S&P 500 SIPP**

A client-side web application that helps you understand the trade-offs between:
1. **Gold Strategy**: Withdraw pension, pay tax, buy physical gold
2. **S&P 500 SIPP Strategy**: Keep pension invested in an S&P 500 tracker ETF

## Features

- Year-by-year comparison of both strategies
- Accurate UK tax calculations (2000-2025)
- Configurable pension amount, withdrawal rate, and time period
- No server required - runs entirely in your browser

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pension-strategies.git
cd pension-strategies

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.js              # Application entry point
├── app.js               # Main orchestration
├── config/
│   └── defaults.js      # Default configuration values
├── calculators/         # Calculation logic (tax, strategies)
├── components/          # UI components
├── data/                # Historical data (prices, tax rates)
└── utils/               # Utility functions
tests/                   # Test files (mirrors src/ structure)
```

## Documentation

- [Product Definition Document](pdd.md) - Full requirements and specifications
- [Implementation Plan](implementation_plan.md) - Development stages and timeline
- [AGENTS.md](AGENTS.md) - Guidelines for AI agents working on this codebase

## Disclaimer

This tool is for **educational purposes only**. It does not constitute financial advice. Past performance does not guarantee future results. Always consult a qualified financial advisor before making pension decisions.

## License

MIT
