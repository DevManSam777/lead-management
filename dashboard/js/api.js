import { authApi } from "./authApi.js";

// const API_URL = "http://localhost:5000/api";
// const API_URL = "https://lead-management-8u3l.onrender.com/api";
const API_URL = "https://devleads.site/api";

// Helper function to get base URL
function getBaseUrl() {
  // return "http://localhost:5000";
  // return "https://lead-management-8u3l.onrender.com";
  return "https://devleads.site";
}

/**
 * Fetch all leads from the API
 * @returns {Promise<Array>} Array of lead objects
 */
async function fetchLeads() {
  try {
    console.log("Fetching leads from:", API_URL + "/leads");
    const data = await authApi.get("/leads");
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
    const data = await authApi.get(`/leads/${leadId}`);
    return data;
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
    const data = await authApi.post("/leads", leadData);
    return data;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
}

// In api.js, check if the update function is actually sending the data:
async function updateLead(leadId, leadData) {
  try {
    // Debug the data before sending
    console.log("Sending lead update data:", leadData);

    const data = await fetch(`${API_URL}/leads/${leadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    }).then((response) => response.json());

    return data;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

/**
 * Delete a lead with retry logic
 * @param {string} leadId
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<Object>}
 */
async function deleteLead(leadId, retries = 3) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }
    const token = await user.getIdToken();

    const response = await fetch(`${API_URL}/leads/${leadId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete lead");
    }

    return true;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying deleteLead... Attempts left: ${retries - 1}`);
      return deleteLead(leadId, retries - 1);
    }
    console.error("Error deleting lead after retries:", error);
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
    const data = await authApi.get(
      `/leads/search?query=${encodeURIComponent(query)}`
    );
    return data;
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
    const data = await authApi.get("/payments");
    return data;
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

    const payments = await authApi.get(`/payments/lead/${leadId}`);
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
    const data = await authApi.post("/payments", paymentData);
    return data;
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
    const data = await authApi.put(`/payments/${paymentId}`, paymentData);
    return data;
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
    const data = await authApi.delete(`/payments/${paymentId}`);
    return data;
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
    const settings = await authApi.get("/settings");
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
    const updatedSetting = await authApi.put(`/settings/${key}`, { value });

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
    const endpoint = queryString ? `/forms?${queryString}` : "/forms";

    const data = await authApi.get(endpoint);

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
    const data = await authApi.get(`/forms/${formId}`);
    return data;
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
    const data = await authApi.post("/forms", formData);
    return data;
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
    const data = await authApi.put(`/forms/${formId}`, formData);
    return data;
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
    const data = await authApi.delete(`/forms/${formId}`);
    return data;
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
    const data = await authApi.get(
      `/forms/search?query=${encodeURIComponent(query)}`
    );
    return data;
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
    const data = await authApi.post(`/forms/${templateId}/clone`);
    return data;
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
    const data = await authApi.post(`/forms/${formId}/generate`, { leadId });
    return data;
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
    const data = await authApi.get(`/forms/lead/${leadId}`);
    return data;
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
    const data = await authApi.post(`/forms/${templateId}/generate`, {
      leadId,
    });
    return data;
  } catch (error) {
    console.error("Error generating form:", error);
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
    const data = await authApi.get(`/documents/lead/${leadId}`);
    return data;
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
    const data = await authApi.post(`/documents/lead/${leadId}`, documentData);
    return data;
  } catch (error) {
    console.error("Error uploading document:", error);
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
    const data = await authApi.delete(`/documents/${documentId}`);
    return data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

// Hitlist API functions
async function fetchHitlists() {
  try {
    const data = await authApi.get("/hitlists");
    return data;
  } catch (error) {
    console.error("Error fetching hitlists:", error);
    throw error;
  }
}

async function fetchHitlistById(hitlistId) {
  try {
    const data = await authApi.get(`/hitlists/${hitlistId}`);
    return data;
  } catch (error) {
    console.error("Error fetching hitlist:", error);
    throw error;
  }
}

async function createHitlist(hitlistData) {
  try {
    const data = await authApi.post("/hitlists", hitlistData);
    return data;
  } catch (error) {
    console.error("Error creating hitlist:", error);
    throw error;
  }
}

async function updateHitlist(hitlistId, hitlistData) {
  try {
    const data = await authApi.put(`/hitlists/${hitlistId}`, hitlistData);
    return data;
  } catch (error) {
    console.error("Error updating hitlist:", error);
    throw error;
  }
}

async function deleteHitlist(hitlistId) {
  try {
    const data = await authApi.delete(`/hitlists/${hitlistId}`);
    return data;
  } catch (error) {
    console.error("Error deleting hitlist:", error);
    throw error;
  }
}

// Business API functions
async function fetchBusinessesByHitlist(hitlistId) {
  try {
    const data = await authApi.get(`/hitlists/${hitlistId}/businesses`);
    return data;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
}

async function createBusiness(hitlistId, businessData) {
  try {
    const data = await authApi.post(
      `/hitlists/${hitlistId}/businesses`,
      businessData
    );
    return data;
  } catch (error) {
    console.error("Error creating business:", error);
    throw error;
  }
}

async function updateBusiness(businessId, businessData) {
  try {
    const data = await authApi.put(
      `/hitlists/businesses/${businessId}`,
      businessData
    );
    return data;
  } catch (error) {
    console.error("Error updating business:", error);
    throw error;
  }
}

async function deleteBusiness(businessId) {
  try {
    const data = await authApi.delete(`/hitlists/businesses/${businessId}`);
    return data;
  } catch (error) {
    console.error("Error deleting business:", error);
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
  deleteDocument,
  fetchHitlists,
  fetchHitlistById,
  createHitlist,
  updateHitlist,
  deleteHitlist,
  fetchBusinessesByHitlist,
  createBusiness,
  updateBusiness,
  deleteBusiness,
};
