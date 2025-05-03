// Global chart instances
let statusDistributionChartInstance = null;
let newProjectsChartInstance = null;
let revenueComparisonChartInstance = null;

// Initialize the data watcher system
function setupLeadDataWatcher() {
  console.log("Setting up lead data watcher...");
  
  // Create a hidden div that we'll use to trigger chart updates
  let dataWatcherDiv = document.getElementById('data-watcher');
  if (!dataWatcherDiv) {
    dataWatcherDiv = document.createElement('div');
    dataWatcherDiv.id = 'data-watcher';
    dataWatcherDiv.style.display = 'none';
    document.body.appendChild(dataWatcherDiv);
  }
  
  // Update the data watcher with the current lead count and other relevant data
  function updateDataWatcher() {
    console.log("Updating data watcher attributes");
    const leads = window.allLeads || [];
    const payments = window.payments || [];
    
    // Store counts for detection
    dataWatcherDiv.setAttribute('data-lead-count', leads.length);
    dataWatcherDiv.setAttribute('data-payment-count', payments.length);
    dataWatcherDiv.setAttribute('data-timestamp', Date.now());
    
    // Additional tracking for closed-won leads
    const closedWonCount = leads.filter(lead => lead.status === "closed-won").length;
    dataWatcherDiv.setAttribute('data-closed-won-count', closedWonCount);
  }
  
  // Add a MutationObserver to watch for changes in tracked data
  const observer = new MutationObserver(function(mutations) {
    console.log("Data watcher detected change, rebuilding charts");
    forceRebuildAllCharts();
  });
  
  // Start observing the data watcher
  observer.observe(dataWatcherDiv, { 
    attributes: true, 
    attributeFilter: ['data-lead-count', 'data-payment-count', 'data-closed-won-count', 'data-timestamp'] 
  });
  
  // Make the update function available globally
  window.updateDataWatcher = updateDataWatcher;
  
  // Initial update
  updateDataWatcher();
  
  console.log("Lead data watcher setup complete");
}

// Initialize the charts functionality
function initializeCharts() {
  console.log("Initializing chart system...");
  
  // Set up the data watcher first
  setupLeadDataWatcher();
  
  // Force a rebuild of all charts
  forceRebuildAllCharts();
  
  // Make updateAllCharts available globally for status changes
  window.updateAllCharts = forceRebuildAllCharts;
  
  // Add event listeners for various data changes
  setupChartEventListeners();
  
  // Add theme change listener
  setupThemeChangeListener();
  
  // Add window resize listener
  window.removeEventListener("resize", handleResize);
  window.addEventListener("resize", handleResize);
  
  console.log("Chart system initialized successfully");
}

// Force a complete rebuild of all charts
function forceRebuildAllCharts() {
  console.log("Force rebuilding all charts from scratch");
  
  // Destroy any existing charts
  destroyAllCharts();
  
  try {
    // Create fresh chart instances
    createStatusChart();
    createProjectsChart();
    createRevenueChart();
    console.log("All charts rebuilt successfully");
  } catch (error) {
    console.error("Error rebuilding charts:", error);
  }
}

// Destroy all chart instances for clean slate
function destroyAllCharts() {
  console.log("Destroying all chart instances");
  
  // Destroy status chart
  if (statusDistributionChartInstance) {
    try {
      statusDistributionChartInstance.destroy();
      statusDistributionChartInstance = null;
    } catch (error) {
      console.error("Error destroying status chart:", error);
    }
  }
  
  // Destroy projects chart
  if (newProjectsChartInstance) {
    try {
      newProjectsChartInstance.destroy();
      newProjectsChartInstance = null;
    } catch (error) {
      console.error("Error destroying projects chart:", error);
    }
  }
  
  // Destroy revenue chart
  if (revenueComparisonChartInstance) {
    try {
      revenueComparisonChartInstance.destroy();
      revenueComparisonChartInstance = null;
    } catch (error) {
      console.error("Error destroying revenue chart:", error);
    }
  }
}

// Set up event listeners for chart data changes
function setupChartEventListeners() {
  // Remove any existing listeners first to prevent duplicates
  window.removeEventListener("leadSaved", handleDataChange);
  window.removeEventListener("leadDeleted", handleDataChange);
  window.removeEventListener("paymentsUpdated", handleDataChange);
  
  // Add unified handler for all data change events
  window.addEventListener("leadSaved", handleDataChange);
  window.addEventListener("leadDeleted", handleDataChange);
  window.addEventListener("paymentsUpdated", handleDataChange);
  
  console.log("Chart event listeners set up");
}

