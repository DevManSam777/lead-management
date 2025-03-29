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
    showToast,
    safeSetTextContent,
    safeUpdateChangeIndicator,
    capitalizeFirstLetter,
    getLeadName,
    showInputError,
    clearInputError,
    getErrorElement
  };