// Main entry point for dashboard functionality

// Import all modules
import * as API from "./api.js";
import * as UI from "./ui.js";
import * as Utils from "./utils.js";
import * as Handlers from "./handlers.js";
import * as Payments from "./payments.js";

// Function declarations
// These functions are specific to dashboard.js and not moved to other modules

// Global variables
let allLeads = [];
let payments = [];
let defaultCurrency = "USD"; // Store the default currency
let globalSettings = {}; // global settings cache

// Set theme on HTML element
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// Initialize everything when the document is ready
document.addEventListener("DOMContentLoaded", async function () {
  // Make setTheme available globally for settings.js to use
  window.setTheme = setTheme;

  // Global switchView function for dashboard.js
  window.switchView = function (view) {
    console.log("Global switchView called with:", view);

    // Get the view containers directly
    const leadCards = document.getElementById("leadCards");
    const leadsTable = document.getElementById("leadsTable");

    if (!leadCards || !leadsTable) {
      console.error("View containers not found!", {
        leadCards: leadCards,
        leadsTable: leadsTable,
      });
      return;
    }

    // Get the toggle buttons
    const gridViewBtn = document.getElementById("gridViewBtn");
    const listViewBtn = document.getElementById("listViewBtn");

    if (!gridViewBtn || !listViewBtn) {
      console.error("View toggle buttons not found!", {
        gridViewBtn: gridViewBtn,
        listViewBtn: listViewBtn,
      });
      return;
    }

    // Ensure UI is available (assuming it's imported globally)
    if (typeof UI === "undefined") {
      console.error("UI module not found");
      return;
    }

    // Call UI's switchView to handle view toggling
    UI.switchView(view);

    // Re-render leads in the new view if allLeads is available
    if (allLeads && allLeads.length > 0) {
      UI.renderLeads(allLeads);
    }
  };

  // Theme initialization
  try {
    // Fetch all settings including theme
    const settings = await API.fetchAllSettings();
    globalSettings = settings;

    // Always use theme from server settings (should always exist now)
    if (settings.theme) {
      setTheme(settings.theme);
    } else {
      // If somehow server doesn't have theme, use system preference and save it
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
      await API.updateSetting("theme", systemTheme);
    }
  } catch (error) {
    console.error("Error initializing theme:", error);
    // Fallback to localStorage or system preference
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(savedTheme);
  }

  // Setup the sidebar toggle
  setupSidebarToggle();

  // Fetch leads on page load
  fetchLeadsAndRender();

  // Dashboard UI event listeners
  document
    .getElementById("addLeadBtn")
    .addEventListener("click", Handlers.openAddLeadModal);
  document
    .getElementById("closeModal")
    .addEventListener("click", closeLeadModal);

  // Updated lead form submission handler
  document
    .getElementById("leadForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // Validate and save the lead
      Handlers.validateAndSaveLead(event);

      // After save, update the action buttons and set back to read-only
      const leadId = document.getElementById("leadId").value;
      if (leadId) {
        // Show the action buttons again
        const actionsContainer = document.getElementById("modalActions");
        if (actionsContainer) {
          actionsContainer.style.display = "block";
        }

        // Set modal back to read-only mode
        UI.setModalReadOnly(true);

        // Update modal title
        document.getElementById("modalTitle").textContent = "Client Info";
      }
    });

  document.getElementById("searchInput").addEventListener("input", searchLeads);
  document
    .getElementById("filterStatus")
    .addEventListener("change", filterLeads);
  document.getElementById("sortField").addEventListener("change", sortLeads);
  document.getElementById("sortOrder").addEventListener("change", sortLeads);

  // Debug output for view elements
  console.log("View elements:", {
    leadCards: document.getElementById("leadCards"),
    leadsTable: document.getElementById("leadsTable"),
    leadsTableBody: document.getElementById("leadsTableBody"),
    gridViewBtn: document.getElementById("gridViewBtn"),
    listViewBtn: document.getElementById("listViewBtn"),
  });

  document.getElementById("gridViewBtn").addEventListener("click", function () {
    console.log("Grid view button clicked");
    window.switchView("grid");
  });

  document.getElementById("listViewBtn").addEventListener("click", function () {
    console.log("List view button clicked");
    window.switchView("list");
  });

  // Form conditionals
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  if (hasWebsiteSelect) {
    hasWebsiteSelect.addEventListener("change", function () {
      const websiteAddressField =
        document.getElementById("websiteAddress").parentNode;
      websiteAddressField.style.display =
        this.value === "yes" ? "block" : "none";
    });
  }

  // Currency formatting for budget input
  const totalBudgetInput = document.getElementById("totalBudget");
  if (totalBudgetInput) {
    totalBudgetInput.addEventListener("blur", function (e) {
      if (this.value) {
        // Format number with 2 decimal places
        const value = parseFloat(this.value.replace(/[^\d.-]/g, ""));
        if (!isNaN(value)) {
          const currency = document.getElementById("budgetCurrency").value;
          this.value = Utils.formatCurrency(value, currency);
        }
      }
    });
  }

  // Payment related listeners
  const paymentForm = document.getElementById("paymentForm");
  if (paymentForm) {
    // Remove existing event listeners (if any) by cloning and replacing
    const newPaymentForm = paymentForm.cloneNode(true);
    paymentForm.parentNode.replaceChild(newPaymentForm, paymentForm);

    // Add fresh event listener
    newPaymentForm.addEventListener("submit", function (event) {
      event.preventDefault();
      Payments.validateAndSavePayment(event);
      return false;
    });
  }

  // Close payment modal button
  const closePaymentModalBtn = document.getElementById("closePaymentModal");
  if (closePaymentModalBtn) {
    const newCloseBtn = closePaymentModalBtn.cloneNode(true);
    closePaymentModalBtn.parentNode.replaceChild(
      newCloseBtn,
      closePaymentModalBtn
    );

    newCloseBtn.addEventListener("click", function (event) {
      event.preventDefault();
      Payments.closePaymentModal();
      return false;
    });
  }

  // Add payment button
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    const newBtn = addPaymentBtn.cloneNode(true);
    addPaymentBtn.parentNode.replaceChild(newBtn, addPaymentBtn);

    newBtn.addEventListener("click", function () {
      const leadId = document.getElementById("leadId").value;
      if (leadId) {
        Payments.openPaymentModal(leadId);
      } else {
        Utils.showToast("Please save the lead first before adding payments");
      }
    });
  }

  // Setup form validation
  Handlers.setupFormValidation();

  // Add mutation observer to handle modal state changes
  const modalObserver = new MutationObserver(function (mutations) {
    const leadId = document.getElementById("leadId").value;
    if (!leadId) return;

    // Check if we're in edit mode
    const submitButton = document.querySelector(
      '#leadForm button[type="submit"]'
    );
    const isEditMode = submitButton && submitButton.style.display !== "none";

    if (isEditMode) {
      // We're in edit mode, make sure payments show action buttons
      const paymentItems = document.querySelectorAll(".payment-item");
      let needsRefresh = false;

      // Check if any payment items are missing action buttons
      paymentItems.forEach((item) => {
        if (
          item.textContent !== "No payments found" &&
          !item.querySelector(".payment-actions")
        ) {
          needsRefresh = true;
        }
      });

      // If we need to refresh the payments display
      if (needsRefresh) {
        API.fetchLeadPayments(leadId).then((payments) => {
          Payments.renderLeadPayments(payments, leadId);
        });
      }
    }
  });

  // Observe the lead modal for changes
  const leadModal = document.getElementById("leadModal");
  if (leadModal) {
    modalObserver.observe(leadModal, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  // Event listeners for lead updates
  window.addEventListener("leadSaved", function (event) {
    const { lead, isNew } = event.detail;

    // Update allLeads array
    if (isNew) {
      allLeads.push(lead);
    } else {
      const index = allLeads.findIndex((l) => l._id === lead._id);
      if (index !== -1) {
        allLeads[index] = lead;
      }
    }

    // Re-render and update stats
    UI.renderLeads(allLeads);
    UI.calculateStats(allLeads, payments);
  });

  window.addEventListener("leadDeleted", function (event) {
    const { leadId } = event.detail;

    // Remove lead from array
    allLeads = allLeads.filter((lead) => lead._id !== leadId);

    // Re-render and update stats
    UI.renderLeads(allLeads);
    UI.calculateStats(allLeads, payments);
  });

  window.addEventListener("paymentsUpdated", async function () {
    // Refresh all payments data
    try {
      payments = await API.fetchPayments();
      UI.calculateStats(allLeads, payments);
    } catch (error) {
      console.error("Error updating payments:", error);
    }
  });

  // Expose necessary functions to window object for HTML access
  window.openLeadModal = (leadId) => Handlers.openLeadModal(leadId, allLeads);
  window.closeLeadModal = closeLeadModal;
  window.deleteLeadAction = Handlers.deleteLeadAction;
  window.updateModalActionButtons = UI.updateModalActionButtons;
  window.fetchLeadPayments = API.fetchLeadPayments;
  window.renderLeadPayments = Payments.renderLeadPayments;

  // Set up the combined sort dropdown
  const combinedSort = document.getElementById("combinedSort");
  if (combinedSort) {
    // Check if the element exists
    const sortField = document.getElementById("sortField");
    const sortOrder = document.getElementById("sortOrder");

    // Event listener to update hidden dropdowns when the combined dropdown changes
    combinedSort.addEventListener("change", function () {
      // Get the selected value which has format "field-order"
      const [field, order] = this.value.split("-");

      // Update the hidden dropdowns
      sortField.value = field;
      sortOrder.value = order;

      // Trigger change events to make the main JS apply the sorting
      sortField.dispatchEvent(new Event("change"));
      sortOrder.dispatchEvent(new Event("change"));
    });

    // Initialize with the default value
    combinedSort.dispatchEvent(new Event("change"));
  }
});

