// API URL Configuration
const API_URL = "http://localhost:5000/api/leads";
const API_PAYMENTS_URL = "http://localhost:5000/api/payments";
const SETTINGS_API_URL = "http://localhost:5000/api/settings";

// Global variables
let allLeads = [];
let payments = [];
let currentView = "grid"; // 'grid' or 'list'
let defaultCurrency = "USD"; // Store the default currency
let globalSettings = {}; // New global settings cache

// Phone number formatting function
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Check if we have enough digits for a complete phone number
  if (cleaned.length < 10) return phoneNumber; // Return original if not enough digits

  // Format as XXX-XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return match[1] + "-" + match[2] + "-" + match[3];
  }

  // If it doesn't match the expected pattern, return the original
  return phoneNumber;
}

// Function to truncate text to a specific length
function truncateText(text, maxLength = 25) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Function to fetch all settings from the server
async function fetchAllSettings() {
  try {
    const response = await fetch(SETTINGS_API_URL);
    
    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }
    
    const settings = await response.json();
    globalSettings = settings;
    
    // Return the settings
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    
    // Fallback to localStorage if API fails
    return {
      theme: localStorage.getItem("theme") || 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    };
  }
}


// document.addEventListener("DOMContentLoaded", function () {
//   // Theme initialization with proper function definition
//   const savedTheme = localStorage.getItem("theme");
//   if (savedTheme) {
//     setTheme(savedTheme);
//   }

//   // Setup the sidebar toggle
//   setupSidebarToggle();
  
//   // Fetch leads on page load
//   fetchLeads();

//   // Dashboard UI event listeners
//   document.getElementById("addLeadBtn").addEventListener("click", openAddLeadModal);
//   document.getElementById("closeModal").addEventListener("click", closeLeadModal);
  
//   // Updated lead form submission handler
//   document.getElementById("leadForm").addEventListener("submit", function(event) {
//     event.preventDefault();
    
//     // Validate and save the lead
//     validateAndSaveLead(event);
    
//     // After save, update the action buttons and set back to read-only
//     const leadId = document.getElementById("leadId").value;
//     if (leadId) {
//       // Show the action buttons again
//       const actionsContainer = document.getElementById("modalActions");
//       if (actionsContainer) {
//         actionsContainer.style.display = "block";
//       }
      
//       // Set modal back to read-only mode
//       setModalReadOnly(true);
      
//       // Update modal title
//       document.getElementById("modalTitle").textContent = "Client Info";
//     }
//   });
  
//   document.getElementById("searchInput").addEventListener("input", searchLeads);
//   document.getElementById("filterStatus").addEventListener("change", filterLeads);
//   document.getElementById("sortField").addEventListener("change", sortLeads);
//   document.getElementById("sortOrder").addEventListener("change", sortLeads);
//   document.getElementById("gridViewBtn").addEventListener("click", () => switchView("grid"));
//   document.getElementById("listViewBtn").addEventListener("click", () => switchView("list"));

//   // Form conditionals
//   const hasWebsiteSelect = document.getElementById("hasWebsite");
//   if (hasWebsiteSelect) {
//     hasWebsiteSelect.addEventListener("change", function () {
//       const websiteAddressField = document.getElementById("websiteAddress").parentNode;
//       websiteAddressField.style.display = this.value === "yes" ? "block" : "none";
//     });
//   }

//   // Currency formatting for budget input
//   const totalBudgetInput = document.getElementById("totalBudget");
//   if (totalBudgetInput) {
//     totalBudgetInput.addEventListener("blur", function (e) {
//       if (this.value) {
//         // Format number with 2 decimal places
//         const value = parseFloat(this.value.replace(/[^\d.-]/g, ""));
//         if (!isNaN(value)) {
//           const currency = document.getElementById("budgetCurrency").value;
//           this.value = formatCurrency(value, currency);
//         }
//       }
//     });
//   }

//   // Payment related listeners
//   const paymentForm = document.getElementById("paymentForm");
//   if (paymentForm) {
//     // Remove existing event listeners (if any) by cloning and replacing
//     const newPaymentForm = paymentForm.cloneNode(true);
//     paymentForm.parentNode.replaceChild(newPaymentForm, paymentForm);
    
//     // Add fresh event listener
//     newPaymentForm.addEventListener("submit", function(event) {
//       event.preventDefault();
//       validateAndSavePayment(event);
//       return false;
//     });
//   }
  
//   // Close payment modal button
//   const closePaymentModalBtn = document.getElementById("closePaymentModal");
//   if (closePaymentModalBtn) {
//     const newCloseBtn = closePaymentModalBtn.cloneNode(true);
//     closePaymentModalBtn.parentNode.replaceChild(newCloseBtn, closePaymentModalBtn);
    
//     newCloseBtn.addEventListener("click", function(event) {
//       event.preventDefault();
//       closePaymentModal();
//       return false;
//     });
//   }

//   // Add payment button
//   const addPaymentBtn = document.getElementById("addPaymentBtn");
//   if (addPaymentBtn) {
//     const newBtn = addPaymentBtn.cloneNode(true);
//     addPaymentBtn.parentNode.replaceChild(newBtn, addPaymentBtn);

//     newBtn.addEventListener("click", function () {
//       const leadId = document.getElementById("leadId").value;
//       if (leadId) {
//         openPaymentModal(leadId);
//       } else {
//         showToast("Please save the lead first before adding payments");
//       }
//     });
//   }

//   // Setup form validation
//   setupFormValidation();
  
//   // Add mutation observer to handle modal state changes
//   const modalObserver = new MutationObserver(function(mutations) {
//     const leadId = document.getElementById("leadId").value;
//     if (!leadId) return;
    
//     // Check if we're in edit mode
//     const submitButton = document.querySelector('#leadForm button[type="submit"]');
//     const isEditMode = submitButton && submitButton.style.display !== "none";
    
//     if (isEditMode) {
//       // We're in edit mode, make sure payments show action buttons
//       const paymentItems = document.querySelectorAll('.payment-item');
//       let needsRefresh = false;
      
