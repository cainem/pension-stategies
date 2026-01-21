/**
 * Disclaimer Component
 *
 * Displays important legal notices and disclaimers relevant to the
 * pension strategy comparison tool. Shows different disclaimers based
 * on the strategies being compared.
 *
 * @module components/disclaimer
 */

// Strategy registry not directly used but may be needed for future enhancements

/**
 * Disclaimer content definitions
 */
export const DISCLAIMERS = {
  general: {
    id: 'general',
    title: 'General Disclaimer',
    content: `This tool is for educational and illustrative purposes only and does not constitute
      financial, tax, or investment advice. Past performance does not guarantee future results.
      The calculations are based on historical data and simplified assumptions that may not reflect
      actual market conditions or individual circumstances. Always consult a qualified financial
      advisor before making pension or investment decisions.`,
    icon: '⚠️',
    priority: 1
  },

  goldCgtExemption: {
    id: 'goldCgtExemption',
    title: 'Gold CGT Exemption',
    content: `Physical gold held in the form of UK legal tender coins (e.g., Sovereigns, Britannias)
      is exempt from Capital Gains Tax. Gold bullion bars may also be CGT-exempt if purchased from
      LBMA-approved dealers and meet certain purity standards. This model assumes CGT-exempt gold
      investments. Non-exempt gold products may incur CGT on disposal.`,
    icon: '🪙',
    priority: 2,
    appliesTo: ['gold', 'gold-sp500', 'gold-nasdaq100', 'gold-ftse100', 'gold-goldEtf']
  },

  goldStorageCosts: {
    id: 'goldStorageCosts',
    title: 'Gold Storage Costs',
    content: `Physical gold requires secure storage, which may incur ongoing costs. This model
      applies a default storage fee of 0.5% per year. Actual costs vary significantly based on
      storage method (home safe, bank deposit box, professional vault) and insurance requirements.`,
    icon: '🏦',
    priority: 3,
    appliesTo: ['gold', 'gold-sp500', 'gold-nasdaq100', 'gold-ftse100', 'gold-goldEtf']
  },

  prePensionFreedoms: {
    id: 'prePensionFreedoms',
    title: 'Pre-2015 Pension Rules',
    content: `Prior to April 2015 ("Pension Freedoms"), full withdrawal of pension funds was
      heavily restricted. Most savers were required to purchase an annuity or enter drawdown with
      annual limits. This model allows full withdrawal for historical comparison purposes only —
      such withdrawals would not have been legally possible before April 2015.`,
    icon: '📜',
    priority: 4,
    appliesToYearsBefore: 2015
  },

  sippFees: {
    id: 'sippFees',
    title: 'SIPP Fees',
    content: `SIPP (Self-Invested Personal Pension) providers charge various fees including platform
      fees, trading costs, and annual management charges. This model applies a default annual fee
      of 0.5% of the portfolio value. Actual fees vary significantly between providers and may
      include additional charges not modelled here.`,
    icon: '💼',
    priority: 5,
    appliesTo: [
      'sp500', 'nasdaq100', 'ftse100', 'goldEtf',
      'gold-sp500', 'gold-nasdaq100', 'gold-ftse100',
      'goldEtf-sp500', 'goldEtf-nasdaq100', 'goldEtf-ftse100', 'gold-goldEtf',
      'sp500-nasdaq100', 'sp500-ftse100', 'nasdaq100-ftse100'
    ]
  },

  currencyRisk: {
    id: 'currencyRisk',
    title: 'Currency Exchange Risk',
    content: `Investments in US-listed indices (S&P 500, Nasdaq 100) are subject to GBP/USD
      exchange rate fluctuations. Historical returns have been converted using year-end exchange
      rates, but actual returns would depend on exchange rates at the time of each transaction.
      Currency hedged funds behave differently than modelled here.`,
    icon: '💱',
    priority: 6,
    appliesTo: [
      'sp500', 'nasdaq100', 'gold-sp500', 'gold-nasdaq100',
      'goldEtf-sp500', 'goldEtf-nasdaq100', 'sp500-nasdaq100'
    ]
  },

  taxRates: {
    id: 'taxRates',
    title: 'Tax Rate Assumptions',
    content: `Tax calculations use historical UK income tax rates and assume the pension
      withdrawal is the individual's only source of income for that year. If you have other
      income, you may be pushed into higher tax brackets. Scottish taxpayers have different
      rates since 2017. This model uses standard UK rates.`,
    icon: '📊',
    priority: 7
  },

  syntheticPricing: {
    id: 'syntheticPricing',
    title: 'Historical ETF Pricing',
    content: `For years before certain ETFs existed, this model calculates synthetic prices
      based on the underlying index total return data, adjusted for currency where applicable.
      Actual ETF performance may differ due to tracking error, fund expenses, and market
      conditions.`,
    icon: '📈',
    priority: 8,
    appliesTo: [
      'sp500', 'nasdaq100', 'ftse100', 'goldEtf',
      'gold-sp500', 'gold-nasdaq100', 'gold-ftse100',
      'goldEtf-sp500', 'goldEtf-nasdaq100', 'goldEtf-ftse100', 'gold-goldEtf',
      'sp500-nasdaq100', 'sp500-ftse100', 'nasdaq100-ftse100'
    ]
  },

  goldEtfVsPhysical: {
    id: 'goldEtfVsPhysical',
    title: 'Gold ETF vs Physical Gold',
    content: `Gold ETFs held within a SIPP are taxed differently from physical gold held outside
      a pension. ETF withdrawals from a SIPP are subject to income tax (after the 25% tax-free
      allowance), while physical gold coins may be CGT-exempt. The optimal choice depends on
      your tax situation and investment horizon.`,
    icon: '⚖️',
    priority: 9,
    appliesTo: ['goldEtf', 'gold-goldEtf', 'goldEtf-sp500', 'goldEtf-nasdaq100', 'goldEtf-ftse100']
  }
};

