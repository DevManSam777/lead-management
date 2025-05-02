// // Initialize the charts functionality
// function initializeCharts() {
//     console.log("Initializing charts");
  
//     // Initial chart creation
//     updateAllCharts();
  
//     // Set up event listeners for chart update
//     window.addEventListener("leadSaved", updateAllCharts);
//     window.addEventListener("leadDeleted", updateAllCharts);
//     window.addEventListener("paymentsUpdated", updateAllCharts);
  
//     // Also listen for theme changes
//     const observer = new MutationObserver(function (mutations) {
//       mutations.forEach(function (mutation) {
//         if (mutation.attributeName === "data-theme") {
//           updateAllCharts();
//         }
//       });
//     });
  
//     observer.observe(document.documentElement, { attributes: true });
  
//     // Add window resize listener for responsive charts
//     window.addEventListener("resize", updateAllCharts);
//   }
  
//   // Update all charts with current data
//   function updateAllCharts() {
//     console.log("Updating charts");
  
//     // Call the update functions
//     updateProjectStatusChart();
//     updateNewProjectsChart();
//     updateRevenueComparisonChart();
//   }
  
//   // Function to get responsive font size based on container width
//   function getResponsiveFontSize(container) {
//     const width = container.clientWidth;
//     if (width < 480) return 10; // Small screens
//     if (width < 768) return 12; // Medium screens
//     return 14; // Large screens
//   }
  
//   // CHART 1: Project Status Distribution (Donut Chart)
//   function updateProjectStatusChart() {
//       const container = document.getElementById("statusDistributionChart");
//       if (!container) {
//         console.log("Status chart container not found");
//         return;
//       }
  
//       console.log("Creating status chart");
  
//       // Clear previous chart
//       container.innerHTML = "";
  
//       // Create a canvas
//       const canvas = document.createElement("canvas");
//       container.appendChild(canvas);
  
//       const ctx = canvas.getContext("2d");
  
//       try {
//         // Group leads by status
//         const statusCounts = {
//           new: 0,
//           contacted: 0,
//           "in-progress": 0,
//           "closed-won": 0,
//           "closed-lost": 0,
//         };
  
//         // Access allLeads from the global context
//         const leads = window.allLeads || [];
  
//         // Count leads in each status
//         leads.forEach((lead) => {
//           const status = lead.status || "new";
//           statusCounts[status]++;
//         });
  
//         const totalProjects = leads.length; // Calculate total projects
  
//         // Prepare data for chart with high-contrast, accessible colors
//         const data = {
//           labels: ["New", "Contacted", "In Progress", "Won", "Lost"],
//           datasets: [
//             {
//               data: [
//                 statusCounts["new"],
//                 statusCounts["contacted"],
//                 statusCounts["in-progress"],
//                 statusCounts["closed-won"],
//                 statusCounts["closed-lost"],
//               ],
//               backgroundColor: [
//                 "rgba(64, 192, 255, 0.7)",  // New - Bright blue
//                 "rgba(255, 159, 64, 0.7)",  // Contacted - Orange
//                 "rgba(153, 102, 255, 0.7)", // In Progress - Purple
//                 "rgba(40, 167, 69, 0.7)",   // Won - Green (success)
//                 "rgba(255, 99, 132, 0.7)",  // Lost - Red
//               ],
//               borderWidth: 2,
//               borderColor: ["#40C0FF", "#FF9F40", "#9966FF", "#28A745", "#FF6384"],
//             },
//           ],
//         };
  
//         // Custom plugin for center text
//         const centerTextPlugin = {
//           id: 'centerText',
//           beforeDraw: function(chart) {
//             const ctx = chart.ctx;
//             const width = chart.width;
//             const height = chart.height;
//             const centerX = width / 2;
//             const centerY = height / 2; // This is the vertical center of the canvas
  
//             ctx.restore();
//             ctx.textBaseline = "middle";
//             ctx.textAlign = "center";
  
//             // Get text colors from CSS variables
//             const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
//             const textMutedColor = getComputedStyle(document.documentElement).getPropertyValue("--text-muted");
  
  
//             // Define the text lines
//             const headerText = "Total";
//             const totalText = totalProjects.toString();
  
//             // Use the font sizes you've already adjusted
//             const baseFontSize = Math.min(width, height) / 20;
//             const headerFontSize = baseFontSize * 1;
//             const totalFontSize = baseFontSize * 2.4;
  