//       // Check if any payment items are missing action buttons
//       paymentItems.forEach(item => {
//         if (item.textContent !== "No payments found" && !item.querySelector('.payment-actions')) {
//           needsRefresh = true;
//         }
//       });
      
//       // If we need to refresh the payments display
//       if (needsRefresh) {
//         fetchLeadPayments(leadId).then(payments => {
//           renderLeadPayments(payments, leadId);
//         });
//       }
//     }
//   });
  
//   // Observe the lead modal for changes
//   const leadModal = document.getElementById("leadModal");
//   if (leadModal) {
//     modalObserver.observe(leadModal, { 
//       attributes: true,
//       childList: true,
//       subtree: true 
//     });
//   }
// });

document.addEventListener("DOMContentLoaded", async function () {
  // Theme initialization with proper function definition
  try {
    // Fetch all settings including theme
    const settings = await fetchAllSettings();
    
    // Always use theme from server settings (should always exist now)
    if (settings.theme) {
      setTheme(settings.theme);
    } else {
      // If somehow server doesn't have theme, use system preference and save it
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(systemTheme);
      await updateSetting('theme', systemTheme);
    }
  } catch (error) {
    console.error("Error initializing theme:", error);
    // Fallback to localStorage or system preference
    const savedTheme = localStorage.getItem("theme") || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
  }

  // Setup the sidebar toggle
  setupSidebarToggle();
  
  // Fetch leads on page load
  fetchLeads();

  // Dashboard UI event listeners
  document.getElementById("addLeadBtn").addEventListener("click", openAddLeadModal);
  document.getElementById("closeModal").addEventListener("click", closeLeadModal);
  
  // Updated lead form submission handler
  document.getElementById("leadForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Validate and save the lead
    validateAndSaveLead(event);
    
    // After save, update the action buttons and set back to read-only
    const leadId = document.getElementById("leadId").value;
    if (leadId) {
      // Show the action buttons again
      const actionsContainer = document.getElementById("modalActions");
      if (actionsContainer) {
        actionsContainer.style.display = "block";
      }
      
      // Set modal back to read-only mode
      setModalReadOnly(true);
      
      // Update modal title
      document.getElementById("modalTitle").textContent = "Client Info";
    }
  });
  
  document.getElementById("searchInput").addEventListener("input", searchLeads);
  document.getElementById("filterStatus").addEventListener("change", filterLeads);
  document.getElementById("sortField").addEventListener("change", sortLeads);
  document.getElementById("sortOrder").addEventListener("change", sortLeads);
  document.getElementById("gridViewBtn").addEventListener("click", () => switchView("grid"));
  document.getElementById("listViewBtn").addEventListener("click", () => switchView("list"));

  // Form conditionals
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  if (hasWebsiteSelect) {
    hasWebsiteSelect.addEventListener("change", function () {
      const websiteAddressField = document.getElementById("websiteAddress").parentNode;
      websiteAddressField.style.display = this.value === "yes" ? "block" : "none";
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
          this.value = formatCurrency(value, currency);
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
    newPaymentForm.addEventListener("submit", function(event) {
      event.preventDefault();
      validateAndSavePayment(event);
      return false;
    });
  }
  
  // Close payment modal button
  const closePaymentModalBtn = document.getElementById("closePaymentModal");
  if (closePaymentModalBtn) {
    const newCloseBtn = closePaymentModalBtn.cloneNode(true);
    closePaymentModalBtn.parentNode.replaceChild(newCloseBtn, closePaymentModalBtn);
    
    newCloseBtn.addEventListener("click", function(event) {
      event.preventDefault();
      closePaymentModal();
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
        openPaymentModal(leadId);
      } else {
        showToast("Please save the lead first before adding payments");
      }
    });
  }

  // Setup form validation
  setupFormValidation();
  
  // Add mutation observer to handle modal state changes
  const modalObserver = new MutationObserver(function(mutations) {
    const leadId = document.getElementById("leadId").value;
    if (!leadId) return;
    
    // Check if we're in edit mode
    const submitButton = document.querySelector('#leadForm button[type="submit"]');
    const isEditMode = submitButton && submitButton.style.display !== "none";
    
    if (isEditMode) {
      // We're in edit mode, make sure payments show action buttons
      const paymentItems = document.querySelectorAll('.payment-item');
      let needsRefresh = false;
      
      // Check if any payment items are missing action buttons
      paymentItems.forEach(item => {
        if (item.textContent !== "No payments found" && !item.querySelector('.payment-actions')) {
          needsRefresh = true;
        }
      });
      
      // If we need to refresh the payments display
      if (needsRefresh) {
        fetchLeadPayments(leadId).then(payments => {
          renderLeadPayments(payments, leadId);
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
      subtree: true 
    });
  }
});

// Set theme on HTML element
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// Simple sidebar toggle functionality
function setupSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  // Create toggle button if it doesn't exist
  if (!document.querySelector('.sidebar-toggle')) {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'sidebar-toggle';
    toggleButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    toggleButton.setAttribute('aria-label', 'Toggle Sidebar');
    
    sidebar.appendChild(toggleButton);
    
    // Add click event
    toggleButton.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
      
      // Rotate arrow icon when collapsed
      if (sidebar.classList.contains('collapsed')) {
        this.innerHTML = '<i class="fas fa-chevron-left"></i>';
      } else {
        this.innerHTML = '<i class="fas fa-chevron-left"></i>';
      }
      
      // Store user preference
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
  }
  
  // Set initial state based on saved preference
  const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isSidebarCollapsed) {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
    document.querySelector('.sidebar-toggle').innerHTML = '<i class="fas fa-chevron-right"></i>';
  }
}



// Setup form validation
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

// Email validation
function validateEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errorElement = getErrorElement(input);
  const isRequired = input.id === "email"; // Only main email is required

  if (isRequired && !input.value) {
    showInputError(input, errorElement, "Email is required");
    return false;
  } else if (input.value && !emailRegex.test(input.value)) {
    showInputError(input, errorElement, "Please enter a valid email address");
    return false;
  } else {
    clearInputError(input, errorElement);
    return true;
  }
}

