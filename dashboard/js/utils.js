// utils.js - Utility and helper functions

/**
 * Format a phone number to a consistent format
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
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

/**
 * Format currency with proper symbols
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
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

// /**
//  * Format a date according to the specified format
//  * @param {Date|string} date - Date to format
//  * @param {string} format - Format string (default: MM/DD/YYYY)
//  * @returns {string} Formatted date string
//  */
// function formatDate(date, format = "MM/DD/YYYY") {
//   if (!date) return "";

//   // Create a date object if string is provided
//   const dateObj = typeof date === "string" ? new Date(date) : date;

//   // Check if date is valid
//   if (isNaN(dateObj.getTime())) {
//     console.warn("Invalid date:", date);
//     return "";
//   }

//   const month = dateObj.getMonth() + 1; // getMonth() returns 0-11
//   const day = dateObj.getDate();
//   const year = dateObj.getFullYear();
  
//   // Create padded versions for single-digit values
//   const paddedMonth = month.toString().padStart(2, "0");
//   const paddedDay = day.toString().padStart(2, "0");

//   // Replace format tokens with actual values
//   let formattedDate = format;
//   formattedDate = formattedDate.replace(/YYYY/g, year);
//   formattedDate = formattedDate.replace(/YY/g, String(year).slice(-2));
//   formattedDate = formattedDate.replace(/MM/g, paddedMonth);
//   formattedDate = formattedDate.replace(/M/g, month);
//   formattedDate = formattedDate.replace(/DD/g, paddedDay);
//   formattedDate = formattedDate.replace(/D/g, day);

//   return formattedDate;
// }

function formatDate(date, format = "MM/DD/YYYY") {
  if (!date) return "";

  // Create a date object
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid date:", date);
    return "";
  }
  
  // Get UTC components to match the stored UTC date
  // This is the key fix - we use UTC methods instead of local time methods
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1; // getUTCMonth() returns 0-11
  const day = dateObj.getUTCDate();
  
  // Create padded versions for single-digit values
  const paddedMonth = month.toString().padStart(2, "0");
  const paddedDay = day.toString().padStart(2, "0");

  // Replace format tokens with actual values
  let formattedDate = format;
  formattedDate = formattedDate.replace(/YYYY/g, year);
  formattedDate = formattedDate.replace(/YY/g, String(year).slice(-2));
  formattedDate = formattedDate.replace(/MM/g, paddedMonth);
  formattedDate = formattedDate.replace(/M/g, month);
  formattedDate = formattedDate.replace(/DD/g, paddedDay);
  formattedDate = formattedDate.replace(/D/g, day);

  return formattedDate;
}

/**
 * Convert a formatted date string back to ISO format for inputs
 * @param {string} dateStr - Formatted date string 
 * @param {string} format - Format of the date string (default: MM/DD/YYYY)
 * @returns {string} ISO formatted date (YYYY-MM-DD)
 */
function toISODateString(dateStr, format = "MM/DD/YYYY") {
  if (!dateStr) return "";
  
  let year, month, day;
  
  // Extract parts based on the format
  if (format === "MM/DD/YYYY") {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return "";
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } 
  else if (format === "DD/MM/YYYY") {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return "";
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }
  else if (format === "YYYY-MM-DD") {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return "";
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  }
  else {
    // For other formats, use the Date object's parsing
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return "";
    year = dateObj.getFullYear();
    month = dateObj.getMonth() + 1;
    day = dateObj.getDate();
  }
  
  // Ensure valid values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return "";
  }
  
  // Format as YYYY-MM-DD for input[type="date"]
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * Format a datetime with both date and time
 * @param {Date|string} datetime - Datetime to format
 * @param {string} dateFormat - Date format (default: MM/DD/YYYY)
 * @returns {string} Formatted datetime string
 */
function formatDateTime(datetime, dateFormat = "MM/DD/YYYY") {
  if (!datetime) return "";

  // Create a date object if string is provided
  const dateObj = typeof datetime === "string" ? new Date(datetime) : datetime;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid datetime:", datetime);
    return "";
  }

  // Format the date
  const formattedDate = formatDate(dateObj, dateFormat);
  
  // Format the time
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  // Combine date and time
  return `${formattedDate} ${hours}:${minutes} ${ampm}`;
}

