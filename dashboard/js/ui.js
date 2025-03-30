// ui.js - UI rendering and display functions

import { formatCurrency, formatDate, getLeadName, capitalizeFirstLetter, safeSetTextContent, safeUpdateChangeIndicator } from './utils.js';

// Export UI functions
export {
  renderLeads,
  renderGridView,
  renderListView,
  switchView,
  updateModalActionButtons,
  setModalReadOnly,
  calculateStats
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

    // Display business information with N/A as default
    const businessName = lead.businessName || "N/A";

    // Format last contacted date if available
    let lastContactedText = "";
    if (lead.lastContactedAt) {
      const contactDate = new Date(lead.lastContactedAt);
      lastContactedText = `<p><strong>Last Contact:</strong> ${formatDate(contactDate, dateFormat)}</p>`;
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
    const business = lead.businessName || "N/A";
    
    // Format last contacted date if available
    let lastContactCell = '<td>Not contacted</td>';
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
// function switchView(view) {
//   currentView = view;

//   if (view === "grid") {
//     document.getElementById("leadCards").style.display = "grid";
//     document.getElementById("leadsTable").style.display = "none";
//     document.getElementById("gridViewBtn").classList.add("active");
//     document.getElementById("listViewBtn").classList.remove("active");
//   } else {
//     document.getElementById("leadCards").style.display = "none";
//     document.getElementById("leadsTable").style.display = "table";
//     document.getElementById("gridViewBtn").classList.remove("active");
//     document.getElementById("listViewBtn").classList.add("active");
//   }
// }

function switchView(view) {
  currentView = view;
  
  // Save the current view to localStorage
  localStorage.setItem('preferredView', view);

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

/**
 * Update the modal action buttons (Edit, Delete)
 * @param {string} leadId - ID of the lead
 */
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

  // Clear existing buttons
  actionsContainer.innerHTML = "";

  // Create Edit button
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "btn btn-primary";
  editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
  editButton.addEventListener("click", function () {
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
    }
  });

  // Create Delete button
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-danger";
  deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
  deleteButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete this lead?")) {
      // This function will be globally available from dashboard.js
      window.deleteLeadAction(leadId);
    }
  });

  // Add buttons to container
  actionsContainer.appendChild(editButton);
  actionsContainer.appendChild(deleteButton);
}

/**
 * Set the modal to read-only or editable mode
 * @param {boolean} isReadOnly - Whether the modal should be read-only
 */
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
}

/**
 * Calculate dashboard statistics
 * @param {Array} allLeads - Array of all leads
 * @param {Array} payments - Array of all payments
 */
