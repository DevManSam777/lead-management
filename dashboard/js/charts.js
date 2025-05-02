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
    console.log("Initializing charts");

    // Create the initial chart instances
    // These functions will now check for data and create the chart if data exists
    createProjectStatusChart();
    createNewProjectsChart();
    createRevenueComparisonChart();

    // Set up event listeners for chart update
    // These listeners will now trigger the updateAllCharts function
    // which will modify and update the *existing* chart instances.
    window.addEventListener("leadSaved", updateAllCharts);
    window.addEventListener("leadDeleted", updateAllCharts);
    window.addEventListener("paymentsUpdated", updateAllCharts);

    // Also listen for theme changes
    // This observer should still work as intended
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === "data-theme") {
                console.log("Theme changed, updating charts.");
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
}

// Functions to create the initial chart instances
// These functions also handle the "no data" state on initial load
function createProjectStatusChart() {
    const container = document.getElementById("statusDistributionChart");
    if (!container) {
        console.log("Status chart container not found for creation");
        return;
    }

    // Clear any previous content (important if initializeCharts is called multiple times or there was a "no data" message)
    container.innerHTML = "";

    const leads = window.allLeads || [];

    if (leads.length > 0) {
         const canvas = document.createElement("canvas");
         container.appendChild(canvas);
         const ctx = canvas.getContext("2d");

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
            statusCounts[status]++;
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

                const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
                const textMutedColor = getComputedStyle(document.documentElement).getPropertyValue("--text-muted");

                const headerText = "Total";
                // Access the latest total from the data calculation
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
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
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
                            const percentage = total === 0 ? "0%" : Math.round((value / total) * 100) + "%";
                            return `${value} projects (${percentage})`;
                        },
                    },
                },
            },
        };


        // Create and store the chart instance
        projectStatusChart = new Chart(ctx, {
            type: "doughnut",
            data: initialData,
            options: initialOptions,
            plugins: [centerTextPlugin]
        });
        console.log("Status chart created successfully");
    } else {
        container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        projectStatusChart = null; // Ensure the variable is null if no chart is created
    }
}

function createNewProjectsChart() {
    const container = document.getElementById("newProjectsChart");
    if (!container) {
        console.log("New projects chart container not found for creation");
        return;
    }

    container.innerHTML = "";
    const leads = window.allLeads || [];

    if (leads.length > 0) {
        const canvas = document.createElement("canvas");
        container.appendChild(canvas);
        const ctx = canvas.getContext("2d");


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
                monthlyNewLeadCounts[monthIndex]++;
                if (lead.status === "closed-won") {
                     monthlyClosedWonLeadCounts[monthIndex]++;
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
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
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
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
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
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                        autoSkip: false,
                    },
                },
            },
        };

        // Create and store the chart instance
        newProjectsChart = new Chart(ctx, {
            type: "line",
            data: initialData,
            options: initialOptions,
        });
        console.log("New projects chart created successfully");
    } else {
        container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        newProjectsChart = null;
    }
}

function createRevenueComparisonChart() {
     const container = document.getElementById("revenueComparisonChart");
    if (!container) {
        console.log("Revenue chart container not found for creation");
        return;
    }

    container.innerHTML = "";
    const payments = window.payments || [];

    if (payments.length > 0) {
        const canvas = document.createElement("canvas");
        container.appendChild(canvas);
        const ctx = canvas.getContext("2d");


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

            if (paymentYear === currentYear) {
                currentYearMonthlyTotals[paymentMonth] += paymentAmount;
            }
            if (paymentYear === previousYear) {
                previousYearMonthlyTotals[paymentMonth] += paymentAmount;
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
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
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
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20",
                        lineWidth: 0.5,
                    },
                    ticks: {
                        callback: function (value) {
                            return "$" + value.toLocaleString();
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
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
                        color: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
                        font: {
                            size: getResponsiveFontSize(container),
                        },
                        autoSkip: false,
                    },
                },
            },
        };


        // Create and store the chart instance
        revenueComparisonChart = new Chart(ctx, {
            type: "bar",
            data: initialData,
            options: initialOptions,
        });
        console.log("Revenue chart created successfully");
    } else {
         container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
         revenueComparisonChart = null;
    }
}


