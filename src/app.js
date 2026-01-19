/**
 * Main Application Orchestration
 * Wires together components and handles user interactions
 */

import { initInputForm, disableForm, enableForm } from './components/inputForm.js';
import { renderGoldResults, renderSippResults, clearResults, showResultsSection } from './components/resultsTable.js';
import { renderSummary, clearSummary } from './components/summary.js';
import { compareStrategies } from './calculators/comparisonEngine.js';

/**
 * Initialize the application
 */
export function initApp() {
  initInputForm({
    onSubmit: handleCalculation
  });

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

    // Small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 10));

    // Run comparison
    const comparison = compareStrategies(
      inputs.pensionAmount,
      inputs.startYear,
      inputs.withdrawalRate,
      inputs.years
    );

    // Render results
    renderGoldResults(comparison.gold);
    renderSippResults(comparison.sipp);
    showResultsSection();

    // Render summary
    renderSummary(comparison);

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
 * Scroll to the results section
 */
function scrollToResults() {
  const resultsSection = document.querySelector('.results-section');
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