// Phone validation
function validatePhone(input) {
  // Allow formats like: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
  const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const errorElement = getErrorElement(input);
  const isRequired = input.id === "phone"; // Only main phone is required

  if (isRequired && !input.value) {
    showInputError(input, errorElement, "Phone number is required");
    return false;
  } else if (input.value && !phoneRegex.test(input.value)) {
    showInputError(input, errorElement, "Please enter a valid phone number");
    return false;
  } else {
    clearInputError(input, errorElement);
    return true;
  }
}

// Name validation
function validateName(input, fieldName) {
  const errorElement = getErrorElement(input);

  if (!input.value) {
    showInputError(input, errorElement, `${fieldName} is required`);
    return false;
  } else if (input.value.length < 2) {
    showInputError(
      input,
      errorElement,
      `${fieldName} must be at least 2 characters`
    );
    return false;
  } else if (input.value.length > 50) {
    showInputError(
      input,
      errorElement,
      `${fieldName} must be less than 50 characters`
    );
    return false;
  } else {
    clearInputError(input, errorElement);
    return true;
  }
}

// URL validation
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
    showInputError(
      input,
      errorElement,
      "Website must include a domain suffix (e.g., .com, .org)"
    );
    return false;
  }

  // Validate full URL structure
  let testUrl = input.value;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = "http://" + testUrl;
  }

  try {
    new URL(testUrl);
    clearInputError(input, errorElement);
    return true;
  } catch (e) {
    showInputError(input, errorElement, "Please enter a valid website address");
    return false;
  }
}

// Budget validation
function validateBudget(input) {
  const errorElement = getErrorElement(input);
  const value = parseFloat(input.value.replace(/[^\d.-]/g, ""));

  if (input.value && isNaN(value)) {
    showInputError(input, errorElement, "Please enter a valid amount");
    return false;
  } else if (value < 0) {
    showInputError(input, errorElement, "Budget cannot be negative");
    return false;
  } else {
    clearInputError(input, errorElement);
    return true;
  }
}

// Validate form and save lead
function validateAndSaveLead(event) {
  event.preventDefault();

  // Validate required fields
  const isEmailValid = validateEmail(document.getElementById("email"));
  const isPhoneValid = validatePhone(document.getElementById("phone"));
  const isFirstNameValid = validateName(
    document.getElementById("firstName"),
    "First name"
  );
  const isLastNameValid = validateName(
    document.getElementById("lastName"),
    "Last name"
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
    isBudgetValid
  ) {
    saveLead();
  }
}

// Show input error
function showInputError(input, errorElement, message) {
  input.classList.add("invalid");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    input.parentNode.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// Clear input error
function clearInputError(input, errorElement) {
  input.classList.remove("invalid");

  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
}

// Get or create error element
function getErrorElement(input) {
  let errorElement = input.parentNode.querySelector(".error-message");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    input.parentNode.appendChild(errorElement);
  }

  return errorElement;
}

// Format currency with proper symbols
function formatCurrency(amount, currency = "USD") {
  // Special case for pizza currency
  if (currency === "🍕") {
    return `${amount.toFixed(2)} 🍕`;
  }

  try {
    // Use the browser's Intl.NumberFormat to format currency properly
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      currencyDisplay: "symbol",
    }).format(amount);
  } catch (error) {
    // Fallback in case of error (like invalid currency code)
    console.warn(`Error formatting currency ${currency}:`, error);

    // Basic manual formatting with appropriate symbols
    const formatted = amount.toFixed(2);
    switch (currency) {
      case "USD":
        return "$" + formatted;
      case "EUR":
        return "€" + formatted;
      case "GBP":
        return "£" + formatted;
      case "CAD":
        return "CA$" + formatted;
      case "AUD":
        return "A$" + formatted;
      default:
        return "$" + formatted;
    }
  }
}

// Validate payment form and prepare payment data
function validateAndSavePayment(event) {
  event.preventDefault();

  // Get form data
  const paymentId = document.getElementById("paymentId").value;
  const leadId = document.getElementById("paymentLeadId").value;
  const amountStr = document.getElementById("paymentAmount").value;
  const currency = document.getElementById("paymentCurrency").value;
  const paymentDate = document.getElementById("paymentDate").value;
  const notes = document.getElementById("paymentNotes").value;

  // Extract numeric value from formatted amount
  const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ""));

  if (isNaN(amount) || amount <= 0) {
    showToast("Please enter a valid amount");
    return;
  }

  if (!paymentDate) {
    showToast("Payment date is required");
    return;
  }

  // IMPROVED DATE HANDLING: Create a date at noon local time, then adjust for timezone
  const dateObj = new Date(paymentDate + "T12:00:00");
  console.log("Original payment date input:", paymentDate);
  console.log("Date object created:", dateObj.toISOString());

  // Timezone offset to ensure the date doesn't shift
  // This is crucial to prevent the date from shifting due to UTC conversion
  const timezoneOffset = dateObj.getTimezoneOffset() * 60000; // Convert to milliseconds
  const adjustedDate = new Date(dateObj.getTime() + timezoneOffset);
  console.log(
    "Adjusted date with timezone offset:",
    adjustedDate.toISOString()
  );

  // Prepare payment data with adjusted date
  const paymentData = {
    leadId,
    amount,
    currency,
    paymentDate: adjustedDate,
    notes,
  };

  // If editing existing payment, add the ID
  if (paymentId) {
    paymentData._id = paymentId;
  }

  // Save payment
  savePayment(paymentData);
}


