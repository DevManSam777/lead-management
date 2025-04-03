// handlers.js - Event handlers and form validation
import { 
  showInputError, 
  clearInputError, 
  getErrorElement, 
  formatCurrency, 
  showToast, 
  formatDate, 
  toISODateString,
  formatPhoneInput,
  initializeMonetaryInputs,
} from './utils.js';
import { createLead, updateLead, deleteLead, fetchLeadPayments } from './api.js';
import { renderLeads, setModalReadOnly } from './ui.js';
import { renderLeadPayments } from './payments.js';

// Function to handle textarea auto-resize
function handleTextareaResize() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
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
    return showInputError(input, errorElement, "Please enter a valid email address");
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
    return showInputError(input, errorElement, "Please enter a valid 10-digit phone number in format: 000-000-0000");
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
      `${fieldName} must be at least ${minLength} character${minLength !== 1 ? 's' : ''}`
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

/**
 * URL validation
 * @param {HTMLElement} input - The URL input element
 * @returns {boolean} Validation result
 */
function validateUrl(input) {
  const errorElement = getErrorElement(input);

  // Allow empty values if not required
  if (!input.value) {
    clearInputError(input, errorElement);
    return true;
  }

  // Check if the URL has a domain suffix (period followed by at least 2 characters)
  let urlToCheck = input.value;

  // If URL has protocol prefix, remove it for checking domain suffix
  if (urlToCheck.startsWith("http://")) {
    urlToCheck = urlToCheck.substring(7);
  } else if (urlToCheck.startsWith("https://")) {
    urlToCheck = urlToCheck.substring(8);
  }

  // Check for domain suffix (.com, .net, etc.)
  const domainSuffixRegex = /\.[a-z]{2,}(\S*)/i;
  if (!domainSuffixRegex.test(urlToCheck)) {
    return showInputError(
      input,
      errorElement,
      "Website must include a domain suffix (e.g., .com, .org)"
    );
  }

  // Validate full URL structure
  let testUrl = input.value;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = "http://" + testUrl;
  }

  try {
    new URL(testUrl);
    return clearInputError(input, errorElement);
  } catch (e) {
    return showInputError(input, errorElement, "Please enter a valid website address");
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

  // Validate required fields
  const isEmailValid = validateEmail(document.getElementById("email"));
  const isPhoneValid = validatePhone(document.getElementById("phone"));
  
  // Modified name validation to allow single characters
  const isFirstNameValid = validateName(
    document.getElementById("firstName"),
    "First name",
    1  // Minimum length changed to 1
  );
  const isLastNameValid = validateName(
    document.getElementById("lastName"),
    "Last name",
    1  // Minimum length changed to 1
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
    await saveLead();
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
    businessName: document.getElementById("businessName").value || "N/A",
    businessPhone: document.getElementById("businessPhone").value || undefined,
    businessPhoneExt: document.getElementById("businessPhoneExt").value || undefined,
    businessEmail: document.getElementById("businessEmail").value || undefined,
    businessServices:
      document.getElementById("businessServices").value || undefined,
    preferredContact:
      document.getElementById("preferredContact").value || undefined,
    serviceDesired: document.getElementById("serviceDesired").value,
    hasWebsite: document.getElementById("hasWebsite").value || undefined,
    websiteAddress:
      document.getElementById("websiteAddress").value || undefined,
    // Important: Allow message and notes to be empty strings
    message: document.getElementById("message").value,
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value,
    // Explicitly set this to false to ensure dashboard creations don't trigger emails
    isFormSubmission: false
  };

  // Add last contacted date if present
  const lastContactedInput = document.getElementById("lastContactedAt");
  if (lastContactedInput && lastContactedInput.value) {
    leadData.lastContactedAt = new Date(lastContactedInput.value);
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
    window.dispatchEvent(new CustomEvent('leadSaved', { 
      detail: { lead: updatedLead, isNew: isNewLead } 
    }));

    // Show success message
    showToast(leadId ? "Lead updated successfully" : "Lead added successfully");

    // Close the modal
    window.closeLeadModal();
  } catch (error) {
    console.error("Error saving lead:", error);
    showToast("Error: " + error.message);
  }
}

/**
 * Delete a lead
 * @param {string} leadId - ID of the lead to delete
 */
