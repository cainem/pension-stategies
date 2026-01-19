/**
 * Input Form Component
 *
 * Handles form initialization, validation, and data extraction
 * for the pension strategy comparison inputs.
 *
 * @module components/inputForm
 */

import { DEFAULTS, YEAR_RANGE } from '../config/defaults.js';

/**
 * Initialize the input form
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onSubmit - Callback when form is submitted with valid data
 */
export function initInputForm({ onSubmit }) {
  populateYearDropdown();
  setupYearChangeHandler();
  setupFormHandler(onSubmit);
  setDefaultValues();
}

/**
 * Populate the year dropdown with valid years
 */
function populateYearDropdown() {
  const select = document.getElementById('start-year');
  if (!select) return;

  // Clear existing options
  select.innerHTML = '';

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
 * Set up handler to update max years when start year changes
 */
function setupYearChangeHandler() {
  const startYearSelect = document.getElementById('start-year');
  const yearsInput = document.getElementById('comparison-years');

  if (!startYearSelect || !yearsInput) return;

  startYearSelect.addEventListener('change', () => {
    const startYear = parseInt(startYearSelect.value, 10);
    const maxYears = YEAR_RANGE.max - startYear + 1;

    yearsInput.max = maxYears;

    // Reduce years if current value exceeds max
    if (parseInt(yearsInput.value, 10) > maxYears) {
      yearsInput.value = maxYears;
    }
  });

  // Trigger initial update
  startYearSelect.dispatchEvent(new Event('change'));
}

/**
 * Set default form values
 */
function setDefaultValues() {
  const pensionInput = document.getElementById('pension-amount');
  const withdrawalInput = document.getElementById('withdrawal-rate');
  const yearsInput = document.getElementById('comparison-years');

  if (pensionInput) pensionInput.value = DEFAULTS.pensionAmount;
  if (withdrawalInput) withdrawalInput.value = DEFAULTS.withdrawalRate;
  if (yearsInput) yearsInput.value = DEFAULTS.comparisonYears;
}

/**
 * Set up the form submission handler
 *
 * @param {Function} onSubmit - Callback for valid form submission
 */
function setupFormHandler(onSubmit) {
  const form = document.getElementById('strategy-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const inputs = getFormInputs();
    const validation = validateFormInputs(inputs);

    if (!validation.valid) {
      showValidationErrors(validation.errors);
      return;
    }

    clearValidationErrors();
    onSubmit(inputs);
  });
}

/**
 * Extract form inputs
 *
 * @returns {Object} Form input values
 */
export function getFormInputs() {
  const form = document.getElementById('strategy-form');
  if (!form) return null;

  const formData = new FormData(form);

  return {
    pensionAmount: parseFloat(formData.get('pensionAmount')),
    startYear: parseInt(formData.get('startYear'), 10),
    withdrawalRate: parseFloat(formData.get('withdrawalRate')),
    years: parseInt(formData.get('comparisonYears'), 10)
  };
}

/**
 * Validate form inputs
 *
 * @param {Object} inputs - Form inputs to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
function validateFormInputs(inputs) {
  const errors = [];

  if (!inputs.pensionAmount || inputs.pensionAmount < 10000) {
    errors.push('Pension amount must be at least £10,000');
  }

  if (inputs.pensionAmount > 10000000) {
    errors.push('Pension amount must not exceed £10,000,000');
  }

  if (!inputs.startYear || inputs.startYear < YEAR_RANGE.min || inputs.startYear > YEAR_RANGE.max) {
    errors.push(`Start year must be between ${YEAR_RANGE.min} and ${YEAR_RANGE.max}`);
  }

  if (!inputs.withdrawalRate || inputs.withdrawalRate < 1 || inputs.withdrawalRate > 10) {
    errors.push('Withdrawal rate must be between 1% and 10%');
  }

  if (!inputs.years || inputs.years < 1) {
    errors.push('Comparison period must be at least 1 year');
  }

  const maxYears = YEAR_RANGE.max - inputs.startYear + 1;
  if (inputs.years > maxYears) {
    errors.push(`Comparison period cannot exceed ${maxYears} years (data available until ${YEAR_RANGE.max})`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Display validation errors
 *
 * @param {string[]} errors - Array of error messages
 */
function showValidationErrors(errors) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.innerHTML = errors.map(e => `<p>${e}</p>`).join('');
    errorEl.hidden = false;
    errorEl.classList.add('visible');
  }
}

/**
 * Clear validation errors
 */
function clearValidationErrors() {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.innerHTML = '';
    errorEl.hidden = true;
    errorEl.classList.remove('visible');
  }
}

/**
 * Disable form during calculation
 */
export function disableForm() {
  const form = document.getElementById('strategy-form');
  const button = form?.querySelector('button[type="submit"]');

  if (form) {
    Array.from(form.elements).forEach(el => el.disabled = true);
  }

  if (button) {
    button.textContent = 'Calculating...';
  }
}

/**
 * Re-enable form after calculation
 */
export function enableForm() {
  const form = document.getElementById('strategy-form');
  const button = form?.querySelector('button[type="submit"]');

  if (form) {
    Array.from(form.elements).forEach(el => el.disabled = false);
  }

  if (button) {
    button.textContent = 'Calculate Comparison';
  }
}

export default {
  initInputForm,
  getFormInputs,
  disableForm,
  enableForm
};
