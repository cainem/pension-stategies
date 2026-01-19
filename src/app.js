/**
 * Main Application Orchestration
 * Wires together components and handles user interactions
 */

import { DEFAULTS, YEAR_RANGE } from './config/defaults.js';
import { validateInputs } from './utils/validators.js';

/**
 * Initialize the application
 */
export function initApp() {
  populateYearDropdown();
  setupFormHandler();
  console.log('Pension Strategy Comparison Tool initialized');
}

/**
 * Populate the year dropdown with valid years
 */
function populateYearDropdown() {
  const select = document.getElementById('start-year');
  if (!select) return;

  for (let year = YEAR_RANGE.min; year <= YEAR_RANGE.max; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === DEFAULTS.startYear) {
      option.selected = true;
    }
    select.appendChild(option);
  }
}

/**
 * Set up the form submission handler
 */
function setupFormHandler() {
  const form = document.getElementById('strategy-form');
  if (!form) return;

  form.addEventListener('submit', handleFormSubmit);
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const inputs = {
    pensionAmount: parseFloat(formData.get('pensionAmount')),
    startYear: parseInt(formData.get('startYear'), 10),
    withdrawalRate: parseFloat(formData.get('withdrawalRate')),
    comparisonYears: parseInt(formData.get('comparisonYears'), 10)
  };

  // Validate inputs
  const validation = validateInputs(inputs);
  if (!validation.valid) {
    showError(validation.errors.join(', '));
    return;
  }

  hideError();

  // TODO: Implement calculation logic in later stages
  console.log('Calculating with inputs:', inputs);

  // Placeholder: Show message until calculators are implemented
  showError('Calculation logic will be implemented in Stage 5-6. Inputs validated successfully!');
}

/**
 * Display an error message
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