async function deleteLeadAction(leadId) {
  try {
    await deleteLead(leadId);
    
    // Signal that a lead was deleted - will be caught in dashboard.js
    window.dispatchEvent(new CustomEvent('leadDeleted', { 
      detail: { leadId } 
    }));
    
    // Close the modal
    window.closeLeadModal();
    
    showToast("Lead deleted successfully");
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

  // Clear the payments container
  const paymentsContainer = document.querySelector(".payments-container");
  if (paymentsContainer) {
    paymentsContainer.innerHTML = '<p class="payment-item">No payments yet</p>';
  }

  // Ensure Add Payment button is visible
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    addPaymentBtn.style.display = "block";
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
  const textareas = document.querySelectorAll('#leadModal textarea');
  textareas.forEach(textarea => {
    // Set initial height based on content
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    
    // Make sure we don't add duplicate listeners
    textarea.removeEventListener('input', handleTextareaResize);
    textarea.addEventListener('input', handleTextareaResize);
  });

  // Initialize any monetary inputs in the modal
  initializeMonetaryInputs();
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
  document.getElementById("businessPhoneExt").value = lead.businessPhoneExt || "";
  document.getElementById("businessName").value = lead.businessName || "";
  document.getElementById("businessEmail").value = lead.businessEmail || "";
  document.getElementById("businessServices").value = lead.businessServices || "";
  document.getElementById("preferredContact").value = lead.preferredContact || "";
  document.getElementById("serviceDesired").value = lead.serviceDesired || "website";
  document.getElementById("hasWebsite").value = lead.hasWebsite || "";
  document.getElementById("websiteAddress").value = lead.websiteAddress || "";
  document.getElementById("message").value = lead.message || "";
  document.getElementById("status").value = lead.status || "new";
  document.getElementById("notes").value = lead.notes || "";

  // Handle estimated budget field
  if (document.getElementById("budget")) {
    const budgetValue = lead.budget !== undefined ? parseFloat(lead.budget) : "";
    document.getElementById("budget").value = budgetValue
      ? formatCurrency(budgetValue)
      : "";
  }

  // Handle payment fields
  if (document.getElementById("totalBudget")) {
    const totalBudgetValue = lead.totalBudget !== undefined ? parseFloat(lead.totalBudget) : "";
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
    remainingBalance =  totalBudget - paidAmount;
  }

  // Find or create the remaining balance field
  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.value = formatCurrency(remainingBalance);
  } else {
    // Create the field if it doesn't exist
    const paidAmountField = document.getElementById("paidAmount");
    if (paidAmountField && paidAmountField.parentNode) {
      const parentDiv = paidAmountField.parentNode.parentNode;
      const newGroup = document.createElement("div");
      newGroup.className = "form-group";

      const label = document.createElement("label");
      label.setAttribute("for", "remainingBalance");
      label.textContent = "Remaining Balance";

      const input = document.createElement("input");
      input.type = "text";
      input.id = "remainingBalance";
      input.setAttribute("readonly", true);
      input.value = formatCurrency(remainingBalance);

      newGroup.appendChild(label);
      newGroup.appendChild(input);

      // Insert after paid amount field
      if (paidAmountField.parentNode.nextSibling) {
        parentDiv.insertBefore(
          newGroup,
          paidAmountField.parentNode.nextSibling
        );
      } else {
        parentDiv.appendChild(newGroup);
      }
    }
  }

  // Fetch and display payments for this lead
  try {
    const leadPayments = await fetchLeadPayments(lead._id);
    renderLeadPayments(leadPayments, lead._id);
  } catch (error) {
    console.error("Error fetching payments:", error);
    const paymentsContainer = document.querySelector(".payments-container");
    if (paymentsContainer) {
      paymentsContainer.innerHTML = '<p class="payment-item">Error loading payments</p>';
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

  // Make Add Payment button visible only when in edit mode
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    addPaymentBtn.style.display = "none";
  }

  // First, check if the action buttons container exists and remove it
  const existingActions = document.getElementById("modalActions");
  if (existingActions) {
    existingActions.remove();
  }

  // Format the phone numbers in the modal
  const phoneFields = document.querySelectorAll('#leadModal input[type="tel"]');
  phoneFields.forEach(field => {
    if (field.value) {
      // Only format if the field has a value
      formatPhoneInput(field);
    }
  });
  
  // Display the modal first so elements are in the DOM
  document.getElementById("leadModal").style.display = "block";

  // Then setup the auto-resize for textareas
  // Important: This needs to be after setting the display to "block" to work properly
  const textareas = document.querySelectorAll('#leadModal textarea');
  textareas.forEach(textarea => {
    // Set initial height based on content after a brief delay to ensure content is rendered
    setTimeout(() => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      
      // Make sure we don't add duplicate listeners
      textarea.removeEventListener('input', handleTextareaResize);
      textarea.addEventListener('input', handleTextareaResize);
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
    const formattedDate = date.toISOString().split("T")[0];
    document.getElementById("lastContactedAt").value = formattedDate;
    
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
    lastContactedInput.addEventListener("change", function() {
      if (this.value) {
        const date = new Date(this.value);
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

// Export handlers functions
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
  updateLeadModalDates
};