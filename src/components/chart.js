/**
 * Chart Component
 *
 * Renders interactive charts comparing Gold vs SIPP strategy performance.
 * Uses Chart.js for visualization.
 *
 * @module components/chart
 */

import { Chart, registerables } from 'chart.js';
import { formatCurrency } from '../utils/formatters.js';

// Register all Chart.js components
Chart.register(...registerables);

// Store chart instances for cleanup
let portfolioChart = null;
let withdrawalChart = null;

/**
 * Render all charts for the comparison
 *
 * @param {Object} comparison - The comparison result from compareStrategies
 */
export function renderCharts(comparison) {
  renderPortfolioValueChart(comparison);
  renderCumulativeWithdrawalChart(comparison);
}

/**
 * Render portfolio value comparison chart
 *
 * @param {Object} comparison - The comparison result
 */
function renderPortfolioValueChart(comparison) {
  const canvas = document.getElementById('portfolio-chart');
  if (!canvas) return;

  // Destroy existing chart if it exists
  if (portfolioChart) {
    portfolioChart.destroy();
  }

  const { yearlyComparison } = comparison;

  const labels = yearlyComparison.map(y => y.year);
  const goldData = yearlyComparison.map(y => y.gold.assetValue);
  const sippData = yearlyComparison.map(y => y.sipp.assetValue);

  const ctx = canvas.getContext('2d');

  portfolioChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Gold Strategy',
          data: goldData,
          borderColor: '#D4AF37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#D4AF37'
        },
        {
          label: 'S&P 500 SIPP',
          data: sippData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3B82F6'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: 'Portfolio Value Over Time',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            bottom: 20
          }
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${formatCurrency(value)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Portfolio Value (£)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            callback: function(value) {
              return '£' + (value / 1000).toFixed(0) + 'k';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

/**
 * Render cumulative withdrawal comparison chart
 *
 * @param {Object} comparison - The comparison result
 */
function renderCumulativeWithdrawalChart(comparison) {
  const canvas = document.getElementById('withdrawal-chart');
  if (!canvas) return;

  // Destroy existing chart if it exists
  if (withdrawalChart) {
    withdrawalChart.destroy();
  }

  const { yearlyComparison } = comparison;

  const labels = yearlyComparison.map(y => y.year);

  // Calculate cumulative withdrawals
  let goldCumulative = 0;
  let sippCumulative = 0;
  const goldData = yearlyComparison.map(y => {
    goldCumulative += y.gold.netWithdrawal;
    return goldCumulative;
  });
  const sippData = yearlyComparison.map(y => {
    sippCumulative += y.sipp.netWithdrawal;
    return sippCumulative;
  });

  const ctx = canvas.getContext('2d');

  withdrawalChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Gold Strategy',
          data: goldData,
          borderColor: '#D4AF37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#D4AF37'
        },
        {
          label: 'S&P 500 SIPP',
          data: sippData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3B82F6'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: 'Cumulative Net Withdrawals',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            bottom: 20
          }
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${formatCurrency(value)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cumulative Withdrawals (£)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            callback: function(value) {
              return '£' + (value / 1000).toFixed(0) + 'k';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

/**
 * Clear all charts
 */
export function clearCharts() {
  if (portfolioChart) {
    portfolioChart.destroy();
    portfolioChart = null;
  }
  if (withdrawalChart) {
    withdrawalChart.destroy();
    withdrawalChart = null;
  }
}

/**
 * Show the charts section
 */
export function showChartsSection() {
  const section = document.getElementById('charts-section');
  if (section) {
    section.hidden = false;
  }
}

/**
 * Hide the charts section
 */
export function hideChartsSection() {
  const section = document.getElementById('charts-section');
  if (section) {
    section.hidden = true;
  }
}