function renderLeadPayments(leadPayments, leadId) {
  const paymentsContainer = document.querySelector(".payments-container");

  if (!paymentsContainer) return;

  // Clear container before rendering
  paymentsContainer.innerHTML = "";

  if (!leadPayments || leadPayments.length === 0) {
    paymentsContainer.innerHTML =
      '<p class="payment-item">No payments found</p>';
    return;
  }

  // Only render payments that match the current lead ID
  const filteredPayments = leadPayments.filter(
    (payment) => payment.leadId === leadId
  );

  if (filteredPayments.length === 0) {
    paymentsContainer.innerHTML =
      '<p class="payment-item">No payments found</p>';
    return;
  }

  // Check if we're in edit mode by looking for the submit button visibility
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  const isEditMode = submitButton && submitButton.style.display !== "none";

  filteredPayments.forEach((payment) => {
    const paymentDate = payment.paymentDate
      ? new Date(payment.paymentDate).toLocaleDateString()
      : "Not recorded";

    const paymentItem = document.createElement("div");
    paymentItem.className = "payment-item";
    paymentItem.dataset.leadId = payment.leadId;
    paymentItem.dataset.paymentId = payment._id;

    // Create the payment details element
    const paymentDetails = document.createElement("div");
    paymentDetails.className = "payment-details";
    
    const amountDiv = document.createElement("div");
    amountDiv.className = "payment-amount";
    amountDiv.textContent = formatCurrency(payment.amount, payment.currency || "USD");
    
    const dateDiv = document.createElement("div");
    dateDiv.className = "payment-date";
    dateDiv.textContent = `Paid: ${paymentDate}`;
    
    paymentDetails.appendChild(amountDiv);
    paymentDetails.appendChild(dateDiv);
    
    if (payment.notes) {
      const notesDiv = document.createElement("div");
      notesDiv.className = "payment-notes";
      notesDiv.textContent = payment.notes;
      paymentDetails.appendChild(notesDiv);
    }
    
    paymentItem.appendChild(paymentDetails);

    // Only add action buttons if we're in edit mode
    if (isEditMode) {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "payment-actions";
      
      // Create edit button with direct click handler
      const editButton = document.createElement("button");
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.onclick = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        openPaymentModal(leadId, payment._id);
      };
      
      // Create delete button with direct click handler
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.onclick = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (confirm("Are you sure you want to delete this payment?")) {
          deletePayment(payment._id, leadId);
        }
      };
      
      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);
      paymentItem.appendChild(actionsDiv);
    }

    paymentsContainer.appendChild(paymentItem);
  });
}

// Now, modify the updateModalActionButtons function to refresh payments when entering edit mode
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
      modalHeader.insertAdjacentElement('afterend', actionsContainer);
    }
  }
  
  // Clear existing buttons
  actionsContainer.innerHTML = "";
  
  // Create Edit button
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "btn btn-primary";
  editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
  editButton.addEventListener('click', function() {
    setModalReadOnly(false);
    document.getElementById("modalTitle").textContent = "Edit Lead";
    // Hide the action buttons when in edit mode
    actionsContainer.style.display = "none";
    
    // KEY FIX: Re-render the payment items to show their action buttons
    const leadId = document.getElementById("leadId").value;
    if (leadId) {
      fetchLeadPayments(leadId).then((leadPayments) => {
        renderLeadPayments(leadPayments, leadId);
      });
    }
  });
  
  // Create Delete button
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-danger";
  deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
  deleteButton.addEventListener('click', function() {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteLeadAction(leadId);
    }
  });
  
  // Add buttons to container
  actionsContainer.appendChild(editButton);
  actionsContainer.appendChild(deleteButton);
}


// Fetch all payments
async function fetchPayments() {
  try {
    const response = await fetch(API_PAYMENTS_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch payments");
    }

    payments = await response.json();
    calculateStats(); // Recalculate stats with payment data
  } catch (error) {
    console.error("Error fetching payments:", error);
    showToast("Error fetching payments: " + error.message);
  }
}

