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

  // Update column styling based on strategy type
  updateColumnStyling('strategy1', strategy1);
  updateColumnStyling('strategy2', strategy2);

  // Update table column headers based on strategy type
  updateTableColumnHeaders('strategy1', strategy1);
  updateTableColumnHeaders('strategy2', strategy2);

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
  const header1 = document.querySelector('#gold-results h3');
  const header2 = document.querySelector('#sipp-results h3');

  if (header1) header1.textContent = `${name1} Strategy`;
  if (header2) header2.textContent = `${name2} Strategy`;
}

/**
 * Update column styling based on strategy type
 */
function updateColumnStyling(slot, strategyData) {
  const columnId = slot === 'strategy1' ? 'gold-results' : 'sipp-results';
  const column = document.getElementById(columnId);
  if (!column) return;

  const { type } = strategyData;

  // Remove existing type classes
  column.classList.remove('strategy-gold', 'strategy-sipp', 'strategy-combined');

  // Add appropriate class based on type
  if (type === STRATEGY_TYPES.GOLD) {
    column.classList.add('strategy-gold');
  } else if (type === STRATEGY_TYPES.SIPP) {
    column.classList.add('strategy-sipp');
  } else if (type === STRATEGY_TYPES.COMBINED) {
    column.classList.add('strategy-combined');
  }
}

/**
 * Update table column headers based on strategy type
 */
function updateTableColumnHeaders(slot, strategyData) {
  const tableId = slot === 'strategy1' ? 'gold-table' : 'sipp-table';
  const thead = document.querySelector(`#${tableId} thead tr`);
  if (!thead) return;

  const { type, result } = strategyData;

  if (type === STRATEGY_TYPES.GOLD) {
    thead.innerHTML = `
      <th scope="col">Year</th>
      <th scope="col">Gold Price</th>
      <th scope="col">Holdings (oz)</th>
      <th scope="col">Withdrawal</th>
      <th scope="col">Fees</th>
      <th scope="col">Net Received</th>
      <th scope="col">Portfolio Value</th>
    `;
  } else if (type === STRATEGY_TYPES.SIPP) {
    thead.innerHTML = `
      <th scope="col">Year</th>
      <th scope="col">Unit Price</th>
      <th scope="col">Units Held</th>
      <th scope="col">Withdrawal</th>
      <th scope="col">Tax + Fees</th>
      <th scope="col">Net Received</th>
      <th scope="col">Portfolio Value</th>
    `;
  } else if (type === STRATEGY_TYPES.COMBINED) {
    // Get sub-strategy names from combined result
    const nameA = result?.strategyA?.shortName || 'Strategy A';
    const nameB = result?.strategyB?.shortName || 'Strategy B';
    thead.innerHTML = `
      <th scope="col">Year</th>
      <th scope="col">${nameA} Value</th>
      <th scope="col">${nameB} Value</th>
      <th scope="col">Withdrawal</th>
      <th scope="col">Fees + Tax</th>
      <th scope="col">Net Received</th>
      <th scope="col">Combined Value</th>
    `;
  }
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

  // Support both initialInvestment and initialPension for compatibility
  const totalPension = summary.initialInvestment || summary.initialPension || 0;
  const allocationA = summary.allocationA || totalPension / 2;
  const allocationB = summary.allocationB || totalPension / 2;

  // Get initial values from each sub-strategy
  const strategyAInitial = getStrategyInitialInfo(strategyA);
  const strategyBInitial = getStrategyInitialInfo(strategyB);

  container.innerHTML = `
    <div class="initial-summary-card combined-theme">
      <h4>${shortName} - Initial Split</h4>
      <dl class="summary-list">
        <div class="summary-item">
          <dt>Total Pension</dt>
          <dd>${formatCurrency(totalPension)}</dd>
        </div>
        <div class="summary-item">
          <dt>${strategyA.name || strategyA.shortName || 'Strategy A'} (50%)</dt>
          <dd>${formatCurrency(allocationA)}</dd>
        </div>
        <div class="summary-item">
          <dt>${strategyB.name || strategyB.shortName || 'Strategy B'} (50%)</dt>
          <dd>${formatCurrency(allocationB)}</dd>
        </div>
        ${strategyAInitial.detailHtml}
        ${strategyBInitial.detailHtml}
        <div class="summary-item highlight">
          <dt>Combined Starting Value</dt>
          <dd>${formatCurrency(strategyAInitial.startValue + strategyBInitial.startValue)}</dd>
        </div>
      </dl>
    </div>
  `;
}

