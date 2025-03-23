// API URL Configuration
const API_URL = "http://localhost:5000/api/leads";

// Global variables
let allLeads = [];
let currentView = "grid"; // 'grid' or 'list'
let defaultCurrency = "USD"; // Store the default currency

// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Fetch leads on page load
  fetchLeads();

  // Set up event listeners
  document
    .getElementById("addLeadBtn")
    .addEventListener("click", openAddLeadModal);
  document
    .getElementById("closeModal")
    .addEventListener("click", closeLeadModal);
  document
    .getElementById("leadForm")
    .addEventListener("submit", validateAndSaveLead);
  document.getElementById("searchInput").addEventListener("input", searchLeads);
  document
    .getElementById("filterStatus")
    .addEventListener("change", filterLeads);
  document.getElementById("sortField").addEventListener("change", sortLeads);
  document.getElementById("sortOrder").addEventListener("change", sortLeads);
  document
    .getElementById("gridViewBtn")
    .addEventListener("click", () => switchView("grid"));
  document
    .getElementById("listViewBtn")
    .addEventListener("click", () => switchView("list"));

  // Show/hide website address field based on "hasWebsite" selection
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  if (hasWebsiteSelect) {
    hasWebsiteSelect.addEventListener("change", function () {
      const websiteAddressField =
        document.getElementById("websiteAddress").parentNode;
      if (this.value === "yes") {
        websiteAddressField.style.display = "block";
      } else {
        websiteAddressField.style.display = "none";
      }
    });
  }

  // Add currency formatting for budget input
  const budgetInput = document.getElementById("budget");
  if (budgetInput) {
    budgetInput.addEventListener("blur", function (e) {
      if (this.value) {
        // Format number with 2 decimal places
        const value = parseFloat(this.value.replace(/[^\d.-]/g, ""));
        if (!isNaN(value)) {
          const currency = document.getElementById("currency").value;
          this.value = formatCurrency(value, currency);
        }
      }
    });
  }

  // Setup sidebar navigation
  document
    .querySelector('.sidebar-menu a[href="#"]')
    .addEventListener("click", function (e) {
      e.preventDefault();
      // This is the Dashboard link (already active)
    });

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === document.getElementById("leadModal")) {
      closeLeadModal();
    }
  });

  // Add input validation listeners
  setupFormValidation();
});