/**
 * Set up sidebar toggle functionality
 */
function setupSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  // Set initial state based on saved preference
  const isSidebarCollapsed =
    localStorage.getItem("sidebarCollapsed") === "true";

  // Apply initial classes
  if (isSidebarCollapsed) {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("expanded");
  } else {
    sidebar.classList.remove("collapsed");
    mainContent.classList.remove("expanded");
  }

  // Remove any existing toggle button to avoid duplicates
  const existingButton = document.querySelector(".sidebar-toggle");
  if (existingButton) {
    existingButton.remove();
  }

  // Create new toggle button with both icons
  const toggleButton = document.createElement("button");
  toggleButton.className = "sidebar-toggle";
  toggleButton.setAttribute("aria-label", "Toggle Sidebar");

  // Include both icons - CSS will handle which one is visible
  toggleButton.innerHTML =
    '<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i>';

  // Add the button to the sidebar
  sidebar.appendChild(toggleButton);

  // Add click event to toggle button
  toggleButton.addEventListener("click", function () {
    // Toggle sidebar classes
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");

    // Store user preference
    localStorage.setItem(
      "sidebarCollapsed",
      sidebar.classList.contains("collapsed")
    );
  });
}

/**
 * Fetch leads from API and render them
 */
async function fetchLeadsAndRender() {
  try {
    // Fetch leads
    allLeads = await API.fetchLeads();

    // Render leads
    UI.renderLeads(allLeads);

    // Fetch payments
    payments = await API.fetchPayments();

    // Calculate and update stats
    UI.calculateStats(allLeads, payments);
  } catch (error) {
    console.error("Error in fetchLeadsAndRender:", error);

    // Display error message in UI
    const leadCardsElement = document.getElementById("leadCards");
    if (leadCardsElement) {
      leadCardsElement.innerHTML = `<div class="lead-card"><p>Error loading leads: ${error.message}</p></div>`;
    }

    // Set default values for statistics
    Utils.safeSetTextContent("totalLeadsValue", "0");
    Utils.safeSetTextContent("newLeadsValue", "0");
    Utils.safeSetTextContent("conversionRateValue", "0%");
    Utils.safeSetTextContent(
      "monthlyPaymentsValue",
      Utils.formatCurrency(0, "USD")
    );

    // Set all change indicators to 0%
    Utils.safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
    Utils.safeUpdateChangeIndicator("newLeadsChange", 0, "");
    Utils.safeUpdateChangeIndicator("conversionChange", 0, "month");
    Utils.safeUpdateChangeIndicator("paymentsChange", 0, "month");

    Utils.showToast("Error fetching leads: " + error.message);
  }
}