// Fetch payments for a specific lead with improved error handling
async function fetchLeadPayments(leadId) {
  try {
    console.log(`Fetching payments for lead ID: ${leadId}`);

    if (!leadId) {
      console.error("fetchLeadPayments called with no leadId");
      return [];
    }

    const response = await fetch(`${API_PAYMENTS_URL}/lead/${leadId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch lead payments");
    }

    const payments = await response.json();
    console.log(`Received ${payments.length} payments for lead ID: ${leadId}`);

    // Verify each payment belongs to this lead
    const validPayments = payments.filter(
      (payment) => payment.leadId === leadId
    );

    if (validPayments.length !== payments.length) {
      console.warn(
        `Found ${
          payments.length - validPayments.length
        } payments with mismatched lead IDs`
      );
    }

    return validPayments;
  } catch (error) {
    console.error("Error fetching lead payments:", error);
    showToast("Error fetching payments: " + error.message);
    return [];
  }
}

// Save or update a payment
async function savePayment(paymentData) {
  try {
    let response;
    if (paymentData._id) {
      // Update existing payment
      response = await fetch(`${API_PAYMENTS_URL}/${paymentData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
    } else {
      // Create new payment
      response = await fetch(API_PAYMENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save payment");
    }

    // Get the current lead ID
    const leadId = document.getElementById("leadId").value;

    if (leadId) {
      // Directly request the updated lead information
      const leadResponse = await fetch(`${API_URL}/${leadId}`);

      if (!leadResponse.ok) {
        throw new Error("Failed to fetch updated lead information");
      }

      const updatedLead = await leadResponse.json();

      // Update the lead in allLeads array
      const leadIndex = allLeads.findIndex((l) => l._id === leadId);
      if (leadIndex !== -1) {
        allLeads[leadIndex] = updatedLead;
      }

      // Get updated payments specifically for this lead
      const leadPayments = await fetchLeadPayments(leadId);

      // Calculate the total paid
      const totalPaid = leadPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Update paid amount field
      const paidAmountField = document.getElementById("paidAmount");
      if (paidAmountField) {
        paidAmountField.value = formatCurrency(
          totalPaid,
          updatedLead.currency || "USD"
        );
      }

      // Update remaining balance field
      const remainingBalanceField = document.getElementById("remainingBalance");
      if (remainingBalanceField) {
        const totalBudget = updatedLead.totalBudget || 0;
        const remainingBalance = totalBudget - totalPaid;
        remainingBalanceField.value = formatCurrency(
          remainingBalance,
          updatedLead.currency || "USD"
        );
      }

      // Render payment list
      renderLeadPayments(leadPayments, leadId);
    }

    // Refresh the full payments and leads data
    await fetchPayments();
    calculateStats(); // Recalculate stats after fetching payments
    fetchLeads(); // Refresh leads in background

    // Close only the payment modal, not the lead modal
    closePaymentModal();

    showToast(
      paymentData._id
        ? "Payment updated successfully"
        : "Payment added successfully"
    );
  } catch (error) {
    console.error("Error saving payment:", error);
    showToast("Error: " + error.message);
  }
}

async function deletePayment(paymentId, leadId) {
  try {
    // Store the lead modal state before any operations
    const leadModalDisplayStyle = document.getElementById("leadModal").style.display;
    
    if (!paymentId || !leadId) {
      throw new Error("Missing payment ID or lead ID");
    }

    const response = await fetch(`${API_PAYMENTS_URL}/${paymentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete payment");
    }

    if (leadId) {
      // Directly request the updated lead information
      const leadResponse = await fetch(`${API_URL}/${leadId}`);

      if (!leadResponse.ok) {
        throw new Error("Failed to fetch updated lead information");
      }

      const updatedLead = await leadResponse.json();

      // Update the lead in allLeads array
      const leadIndex = allLeads.findIndex((l) => l._id === leadId);
      if (leadIndex !== -1) {
        allLeads[leadIndex] = updatedLead;
      }

      // Get updated payments for this specific lead
      const leadPayments = await fetchLeadPayments(leadId);

      // Calculate the total paid
      const totalPaid = leadPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Update paid amount field
      const paidAmountField = document.getElementById("paidAmount");
      if (paidAmountField) {
        paidAmountField.value = formatCurrency(
          totalPaid,
          updatedLead.currency || "USD"
        );
      }

      // Update remaining balance field
      const remainingBalanceField = document.getElementById("remainingBalance");
      if (remainingBalanceField) {
        const totalBudget = updatedLead.totalBudget || 0;
        const remainingBalance = Math.max(0, totalBudget - totalPaid);
        remainingBalanceField.value = formatCurrency(
          remainingBalance,
          updatedLead.currency || "USD"
        );
      }

      // Render payment list
      renderLeadPayments(leadPayments, leadId);
    }

    // Refresh the full payments data
    await fetchPayments();
    
    // Update stats
    calculateStats();
    
    // Update the renders but ensure modals maintain correct state
    renderLeads(allLeads);
    
    // Ensure lead modal stays in its original state
    document.getElementById("leadModal").style.display = leadModalDisplayStyle;

    showToast("Payment deleted successfully");
  } catch (error) {
    console.error("Error deleting payment:", error);
    showToast("Error: " + error.message);
  }
}

// Open payment modal with better validation
function openPaymentModal(leadId, paymentId = null) {
  const paymentForm = document.getElementById("paymentForm");
  if (!paymentForm) return;

  paymentForm.reset();

  // Clear previous values
  document.getElementById("paymentId").value = "";
  document.getElementById("paymentLeadId").value = "";

  // Set the lead ID - verify it exists
  if (!leadId) {
    showToast("Error: No lead ID provided");
    return;
  }

  console.log(`Opening payment modal for lead ID: ${leadId}`);
  document.getElementById("paymentLeadId").value = leadId;

  if (paymentId) {
    // Edit existing payment - verify payment belongs to this lead
    const payment = payments.find(
      (p) => p._id === paymentId && p.leadId === leadId
    );

    if (!payment) {
      showToast("Payment not found or doesn't belong to this lead");
      return;
    }

    document.getElementById("paymentId").value = payment._id;
    document.getElementById("paymentAmount").value = payment.amount;
    document.getElementById("paymentCurrency").value =
      payment.currency || "USD";

    // Format date for the date input
    if (payment.paymentDate) {
      // Create a date object in the local timezone
      const dateObj = new Date(payment.paymentDate);
      // Format as YYYY-MM-DD for input[type="date"]
      const formattedDate = dateObj.toISOString().split("T")[0];
      document.getElementById("paymentDate").value = formattedDate;
    }

    document.getElementById("paymentNotes").value = payment.notes || "";

    document.getElementById("paymentModalTitle").textContent = "Edit Payment";
  } else {
    // New payment
    // Set default values
    document.getElementById("paymentCurrency").value = defaultCurrency;

    // Set today's date correctly with timezone adjustment
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to prevent timezone issues
    const localDate = today.toISOString().split("T")[0];

    document.getElementById("paymentDate").value = localDate;
    document.getElementById("paymentNotes").value = "";

    document.getElementById("paymentModalTitle").textContent = "Add Payment";
  }

  document.getElementById("paymentModal").style.display = "block";
}


function closePaymentModal() {
  const paymentModal = document.getElementById("paymentModal");
  if (!paymentModal) return;
  
  // Hide the payment modal
  paymentModal.style.display = "none";

  // Get the stored lead modal state
  const leadModalState = paymentModal.dataset.leadModalState;
  
  // If we have a stored state and it was "block", ensure lead modal stays open
  if (leadModalState === "block") {
    document.getElementById("leadModal").style.display = "block";
  }
}


// Fetch leads from API
async function fetchLeads() {
  try {
    console.log("Fetching leads from:", API_URL);
    const response = await fetch(API_URL);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch leads");
    }

    const data = await response.json();
    console.log("Fetched leads data:", data);

    // Make sure data is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received");
    }

    

    allLeads = data;

    // Safely update UI
    try {
      renderLeads(allLeads);
    } catch (renderError) {
      console.error("Error rendering leads:", renderError);
      const leadCardsElement = document.getElementById("leadCards");
      if (leadCardsElement) {
        leadCardsElement.innerHTML = `<div class="lead-card"><p>Error rendering leads: ${renderError.message}</p></div>`;
      }
    }

    // Fetch payments after loading leads
    await fetchPayments();
  } catch (error) {
    console.error("Error fetching leads:", error);

    // Safely update the UI with error message
    const leadCardsElement = document.getElementById("leadCards");
    if (leadCardsElement) {
      leadCardsElement.innerHTML = `<div class="lead-card"><p>Error loading leads: ${error.message}</p></div>`;
    }

    // Set default values for statistics when we can't fetch data
    safeSetTextContent("totalLeadsValue", "0");
    safeSetTextContent("newLeadsValue", "0");
    safeSetTextContent("conversionRateValue", "0%");
    safeSetTextContent("monthlyPaymentsValue", formatCurrency(0, "USD"));

    // Set all change indicators to 0%
    safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
    safeUpdateChangeIndicator("newLeadsChange", 0, "");
    safeUpdateChangeIndicator("conversionChange", 0, "month");
    safeUpdateChangeIndicator("paymentsChange", 0, "month");

    showToast("Error fetching leads: " + error.message);
  }
}

// Helper function to safely set text content
function safeSetTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  } else {
    console.warn(`Element with id ${elementId} not found in the DOM`);
  }
}

// Helper function to safely update change indicator
function safeUpdateChangeIndicator(elementId, value, period) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Change indicator element with id ${elementId} not found`);
    return;
  }

  try {
    // New leads doesn't show period text
    if (elementId === "newLeadsChange") {
      if (value > 0) {
        element.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(
          value
        ).toFixed(1)}%`;
        element.className = "change positive";
      } else if (value < 0) {
        element.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(
          value
        ).toFixed(1)}%`;
        element.className = "change negative";
      } else {
        element.innerHTML = `<i class="fas fa-minus"></i> 0% from last month`;
        element.className = "change";
      }
    } else {
      // All other stats show "from last month"
      if (value > 0) {
        element.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(
          value
        ).toFixed(1)}% from last month`;
        element.className = "change positive";
      } else if (value < 0) {
        element.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(
          value
        ).toFixed(1)}% from last month`;
        element.className = "change negative";
      } else {
        element.innerHTML = `<i class="fas fa-minus"></i> 0% from last month`;
        element.className = "change";
      }
    }
  } catch (error) {
    console.error(`Error updating change indicator ${elementId}:`, error);
    // Set a fallback value
    if (element.innerHTML) {
      if (elementId === "newLeadsChange") {
        element.innerHTML = `<i class="fas fa-minus"></i> 0% from`;
      } else {
        element.innerHTML = `<i class="fas fa-minus"></i> 0% from last month`;
      }
      element.className = "change";
    }
  }
}