// Theme Toggle Functionality
function setupThemeToggle() {
  // Check for saved theme preference or use preferred color scheme
  const currentTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Apply the theme
  setTheme(currentTheme);
  
  // Add theme toggle button to the header
  const header = document.querySelector('.header');
  const toggleButton = document.createElement('button');
  toggleButton.className = 'theme-toggle';
  toggleButton.id = 'themeToggle';
  toggleButton.innerHTML = currentTheme === 'dark' 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
  toggleButton.setAttribute('title', currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  
  // Insert the toggle button after the header title
  const headerTitle = header.querySelector('h2');
  if (headerTitle) {
    headerTitle.parentNode.insertBefore(toggleButton, headerTitle.nextSibling);
  } else {
    header.prepend(toggleButton);
  }
  
  // Add click event listener
  toggleButton.addEventListener('click', toggleTheme);
}

// Toggle between light and dark themes
// Toggle between light and dark themes
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update the toggle button icon in the header
  const toggleButton = document.getElementById('themeToggle');
  if (toggleButton) {
    toggleButton.innerHTML = newTheme === 'dark' 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
    toggleButton.setAttribute('title', newTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }
  
  // Update the sidebar toggle icon as well
  const sidebarToggle = document.querySelector('.sidebar-menu li:last-child a i');
  if (sidebarToggle) {
    sidebarToggle.className = `fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}`;
  }
}

// Set theme on HTML element
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Setup theme toggle in the sidebar
function setupSidebarThemeToggle() {
  // Get all sidebar menu items
  const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');
  
  // If we have at least one item, use the last one for theme toggle
  if (sidebarMenuItems.length > 0) {
    // Use the last item in the list (whatever it is)
    const lastItem = sidebarMenuItems[sidebarMenuItems.length - 1];
    
    if (lastItem) {
      const link = lastItem.querySelector('a');
      if (link) {
        // Get current theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        
        // Create the HTML with the icon and text properly aligned
        link.innerHTML = `
          <i class="fas fa-${currentTheme === 'dark' ? 'sun' : 'moon'}"></i>
          <span style="margin-left: 10px;">Theme Toggle</span>
        `;
        
        // Update click handler
        link.href = "#";
        
        // Remove any existing event listeners and create a fresh link
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Add new click handler
        newLink.addEventListener('click', function(e) {
          e.preventDefault();
          toggleTheme();
          
          // Update the sidebar icon when toggling
          const icon = this.querySelector('i');
          if (icon) {
            const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
            icon.className = `fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}`;
          }
        });
      }
    }
  }
}

// Initialize theme functionality
document.addEventListener("DOMContentLoaded", function() {
  // Setup initial theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  }
  
  // Add theme toggle to header
  setupThemeToggle();
  
  // Setup sidebar theme toggle (renamed from replaceSidebarLinks)
  setupSidebarThemeToggle();
});

// Setup form validation
function setupFormValidation() {
  // Add validation for email fields
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

  // Add validation for phone fields
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

  // Add validation for names
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

  // Add validation for website address
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

  // Add validation for budget
  const budgetInput = document.getElementById("budget");
  if (budgetInput) {
    budgetInput.addEventListener("blur", function () {
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
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  const errorElement = getErrorElement(input);

  if (input.value && !urlRegex.test(input.value)) {
    showInputError(input, errorElement, "Please enter a valid website address");
    return false;
  } else {
    clearInputError(input, errorElement);
    return true;
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

// Fetch leads from API
// Updated fetch leads function with better error handling
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

    console.log("Number of leads:", data.length);

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

    // Safely calculate stats
    try {
      calculateStats();
    } catch (statsError) {
      console.error("Error calculating stats:", statsError);

      // Set default values for statistics when calculation fails
      safeSetTextContent("totalLeadsValue", data.length.toString());
      safeSetTextContent("newLeadsValue", "0");
      safeSetTextContent("conversionRateValue", "0%");
      safeSetTextContent("avgBudgetValue", formatCurrency(0, "USD"));

      // Set all change indicators to 0%
      safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
      safeUpdateChangeIndicator("newLeadsChange", 0, "week");
      safeUpdateChangeIndicator("conversionChange", 0, "month");
      safeUpdateChangeIndicator("budgetChange", 0, "month");
    }
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
    safeSetTextContent("avgBudgetValue", formatCurrency(0, "USD"));

    // Set all change indicators to 0%
    safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
    safeUpdateChangeIndicator("newLeadsChange", 0, "week");
    safeUpdateChangeIndicator("conversionChange", 0, "month");
    safeUpdateChangeIndicator("budgetChange", 0, "month");

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
      safeSetTextContent("avgBudgetValue", formatCurrency(0, "USD"));

      // Set all change indicators to 0%
      safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
      safeUpdateChangeIndicator("newLeadsChange", 0, ""); // No period text for new leads
      safeUpdateChangeIndicator("conversionChange", 0, "month");
      safeUpdateChangeIndicator("budgetChange", 0, "month");
      return;
    }

    // Get current date and calculate previous periods
    const currentDate = new Date();

    // Create date objects for previous periods
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    const twoMonthsAgo = new Date(currentDate);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    // Calculate total leads
    const totalLeads = allLeads.length;
    safeSetTextContent("totalLeadsValue", totalLeads);

    // Calculate leads from last month
    const lastMonthLeads = allLeads.filter((lead) => {
      if (!lead || !lead.createdAt) return false;
      try {
        const leadDate = new Date(lead.createdAt);
        return (
          !isNaN(leadDate.getTime()) &&
          leadDate >= oneMonthAgo &&
          leadDate <= currentDate
        );
      } catch (e) {
        return false;
      }
    }).length;

    // Calculate leads from two months ago
    const twoMonthsAgoLeads = allLeads.filter((lead) => {
      if (!lead || !lead.createdAt) return false;
      try {
        const leadDate = new Date(lead.createdAt);
        return (
          !isNaN(leadDate.getTime()) &&
          leadDate >= twoMonthsAgo &&
          leadDate <= oneMonthAgo
        );
      } catch (e) {
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

    // Calculate average budget with error handling
    let mostCommonCurrency = "USD";
    let average = 0;
    let currentMonthAvg = 0;
    let previousMonthAvg = 0;

    try {
      // Filter leads with valid budgets
      const leadsWithBudget = allLeads.filter((lead) => {
        if (!lead || !lead.budget) return false;
        try {
          const budgetStr = String(lead.budget);
          const numericValue = parseFloat(budgetStr.replace(/[^\d.-]+/g, ""));
          return !isNaN(numericValue) && numericValue > 0;
        } catch (e) {
          return false;
        }
      });

      // Only process if we have leads with budgets
      if (leadsWithBudget.length > 0) {
        // Find most common currency
        const currencies = {};
        leadsWithBudget.forEach((lead) => {
          const currency = lead.currency || "USD";
          currencies[currency] = (currencies[currency] || 0) + 1;
        });

        let maxCount = 0;
        for (const [currency, count] of Object.entries(currencies)) {
          if (count > maxCount) {
            mostCommonCurrency = currency;
            maxCount = count;
          }
        }

        // Calculate overall average
        let totalBudget = 0;
        let count = 0;

        leadsWithBudget.forEach((lead) => {
          if (
            lead.currency === mostCommonCurrency ||
            (!lead.currency && mostCommonCurrency === "USD")
          ) {
            try {
              const budgetStr = String(lead.budget);
              const numericValue = parseFloat(
                budgetStr.replace(/[^\d.-]+/g, "")
              );
              if (!isNaN(numericValue)) {
                totalBudget += numericValue;
                count++;
              }
            } catch (e) {
              // Skip this lead if error
            }
          }
        });

        if (count > 0) {
          average = totalBudget / count;
        }

        // Calculate current month's average
        const currentMonthLeads = leadsWithBudget.filter((lead) => {
          if (!lead || !lead.createdAt) return false;
          try {
            const leadDate = new Date(lead.createdAt);
            return (
              !isNaN(leadDate.getTime()) &&
              leadDate >= oneMonthAgo &&
              leadDate <= currentDate
            );
          } catch (e) {
            return false;
          }
        });

        let currentMonthTotal = 0;
        let currentMonthCount = 0;

        currentMonthLeads.forEach((lead) => {
          if (
            lead.currency === mostCommonCurrency ||
            (!lead.currency && mostCommonCurrency === "USD")
          ) {
            try {
              const budgetStr = String(lead.budget);
              const numericValue = parseFloat(
                budgetStr.replace(/[^\d.-]+/g, "")
              );
              if (!isNaN(numericValue)) {
                currentMonthTotal += numericValue;
                currentMonthCount++;
              }
            } catch (e) {
              // Skip this lead if error
            }
          }
        });

        if (currentMonthCount > 0) {
          currentMonthAvg = currentMonthTotal / currentMonthCount;
        }

        // Calculate previous month's average
        const previousMonthLeads = leadsWithBudget.filter((lead) => {
          if (!lead || !lead.createdAt) return false;
          try {
            const leadDate = new Date(lead.createdAt);
            return (
              !isNaN(leadDate.getTime()) &&
              leadDate >= twoMonthsAgo &&
              leadDate <= oneMonthAgo
            );
          } catch (e) {
            return false;
          }
        });

        let previousMonthTotal = 0;
        let previousMonthCount = 0;

        previousMonthLeads.forEach((lead) => {
          if (
            lead.currency === mostCommonCurrency ||
            (!lead.currency && mostCommonCurrency === "USD")
          ) {
            try {
              const budgetStr = String(lead.budget);
              const numericValue = parseFloat(
                budgetStr.replace(/[^\d.-]+/g, "")
              );
              if (!isNaN(numericValue)) {
                previousMonthTotal += numericValue;
                previousMonthCount++;
              }
            } catch (e) {
              // Skip this lead if error
            }
          }
        });

        if (previousMonthCount > 0) {
          previousMonthAvg = previousMonthTotal / previousMonthCount;
        }
      }
    } catch (error) {
      console.error("Error calculating budget statistics:", error);
    }

    // Update budget display
    try {
      safeSetTextContent(
        "avgBudgetValue",
        formatCurrency(average, mostCommonCurrency)
      );
    } catch (error) {
      console.error("Error formatting currency:", error);
      safeSetTextContent("avgBudgetValue", `$${average.toFixed(2)}`);
    }

    // Calculate percentage change for budget
    let budgetChange = 0;
    if (previousMonthAvg > 0) {
      budgetChange =
        ((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100;
    }

    // Update budget change display
    safeUpdateChangeIndicator("budgetChange", budgetChange, "month");
  } catch (error) {
    console.error("Error calculating statistics:", error);
    // Set default values in case of error
    safeSetTextContent("totalLeadsValue", "0");
    safeSetTextContent("newLeadsValue", "0");
    safeSetTextContent("conversionRateValue", "0%");
    safeSetTextContent("avgBudgetValue", formatCurrency(0, "USD"));

    // Set all change indicators to 0%
    safeUpdateChangeIndicator("totalLeadsChange", 0, "month");
    safeUpdateChangeIndicator("newLeadsChange", 0, ""); // No period text for new leads
    safeUpdateChangeIndicator("conversionChange", 0, "month");
    safeUpdateChangeIndicator("budgetChange", 0, "month");
  }
}

// Render leads based on current view
function renderLeads(leads) {
  console.log("Rendering leads:", leads); // Debug
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

// Render Grid View
function renderGridView(leads) {
  const leadCards = document.getElementById("leadCards");
  leadCards.innerHTML = "";

  if (leads.length === 0) {
    leadCards.innerHTML = '<div class="lead-card"><p>No leads found</p></div>';
    return;
  }

  leads.forEach((lead) => {
    const card = document.createElement("div");
    card.className = "lead-card";

    // Format dates
    const createdDate = lead.createdAt
      ? new Date(lead.createdAt).toLocaleDateString()
      : "N/A";

    // Always display Last Contacted date field
    let lastContactedDate = "N/A";
    if (lead.lastContactedAt) {
      // Parse the stored date
      const dateObj = new Date(lead.lastContactedAt);

      // Fix timezone offset issue by adding one day if time is at midnight
      if (dateObj.getUTCHours() === 0 && dateObj.getUTCMinutes() === 0) {
        dateObj.setDate(dateObj.getDate() + 1);
      }

      // Format as local date string
      lastContactedDate = dateObj.toLocaleDateString();
    }

    // Handle name display based on your schema
    const fullName = getLeadName(lead);

    // Determine service type display
    let serviceType = lead.serviceDesired || "N/A";
    if (serviceType === "website") serviceType = "Website";
    if (serviceType === "app") serviceType = "App Development";

    // Format budget with the correct currency symbol
    let budget = "N/A";
    if (lead.budget) {
      const numericValue = parseFloat(
        String(lead.budget).replace(/[^\d.-]+/g, "")
      );
      if (!isNaN(numericValue)) {
        budget = formatCurrency(numericValue, lead.currency || "USD");
      } else {
        budget = lead.budget;
      }
    }

    // Determine preferred contact method display
    let preferredContact = lead.preferredContact || "N/A";
    switch (preferredContact) {
      case "phone":
        preferredContact = "Phone";
        break;
      case "email":
        preferredContact = "Email";
        break;
      case "text":
        preferredContact = "Text";
        break;
      case "businessPhone":
        preferredContact = "Business Phone";
        break;
      case "businessEmail":
        preferredContact = "Business Email";
        break;
    }

    // Check if has website
    const hasWebsite =
      lead.hasWebsite === "yes"
        ? "Yes"
        : lead.hasWebsite === "no"
        ? "No"
        : "N/A";

    // Display business information with N/A as default
    const businessName = lead.businessName || "N/A";
    const businessEmail = lead.businessEmail || "N/A";

    card.innerHTML = `
            <h3>${fullName}</h3>
            <p><strong>Email:</strong> ${lead.email || "N/A"}</p>
            <p><strong>Phone:</strong> ${lead.phone || "N/A"}</p>
            ${lead.textNumber ? `<p><strong>Text Number:</strong> ${lead.textNumber}</p>` : ""}
            <p><strong>Business:</strong> ${businessName}</p>
            ${lead.businessPhone ? `<p><strong>Business Phone:</strong> ${lead.businessPhone}</p>` : ""}
            <p><strong>Business Email:</strong> ${businessEmail}</p>
            ${lead.preferredContact ? `<p><strong>Preferred Contact:</strong> ${preferredContact}</p>` : ""}
            <p><strong>Service:</strong> ${serviceType}</p>
            <p><strong>Has Website:</strong> ${hasWebsite}</p>
            ${lead.websiteAddress ? `<p><strong>Website:</strong> ${lead.websiteAddress}</p>` : ""}
            <p><strong>Budget:</strong> ${budget}</p>
            <p><strong>Created:</strong> ${createdDate}</p>
            <p><strong>Last Contacted:</strong> ${lastContactedDate}</p>
            <p><strong>Status:</strong> <span class="lead-status status-${(lead.status || "new").toLowerCase()}">${capitalizeFirstLetter(lead.status || "new")}</span></p>
            <div class="lead-card-actions">
                <button onclick="viewLead('${lead._id}')"><i class="fas fa-eye"></i></button>
                <button onclick="editLead('${lead._id}')"><i class="fas fa-edit"></i></button>
                <button onclick="deleteLead('${lead._id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;

    leadCards.appendChild(card);
  });
}

function renderListView(leads) {
  const leadsTableBody = document.getElementById("leadsTableBody");
  leadsTableBody.innerHTML = "";

  if (leads.length === 0) {
    leadsTableBody.innerHTML = '<tr><td colspan="9">No leads found</td></tr>';
    return;
  }

  leads.forEach((lead) => {
    const row = document.createElement("tr");

    // Format dates
    const createdDate = lead.createdAt
      ? new Date(lead.createdAt).toLocaleDateString()
      : "N/A";

    // Always display Last Contacted date
    let lastContactedDate = "N/A";
    if (lead.lastContactedAt) {
      // Parse the stored date
      const dateObj = new Date(lead.lastContactedAt);
      
      // Fix timezone offset issue
      if (dateObj.getUTCHours() === 0 && dateObj.getUTCMinutes() === 0) {
        dateObj.setDate(dateObj.getDate() + 1);
      }
      
      // Format as local date string
      lastContactedDate = dateObj.toLocaleDateString();
    }

    // Handle name display based on your schema
    const fullName = getLeadName(lead);

    // Format budget with the correct currency symbol
    let budget = "N/A";
    if (lead.budget) {
      const numericValue = parseFloat(
        String(lead.budget).replace(/[^\d.-]/g, "")
      );
      if (!isNaN(numericValue)) {
        budget = formatCurrency(numericValue, lead.currency || "USD");
      } else {
        budget = lead.budget;
      }
    }

    // Determine business info and handle empty values
    const business = lead.businessName || "N/A";

    row.innerHTML = `
            <td>${fullName}</td>
            <td>${lead.email || "N/A"}</td>
            <td>${lead.phone || "N/A"}</td>
            <td>${business}</td>
            <td>${budget}</td>
            <td>${createdDate}</td>
            <td>${lastContactedDate}</td>
            <td><span class="lead-status status-${(lead.status || "new").toLowerCase()}">${capitalizeFirstLetter(lead.status || "new")}</span></td>
            <td>
                <button onclick="viewLead('${lead._id}')"><i class="fas fa-eye"></i></button>
                <button onclick="editLead('${lead._id}')"><i class="fas fa-edit"></i></button>
                <button onclick="deleteLead('${lead._id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;

    leadsTableBody.appendChild(row);
  });
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

// Corrected sortLeadsAndRender function with proper Last Contacted sorting
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
          return hasContactA ? 1 : -1;  // false (-1) comes before true (1)
        } else {
          // For DESC (newest first): entries with dates first
          return hasContactA ? -1 : 1;  // true (-1) comes before false (1)
        }
      } else if (hasContactA && hasContactB) {
        // Both have contact dates, compare normally
        const dateA = new Date(a.lastContactedAt);
        const dateB = new Date(b.lastContactedAt);
        comparison = dateA - dateB;
        
        // For DESC (newest first): reverse the comparison
        if (sortOrder === "desc") {
          comparison = -comparison;  // This will make newer dates come first
        }
      } else {
        // Both don't have contact dates - they're equal
        comparison = 0;
      }
    } else if (sortField === "firstName") {
      // Sort by last name first, then first name
      const lastNameA = (a.lastName || '').toLowerCase();
      const lastNameB = (b.lastName || '').toLowerCase();
      
      // If last names are different, sort by last name
      if (lastNameA !== lastNameB) {
        comparison = lastNameA.localeCompare(lastNameB);
      } else {
        // If last names are the same, sort by first name
        const firstNameA = (a.firstName || '').toLowerCase();
        const firstNameB = (b.firstName || '').toLowerCase();
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
        comparison = businessA.toLowerCase().localeCompare(businessB.toLowerCase());
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
    } else if (sortField === "budget") {
      // Extract numeric values from budget strings
      const budgetA = a.budget
        ? parseFloat(String(a.budget).replace(/[^\d.-]+/g, ""))
        : 0;
      const budgetB = b.budget
        ? parseFloat(String(b.budget).replace(/[^\d.-]+/g, ""))
        : 0;
      comparison = budgetA - budgetB;
    } else if (sortField === "status") {
      // Custom status order: new, contacted, in-progress, closed-won, closed-lost
      const statusOrder = {
        "new": 1,
        "contacted": 2,
        "in-progress": 3,
        "closed-won": 4,
        "closed-lost": 5
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
    const combinedSort = document.getElementById('combinedSort');
    if (combinedSort) { // Check if the element exists
      const sortField = document.getElementById('sortField');
      const sortOrder = document.getElementById('sortOrder');
      
      // Add event listener to update hidden dropdowns when the combined dropdown changes
      combinedSort.addEventListener('change', function() {
        // Get the selected value which has format "field-order"
        const [field, order] = this.value.split('-');
        
        // Update the hidden dropdowns
        sortField.value = field;
        sortOrder.value = order;
        
        // Trigger change events to make the main JS apply the sorting
        sortField.dispatchEvent(new Event('change'));
        sortOrder.dispatchEvent(new Event('change'));
      });
      
      // Initialize with the default value
      combinedSort.dispatchEvent(new Event('change'));
    }
  
// Open the add lead modal
function openAddLeadModal() {
  const leadForm = document.getElementById("leadForm");
  leadForm.reset();
  document.getElementById("leadId").value = "";
  document.getElementById("modalTitle").textContent = "Add New Lead";

  // Set default currency
  if (document.getElementById("currency")) {
    document.getElementById("currency").value = defaultCurrency;
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

  document.getElementById("leadModal").style.display = "block";
}

// Close the lead modal
function closeLeadModal() {
  document.getElementById("leadModal").style.display = "none";

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

  // Show the submit button again
  document.querySelector('#leadForm button[type="submit"]').style.display =
    "block";
}

// Save a lead (create or update)
async function saveLead() {
  const leadId = document.getElementById("leadId").value;

  // Get form data based on your schema
  const leadData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    textNumber: document.getElementById("textNumber").value || undefined,
    businessName: document.getElementById("businessName").value || undefined,
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

  // Add budget and currency if present
  const budgetInput = document.getElementById("budget");
  const currencyInput = document.getElementById("currency");

  if (budgetInput && budgetInput.value) {
    // Extract numeric value
    const numericValue = parseFloat(budgetInput.value.replace(/[^\d.-]/g, ""));

    if (!isNaN(numericValue)) {
      // Store the budget value and currency type
      leadData.budget = String(numericValue);

      if (currencyInput) {
        leadData.currency = currencyInput.value;
      }
    }
  }

  // Debug: Log what we're sending
  console.log("Saving lead data:", leadData);

  try {
    let response;

    if (leadId) {
      // Update existing lead
      response = await fetch(`${API_URL}/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    } else {
      // Create new lead
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

    // Refresh leads and close modal
    await fetchLeads();
    closeLeadModal();

    // Show success message
    showToast(leadId ? "Lead updated successfully" : "Lead added successfully");
  } catch (error) {
    console.error("Error saving lead:", error);
    showToast("Error: " + error.message);
  }
}

// View lead details
window.viewLead = function (leadId) {
  const lead = allLeads.find((l) => l._id === leadId);
  if (!lead) {
    showToast("Lead not found");
    return;
  }

  // Fill the form with lead data but make all fields readonly
  document.getElementById("leadId").value = lead._id;
  document.getElementById("firstName").value = lead.firstName || "";
  document.getElementById("lastName").value = lead.lastName || "";
  document.getElementById("email").value = lead.email || "";
  document.getElementById("phone").value = lead.phone || "";
  document.getElementById("textNumber").value = lead.textNumber || "";
  document.getElementById("businessName").value = lead.businessName || "";
  document.getElementById("businessPhone").value = lead.businessPhone || "";
  document.getElementById("businessEmail").value = lead.businessEmail || "";
  document.getElementById("businessServices").value =
    lead.businessServices || "";
  document.getElementById("preferredContact").value =
    lead.preferredContact || "";
  document.getElementById("serviceDesired").value =
    lead.serviceDesired || "website";
  document.getElementById("hasWebsite").value = lead.hasWebsite || "";
  document.getElementById("websiteAddress").value = lead.websiteAddress || "";
  document.getElementById("message").value = lead.message || "";
  document.getElementById("status").value = lead.status || "new";
  document.getElementById("notes").value = lead.notes || "";

  // Handle last contacted date
  if (document.getElementById("lastContactedAt") && lead.lastContactedAt) {
    const date = new Date(lead.lastContactedAt);
    // Format date as YYYY-MM-DD for input[type="date"]
    const formattedDate = date.toISOString().split("T")[0];
    document.getElementById("lastContactedAt").value = formattedDate;
  } else if (document.getElementById("lastContactedAt")) {
    document.getElementById("lastContactedAt").value = "";
  }

  // Handle budget and currency
  if (document.getElementById("budget")) {
    document.getElementById("budget").value = lead.budget || "";
  }

  if (document.getElementById("currency")) {
    // Make sure to set the correct currency value from the lead
    document.getElementById("currency").value = lead.currency || "USD";
  }

  // Show/hide website address field based on hasWebsite value
  const websiteAddressField =
    document.getElementById("websiteAddress").parentNode;
  websiteAddressField.style.display =
    lead.hasWebsite === "yes" ? "block" : "none";

  // Make all fields readonly
  const formElements = document.querySelectorAll(
    "#leadForm input, #leadForm select, #leadForm textarea"
  );
  formElements.forEach((element) => {
    element.setAttribute("readonly", true);
    if (element.tagName === "SELECT") {
      element.setAttribute("disabled", true);
    }
  });

  // Hide the submit button
  document.querySelector('#leadForm button[type="submit"]').style.display =
    "none";

  // Update modal title and open it
  document.getElementById("modalTitle").textContent = "View Lead";
  document.getElementById("leadModal").style.display = "block";
};

// Edit a lead
window.editLead = function (leadId) {
  const lead = allLeads.find((l) => l._id === leadId);
  if (!lead) {
    showToast("Lead not found");
    return;
  }

  // Clear any error messages
  document.querySelectorAll(".error-message").forEach((el) => {
    el.style.display = "none";
  });

  // Fill the form with lead data
  document.getElementById("leadId").value = lead._id;

  // Handle different name fields
  if (lead.firstName !== undefined) {
    document.getElementById("firstName").value = lead.firstName || "";
  } else if (lead.name) {
    // Try to split the name if it's a full name
    const nameParts = lead.name.split(" ");
    if (nameParts.length > 1) {
      document.getElementById("firstName").value = nameParts[0] || "";
      document.getElementById("lastName").value =
        nameParts.slice(1).join(" ") || "";
    } else {
      document.getElementById("firstName").value = lead.name || "";
    }
  }

  if (lead.lastName !== undefined) {
    document.getElementById("lastName").value = lead.lastName || "";
  }

  // Fill in all other fields
  document.getElementById("email").value = lead.email || "";
  document.getElementById("phone").value = lead.phone || "";
  document.getElementById("textNumber").value = lead.textNumber || "";
  document.getElementById("businessName").value = lead.businessName || "";
  document.getElementById("businessPhone").value = lead.businessPhone || "";
  document.getElementById("businessEmail").value = lead.businessEmail || "";
  document.getElementById("businessServices").value =
    lead.businessServices || "";
  document.getElementById("preferredContact").value =
    lead.preferredContact || "";
  document.getElementById("serviceDesired").value =
    lead.serviceDesired || "website";
  document.getElementById("hasWebsite").value = lead.hasWebsite || "";
  document.getElementById("websiteAddress").value = lead.websiteAddress || "";
  document.getElementById("message").value = lead.message || "";
  document.getElementById("status").value = lead.status || "new";
  document.getElementById("notes").value = lead.notes || "";

  // Handle last contacted date
  if (document.getElementById("lastContactedAt") && lead.lastContactedAt) {
    const date = new Date(lead.lastContactedAt);
    // Format date as YYYY-MM-DD for input[type="date"]
    const formattedDate = date.toISOString().split("T")[0];
    document.getElementById("lastContactedAt").value = formattedDate;
  } else if (document.getElementById("lastContactedAt")) {
    document.getElementById("lastContactedAt").value = "";
  }

  // Handle budget and currency
  if (document.getElementById("budget")) {
    document.getElementById("budget").value = lead.budget || "";
  }

  if (document.getElementById("currency")) {
    // Make sure to set the correct currency value from the lead
    document.getElementById("currency").value = lead.currency || "USD";
  }

  // Show/hide website address field based on hasWebsite value
  const websiteAddressField =
    document.getElementById("websiteAddress").parentNode;
  websiteAddressField.style.display =
    lead.hasWebsite === "yes" ? "block" : "none";

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

  // Show submit button
  document.querySelector('#leadForm button[type="submit"]').style.display =
    "block";

  // Update modal title and open it
  document.getElementById("modalTitle").textContent = "Edit Lead";
  document.getElementById("leadModal").style.display = "block";
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

    // Refresh leads
    await fetchLeads();
    showToast("Lead deleted successfully");
  } catch (error) {
    console.error("Error deleting lead:", error);
    showToast("Error: " + error.message);
  }
}



function showToast(message, type = 'default') {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  toastMessage.textContent = message;
  
  // Remove any existing type classes
  toast.classList.remove('deletion');
  
  // Add deletion class for delete-related messages
  if (message.includes('deleted')) {
    toast.classList.add('deletion');
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