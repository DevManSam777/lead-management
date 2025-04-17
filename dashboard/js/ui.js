import {
  formatCurrency,
  formatDate,
  getLeadName,
  capitalizeFirstLetter,
  safeSetTextContent,
} from "./utils.js";

export {
  renderLeads,
  renderGridView,
  renderListView,
  switchView,
  updateModalActionButtons,
  setModalReadOnly,
  calculateStats,
};

// Global variable to track current view
let currentView = "grid"; // 'grid' or 'list'

/**
 * Render leads based on current view
 * @param {Array} leads - Array of lead objects
 */
function renderLeads(leads) {
  if (currentView === "grid") {
    renderGridView(leads);
  } else {
    renderListView(leads);
  }
}

/**
 * Render grid view of leads
 * @param {Array} leads - Array of lead objects
 */
function renderGridView(leads) {
  const leadCards = document.getElementById("leadCards");
  if (!leadCards) {
    console.error("Lead cards container not found");
    return;
  }

  leadCards.innerHTML = "";

  if (!leads || leads.length === 0) {
    leadCards.innerHTML = '<div class="lead-card"><p>No leads found</p></div>';
    return;
  }

  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  leads.forEach((lead) => {
    const card = document.createElement("div");
    card.className = "lead-card clickable";
    card.dataset.leadId = lead._id;

    // Handle name display
    const fullName = getLeadName(lead);

   
    const businessName = lead.businessName || (lead.firstName + " " + lead.lastName);

    // Format last contacted date if available
    let lastContactedText = "";
    if (lead.lastContactedAt) {
      const contactDate = new Date(lead.lastContactedAt);
      lastContactedText = `<p><strong>Last Contact:</strong> ${formatDate(
        contactDate,
        dateFormat
      )}</p>`;
    }

    card.innerHTML = `
      <h3>${fullName}</h3>
      <p><strong>Business:</strong> ${businessName}</p>
      ${lastContactedText}
      <p><strong>Status:</strong> <span class="lead-status status-${(
        lead.status || "new"
      ).toLowerCase()}">${capitalizeFirstLetter(
      lead.status || "new"
    )}</span></p>
    `;

    // Add click event to the entire card
    card.addEventListener("click", function () {
      // Using window.openLeadModal as the function will be defined in dashboard.js
      window.openLeadModal(lead._id);
    });

    leadCards.appendChild(card);
  });
}

/**
 * Render list view of leads
 * @param {Array} leads - Array of lead objects
 */
function renderListView(leads) {
  const leadsTableBody = document.getElementById("leadsTableBody");
  if (!leadsTableBody) {
    console.error("Leads table body not found");
    return;
  }

  leadsTableBody.innerHTML = "";

  if (!leads || leads.length === 0) {
    leadsTableBody.innerHTML = '<tr><td colspan="4">No leads found</td></tr>';
    return;
  }

  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  leads.forEach((lead) => {
    const row = document.createElement("tr");
    row.className = "clickable";
    row.dataset.leadId = lead._id;

    // Handle name display
    const fullName = getLeadName(lead);

    // Determine business info and handle empty values
    const business = lead.businessName || (lead.firstName + " " + lead.lastName);

    // Format last contacted date if available
    let lastContactCell = "<td>Not contacted</td>";
    if (lead.lastContactedAt) {
      const contactDate = new Date(lead.lastContactedAt);
      lastContactCell = `<td>${formatDate(contactDate, dateFormat)}</td>`;
    }

    row.innerHTML = `
      <td><span title="${fullName}">${fullName}</span></td>
      <td><span title="${business}">${business}</span></td>
      ${lastContactCell}
      <td><span class="lead-status status-${(
        lead.status || "new"
      ).toLowerCase()}">${capitalizeFirstLetter(
      lead.status || "new"
    )}</span></td>
    `;

    // Add click event to the row
    row.addEventListener("click", function () {
      // Using window.openLeadModal as the function will be defined in dashboard.js
      window.openLeadModal(lead._id);
    });

    leadsTableBody.appendChild(row);
  });
}