//             // Adjust the vertical offset for the text block from the center
//             // I'm adding a small positive offset to try and move it down slightly from the last "worse" position
//             const verticalOffset = -25; // Adjusted vertical offset
  
  
//             // Calculate vertical positions for the two lines of text
//             // Position the header and total relative to the adjusted center
//             // Adjust these multipliers if the spacing between Total and the number needs tweaking
//             const headerY = centerY + verticalOffset - (totalFontSize * .45); // Adjusted header Y offset multiplier
//             const totalY = centerY + verticalOffset + (totalFontSize * .55); // Adjusted total Y offset multiplier
  
  
//             // Draw header text
//             ctx.font = `bold ${headerFontSize}px sans-serif`;
//             ctx.fillStyle = textMutedColor; // Set color for header to --text-muted
//             ctx.fillText(headerText, centerX, headerY);
  
//             // Draw total count text
//             ctx.font = `${totalFontSize}px sans-serif`;
//             ctx.fillStyle = textColor; // Set color for total count back to --text-color
//             ctx.fillText(totalText, centerX, totalY);
  
//             ctx.save();
//           }
//         };
  
//         // Create the chart only if there are leads
//         if (leads.length > 0) {
//           const chart = new Chart(ctx, {
//             type: "doughnut",
//             data: data,
//             options: {
//               responsive: true,
//               maintainAspectRatio: false,
//               cutout: "65%", // Ensure you have a cutout for the center
//               layout: {
//                 padding: 10,
//               },
//               plugins: {
//                 legend: {
//                   position: "bottom",
//                   labels: {
//                     color: getComputedStyle(
//                       document.documentElement
//                     ).getPropertyValue("--text-color"),
//                     font: {
//                       size: getResponsiveFontSize(container),
//                     },
//                     boxWidth: getResponsiveFontSize(container),
//                   },
//                 },
//                 tooltip: {
//                   backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--card-background"),
//                   titleColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
//                   bodyColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
//                   borderColor: getComputedStyle(document.documentElement).getPropertyValue("--border-color"),
//                   borderWidth: 1,
//                   callbacks: {
//                     title: function (tooltipItems) {
//                       return tooltipItems[0].label;
//                     },
//                     label: function (context) {
//                       const value = context.raw;
//                       const total = context.dataset.data.reduce(
//                         (acc, val) => acc + val,
//                         0
//                       );
//                       const percentage = Math.round((value / total) * 100) + "%";
//                       return `${value} projects (${percentage})`;
//                     },
//                   },
//                 },
//               },
//             },
//             plugins: [centerTextPlugin] // Add the custom plugin here
//           });
//           console.log("Status chart created successfully");
//         } else {
//           container.innerHTML =
//             '<div class="chart-no-data">No projects to display</div>';
//         }
//       } catch (error) {
//         console.error("Error creating status chart:", error);
//         container.innerHTML =
//           '<div class="chart-no-data">Error creating chart</div>';
//       }
//     }
  
//   // CHART 2: New Projects vs Closed Won Projects Over Time (Line Chart)
//   function updateNewProjectsChart() {
//     const container = document.getElementById("newProjectsChart");
//     if (!container) {
//       console.log("New projects chart container not found");
//       return;
//     }
  
//     console.log("Creating new projects chart");
  
//     // Clear previous chart
//     container.innerHTML = "";
  
//     // Create a canvas
//     const canvas = document.createElement("canvas");
//     container.appendChild(canvas);
  
//     const ctx = canvas.getContext("2d");
  
//     try {
//       // Access allLeads from the global context
//       const leads = window.allLeads || [];
  
//       // Group leads by month
//       const monthNames = [
//         "Jan",
//         "Feb",
//         "Mar",
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec",
//       ];
  
//       // Initialize monthly counts for the entire year
//       const monthlyNewLeadCounts = new Array(12).fill(0);
//       const monthlyClosedWonLeadCounts = new Array(12).fill(0);
//       const currentDate = new Date();
//       const currentYear = currentDate.getFullYear();
  
//       // Process leads for the current year
//       leads.forEach((lead) => {
//         if (!lead.createdAt) return;
  
//         const leadDate = new Date(lead.createdAt);
  
//         // Only count leads from the current year
//         if (leadDate.getFullYear() === currentYear) {
//           const monthIndex = leadDate.getMonth();
//           monthlyNewLeadCounts[monthIndex]++;
  
//           // Check if lead is closed won
//           if (lead.status === "closed-won") {
//             // Use the month of lead creation as the closed month
//             monthlyClosedWonLeadCounts[monthIndex]++;
//           }
//         }
//       });
  
//       // Debug logging
//       console.log("New Leads Counts:", monthlyNewLeadCounts);
//       console.log("Closed Won Leads Counts:", monthlyClosedWonLeadCounts);
  
