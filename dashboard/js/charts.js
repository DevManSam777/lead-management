// charts.js - Complete rewrite for reliable chart updates
// Global chart instance storage
const chartInstances = {
  statusChart: null,
  projectsChart: null,
  revenueChart: null
};

/**
 * Initialize all charts
 * This is the main entry point called from dashboard.js
 */
function initializeCharts() {
  console.log("Initializing chart system...");
  
  // Clean up any existing charts first
  destroyAllCharts();
  
  // Create initial charts
  createAllCharts();
  
  // Set up global reference to update function
  window.updateAllCharts = updateAllCharts;
  
  // Add event listeners for data changes
  setupChartEventListeners();
  
  // Add theme change listener
  setupThemeChangeListener();
  
  console.log("Chart system initialized successfully");
}

/**
 * Set up event listeners for chart data changes
 */
function setupChartEventListeners() {
  // Remove any existing listeners first to prevent duplicates
  window.removeEventListener("leadSaved", updateAllCharts);
  window.removeEventListener("leadDeleted", updateAllCharts);
  window.removeEventListener("paymentsUpdated", updateAllCharts);
  
  // Add listeners for data change events
  window.addEventListener("leadSaved", function(event) {
    console.log("Lead saved event detected, updating charts");
    updateAllCharts();
  });
  
  window.addEventListener("leadDeleted", function(event) {
    console.log("Lead deleted event detected, updating charts");
    updateAllCharts();
  });
  
  window.addEventListener("paymentsUpdated", function(event) {
    console.log("Payments updated event detected, updating charts");
    updateAllCharts();
  });
  
  // Add window resize listener
  window.removeEventListener("resize", handleResize);
  window.addEventListener("resize", handleResize);
}

/**
 * Set up theme change listener
 */
function setupThemeChangeListener() {
  // Create observer for theme changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === "data-theme") {
        console.log("Theme changed, updating charts");
        updateAllCharts();
      }
    });
  });
  
  // Start observing theme changes
  observer.observe(document.documentElement, { attributes: true });
}

/**
 * Handle window resize events (debounced)
 */
let resizeTimeout;
function handleResize() {
  // Clear previous timeout
  clearTimeout(resizeTimeout);
  
  // Set new timeout to prevent excessive updates
  resizeTimeout = setTimeout(function() {
    console.log("Window resized, updating charts");
    updateAllCharts();
  }, 250); // 250ms debounce
}

/**
 * Create all charts initially
 */
function createAllCharts() {
  createStatusChart();
  createProjectsChart();
  createRevenueChart();
}

/**
 * Update all charts with current data
 */
function updateAllCharts() {
  console.log("Updating all charts with latest data");
  
  updateStatusChart();
  updateProjectsChart();
  updateRevenueChart();
}

/**
 * Destroy all chart instances for clean slate
 */
function destroyAllCharts() {
  console.log("Destroying all chart instances");
  
  // Safely destroy each chart if it exists
  for (const key in chartInstances) {
    if (chartInstances[key]) {
      try {
        chartInstances[key].destroy();
        chartInstances[key] = null;
      } catch (error) {
        console.error(`Error destroying ${key}:`, error);
      }
    }
  }
}

/**
 * Get theme-aware colors from CSS variables
 */
function getThemeColors() {
  const root = document.documentElement;
  return {
    textColor: getComputedStyle(root).getPropertyValue("--text-color").trim(),
    textMuted: getComputedStyle(root).getPropertyValue("--text-muted").trim(),
    borderColor: getComputedStyle(root).getPropertyValue("--border-color").trim(),
    cardBackground: getComputedStyle(root).getPropertyValue("--card-background").trim(),
    // Chart-specific colors
    colors: {
      blue: { bg: "rgba(64, 192, 255, 0.7)", border: "#40C0FF" },
      orange: { bg: "rgba(255, 159, 64, 0.7)", border: "#FF9F40" },
      purple: { bg: "rgba(153, 102, 255, 0.7)", border: "#9966FF" },
      green: { bg: "rgba(40, 167, 69, 0.7)", border: "#28A745" },
      red: { bg: "rgba(255, 99, 132, 0.7)", border: "#FF6384" }
    }
  };
}

/**
 * Get responsive font size based on container width
 */
function getResponsiveFontSize(container) {
  if (!container) return 12; // Fallback size
  
  const width = container.clientWidth;
  if (width < 480) return 10; // Small screens
  if (width < 768) return 12; // Medium screens
  return 14; // Large screens
}

// ========================
// STATUS CHART FUNCTIONS
// ========================

/**
 * Create the status distribution chart
 */
