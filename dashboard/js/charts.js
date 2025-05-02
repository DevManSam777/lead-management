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

// Declare variables to hold chart instances in a scope accessible to update functions
let projectStatusChart = null;
let newProjectsChart = null;
let revenueComparisonChart = null;

// Initialize the charts functionality
function initializeCharts() {
    console.log("Initializing charts...");

    // Create the initial chart instances
    // These functions will now check for data and create the chart if data exists
    createProjectStatusChart();
    createNewProjectsChart();
    createRevenueComparisonChart();

    // Set up event listeners for chart update
    // These listeners will now trigger the updateAllCharts function
    // which will modify and update the *existing* chart instances.
    // Ensure that the code dispatching these events updates window.allLeads and window.payments FIRST.
    window.addEventListener("leadSaved", updateAllCharts);
    window.addEventListener("leadDeleted", updateAllCharts);
    window.addEventListener("paymentsUpdated", updateAllCharts);

    // Also listen for theme changes
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === "data-theme") {
                console.log("Theme changed, triggering chart update.");
                updateAllCharts(); // Trigger update to apply new theme colors/styles
            }
        });
    });

    // Observe the html element for attribute changes (specifically data-theme)
    observer.observe(document.documentElement, { attributes: true });

    // Add window resize listener for responsive charts
    // Chart.js handles most responsiveness with responsive: true,
    // but updating options like font size on resize is good practice.
    window.addEventListener("resize", updateAllCharts);

    console.log("Chart initialization complete. Event listeners attached.");
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
// These functions are called once during initialization or if a chart needs to be created later.

function createProjectStatusChart() {
    const container = document.getElementById("statusDistributionChart");
    if (!container) {
        console.error("Status chart container not found for creation.");
        projectStatusChart = null; // Ensure null if container is missing
        return;
    }

    // Clear any previous content (important if initializeCharts is called multiple times or there was a "no data" message)
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
            if (statusCounts.hasOwnProperty(status)) { // Safely check if status is one we track
                 statusCounts[status]++;
            } else {
                console.warn("Untracked lead status:", status, "for lead:", lead);
                // Optionally handle untracked statuses, maybe add to a 'misc' category
            }
        });
        const totalProjects = leads.length;

        // Define initial data
        const initialData = {
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
        // This plugin should access the chart's data directly to get the latest total
        const centerTextPlugin = {
            id: 'centerText',
            beforeDraw: function(chart) {
                const ctx = chart.ctx;
                if (!ctx) return; // Ensure context is valid

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
                 // Get the latest total from the chart's current data
                 const currentTotal = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                const totalText = currentTotal.toString();


                const baseFontSize = Math.min(width, height) / 20;
                const headerFontSize = baseFontSize * 1;
                const totalFontSize = baseFontSize * 2.4;

                const verticalOffset = -25; // Keep a reasonable default vertical offset

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


        // Define initial options
        const initialOptions = {
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
        };

        try {
            // Create and store the chart instance
            projectStatusChart = new Chart(ctx, {
                type: "doughnut",
                data: initialData,
                options: initialOptions,
                plugins: [centerTextPlugin] // Add the custom plugin here
            });
            console.log("Status chart created successfully.");
        } catch (error) {
             console.error("Error during status chart instantiation:", error);
             container.innerHTML = '<div class="chart-no-data">Error creating chart instance.</div>';
             projectStatusChart = null;
        }

    } else {
        container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        projectStatusChart = null; // Ensure the variable is null if no chart is created
    }
}

function createNewProjectsChart() {
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
                if(monthIndex >= 0 && monthIndex < 12) { // Basic month index validation
                     monthlyNewLeadCounts[monthIndex]++;
                }
                if (lead.status === "closed-won") {
                    // Using creation month for closed won for simplicity as in original logic
                     if(monthIndex >= 0 && monthIndex < 12) {
                         monthlyClosedWonLeadCounts[monthIndex]++;
                     }
                }
            }
        });

        const initialData = {
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

        // Define initial options
        const initialOptions = {
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
                        precision: 0 // Ensure whole numbers for counts
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
        };

        try {
            // Create and store the chart instance
            newProjectsChart = new Chart(ctx, {
                type: "line",
                data: initialData,
                options: initialOptions,
            });
            console.log("New projects chart created successfully.");
        } catch (error) {
            console.error("Error during new projects chart instantiation:", error);
             container.innerHTML = '<div class="chart-no-data">Error creating chart instance.</div>';
             newProjectsChart = null;
        }

    } else {
        container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        newProjectsChart = null;
    }
}

