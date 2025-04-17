import * as API from "./api.js";
import * as Utils from "./utils.js";

// Load documents for a specific lead
async function loadLeadDocuments(leadId) {
  try {
    const documentsContainer = document.getElementById("signedDocumentsList");

    if (!documentsContainer) return;

    // Show loading
    documentsContainer.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading documents...</div>';

    // Fetch documents for this lead
    const response = await fetch(
      `${API.getBaseUrl()}/api/documents/lead/${leadId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch lead documents");
    }

    const documents = await response.json();

 
    // Clear container
    documentsContainer.innerHTML = "";

    // Get date format from window object or use default
    const dateFormat = window.dateFormat || "MM/DD/YYYY";

    // Add each document
    documents.forEach((doc) => {
      // Format dates
      let formattedUploadDate = "Not recorded";
      if (doc.uploadedAt) {
        const uploadDate = new Date(doc.uploadedAt);
        formattedUploadDate = Utils.formatDateTime(uploadDate, dateFormat);
      }

      const documentItem = document.createElement("div");
      documentItem.className = "document-item";
      documentItem.dataset.documentId = doc._id;

      documentItem.innerHTML = `
        <div class="document-details">
          <div class="document-title">${doc.fileName}</div>
          <div class="document-date">
            <i class="far fa-calendar-plus"></i> Uploaded: ${formattedUploadDate}
          </div>
        </div>
        <div class="document-actions">
          <button type="button" class="view-document" title="View Document">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="delete-document" title="Delete Document">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      // Add event listeners
      documentItem
        .querySelector(".view-document")
        .addEventListener("click", function (e) {
          e.stopPropagation();
          viewDocument(doc._id, doc.fileName);
        });

      documentItem
        .querySelector(".delete-document")
        .addEventListener("click", function (e) {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${doc.fileName}"?`)) {
            deleteDocument(doc._id, leadId);
          }
        });

      // Add to container
      documentsContainer.appendChild(documentItem);
    });

    // Setup upload area visibility based on edit mode
    updateDocumentUiForMode();
  } catch (error) {
    console.error("Error loading lead documents:", error);
    const documentsContainer = document.getElementById("signedDocumentsList");
    if (documentsContainer) {
      documentsContainer.innerHTML =
        '<p class="no-documents-message">Error loading documents</p>';
    }
  }
}

async function viewDocument(documentId, fileName) {
  try {
    // Instead of using an iframe, open the document in a new tab
    const documentUrl = `${API.getBaseUrl()}/api/documents/${documentId}`;
    
    // Open document in a new tab
    window.open(documentUrl, '_blank');
  } catch (error) {
    console.error("Error viewing document:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// Delete a document
async function deleteDocument(documentId, leadId) {
  try {
    // Delete the document
    const response = await fetch(`${API.getBaseUrl()}/api/documents/${documentId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete document");
    }

    // Show success message
    Utils.showToast("Document deleted successfully");

    // Reload documents list
    loadLeadDocuments(leadId);
  } catch (error) {
    console.error("Error deleting document:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// Initialize document upload functionality
function initDocumentUpload(leadId) {
  const fileInput = document.getElementById("fileInput");
  const selectFilesBtn = document.getElementById("selectFilesBtn");
  const uploadArea = document.getElementById("documentUploadArea");

  if (!fileInput || !selectFilesBtn || !uploadArea) {
    console.error("Document upload elements not found");
    return;
  }

  // Click select files button to trigger file input
  selectFilesBtn.addEventListener("click", function() {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener("change", function() {
    if (this.files.length > 0) {
      handleFileUpload(this.files, leadId);
    }
  });

  // Setup drag and drop
  uploadArea.addEventListener("dragover", function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add("highlight");
  });

  uploadArea.addEventListener("dragleave", function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("highlight");
  });

  uploadArea.addEventListener("drop", function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("highlight");
    
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files, leadId);
    }
  });

  // Update UI based on read-only mode
  updateDocumentUiForMode();
}

// Handle file upload
function handleFileUpload(files, leadId) {
  // Check if we're in edit mode
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";
  
  if (!isEditMode) {
    Utils.showToast("Please switch to edit mode to upload documents");
    return;
  }

  // Process each file
  Array.from(files).forEach(file => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      Utils.showToast(`${file.name} is not a PDF file`);
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      Utils.showToast(`${file.name} is too large (max 10MB)`);
      return;
    }
    
    // Show loading message
    Utils.showToast(`Uploading ${file.name}...`);
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        // Prepare file data
        const fileData = {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: e.target.result
        };
        
        // Upload file
        const response = await fetch(`${API.getBaseUrl()}/api/documents/lead/${leadId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fileData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload document');
        }
        
        // Show success message
        Utils.showToast(`${file.name} uploaded successfully`);
        
        // Reload documents list
        loadLeadDocuments(leadId);
      } catch (error) {
        console.error('Error uploading document:', error);
        Utils.showToast(`Error uploading ${file.name}: ${error.message}`);
      }
    };
    
    reader.onerror = function() {
      Utils.showToast(`Error reading ${file.name}`);
    };
    
    reader.readAsDataURL(file);
  });
}

// Update document UI based on mode (read-only or edit)
function updateDocumentUiForMode() {
  // Check if we're in edit mode
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";
  
  // Get document UI elements
  const uploadArea = document.getElementById("documentUploadArea");
  const deleteButtons = document.querySelectorAll(".document-actions .delete-document");
  
  if (uploadArea) {
    uploadArea.style.display = isEditMode ? "flex" : "none";
  }
  
  deleteButtons.forEach(button => {
    button.style.display = isEditMode ? "flex" : "none";
  });
}

export {
  loadLeadDocuments,
  initDocumentUpload,
  updateDocumentUiForMode
};