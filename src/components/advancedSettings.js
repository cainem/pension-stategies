/**
 * Advanced Settings Component
 *
 * Provides a collapsible section for configuring strategy fees.
 * Allows users to override default transaction costs, storage fees,
 * and management fees.
 *
 * @module components/advancedSettings
 */

import { COSTS } from '../config/defaults.js';

/**
 * Advanced settings state
 * @type {Object}
 */
let settingsState = {
  goldTransactionPercent: COSTS.goldTransactionPercent,
  goldStorageFeePercent: COSTS.goldStorageFeePercent,
  sippManagementFeePercent: COSTS.sippManagementFeePercent,
  useCustomSettings: false
};

/**
 * Initialize the advanced settings component
 *
 * @param {Object} options - Configuration options
 * @param {Function} [options.onChange] - Callback when settings change
 */
export function initAdvancedSettings({ onChange } = {}) {
  const container = document.getElementById('advanced-settings');
  if (!container) return;

  renderAdvancedSettings(container);
  setupEventHandlers(onChange);
  resetToDefaults();
}

/**
 * Render the advanced settings HTML
 *
 * @param {HTMLElement} container - Container element
 */
function renderAdvancedSettings(container) {
  container.innerHTML = `
    <details class="advanced-settings">
      <summary class="advanced-settings__toggle">
        <span class="advanced-settings__title">⚙️ Advanced Fee Settings</span>
        <span class="advanced-settings__subtitle">(click to customize)</span>
      </summary>

      <div class="advanced-settings__content">
        <p class="advanced-settings__description">
          Customize the transaction costs and fees used in calculations.
          Changes will apply to your next calculation.
        </p>

        <div class="advanced-settings__grid">
          <!-- Gold Fees -->
          <fieldset class="advanced-settings__group">
            <legend>Gold Strategy Fees</legend>

            <div class="form-group">
              <label for="gold-transaction-fee">
                Transaction Cost (buy/sell)
                <span class="form-hint">Applied when buying and selling gold</span>
              </label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  id="gold-transaction-fee"
                  name="goldTransactionPercent"
                  min="0"
                  max="10"
                  step="0.1"
                  value="${COSTS.goldTransactionPercent}"
                />
                <span class="input-suffix">%</span>
              </div>
              <span class="form-default">Default: ${COSTS.goldTransactionPercent}%</span>
            </div>

            <div class="form-group">
              <label for="gold-storage-fee">
                Annual Storage Fee
                <span class="form-hint">Charged annually on gold holdings</span>
              </label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  id="gold-storage-fee"
                  name="goldStorageFeePercent"
                  min="0"
                  max="5"
                  step="0.1"
                  value="${COSTS.goldStorageFeePercent}"
                />
                <span class="input-suffix">%</span>
              </div>
              <span class="form-default">Default: ${COSTS.goldStorageFeePercent}%</span>
            </div>
          </fieldset>

          <!-- SIPP Fees -->
          <fieldset class="advanced-settings__group">
            <legend>SIPP Strategy Fees</legend>

            <div class="form-group">
              <label for="sipp-management-fee">
                Annual Management Fee
                <span class="form-hint">Platform/fund management costs</span>
              </label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  id="sipp-management-fee"
                  name="sippManagementFeePercent"
                  min="0"
                  max="3"
                  step="0.1"
                  value="${COSTS.sippManagementFeePercent}"
                />
                <span class="input-suffix">%</span>
              </div>
              <span class="form-default">Default: ${COSTS.sippManagementFeePercent}%</span>
            </div>
          </fieldset>
        </div>

        <div class="advanced-settings__actions">
          <button type="button" id="reset-fees-btn" class="btn btn--secondary">
            Reset to Defaults
          </button>
          <span id="settings-status" class="advanced-settings__status"></span>
        </div>
      </div>
    </details>
  `;
}

/**
 * Set up event handlers for the settings inputs
 *
 * @param {Function} [onChange] - Callback when settings change
 */
function setupEventHandlers(onChange) {
  // Input change handlers
  const inputs = document.querySelectorAll('.advanced-settings input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      updateSettingsState();
      showModifiedStatus();
      if (onChange) onChange(getSettings());
    });

    input.addEventListener('input', () => {
      updateSettingsState();
      showModifiedStatus();
    });
  });

  // Reset button
  const resetBtn = document.getElementById('reset-fees-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetToDefaults();
      if (onChange) onChange(getSettings());
    });
  }
}

/**
 * Update the internal settings state from form inputs
 */
