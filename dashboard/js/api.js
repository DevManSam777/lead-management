// api.js - Handles all API interactions

// API URL Configuration
const API_URL = "http://localhost:5000/api/leads";
const API_PAYMENTS_URL = "http://localhost:5000/api/payments";
const SETTINGS_API_URL = "http://localhost:5000/api/settings";
const FORMS_API_URL = "http://localhost:5000/api/forms";

// Helper function to get base URL
function getBaseUrl() {
  return "http://localhost:5000";
}

// ===== LEAD API FUNCTIONS =====

/**
 * Fetch all leads from the API
 * @returns {Promise<Array>} Array of lead objects
 */
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

    return data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
}

/**
 * Fetch a specific lead by ID
 * @param {string} leadId - ID of the lead to fetch
 * @returns {Promise<Object>} Lead object
 */
async function fetchLeadById(leadId) {
  try {
    const response = await fetch(`${API_URL}/${leadId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch lead");
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching lead ${leadId}:`, error);
    throw error;
  }
}

/**
 * Create a new lead
 * @param {Object} leadData - Lead data to create
 * @returns {Promise<Object>} Created lead object
 */
async function createLead(leadData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create lead");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
}

/**
 * Update an existing lead
 * @param {string} leadId - ID of the lead to update
 * @param {Object} leadData - Updated lead data
 * @returns {Promise<Object>} Updated lead object
 */