// Update all charts with current data
// This function is called when the custom events or resize/theme changes occur
function updateAllCharts() {
    console.log("Updating charts");

    // Call the update functions for each chart
    // These functions will now modify existing chart instances and call .update()
    updateProjectStatusChart();
    updateNewProjectsChart();
    updateRevenueComparisonChart();
}

// Function to update the Project Status Distribution chart
function updateProjectStatusChart() {
    const container = document.getElementById("statusDistributionChart");
    const leads = window.allLeads || [];

    // Check if the chart instance exists
    if (projectStatusChart) {
        console.log("Updating existing status chart");

        if (leads.length > 0) {
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
                statusCounts[status]++;
            });
            projectStatusChart.data.datasets[0].data = [
                statusCounts["new"],
                statusCounts["contacted"],
                statusCounts["in-progress"],
                statusCounts["closed-won"],
                statusCounts["closed-lost"],
            ];

             // Update options for responsiveness and theme changes
             projectStatusChart.options.plugins.legend.labels.font.size = getResponsiveFontSize(container);
             projectStatusChart.options.plugins.legend.labels.boxWidth = getResponsiveFontSize(container);
             projectStatusChart.options.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             projectStatusChart.options.plugins.tooltip.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--card-background");
             projectStatusChart.options.plugins.tooltip.titleColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             projectStatusChart.options.plugins.tooltip.bodyColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             projectStatusChart.options.plugins.tooltip.borderColor = getComputedStyle(document.documentElement).getPropertyValue("--border-color");

            // Call update to redraw the chart
            projectStatusChart.update();

             // Ensure the "no data" message is not visible if the chart is displayed
             const noDataMessage = container.querySelector('.chart-no-data');
             if(noDataMessage) {
                 noDataMessage.style.display = 'none';
             }


        } else {
            // If chart exists but no data, destroy it and show message
            console.log("No data for status chart, destroying existing chart");
            projectStatusChart.destroy();
            projectStatusChart = null; // Clear the reference
            container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
        }

    } else if (!projectStatusChart && leads.length > 0) {
        // If chart doesn't exist but there's data, create it
        console.log("Chart instance not found, creating status chart during update");
        createProjectStatusChart(); // Call the creation function

    } else if (!projectStatusChart && leads.length === 0) {
         // If chart doesn't exist and no data, just ensure message is shown
         console.log("No data and no status chart instance");
         container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
         projectStatusChart = null; // Ensure null
    }
}

// Function to update the New Projects chart
function updateNewProjectsChart() {
    const container = document.getElementById("newProjectsChart");
    const leads = window.allLeads || [];

    if (newProjectsChart) {
        console.log("Updating existing new projects chart");
         if (leads.length > 0) {
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
                      monthlyNewLeadCounts[monthIndex]++;
                      if (lead.status === "closed-won") {
                          monthlyClosedWonLeadCounts[monthIndex]++;
                      }
                  }
              });

             newProjectsChart.data.datasets[0].data = monthlyNewLeadCounts;
             newProjectsChart.data.datasets[1].data = monthlyClosedWonLeadCounts;


            // Update options for responsiveness and theme changes
             newProjectsChart.options.plugins.legend.labels.font.size = getResponsiveFontSize(container);
             newProjectsChart.options.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             newProjectsChart.options.plugins.tooltip.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--card-background");
             newProjectsChart.options.plugins.tooltip.titleColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             newProjectsChart.options.plugins.tooltip.bodyColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             newProjectsChart.options.plugins.tooltip.borderColor = getComputedStyle(document.documentElement).getPropertyValue("--border-color");

             // Update scale ticks colors and font sizes
             newProjectsChart.options.scales.y.ticks.font.size = getResponsiveFontSize(container);
             newProjectsChart.options.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
              newProjectsChart.options.scales.y.grid.color = getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20";

             newProjectsChart.options.scales.x.ticks.font.size = getResponsiveFontSize(container);
             newProjectsChart.options.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
              newProjectsChart.options.scales.x.grid.color = getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20";


            // Call update to redraw the chart
            newProjectsChart.update();

             // Ensure the "no data" message is not visible
              const noDataMessage = container.querySelector('.chart-no-data');
             if(noDataMessage) {
                 noDataMessage.style.display = 'none';
             }

         } else {
             // If chart exists but no data, destroy it and show message
             console.log("No data for new projects chart, destroying existing chart");
             newProjectsChart.destroy();
             newProjectsChart = null;
             container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
         }

     } else if (!newProjectsChart && leads.length > 0) {
         console.log("Chart instance not found, creating new projects chart during update");
         createNewProjectsChart();
     }
     else if (!newProjectsChart && leads.length === 0) {
         console.log("No data and no new projects chart instance");
         container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
         newProjectsChart = null;
     }
}

