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

// Declare variables to hold chart instances.
// These will be destroyed and recreated on updates in this new approach.
let projectStatusChart = null;
let newProjectsChart = null;
let revenueComparisonChart = null;

// Initialize the charts functionality
function initializeCharts() {
    console.log("Initializing charts (New Approach)...");

    // Create the initial chart instances on load
    createProjectStatusChart();
    createNewProjectsChart();
    createRevenueComparisonChart();

    // Set up event listeners that will trigger the destroy and recreate process
    // Ensure that the code dispatching these events updates window.allLeads and window.payments FIRST.
    window.addEventListener("leadSaved", updateAllCharts);
    window.addEventListener("leadDeleted", updateAllCharts);
    window.addEventListener("paymentsUpdated", updateAllCharts);

    // Also listen for theme changes - will now trigger destroy and recreate
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === "data-theme") {
                console.log("Theme changed, triggering chart destroy and recreate.");
                updateAllCharts(); // Destroy and recreate to apply new theme colors/styles
            }
        });
    });

    // Observe the html element for attribute changes (specifically data-theme)
    observer.observe(document.documentElement, { attributes: true });

    // Add window resize listener - will now trigger destroy and recreate
    // Less efficient than Chart.js's responsive: true, but a new approach.
    window.addEventListener("resize", updateAllCharts);

    console.log("Chart initialization complete (New Approach). Event listeners attached.");
}

// Function to get responsive font size based on container width
function getResponsiveFontSize(container) {
    const width = container ? container.clientWidth : 600; // Add safety check for container
    if (width < 480) return 10; // Small screens
    if (width < 768) return 12; // Medium screens
    return 14; // Large screens
}

// Helper to get theme-dependent colors
function getThemeColor(cssVariable) {
    return getComputedStyle(document.documentElement).getPropertyValue(cssVariable).trim();
}


// --- CHART CREATION FUNCTIONS ---
// These functions are responsible for creating a NEW canvas and chart instance.

function createProjectStatusChart() {
    console.log("Creating Project Status Chart...");
    const container = document.getElementById("statusDistributionChart");
    if (!container) {
        console.error("Status chart container not found for creation.");
        projectStatusChart = null; // Ensure null if container is missing
        return;
    }

    // Ensure the container is empty before creating a new canvas
    container.innerHTML = "";

    const leads = window.allLeads || [];

    if (leads.length > 0) {
         const canvas = document.createElement("canvas");
         container.appendChild(canvas);
         const ctx = canvas.getContext("2d");
         if (!ctx) {
             console.error("Failed to get canvas context for status chart.");
             container.innerHTML = '<div class="chart-no-data">Error creating chart canvas.</div>';
             projectStatusChart = null;
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
        leads.forEach((lead) => {
            const status = lead.status || "new";
            if (statusCounts.hasOwnProperty(status)) {
                 statusCounts[status]++;
            } else {
                console.warn("Untracked lead status:", status, "for lead:", lead);
            }
        });
        const totalProjects = leads.length;

        // Prepare data for the new chart
        const chartData = {
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
                        "rgba(64, 192, 255, 0.7)", // New - Bright blue
                        "rgba(255, 159, 64, 0.7)", // Contacted - Orange
                        "rgba(153, 102, 255, 0.7)", // In Progress - Purple
                        "rgba(40, 167, 69, 0.7)", // Won - Green (success)
                        "rgba(255, 99, 132, 0.7)", // Lost - Red
                    ],
                    borderWidth: 2,
                    borderColor: ["#40C0FF", "#FF9F40", "#9966FF", "#28A745", "#FF6384"],
                },
            ],
        };

        // Custom plugin for center text
         // Ensure this plugin works correctly when a new chart is created
        const centerTextPlugin = {
            id: 'centerText',
            beforeDraw: function(chart) {
                const ctx = chart.ctx;
                if (!ctx) return;

                const width = chart.width;
                const height = chart.height;
                const centerX = width / 2;
                const centerY = height / 2;

                ctx.restore();
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";

                const textColor = getThemeColor("--text-color");
                const textMutedColor = getThemeColor("--text-muted");

                const headerText = "Total";
                 // Get the total from the data of the chart being drawn
                 const currentTotal = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                const totalText = currentTotal.toString();


                const baseFontSize = Math.min(width, height) / 20;
                const headerFontSize = baseFontSize * 1;
                const totalFontSize = baseFontSize * 2.4;

                const verticalOffset = -25;

                const headerY = centerY + verticalOffset - (totalFontSize * .45);
                const totalY = centerY + verticalOffset + (totalFontSize * .55);


                ctx.font = `bold ${headerFontSize}px sans-serif`;
                ctx.fillStyle = textMutedColor;
                ctx.fillText(headerText, centerX, headerY);

                ctx.font = `${totalFontSize}px sans-serif`;
                ctx.fillStyle = textColor;
                ctx.fillText(totalText, centerX, totalY);

                ctx.save();
            }
        };


        // Define options for the new chart
        const chartOptions = {
            responsive: true, // Still good to keep for initial sizing
            maintainAspectRatio: false,
            cutout: "65%",
            layout: {
                padding: 10,
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: getThemeColor("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                        boxWidth: getResponsiveFontSize(container),
                    },
                },
                tooltip: {
                    backgroundColor: getThemeColor("--card-background"),
                    titleColor: getThemeColor("--text-color"),
                    bodyColor: getThemeColor("--text-color"),
                    borderColor: getThemeColor("--border-color"),
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
                             const percentage = total === 0 ? "0%" : Math.round((value / total) * 100) + "%";
                            return `${value} projects (${percentage})`;
                        },
                    },
                },
            },
            animation: { // Keep some basic animation for appearance
                 duration: 500 // milliseconds
            }
        };

        try {
            // Create and store the NEW chart instance
            projectStatusChart = new Chart(ctx, {
                type: "doughnut",
                data: chartData,
                options: chartOptions,
                plugins: [centerTextPlugin]
            });
            console.log("Project Status Chart created successfully.");
        } catch (error) {
             console.error("Error during status chart creation:", error);
             container.innerHTML = '<div class="chart-no-data">Error creating chart.</div>';
             projectStatusChart = null;
        }

    } else {
        container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        projectStatusChart = null;
    }
}