function createStatusChart() {
  const container = document.getElementById("statusDistributionChart");
  if (!container) {
    console.log("Status chart container not found");
    return;
  }
  
  console.log("Creating status distribution chart");
  
  try {
    // Get the current data
    const chartData = prepareStatusChartData();
    
    // Create or clear canvas
    ensureCanvas(container);
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create the chart
    chartInstances.statusChart = new Chart(ctx, {
      type: "doughnut",
      data: chartData,
      options: getStatusChartOptions(),
      plugins: [centerTextPlugin]
    });
    
    console.log("Status chart created successfully");
  } catch (error) {
    console.error("Error creating status chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
  }
}

/**
 * Update the status distribution chart
 */
function updateStatusChart() {
  // Get the chart container
  const container = document.getElementById("statusDistributionChart");
  if (!container) {
    console.log("Status chart container not found");
    return;
  }
  
  console.log("Updating status distribution chart");
  
  try {
    // Get updated data
    const chartData = prepareStatusChartData();
    const leads = window.allLeads || [];
    
    // If no leads, show no data message
    if (leads.length === 0) {
      if (chartInstances.statusChart) {
        chartInstances.statusChart.destroy();
        chartInstances.statusChart = null;
      }
      container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
      return;
    }
    
    // If chart exists, update it
    if (chartInstances.statusChart) {
      chartInstances.statusChart.data = chartData;
      chartInstances.statusChart.options = getStatusChartOptions();
      chartInstances.statusChart.update();
    } else {
      // If no chart exists, create it
      createStatusChart();
    }
  } catch (error) {
    console.error("Error updating status chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error updating chart</div>';
  }
}

/**
 * Prepare data for status chart
 */
function prepareStatusChartData() {
  const leads = window.allLeads || [];
  
  // Group leads by status
  const statusCounts = {
    new: 0,
    contacted: 0,
    "in-progress": 0,
    "closed-won": 0,
    "closed-lost": 0,
  };
  
  // Count leads in each status
  leads.forEach((lead) => {
    const status = lead.status || "new";
    statusCounts[status]++;
  });
  
  // Get theme colors
  const colors = getThemeColors().colors;
  
  // Prepare chart data
  return {
    labels: ["New", "Contacted", "In Progress", "Won", "Lost"],
    datasets: [
      {
        data: [
          statusCounts["new"],
          statusCounts["contacted"],
          statusCounts["in-progress"],
          statusCounts["closed-won"],
          statusCounts["closed-lost"],
        ],
        backgroundColor: [
          colors.blue.bg,    // New
          colors.orange.bg,  // Contacted
          colors.purple.bg,  // In Progress
          colors.green.bg,   // Won
          colors.red.bg,     // Lost
        ],
        borderWidth: 2,
        borderColor: [
          colors.blue.border,
          colors.orange.border,
          colors.purple.border,
          colors.green.border,
          colors.red.border,
        ],
      },
    ],
  };
}

/**
 * Get options for status chart
 */
function getStatusChartOptions() {
  const container = document.getElementById("statusDistributionChart");
  const theme = getThemeColors();
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    layout: {
      padding: 10,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: theme.textColor,
          font: {
            size: getResponsiveFontSize(container),
          },
          boxWidth: getResponsiveFontSize(container),
        },
      },
      tooltip: {
        backgroundColor: theme.cardBackground,
        titleColor: theme.textColor,
        bodyColor: theme.textColor,
        borderColor: theme.borderColor,
        borderWidth: 1,
        callbacks: {
          title: function (tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function (context) {
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage = Math.round((value / total) * 100) + "%";
            return `${value} projects (${percentage})`;
          },
        },
      },
    },
  };
}

/**
 * Plugin for center text in doughnut chart
 */
const centerTextPlugin = {
  id: "centerText",
  beforeDraw: function (chart) {
    const leads = window.allLeads || [];
    if (leads.length === 0) return;
    
    const ctx = chart.ctx;
    const width = chart.width;
    const height = chart.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Get theme colors
    const theme = getThemeColors();
    
    ctx.restore();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    
    // Define the text
    const headerText = "Total";
    const totalText = leads.length.toString();
    
    // Calculate font sizes
    const baseFontSize = Math.min(width, height) / 20;
    const headerFontSize = baseFontSize * 1;
    const totalFontSize = baseFontSize * 2.4;
    
    // Position adjustment
    const verticalOffset = -25;
    const headerY = centerY + verticalOffset - totalFontSize * 0.45;
    const totalY = centerY + verticalOffset + totalFontSize * 0.55;
    
    // Draw header text
    ctx.font = `bold ${headerFontSize}px sans-serif`;
    ctx.fillStyle = theme.textMuted;
    ctx.fillText(headerText, centerX, headerY);
    
    // Draw total count text
    ctx.font = `${totalFontSize}px sans-serif`;
    ctx.fillStyle = theme.textColor;
    ctx.fillText(totalText, centerX, totalY);
    
    ctx.save();
  },
};

// ========================
// PROJECTS CHART FUNCTIONS
// ========================