// Function to update the Revenue by Month Comparison chart
function updateRevenueComparisonChart() {
    const container = document.getElementById("revenueComparisonChart");
    const payments = window.payments || [];

    if (revenueComparisonChart) {
        console.log("Updating existing revenue chart");

         if (payments.length > 0) {
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

                if (paymentYear === currentYear) {
                    currentYearMonthlyTotals[paymentMonth] += paymentAmount;
                }
                if (paymentYear === previousYear) {
                    previousYearMonthlyTotals[paymentMonth] += paymentAmount;
                }
            });

            revenueComparisonChart.data.datasets[0].data = previousYearMonthlyTotals;
            revenueComparisonChart.data.datasets[1].data = currentYearMonthlyTotals;
            // Update dataset labels for years
            revenueComparisonChart.data.datasets[0].label = `${previousYear}`;
            revenueComparisonChart.data.datasets[1].label = `${currentYear}`;


            // Update options for responsiveness and theme changes
             revenueComparisonChart.options.plugins.legend.labels.font.size = getResponsiveFontSize(container);
             revenueComparisonChart.options.plugins.legend.labels.boxWidth = getResponsiveFontSize(container);
             revenueComparisonChart.options.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             revenueComparisonChart.options.plugins.tooltip.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--card-background");
             revenueComparisonChart.options.plugins.tooltip.titleColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             revenueComparisonChart.options.plugins.tooltip.bodyColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
             revenueComparisonChart.options.plugins.tooltip.borderColor = getComputedStyle(document.documentElement).getPropertyValue("--border-color");

             // Update scale ticks colors and font sizes
             revenueComparisonChart.options.scales.y.ticks.font.size = getResponsiveFontSize(container);
             revenueComparisonChart.options.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
              revenueComparisonChart.options.scales.y.grid.color = getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20";

             revenueComparisonChart.options.scales.x.ticks.font.size = getResponsiveFontSize(container);
             revenueComparisonChart.options.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
              revenueComparisonChart.options.scales.x.grid.color = getComputedStyle(document.documentElement).getPropertyValue("--text-muted") + "20";


            // Call update to redraw the chart
            revenueComparisonChart.update();

             // Ensure the "no data" message is not visible
              const noDataMessage = container.querySelector('.chart-no-data');
             if(noDataMessage) {
                 noDataMessage.style.display = 'none';
             }


         } else {
            // If chart exists but no data, destroy it and show message
             console.log("No data for revenue chart, destroying existing chart");
             revenueComparisonChart.destroy();
             revenueComparisonChart = null;
             container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
         }

     } else if (!revenueComparisonChart && payments.length > 0) {
         console.log("Chart instance not found, creating revenue chart during update");
         createRevenueComparisonChart();

     } else if (!revenueComparisonChart && payments.length === 0) {
          console.log("No data and no revenue chart instance");
         container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
         revenueComparisonChart = null;
     }
}


// Function to get responsive font size based on container width (remains the same)
function getResponsiveFontSize(container) {
    const width = container.clientWidth;
    if (width < 480) return 10; // Small screens
    if (width < 768) return 12; // Medium screens
    return 14; // Large screens
}

// Make the initialization function globally accessible
window.initializeCharts = initializeCharts;