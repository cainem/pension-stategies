/**
 * Input Form Component
 *
 * Handles form initialization, validation, and data extraction
 * for the pension strategy comparison inputs.
 *
 * @module components/inputForm
 */

import { DEFAULTS, YEAR_RANGE } from '../config/defaults.js';
import {
  BASE_STRATEGIES,
  COMBINATION_STRATEGIES,
  getStrategy
} from '../calculators/strategyRegistry.js';

/**
 * Default strategy selections
 */
const DEFAULT_STRATEGY_1 = 'gold';
const DEFAULT_STRATEGY_2 = 'sp500';

/**
 * Initialize the input form
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onSubmit - Callback when form is submitted with valid data
 */
export function initInputForm({ onSubmit }) {
  populateStrategyDropdowns();
  populateYearDropdown();
  setupStrategyChangeHandlers();
  setupYearChangeHandler();
  setupFormHandler(onSubmit);
  setDefaultValues();
}

/**
 * Populate both strategy dropdowns with grouped options
 */
function populateStrategyDropdowns() {
  const strategy1Select = document.getElementById('strategy-1');
  const strategy2Select = document.getElementById('strategy-2');

  if (!strategy1Select || !strategy2Select) return;

  const optionsHtml = buildStrategyOptionsHtml();

  strategy1Select.innerHTML = optionsHtml;
  strategy2Select.innerHTML = optionsHtml;

  // Set defaults
  strategy1Select.value = DEFAULT_STRATEGY_1;
  strategy2Select.value = DEFAULT_STRATEGY_2;
}

/**
 * Build HTML for strategy dropdown options with optgroups
 * @returns {string} HTML string for options
 */
function buildStrategyOptionsHtml() {
  let html = '';

  // Base Strategies group
  html += '<optgroup label="Base Strategies">';
  Object.values(BASE_STRATEGIES).forEach(strategy => {
    html += `<option value="${strategy.id}">${strategy.name}</option>`;
  });
  html += '</optgroup>';

  // Combined Strategies group
  html += '<optgroup label="Combined (50/50)">';
  Object.values(COMBINATION_STRATEGIES).forEach(strategy => {
    html += `<option value="${strategy.id}">${strategy.name}</option>`;
  });
  html += '</optgroup>';

  return html;
}

/**
 * Set up handlers for strategy selection changes
 */
function setupStrategyChangeHandlers() {
  const strategy1Select = document.getElementById('strategy-1');
  const strategy2Select = document.getElementById('strategy-2');

  if (!strategy1Select || !strategy2Select) return;

  const handleStrategyChange = () => {
    updateYearConstraints();
    highlightDuplicateStrategies();
  };

  strategy1Select.addEventListener('change', handleStrategyChange);
  strategy2Select.addEventListener('change', handleStrategyChange);

  // Initial update
  handleStrategyChange();
}

/**
 * Update year dropdown based on selected strategies' earliest years
 */
function updateYearConstraints() {
  const strategy1Id = document.getElementById('strategy-1')?.value;
  const strategy2Id = document.getElementById('strategy-2')?.value;
  const startYearSelect = document.getElementById('start-year');
  const noticeEl = document.getElementById('year-constraint-notice');

  if (!strategy1Id || !strategy2Id || !startYearSelect) return;

  const strategy1 = getStrategy(strategy1Id);
  const strategy2 = getStrategy(strategy2Id);

  // Get the maximum earliest year (most restrictive)
  const earliestYear = Math.max(strategy1.earliestYear, strategy2.earliestYear);
  const currentValue = parseInt(startYearSelect.value, 10);

  // Update dropdown options
  startYearSelect.innerHTML = '';
  for (let year = earliestYear; year <= YEAR_RANGE.max; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    startYearSelect.appendChild(option);
  }

  // Preserve selection if valid, otherwise default to earliest
  if (currentValue >= earliestYear && currentValue <= YEAR_RANGE.max) {
    startYearSelect.value = currentValue;
  } else {
    startYearSelect.value = Math.max(earliestYear, DEFAULTS.startYear);
  }

  // Show notice if year range is restricted
  if (noticeEl) {
    if (earliestYear > YEAR_RANGE.min) {
      const limitingStrategy = strategy1.earliestYear >= strategy2.earliestYear
        ? strategy1.shortName
        : strategy2.shortName;
      noticeEl.textContent = `Note: ${limitingStrategy} data available from ${earliestYear}`;
      noticeEl.hidden = false;
    } else {
      noticeEl.hidden = true;
    }
  }

  // Trigger year change to update comparison years
  startYearSelect.dispatchEvent(new Event('change'));
}

/**
 * Highlight if same strategy is selected for both dropdowns
 */
function highlightDuplicateStrategies() {
  const strategy1Select = document.getElementById('strategy-1');
  const strategy2Select = document.getElementById('strategy-2');

  if (!strategy1Select || !strategy2Select) return;

  const isDuplicate = strategy1Select.value === strategy2Select.value;

  strategy1Select.classList.toggle('input-warning', isDuplicate);
  strategy2Select.classList.toggle('input-warning', isDuplicate);
}

/**
 * Populate the year dropdown with valid years
 */
function populateYearDropdown() {
  const select = document.getElementById('start-year');
  if (!select) return;

  // Initial population with full range - will be constrained by strategy selection
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
    strategy1: formData.get('strategy1'),
    strategy2: formData.get('strategy2'),
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

  // Strategy validation
  if (!inputs.strategy1) {
    errors.push('Please select Strategy 1');
  }

  if (!inputs.strategy2) {
    errors.push('Please select Strategy 2');
  }

  if (inputs.strategy1 && inputs.strategy2 && inputs.strategy1 === inputs.strategy2) {
    errors.push('Please select two different strategies to compare');
  }

  // Validate start year against strategy constraints
  if (inputs.strategy1 && inputs.strategy2 && inputs.startYear) {
    try {
      const strategy1 = getStrategy(inputs.strategy1);
      const strategy2 = getStrategy(inputs.strategy2);
      const earliestYear = Math.max(strategy1.earliestYear, strategy2.earliestYear);

      if (inputs.startYear < earliestYear) {
        errors.push(`Start year must be ${earliestYear} or later for selected strategies`);
      }
    } catch {
      errors.push('Invalid strategy selection');
    }
  }

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
