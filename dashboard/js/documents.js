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

  // Remove any existing event listeners first
  selectFilesBtn.removeEventListener("click", selectFilesBtnHandler);
  fileInput.removeEventListener("change", fileInputChangeHandler);
  uploadArea.removeEventListener("dragover", dragOverHandler);
  uploadArea.removeEventListener("dragleave", dragLeaveHandler);
  uploadArea.removeEventListener("drop", dropHandler);

  // Define handlers to prevent duplicate event listeners
  function selectFilesBtnHandler() {
    fileInput.click();
  }

  function fileInputChangeHandler() {
    if (this.files.length > 0) {
      handleFileUpload(this.files, leadId);
    }
  }

  function dragOverHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add("highlight");
  }

  function dragLeaveHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("highlight");
  }

  function dropHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("highlight");
    
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files, leadId);
    }
  }

  // Add new event listeners
  selectFilesBtn.addEventListener("click", selectFilesBtnHandler);
  fileInput.addEventListener("change", fileInputChangeHandler);
  uploadArea.addEventListener("dragover", dragOverHandler);
  uploadArea.addEventListener("dragleave", dragLeaveHandler);
  uploadArea.addEventListener("drop", dropHandler);

  // Update UI based on read-only mode
  updateDocumentUiForMode();
}

// Handle file upload with deduplication and enhanced error handling
function handleFileUpload(files, leadId) {
  // Check if we're in edit mode
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";
  
  if (!isEditMode) {
    Utils.showToast("Please switch to edit mode to upload documents");
    return;
  }

  // Validate lead ID
  if (!leadId) {
    Utils.showToast("Error: No lead selected for document upload");
    return;
  }

  // Get existing document list
  const documentsContainer = document.getElementById("signedDocumentsList");
  const existingDocuments = Array.from(documentsContainer.querySelectorAll(".document-item"))
    .map(el => el.querySelector(".document-title").textContent);

  // Process each file with deduplication
  const filePromises = Array.from(files)
    .filter(file => {
      // Check if file already exists
      if (existingDocuments.includes(file.name)) {
        Utils.showToast(`${file.name} is already uploaded`);
        return false;
      }
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        Utils.showToast(`${file.name} is not a PDF file`);
        return false;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        Utils.showToast(`${file.name} is too large (max 10MB)`);
        return false;
      }
      
      return true;
    })
    .map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
          try {
            // Verify file was read correctly
            if (!e.target.result) {
              throw new Error('Failed to read file data');
            }

            // Prepare file data
            const fileData = {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              fileData: e.target.result
            };
            
            // Upload file with detailed error handling
            let response;
            try {
              response = await fetch(`${API.getBaseUrl()}/api/documents/lead/${leadId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(fileData)
              });
            } catch (networkError) {
              console.error('Network error uploading document:', networkError);
              Utils.showToast(`Network error uploading ${file.name}`);
              reject(networkError);
              return;
            }
            
            // Check response status
            if (!response.ok) {
              // Try to get more detailed error message
              let errorDetails = '';
              try {
                const errorBody = await response.json();
                errorDetails = errorBody.message || '';
              } catch {
                errorDetails = `Status: ${response.status}`;
              }
              
              console.error('Document upload failed:', errorDetails);
              Utils.showToast(`Failed to upload ${file.name}: ${errorDetails}`);
              reject(new Error(errorDetails));
              return;
            }
            
            // Successful upload
            Utils.showToast(`${file.name} uploaded successfully`);
            resolve();
          } catch (error) {
            console.error('Unexpected error uploading document:', error);
            Utils.showToast(`Unexpected error uploading ${file.name}: ${error.message}`);
            reject(error);
          }
        };
        
        reader.onerror = function(error) {
          console.error('File reading error:', error);
          Utils.showToast(`Error reading ${file.name}`);
          reject(new Error('File read error'));
        };
        
        // Initiate file reading
        try {
          reader.readAsDataURL(file);
        } catch (readError) {
          console.error('Error starting file read:', readError);
          Utils.showToast(`Failed to start reading ${file.name}`);
          reject(readError);
        }
      });
    });

  // Reload documents list after all uploads complete
  Promise.all(filePromises)
    .then(() => {
      loadLeadDocuments(leadId);
    })
    .catch(errors => {
      console.error('One or more file uploads failed:', errors);
      // Attempt to reload documents even if some uploads failed
      loadLeadDocuments(leadId);
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