function createRevenueComparisonChart() {
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

             if (paymentMonth >= 0 && paymentMonth < 12) { // Basic month index validation
                if (paymentYear === currentYear) {
                    currentYearMonthlyTotals[paymentMonth] += paymentAmount;
                }
                if (paymentYear === previousYear) {
                    previousYearMonthlyTotals[paymentMonth] += paymentAmount;
                }
            } else {
                 console.warn("Invalid payment month:", paymentMonth, "for payment:", payment);
            }
        });

        const initialData = {
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

        // Define initial options
         const initialOptions = {
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
        };

        try {
            // Create and store the chart instance
            revenueComparisonChart = new Chart(ctx, {
                type: "bar",
                data: initialData,
                options: initialOptions,
            });
            console.log("Revenue chart created successfully.");
        } catch (error) {
             console.error("Error during revenue comparison chart instantiation:", error);
             container.innerHTML = '<div class="chart-no-data">Error creating chart instance.</div>';
             revenueComparisonChart = null;
        }

    } else {
         container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
         revenueComparisonChart = null;
    }
}


// --- CHART UPDATE FUNCTIONS ---
// These functions update existing charts or create them if they don't exist.

// Update all charts with current data
// This function is called when the custom events or resize/theme changes occur
function updateAllCharts() {
    console.log(">>> updateAllCharts triggered <<<");

    // Call the update functions for each chart
    // These functions will now modify existing chart instances and call .update()
    // They also handle creating the chart if it doesn't exist or destroying if data is gone.
    updateProjectStatusChart();
    updateNewProjectsChart();
    updateRevenueComparisonChart();

     console.log(">>> updateAllCharts finished <<<");
}

// Function to update the Project Status Distribution chart
function updateProjectStatusChart() {
    const container = document.getElementById("statusDistributionChart");
    if (!container) {
        console.error("Status chart container not found for update.");
        // If container is gone, destroy chart if it exists
        if (projectStatusChart) {
            projectStatusChart.destroy();
            projectStatusChart = null;
        }
        return;
    }

    const leads = window.allLeads || [];
    const hasData = leads.length > 0;
    const noDataMessageDiv = container.querySelector('.chart-no-data');

    if (projectStatusChart) {
        // Chart exists, decide whether to update or destroy
        if (hasData) {
            console.log("Attempting to update existing status chart...");

            // --- Update Data ---
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
                       console.warn("Untracked lead status during update:", status, "for lead:", lead);
                   }
             });

            const newChartData = [
                 statusCounts["new"],
                 statusCounts["contacted"],
                 statusCounts["in-progress"],
                 statusCounts["closed-won"],
                 statusCounts["closed-lost"],
            ];

             console.log("Status chart new data:", newChartData);
             if (projectStatusChart.data && projectStatusChart.data.datasets && projectStatusChart.data.datasets[0]) {
                  projectStatusChart.data.datasets[0].data = newChartData;
             } else {
                 console.error("Status chart data structure not as expected during update.");
                 // Potentially destroy and recreate if data structure is invalid
                 projectStatusChart.destroy();
                 projectStatusChart = null;
                 createProjectStatusChart();
                 return; // Exit after attempting recreation
             }


            // --- Update Options (for responsiveness and theme changes) ---
            // Create a new options object or carefully update existing properties
            // Creating a new object can sometimes be more reliable for theme changes
            const updatedOptions = {
                 ...projectStatusChart.options, // Keep existing options
                 responsive: true,
                 maintainAspectRatio: false,
                  layout: { padding: 10 },
                 plugins: {
                     ...projectStatusChart.options.plugins, // Keep existing plugins options
                     legend: {
                         ...projectStatusChart.options.plugins.legend,
                         labels: {
                             ...projectStatusChart.options.plugins.legend.labels,
                             color: getThemeColor("--text-color"),
                             font: { size: getResponsiveFontSize(container) },
                             boxWidth: getResponsiveFontSize(container),
                         },
                     },
                     tooltip: {
                         ...projectStatusChart.options.plugins.tooltip,
                         backgroundColor: getThemeColor("--card-background"),
                         titleColor: getThemeColor("--text-color"),
                         bodyColor: getThemeColor("--text-color"),
                         borderColor: getThemeColor("--border-color"),
                     },
                     // Center text plugin options are handled within the plugin's beforeDraw,
                     // accessing the latest chart data and theme colors directly.
                 },
                 cutout: "65%", // Ensure cutout is still set
            };
             projectStatusChart.options = updatedOptions;
             console.log("Status chart updated options:", projectStatusChart.options);


            // Call update to redraw the chart
            try {
                projectStatusChart.update();
                 console.log("projectStatusChart.update() called successfully.");
            } catch (error) {
                 console.error("Error calling update() on status chart:", error);
            }


             // Hide the "no data" message if it was visible
             if(noDataMessageDiv) {
                 noDataMessageDiv.style.display = 'none';
             }


        } else {
            // Chart exists but no data, destroy it and show message
            console.log("No data for status chart, destroying existing chart.");
            projectStatusChart.destroy();
            projectStatusChart = null; // Clear the reference
            container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        }

    } else if (!projectStatusChart && hasData) {
        // Chart doesn't exist but there's data, create it
        console.log("Status chart instance not found but data exists, creating chart...");
        createProjectStatusChart(); // Call the creation function

    } else if (!projectStatusChart && !hasData) {
         // Chart doesn't exist and no data, just ensure message is shown
         console.log("No data and no status chart instance. Showing no data message.");
         if (!noDataMessageDiv) { // Only add message if it doesn't exist
              container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
         } else {
             noDataMessageDiv.style.display = ''; // Ensure message is visible
         }
         projectStatusChart = null; // Ensure null
    }
}

