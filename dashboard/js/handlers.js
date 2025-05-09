import {
  showInputError,
  clearInputError,
  getErrorElement,
  formatCurrency,
  showToast,
  formatDate,
  formatPhoneInput,
  initializeMonetaryInputs,
} from "./utils.js";
import {
  createLead,
  updateLead,
  deleteLead,
  fetchLeadPayments,
} from "./api.js";
import { setModalReadOnly } from "./ui.js";
import { renderLeadPayments } from "./payments.js";
import { loadLeadForms } from "./leadForms.js";

// Function to handle textarea auto-resize
function handleTextareaResize() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
}

/**
 * Setup form validation for the lead form
 */
function setupFormValidation() {
  // Validation for email fields
  const emailFields = ["email", "businessEmail"];
  emailFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener("blur", function () {
        // Only validate businessEmail if it has a value
        if (fieldId === "businessEmail" && !this.value) {
          clearInputError(this, getErrorElement(this));
          return true;
        }
        validateEmail(this);
      });
    }
  });

  // Validation for phone fields
  const phoneFields = ["phone", "businessPhone", "textNumber"];
  phoneFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener("blur", function () {
        // Only validate optional phone fields if they have a value
        if (
          (fieldId === "businessPhone" || fieldId === "textNumber") &&
          !this.value
        ) {
          clearInputError(this, getErrorElement(this));
          return true;
        }
        validatePhone(this);
      });
    }
  });

  // Validation for names
  const nameFields = ["firstName", "lastName"];
  nameFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener("blur", function () {
        validateName(
          this,
          fieldId === "firstName" ? "First name" : "Last name"
        );
      });
    }
  });

  // Validation for website address
  const websiteInput = document.getElementById("websiteAddress");
  if (websiteInput) {
    websiteInput.addEventListener("blur", function () {
      // Only validate if hasWebsite is 'yes' and field has value
      const hasWebsite = document.getElementById("hasWebsite").value;
      if (hasWebsite === "yes" && this.value) {
        validateUrl(this);
      } else {
        clearInputError(this, getErrorElement(this));
      }
    });
  }

  // Validation for total budget
  const totalBudgetInput = document.getElementById("totalBudget");
  if (totalBudgetInput) {
    totalBudgetInput.addEventListener("blur", function () {
      if (this.value) {
        validateBudget(this);
      } else {
        clearInputError(this, getErrorElement(this));
      }
    });
  }

  // Add event listener for the Create Form button
  const addFormBtn = document.getElementById("addFormBtn");
  if (addFormBtn) {
    addFormBtn.addEventListener("click", function () {
      const leadId = document.getElementById("leadId").value;
      if (leadId) {
        window.openFormTemplateModal(leadId);
      } else {
        showToast("Please save the lead first before creating forms");
      }
    });
  }

  // Setup address fields change listeners for map link
  setupAddressMapListeners();
}

function setupAddressMapListeners() {
  const addressFields = [
    "billingStreet",
    "billingAptUnit",
    "billingCity",
    "billingState",
    "billingZipCode",
  ];

  addressFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("change", addAddressMapButton);
    }
  });
}