function updateSettingsState() {
  const goldTransactionInput = document.getElementById('gold-transaction-fee');
  const goldStorageInput = document.getElementById('gold-storage-fee');
  const sippManagementInput = document.getElementById('sipp-management-fee');

  settingsState.goldTransactionPercent = parseFloat(goldTransactionInput?.value) || COSTS.goldTransactionPercent;
  settingsState.goldStorageFeePercent = parseFloat(goldStorageInput?.value) || COSTS.goldStorageFeePercent;
  settingsState.sippManagementFeePercent = parseFloat(sippManagementInput?.value) || COSTS.sippManagementFeePercent;

  // Check if any settings differ from defaults
  settingsState.useCustomSettings = (
    settingsState.goldTransactionPercent !== COSTS.goldTransactionPercent ||
    settingsState.goldStorageFeePercent !== COSTS.goldStorageFeePercent ||
    settingsState.sippManagementFeePercent !== COSTS.sippManagementFeePercent
  );
}

/**
 * Show status message indicating settings are modified
 */
function showModifiedStatus() {
  const statusEl = document.getElementById('settings-status');
  if (!statusEl) return;

  if (settingsState.useCustomSettings) {
    statusEl.textContent = '⚠️ Using custom fees';
    statusEl.className = 'advanced-settings__status advanced-settings__status--modified';
  } else {
    statusEl.textContent = '✓ Using default fees';
    statusEl.className = 'advanced-settings__status advanced-settings__status--default';
  }
}

/**
 * Reset all settings to their default values
 */
export function resetToDefaults() {
  const goldTransactionInput = document.getElementById('gold-transaction-fee');
  const goldStorageInput = document.getElementById('gold-storage-fee');
  const sippManagementInput = document.getElementById('sipp-management-fee');

  if (goldTransactionInput) goldTransactionInput.value = COSTS.goldTransactionPercent;
  if (goldStorageInput) goldStorageInput.value = COSTS.goldStorageFeePercent;
  if (sippManagementInput) sippManagementInput.value = COSTS.sippManagementFeePercent;

  settingsState = {
    goldTransactionPercent: COSTS.goldTransactionPercent,
    goldStorageFeePercent: COSTS.goldStorageFeePercent,
    sippManagementFeePercent: COSTS.sippManagementFeePercent,
    useCustomSettings: false
  };

  showModifiedStatus();
}

/**
 * Get the current settings
 *
 * @returns {Object} Current fee settings
 */
export function getSettings() {
  return {
    goldTransactionPercent: settingsState.goldTransactionPercent,
    goldStorageFeePercent: settingsState.goldStorageFeePercent,
    sippManagementFeePercent: settingsState.sippManagementFeePercent
  };
}

/**
 * Get settings as a config object for calculators
 * Returns empty object if using defaults (to let calculators use their defaults)
 *
 * @returns {Object} Config object for calculators
 */
export function getConfig() {
  if (!settingsState.useCustomSettings) {
    return {};
  }

  return {
    goldTransactionPercent: settingsState.goldTransactionPercent,
    goldStorageFeePercent: settingsState.goldStorageFeePercent,
    sippManagementFeePercent: settingsState.sippManagementFeePercent
  };
}

/**
 * Check if custom settings are being used
 *
 * @returns {boolean} True if any settings differ from defaults
 */
export function isUsingCustomSettings() {
  return settingsState.useCustomSettings;
}

/**
 * Set settings programmatically
 *
 * @param {Object} settings - Settings to apply
 * @param {number} [settings.goldTransactionPercent] - Gold transaction fee
 * @param {number} [settings.goldStorageFeePercent] - Gold storage fee
 * @param {number} [settings.sippManagementFeePercent] - SIPP management fee
 */
export function setSettings(settings) {
  const goldTransactionInput = document.getElementById('gold-transaction-fee');
  const goldStorageInput = document.getElementById('gold-storage-fee');
  const sippManagementInput = document.getElementById('sipp-management-fee');

  if (settings.goldTransactionPercent !== undefined && goldTransactionInput) {
    goldTransactionInput.value = settings.goldTransactionPercent;
  }
  if (settings.goldStorageFeePercent !== undefined && goldStorageInput) {
    goldStorageInput.value = settings.goldStorageFeePercent;
  }
  if (settings.sippManagementFeePercent !== undefined && sippManagementInput) {
    sippManagementInput.value = settings.sippManagementFeePercent;
  }

  updateSettingsState();
  showModifiedStatus();
}

export default {
  initAdvancedSettings,
  getSettings,
  getConfig,
  resetToDefaults,
  isUsingCustomSettings,
  setSettings
};