/**
 * Create the new projects chart
 */
function createProjectsChart() {
  const container = document.getElementById("newProjectsChart");
  if (!container) {
    console.log("New projects chart container not found");
    return;
  }
  
  console.log("Creating new projects chart");
  
  try {
    // Get chart data
    const chartData = prepareProjectsChartData();
    const leads = window.allLeads || [];
    
    // If no leads, show message and return
    if (leads.length === 0) {
      container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
      return;
    }
    
    // Create or clear canvas
    ensureCanvas(container);
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create the chart
    chartInstances.projectsChart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: getProjectsChartOptions()
    });
    
    console.log("New projects chart created successfully");
  } catch (error) {
    console.error("Error creating new projects chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
  }
}

/**
 * Update the new projects chart
 */
function updateProjectsChart() {
  const container = document.getElementById("newProjectsChart");
  if (!container) {
    console.log("New projects chart container not found");
    return;
  }
  
  console.log("Updating new projects chart");
  
  try {
    // Get updated data
    const chartData = prepareProjectsChartData();
    const leads = window.allLeads || [];
    
    // If no leads, show no data message
    if (leads.length === 0) {
      if (chartInstances.projectsChart) {
        chartInstances.projectsChart.destroy();
        chartInstances.projectsChart = null;
      }
      container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
      return;
    }
    
    // If chart exists, update it
    if (chartInstances.projectsChart) {
      chartInstances.projectsChart.data = chartData;
      chartInstances.projectsChart.options = getProjectsChartOptions();
      chartInstances.projectsChart.update();
    } else {
      // If no chart exists, create it
      createProjectsChart();
    }
  } catch (error) {
    console.error("Error updating new projects chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error updating chart</div>';
  }
}

/**
 * Prepare data for projects chart
 */
function prepareProjectsChartData() {
  const leads = window.allLeads || [];
  const theme = getThemeColors();
  
  // Month names for x-axis
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  
  // Initialize monthly counts
  const monthlyNewLeadCounts = new Array(12).fill(0);
  const monthlyClosedWonLeadCounts = new Array(12).fill(0);
  
  // Get current year
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Process leads for current year
  leads.forEach((lead) => {
    if (!lead.createdAt) return;
    
    const leadDate = new Date(lead.createdAt);
    
    // Only count leads from current year
    if (leadDate.getFullYear() === currentYear) {
      const monthIndex = leadDate.getMonth();
      monthlyNewLeadCounts[monthIndex]++;
      
      // Check if lead is closed won
      if (lead.status === "closed-won") {
        // Use closedAt date if available, otherwise use creation date
        if (lead.closedAt) {
          const closedDate = new Date(lead.closedAt);
          if (closedDate.getFullYear() === currentYear) {
            const closedMonthIndex = closedDate.getMonth();
            monthlyClosedWonLeadCounts[closedMonthIndex]++;
          }
        } else {
          monthlyClosedWonLeadCounts[monthIndex]++;
        }
      }
    }
  });
  
  console.log("Projects chart data:", {
    new: monthlyNewLeadCounts,
    won: monthlyClosedWonLeadCounts
  });
  
  // Return formatted chart data
  return {
    labels: monthNames,
    datasets: [
      {
        label: "New",
        data: monthlyNewLeadCounts,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "#36A2EB",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "#36A2EB",
        pointBorderWidth: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle: "rectRot",
      },
      {
        label: "Won",
        data: monthlyClosedWonLeadCounts,
        backgroundColor: "rgba(40, 167, 69, 0.2)",
        borderColor: "#28A745",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "#28A745",
        pointBorderWidth: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle: "rectRot",
      },
    ],
  };
}

/**
 * Get options for projects chart
 */
function getProjectsChartOptions() {
  const container = document.getElementById("newProjectsChart");
  const theme = getThemeColors();
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    plugins: {
      legend: {
        labels: {
          color: theme.textColor,
          font: {
            size: getResponsiveFontSize(container),
          },
        },
      },
      tooltip: {
        backgroundColor: theme.cardBackground,
        titleColor: theme.textColor,
        bodyColor: theme.textColor,
        borderColor: theme.borderColor,
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.textMuted + "20",
          lineWidth: 0.5,
        },
        ticks: {
          color: theme.textColor,
          font: {
            size: getResponsiveFontSize(container),
          },
        },
      },
      x: {
        grid: {
          color: theme.textMuted + "20",
          lineWidth: 0.5,
        },
        ticks: {
          color: theme.textColor,
          font: {
            size: getResponsiveFontSize(container),
          },
          autoSkip: false,
        },
      },
    },
  };
}

// ========================
// REVENUE CHART FUNCTIONS
// ========================

/**
 * Create the revenue comparison chart
 */