/**
 * Close the lead modal and reset form
 */
function closeLeadModal() {
  document.getElementById("leadModal").style.display = "none";

  // Reset the form completely
  document.getElementById("leadForm").reset();

  // Clear hidden fields too
  document.getElementById("leadId").value = "";

  // Reset readonly attributes
  const formElements = document.querySelectorAll(
    "#leadForm input, #leadForm select, #leadForm textarea"
  );
  formElements.forEach((element) => {
    element.removeAttribute("readonly");
    if (element.tagName === "SELECT") {
      element.removeAttribute("disabled");
    }
    element.classList.remove("invalid");
  });

  // Clear error messages
  document.querySelectorAll(".error-message").forEach((el) => {
    el.style.display = "none";
  });

  // Clear any payment fields that weren't part of the original form
  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField && remainingBalanceField.parentNode) {
    remainingBalanceField.value = "";
  }

  // Show the submit button again
  const submitButton = document.querySelector(
    '#leadForm button[type="submit"]'
  );
  if (submitButton) {
    submitButton.style.display = "block";
  }

  // Remove the modal actions container
  const modalActions = document.getElementById("modalActions");
  if (modalActions) {
    modalActions.remove();
  }
}

/**
 * Search leads based on input
 */
function searchLeads() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  let filteredLeads = allLeads;

  if (searchTerm) {
    filteredLeads = allLeads.filter((lead) => {
      // Search in multiple fields
      const nameMatch = Utils.getLeadName(lead)
        .toLowerCase()
        .includes(searchTerm);
      const emailMatch =
        lead.email && lead.email.toLowerCase().includes(searchTerm);
      const phoneMatch =
        lead.phone && lead.phone.toLowerCase().includes(searchTerm);
      const businessMatch =
        lead.businessName &&
        lead.businessName.toLowerCase().includes(searchTerm);
      const businessEmailMatch =
        lead.businessEmail &&
        lead.businessEmail.toLowerCase().includes(searchTerm);
      const businessPhoneMatch =
        lead.businessPhone &&
        lead.businessPhone.toLowerCase().includes(searchTerm);
      const textNumberMatch =
        lead.textNumber && lead.textNumber.toLowerCase().includes(searchTerm);
      const messageMatch =
        lead.message && lead.message.toLowerCase().includes(searchTerm);
      const websiteMatch =
        lead.websiteAddress &&
        lead.websiteAddress.toLowerCase().includes(searchTerm);
      const notesMatch =
        lead.notes && lead.notes.toLowerCase().includes(searchTerm);

      return (
        nameMatch ||
        emailMatch ||
        phoneMatch ||
        businessMatch ||
        businessEmailMatch ||
        businessPhoneMatch ||
        textNumberMatch ||
        messageMatch ||
        notesMatch ||
        websiteMatch
      );
    });
  }

  filterByStatus(filteredLeads);
}