async function updateLead(leadId, leadData) {
  try {
    const response = await fetch(`${API_URL}/${leadId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update lead");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

/**
 * Delete a lead
 * @param {string} leadId - ID of the lead to delete
 * @returns {Promise<Object>} Deletion response
 */
async function deleteLead(leadId) {
  try {
    const response = await fetch(`${API_URL}/${leadId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete lead");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
}

/**
 * Search leads by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching lead objects
 */
async function searchLeads(query) {
  try {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error("Failed to search leads");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching leads:", error);
    throw error;
  }
}

// ===== PAYMENT API FUNCTIONS =====

/**
 * Fetch all payments
 * @returns {Promise<Array>} Array of payment objects
 */
async function fetchPayments() {
  try {
    const response = await fetch(API_PAYMENTS_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch payments");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
}

/**
 * Fetch payments for a specific lead
 * @param {string} leadId - ID of the lead
 * @returns {Promise<Array>} Array of payment objects for the lead
 */
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
    throw error;
  }
}

/**
 * Create a new payment
 * @param {Object} paymentData - Payment data to create
 * @returns {Promise<Object>} Created payment object
 */
async function createPayment(paymentData) {
  try {
    const response = await fetch(API_PAYMENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

/**
 * Update an existing payment
 * @param {string} paymentId - ID of the payment to update
 * @param {Object} paymentData - Updated payment data
 * @returns {Promise<Object>} Updated payment object
 */
async function updatePayment(paymentId, paymentData) {
  try {
    const response = await fetch(`${API_PAYMENTS_URL}/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
}

/**
 * Delete a payment
 * @param {string} paymentId - ID of the payment to delete
 * @returns {Promise<Object>} Deletion response
 */
async function deletePayment(paymentId) {
  try {
    const response = await fetch(`${API_PAYMENTS_URL}/${paymentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
}

// ===== SETTINGS API FUNCTIONS =====

/**
 * Fetch all settings
 * @returns {Promise<Object>} Settings object
 */
async function fetchAllSettings() {
  try {
    const response = await fetch(SETTINGS_API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }

    const settings = await response.json();
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);

    // Fallback to localStorage if API fails
    return {
      theme:
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"),
    };
  }
}

/**
 * Update a specific setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 * @returns {Promise<Object>} Updated setting object
 */
async function updateSetting(key, value) {
  try {
    const response = await fetch(`${SETTINGS_API_URL}/${key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      throw new Error("Failed to update setting");
    }

    const updatedSetting = await response.json();
    
    // Also update localStorage as a fallback
    localStorage.setItem(key, value);
    
    return updatedSetting;
  } catch (error) {
    console.error("Error updating setting:", error);
    
    // Update localStorage as a fallback
    localStorage.setItem(key, value);
    
    return { key, value };
  }
}

// ===== FORMS API FUNCTIONS =====

/**
 * Fetch all forms from the API
 * @param {Object} filters - Optional filters (category, isTemplate)
 * @returns {Promise<Array>} Array of form objects
 */
async function fetchForms(filters = {}) {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.category) {
      queryParams.append("category", filters.category);
    }
    
    if (filters.isTemplate !== undefined) {
      queryParams.append("isTemplate", filters.isTemplate);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `${FORMS_API_URL}?${queryString}` : FORMS_API_URL;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch forms");
    }
    
    const data = await response.json();
    
    // Make sure data is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received");
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching forms:", error);
    throw error;
  }
}

/**
 * Fetch a specific form by ID
 * @param {string} formId - ID of the form to fetch
 * @returns {Promise<Object>} Form object
 */
async function fetchFormById(formId) {
  try {
    const response = await fetch(`${FORMS_API_URL}/${formId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch form");
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching form ${formId}:`, error);
    throw error;
  }
}

/**
 * Create a new form
 * @param {Object} formData - Form data to create
 * @returns {Promise<Object>} Created form object
 */
async function createForm(formData) {
  try {
    const response = await fetch(FORMS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create form");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating form:", error);
    throw error;
  }
}

/**
 * Update an existing form
 * @param {string} formId - ID of the form to update
 * @param {Object} formData - Updated form data
 * @returns {Promise<Object>} Updated form object
 */
async function updateForm(formId, formData) {
  try {
    const response = await fetch(`${FORMS_API_URL}/${formId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update form");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating form:", error);
    throw error;
  }
}

/**
 * Delete a form
 * @param {string} formId - ID of the form to delete
 * @returns {Promise<Object>} Deletion response
 */
async function deleteForm(formId) {
  try {
    const response = await fetch(`${FORMS_API_URL}/${formId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete form");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error deleting form:", error);
    throw error;
  }
}

/**
 * Search forms by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching form objects
 */
async function searchForms(query) {
  try {
    const response = await fetch(`${FORMS_API_URL}/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error("Failed to search forms");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching forms:", error);
    throw error;
  }
}

/**
 * Clone a template form
 * @param {string} templateId - ID of the template form to clone
 * @returns {Promise<Object>} Cloned form object
 */
async function cloneTemplateForm(templateId) {
  try {
    const response = await fetch(`${FORMS_API_URL}/${templateId}/clone`, {
      method: "POST",
    });
    
    if (!response.ok) {
      throw new Error("Failed to clone template");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error cloning template:", error);
    throw error;
  }
}

/**
 * Generate a form with lead data
 * @param {string} formId - ID of the form to generate
 * @param {string} leadId - ID of the lead to use
 * @returns {Promise<Object>} Generated form content
 */
async function generateFormWithLeadData(formId, leadId) {
  try {
    const response = await fetch(`${FORMS_API_URL}/${formId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate form with lead data");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating form with lead data:", error);
    throw error;
  }
}

/**
 * Get forms for a specific lead
 * @param {string} leadId - ID of the lead
 * @returns {Promise<Array>} Array of forms
 */
async function getFormsByLead(leadId) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/forms/lead/${leadId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch forms for lead');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching forms for lead ${leadId}:`, error);
    throw error;
  }
}

/**
 * Generate a form for a lead using a template
 * @param {string} templateId - ID of the template form
 * @param {string} leadId - ID of the lead
 * @returns {Promise<Object>} Generated form
 */
async function generateFormForLead(templateId, leadId) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/forms/${templateId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ leadId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate form');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating form:', error);
    throw error;
  }
}

// Export all API functions
export {
  getBaseUrl,
  fetchLeads,
  fetchLeadById,
  createLead,
  updateLead,
  deleteLead,
  searchLeads,
  fetchPayments,
  fetchLeadPayments,
  createPayment,
  updatePayment,
  deletePayment,
  fetchAllSettings,
  updateSetting,
  fetchForms,
  fetchFormById,
  createForm,
  updateForm,
  deleteForm,
  searchForms,
  cloneTemplateForm,
  generateFormWithLeadData,
  getFormsByLead,
  generateFormForLead
};