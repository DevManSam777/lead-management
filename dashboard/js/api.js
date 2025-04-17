const API_URL = "http://localhost:5000/api/leads";
const API_PAYMENTS_URL = "http://localhost:5000/api/payments";
const SETTINGS_API_URL = "http://localhost:5000/api/settings";
const FORMS_API_URL = "http://localhost:5000/api/forms";
const API_DOCUMENTS_URL = "http://localhost:5000/api/documents";

// Helper function to get base URL
function getBaseUrl() {
  return "http://localhost:5000";
}


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
 * @param {Object} leadData 
 * @returns {Promise<Object>} 
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
 * @param {string} leadId
 * @param {Object} leadData 
 * @returns {Promise<Object>} 
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
 * @param {string} leadId 
 * @returns {Promise<Object>}
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
 * @param {string} query 
 * @returns {Promise<Array>} 
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
 * @returns {Promise<Array>}
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
 * @param {string} leadId 
 * @returns {Promise<Array>}
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
 * @param {Object} paymentData 
 * @returns {Promise<Object>} 
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
 * @param {string} paymentId 
 * @param {Object} paymentData 
 * @returns {Promise<Object>} 
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
 * @param {string} paymentId 
 * @returns {Promise<Object>}
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



/**
 * Fetch all settings
 * @returns {Promise<Object>} 
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
 * @param {string} key
 * @param {*} value
 * @returns {Promise<Object>} 
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

/**
 * Fetch all forms from the API
 * @param {Object} filters
 * @returns {Promise<Array>} 
 */
async function fetchForms(filters = {}) {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.category) {
      queryParams.append("category", filters.category);
    }
    
    // Handle the new template/draft filter
    if (filters.templateType === "template") {
      queryParams.append("isTemplate", "true");
    } else if (filters.templateType === "draft") {
      queryParams.append("isTemplate", "false");
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
 * @param {string} formId 
 * @returns {Promise<Object>} 
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
 * @param {Object} formData 
 * @returns {Promise<Object>}
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
 * @param {string} formId 
 * @param {Object} formData
 * @returns {Promise<Object>} 
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
 * @param {string} formId 
 * @returns {Promise<Object>} 
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
 * @param {string} query
 * @returns {Promise<Array>}  
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
 * @param {string} templateId
 * @returns {Promise<Object>} 
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
 * @param {string} formId
 * @param {string} leadId 
 * @returns {Promise<Object>} 
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
 * @param {string} leadId
 * @returns {Promise<Array>} 
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
 * @param {string} templateId 
 * @param {string} leadId 
 * @returns {Promise<Object>} 
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


/**
 * Get documents for a specific lead
 * @param {string} leadId
 * @returns {Promise<Array>} 
 */
async function getDocumentsByLead(leadId) {
  try {
    const response = await fetch(`${API_DOCUMENTS_URL}/lead/${leadId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents for lead');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching documents for lead ${leadId}:`, error);
    throw error;
  }
}

/**
 * Upload a document for a lead
 * @param {string} leadId 
 * @param {Object} documentData 
 * @returns {Promise<Object>}
 */
async function uploadDocument(leadId, documentData) {
  try {
    const response = await fetch(`${API_DOCUMENTS_URL}/lead/${leadId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(documentData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload document');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Delete a document
 * @param {string} documentId 
 * @returns {Promise<Object>}
 */
async function deleteDocument(documentId) {
  try {
    const response = await fetch(`${API_DOCUMENTS_URL}/${documentId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}


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
  generateFormForLead,
  getDocumentsByLead,
  uploadDocument,
  deleteDocument
};