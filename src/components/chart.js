/**
 * Chart Component
 *
 * Renders interactive charts comparing pension strategy performance.
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

// Chart color configurations
const STRATEGY_COLORS = {
  gold: {
    border: '#D4AF37',
    background: 'rgba(212, 175, 55, 0.1)',
    point: '#D4AF37'
  },
  sipp: {
    border: '#3B82F6',
    background: 'rgba(59, 130, 246, 0.1)',
    point: '#3B82F6'
  },
  combined: {
    border: '#8B5CF6',
    background: 'rgba(139, 92, 246, 0.1)',
    point: '#8B5CF6'
  }
};

/**
 * Get chart color configuration for a strategy
 */
function getStrategyColor(type) {
  return STRATEGY_COLORS[type] || STRATEGY_COLORS.sipp;
}

/**
 * Normalize comparison data to support both legacy and new format
 */
function normalizeComparisonData(comparison) {
  // Check if it's the new format with strategy1/strategy2
  if (comparison.strategy1 !== undefined) {
    const { strategy1, strategy2, yearlyComparison } = comparison;
    return {
      labels: yearlyComparison.map(y => y.year),
      series1: {
        name: strategy1.shortName,
        values: yearlyComparison.map(y => y.strategy1.assetValue),
        withdrawals: yearlyComparison.map(y => y.strategy1.netWithdrawal),
        colors: getStrategyColor(strategy1.type)
      },
      series2: {
        name: strategy2.shortName,
        values: yearlyComparison.map(y => y.strategy2.assetValue),
        withdrawals: yearlyComparison.map(y => y.strategy2.netWithdrawal),
        colors: getStrategyColor(strategy2.type)
      }
    };
  }

  // Legacy format with gold/sipp
  const { yearlyComparison } = comparison;
  return {
    labels: yearlyComparison.map(y => y.year),
    series1: {
      name: 'Gold Strategy',
      values: yearlyComparison.map(y => y.gold.assetValue),
      withdrawals: yearlyComparison.map(y => y.gold.netWithdrawal),
      colors: getStrategyColor('gold')
    },
    series2: {
      name: 'S&P 500 SIPP',
      values: yearlyComparison.map(y => y.sipp.assetValue),
      withdrawals: yearlyComparison.map(y => y.sipp.netWithdrawal),
      colors: getStrategyColor('sipp')
    }
  };
}

/**
 * Render all charts for the comparison
 *
 * @param {Object} comparison - The comparison result from compareStrategies or compareAnyStrategies
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

  const data = normalizeComparisonData(comparison);
  const ctx = canvas.getContext('2d');

  portfolioChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: data.series1.name,
          data: data.series1.values,
          borderColor: data.series1.colors.border,
          backgroundColor: data.series1.colors.background,
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: data.series1.colors.point
        },
        {
          label: data.series2.name,
          data: data.series2.values,
          borderColor: data.series2.colors.border,
          backgroundColor: data.series2.colors.background,
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: data.series2.colors.point
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

  const data = normalizeComparisonData(comparison);

  // Calculate cumulative withdrawals
  let cumulative1 = 0;
  let cumulative2 = 0;
  const series1Data = data.series1.withdrawals.map(w => {
    cumulative1 += w;
    return cumulative1;
  });
  const series2Data = data.series2.withdrawals.map(w => {
    cumulative2 += w;
    return cumulative2;
  });

  const ctx = canvas.getContext('2d');

  withdrawalChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: data.series1.name,
          data: series1Data,
          borderColor: data.series1.colors.border,
          backgroundColor: data.series1.colors.background,
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: data.series1.colors.point
        },
        {
          label: data.series2.name,
          data: series2Data,
          borderColor: data.series2.colors.border,
          backgroundColor: data.series2.colors.background,
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: data.series2.colors.point
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
    section.classList.add('visible');
  }
}

/**
 * Hide the charts section
 */
export function hideChartsSection() {
  const section = document.getElementById('charts-section');
  if (section) {
    section.hidden = true;
    section.classList.remove('visible');
  }
}
