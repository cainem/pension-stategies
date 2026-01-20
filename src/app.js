/**
 * Main Application Orchestration
 * Wires together components and handles user interactions
 */

import { initInputForm, disableForm, enableForm } from './components/inputForm.js';
import { renderResultsForStrategies, clearResults, showResultsSection } from './components/resultsTable.js';
import { renderSummary, clearSummary } from './components/summary.js';
import { renderCharts, clearCharts, showChartsSection } from './components/chart.js';
import { initAdvancedSettings, getConfig } from './components/advancedSettings.js';
import { renderDisclaimers, initializeDisclaimers } from './components/disclaimer.js';
import { compareStrategies, compareAnyStrategies } from './calculators/comparisonEngine.js';

/**
 * Initialize the application
 */
export function initApp() {
  initInputForm({
    onSubmit: handleCalculation
  });

  initAdvancedSettings();
  initializeDisclaimers();

  console.log('Pension Strategy Comparison Tool initialized');
}

/**
 * Handle the calculation when form is submitted
 *
 * @param {Object} inputs - Validated form inputs
 */
async function handleCalculation(inputs) {
  try {
    disableForm();
    clearResults();
    clearSummary();
    clearCharts();

    // Small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 10));

    // Get fee configuration from advanced settings
    const config = getConfig();

    // Determine which comparison to use
    let comparison;
    if (inputs.strategy1 && inputs.strategy2) {
      // Use the new generic comparison for any two strategies
      comparison = compareAnyStrategies(
        inputs.strategy1,
        inputs.strategy2,
        inputs.pensionAmount,
        inputs.startYear,
        inputs.withdrawalRate,
        inputs.years,
        config
      );
    } else {
      // Fallback to legacy comparison (gold vs sp500)
      comparison = compareStrategies(
        inputs.pensionAmount,
        inputs.startYear,
        inputs.withdrawalRate,
        inputs.years,
        config
      );
      // Adapt legacy format to new format
      comparison = adaptLegacyComparison(comparison);
    }

    // Render results
    renderResultsForStrategies(comparison);
    showResultsSection();

    // Render charts
    renderCharts(comparison);
    showChartsSection();

    // Render summary
    renderSummary(comparison);

    // Render strategy-specific disclaimers
    renderDisclaimers(
      'disclaimers-content',
      inputs.strategy1 || 'gold',
      inputs.strategy2 || 'sp500',
      inputs.startYear
    );
    showDisclaimersSection();

    // Scroll to results
    scrollToResults();

  } catch (error) {
    console.error('Calculation error:', error);
    showError(error.message || 'An error occurred during calculation');
  } finally {
    enableForm();
  }
}

/**
 * Adapt legacy comparison format to new generic format
 *
 * @param {Object} legacy - Legacy comparison result
 * @returns {Object} Adapted comparison result
 */
function adaptLegacyComparison(legacy) {
  return {
    inputs: legacy.inputs,
    strategy1: {
      id: 'gold',
      name: 'Physical Gold',
      shortName: 'Gold',
      type: 'gold',
      result: legacy.gold,
      metrics: legacy.summary.gold
    },
    strategy2: {
      id: 'sp500',
      name: 'S&P 500 SIPP',
      shortName: 'S&P 500',
      type: 'sipp',
      result: legacy.sipp,
      metrics: legacy.summary.sipp
    },
    yearlyComparison: legacy.yearlyComparison.map(y => ({
      year: y.year,
      strategy1: y.gold,
      strategy2: y.sipp,
      difference: y.difference
    })),
    summary: {
      winner: legacy.summary.winner === 'gold' ? 'strategy1' : (legacy.summary.winner === 'sipp' ? 'strategy2' : 'tie'),
      winnerName: legacy.summary.winner === 'tie' ? 'Tie' : (legacy.summary.winner === 'gold' ? 'Gold' : 'S&P 500'),
      difference: legacy.summary.difference,
      percentageDifference: legacy.summary.percentageDifference,
      strategy1LeadsBy: legacy.summary.winnerLeadsBy,
      comparison: legacy.summary.comparison
    }
  };
}

/**
 * Scroll to the results section
 */
function scrollToResults() {
  const resultsSection = document.querySelector('.results-section');
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Show the disclaimers section
 */
function showDisclaimersSection() {
  const section = document.getElementById('disclaimers-section');
  if (section) {
    section.hidden = false;
    section.classList.add('visible');
  }
}

/**
 * Display an error message
 *
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
}

/**
 * Hide the error message
 */
function hideError() {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.hidden = true;
  }
}

