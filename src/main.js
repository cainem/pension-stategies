/**
 * Application Entry Point
 * Bootstraps the pension strategy comparison application
 */

import { initApp } from './app.js';

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}