//       // Create the chart only if there are leads
//       if (leads.length > 0) {
//         const chart = new Chart(ctx, {
//           type: "line",
//           data: {
//             labels: monthNames,
//             datasets: [
//               {
//                 label: "New",
//                 data: monthlyNewLeadCounts,
//                 backgroundColor: "rgba(54, 162, 235, 0.2)",   // Blue
//                 borderColor: "#36A2EB",
//                 tension: 0.4,
//                 fill: true,
//                 borderWidth: 2,
//                 pointBackgroundColor: "#36A2EB",
//                 pointBorderWidth: 0,
//                 pointRadius: 4,
//                 pointHoverRadius: 6,
//                 pointStyle: "rectRot",
//               },
//               {
//                 label: "Won",
//                 data: monthlyClosedWonLeadCounts,
//                 backgroundColor: "rgba(40, 167, 69, 0.2)",    // Green
//                 borderColor: "#28A745",
//                 tension: 0.4,
//                 fill: true,
//                 borderWidth: 2,
//                 pointBackgroundColor: "#28A745",
//                 pointBorderWidth: 0,
//                 pointRadius: 4,
//                 pointHoverRadius: 6,
//                 pointStyle: "rectRot",
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             layout: {
//               padding: 10,
//             },
//             plugins: {
//               legend: {
//                 labels: {
//                   color: getComputedStyle(
//                     document.documentElement
//                   ).getPropertyValue("--text-color"),
//                   font: {
//                     size: getResponsiveFontSize(container),
//                   },
//                 },
//               },
//               tooltip: {
//                 backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--card-background"),
//                 titleColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
//                 bodyColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
//                 borderColor: getComputedStyle(document.documentElement).getPropertyValue("--border-color"),
//                 borderWidth: 1,
//               },
//             },
//             scales: {
//               y: {
//                 beginAtZero: true,
//                 grid: {
//                   color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20",
//                   lineWidth: 0.5,
//                 },
//                 ticks: {
//                   color: getComputedStyle(
//                     document.documentElement
//                   ).getPropertyValue("--text-color"),
//                   font: {
//                     size: getResponsiveFontSize(container),
//                   },
//                 },
//               },
//               x: {
//                 grid: {
//                   color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20",
//                   lineWidth: 0.5,
//                 },
//                 ticks: {
//                   color: getComputedStyle(
//                     document.documentElement
//                   ).getPropertyValue("--text-color"),
//                   font: {
//                     size: getResponsiveFontSize(container),
//                   },
//                   autoSkip: false,
//                 },
//               },
//             },
//           },
//         });
//         console.log("New projects chart created successfully");
//       } else {
//         container.innerHTML =
//           '<div class="chart-no-data">No projects to display</div>';
//       }
//     } catch (error) {
//       console.error("Error creating new projects chart:", error);
//       container.innerHTML =
//         '<div class="chart-no-data">Error creating chart</div>';
//     }
//   }
  
//   // CHART 3: Revenue by Month Comparison (Bar Chart)
//   function updateRevenueComparisonChart() {
//     const container = document.getElementById("revenueComparisonChart");
//     if (!container) {
//       console.log("Revenue chart container not found");
//       return;
//     }
  
//     console.log("Creating revenue chart");
  
//     // Clear previous chart
//     container.innerHTML = "";
  
//     // Create a canvas
//     const canvas = document.createElement("canvas");
//     container.appendChild(canvas);
  
//     const ctx = canvas.getContext("2d");
  
//     try {
//       // Access payments from the global context
//       const payments = window.payments || [];
  
//       // Group payments by month for current and previous year
//       const monthNames = [
//         "Jan",
//         "Feb",
//         "Mar",
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec",
//       ];
  
//       const currentDate = new Date();
//       const currentYear = currentDate.getFullYear();
//       const previousYear = currentYear - 1;
  
//       // Initialize monthly totals
//       const currentYearMonthlyTotals = new Array(12).fill(0);
//       const previousYearMonthlyTotals = new Array(12).fill(0);
  
//       // Process payments for current and previous year
//       payments.forEach((payment) => {
//         if (!payment.paymentDate) return;
  
//         const paymentDate = new Date(payment.paymentDate);
//         const paymentYear = paymentDate.getFullYear();
//         const paymentMonth = paymentDate.getMonth();
//         const paymentAmount = parseFloat(payment.amount) || 0;
  
//         // Process current year payments
//         if (paymentYear === currentYear) {
//           currentYearMonthlyTotals[paymentMonth] += paymentAmount;
//         }
  
//         // Process previous year payments
//         if (paymentYear === previousYear) {
//           previousYearMonthlyTotals[paymentMonth] += paymentAmount;
//         }
//       });
  
//       // Create the chart only if there are payments
//       if (payments.length > 0) {
//         const chart = new Chart(ctx, {
//           type: "bar",
//           data: {
//             labels: monthNames,
//             datasets: [
//               {
//                 label: `${previousYear}`,
//                 data: previousYearMonthlyTotals,
//                 // backgroundColor: "rgba(255, 159, 64, 0.6)",   // Orange
//                 // borderColor: "#FF9F40",
//                 backgroundColor: "rgba(153, 102, 255, 0.6)",   // Blue
//                 borderColor: "#9966FF",
//                 borderWidth: 2,
//                 borderRadius: 3,
//                 barPercentage: 0.7,
//                 categoryPercentage: 0.85,
//               },
//               {
//                 label: `${currentYear}`,
//                 data: currentYearMonthlyTotals,
//                 // backgroundColor: "rgba(153, 102, 255, 0.6)",   // Blue
//                 // borderColor: "#9966FF",
//                 backgroundColor: "rgba(255, 159, 64, 0.6)",   // Orange
//                 borderColor: "#FF9F40",
//                 borderWidth: 2,
//                 borderRadius: 3,
//                 barPercentage: 0.7,
//                 categoryPercentage: 0.85,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             layout: {
//               padding: 10,
//             },
//             plugins: {
//               legend: {
//                 labels: {
//                   color: getComputedStyle(
//                     document.documentElement
//                   ).getPropertyValue("--text-color"),
//                   font: {
//                     size: getResponsiveFontSize(container),
//                   },
//                   boxWidth: getResponsiveFontSize(container),
//                 },
//               },
//               tooltip: {
//                 backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--card-background"),
//                 titleColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
//                 bodyColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
//                 borderColor: getComputedStyle(document.documentElement).getPropertyValue("--border-color"),
//                 borderWidth: 1,
//                 callbacks: {
//                   label: function(context) {
//                     return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
//                   }
//                 }
//               },
//             },
//             scales: {
//               y: {
//                 beginAtZero: true,
//                 grid: {
//                   color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20", // Very subtle grid lines
//                   lineWidth: 0.5,
//                 },
//                 ticks: {
//                   callback: function (value) {
//                     return "$" + value.toLocaleString();
//                   },
//                   color: getComputedStyle(
//                     document.documentElement
//                   ).getPropertyValue("--text-color"),
//                   font: {
//                     size: getResponsiveFontSize(container),
//                   },
//                 },
//               },
//               x: {
//                 grid: {
//                   color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20", // Very subtle grid lines
//                   lineWidth: 0.5,
//                 },
//                 ticks: {
//                   color: getComputedStyle(
//                     document.documentElement
//                   ).getPropertyValue("--text-color"),
//                   font: {
//                     size: getResponsiveFontSize(container),
//                   },
//                   autoSkip: false,
//                 },
//               },
//             },
//           },
//         });
//         console.log("Revenue chart created successfully");
//       } else {
//         container.innerHTML =
//           '<div class="chart-no-data">No revenue data to display</div>';
//       }
//     } catch (error) {
//       console.error("Error creating revenue chart:", error);
//       container.innerHTML =
//         '<div class="chart-no-data">Error creating chart</div>';
//     }
//   }
  
//   // Make the initialization function globally accessible
//   window.initializeCharts = initializeCharts;

// Declare chart instances in a scope accessible to update functions
let projectStatusChartInstance = null;
let newProjectsChartInstance = null;
let revenueComparisonChartInstance = null;

// Initialize the charts functionality
function initializeCharts() {
  console.log("Initializing charts");

  // Initial chart creation
  updateAllCharts();

  // Set up event listeners for chart update
  // Use custom events for data changes
  window.addEventListener("leadSaved", updateAllCharts);
  window.addEventListener("leadDeleted", updateAllCharts);
  window.addEventListener("paymentsUpdated", updateAllCharts);

  // Also listen for theme changes using a MutationObserver
  // This is already correctly implemented to trigger updates
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === "data-theme") {
        // Destroy existing charts before updating to apply new theme styles correctly
        destroyAllCharts();
        updateAllCharts();
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });

  // Add window resize listener for responsive charts
  // Destroy and recreate charts on resize to handle responsiveness correctly
  window.addEventListener("resize", debounce(function() {
    destroyAllCharts();
    updateAllCharts();
  }, 250)); // Debounce the resize event for performance
}

