/**
 * Summary Component
 *
 * Renders the comparison summary with winner determination,
 * key metrics, and insights.
 *
 * @module components/summary
 */

import { formatCurrency } from '../utils/formatters.js';
import { getKeyInsights, findCrossoverPoint } from '../calculators/comparisonEngine.js';

/**
 * Render the complete comparison summary
 *
 * @param {Object} comparison - Comparison result from compareStrategies() or compareAnyStrategies()
 */
export function renderSummary(comparison) {
  const section = document.getElementById('summary-section');
  const container = document.getElementById('summary-content');

  if (!section || !container) return;

  const { summary } = comparison;

  // Check if new format (has strategy1/strategy2) or legacy format (has gold/sipp)
  const isNewFormat = comparison.strategy1 !== undefined;

  if (isNewFormat) {
    container.innerHTML = `
      ${renderWinnerBannerGeneric(comparison)}
      ${renderMetricsComparisonGeneric(comparison)}
      ${renderDifferenceSummaryGeneric(comparison)}
    `;
  } else {
    container.innerHTML = `
      ${renderWinnerBanner(summary)}
      ${renderMetricsComparison(summary)}
      ${renderInsights(comparison)}
      ${renderCrossover(comparison)}
    `;
  }

  section.hidden = false;
  section.classList.add('visible');
}

/**
 * Render winner banner for new generic format
 */
function renderWinnerBannerGeneric(comparison) {
  const { summary, strategy1, strategy2 } = comparison;
  const { winner, winnerName, difference, percentageDifference } = summary;

  let winnerText, winnerClass, icon;

  // Format percentage for display
  const formattedPercent = `${percentageDifference.toFixed(1)}%`;

  if (winner === 'tie') {
    winnerText = 'Strategies are essentially tied';
    winnerClass = 'winner-tie';
    icon = '⚖️';
  } else {
    const isStrategy1 = winner === 'strategy1';
    const winningStrategy = isStrategy1 ? strategy1 : strategy2;

    // Determine icon based on strategy type
    if (winningStrategy.type === 'gold') {
      icon = '🥇';
      winnerClass = 'winner-gold';
    } else if (winningStrategy.type === 'combined') {
      icon = '📊';
      winnerClass = 'winner-combined';
    } else {
      icon = '📈';
      winnerClass = 'winner-sipp';
    }

    winnerText = `${winnerName} Wins by ${formatCurrency(difference)} (${formattedPercent})`;
  }

  return `
    <div class="winner-banner ${winnerClass}">
      <span class="winner-icon">${icon}</span>
      <h3 class="winner-text">${winnerText}</h3>
    </div>
  `;
}

/**
 * Render metrics comparison for new generic format
 */
function renderMetricsComparisonGeneric(comparison) {
  const { strategy1, strategy2 } = comparison;

  return `
    <div class="metrics-comparison">
      ${renderStrategyMetrics(strategy1)}
      ${renderStrategyMetrics(strategy2)}
    </div>
  `;
}

/**
 * Render metrics for a single strategy
 */
function renderStrategyMetrics(strategy) {
  const { shortName, type, metrics } = strategy;

  // Determine theme class based on strategy type
  const themeClass = type === 'gold'
    ? 'gold-theme'
    : type === 'combined'
      ? 'combined-theme'
      : 'sipp-theme';

  // Determine cost label and tooltip based on type
  const costLabel = type === 'gold'
    ? 'Transaction Costs + Storage'
    : type === 'combined'
      ? 'Total Fees'
      : 'Management Fees + Tax';

  const costTooltip = type === 'gold'
    ? 'Gold transaction fees (buying/selling) plus annual storage costs'
    : type === 'combined'
      ? 'Combined fees from both sub-strategies including tax and management fees'
      : 'Annual SIPP management fees plus income tax on withdrawals';

  const totalCosts = type === 'gold'
    ? (metrics.totalFees || 0)
    : type === 'sipp'
      ? ((metrics.totalFees || 0) + (metrics.totalWithdrawalTax || 0))
      : (metrics.totalFees || 0);

  return `
    <div class="metrics-card ${themeClass}">
      <h4>${shortName} Strategy</h4>
      <dl class="metrics-list">
        <div class="metric">
          <dt title="Tax paid when initially withdrawing/converting the pension">Initial Tax Paid</dt>
          <dd class="${metrics.initialTaxPaid > 0 ? 'negative' : 'positive'}">${metrics.initialTaxPaid > 0 ? formatCurrency(metrics.initialTaxPaid) : '£0'}</dd>
        </div>
        <div class="metric">
          <dt title="${costTooltip}">${costLabel}</dt>
          <dd class="negative">${formatCurrency(totalCosts)}</dd>
        </div>
        <div class="metric">
          <dt title="Total net income received from all annual withdrawals">Total Net Withdrawn</dt>
          <dd>${formatCurrency(metrics.totalNetWithdrawn)}</dd>
        </div>
        <div class="metric">
          <dt title="Remaining portfolio value at end of period (net of exit tax if applicable)">Final Value (After Tax)</dt>
          <dd>${formatCurrency(metrics.finalAfterTaxValue)}</dd>
        </div>
        <div class="metric total">
          <dt title="Total Net Withdrawn + Final Value = total wealth generated by this strategy">Total Value Realized</dt>
          <dd class="highlight">${formatCurrency(metrics.totalValueRealized)}</dd>
        </div>
      </dl>
    </div>
  `;
}

/**
 * Render difference summary for new generic format
 */
function renderDifferenceSummaryGeneric(comparison) {
  const { summary, strategy1, strategy2 } = comparison;
  const diff = summary.comparison;

  return `
    <div class="difference-summary">
      <h4>Comparison</h4>
      <table class="comparison-table">
        <thead>
          <tr>
            <th title="Comparison metric">Metric</th>
            <th title="Positive means ${strategy1.shortName} is higher, negative means ${strategy2.shortName} is higher">Difference (${strategy1.shortName} - ${strategy2.shortName})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td title="Tax paid when withdrawing/converting the pension">Initial Tax</td>
            <td class="${diff.initialTaxDifference > 0 ? 'negative' : 'positive'}">${formatDifference(diff.initialTaxDifference)}</td>
          </tr>
          <tr>
            <td title="Total fees paid over the period (transaction, storage, management)">Total Fees</td>
            <td class="${diff.totalFeesDifference > 0 ? 'negative' : 'positive'}">${formatDifference(diff.totalFeesDifference)}</td>
          </tr>
          <tr>
            <td title="Total net income received over all years">Net Withdrawn</td>
            <td class="${diff.totalNetWithdrawnDifference > 0 ? 'positive' : 'negative'}">${formatDifference(diff.totalNetWithdrawnDifference)}</td>
          </tr>
          <tr>
            <td title="Remaining portfolio value at end of period">Final Value</td>
            <td class="${diff.finalValueDifference > 0 ? 'positive' : 'negative'}">${formatDifference(diff.finalValueDifference)}</td>
          </tr>
          <tr class="total-row">
            <td title="Net Withdrawn + Final Value = total wealth generated">Total Value Realized</td>
            <td class="${diff.totalValueDifference > 0 ? 'positive' : 'negative'}">${formatDifference(diff.totalValueDifference)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// Legacy format support functions
// ============================================

/**
 * Render the winner announcement banner (legacy format)
 */
function renderWinnerBanner(summary) {
  const { winner, difference, percentageDifference } = summary;

  let winnerText, winnerClass, icon;
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
 * Render side-by-side metrics comparison (legacy format)
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
 * Render key insights (legacy format)
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