function createNewProjectsChart() {
     console.log("Creating New Projects Chart...");
    const container = document.getElementById("newProjectsChart");
    if (!container) {
        console.error("New projects chart container not found for creation.");
        newProjectsChart = null;
        return;
    }

    container.innerHTML = "";
    const leads = window.allLeads || [];

    if (leads.length > 0) {
        const canvas = document.createElement("canvas");
        container.appendChild(canvas);
        const ctx = canvas.getContext("2d");
         if (!ctx) {
             console.error("Failed to get canvas context for new projects chart.");
             container.innerHTML = '<div class="chart-no-data">Error creating chart canvas.</div>';
             newProjectsChart = null;
             return;
         }

         // Group leads by month (data preparation)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyNewLeadCounts = new Array(12).fill(0);
        const monthlyClosedWonLeadCounts = new Array(12).fill(0);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

         leads.forEach((lead) => {
            if (!lead.createdAt) return;
            const leadDate = new Date(lead.createdAt);
            if (leadDate.getFullYear() === currentYear) {
                const monthIndex = leadDate.getMonth();
                 if(monthIndex >= 0 && monthIndex < 12) {
                     monthlyNewLeadCounts[monthIndex]++;
                 }
                if (lead.status === "closed-won") {
                     if(monthIndex >= 0 && monthIndex < 12) {
                         monthlyClosedWonLeadCounts[monthIndex]++;
                     }
                }
            }
        });

        const chartData = {
            labels: monthNames,
            datasets: [
                {
                    label: "New",
                    data: monthlyNewLeadCounts,
                    backgroundColor: "rgba(54, 162, 235, 0.2)", // Blue
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
                    backgroundColor: "rgba(40, 167, 69, 0.2)", // Green
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

        // Define options for the new chart
        const chartOptions = {
             responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 10,
            },
            plugins: {
                legend: {
                    labels: {
                        color: getThemeColor("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                    },
                },
                tooltip: {
                    backgroundColor: getThemeColor("--card-background"),
                    titleColor: getThemeColor("--text-color"),
                    bodyColor: getThemeColor("--text-color"),
                    borderColor: getThemeColor("--border-color"),
                    borderWidth: 1,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getThemeColor("--text-muted") + "20",
                        lineWidth: 0.5,
                    },
                    ticks: {
                        color: getThemeColor("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                         precision: 0
                    },
                },
                x: {
                    grid: {
                        color: getThemeColor("--text-muted") + "20",
                        lineWidth: 0.5,
                    },
                    ticks: {
                        color: getThemeColor("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                        autoSkip: false,
                    },
                },
            },
            animation: {
                 duration: 500
            }
        };

        try {
            // Create and store the NEW chart instance
            newProjectsChart = new Chart(ctx, {
                type: "line",
                data: chartData,
                options: chartOptions,
            });
            console.log("New Projects Chart created successfully.");
        } catch (error) {
            console.error("Error during new projects chart creation:", error);
             container.innerHTML = '<div class="chart-no-data">Error creating chart.</div>';
             newProjectsChart = null;
        }

    } else {
        container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        newProjectsChart = null;
    }
}

function createRevenueComparisonChart() {
     console.log("Creating Revenue Comparison Chart...");
     const container = document.getElementById("revenueComparisonChart");
    if (!container) {
        console.error("Revenue chart container not found for creation.");
        revenueComparisonChart = null;
        return;
    }

    container.innerHTML = "";
    const payments = window.payments || [];

    if (payments.length > 0) {
        const canvas = document.createElement("canvas");
        container.appendChild(canvas);
        const ctx = canvas.getContext("2d");
         if (!ctx) {
             console.error("Failed to get canvas context for revenue chart.");
             container.innerHTML = '<div class="chart-no-data">Error creating chart canvas.</div>';
             revenueComparisonChart = null;
             return;
         }

         // Group payments by month (data preparation)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const previousYear = currentYear - 1;
        const currentYearMonthlyTotals = new Array(12).fill(0);
        const previousYearMonthlyTotals = new Array(12).fill(0);

        payments.forEach((payment) => {
            if (!payment.paymentDate) return;
            const paymentDate = new Date(payment.paymentDate);
            const paymentYear = paymentDate.getFullYear();
            const paymentMonth = paymentDate.getMonth();
            const paymentAmount = parseFloat(payment.amount) || 0;

            if (paymentMonth >= 0 && paymentMonth < 12) {
                 if (paymentYear === currentYear) {
                     currentYearMonthlyTotals[paymentMonth] += paymentAmount;
                 }
                 if (paymentYear === previousYear) {
                     previousYearMonthlyTotals[paymentMonth] += paymentAmount;
                 }
            } else {
                 console.warn("Invalid payment month during data processing:", paymentMonth, "for payment:", payment);
            }
        });

        const chartData = {
             labels: monthNames,
            datasets: [
                {
                    label: `${previousYear}`,
                    data: previousYearMonthlyTotals,
                     backgroundColor: "rgba(153, 102, 255, 0.6)", // Purple
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
        };

        // Define options for the new chart
         const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 10,
            },
            plugins: {
                legend: {
                    labels: {
                        color: getThemeColor("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                        boxWidth: getResponsiveFontSize(container),
                    },
                },
                tooltip: {
                    backgroundColor: getThemeColor("--card-background"),
                    titleColor: getThemeColor("--text-color"),
                    bodyColor: getThemeColor("--text-color"),
                    borderColor: getThemeColor("--border-color"),
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
                        color: getThemeColor("--text-muted") + "20",
                        lineWidth: 0.5,
                    },
                    ticks: {
                        callback: function (value) {
                            return "$" + value.toLocaleString();
                        },
                        color: getThemeColor("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                    },
                },
                x: {
                    grid: {
                        color: getThemeColor("--text-muted") + "20",
                        lineWidth: 0.5,
                    },
                    ticks: {
                        color: getThemeColor("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                        autoSkip: false,
                    },
                },
            },
            animation: {
                 duration: 500
            }
        };

        try {
            // Create and store the NEW chart instance
            revenueComparisonChart = new Chart(ctx, {
                type: "bar",
                data: chartData,
                options: chartOptions,
            });
            console.log("Revenue Comparison Chart created successfully.");
        } catch (error) {
             console.error("Error during revenue comparison chart creation:", error);
             container.innerHTML = '<div class="chart-no-data">Error creating chart.</div>';
             revenueComparisonChart = null;
        }

    } else {
         container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
         revenueComparisonChart = null;
    }
}


// --- CHART UPDATE TRIGGER ---
// This function destroys existing charts and recreates them.

function updateAllCharts() {
    console.log(">>> updateAllCharts triggered (Destroy & Recreate) <<<");

    // Destroy existing charts if they exist
    if (projectStatusChart) {
        console.log("Destroying existing Project Status Chart.");
        projectStatusChart.destroy();
        projectStatusChart = null;
    }
    if (newProjectsChart) {
        console.log("Destroying existing New Projects Chart.");
        newProjectsChart.destroy();
        newProjectsChart = null;
    }
    if (revenueComparisonChart) {
        console.log("Destroying existing Revenue Comparison Chart.");
        revenueComparisonChart.destroy();
        revenueComparisonChart = null;
    }

    // Recreate all charts with the latest data
    // These creation functions will read the current state of window.allLeads/payments
    createProjectStatusChart();
    createNewProjectsChart();
    createRevenueComparisonChart();

    console.log(">>> updateAllCharts finished (Destroy & Recreate) <<<");
}


// Make the initialization function globally accessible
window.initializeCharts = initializeCharts;