// Destroy all chart instances
function destroyAllCharts() {
    console.log("Destroying charts");
    if (projectStatusChartInstance) {
        projectStatusChartInstance.destroy();
        projectStatusChartInstance = null;
    }
    if (newProjectsChartInstance) {
        newProjectsChartInstance.destroy();
        newProjectsChartInstance = null;
    }
    if (revenueComparisonChartInstance) {
        revenueComparisonChartInstance.destroy();
        revenueComparisonChartInstance = null;
    }
}


// Update all charts with current data
function updateAllCharts() {
  console.log("Updating charts");

  // Call the update functions
  updateProjectStatusChart();
  updateNewProjectsChart();
  updateRevenueComparisonChart();
}

// Simple debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}


// Function to get responsive font size based on container width
function getResponsiveFontSize(container) {
  const width = container.clientWidth;
  if (width < 480) return 10; // Small screens
  if (width < 768) return 12; // Medium screens
  return 14; // Large screens
}

// CHART 1: Project Status Distribution (Donut Chart)
function updateProjectStatusChart() {
    const container = document.getElementById("statusDistributionChart");
    if (!container) {
      console.log("Status chart container not found");
      projectStatusChartInstance = null; // Ensure instance is null if container disappears
      return;
    }

    const canvas = container.querySelector("canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    // If the chart already exists, update its data and options
    if (projectStatusChartInstance && ctx) {
        console.log("Updating status chart");

        // Group leads by status
        const statusCounts = {
          new: 0,
          contacted: 0,
          "in-progress": 0,
          "closed-won": 0,
          "closed-lost": 0,
        };

        // Access allLeads from the global context
        const leads = window.allLeads || [];

        // Count leads in each status
        leads.forEach((lead) => {
          const status = lead.status || "new";
          statusCounts[status]++;
        });

        const totalProjects = leads.length; // Calculate total projects


        // Update chart data
        projectStatusChartInstance.data.datasets[0].data = [
            statusCounts["new"],
            statusCounts["contacted"],
            statusCounts["in-progress"],
            statusCounts["closed-won"],
            statusCounts["closed-lost"],
        ];

        // Update options that might depend on theme or size
        projectStatusChartInstance.options.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
        projectStatusChartInstance.options.plugins.legend.labels.font.size = getResponsiveFontSize(container);
        projectStatusChartInstance.options.plugins.legend.labels.boxWidth = getResponsiveFontSize(container);
        projectStatusChartInstance.options.plugins.tooltip.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--card-background");
        projectStatusChartInstance.options.plugins.tooltip.titleColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
        projectStatusChartInstance.options.plugins.tooltip.bodyColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
        projectStatusChartInstance.options.plugins.tooltip.borderColor = getComputedStyle(document.documentElement).getPropertyValue("--border-color");


        // Need to update the center text plugin's access to totalProjects and colors
        // Re-adding the plugin or ensuring it accesses the latest totalProjects and colors is key.
        // A simpler approach is to just re-create the chart on theme/resize change (handled in initializeCharts)
        // For data updates, the center text plugin needs access to the current totalProjects.
        // We can pass this via options or ensure the plugin function has access to the latest data.
        // Modifying the plugin to access the chart's data directly is the most robust approach for data updates.
        // Let's ensure the plugin definition below correctly references the chart instance's data.

        // Call update to re-render the chart
        projectStatusChartInstance.update();

        // Handle no data case after updating
         if (leads.length === 0) {
             projectStatusChartInstance.destroy();
             projectStatusChartInstance = null;
             container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
         }


    } else if (ctx) { // If chart does not exist, create a new one
      console.log("Creating status chart");

       // Access allLeads from the global context
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

       const totalProjects = leads.length; // Calculate total projects


      try {
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
                "rgba(64, 192, 255, 0.7)",  // New - Bright blue
                "rgba(255, 159, 64, 0.7)",  // Contacted - Orange
                "rgba(153, 102, 255, 0.7)", // In Progress - Purple
                "rgba(40, 167, 69, 0.7)",   // Won - Green (success)
                "rgba(255, 99, 132, 0.7)",  // Lost - Red
              ],
              borderWidth: 2,
              borderColor: ["#40C0FF", "#FF9F40", "#9966FF", "#28A745", "#FF6384"],
            },
          ],
        };

        // Custom plugin for center text
        const centerTextPlugin = {
          id: 'centerText',
          beforeDraw: function(chart) {
            const ctx = chart.ctx;
            const width = chart.width;
            const height = chart.height;
            const centerX = width / 2;
            const centerY = height / 2;

            ctx.restore();
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            // Get text colors from CSS variables
            const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
            const textMutedColor = getComputedStyle(document.documentElement).getPropertyValue("--text-muted");

            // Get the total count from the chart's data
            const currentTotalProjects = chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);

            // Define the text lines
            const headerText = "Total";
            const totalText = currentTotalProjects.toString();

            // Use the font sizes you've already adjusted
            const baseFontSize = Math.min(width, height) / 20;
            const headerFontSize = baseFontSize * 1;
            const totalFontSize = baseFontSize * 2.4;

            // Adjust the vertical offset for the text block from the center
            const verticalOffset = -25;

            // Calculate vertical positions for the two lines of text
            const headerY = centerY + verticalOffset - (totalFontSize * .45);
            const totalY = centerY + verticalOffset + (totalFontSize * .55);

            // Draw header text
            ctx.font = `bold ${headerFontSize}px sans-serif`;
            ctx.fillStyle = textMutedColor;
            ctx.fillText(headerText, centerX, headerY);

            // Draw total count text
            ctx.font = `${totalFontSize}px sans-serif`;
            ctx.fillStyle = textColor;
            ctx.fillText(totalText, centerX, totalY);

            ctx.save();
          }
        };


        // Create the chart only if there are leads
        if (leads.length > 0) {
            // Clear previous chart content before creating a new one
            container.innerHTML = "";
            const newCanvas = document.createElement("canvas");
            container.appendChild(newCanvas);
            const newCtx = newCanvas.getContext("2d");

          projectStatusChartInstance = new Chart(newCtx, {
            type: "doughnut",
            data: data,
            options: {
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
                    color: getComputedStyle(
                      document.documentElement
                    ).getPropertyValue("--text-color"),
                    font: {
                      size: getResponsiveFontSize(container),
                    },
                    boxWidth: getResponsiveFontSize(container),
                  },
                },
                tooltip: {
                  backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--card-background"),
                  titleColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
                  bodyColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
                  borderColor: getComputedStyle(document.documentElement).getPropertyValue("--border-color"),
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
                      const percentage = total > 0 ? Math.round((value / total) * 100) + "%" : "0%";
                      return `${value} projects (${percentage})`;
                    },
                  },
                },
                centerText: {} // Add an empty object for the plugin options if needed
              },
            },
            plugins: [centerTextPlugin] // Add the custom plugin here
          });
          console.log("Status chart created successfully");
        } else {
          container.innerHTML =
            '<div class="chart-no-data">No projects to display</div>';
            projectStatusChartInstance = null; // Ensure instance is null if no data
        }
      } catch (error) {
        console.error("Error creating status chart:", error);
        container.innerHTML =
          '<div class="chart-no-data">Error creating chart</div>';
          projectStatusChartInstance = null; // Ensure instance is null on error
      }
    } else if (!canvas && !projectStatusChartInstance) {
         // If no canvas and no chart instance, it means it was likely cleared due to no data previously.
         // Attempt to create the chart if there is data now.
        const leads = window.allLeads || [];
         if (leads.length > 0) {
             // Clear previous "no data" message
             container.innerHTML = "";
             // Re-run the function to create the chart
             updateProjectStatusChart();
         }
    }
  }