// Function to update the New Projects chart
function updateNewProjectsChart() {
    const container = document.getElementById("newProjectsChart");
    if (!container) {
        console.error("New projects chart container not found for update.");
         if (newProjectsChart) {
             newProjectsChart.destroy();
             newProjectsChart = null;
         }
        return;
    }

    const leads = window.allLeads || [];
    const hasData = leads.length > 0;
    const noDataMessageDiv = container.querySelector('.chart-no-data');


    if (newProjectsChart) {
        // Chart exists, decide whether to update or destroy
         if (hasData) {
            console.log("Attempting to update existing new projects chart...");

             // --- Update Data ---
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

            const newLineData1 = monthlyNewLeadCounts;
            const newLineData2 = monthlyClosedWonLeadCounts;

             console.log("New projects chart new data - New:", newLineData1, "Won:", newLineData2);

             if (newProjectsChart.data && newProjectsChart.data.datasets && newProjectsChart.data.datasets.length > 1) {
                 newProjectsChart.data.datasets[0].data = newLineData1;
                 newProjectsChart.data.datasets[1].data = newLineData2;
             } else {
                 console.error("New projects chart data structure not as expected during update.");
                  newProjectsChart.destroy();
                  newProjectsChart = null;
                  createNewProjectsChart();
                 return;
             }


            // Update options for responsiveness and theme changes
             const updatedOptions = {
                 ...newProjectsChart.options,
                 responsive: true,
                 maintainAspectRatio: false,
                 layout: { padding: 10 },
                 plugins: {
                     ...newProjectsChart.options.plugins,
                     legend: {
                         ...newProjectsChart.options.plugins.legend,
                         labels: {
                             ...newProjectsChart.options.plugins.legend.labels,
                             color: getThemeColor("--text-color"),
                             font: { size: getResponsiveFontSize(container) },
                         },
                     },
                     tooltip: {
                         ...newProjectsChart.options.plugins.tooltip,
                         backgroundColor: getThemeColor("--card-background"),
                         titleColor: getThemeColor("--text-color"),
                         bodyColor: getThemeColor("--text-color"),
                         borderColor: getThemeColor("--border-color"),
                     },
                 },
                 scales: {
                     y: {
                         ...newProjectsChart.options.scales.y,
                         grid: {
                              ...newProjectsChart.options.scales.y.grid,
                             color: getThemeColor("--text-muted") + "20",
                         },
                         ticks: {
                              ...newProjectsChart.options.scales.y.ticks,
                             color: getThemeColor("--text-color"),
                             font: { size: getResponsiveFontSize(container) },
                             precision: 0,
                         },
                     },
                     x: {
                         ...newProjectsChart.options.scales.x,
                         grid: {
                             ...newProjectsChart.options.scales.x.grid,
                             color: getThemeColor("--text-muted") + "20",
                         },
                         ticks: {
                              ...newProjectsChart.options.scales.x.ticks,
                             color: getThemeColor("--text-color"),
                             font: { size: getResponsiveFontSize(container) },
                              autoSkip: false,
                         },
                     },
                 },
             };
            newProjectsChart.options = updatedOptions;
            console.log("New projects chart updated options:", newProjectsChart.options);


            // Call update to redraw the chart
             try {
                newProjectsChart.update();
                 console.log("newProjectsChart.update() called successfully.");
             } catch (error) {
                 console.error("Error calling update() on new projects chart:", error);
             }

             // Hide the "no data" message
             if(noDataMessageDiv) {
                 noDataMessageDiv.style.display = 'none';
             }

         } else {
             // Chart exists but no data, destroy it and show message
             console.log("No data for new projects chart, destroying existing chart.");
             newProjectsChart.destroy();
             newProjectsChart = null;
             container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
         }

     } else if (!newProjectsChart && hasData) {
         console.log("New projects chart instance not found but data exists, creating chart...");
         createNewProjectsChart();

     } else if (!newProjectsChart && !hasData) {
          console.log("No data and no new projects chart instance. Showing no data message.");
          if (!noDataMessageDiv) {
             container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
          } else {
              noDataMessageDiv.style.display = '';
          }
         newProjectsChart = null;
     }
}

