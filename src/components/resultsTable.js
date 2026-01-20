/**
 * Results Table Component
 *
 * Renders year-by-year strategy results in accessible HTML tables.
 *
 * @module components/resultsTable
 */

import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters.js';
import { STRATEGY_TYPES } from '../calculators/strategyRegistry.js';

/**
 * Render results for any two strategies (new generic format)
 *
 * @param {Object} comparison - Generic comparison result
 */
export function renderResultsForStrategies(comparison) {
  const { strategy1, strategy2 } = comparison;

  // Update table headers with strategy names
  updateTableHeaders(strategy1.shortName, strategy2.shortName);

  // Render initial summaries
  renderGenericInitialSummary('strategy1', strategy1);
  renderGenericInitialSummary('strategy2', strategy2);

  // Render yearly tables
  renderGenericTable('strategy1', strategy1);
  renderGenericTable('strategy2', strategy2);
}

/**
 * Update table headers with strategy names
 */
function updateTableHeaders(name1, name2) {
  const header1 = document.querySelector('#strategy1-section h3, #gold-section h3');
  const header2 = document.querySelector('#strategy2-section h3, #sipp-section h3');

  if (header1) header1.textContent = `${name1} Strategy Results`;
  if (header2) header2.textContent = `${name2} Strategy Results`;
}

/**
 * Render initial summary for any strategy type
 */
function renderGenericInitialSummary(slot, strategyData) {
  // Map slot to container ID (support both old and new HTML)
  const containerId = slot === 'strategy1' ? 'gold-initial' : 'sipp-initial';
  const container = document.getElementById(containerId);
  if (!container) return;

  const { type, result, shortName } = strategyData;

  if (type === STRATEGY_TYPES.GOLD) {
    renderGoldInitialSummaryContent(container, result, shortName);
  } else if (type === STRATEGY_TYPES.SIPP) {
    renderSippInitialSummaryContent(container, result, shortName);
  } else if (type === STRATEGY_TYPES.COMBINED) {
    renderCombinedInitialSummaryContent(container, result, shortName);
  }
}

/**
 * Render Gold initial summary content
 */
function renderGoldInitialSummaryContent(container, result, shortName) {
  const { initialWithdrawal } = result;

  container.innerHTML = `
    <div class="initial-summary-card gold-theme">
      <h4>${shortName} - Initial Withdrawal</h4>
      <dl class="summary-list">
        <div class="summary-item">
          <dt>Gross Pension</dt>
          <dd>${formatCurrency(initialWithdrawal.grossPension)}</dd>
        </div>
        <div class="summary-item">
          <dt>Tax Paid</dt>
          <dd class="negative">${formatCurrency(initialWithdrawal.taxCalculation.taxPaid)}</dd>
        </div>
        <div class="summary-item">
          <dt>Net After Tax</dt>
          <dd>${formatCurrency(initialWithdrawal.netAfterTax)}</dd>
        </div>
        <div class="summary-item">
          <dt>Gold Purchase Cost (2%)</dt>
          <dd class="negative">${formatCurrency(initialWithdrawal.goldPurchaseCost)}</dd>
        </div>
        <div class="summary-item highlight">
          <dt>Gold Purchased</dt>
          <dd>${formatNumber(initialWithdrawal.goldOuncesPurchased, 2)} oz @ ${formatCurrency(initialWithdrawal.goldPriceAtPurchase)}/oz</dd>
        </div>
      </dl>
    </div>
  `;
}

/**
 * Render SIPP initial summary content
 */
function renderSippInitialSummaryContent(container, result, shortName) {
  const { initialInvestment } = result;

  container.innerHTML = `
    <div class="initial-summary-card sipp-theme">
      <h4>${shortName} - Initial Investment</h4>
      <dl class="summary-list">
        <div class="summary-item">
          <dt>Pension Amount</dt>
          <dd>${formatCurrency(initialInvestment.pensionAmount)}</dd>
        </div>
        <div class="summary-item">
          <dt>Initial Tax</dt>
          <dd class="positive">£0 (stays in SIPP)</dd>
        </div>
        <div class="summary-item">
          <dt>Initial Value</dt>
          <dd>${formatCurrency(initialInvestment.initialValue)}</dd>
        </div>
        <div class="summary-item">
          <dt>Annual Management Fee</dt>
          <dd>0.5%</dd>
        </div>
        <div class="summary-item highlight">
          <dt>Units Acquired</dt>
          <dd>${formatNumber(initialInvestment.unitsAcquired, 2)} @ ${formatCurrency(initialInvestment.etfPriceAtStart)}/unit</dd>
        </div>
      </dl>
    </div>
  `;
}

/**
 * Render Combined strategy initial summary content
 */