// Unified handler for all data changes
function handleDataChange(event) {
  console.log(`Data change event detected: ${event.type}`);
  
  // Update the data watcher, which will trigger chart rebuilds
  if (typeof window.updateDataWatcher === 'function') {
    window.updateDataWatcher();
  } else {
    console.error("updateDataWatcher function not found, forcing chart rebuild directly");
    forceRebuildAllCharts();
  }
}

// Set up theme change listener
function setupThemeChangeListener() {
  // Create observer for theme changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === "data-theme") {
        console.log("Theme changed, rebuilding charts");
        forceRebuildAllCharts();
      }
    });
  });
  
  // Start observing theme changes
  observer.observe(document.documentElement, { attributes: true });
  
  console.log("Theme change listener set up");
}

// Handle window resize events (debounced)
let resizeTimeout;
function handleResize() {
  // Clear previous timeout
  clearTimeout(resizeTimeout);
  
  // Set new timeout to prevent excessive updates
  resizeTimeout = setTimeout(function() {
    console.log("Window resized, rebuilding charts");
    forceRebuildAllCharts();
  }, 250); // 250ms debounce
}

// Function to get responsive font size based on container width
function getResponsiveFontSize(container) {
  if (!container) return 12; // Default fallback size
  
  const width = container.clientWidth;
  if (width < 480) return 10; // Small screens
  if (width < 768) return 12; // Medium screens
  return 14; // Large screens
}

// Get theme-aware colors from CSS variables
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


// CHART 1: Project Status Distribution (Donut Chart)
function createStatusChart() {
  const container = document.getElementById("statusDistributionChart");
  if (!container) {
    console.log("Status chart container not found");
    return;
  }

  console.log("Creating status distribution chart");

  try {
    // Access allLeads from the global context
    const leads = window.allLeads || [];
    
    // If no leads, show no data message
    if (!leads || leads.length === 0) {
      container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
      return;
    }

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

    const totalProjects = leads.length; // Calculate total projects
    const theme = getThemeColors();

    // Clear the container and create a new canvas
    container.innerHTML = "";
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    
    // Prepare data for chart with high-contrast, accessible colors
    const data = {
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
            theme.colors.blue.bg,
            theme.colors.orange.bg,
            theme.colors.purple.bg,
            theme.colors.green.bg,
            theme.colors.red.bg,
          ],
          borderWidth: 2,
          borderColor: [
            theme.colors.blue.border,
            theme.colors.orange.border,
            theme.colors.purple.border,
            theme.colors.green.border,
            theme.colors.red.border,
          ],
        },
      ],
    };

    // Custom plugin for center text
    const centerTextPlugin = {
      id: "centerText",
      beforeDraw: function (chart) {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        const centerX = width / 2;
        const centerY = height / 2; // This is the vertical center of the canvas

        ctx.restore();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        // Define the text lines
        const headerText = "Total";
        const totalText = totalProjects.toString();

        // Use the font sizes you've already adjusted
        const baseFontSize = Math.min(width, height) / 20;
        const headerFontSize = baseFontSize * 1;
        const totalFontSize = baseFontSize * 2.4;

        // Adjust the vertical offset for the text block from the center
        const verticalOffset = -25; // Adjusted vertical offset

        // Calculate vertical positions for the two lines of text
        // Position the header and total relative to the adjusted center
        const headerY = centerY + verticalOffset - totalFontSize * 0.45; // Adjusted header Y offset multiplier
        const totalY = centerY + verticalOffset + totalFontSize * 0.55; // Adjusted total Y offset multiplier

        // Draw header text
        ctx.font = `bold ${headerFontSize}px sans-serif`;
        ctx.fillStyle = theme.textMuted; // Set color for header to --text-muted
        ctx.fillText(headerText, centerX, headerY);

        // Draw total count text
        ctx.font = `${totalFontSize}px sans-serif`;
        ctx.fillStyle = theme.textColor; // Set color for total count back to --text-color
        ctx.fillText(totalText, centerX, totalY);

        ctx.save();
      },
    };

    // Chart options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%", // Ensure you have a cutout for the center
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

    // Create the chart
    statusDistributionChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: data,
      options: options,
      plugins: [centerTextPlugin], // Add the custom plugin here
    });
    
    console.log("Status chart created successfully");
  } catch (error) {
    console.error("Error creating status chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
  }
}