function addAddressMapButton() {
  // Get address elements
  const street = document.getElementById("billingStreet").value || "";
  const aptUnit = document.getElementById("billingAptUnit").value || "";
  const city = document.getElementById("billingCity").value || "";
  const state = document.getElementById("billingState").value || "";
  const zipCode = document.getElementById("billingZipCode").value || "";

  // Create the full address (include apt/unit if it exists)
  let fullAddress = street;
  if (aptUnit) fullAddress += ` ${aptUnit}`;
  if (city) fullAddress += `, ${city}`;
  if (state) fullAddress += `, ${state}`;
  if (zipCode) fullAddress += ` ${zipCode}`;

  // Only create the map link if we have a minimally valid address (street and city)
  if (street && city) {
    // Find or create the container for the map link
    let mapLinkContainer = document.getElementById("addressMapLink");
    if (!mapLinkContainer) {
      // Create container if it doesn't exist
      const addressSection = document.querySelector(
        "#address-tab .form-section"
      );
      if (!addressSection) return;

      mapLinkContainer = document.createElement("div");
      mapLinkContainer.id = "addressMapLink";
      mapLinkContainer.className = "address-map-link";
      mapLinkContainer.style.marginTop = "1rem";
      mapLinkContainer.style.textAlign = "right";

      addressSection.appendChild(mapLinkContainer);
    }

    // Create the map link
    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(
      fullAddress
    )}`;
    mapLinkContainer.innerHTML = `
  <a href="${mapUrl}" target="_blank" class="btn btn-outline map-button">
    <i class="fas fa-map-marker-alt"></i><span class="map-text">View on Google Maps</span>
  </a>
`;
  }
}

/**
 * Email validation
 * @param {HTMLElement} input - The email input element
 * @returns {boolean} Validation result
 */
function validateEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errorElement = getErrorElement(input);
  const isRequired = input.id === "email"; // Only main email is required

  if (isRequired && !input.value) {
    return showInputError(input, errorElement, "Email is required");
  } else if (input.value && !emailRegex.test(input.value)) {
    return showInputError(
      input,
      errorElement,
      "Please enter a valid email address"
    );
  } else {
    return clearInputError(input, errorElement);
  }
}

/**
 * Phone validation
 * @param {HTMLElement} input - The phone input element
 * @returns {boolean} Validation result
 */
function validatePhone(input) {
  // Allow formats like: 123-456-7890
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  const errorElement = getErrorElement(input);
  const isRequired = input.id === "phone"; // Only main phone is required

  if (isRequired && !input.value) {
    return showInputError(input, errorElement, "Phone number is required");
  } else if (input.value && !phoneRegex.test(input.value)) {
    return showInputError(
      input,
      errorElement,
      "Please enter a valid 10-digit phone number in format: 000-000-0000"
    );
  } else {
    return clearInputError(input, errorElement);
  }
}

/**
 * Name validation with configurable minimum length
 * @param {HTMLElement} input - The name input element
 * @param {string} fieldName - Display name of the field
 * @param {number} minLength - Minimum length required (defaults to 1)
 * @returns {boolean} Validation result
 */
function validateName(input, fieldName, minLength = 1) {
  const errorElement = getErrorElement(input);

  if (!input.value) {
    return showInputError(input, errorElement, `${fieldName} is required`);
  } else if (input.value.length < minLength) {
    return showInputError(
      input,
      errorElement,
      `${fieldName} must be at least ${minLength} character${
        minLength !== 1 ? "s" : ""
      }`
    );
  } else if (input.value.length > 50) {
    return showInputError(
      input,
      errorElement,
      `${fieldName} must be less than 50 characters`
    );
  } else {
    return clearInputError(input, errorElement);
  }
}

function validateUrl(input) {
  const errorElement = getErrorElement(input);

  // Allow empty values if not required
  if (!input.value) {
    clearInputError(input, errorElement);
    return true;
  }

  // Test URL with http:// prefix if not already there
  let testUrl = input.value;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = "http://" + testUrl;
  }

  try {
    // Try to create a URL object to validate
    new URL(testUrl);
    return clearInputError(input, errorElement);
  } catch (e) {
    return showInputError(
      input,
      errorElement,
      "Please enter a valid website address"
    );
  }
}

/**
 * Budget validation
 * @param {HTMLElement} input - The budget input element
 * @returns {boolean} Validation result
 */
function validateBudget(input) {
  const errorElement = getErrorElement(input);
  const value = parseFloat(input.value.replace(/[^\d.-]/g, ""));

  if (input.value && isNaN(value)) {
    return showInputError(input, errorElement, "Please enter a valid amount");
  } else if (value < 0) {
    return showInputError(input, errorElement, "Budget cannot be negative");
  } else {
    return clearInputError(input, errorElement);
  }
}

/**
 * Validate and save lead
 * @param {Event} event - Form submission event
 */
async function validateAndSaveLead(event) {
  event.preventDefault();

  // Set the submission flag to prevent duplicates
  window.leadSubmissionInProgress = true;

  // Validate required fields
  const isEmailValid = validateEmail(document.getElementById("email"));
  const isPhoneValid = validatePhone(document.getElementById("phone"));

  // Modified name validation to allow single characters
  const isFirstNameValid = validateName(
    document.getElementById("firstName"),
    "First name",
    1 // Minimum length changed to 1
  );
  const isLastNameValid = validateName(
    document.getElementById("lastName"),
    "Last name",
    1 // Minimum length changed to 1
  );

  // Validate optional fields that have values
  let isBusinessEmailValid = true;
  const businessEmailInput = document.getElementById("businessEmail");
  if (businessEmailInput && businessEmailInput.value) {
    isBusinessEmailValid = validateEmail(businessEmailInput);
  }

  let isBusinessPhoneValid = true;
  const businessPhoneInput = document.getElementById("businessPhone");
  if (businessPhoneInput && businessPhoneInput.value) {
    isBusinessPhoneValid = validatePhone(businessPhoneInput);
  }

  let isTextNumberValid = true;
  const textNumberInput = document.getElementById("textNumber");
  if (textNumberInput && textNumberInput.value) {
    isTextNumberValid = validatePhone(textNumberInput);
  }

  let isWebsiteValid = true;
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  const websiteAddressInput = document.getElementById("websiteAddress");
  if (
    hasWebsiteSelect &&
    hasWebsiteSelect.value === "yes" &&
    websiteAddressInput &&
    websiteAddressInput.value
  ) {
    isWebsiteValid = validateUrl(websiteAddressInput);
  }

  let isBudgetValid = true;
  const budgetInput = document.getElementById("budget");
  if (budgetInput && budgetInput.value) {
    isBudgetValid = validateBudget(budgetInput);
  }

  let isTotalBudgetValid = true;
  const totalBudgetInput = document.getElementById("totalBudget");
  if (totalBudgetInput && totalBudgetInput.value) {
    isTotalBudgetValid = validateBudget(totalBudgetInput);
  }

  // If all validations pass, save the lead
  if (
    isEmailValid &&
    isPhoneValid &&
    isFirstNameValid &&
    isLastNameValid &&
    isBusinessEmailValid &&
    isBusinessPhoneValid &&
    isTextNumberValid &&
    isWebsiteValid &&
    isBudgetValid &&
    isTotalBudgetValid
  ) {
    try {
      await saveLead();
      return true; // Return success
    } catch (error) {
      console.error("Error in validateAndSaveLead:", error);
      window.leadSubmissionInProgress = false; // Reset flag on error
      throw error; // Propagate the error
    }
  } else {
    // Validation failed
    window.leadSubmissionInProgress = false; // Reset flag
    return false;
  }
}

/**
 * Save lead data to the server
 */
async function saveLead() {
  const leadId = document.getElementById("leadId").value;
  // Track if this is a new lead or an edit of existing lead
  let isNewLead = !leadId;

  // Get form data based on schema
  const leadData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    phoneExt: document.getElementById("phoneExt").value || undefined,
    textNumber: document.getElementById("textNumber").value || undefined,
    businessName:
      document.getElementById("businessName").value ||
      firstName.value + " " + lastName.value,
    businessPhone: document.getElementById("businessPhone").value || undefined,
    businessPhoneExt:
      document.getElementById("businessPhoneExt").value || undefined,
    businessEmail: document.getElementById("businessEmail").value || undefined,
    businessServices:
      document.getElementById("businessServices").value || undefined,
    preferredContact:
      document.getElementById("preferredContact").value || undefined,
    serviceDesired:
      document.getElementById("serviceDesired").value || undefined,
    hasWebsite: document.getElementById("hasWebsite").value || undefined,
    // Important: Allow message and notes to be empty strings
    message: document.getElementById("message").value,
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value,
    // Explicitly set this to false to ensure dashboard creations don't trigger emails
    isFormSubmission: false,

    // Add billing address fields
    billingAddress: {
      street: document.getElementById("billingStreet").value || "",
      aptUnit: document.getElementById("billingAptUnit").value || "",
      city: document.getElementById("billingCity").value || "",
      state: document.getElementById("billingState").value || "",
      zipCode: document.getElementById("billingZipCode").value || "",
      country: document.getElementById("billingCountry").value || "",
    },
  };

  // Process website address - add http:// if needed
  if (document.getElementById("websiteAddress").value) {
    const websiteUrl = document.getElementById("websiteAddress").value.trim();

    // Add http:// prefix if it doesn't have a protocol
    if (!/^https?:\/\//i.test(websiteUrl)) {
      leadData.websiteAddress = "http://" + websiteUrl;
    } else {
      leadData.websiteAddress = websiteUrl;
    }
  } else {
    leadData.websiteAddress = undefined;
  }

  // Add last contacted date if present
  const lastContactedInput = document.getElementById("lastContactedAt");
  if (lastContactedInput && lastContactedInput.value) {
    // Create a date at noon to avoid timezone issues
    const dateValue = lastContactedInput.value; // "YYYY-MM-DD" format
    const [year, month, day] = dateValue
      .split("-")
      .map((num) => parseInt(num, 10));

    // Create a date object with specific year, month, day at noon local time
    // Month is 0-indexed in JavaScript dates, so subtract 1
    const date = new Date(year, month - 1, day, 12, 0, 0);

    leadData.lastContactedAt = date;
  }

  // Handle estimated budget (what customer expects to spend)
  const budgetInput = document.getElementById("budget");
  if (budgetInput && budgetInput.value) {
    // Extract numeric value from formatted budget
    const cleanBudgetValue = budgetInput.value.replace(/[^\d.-]/g, "");
    const numericBudgetValue = parseFloat(cleanBudgetValue);

    if (!isNaN(numericBudgetValue)) {
      // Store the budget value as a number
      leadData.budget = numericBudgetValue;
    }
  }

  // Handle billed amount/total budget (what you're charging)
  const totalBudgetInput = document.getElementById("totalBudget");
  if (totalBudgetInput && totalBudgetInput.value) {
    // Extract numeric value from formatted total budget
    const cleanTotalValue = totalBudgetInput.value.replace(/[^\d.-]/g, "");
    const numericTotalValue = parseFloat(cleanTotalValue);

    if (!isNaN(numericTotalValue)) {
      // Store the total budget value as a number
      leadData.totalBudget = numericTotalValue;
    }
  }

  try {
    let updatedLead;

    if (leadId) {
      // Update existing lead
      updatedLead = await updateLead(leadId, leadData);
    } else {
      // Create new lead
      updatedLead = await createLead(leadData);
    }

    // Signal that a lead was saved - will be caught in dashboard.js
    window.dispatchEvent(
      new CustomEvent("leadSaved", {
        detail: { lead: updatedLead, isNew: isNewLead },
      })
    );

    // Show success message
    showToast(leadId ? "Lead updated successfully" : "Lead added successfully");

    // Close the modal
    window.closeLeadModal();

    // explicitly reload to update charts
    // window.location.reload();
  } catch (error) {
    console.error("Error saving lead:", error);
    showToast("Error: " + error.message);
  }
}

// TRUE causes first tab to be active when modal opens
function initializeModalTabs(forceFirstTab = true) {
  const tabs = document.querySelectorAll(".modal-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  // Add click event to each tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Get the tab name from data-tab attribute
      const tabName = this.getAttribute("data-tab");

      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to current tab and corresponding content
      this.classList.add("active");
      document.getElementById(`${tabName}-tab`).classList.add("active");

      // Refresh textarea heights after tab switch
      setTimeout(refreshTextareaHeights, 10);
    });
  });

  // Just activate the first tab by default
  if (
    tabs.length > 0 &&
    (forceFirstTab || !document.querySelector(".modal-tab.active"))
  ) {
    tabs[0].click();
  } else {
    // If not forcing first tab but tabs exist, refresh textarea heights anyway
    setTimeout(refreshTextareaHeights, 10);
  }
}

/**
 * Highlight specific tab programmatically
 * Useful when you want to direct users to a specific tab
 * @param {string} tabName - Name of tab to activate (e.g., 'finance', 'notes')
 */
function activateTab(tabName) {
  const targetTab = document.querySelector(`.modal-tab[data-tab="${tabName}"]`);
  if (targetTab) {
    targetTab.click();
  }
}

/**
 * Handle form validation across tabs
 * Call this before form submission
 * @returns {boolean} Whether all required fields across all tabs are valid
 */
function validateAllTabs() {
  // Get all required fields
  const requiredFields = document.querySelectorAll("#leadForm [required]");
  let isValid = true;
  let firstInvalidTab = null;

  // Check each required field
  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      isValid = false;

      // Find which tab contains this field
      const tabContent = field.closest(".tab-content");
      if (tabContent && !firstInvalidTab) {
        const tabId = tabContent.id;
        const tabName = tabId.replace("-tab", "");
        firstInvalidTab = tabName;
      }

      // Add invalid styling
      field.classList.add("invalid");
    } else {
      field.classList.remove("invalid");
    }
  });

  // If validation fails, switch to the first tab with invalid fields
  if (!isValid && firstInvalidTab) {
    activateTab(firstInvalidTab);
  }

  return isValid;
}

async function deleteLeadAction(leadId) {
  try {
    // Close the modal first to avoid UI issues
    window.closeLeadModal();

    // Delete the lead
    await deleteLead(leadId);

    // Signal that a lead was deleted - will be caught in dashboard.js
    window.dispatchEvent(
      new CustomEvent("leadDeleted", {
        detail: { leadId },
      })
    );

    // CRITICAL: Directly update the data watcher to force chart updates
    if (typeof window.updateDataWatcher === "function") {
      console.log("Explicitly updating data watcher after lead deletion");
      window.updateDataWatcher();
    }

    // Also try direct update if watcher fails
    if (typeof window.updateAllCharts === "function") {
      console.log("Directly calling updateAllCharts for backup");
      window.updateAllCharts();
    }

    // Show success toast
    showToast("Project deleted successfully");
  } catch (error) {
    console.error("Error deleting lead:", error);
    showToast("Error: " + error.message);
  }
}

function openAddLeadModal() {
  const leadForm = document.getElementById("leadForm");
  leadForm.reset();

  // Clear the lead ID to ensure we're creating a new lead
  document.getElementById("leadId").value = "";
  document.getElementById("modalTitle").textContent = "Add New";

  // Reset date inputs
  const lastContactedInput = document.getElementById("lastContactedAt");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");
  if (lastContactedInput) {
    lastContactedInput.value = ""; // Clear the date input
  }
  if (lastContactedDisplay) {
    lastContactedDisplay.textContent = ""; // Clear the display
  }

  // Reset the created at display to today's date
  const createdAtDisplay = document.getElementById("createdAtDisplay");
  if (createdAtDisplay) {
    const today = new Date();
    const dateFormat = window.dateFormat || "MM/DD/YYYY";
    createdAtDisplay.textContent = formatDate(today, dateFormat);
  }

  // Thoroughly clear forms list
  const leadFormsList = document.getElementById("leadFormsList");
  if (leadFormsList) {
    leadFormsList.innerHTML = "";
  }

  // Thoroughly clear payments list
  const paymentsContainer = document.querySelector(".payments-container");
  if (paymentsContainer) {
    paymentsContainer.innerHTML = "";
  }

  // Hide website address field initially
  const websiteAddressField =
    document.getElementById("websiteAddress").parentNode;
  websiteAddressField.style.display = "none";

  // Make sure form elements are editable
  const formElements = document.querySelectorAll(
    "#leadForm input, #leadForm select, #leadForm textarea"
  );
  formElements.forEach((element) => {
    element.removeAttribute("readonly");
    if (element.tagName === "SELECT") {
      element.removeAttribute("disabled");
    }
  });

  // Clear any error messages
  document.querySelectorAll(".error-message").forEach((el) => {
    el.style.display = "none";
  });

  // Show submit button
  document.querySelector('#leadForm button[type="submit"]').style.display =
    "block";

  // Ensure Add Payment button is visible
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    addPaymentBtn.style.display = "none";
  }

  // Set Paid Amount and Remaining Balance to readonly with zero value
  const paidAmountField = document.getElementById("paidAmount");
  if (paidAmountField) {
    paidAmountField.value = formatCurrency(0);
    paidAmountField.setAttribute("readonly", true);
  }

  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.value = formatCurrency(0);
    remainingBalanceField.setAttribute("readonly", true);
  }

  // Display the modal first so elements are in the DOM
  document.getElementById("leadModal").style.display = "block";

  // Then setup the auto-resize for textareas
  const textareas = document.querySelectorAll("#leadModal textarea");
  textareas.forEach((textarea) => {
    // Set initial height based on content
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    // Make sure we don't add duplicate listeners
    textarea.removeEventListener("input", handleTextareaResize);
    textarea.addEventListener("input", handleTextareaResize);
  });

  // Initialize any monetary inputs in the modal
  initializeMonetaryInputs();

  initializeModalTabs(true);

  // Hide create form since we are making a new lead
  const addFormBtn = document.getElementById("addFormBtn");
  if (addFormBtn) {
    addFormBtn.style.display = "none";
  }
  // Hide upload pdf since we are making a new lead
  const docUploadArea = document.querySelector(".document-upload-area");
  if (docUploadArea) {
    docUploadArea.style.display = "none";
  }
}

function formatWebsiteUrl(url) {
  if (!url) return "";

  // Check if URL already has a protocol prefix
  if (!/^https?:\/\//i.test(url)) {
    // Add http:// prefix if missing
    return "http://" + url;
  }

  return url;
}

/**
 * Open the lead modal to view/edit a lead
 * @param {string} leadId - ID of the lead to open
 */
async function openLeadModal(leadId, allLeads) {
  // Reset form first
  document.getElementById("leadForm").reset();

  const lead = allLeads.find((l) => l._id === leadId);
  if (!lead) {
    showToast("Lead not found");
    return;
  }

  // Set modal to read-only mode initially
  setModalReadOnly(true);

  // Store the current lead ID in the modal
  document.getElementById("leadId").value = lead._id;

  // Fill the form with lead data
  document.getElementById("firstName").value = lead.firstName || "";
  document.getElementById("lastName").value = lead.lastName || "";
  document.getElementById("email").value = lead.email || "";
  document.getElementById("phone").value = lead.phone || "";
  document.getElementById("phoneExt").value = lead.phoneExt || "";
  document.getElementById("textNumber").value = lead.textNumber || "";
  document.getElementById("businessPhone").value = lead.businessPhone || "";
  document.getElementById("businessPhoneExt").value =
    lead.businessPhoneExt || "";
  document.getElementById("businessName").value = lead.businessName || "";
  document.getElementById("businessEmail").value = lead.businessEmail || "";
  document.getElementById("businessServices").value =
    lead.businessServices || "";
  const billingAddress = lead.billingAddress || {};
  document.getElementById("billingStreet").value = billingAddress.street || "";
  document.getElementById("billingAptUnit").value =
    billingAddress.aptUnit || "";
  document.getElementById("billingCity").value = billingAddress.city || "";
  document.getElementById("billingState").value = billingAddress.state || "";
  document.getElementById("billingZipCode").value =
    billingAddress.zipCode || "";
  document.getElementById("billingCountry").value =
    billingAddress.country || "";
  document.getElementById("preferredContact").value =
    lead.preferredContact || "";
  document.getElementById("serviceDesired").value = lead.serviceDesired || "";
  document.getElementById("hasWebsite").value = lead.hasWebsite || "";
  document.getElementById("websiteAddress").value = lead.websiteAddress || "";

  // Add clickable website link
  if (lead.websiteAddress) {
    // Create a container to hold the link
    const websiteField = document.getElementById("websiteAddress");
    const parentDiv = websiteField.parentNode;

    // Remove any existing link container
    const existingLink = parentDiv.querySelector(".website-link-container");
    if (existingLink) {
      parentDiv.removeChild(existingLink);
    }

    // Create new link container
    const linkContainer = document.createElement("div");
    linkContainer.className = "website-link-container";

    // Format the URL with http:// if needed
    const formattedUrl = formatWebsiteUrl(lead.websiteAddress);

    // Create the link
    linkContainer.innerHTML = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="website-link">
        <i class="fas fa-external-link-alt"></i> Visit Website
      </a>`;

    // Add the link below the input field
    parentDiv.appendChild(linkContainer);
  }

  // Add the map button
  setTimeout(addAddressMapButton, 100);

  document.getElementById("message").value = lead.message || "";
  document.getElementById("status").value = lead.status || "new";
  document.getElementById("notes").value = lead.notes || "";

  // Handle estimated budget field
  if (document.getElementById("budget")) {
    const budgetValue =
      lead.budget !== undefined ? parseFloat(lead.budget) : "";
    document.getElementById("budget").value = budgetValue
      ? formatCurrency(budgetValue)
      : "";
  }

  // Handle payment fields
  if (document.getElementById("totalBudget")) {
    const totalBudgetValue =
      lead.totalBudget !== undefined ? parseFloat(lead.totalBudget) : "";
    document.getElementById("totalBudget").value = totalBudgetValue
      ? formatCurrency(totalBudgetValue)
      : "";
  }

  if (document.getElementById("paidAmount")) {
    const paidAmount = lead.paidAmount ? parseFloat(lead.paidAmount) : 0;
    document.getElementById("paidAmount").value = formatCurrency(paidAmount);
  }

  // Calculate remaining balance
  let remainingBalance = 0;
  if (lead.totalBudget !== undefined) {
    const totalBudget = parseFloat(lead.totalBudget) || 0;
    const paidAmount = parseFloat(lead.paidAmount) || 0;
    remainingBalance = totalBudget - paidAmount;
  }

  // Find or create the remaining balance field
  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.value = formatCurrency(remainingBalance);
  }

  // Set lead creation date
  const createdAtDisplay = document.getElementById("createdAtDisplay");
  if (createdAtDisplay && lead.createdAt) {
    const createdDate = new Date(lead.createdAt);
    const dateFormat = window.dateFormat || "MM/DD/YYYY";
    const formattedDate = formatDate(createdDate, dateFormat);
    createdAtDisplay.textContent = `${formattedDate}`;
  }

  try {
    // Fetch and display payments for this lead
    const leadPayments = await fetchLeadPayments(lead._id);
    renderLeadPayments(leadPayments, lead._id);

    // Load forms for this lead
    loadLeadForms(lead._id);

    // Load documents for this lead
    loadLeadDocuments(lead._id);
    initDocumentUpload(lead._id);
  } catch (error) {
    console.error("Error fetching data:", error);
    const paymentsContainer = document.querySelector(".payments-container");
    if (paymentsContainer) {
      paymentsContainer.innerHTML =
        '<p class="payment-item">Error loading payments</p>';
    }
  }

  // Handle date formatting for last contacted date
  updateLeadModalDates(lead);

  // Show/hide website address field based on hasWebsite value
  const websiteAddressField =
    document.getElementById("websiteAddress").parentNode;
  websiteAddressField.style.display =
    lead.hasWebsite === "yes" ? "block" : "none";

  // Update modal title
  document.getElementById("modalTitle").textContent = "Client Info";

  // First, check if the action buttons container exists and remove it
  const existingActions = document.getElementById("modalActions");
  if (existingActions) {
    existingActions.remove();
  }

  // Format the phone numbers in the modal
  const phoneFields = document.querySelectorAll('#leadModal input[type="tel"]');
  phoneFields.forEach((field) => {
    if (field.value) {
      // Only format if the field has a value
      formatPhoneInput(field);
    }
  });

  // Display the modal first so elements are in the DOM
  document.getElementById("leadModal").style.display = "block";

  initializeModalTabs();

  // Then setup the auto-resize for textareas
  // Important: This needs to be after setting the display to "block" to work properly
  const textareas = document.querySelectorAll("#leadModal textarea");
  textareas.forEach((textarea) => {
    // Set initial height based on content after a brief delay to ensure content is rendered
    setTimeout(() => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";

      // Make sure we don't add duplicate listeners
      textarea.removeEventListener("input", handleTextareaResize);
      textarea.addEventListener("input", handleTextareaResize);
    }, 0);
  });

  // Then add modal action buttons (Edit, Delete)
  window.updateModalActionButtons(lead._id);

  // Initialize any monetary inputs in the modal
  initializeMonetaryInputs();
}

