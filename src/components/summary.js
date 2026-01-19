/**
 * Summary Component
 *
 * Renders the comparison summary with winner determination,
 * key metrics, and insights.
 *
 * @module components/summary
 */

import { formatCurrency, formatPercent } from '../utils/formatters.js';
import { getKeyInsights, findCrossoverPoint } from '../calculators/comparisonEngine.js';

/**
 * Render the complete comparison summary
 *
 * @param {Object} comparison - Comparison result from compareStrategies()
 */
export function renderSummary(comparison) {
  const section = document.getElementById('summary-section');
  const container = document.getElementById('summary-content');

  if (!section || !container) return;

  const { summary, inputs } = comparison;

  container.innerHTML = `
    ${renderWinnerBanner(summary)}
    ${renderMetricsComparison(summary)}
    ${renderInsights(comparison)}
    ${renderCrossover(comparison)}
  `;

  section.hidden = false;
  section.classList.add('visible');
}

/**
 * Render the winner announcement banner
 */
function renderWinnerBanner(summary) {
  const { winner, difference, percentageDifference } = summary;

  let winnerText, winnerClass, icon;

  // Convert percentage for display (it's already in percentage points like 4.5 not 0.045)
  const formattedPercent = `${percentageDifference.toFixed(1)}%`;

  if (winner === 'tie') {
    winnerText = 'Strategies are essentially tied';
    winnerClass = 'winner-tie';
    icon = '⚖️';
  } else if (winner === 'gold') {
    winnerText = `Gold Strategy Wins by ${formatCurrency(difference)} (${formattedPercent})`;
    winnerClass = 'winner-gold';
    icon = '🥇';
  } else {
    winnerText = `SIPP Strategy Wins by ${formatCurrency(difference)} (${formattedPercent})`;
    winnerClass = 'winner-sipp';
    icon = '📈';
  }

  return `
    <div class="winner-banner ${winnerClass}">
      <span class="winner-icon">${icon}</span>
      <h3 class="winner-text">${winnerText}</h3>
    </div>
  `;
}

/**
 * Render side-by-side metrics comparison
 */
function renderMetricsComparison(summary) {
  const { gold, sipp, comparison: diff } = summary;

  return `
    <div class="metrics-comparison">
      <div class="metrics-card gold-theme">
        <h4>Gold Strategy</h4>
        <dl class="metrics-list">
          <div class="metric">
            <dt>Initial Tax Paid</dt>
            <dd class="negative">${formatCurrency(gold.initialTaxPaid)}</dd>
          </div>
          <div class="metric">
            <dt>Transaction Costs</dt>
            <dd class="negative">${formatCurrency(gold.totalTransactionCosts)}</dd>
          </div>
          <div class="metric">
            <dt>Total Net Withdrawn</dt>
            <dd>${formatCurrency(gold.totalNetWithdrawn)}</dd>
          </div>
          <div class="metric">
            <dt>Final Asset Value</dt>
            <dd>${formatCurrency(gold.finalAssetValue)}</dd>
          </div>
          <div class="metric total">
            <dt>Total Value Realized</dt>
            <dd class="highlight">${formatCurrency(gold.totalValueRealized)}</dd>
          </div>
        </dl>
      </div>

      <div class="metrics-card sipp-theme">
        <h4>S&P 500 SIPP Strategy</h4>
        <dl class="metrics-list">
          <div class="metric">
            <dt>Initial Tax Paid</dt>
            <dd class="positive">£0</dd>
          </div>
          <div class="metric">
            <dt>Management Fees + Tax</dt>
            <dd class="negative">${formatCurrency(sipp.totalManagementFees + sipp.totalWithdrawalTax)}</dd>
          </div>
          <div class="metric">
            <dt>Total Net Withdrawn</dt>
            <dd>${formatCurrency(sipp.totalNetWithdrawn)}</dd>
          </div>
          <div class="metric">
            <dt>Final Value (After Tax)</dt>
            <dd>${formatCurrency(sipp.finalAfterTaxValue)}</dd>
          </div>
          <div class="metric total">
            <dt>Total Value Realized</dt>
            <dd class="highlight">${formatCurrency(sipp.totalValueRealized)}</dd>
          </div>
        </dl>
      </div>
    </div>

    <div class="difference-summary">
      <h4>Comparison</h4>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Difference (Gold - SIPP)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Initial Tax</td>
            <td class="${diff.initialTaxDifference > 0 ? 'negative' : 'positive'}">${formatDifference(diff.initialTaxDifference)}</td>
          </tr>
          <tr>
            <td>Total Costs</td>
            <td class="${diff.totalCostsDifference > 0 ? 'negative' : 'positive'}">${formatDifference(diff.totalCostsDifference)}</td>
          </tr>
          <tr>
            <td>Net Withdrawn</td>
            <td class="${diff.totalNetWithdrawnDifference > 0 ? 'positive' : 'negative'}">${formatDifference(diff.totalNetWithdrawnDifference)}</td>
          </tr>
          <tr>
            <td>Final Value</td>
            <td class="${diff.finalValueDifference > 0 ? 'positive' : 'negative'}">${formatDifference(diff.finalValueDifference)}</td>
          </tr>
          <tr class="total-row">
            <td>Total Value Realized</td>
            <td class="${diff.totalValueDifference > 0 ? 'positive' : 'negative'}">${formatDifference(diff.totalValueDifference)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render key insights
 */
function renderInsights(comparison) {
  const insights = getKeyInsights(comparison);

  if (insights.length === 0) return '';

  return `
    <div class="insights-section">
      <h4>Key Insights</h4>
      <ul class="insights-list">
        ${insights.map(insight => `<li>${insight}</li>`).join('')}
      </ul>
    </div>
  `;
}

/**
 * Render crossover information
 */
function renderCrossover(comparison) {
  const crossover = findCrossoverPoint(comparison);

  if (!crossover) return '';

  const direction = crossover.direction === 'sipp_overtakes_gold'
    ? 'SIPP overtook Gold'
    : 'Gold overtook SIPP';

  return `
    <div class="crossover-info">
      <h4>Strategy Crossover</h4>
      <p>
        <strong>${direction}</strong> in <strong>${crossover.year}</strong>
        (Year ${crossover.yearsFromStart + 1} of the comparison)
      </p>
    </div>
  `;
}

/**
 * Format a difference value with sign
 */
function formatDifference(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatCurrency(value)}`;
}

/**
 * Hide the summary section
 */
export function hideSummary() {
  const section = document.getElementById('summary-section');
  if (section) {
    section.hidden = true;
    section.classList.remove('visible');
  }
}

/**
 * Clear the summary content
 */
export function clearSummary() {
  const container = document.getElementById('summary-content');
  if (container) {
    container.innerHTML = '';
  }
  hideSummary();
}

export default {
  renderSummary,
  hideSummary,
  clearSummary
};
