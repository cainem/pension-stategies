/**
 * UI Components Index
 *
 * Exports all UI components for the pension strategy comparison tool.
 *
 * @module components
 */

export { initInputForm, getFormInputs, disableForm, enableForm } from './inputForm.js';
export { renderGoldResults, renderSippResults, clearResults, showResultsSection } from './resultsTable.js';
export { renderSummary, hideSummary, clearSummary } from './summary.js';
export { renderCharts, clearCharts, showChartsSection, hideChartsSection } from './chart.js';
export {
  initAdvancedSettings,
  getSettings,
  getConfig,
  resetToDefaults,
  isUsingCustomSettings,
  setSettings
} from './advancedSettings.js';