/**
 * Filter leads by status
 */
function filterLeads() {
  filterByStatus(allLeads);
}

/**
 * Filter leads by status
 * @param {Array} leadsArray - Array of leads to filter
 */
function filterByStatus(leadsArray) {
  const filterStatus = document.getElementById("filterStatus").value;

  let filteredLeads = leadsArray;

  if (filterStatus) {
    // Make case-insensitive comparison and handle multiple status formats
    filteredLeads = filteredLeads.filter((lead) => {
      const leadStatus = (lead.status || "").toLowerCase();
      return (
        leadStatus === filterStatus.toLowerCase() ||
        leadStatus.includes(filterStatus.toLowerCase())
      );
    });
  }

  // Sort the filtered results
  sortLeadsAndRender(filteredLeads);
}

/**
 * Sort leads based on sort field and order
 */
function sortLeads() {
  sortLeadsAndRender(allLeads);
}

/**
 * Sort leads and render them
 * @param {Array} leadsToSort - Array of leads to sort
 */
function sortLeadsAndRender(leadsToSort) {
  const sortField = document.getElementById("sortField").value;
  const sortOrder = document.getElementById("sortOrder").value;

  // If no leads to sort, return
  if (!leadsToSort || leadsToSort.length === 0) {
    UI.renderLeads([]);
    return;
  }

  // Create a copy of the array to avoid modifying the original
  const sortedLeads = [...leadsToSort];

  // Sort the leads array
  sortedLeads.sort((a, b) => {
    let comparison = 0;

    // Handle different field types
    if (sortField === "createdAt") {
      // Handle missing dates
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      comparison = dateA - dateB;
    } else if (sortField === "lastContactedAt") {
      // Special handling for lastContactedAt
      const hasContactA = !!a.lastContactedAt;
      const hasContactB = !!b.lastContactedAt;

      if (hasContactA !== hasContactB) {
        // One has contact date and the other doesn't
        if (sortOrder === "asc") {
          // For ASC (oldest first): N/A entries first
          return hasContactA ? 1 : -1; // false (-1) comes before true (1)
        } else {
          // For DESC (newest first): entries with dates first
          return hasContactA ? -1 : 1; // true (-1) comes before false (1)
        }
      } else if (hasContactA && hasContactB) {
        // Both have contact dates, compare normally
        const dateA = new Date(a.lastContactedAt);
        const dateB = new Date(b.lastContactedAt);
        comparison = dateA - dateB;

        // For DESC (newest first): reverse the comparison
        if (sortOrder === "desc") {
          comparison = -comparison; // This will make newer dates come first
        }
      } else {
        // Both don't have contact dates - they're equal
        comparison = 0;
      }
    } else if (sortField === "firstName") {
      // Sort by last name first, then first name
      const lastNameA = (a.lastName || "").toLowerCase();
      const lastNameB = (b.lastName || "").toLowerCase();

      // If last names are different, sort by last name
      if (lastNameA !== lastNameB) {
        comparison = lastNameA.localeCompare(lastNameB);
      } else {
        // If last names are the same, sort by first name
        const firstNameA = (a.firstName || "").toLowerCase();
        const firstNameB = (b.firstName || "").toLowerCase();
        comparison = firstNameA.localeCompare(firstNameB);
      }
    } else if (sortField === "businessName") {
      // Special handling for business name - prioritize leads with business names
      const businessA = a.businessName || "";
      const businessB = b.businessName || "";

      // If one has a business name and the other doesn't, prioritize the one with a name
      if (businessA && !businessB) {
        return -1; // A has business, B doesn't - A comes first
      } else if (!businessA && businessB) {
        return 1; // B has business, A doesn't - B comes first
      } else {
        // Both have business names or both don't, compare normally
        comparison = businessA
          .toLowerCase()
          .localeCompare(businessB.toLowerCase());
      }
    } else if (sortField === "businessEmail") {
      // Special handling for business email - prioritize leads with business emails
      const emailA = a.businessEmail || "";
      const emailB = b.businessEmail || "";

      // If one has a business email and the other doesn't, prioritize the one with an email
      if (emailA && !emailB) {
        return -1; // A has email, B doesn't - A comes first
      } else if (!emailA && emailB) {
        return 1; // B has email, A doesn't - B comes first
      } else {
        // Both have business emails or both don't, compare normally
        comparison = emailA.toLowerCase().localeCompare(emailB.toLowerCase());
      }
    } else if (sortField === "totalBudget") {
      // Special handling for billed amount - N/A values go to the end
      const valueA =
        a.totalBudget !== undefined && a.totalBudget !== null
          ? parseFloat(a.totalBudget)
          : null;
      const valueB =
        b.totalBudget !== undefined && b.totalBudget !== null
          ? parseFloat(b.totalBudget)
          : null;

      // Handle N/A cases (null values)
      if (valueA === null && valueB === null) {
        comparison = 0; // Both N/A, consider equal
      } else if (valueA === null) {
        return 1; // A is N/A, B has value, A goes to end
      } else if (valueB === null) {
        return -1; // B is N/A, A has value, B goes to end
      } else {
        // Both have values, compare normally
        comparison = valueA - valueB;
      }
    } else if (sortField === "remainingBalance") {
      // Special handling for remaining balance - N/A values go to the end
      const valueA =
        a.remainingBalance !== undefined && a.remainingBalance !== null
          ? parseFloat(a.remainingBalance)
          : null;
      const valueB =
        b.remainingBalance !== undefined && b.remainingBalance !== null
          ? parseFloat(b.remainingBalance)
          : null;

      // Handle N/A cases (null values)
      if (valueA === null && valueB === null) {
        comparison = 0; // Both N/A, consider equal
      } else if (valueA === null) {
        return 1; // A is N/A, B has value, A goes to end
      } else if (valueB === null) {
        return -1; // B is N/A, A has value, B goes to end
      } else {
        // Both have values, compare normally
        comparison = valueA - valueB;
      }
    } else if (sortField === "status") {
      // Custom status order: new, contacted, in-progress, closed-won, closed-lost
      const statusOrder = {
        new: 1,
        contacted: 2,
        "in-progress": 3,
        "closed-won": 4,
        "closed-lost": 5,
      };

      const statusA = a.status ? a.status.toLowerCase() : "new";
      const statusB = b.status ? b.status.toLowerCase() : "new";

      const orderA = statusOrder[statusA] || 999;
      const orderB = statusOrder[statusB] || 999;

      comparison = orderA - orderB;
    } else {
      // For other fields, do a basic comparison
      const valueA = a[sortField] || "";
      const valueB = b[sortField] || "";

      if (typeof valueA === "string" && typeof valueB === "string") {
        comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
      } else {
        if (valueA < valueB) comparison = -1;
        if (valueA > valueB) comparison = 1;
      }
    }

    // Apply sort order (ascending or descending) for normal comparisons
    // For lastContactedAt we've already handled the orders specially
    if (sortField === "lastContactedAt") {
      return comparison;
    } else {
      return sortOrder === "asc" ? comparison : -comparison;
    }
  });

  // Render the sorted results
  UI.renderLeads(sortedLeads);
}