// Calculate dashboard statistics
function calculateStats() {
  try {
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

// Render leads based on current view
function renderLeads(leads) {
  if (currentView === "grid") {
    renderGridView(leads);
  } else {
    renderListView(leads);
  }
}

// Get lead name based on schema
function getLeadName(lead) {
  if (lead.firstName && lead.lastName) {
    return `${lead.firstName} ${lead.lastName}`;
  } else if (lead.name) {
    return lead.name;
  } else {
    return "Unknown";
  }
}

function renderGridView(leads) {
  const leadCards = document.getElementById("leadCards");
  leadCards.innerHTML = "";

  if (leads.length === 0) {
    leadCards.innerHTML = '<div class="lead-card"><p>No leads found</p></div>';
    return;
  }

  leads.forEach((lead) => {
    const card = document.createElement("div");
    card.className = "lead-card clickable";
    card.dataset.leadId = lead._id;
    
    // Handle name display based on your schema
    const fullName = getLeadName(lead);
    
    // Display business information with N/A as default
    const businessName = lead.businessName || "N/A";

    card.innerHTML = `
      <h3>${fullName}</h3>
      <p><strong>Business:</strong> ${businessName}</p>
      <p><strong>Status:</strong> <span class="lead-status status-${(
        lead.status || "new"
      ).toLowerCase()}">${capitalizeFirstLetter(lead.status || "new")}</span></p>
    `;

    // Add click event to the entire card
    card.addEventListener('click', function() {
      openLeadModal(lead._id);
    });

    leadCards.appendChild(card);
  });
}

// Modified renderListView function to make rows clickable and remove action column
function renderListView(leads) {
  const leadsTableBody = document.getElementById("leadsTableBody");
  leadsTableBody.innerHTML = "";

  if (leads.length === 0) {
    leadsTableBody.innerHTML = '<tr><td colspan="3">No leads found</td></tr>';
    return;
  }

  leads.forEach((lead) => {
    const row = document.createElement("tr");
    row.className = "clickable";
    row.dataset.leadId = lead._id;

    // Handle name display based on your schema
    const fullName = getLeadName(lead);
    const truncatedName = truncateText(fullName, 20); // Truncate after 20 characters

    // Determine business info and handle empty values
    const business = lead.businessName || "N/A";
    const truncatedBusiness = truncateText(business, 20); // Truncate business name too

    row.innerHTML = `
      <td><span title="${fullName}">${truncatedName}</span></td>
      <td><span title="${business}">${truncatedBusiness}</span></td>
      <td><span class="lead-status status-${(
        lead.status || "new"
      ).toLowerCase()}">${capitalizeFirstLetter(lead.status || "new")}</span></td>
    `;

    // Add click event to the row
    row.addEventListener('click', function() {
      openLeadModal(lead._id);
    });

    leadsTableBody.appendChild(row);
  });
}

// Function to set modal to read-only or editable mode
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
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  if (submitButton) {
    submitButton.style.display = isReadOnly ? "none" : "block";
  }
  
  // Show/hide Add Payment button based on mode
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    addPaymentBtn.style.display = isReadOnly ? "none" : "block";
  }
}