/**
 * Update a date input display to show the formatted date
 * @param {string} inputId - ID of the date input element
 * @param {string} displayId - ID of the display element
 * @param {string} format - Date format to use (default: from window.dateFormat)
 */
function updateDateInputDisplay(inputId, displayId, format = null) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  
  if (!input || !display) return;
  
  // Use provided format or global format
  const dateFormat = format || window.dateFormat || "MM/DD/YYYY";
  
  // Only update if input has a value
  if (input.value) {
    const date = new Date(input.value);
    display.textContent = formatDate(date, dateFormat);
  } else {
    display.textContent = "";
  }
}

/**
 * Set up event listeners for a date input and its display
 * @param {string} inputId - ID of the date input element
 * @param {string} displayId - ID of the display element
 */
function setupDateInput(inputId, displayId) {
  const input = document.getElementById(inputId);
  
  if (!input) return;
  
  // Update display when input changes
  input.addEventListener('change', function() {
    updateDateInputDisplay(inputId, displayId);
  });
  
  // Initial update
  updateDateInputDisplay(inputId, displayId);
}

/**
 * Initialize all date inputs in the application
 */
function initializeDateInputs() {
  // Setup date inputs with their display elements
  setupDateInput('lastContactedAt', 'lastContactedDisplay');
  setupDateInput('paymentDate', 'paymentDateDisplay');
  
  // Listen for date format changes
  window.addEventListener('settingsUpdated', function(event) {
    const { key, value } = event.detail;
    
    if (key === 'dateFormat') {
      // Update all date input displays with new format
      updateDateInputDisplay('lastContactedAt', 'lastContactedDisplay', value);
      updateDateInputDisplay('paymentDate', 'paymentDateDisplay', value);
    }
  });
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Notification type ('default' or 'deletion')
 */
function showToast(message, type = "default") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastMessage) {
    console.error("Toast elements not found");
    return;
  }

  toastMessage.textContent = message;

  // Remove any existing type classes
  toast.classList.remove("deletion");

  // Add deletion class for delete-related messages
  if (type === "deletion" || message.includes("deleted")) {
    toast.classList.add("deletion");
  }

  toast.style.display = "block";

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

/**
 * Helper function to safely set text content of an element
 * @param {string} elementId - ID of the element
 * @param {string} text - Text to set
 */
function safeSetTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  } else {
    console.warn(`Element with id ${elementId} not found in the DOM`);
  }
}

/**
 * Helper function to safely update change indicator
 * @param {string} elementId - ID of the element
 * @param {number} value - Value to display
 * @param {string} period - Period text (e.g., 'month')
 */
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

/**
 * Capitalize the first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Get the full name of a lead
 * @param {Object} lead - Lead object
 * @returns {string} Full name
 */
function getLeadName(lead) {
  if (lead.firstName && lead.lastName) {
    return `${lead.firstName} ${lead.lastName}`;
  } else if (lead.name) {
    return lead.name;
  } else {
    return "Unknown";
  }
}

/**
 * Show input error
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} errorElement - The error element
 * @param {string} message - Error message
 * @returns {boolean} Always returns false
 */
function showInputError(input, errorElement, message) {
  input.classList.add("invalid");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    input.parentNode.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.style.display = "block";
  return false;
}

/**
 * Clear input error
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} errorElement - The error element
 * @returns {boolean} Always returns true
 */
function clearInputError(input, errorElement) {
  input.classList.remove("invalid");

  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
  return true;
}

/**
 * Get or create error element for an input
 * @param {HTMLElement} input - The input element
 * @returns {HTMLElement} The error element
 */
function getErrorElement(input) {
  let errorElement = input.parentNode.querySelector(".error-message");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    input.parentNode.appendChild(errorElement);
  }

  return errorElement;
}

// Export the utility functions
export {
  formatPhoneNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  toISODateString,
  updateDateInputDisplay,
  setupDateInput,
  initializeDateInputs,
  showToast,
  safeSetTextContent,
  safeUpdateChangeIndicator,
  capitalizeFirstLetter,
  getLeadName,
  showInputError,
  clearInputError,
  getErrorElement
};