/**
 * Get initial info from a sub-strategy for combined display
 */
function getStrategyInitialInfo(strategy) {
  const { type, result, shortName, name } = strategy;
  const displayName = shortName || name || 'Strategy';

  if (type === 'gold') {
    const initial = result.initialWithdrawal;
    return {
      startValue: result.yearlyResults[0]?.startValueGbp || 0,
      detailHtml: `
        <div class="summary-item sub-detail">
          <dt>↳ ${displayName}: Tax paid</dt>
          <dd class="negative">${formatCurrency(initial?.taxCalculation?.taxPaid || 0)}</dd>
        </div>
      `
    };
  } else {
    // SIPP
    const initial = result.initialInvestment;
    return {
      startValue: initial?.initialValue || result.yearlyResults[0]?.startValueGbp || 0,
      detailHtml: `
        <div class="summary-item sub-detail">
          <dt>↳ ${displayName}: No initial tax</dt>
          <dd class="positive">£0</dd>
        </div>
      `
    };
  }
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
  tbody.innerHTML = yearlyResults.map(year => {
    // Extract values from sub-strategies
    const valueA = getSubStrategyValue(year.strategyA);
    const valueB = getSubStrategyValue(year.strategyB);

    // Calculate gross withdrawal and fees from both sub-strategies
    const { grossWithdrawal, totalFees } = getCombinedWithdrawalInfo(year.strategyA, year.strategyB);

    return `
      <tr class="${getStatusClass(year.status)}">
        <td>${year.year}</td>
        <td>${formatCurrency(valueA)}</td>
        <td>${formatCurrency(valueB)}</td>
        <td>${formatCurrency(grossWithdrawal)}</td>
        <td class="negative">${formatCurrency(totalFees)}</td>
        <td>${formatCurrency(year.combinedWithdrawal)}</td>
        <td class="highlight-cell">${formatCurrency(year.combinedEndValue)}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Get portfolio value from a sub-strategy yearly result
 */
function getSubStrategyValue(yearData) {
  if (!yearData) return 0;
  // Gold uses endValueGbp, SIPP uses endValueGbp
  return yearData.endValueGbp || 0;
}

/**
 * Get combined withdrawal and fees info from sub-strategies
 */
function getCombinedWithdrawalInfo(strategyA, strategyB) {
  let grossWithdrawal = 0;
  let totalFees = 0;

  // Strategy A (could be gold or SIPP)
  if (strategyA) {
    if (strategyA.withdrawalGross !== undefined) {
      // Gold strategy
      grossWithdrawal += strategyA.withdrawalGross || 0;
      totalFees += (strategyA.transactionCost || 0) + (strategyA.storageFee || 0);
    } else {
      // SIPP strategy
      grossWithdrawal += strategyA.grossWithdrawal || 0;
      totalFees += (strategyA.managementFee || 0) + (strategyA.taxOnWithdrawal || 0);
    }
  }

  // Strategy B (could be gold or SIPP)
  if (strategyB) {
    if (strategyB.withdrawalGross !== undefined) {
      // Gold strategy
      grossWithdrawal += strategyB.withdrawalGross || 0;
      totalFees += (strategyB.transactionCost || 0) + (strategyB.storageFee || 0);
    } else {
      // SIPP strategy
      grossWithdrawal += strategyB.grossWithdrawal || 0;
      totalFees += (strategyB.managementFee || 0) + (strategyB.taxOnWithdrawal || 0);
    }
  }

  return { grossWithdrawal, totalFees };
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