function createRevenueChart() {
  const container = document.getElementById("revenueComparisonChart");
  if (!container) {
    console.log("Revenue chart container not found");
    return;
  }
  
  console.log("Creating revenue comparison chart");
  
  try {
    // Get chart data
    const chartData = prepareRevenueChartData();
    const payments = window.payments || [];
    
    // If no payments, show message and return
    if (payments.length === 0) {
      container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
      return;
    }
    
    // Create or clear canvas
    ensureCanvas(container);
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create the chart
    chartInstances.revenueChart = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: getRevenueChartOptions()
    });
    
    console.log("Revenue chart created successfully");
  } catch (error) {
    console.error("Error creating revenue chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
  }
}

/**
 * Update the revenue comparison chart
 */
function updateRevenueChart() {
  const container = document.getElementById("revenueComparisonChart");
  if (!container) {
    console.log("Revenue chart container not found");
    return;
  }
  
  console.log("Updating revenue comparison chart");
  
  try {
    // Get updated data
    const chartData = prepareRevenueChartData();
    const payments = window.payments || [];
    
    // If no payments, show no data message
    if (payments.length === 0) {
      if (chartInstances.revenueChart) {
        chartInstances.revenueChart.destroy();
        chartInstances.revenueChart = null;
      }
      container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
      return;
    }
    
    // If chart exists, update it
    if (chartInstances.revenueChart) {
      chartInstances.revenueChart.data = chartData;
      chartInstances.revenueChart.options = getRevenueChartOptions();
      chartInstances.revenueChart.update();
    } else {
      // If no chart exists, create it
      createRevenueChart();
    }
  } catch (error) {
    console.error("Error updating revenue chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error updating chart</div>';
  }
}

/**
 * Prepare data for revenue chart
 */
function prepareRevenueChartData() {
  const payments = window.payments || [];
  const theme = getThemeColors();
  
  // Month names for x-axis
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  
  // Get current and previous year
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const previousYear = currentYear - 1;
  
  // Initialize monthly totals
  const currentYearMonthlyTotals = new Array(12).fill(0);
  const previousYearMonthlyTotals = new Array(12).fill(0);
  
  // Process payments
  payments.forEach((payment) => {
    if (!payment.paymentDate) return;
    
    const paymentDate = new Date(payment.paymentDate);
    const paymentYear = paymentDate.getFullYear();
    const paymentMonth = paymentDate.getMonth();
    const paymentAmount = parseFloat(payment.amount) || 0;
    
    // Current year payments
    if (paymentYear === currentYear) {
      currentYearMonthlyTotals[paymentMonth] += paymentAmount;
    }
    
    // Previous year payments
    if (paymentYear === previousYear) {
      previousYearMonthlyTotals[paymentMonth] += paymentAmount;
    }
  });
  
  console.log("Revenue chart data:", {
    currentYear: currentYearMonthlyTotals,
    previousYear: previousYearMonthlyTotals
  });
  
  // Return formatted chart data
  return {
    labels: monthNames,
    datasets: [
      {
        label: `${previousYear}`,
        data: previousYearMonthlyTotals,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "#9966FF",
        borderWidth: 2,
        borderRadius: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.85,
      },
      {
        label: `${currentYear}`,
        data: currentYearMonthlyTotals,
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "#FF9F40",
        borderWidth: 2,
        borderRadius: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.85,
      },
    ],
  };
}

/**
 * Get options for revenue chart
 */
function getRevenueChartOptions() {
  const container = document.getElementById("revenueComparisonChart");
  const theme = getThemeColors();
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    plugins: {
      legend: {
        labels: {
          color: theme.textColor,
          font: {
            size: getResponsiveFontSize(container),
          },
          boxWidth: getResponsiveFontSize(container),
        },
      },
      tooltip: {
        backgroundColor: theme.cardBackground,
        titleColor: theme.textColor,
        bodyColor: theme.textColor,
        borderColor: theme.borderColor,
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `${
              context.dataset.label
            }: $${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.textMuted + "20",
          lineWidth: 0.5,
        },
        ticks: {
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
          color: theme.textColor,
          font: {
            size: getResponsiveFontSize(container),
          },
        },
      },
      x: {
        grid: {
          color: theme.textMuted + "20",
          lineWidth: 0.5,
        },
        ticks: {
          color: theme.textColor,
          font: {
            size: getResponsiveFontSize(container),
          },
          autoSkip: false,
        },
      },
    },
  };
}

// ========================
// HELPER FUNCTIONS
// ========================

/**
 * Ensure canvas element exists in container
 */
function ensureCanvas(container) {
  // Clear container
  container.innerHTML = '';
  
  // Create new canvas
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  
  return canvas;
}

// Export functions for global use
window.initializeCharts = initializeCharts;
window.updateAllCharts = updateAllCharts;
window.destroyAllCharts = destroyAllCharts;