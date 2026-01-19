/**
 * Results Table Component
 *
 * Renders year-by-year strategy results in accessible HTML tables.
 *
 * @module components/resultsTable
 */

import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters.js';

/**
 * Render the Gold strategy results
 *
 * @param {Object} goldResult - Gold strategy calculation result
 */
export function renderGoldResults(goldResult) {
  renderGoldInitialSummary(goldResult);
  renderGoldTable(goldResult.yearlyResults);
}

/**
 * Render the SIPP strategy results
 *
 * @param {Object} sippResult - SIPP strategy calculation result
 */
export function renderSippResults(sippResult) {
  renderSippInitialSummary(sippResult);
  renderSippTable(sippResult.yearlyResults);
}

/**
 * Render Gold initial investment summary
 */
function renderGoldInitialSummary(result) {
  const container = document.getElementById('gold-initial');
  if (!container) return;

  const { initialWithdrawal } = result;

  container.innerHTML = `
    <div class="initial-summary-card gold-theme">
      <h4>Initial Withdrawal</h4>
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
 * Render SIPP initial investment summary
 */
function renderSippInitialSummary(result) {
  const container = document.getElementById('sipp-initial');
  if (!container) return;

  const { initialInvestment } = result;

  container.innerHTML = `
    <div class="initial-summary-card sipp-theme">
      <h4>Initial Investment</h4>
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
 * Render Gold strategy yearly table
 */
function renderGoldTable(yearlyResults) {
  const tbody = document.querySelector('#gold-table tbody');
  if (!tbody) return;

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
 * Render SIPP strategy yearly table
 */
function renderSippTable(yearlyResults) {
  const tbody = document.querySelector('#sipp-table tbody');
  if (!tbody) return;

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
  renderGoldResults,
  renderSippResults,
  clearResults,
  showResultsSection
};