/**
 * Update dates in the lead modal based on the selected date format
 * @param {Object} lead - Lead object
 */
function updateLeadModalDates(lead) {
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  // Handle last contacted date
  if (document.getElementById("lastContactedAt") && lead.lastContactedAt) {
    const date = new Date(lead.lastContactedAt);

    // Format date as YYYY-MM-DD for input[type="date"]
    // This is the HTML5 input date format regardless of display format
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    document.getElementById(
      "lastContactedAt"
    ).value = `${year}-${month}-${day}`;

    // Update the display element with the formatted date
    const displayElement = document.getElementById("lastContactedDisplay");
    if (displayElement) {
      displayElement.textContent = formatDate(date, dateFormat);
    }
  } else if (document.getElementById("lastContactedAt")) {
    document.getElementById("lastContactedAt").value = "";

    // Clear the display element
    const displayElement = document.getElementById("lastContactedDisplay");
    if (displayElement) {
      displayElement.textContent = "";
    }
  }

  // Set up event listener for date input changes
  const lastContactedInput = document.getElementById("lastContactedAt");
  if (lastContactedInput) {
    lastContactedInput.addEventListener("change", function () {
      if (this.value) {
        // Create a date at noon to avoid timezone issues
        const dateValue = this.value; // "YYYY-MM-DD" format
        const [year, month, day] = dateValue
          .split("-")
          .map((num) => parseInt(num, 10));

        // Create a date object with specific year, month, day at noon local time
        // Month is 0-indexed in JavaScript dates, so subtract 1
        const date = new Date(year, month - 1, day, 12, 0, 0);

        const displayElement = document.getElementById("lastContactedDisplay");
        if (displayElement) {
          displayElement.textContent = formatDate(date, dateFormat);
        }
      } else {
        const displayElement = document.getElementById("lastContactedDisplay");
        if (displayElement) {
          displayElement.textContent = "";
        }
      }
    });
  }
}

function refreshTextareaHeights() {
  const textareas = document.querySelectorAll("#leadModal textarea");

  textareas.forEach((textarea) => {
    // Reset height to auto first to properly calculate scrollHeight
    textarea.style.height = "auto";
    // Set height to scrollHeight to accommodate all content
    textarea.style.height = textarea.scrollHeight + "px";
  });
}

export {
  setupFormValidation,
  validateEmail,
  validatePhone,
  validateName,
  validateUrl,
  validateBudget,
  validateAndSaveLead,
  saveLead,
  deleteLeadAction,
  openAddLeadModal,
  openLeadModal,
  updateLeadModalDates,
  initializeModalTabs,
  activateTab,
  validateAllTabs,
  formatWebsiteUrl,
  addAddressMapButton,
};