// Switch between grid and list views
function switchView(view) {
  currentView = view;

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

  renderLeads(allLeads);
}

// Search functionality
function searchLeads() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  let filteredLeads = allLeads;

  if (searchTerm) {
    filteredLeads = allLeads.filter((lead) => {
      // Search in multiple fields
      const nameMatch = getLeadName(lead).toLowerCase().includes(searchTerm);
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

      return (
        nameMatch ||
        emailMatch ||
        phoneMatch ||
        businessMatch ||
        businessEmailMatch ||
        businessPhoneMatch ||
        textNumberMatch ||
        messageMatch ||
        websiteMatch
      );
    });
  }

  filterByStatus(filteredLeads);
}

// Filter by status
function filterLeads() {
  filterByStatus(allLeads);
}

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

// Sort leads based on sort field and order
function sortLeads() {
  sortLeadsAndRender(allLeads);
}

function sortLeadsAndRender(leadsToSort) {
  const sortField = document.getElementById("sortField").value;
  const sortOrder = document.getElementById("sortOrder").value;

  // If no leads to sort, return
  if (!leadsToSort || leadsToSort.length === 0) {
    renderLeads([]);
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
  renderLeads(sortedLeads);
}

// Bridge for combined sort dropdown
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

// Modified openAddLeadModal function for dashboard.js
function openAddLeadModal() {
  const leadForm = document.getElementById("leadForm");
  leadForm.reset();

  // Clear the lead ID to ensure we're creating a new lead
  document.getElementById("leadId").value = "";
  document.getElementById("modalTitle").textContent = "Add New Lead";

  // Set default currency
  if (document.getElementById("budgetCurrency")) {
    document.getElementById("budgetCurrency").value = defaultCurrency;
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
      element.removeAttribute("readonly");
      if (element.tagName === "SELECT") {
        element.removeAttribute("disabled");
      }
    }
  });

  // Clear any error messages
  document.querySelectorAll(".error-message").forEach((el) => {
    el.style.display = "none";
  });

  // Show submit button
  document.querySelector('#leadForm button[type="submit"]').style.display =
    "block";

  // IMPORTANT NEW ADDITION: Clear the payments container
  const paymentsContainer = document.querySelector(".payments-container");
  if (paymentsContainer) {
    paymentsContainer.innerHTML = '<p class="payment-item">No payments yet</p>';
  }

  // IMPORTANT NEW ADDITION: Hide the Add Payment button for new leads
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  if (addPaymentBtn) {
    // Hide add payment button until the lead is saved
    addPaymentBtn.style.display = "none";
  }

  // IMPORTANT NEW ADDITION: Clear payment-related fields
  const paidAmountField = document.getElementById("paidAmount");
  if (paidAmountField) {
    paidAmountField.value = formatCurrency(0, defaultCurrency);
  }

  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.value = formatCurrency(0, defaultCurrency);
  }

  document.getElementById("leadModal").style.display = "block";
}