/**
 * Switch between grid and list views
 * @param {string} view - 'grid' or 'list'
 */
function switchView(view) {
  currentView = view;

  // Save the current view to localStorage
  localStorage.setItem("preferredView", view);

  if (view === "grid") {
    document.getElementById("leadCards").style.display = "grid";
    document.getElementById("leadsTable").style.display = "none";
    document.getElementById("gridViewBtn").classList.add("active");
    document.getElementById("listViewBtn").classList.remove("active");
  } else {
    document.getElementById("leadCards").style.display = "none";
    document.getElementById("leadsTable").style.display = "table";
    document.getElementById("gridViewBtn").classList.remove("active");
    document.getElementById("listViewBtn").classList.add("active");
  }
}

function updateModalActionButtons(leadId) {
  // Check if modal actions container exists, create if not
  let actionsContainer = document.getElementById("modalActions");
  if (!actionsContainer) {
    actionsContainer = document.createElement("div");
    actionsContainer.id = "modalActions";
    actionsContainer.className = "modal-actions";

    // Find a good place to insert it (after the modal header)
    const modalHeader = document.querySelector(".modal-header");
    if (modalHeader) {
      modalHeader.insertAdjacentElement("afterend", actionsContainer);
    }
  }

  // Get the modal element
  const modal = document.getElementById("leadModal");
  
  // Set the initial mode to read-only
  if (modal) {
    modal.classList.add("lead-modal-readonly");
    modal.classList.remove("lead-modal-edit");
  }

  // Clear existing buttons
  actionsContainer.innerHTML = "";

  // Create Edit button
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "btn btn-primary";
  editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
  editButton.addEventListener("click", function () {
    // Toggle modal classes for CSS targeting
    if (modal) {
      modal.classList.remove("lead-modal-readonly");
      modal.classList.add("lead-modal-edit");
    }
    
    // Set to edit mode
    setModalReadOnly(false);
    document.getElementById("modalTitle").textContent = "Edit";
    
    // Hide the action buttons when in edit mode
    actionsContainer.style.display = "none";

    // Fetch and re-render payments to show action buttons
    const leadId = document.getElementById("leadId").value;
    if (leadId) {
      // These functions will be globally available from dashboard.js
      window.fetchLeadPayments(leadId).then((leadPayments) => {
        window.renderLeadPayments(leadPayments, leadId);
      });
      
      // Reload lead forms to ensure they have action buttons
      if (typeof window.loadLeadForms === 'function') {
        window.loadLeadForms(leadId);
      }
    }
  });

  // Create Delete button
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-danger";
  deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
  deleteButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete this?")) {
      // This function will be globally available from dashboard.js
      window.deleteLeadAction(leadId);
    }
  });

  // Add buttons to container
  actionsContainer.appendChild(editButton);
  actionsContainer.appendChild(deleteButton);
}

function setModalReadOnly(isReadOnly) {
  const formElements = document.querySelectorAll(
    "#leadForm input, #leadForm select, #leadForm textarea"
  );

  formElements.forEach((element) => {
    if (isReadOnly) {
      element.setAttribute("readonly", true);
      if (element.tagName === "SELECT") {
        element.setAttribute("disabled", true);
      }
    } else {
      element.removeAttribute("readonly");
      if (element.tagName === "SELECT") {
        element.removeAttribute("disabled");
      }
    }
  });

  // Always keep these fields read-only
  const paidAmountField = document.getElementById("paidAmount");
  if (paidAmountField) {
    paidAmountField.setAttribute("readonly", true);
  }

  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.setAttribute("readonly", true);
  }

  // Show/hide the form submission button based on mode
  const submitButton = document.querySelector(
    '#leadForm button[type="submit"]'
  );
  if (submitButton) {
    submitButton.style.display = isReadOnly ? "none" : "block";
  }

  // Show/hide Add Payment button based on mode
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    addPaymentBtn.style.display = isReadOnly ? "none" : "block";
  }

  // Show/hide Add Form button based on mode
  const addFormBtn = document.getElementById("addFormBtn");
  if (addFormBtn) {
    addFormBtn.style.display = isReadOnly ? "none" : "block";
  }
  
  // Show/hide form action buttons (view, edit, delete)
  const formActions = document.querySelectorAll(".form-actions");
  formActions.forEach(actionButtons => {
    actionButtons.style.display = isReadOnly ? "none" : "flex";
  });
  
  // Hide/show payment action buttons
  const paymentActions = document.querySelectorAll(".payment-actions");
  paymentActions.forEach(actionButtons => {
    actionButtons.style.display = isReadOnly ? "none" : "flex";
  });
  
  // Update document UI elements based on mode
  if (typeof window.updateDocumentUiForMode === 'function') {
    window.updateDocumentUiForMode();
  }
}