// CHART 2: New Projects vs Closed Won Projects Over Time (Line Chart)
function createProjectsChart() {
  const container = document.getElementById("newProjectsChart");
  if (!container) {
    console.log("New projects chart container not found");
    return;
  }

  console.log("Creating new projects chart");

  try {
    // Access allLeads from the global context
    const leads = window.allLeads || [];
    
    // If no leads, show no data message
    if (!leads || leads.length === 0) {
      container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
      return;
    }

    // Group leads by month
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Initialize monthly counts for the entire year
    const monthlyNewLeadCounts = new Array(12).fill(0);
    const monthlyClosedWonLeadCounts = new Array(12).fill(0);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Process leads for the current year
    leads.forEach((lead) => {
      if (!lead.createdAt) return;

      const leadDate = new Date(lead.createdAt);

      // Only count leads from the current year
      if (leadDate.getFullYear() === currentYear) {
        const monthIndex = leadDate.getMonth();
        monthlyNewLeadCounts[monthIndex]++;

        // Check if lead is closed won and use closedAt date for tracking closure month
        if (lead.status === "closed-won") {
          // If we have a specific closedAt date, use that to determine the month
          if (lead.closedAt) {
            const closedDate = new Date(lead.closedAt);
            // Only count if it was closed in the current year
            if (closedDate.getFullYear() === currentYear) {
              const closedMonthIndex = closedDate.getMonth();
              monthlyClosedWonLeadCounts[closedMonthIndex]++;
            }
          } else {
            // Fallback: If closedAt is not available, use creation month as before
            monthlyClosedWonLeadCounts[monthIndex]++;
          }
        }
      }
    });

    // Debug logging
    console.log("New Leads Counts:", monthlyNewLeadCounts);
    console.log("Closed Won Leads Counts:", monthlyClosedWonLeadCounts);

    // Clear the container and create a new canvas
    container.innerHTML = "";
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    
    // Get theme colors
    const theme = getThemeColors();

    // Create the chart
    newProjectsChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: monthNames,
        datasets: [
          {
            label: "New",
            data: monthlyNewLeadCounts,
            backgroundColor: "rgba(54, 162, 235, 0.2)",   // Blue
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
            backgroundColor: "rgba(40, 167, 69, 0.2)",    // Green
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
      },
      options: {
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
      },
    });
    
    console.log("New projects chart created successfully");
  } catch (error) {
    console.error("Error creating new projects chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
  }
}

// CHART 3: Revenue by Month Comparison (Bar Chart)
function createRevenueChart() {
  const container = document.getElementById("revenueComparisonChart");
  if (!container) {
    console.log("Revenue chart container not found");
    return;
  }

  console.log("Creating revenue chart");

  try {
    // Access payments from the global context
    const payments = window.payments || [];
    
    // If no payments, show no data message
    if (!payments || payments.length === 0) {
      container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
      return;
    }

    // Group payments by month for current and previous year
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const previousYear = currentYear - 1;

    // Initialize monthly totals
    const currentYearMonthlyTotals = new Array(12).fill(0);
    const previousYearMonthlyTotals = new Array(12).fill(0);

    // Process payments for current and previous year
    payments.forEach((payment) => {
      if (!payment.paymentDate) return;

      const paymentDate = new Date(payment.paymentDate);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth();
      const paymentAmount = parseFloat(payment.amount) || 0;

      // Process current year payments
      if (paymentYear === currentYear) {
        currentYearMonthlyTotals[paymentMonth] += paymentAmount;
      }

      // Process previous year payments
      if (paymentYear === previousYear) {
        previousYearMonthlyTotals[paymentMonth] += paymentAmount;
      }
    });

    // Clear the container and create a new canvas
    container.innerHTML = "";
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    
    // Get theme colors
    const theme = getThemeColors();

    // Create the chart
    revenueComparisonChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: monthNames,
        datasets: [
          {
            label: `${previousYear}`,
            data: previousYearMonthlyTotals,
            backgroundColor: "rgba(153, 102, 255, 0.6)", // Blue
            borderColor: "#9966FF",
            borderWidth: 2,
            borderRadius: 3,
            barPercentage: 0.7,
            categoryPercentage: 0.85,
          },
          {
            label: `${currentYear}`,
            data: currentYearMonthlyTotals,
            backgroundColor: "rgba(255, 159, 64, 0.6)", // Orange
            borderColor: "#FF9F40",
            borderWidth: 2,
            borderRadius: 3,
            barPercentage: 0.7,
            categoryPercentage: 0.85,
          },
        ],
      },
      options: {
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
              color:
                theme.textMuted + "20", // Very subtle grid lines
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
              color:
                theme.textMuted + "20", // Very subtle grid lines
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
      },
    });
    
    console.log("Revenue chart created successfully");
  } catch (error) {
    console.error("Error creating revenue chart:", error);
    container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
  }
}

// Make functions globally accessible
window.initializeCharts = initializeCharts;
window.updateAllCharts = forceRebuildAllCharts;
window.destroyAllCharts = destroyAllCharts;