// CHART 2: New Projects vs Closed Won Projects Over Time (Line Chart)
function updateNewProjectsChart() {
  const container = document.getElementById("newProjectsChart");
  if (!container) {
    console.log("New projects chart container not found");
    newProjectsChartInstance = null; // Ensure instance is null if container disappears
    return;
  }

  const canvas = container.querySelector("canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

   // If the chart already exists, update its data and options
   if (newProjectsChartInstance && ctx) {
       console.log("Updating new projects chart");

        // Access allLeads from the global context
        const leads = window.allLeads || [];

        // Group leads by month
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

            // Check if lead is closed won
            if (lead.status === "closed-won") {
              // Use the month of lead creation as the closed month
              monthlyClosedWonLeadCounts[monthIndex]++;
            }
          }
        });

       // Update chart data
       newProjectsChartInstance.data.datasets[0].data = monthlyNewLeadCounts;
       newProjectsChartInstance.data.datasets[1].data = monthlyClosedWonLeadCounts;

       // Update options that might depend on theme or size
        const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
        const textMutedColor = getComputedStyle(document.documentElement).getPropertyValue("--text-muted");
        const cardBackground = getComputedStyle(document.documentElement).getPropertyValue("--card-background");
        const borderColor = getComputedStyle(document.documentElement).getPropertyValue("--border-color");
        const responsiveFontSize = getResponsiveFontSize(container);

       newProjectsChartInstance.options.plugins.legend.labels.color = textColor;
       newProjectsChartInstance.options.plugins.legend.labels.font.size = responsiveFontSize;
       newProjectsChartInstance.options.plugins.tooltip.backgroundColor = cardBackground;
       newProjectsChartInstance.options.plugins.tooltip.titleColor = textColor;
       newProjectsChartInstance.options.plugins.tooltip.bodyColor = textColor;
       newProjectsChartInstance.options.plugins.tooltip.borderColor = borderColor;
       newProjectsChartInstance.options.scales.y.grid.color = textMutedColor + "20";
       newProjectsChartInstance.options.scales.y.ticks.color = textColor;
       newProjectsChartInstance.options.scales.y.ticks.font.size = responsiveFontSize;
       newProjectsChartInstance.options.scales.x.grid.color = textMutedColor + "20";
       newProjectsChartInstance.options.scales.x.ticks.color = textColor;
       newProjectsChartInstance.options.scales.x.ticks.font.size = responsiveFontSize;


       // Call update to re-render the chart
       newProjectsChartInstance.update();

        // Handle no data case after updating
        if (leads.length === 0) {
            newProjectsChartInstance.destroy();
            newProjectsChartInstance = null;
            container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        }


   } else if (ctx) { // If chart does not exist, create a new one
      console.log("Creating new projects chart");

    try {
      // Access allLeads from the global context
      const leads = window.allLeads || [];

      // Group leads by month
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
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

          // Check if lead is closed won
          if (lead.status === "closed-won") {
            // Use the month of lead creation as the closed month
            monthlyClosedWonLeadCounts[monthIndex]++;
          }
        }
      });

      // Debug logging
      console.log("New Leads Counts:", monthlyNewLeadCounts);
      console.log("Closed Won Leads Counts:", monthlyClosedWonLeadCounts);

      // Create the chart only if there are leads
      if (leads.length > 0) {
          // Clear previous chart content before creating a new one
          container.innerHTML = "";
          const newCanvas = document.createElement("canvas");
          container.appendChild(newCanvas);
          const newCtx = newCanvas.getContext("2d");

        newProjectsChartInstance = new Chart(newCtx, {
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
                  color: getComputedStyle(
                    document.documentElement
                  ).getPropertyValue("--text-color"),
                  font: {
                    size: getResponsiveFontSize(container),
                  },
                },
              },
              tooltip: {
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--card-background"),
                titleColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
                bodyColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue("--border-color"),
                borderWidth: 1,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20",
                  lineWidth: 0.5,
                },
                ticks: {
                  color: getComputedStyle(
                    document.documentElement
                  ).getPropertyValue("--text-color"),
                  font: {
                    size: getResponsiveFontSize(container),
                  },
                },
              },
              x: {
                grid: {
                  color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20",
                  lineWidth: 0.5,
                },
                ticks: {
                  color: getComputedStyle(
                    document.documentElement
                  ).getPropertyValue("--text-color"),
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
      } else {
        container.innerHTML =
          '<div class="chart-no-data">No projects to display</div>';
          newProjectsChartInstance = null; // Ensure instance is null if no data
      }
    } catch (error) {
      console.error("Error creating new projects chart:", error);
      container.innerHTML =
        '<div class="chart-no-data">Error creating chart</div>';
        newProjectsChartInstance = null; // Ensure instance is null on error
    }
   } else if (!canvas && !newProjectsChartInstance) {
        // If no canvas and no chart instance, it means it was likely cleared due to no data previously.
        // Attempt to create the chart if there is data now.
       const leads = window.allLeads || [];
        if (leads.length > 0) {
            // Clear previous "no data" message
            container.innerHTML = "";
            // Re-run the function to create the chart
            updateNewProjectsChart();
        }
   }
}