function calculateStats(allLeads, payments) {
  try {
    // Debug info
    console.log("Calculating stats with:", {
      leadsCount: allLeads ? allLeads.length : 0,
      paymentsCount: payments ? payments.length : 0
    });
    
    // If no leads, display zeros and return
    if (!allLeads || allLeads.length === 0) {
      safeSetTextContent("totalLeadsValue", "0");
      safeSetTextContent("newLeadsValue", "0");
      safeSetTextContent("conversionRateValue", "0%");
      safeSetTextContent("monthlyPaymentsValue", formatCurrency(0, "USD"));
      safeSetTextContent("totalEarningsValue", formatCurrency(0, "USD"));
      return;
    }

    // Get current date and calculate previous periods
    const currentDate = new Date();
    
    // Current month: 1st of current month to today
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Previous month: 1st of previous month to last day of previous month
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    // For consistent comparison, set all dates to noon
    currentDate.setHours(12, 0, 0, 0);
    currentMonthStart.setHours(12, 0, 0, 0);
    previousMonthStart.setHours(12, 0, 0, 0);
    previousMonthEnd.setHours(12, 0, 0, 0);

    // Debug date ranges
    console.log("Date ranges:", {
      currentDate: currentDate.toISOString(),
      currentMonthStart: currentMonthStart.toISOString(),
      previousMonthStart: previousMonthStart.toISOString(),
      previousMonthEnd: previousMonthEnd.toISOString()
    });

    // New Leads Calculation
    const currentMonthNewLeads = allLeads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      leadDate.setHours(12, 0, 0, 0);
      return leadDate >= currentMonthStart && leadDate <= currentDate;
    });

    const previousMonthNewLeads = allLeads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      leadDate.setHours(12, 0, 0, 0);
      return leadDate >= previousMonthStart && leadDate <= previousMonthEnd;
    });

    // Display new leads count
    safeSetTextContent("newLeadsValue", currentMonthNewLeads.length);

    // Calculate percentage change for new leads
    let newLeadsChange = 0;
    if (previousMonthNewLeads.length > 0) {
      newLeadsChange = ((currentMonthNewLeads.length - previousMonthNewLeads.length) / 
                        previousMonthNewLeads.length) * 100;
    } else if (currentMonthNewLeads.length > 0) {
      newLeadsChange = 100; // If no leads last month but some this month, that's a 100% increase
    }

    // Update new leads change display
    const newLeadsChangeSpan = document.querySelector('#newLeadsValue + .change span');
    if (newLeadsChangeSpan) {
      if (newLeadsChange > 0) {
        newLeadsChangeSpan.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(newLeadsChange).toFixed(1)}% from last month`;
        newLeadsChangeSpan.closest('.change').className = "change positive";
      } else if (newLeadsChange < 0) {
        newLeadsChangeSpan.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(newLeadsChange).toFixed(1)}% from last month`;
        newLeadsChangeSpan.closest('.change').className = "change negative";
      } else {
        newLeadsChangeSpan.innerHTML = `<i class="fas fa-minus"></i> 0.0% from last month`;
        newLeadsChangeSpan.closest('.change').className = "change";
      }
    }

    // Total Projects (All-Time)
    safeSetTextContent("totalLeadsValue", allLeads.length);

    // Handle payments calculation
    if (!payments || !Array.isArray(payments)) {
      console.error("Invalid payments array:", payments);
      payments = [];
    }

    // Create a set of valid lead IDs for faster lookups
    const validLeadIds = new Set(allLeads.map(lead => lead._id));
    
    // Only process payments for existing leads
    const validPayments = payments.filter(payment => {
      return payment && payment.leadId && validLeadIds.has(payment.leadId);
    });

    console.log("Valid payments count:", validPayments.length);

    // Current month payments
    const currentMonthPayments = validPayments.filter(payment => {
      if (!payment.paymentDate) return false;
      const paymentDate = new Date(payment.paymentDate);
      paymentDate.setHours(12, 0, 0, 0);
      return paymentDate >= currentMonthStart && paymentDate <= currentDate;
    });

    // Previous month payments
    const previousMonthPayments = validPayments.filter(payment => {
      if (!payment.paymentDate) return false;
      const paymentDate = new Date(payment.paymentDate);
      paymentDate.setHours(12, 0, 0, 0);
      return paymentDate >= previousMonthStart && paymentDate <= previousMonthEnd;
    });

    // Calculate totals
    const currentMonthTotal = currentMonthPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const previousMonthTotal = previousMonthPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Update monthly payments display
    safeSetTextContent(
      "monthlyPaymentsValue",
      formatCurrency(currentMonthTotal)
    );

    // Calculate percentage change for payments
    let paymentsChange = 0;
    if (previousMonthTotal > 0) {
      paymentsChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      paymentsChange = 100; // If no payments last month but some this month, that's a 100% increase
    }

    // Update payments change display
    const paymentsChangeSpan = document.querySelector('#monthlyPaymentsValue + .change span');
    if (paymentsChangeSpan) {
      if (paymentsChange > 0) {
        paymentsChangeSpan.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(paymentsChange).toFixed(1)}% from last month`;
        paymentsChangeSpan.closest('.change').className = "change positive";
      } else if (paymentsChange < 0) {
        paymentsChangeSpan.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(paymentsChange).toFixed(1)}% from last month`;
        paymentsChangeSpan.closest('.change').className = "change negative";
      } else {
        paymentsChangeSpan.innerHTML = `<i class="fas fa-minus"></i> 0.0% from last month`;
        paymentsChangeSpan.closest('.change').className = "change";
      }
    }

    // Total Earnings Calculation (All-Time)
    const totalEarnings = validPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Display total earnings
    safeSetTextContent(
      "totalEarningsValue",
      formatCurrency(totalEarnings)
    );

    // Conversion Rate Calculation
    const closedWonLeads = allLeads.filter(lead => 
      lead.status && 
      (lead.status.toLowerCase() === 'closed-won' || lead.status.toLowerCase() === 'won')
    );

    const conversionRate = allLeads.length > 0 
      ? Math.round((closedWonLeads.length / allLeads.length) * 100) 
      : 0;

    safeSetTextContent("conversionRateValue", `${conversionRate}%`);
    
    // Print detailed debug information
    console.log("Stats calculation completed:", {
      newLeads: {
        current: currentMonthNewLeads.length,
        previous: previousMonthNewLeads.length,
        change: newLeadsChange
      },
      payments: {
        current: {
          count: currentMonthPayments.length,
          total: currentMonthTotal
        },
        previous: {
          count: previousMonthPayments.length,
          total: previousMonthTotal
        },
        change: paymentsChange
      },
      totalEarnings: totalEarnings,
      conversionRate: conversionRate
    });
  } catch (error) {
    console.error("Error calculating statistics:", error, error.stack);
    
    // Set default values in case of error
    safeSetTextContent("totalLeadsValue", "0");
    safeSetTextContent("newLeadsValue", "0");
    safeSetTextContent("conversionRateValue", "0%");
    safeSetTextContent("monthlyPaymentsValue", formatCurrency(0, "USD"));
    safeSetTextContent("totalEarningsValue", formatCurrency(0, "USD"));
  }
}