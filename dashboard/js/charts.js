// Initialize the charts functionality
function initializeCharts() {
    console.log("Initializing charts");
    
    // Initial chart creation
    updateAllCharts();
    
    // Set up event listeners for chart update
    window.addEventListener("leadSaved", updateAllCharts);
    window.addEventListener("leadDeleted", updateAllCharts);
    window.addEventListener("paymentsUpdated", updateAllCharts);
    
    // Also listen for theme changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === "data-theme") {
          updateAllCharts();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
  
    // Add window resize listener for responsive charts
    window.addEventListener('resize', updateAllCharts);
  }
  
  // Update all charts with current data
  function updateAllCharts() {
    console.log("Updating charts");
    
    // Call the update functions
    updateProjectStatusChart();
    updateNewProjectsChart();
    updateRevenueComparisonChart();
  }
  
  // Function to get responsive font size based on container width
  function getResponsiveFontSize(container) {
    const width = container.clientWidth;
    if (width < 480) return 10;  // Small screens
    if (width < 768) return 12;  // Medium screens
    return 14;  // Large screens
  }
  
  // CHART 1: Project Status Distribution (Pie Chart)
  function updateProjectStatusChart() {
    const container = document.getElementById('statusDistributionChart');
    if (!container) {
      console.log("Status chart container not found");
      return;
    }
    
    console.log("Creating status chart");
    
    // Clear previous chart
    container.innerHTML = '';
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    try {
      // Group leads by status
      const statusCounts = {
        "new": 0,
        "contacted": 0,
        "in-progress": 0,
        "closed-won": 0,
        "closed-lost": 0
      };
  
      // Access allLeads from the global context
      const leads = window.allLeads || [];
      
      // Count leads in each status
      leads.forEach(lead => {
        const status = lead.status || "new";
        statusCounts[status]++;
      });
  
      // Prepare data for chart
      const data = {
        labels: [
          'New', 
          'Contacted', 
          'In Progress', 
          'Won', 
          'Lost'
        ],
        datasets: [{
          data: [
            statusCounts["new"],
            statusCounts["contacted"],
            statusCounts["in-progress"],
            statusCounts["closed-won"],
            statusCounts["closed-lost"]
          ],
          backgroundColor: [
            '#4361ee',   // New - Blue
            '#f8961e',   // Contacted - Orange
            '#f9dc5c',   // In Progress - Yellow
            '#4caf50',   // Closed Won - Light Blue
            '#f72585'    // Closed Lost - Pink
          ]
          ,borderWidth: 0
        }]
      };
  
      // Create the chart only if there are leads
      if (leads.length > 0) {
        const chart = new Chart(ctx, {
          type: 'pie',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: 10
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                  font: {
                    size: getResponsiveFontSize(container)
                  },
                  boxWidth: getResponsiveFontSize(container)
                }
              }
            }
          }
        });
        console.log("Status chart created successfully");
      } else {
        container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
      }
    } catch (error) {
      console.error("Error creating status chart:", error);
      container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
    }
  }
  
  // CHART 2: New Projects vs Closed Won Projects Over Time (Line Chart)
  function updateNewProjectsChart() {
    const container = document.getElementById('newProjectsChart');
    if (!container) {
      console.log("New projects chart container not found");
      return;
    }
    
    console.log("Creating new projects chart");
    
    // Clear previous chart
    container.innerHTML = '';
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    try {
      // Access allLeads from the global context
      const leads = window.allLeads || [];
      
      // Group leads by month
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      // Initialize monthly counts for the entire year
      const monthlyNewLeadCounts = new Array(12).fill(0);
      const monthlyClosedWonLeadCounts = new Array(12).fill(0);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      // Process leads for the current year
      leads.forEach(lead => {
        if (!lead.createdAt) return;
        
        const leadDate = new Date(lead.createdAt);
        
        // Only count leads from the current year
        if (leadDate.getFullYear() === currentYear) {
          const monthIndex = leadDate.getMonth();
          monthlyNewLeadCounts[monthIndex]++;
          
          // Check if lead is closed won
          if (lead.status === 'closed-won') {
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
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: monthNames,
            datasets: [
              {
                label: 'New',
                data: monthlyNewLeadCounts,
                backgroundColor: '#4361ee40',
                borderColor: '#4361ee',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Won',
                data: monthlyClosedWonLeadCounts,
                backgroundColor: '#2e7d3240',
                borderColor: '#4caf50',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: 10
            },
            plugins: {
              legend: {
                labels: {
                  color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                  font: {
                    size: getResponsiveFontSize(container)
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                  font: {
                    size: getResponsiveFontSize(container)
                  }
                }
              },
              x: {
                ticks: {
                  color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                  font: {
                    size: getResponsiveFontSize(container)
                  },
                  autoSkip: false
                }
              }
            }
          }
        });
        console.log("New projects chart created successfully");
      } else {
        container.innerHTML = '<div class="chart-no-data">No projects to display</div>';
      }
    } catch (error) {
      console.error("Error creating new projects chart:", error);
      container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
    }
  }
  
  // CHART 3: Revenue by Month Comparison (Bar Chart)
  function updateRevenueComparisonChart() {
    const container = document.getElementById('revenueComparisonChart');
    if (!container) {
      console.log("Revenue chart container not found");
      return;
    }
    
    console.log("Creating revenue chart");
    
    // Clear previous chart
    container.innerHTML = '';
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    try {
      // Access payments from the global context
      const payments = window.payments || [];
      
      // Group payments by month for current and previous year
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const previousYear = currentYear - 1;
      
      // Initialize monthly totals
      const currentYearMonthlyTotals = new Array(12).fill(0);
      const previousYearMonthlyTotals = new Array(12).fill(0);
      
      // Process payments for current and previous year
      payments.forEach(payment => {
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
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: monthNames,
            datasets: [
            {
                    label: `${previousYear}`,
                    data: previousYearMonthlyTotals,
                    backgroundColor: '#4361ee'
            },
              {
                label: `${currentYear}`,
                data: currentYearMonthlyTotals,
                backgroundColor: '#4caf50'
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: 10
            },
            plugins: {
              legend: {
                labels: {
                  color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                  font: {
                    size: getResponsiveFontSize(container)
                  },
                  boxWidth: getResponsiveFontSize(container),
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString();
                  },
                  color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                  font: {
                    size: getResponsiveFontSize(container)
                  }
                }
              },
              x: {
                ticks: {
                  color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                  font: {
                    size: getResponsiveFontSize(container)
                  },
                  autoSkip: false
                }
              }
            }
          }
        });
        console.log("Revenue chart created successfully");
      } else {
        container.innerHTML = '<div class="chart-no-data">No revenue data to display</div>';
      }
    } catch (error) {
      console.error("Error creating revenue chart:", error);
      container.innerHTML = '<div class="chart-no-data">Error creating chart</div>';
    }
  }
  
  // Make the initialization function globally accessible
  window.initializeCharts = initializeCharts;