// Function to update the Revenue by Month Comparison chart
function updateRevenueComparisonChart() {
    const container = document.getElementById("revenueComparisonChart");
    if (!container) {
        console.error("Revenue chart container not found for update.");
         if (revenueComparisonChart) {
             revenueComparisonChart.destroy();
             revenueComparisonChart = null;
         }
        return;
    }

    const payments = window.payments || [];
     const hasData = payments.length > 0;
     const noDataMessageDiv = container.querySelector('.chart-no-data');


    if (revenueComparisonChart) {
        // Chart exists, decide whether to update or destroy
         if (hasData) {
            console.log("Attempting to update existing revenue chart...");

            // --- Update Data ---
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
                    console.warn("Invalid payment month during update:", paymentMonth, "for payment:", payment);
                }
            });

            const newRevenueData1 = previousYearMonthlyTotals;
            const newRevenueData2 = currentYearMonthlyTotals;

             console.log("Revenue chart new data - Prev Year:", newRevenueData1, "Curr Year:", newRevenueData2);


             if (revenueComparisonChart.data && revenueComparisonChart.data.datasets && revenueComparisonChart.data.datasets.length > 1) {
                 revenueComparisonChart.data.datasets[0].data = newRevenueData1;
                 revenueComparisonChart.data.datasets[1].data = newRevenueData2;
                 revenueComparisonChart.data.datasets[0].label = `${previousYear}`; // Update labels in case year changes
                 revenueComparisonChart.data.datasets[1].label = `${currentYear}`;
             } else {
                 console.error("Revenue chart data structure not as expected during update.");
                  revenueComparisonChart.destroy();
                  revenueComparisonChart = null;
                  createRevenueComparisonChart();
                 return;
             }


            // Update options for responsiveness and theme changes
             const updatedOptions = {
                 ...revenueComparisonChart.options,
                 responsive: true,
                 maintainAspectRatio: false,
                  layout: { padding: 10 },
                 plugins: {
                     ...revenueComparisonChart.options.plugins,
                     legend: {
                         ...revenueComparisonChart.options.plugins.legend,
                         labels: {
                             ...revenueComparisonChart.options.plugins.legend.labels,
                             color: getThemeColor("--text-color"),
                             font: { size: getResponsiveFontSize(container) },
                             boxWidth: getResponsiveFontSize(container),
                         },
                     },
                     tooltip: {
                         ...revenueComparisonChart.options.plugins.tooltip,
                         backgroundColor: getThemeColor("--card-background"),
                         titleColor: getThemeColor("--text-color"),
                         bodyColor: getThemeColor("--text-color"),
                         borderColor: getThemeColor("--border-color"),
                     },
                 },
                 scales: {
                     y: {
                         ...revenueComparisonChart.options.scales.y,
                         grid: {
                              ...revenueComparisonChart.options.scales.y.grid,
                             color: getThemeColor("--text-muted") + "20",
                         },
                         ticks: {
                              ...revenueComparisonChart.options.scales.y.ticks,
                             color: getThemeColor("--text-color"),
                             font: { size: getResponsiveFontSize(container) },
                              // Callback for currency formatting remains
                         },
                     },
                     x: {
                         ...revenueComparisonChart.options.scales.x,
                         grid: {
                              ...revenueComparisonChart.options.scales.x.grid,
                             color: getThemeColor("--text-muted") + "20",
                         },
                         ticks: {
                             ...revenueComparisonChart.options.scales.x.ticks,
                             color: getThemeColor("--text-color"),
                             font: { size: getResponsiveFontSize(container) },
                             autoSkip: false,
                         },
                     },
                 },
             };
            revenueComparisonChart.options = updatedOptions;
             console.log("Revenue chart updated options:", revenueComparisonChart.options);


            // Call update to redraw the chart
             try {
                 revenueComparisonChart.update();
                 console.log("revenueComparisonChart.update() called successfully.");
             } catch (error) {
                  console.error("Error calling update() on revenue chart:", error);
             }


             // Hide the "no data" message
             if(noDataMessageDiv) {
                 noDataMessageDiv.style.display = 'none';
             }

         } else {
            // Chart exists but no data, destroy it and show message
             console.log("No data for revenue chart, destroying existing chart.");
             revenueComparisonChart.destroy();
             revenueComparisonChart = null;
             container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
         }

     } else if (!revenueComparisonChart && hasData) {
         console.log("Revenue chart instance not found but data exists, creating chart...");
         createRevenueComparisonChart();

     } else if (!revenueComparisonChart && !hasData) {
          console.log("No data and no revenue chart instance. Showing no data message.");
          if (!noDataMessageDiv) {
              container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
          } else {
              noDataMessageDiv.style.display = '';
          }
         revenueComparisonChart = null;
     }
}


// Make the initialization function globally accessible
window.initializeCharts = initializeCharts;