async function saveLead() {
  const leadId = document.getElementById("leadId").value;
  // Track if this is a new lead or an edit of existing lead
  let isNewLead = !leadId;

  // Get form data based on your schema
  const leadData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    textNumber: document.getElementById("textNumber").value || undefined,
    businessName: document.getElementById("businessName").value || "N/A",
    businessPhone: document.getElementById("businessPhone").value || undefined,
    businessEmail: document.getElementById("businessEmail").value || undefined,
    businessServices:
      document.getElementById("businessServices").value || undefined,
    preferredContact:
      document.getElementById("preferredContact").value || undefined,
    serviceDesired: document.getElementById("serviceDesired").value,
    hasWebsite: document.getElementById("hasWebsite").value || undefined,
    websiteAddress:
      document.getElementById("websiteAddress").value || undefined,
    message: document.getElementById("message").value || undefined,
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value || undefined,
  };

  // Add last contacted date if present
  const lastContactedInput = document.getElementById("lastContactedAt");
  if (lastContactedInput && lastContactedInput.value) {
    leadData.lastContactedAt = new Date(lastContactedInput.value);
  }

  // Handle estimated budget (what customer expects to spend)
  const budgetInput = document.getElementById("budget");
  const currencyInput = document.getElementById("currency");

  if (budgetInput && budgetInput.value) {
    // Extract numeric value from formatted budget
    const cleanBudgetValue = budgetInput.value.replace(/[^\d.-]/g, "");
    const numericBudgetValue = parseFloat(cleanBudgetValue);

    if (!isNaN(numericBudgetValue)) {
      // Store the budget value as a number
      leadData.budget = numericBudgetValue;

      if (currencyInput) {
        leadData.budgetCurrency = currencyInput.value;
      }
    }
  }

  // Handle billed amount/total budget (what you're charging)
  const totalBudgetInput = document.getElementById("totalBudget");
  const budgetCurrencyInput = document.getElementById("budgetCurrency");

  if (totalBudgetInput && totalBudgetInput.value) {
    // Extract numeric value from formatted total budget
    const cleanTotalValue = totalBudgetInput.value.replace(/[^\d.-]/g, "");
    const numericTotalValue = parseFloat(cleanTotalValue);

    if (!isNaN(numericTotalValue)) {
      // Store the total budget value as a number
      leadData.totalBudget = numericTotalValue;

      if (budgetCurrencyInput) {
        leadData.currency = budgetCurrencyInput.value;
      }
    }
  }

  // Debug: Log what we're sending
  console.log("Saving lead data:", leadData, "Is new lead:", isNewLead);

  try {
    let response;

    if (leadId) {
      // Update existing lead
      console.log(`Updating lead with ID: ${leadId}`);
      response = await fetch(`${API_URL}/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    } else {
      // Create new lead
      console.log("Creating new lead");
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save lead");
    }

    // Get the updated lead data from the response
    const updatedLead = await response.json();
    console.log("Received updated lead:", updatedLead);

    // If we're updating an existing lead, update it in the allLeads array
    if (leadId) {
      const index = allLeads.findIndex((lead) => lead._id === leadId);
      if (index !== -1) {
        allLeads[index] = updatedLead;
      }
    } else {
      // If it's a new lead, add it to the allLeads array
      allLeads.push(updatedLead);
    }

    // For new leads, initialize payment fields with zero values
    if (isNewLead && updatedLead._id) {
      console.log("Initializing payment fields for new lead");

      // Set paid amount to zero
      const paidAmountField = document.getElementById("paidAmount");
      if (paidAmountField) {
        paidAmountField.value = formatCurrency(
          0,
          updatedLead.currency || "USD"
        );
      }

      // Set remaining balance to total budget (since paid amount is zero)
      const remainingBalanceField = document.getElementById("remainingBalance");
      if (remainingBalanceField) {
        remainingBalanceField.value = formatCurrency(
          updatedLead.totalBudget || 0,
          updatedLead.currency || "USD"
        );
      }

      // Clear the payments container - make sure no payments from other leads appear
      const paymentsContainer = document.querySelector(".payments-container");
      if (paymentsContainer) {
        paymentsContainer.innerHTML =
          '<p class="payment-item">No payments found</p>';
      }

      // Now show the Add Payment button since we have a valid lead ID
      const addPaymentBtn = document.getElementById("addPaymentBtn");
      if (addPaymentBtn) {
        addPaymentBtn.style.display = "block";
      }
    }

    // Re-render the leads with the updated data
    renderLeads(allLeads);
    
    // Calculate stats immediately after updating a lead
    // This is the key addition to update the conversion rate immediately
    calculateStats();

    // Close modal
    closeLeadModal();

    // Show success message
    showToast(leadId ? "Lead updated successfully" : "Lead added successfully");
  } catch (error) {
    console.error("Error saving lead:", error);
    showToast("Error: " + error.message);
  }
}

// Make closeLeadModal globally available
window.closeLeadModal = function() {
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
  document.querySelector('#leadForm button[type="submit"]').style.display =
    "block";
    
  // Remove the modal actions container
  const modalActions = document.getElementById("modalActions");
  if (modalActions) {
    modalActions.remove();
  }
};

// Make openLeadModal globally available
window.openLeadModal = function(leadId) {
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
  document.getElementById("phone").value = formatPhoneNumber(lead.phone) || "";
  document.getElementById("textNumber").value = formatPhoneNumber(lead.textNumber) || "";
  document.getElementById("businessPhone").value = formatPhoneNumber(lead.businessPhone) || "";
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
      ? formatCurrency(budgetValue, lead.budgetCurrency || "USD")
      : "";
  }

  if (document.getElementById("currency")) {
    document.getElementById("currency").value = lead.budgetCurrency || "USD";
  }

  // Handle payment fields
  if (document.getElementById("totalBudget")) {
    const totalBudgetValue = lead.totalBudget !== undefined ? parseFloat(lead.totalBudget) : "";
    document.getElementById("totalBudget").value = totalBudgetValue
      ? formatCurrency(totalBudgetValue, lead.currency || "USD")
      : "";
  }

  if (document.getElementById("budgetCurrency")) {
    document.getElementById("budgetCurrency").value = lead.currency || "USD";
  }

  if (document.getElementById("paidAmount")) {
    const paidAmount = lead.paidAmount ? parseFloat(lead.paidAmount) : 0;
    document.getElementById("paidAmount").value = formatCurrency(
      paidAmount,
      lead.currency || "USD"
    );
  }

  // Calculate remaining balance from scratch
  let remainingBalance = 0;
  if (lead.totalBudget !== undefined) {
    const totalBudget = parseFloat(lead.totalBudget) || 0;
    const paidAmount = parseFloat(lead.paidAmount) || 0;
    remainingBalance = Math.max(0, totalBudget - paidAmount);
  }

  // Find or create the remaining balance field
  const remainingBalanceField = document.getElementById("remainingBalance");
  if (remainingBalanceField) {
    remainingBalanceField.value = formatCurrency(
      remainingBalance,
      lead.currency || "USD"
    );
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
      input.value = formatCurrency(remainingBalance, lead.currency || "USD");

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
  fetchLeadPayments(lead._id).then((leadPayments) => {
    renderLeadPayments(leadPayments, lead._id);
  });

  // Handle last contacted date
  if (document.getElementById("lastContactedAt") && lead.lastContactedAt) {
    const date = new Date(lead.lastContactedAt);
    // Format date as YYYY-MM-DD for input[type="date"]
    const formattedDate = date.toISOString().split("T")[0];
    document.getElementById("lastContactedAt").value = formattedDate;
  } else if (document.getElementById("lastContactedAt")) {
    document.getElementById("lastContactedAt").value = "";
  }

  // Show/hide website address field based on hasWebsite value
  const websiteAddressField = document.getElementById("websiteAddress").parentNode;
  websiteAddressField.style.display = lead.hasWebsite === "yes" ? "block" : "none";

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

  // Display the modal
  document.getElementById("leadModal").style.display = "block";
  
  // Then add modal action buttons (Edit, Delete)
  updateModalActionButtons(lead._id);
};

// Delete a lead
window.deleteLead = function (leadId) {
  if (confirm("Are you sure you want to delete this lead?")) {
    deleteLeadAction(leadId);
  }
};

// Delete lead API call
async function deleteLeadAction(leadId) {
  try {
    const response = await fetch(`${API_URL}/${leadId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete lead");
    }

    // Close the modal immediately after successful deletion
    closeLeadModal();
    
    // Refresh leads
    await fetchLeads();
    showToast("Lead deleted successfully");
  } catch (error) {
    console.error("Error deleting lead:", error);
    showToast("Error: " + error.message);
  }
}

function showToast(message, type = "default") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  toastMessage.textContent = message;

  // Remove any existing type classes
  toast.classList.remove("deletion");

  // Add deletion class for delete-related messages
  if (message.includes("deleted")) {
    toast.classList.add("deletion");
  }

  toast.style.display = "block";

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}