function renderCombinedInitialSummaryContent(container, result, shortName) {
  const { strategyA, strategyB, summary } = result;

  container.innerHTML = `
    <div class="initial-summary-card combined-theme">
      <h4>${shortName} - Initial Split</h4>
      <dl class="summary-list">
        <div class="summary-item">
          <dt>Total Pension</dt>
          <dd>${formatCurrency(summary.initialPension)}</dd>
        </div>
        <div class="summary-item">
          <dt>${strategyA.name || 'Strategy A'} (50%)</dt>
          <dd>${formatCurrency(summary.initialPension / 2)}</dd>
        </div>
        <div class="summary-item">
          <dt>${strategyB.name || 'Strategy B'} (50%)</dt>
          <dd>${formatCurrency(summary.initialPension / 2)}</dd>
        </div>
        <div class="summary-item highlight">
          <dt>Combined Starting Value</dt>
          <dd>${formatCurrency(summary.initialValue || summary.initialPension)}</dd>
        </div>
      </dl>
    </div>
  `;
}

/**
 * Render yearly table for any strategy type
 */
function renderGenericTable(slot, strategyData) {
  // Map slot to table ID (support both old and new HTML)
  const tableId = slot === 'strategy1' ? 'gold-table' : 'sipp-table';
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;

  const { type, result } = strategyData;

  if (type === STRATEGY_TYPES.GOLD) {
    renderGoldTableContent(tbody, result.yearlyResults);
  } else if (type === STRATEGY_TYPES.SIPP) {
    renderSippTableContent(tbody, result.yearlyResults);
  } else if (type === STRATEGY_TYPES.COMBINED) {
    renderCombinedTableContent(tbody, result.yearlyResults);
  }
}

/**
 * Render Gold table content
 */
function renderGoldTableContent(tbody, yearlyResults) {
  tbody.innerHTML = yearlyResults.map(year => `
    <tr class="${getStatusClass(year.status)}">
      <td>${year.year}</td>
      <td>${formatCurrency(year.goldPricePerOunce)}</td>
      <td>${formatNumber(year.startGoldOunces, 2)}</td>
      <td>${formatCurrency(year.withdrawalGross)}</td>
      <td class="negative">${formatCurrency(year.transactionCost)}</td>
      <td>${formatCurrency(year.netWithdrawal)}</td>
      <td class="highlight-cell">${formatCurrency(year.endValueGbp)}</td>
    </tr>
  `).join('');
}

/**
 * Render SIPP table content
 */
function renderSippTableContent(tbody, yearlyResults) {
  tbody.innerHTML = yearlyResults.map(year => {
    const totalCosts = year.managementFee + year.taxOnWithdrawal;

    return `
      <tr class="${getStatusClass(year.status)}">
        <td>${year.year}</td>
        <td>${formatCurrency(year.etfPricePerUnit)}</td>
        <td>${formatNumber(year.startUnits, 2)}</td>
        <td>${formatCurrency(year.grossWithdrawal)}</td>
        <td class="negative">${formatCurrency(totalCosts)}</td>
        <td>${formatCurrency(year.netWithdrawal)}</td>
        <td class="highlight-cell">${formatCurrency(year.endValueGbp)}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Combined strategy table content
 */
function renderCombinedTableContent(tbody, yearlyResults) {
  tbody.innerHTML = yearlyResults.map(year => `
    <tr class="${getStatusClass(year.status)}">
      <td>${year.year}</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>${formatCurrency(year.combinedWithdrawal)}</td>
      <td class="highlight-cell">${formatCurrency(year.combinedEndValue)}</td>
    </tr>
  `).join('');
}

/**
 * Get CSS class for row based on status
 */
function getStatusClass(status) {
  switch (status) {
    case 'depleted':
      return 'status-depleted';
    case 'exhausted':
      return 'status-exhausted';
    default:
      return '';
  }
}

/**
 * Render the Gold strategy results (legacy function for backward compatibility)
 *
 * @param {Object} goldResult - Gold strategy calculation result
 */
export function renderGoldResults(goldResult) {
  const container = document.getElementById('gold-initial');
  if (container) {
    renderGoldInitialSummaryContent(container, goldResult, 'Gold');
  }
  const tbody = document.querySelector('#gold-table tbody');
  if (tbody) {
    renderGoldTableContent(tbody, goldResult.yearlyResults);
  }
}

/**
 * Render the SIPP strategy results (legacy function for backward compatibility)
 *
 * @param {Object} sippResult - SIPP strategy calculation result
 */
export function renderSippResults(sippResult) {
  const container = document.getElementById('sipp-initial');
  if (container) {
    renderSippInitialSummaryContent(container, sippResult, 'S&P 500');
  }
  const tbody = document.querySelector('#sipp-table tbody');
  if (tbody) {
    renderSippTableContent(tbody, sippResult.yearlyResults);
  }
}

/**
 * Clear all results tables
 */
export function clearResults() {
  const goldTbody = document.querySelector('#gold-table tbody');
  const sippTbody = document.querySelector('#sipp-table tbody');
  const goldInitial = document.getElementById('gold-initial');
  const sippInitial = document.getElementById('sipp-initial');

  if (goldTbody) goldTbody.innerHTML = '';
  if (sippTbody) sippTbody.innerHTML = '';
  if (goldInitial) goldInitial.innerHTML = '';
  if (sippInitial) sippInitial.innerHTML = '';
}

/**
 * Show the results section
 */
export function showResultsSection() {
  const section = document.querySelector('.results-section');
  if (section) {
    section.classList.add('visible');
  }
}

export default {
  renderResultsForStrategies,
  renderGoldResults,
  renderSippResults,
  clearResults,
  showResultsSection
};