/**
 * Get disclaimers relevant to the selected strategies and time period
 *
 * @param {string} strategy1Id - First strategy ID
 * @param {string} strategy2Id - Second strategy ID
 * @param {number} startYear - Start year of comparison
 * @returns {Object[]} Array of applicable disclaimer objects, sorted by priority
 */
export function getApplicableDisclaimers(strategy1Id, strategy2Id, startYear) {
  const strategies = [strategy1Id, strategy2Id];
  const applicableDisclaimers = [];

  // General disclaimer always applies
  applicableDisclaimers.push(DISCLAIMERS.general);

  // Check each disclaimer
  Object.values(DISCLAIMERS).forEach(disclaimer => {
    if (disclaimer.id === 'general') return; // Already added

    let applies = false;

    // Check if disclaimer applies to specific strategies
    if (disclaimer.appliesTo) {
      applies = strategies.some(strategyId => disclaimer.appliesTo.includes(strategyId));
    }

    // Check if disclaimer applies to years before a certain date
    if (disclaimer.appliesToYearsBefore && startYear < disclaimer.appliesToYearsBefore) {
      applies = true;
    }

    // Tax rates disclaimer always applies when there's any calculation
    if (disclaimer.id === 'taxRates') {
      applies = true;
    }

    if (applies) {
      applicableDisclaimers.push(disclaimer);
    }
  });

  // Sort by priority
  return applicableDisclaimers.sort((a, b) => a.priority - b.priority);
}

/**
 * Render disclaimers to a container element
 *
 * @param {string} containerId - ID of the container element
 * @param {string} strategy1Id - First strategy ID
 * @param {string} strategy2Id - Second strategy ID
 * @param {number} startYear - Start year of comparison
 */
export function renderDisclaimers(containerId, strategy1Id, strategy2Id, startYear) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const disclaimers = getApplicableDisclaimers(strategy1Id, strategy2Id, startYear);

  const html = `
    <div class="disclaimers">
      <h3 class="disclaimers__title">Important Information</h3>
      <div class="disclaimers__list">
        ${disclaimers.map(d => `
          <details class="disclaimer" ${d.id === 'general' ? 'open' : ''}>
            <summary class="disclaimer__summary">
              <span class="disclaimer__icon">${d.icon}</span>
              <span class="disclaimer__title">${d.title}</span>
            </summary>
            <p class="disclaimer__content">${d.content}</p>
          </details>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render compact footer disclaimers
 *
 * @param {string} containerId - ID of the container element
 */
export function renderFooterDisclaimer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="footer-disclaimer">
      <p>
        <strong>⚠️ Disclaimer:</strong> This tool is for educational purposes only and does not
        constitute financial advice. Past performance does not guarantee future results.
        Calculations assume simplified tax scenarios and may not reflect your individual circumstances.
        Always consult a qualified financial advisor before making pension decisions.
      </p>
      <p class="footer-disclaimer__note">
        Pre-2015 comparisons shown for illustrative purposes only — pension freedom rules did not
        exist before April 2015. Tax calculations use historical UK rates assuming no other income.
      </p>
    </div>
  `;
}

/**
 * Initialize disclaimer functionality
 * Sets up the footer and prepares for dynamic disclaimer updates
 */
export function initializeDisclaimers() {
  // Render footer disclaimer on page load
  renderFooterDisclaimer('footer-disclaimers');
}

export default {
  DISCLAIMERS,
  getApplicableDisclaimers,
  renderDisclaimers,
  renderFooterDisclaimer,
  initializeDisclaimers
};