function calculateStats(allLeads, payments) {
  try {
    // Get current date format
    const dateFormat = window.dateFormat || "MM/DD/YYYY";
    
    // If no leads, display zeros and return
    if (!allLeads || allLeads.length === 0) {
      safeSetTextContent("totalLeadsValue", "0");
      safeSetTextContent("newLeadsValue", "0");
      safeSetTextContent("conversionRateValue", "0%");
      safeSetTextContent("monthlyPaymentsValue", formatCurrency(0, "USD"));

      // Set all change indicators to 0%
      safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
      safeUpdateChangeIndicator("newLeadsChange", 0, "");
      safeUpdateChangeIndicator("conversionChange", 0, "month");
      safeUpdateChangeIndicator("paymentsChange", 0, "month");
      return;
    }

    // Get current date and calculate previous periods
    const currentDate = new Date();

    // Create date objects for previous periods
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    const twoMonthsAgo = new Date(currentDate);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    // For consistent comparison, set all dates to the same time (noon)
    currentDate.setHours(12, 0, 0, 0);
    oneMonthAgo.setHours(12, 0, 0, 0);
    twoMonthsAgo.setHours(12, 0, 0, 0);

    // Calculate total leads
    const totalLeads = allLeads.length;
    safeSetTextContent("totalLeadsValue", totalLeads);

    // Calculate leads from last month
    const lastMonthLeads = allLeads.filter((lead) => {
      if (!lead || !lead.createdAt) return false;
      try {
        const leadDate = new Date(lead.createdAt);
        leadDate.setHours(12, 0, 0, 0); // Set to noon for consistent comparison
        return (
          !isNaN(leadDate.getTime()) &&
          leadDate >= oneMonthAgo &&
          leadDate <= currentDate
        );
      } catch (e) {
        console.error("Error parsing lead date:", e);
        return false;
      }
    }).length;

    // Calculate leads from two months ago
    const twoMonthsAgoLeads = allLeads.filter((lead) => {
      if (!lead || !lead.createdAt) return false;
      try {
        const leadDate = new Date(lead.createdAt);
        leadDate.setHours(12, 0, 0, 0); // Set to noon for consistent comparison
        return (
          !isNaN(leadDate.getTime()) &&
          leadDate >= twoMonthsAgo &&
          leadDate <= oneMonthAgo
        );
      } catch (e) {
        console.error("Error parsing lead date:", e);
        return false;
      }
    }).length;

    // Calculate percentage change for total leads
    let totalLeadsChange = 0;
    if (twoMonthsAgoLeads > 0) {
      totalLeadsChange =
        ((lastMonthLeads - twoMonthsAgoLeads) / twoMonthsAgoLeads) * 100;
    }

    // Update total leads change display
    safeUpdateChangeIndicator("totalLeadsChange", totalLeadsChange, "month");

    // For new leads, just show the current month's leads - no week comparison
    const newLeads = lastMonthLeads; // Using monthly data instead of weekly
    safeSetTextContent("newLeadsValue", newLeads);

    // Use the same month-over-month change for new leads too
    const newLeadsChange = totalLeadsChange; // Same change as total leads

    // Update new leads change display (without period text)
    safeUpdateChangeIndicator("newLeadsChange", newLeadsChange, "");

    // Calculate conversion rate (won leads / total leads)
    const wonLeads = allLeads.filter((lead) => {
      if (!lead || !lead.status) return false;
      const status = lead.status.toLowerCase();
      return status === "closed-won" || status === "converted";
    }).length;

    const conversionRate =
      totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
    safeSetTextContent("conversionRateValue", `${conversionRate}%`);

    // Set a placeholder for conversion rate change (would need historical data)
    safeUpdateChangeIndicator("conversionChange", 0, "month");

    // Payment metrics
    // Calculate total payments for current month
    let currentMonthPayments = 0;
    let previousMonthPayments = 0;
    let mostCommonCurrency = "USD";

    if (payments && payments.length > 0) {
      // Find most common currency
      const currencies = {};
      payments.forEach((payment) => {
        const currency = payment.currency || "USD";
        currencies[currency] = (currencies[currency] || 0) + 1;
      });

      let maxCount = 0;
      for (const [currency, count] of Object.entries(currencies)) {
        if (count > maxCount) {
          mostCommonCurrency = currency;
          maxCount = count;
        }
      }

      // Create a set of valid lead IDs for faster lookup
      const validLeadIds = new Set(allLeads.map((lead) => lead._id));

      // Calculate current month's total payments - ONLY for existing leads
      currentMonthPayments = payments
        .filter((payment) => {
          if (!payment.paymentDate) {
            console.log("Payment has no date:", payment._id);
            return false;
          }

          // Check if this payment belongs to a lead that still exists
          if (!validLeadIds.has(payment.leadId)) {
            return false;
          }

          // Create a date object
          const paymentDate = new Date(payment.paymentDate);
          paymentDate.setHours(12, 0, 0, 0); // Set to noon for consistent comparison

          // Check if payment is in current month range
          const isInCurrentMonth =
            paymentDate >= oneMonthAgo && paymentDate <= currentDate;

          return isInCurrentMonth;
        })
        .reduce((total, payment) => {
          if (
            payment.currency === mostCommonCurrency ||
            (!payment.currency && mostCommonCurrency === "USD")
          ) {
            return total + (payment.amount || 0);
          }
          return total;
        }, 0);

      // Calculate previous month's total payments - ONLY for existing leads
      previousMonthPayments = payments
        .filter((payment) => {
          if (!payment.paymentDate) return false;

          // Check if this payment belongs to a lead that still exists
          if (!validLeadIds.has(payment.leadId)) {
            return false;
          }

          // Create a date object
          const paymentDate = new Date(payment.paymentDate);
          paymentDate.setHours(12, 0, 0, 0); // Set to noon for consistent comparison

          // Check if payment is in previous month range
          return paymentDate >= twoMonthsAgo && paymentDate < oneMonthAgo;
        })
        .reduce((total, payment) => {
          if (
            payment.currency === mostCommonCurrency ||
            (!payment.currency && mostCommonCurrency === "USD")
          ) {
            return total + (payment.amount || 0);
          }
          return total;
        }, 0);
    }

    // Update monthly payments display
    safeSetTextContent(
      "monthlyPaymentsValue",
      formatCurrency(currentMonthPayments, mostCommonCurrency)
    );

    // Calculate percentage change for payments
    let paymentsChange = 0;
    if (previousMonthPayments > 0) {
      paymentsChange =
        ((currentMonthPayments - previousMonthPayments) /
          previousMonthPayments) *
        100;
    }

    // Update payments change display
    safeUpdateChangeIndicator("paymentsChange", paymentsChange, "month");
  } catch (error) {
    console.error("Error calculating statistics:", error);
    // Set default values in case of error
    safeSetTextContent("totalLeadsValue", "0");
    safeSetTextContent("newLeadsValue", "0");
    safeSetTextContent("conversionRateValue", "0%");
    safeSetTextContent("monthlyPaymentsValue", formatCurrency(0, "USD"));

    // Set all change indicators to 0%
    safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
    safeUpdateChangeIndicator("newLeadsChange", 0, "");
    safeUpdateChangeIndicator("conversionChange", 0, "month");
    safeUpdateChangeIndicator("paymentsChange", 0, "month");
  }
}