// CHART 3: Revenue by Month Comparison (Bar Chart)
function updateRevenueComparisonChart() {
  const container = document.getElementById("revenueComparisonChart");
  if (!container) {
    console.log("Revenue chart container not found");
    revenueComparisonChartInstance = null; // Ensure instance is null if container disappears
    return;
  }

  const canvas = container.querySelector("canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

   // If the chart already exists, update its data and options
   if (revenueComparisonChartInstance && ctx) {
       console.log("Updating revenue chart");

       // Access payments from the global context
       const payments = window.payments || [];

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

       // Update chart data
       revenueComparisonChartInstance.data.datasets[0].data = previousYearMonthlyTotals;
       revenueComparisonChartInstance.data.datasets[1].data = currentYearMonthlyTotals;
        revenueComparisonChartInstance.data.datasets[0].label = `${previousYear}`;
        revenueComparisonChartInstance.data.datasets[1].label = `${currentYear}`;


       // Update options that might depend on theme or size
        const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
        const textMutedColor = getComputedStyle(document.documentElement).getPropertyValue("--text-muted");
        const cardBackground = getComputedStyle(document.documentElement).getPropertyValue("--card-background");
        const borderColor = getComputedStyle(document.documentElement).getPropertyValue("--border-color");
        const responsiveFontSize = getResponsiveFontSize(container);


        revenueComparisonChartInstance.options.plugins.legend.labels.color = textColor;
        revenueComparisonChartInstance.options.plugins.legend.labels.font.size = responsiveFontSize;
        revenueComparisonChartInstance.options.plugins.legend.labels.boxWidth = responsiveFontSize;
        revenueComparisonChartInstance.options.plugins.tooltip.backgroundColor = cardBackground;
        revenueComparisonChartInstance.options.plugins.tooltip.titleColor = textColor;
        revenueComparisonChartInstance.options.plugins.tooltip.bodyColor = textColor;
        revenueComparisonChartInstance.options.plugins.tooltip.borderColor = borderColor;
        revenueComparisonChartInstance.options.scales.y.grid.color = textMutedColor + "20";
        revenueComparisonChartInstance.options.scales.y.ticks.color = textColor;
        revenueComparisonChartInstance.options.scales.y.ticks.font.size = responsiveFontSize;
        revenueComparisonChartInstance.options.scales.x.grid.color = textMutedColor + "20";
        revenueComparisonChartInstance.options.scales.x.ticks.color = textColor;
        revenueComparisonChartInstance.options.scales.x.ticks.font.size = responsiveFontSize;


       // Call update to re-render the chart
       revenueComparisonChartInstance.update();

        // Handle no data case after updating
        if (payments.length === 0) {
            revenueComparisonChartInstance.destroy();
            revenueComparisonChartInstance = null;
            container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
        }


   } else if (ctx) { // If chart does not exist, create a new one
      console.log("Creating revenue chart");

    try {
      // Access payments from the global context
      const payments = window.payments || [];

      // Group payments by month for current and previous year
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
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

      // Create the chart only if there are payments
      if (payments.length > 0) {
          // Clear previous chart content before creating a new one
          container.innerHTML = "";
          const newCanvas = document.createElement("canvas");
          container.appendChild(newCanvas);
          const newCtx = newCanvas.getContext("2d");

        revenueComparisonChartInstance = new Chart(newCtx, {
          type: "bar",
          data: {
            labels: monthNames,
            datasets: [
              {
                label: `${previousYear}`,
                data: previousYearMonthlyTotals,
                // backgroundColor: "rgba(255, 159, 64, 0.6)",   // Orange
                // borderColor: "#FF9F40",
                backgroundColor: "rgba(153, 102, 255, 0.6)",   // Blue
                borderColor: "#9966FF",
                borderWidth: 2,
                borderRadius: 3,
                barPercentage: 0.7,
                categoryPercentage: 0.85,
              },
              {
                label: `${currentYear}`,
                data: currentYearMonthlyTotals,
                // backgroundColor: "rgba(153, 102, 255, 0.6)",   // Blue
                // borderColor: "#9966FF",
                backgroundColor: "rgba(255, 159, 64, 0.6)",   // Orange
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
                  color: getComputedStyle(
                    document.documentElement
                  ).getPropertyValue("--text-color"),
                  font: {
                    size: getResponsiveFontSize(container),
                  },
                  boxWidth: getResponsiveFontSize(container),
                },
              },
              tooltip: {
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--card-background"),
                titleColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
                bodyColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue("--border-color"),
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
                  }
                }
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20", // Very subtle grid lines
                  lineWidth: 0.5,
                },
                ticks: {
                  callback: function (value) {
                    return "$" + value.toLocaleString();
                  },
                  color: getComputedStyle(
                    document.documentElement
                  ).getPropertyValue("--text-color"),
                  font: {
                    size: getResponsiveFontSize(container),
                  },
                },
              },
              x: {
                grid: {
                  color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20", // Very subtle grid lines
                  lineWidth: 0.5,
                },
                ticks: {
                  color: getComputedStyle(
                    document.documentElement
                  ).getPropertyValue("--text-color"),
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
      } else {
        container.innerHTML =
          '<div class="chart-no-data">No revenue data to display</div>';
          revenueComparisonChartInstance = null; // Ensure instance is null if no data
      }
    } catch (error) {
      console.error("Error creating revenue chart:", error);
      container.innerHTML =
        '<div class="chart-no-data">Error creating chart</div>';
        revenueComparisonChartInstance = null; // Ensure instance is null on error
    }
   } else if (!canvas && !revenueComparisonChartInstance) {
        // If no canvas and no chart instance, it means it was likely cleared due to no data previously.
        // Attempt to create the chart if there is data now.
       const payments = window.payments || [];
        if (payments.length > 0) {
            // Clear previous "no data" message
            container.innerHTML = "";
            // Re-run the function to create the chart
            updateRevenueComparisonChart();
        }
   }
}

// Make the initialization function globally accessible
window.initializeCharts = initializeCharts;
