import * as API from "./api.js";
import * as Utils from "./utils.js";

// Advanced Document Upload Module
class DocumentUploader {
  constructor(leadId) {
    // Singleton pattern to prevent multiple instances
    if (DocumentUploader.instance) {
      return DocumentUploader.instance;
    }
    DocumentUploader.instance = this;

    // Core properties
    this.leadId = leadId;
    this.fileInput = null;
    this.selectFilesBtn = null;
    this.uploadArea = null;
    this.isUploading = false;
    
    // Initialize references
    this.initializeReferences();
    
    // Bind methods to preserve context
    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    
    // Bind events
    this.bindEvents();
  }

  // Initialize DOM references
  initializeReferences() {
    this.fileInput = document.getElementById('fileInput');
    this.selectFilesBtn = document.getElementById('selectFilesBtn');
    this.uploadArea = document.getElementById('documentUploadArea');

    // Validate references
    if (!this.fileInput || !this.selectFilesBtn || !this.uploadArea) {
      console.error('Document upload elements not found');
      return false;
    }

    return true;
  }

  // Bind event listeners with advanced prevention
  bindEvents() {
    // Remove any existing listeners first
    this.unbindEvents();

    // Add new listeners with unique handler references
    this.selectFilesBtn.addEventListener('click', this.handleSelectFiles.bind(this));
    this.fileInput.addEventListener('change', this.handleFileSelect);
    this.uploadArea.addEventListener('dragover', this.handleDragOver);
    this.uploadArea.addEventListener('dragleave', this.handleDragLeave);
    this.uploadArea.addEventListener('drop', this.handleDrop);
  }

  // Unbind all event listeners
  unbindEvents() {
    const handlers = [
      { el: this.selectFilesBtn, event: 'click', handler: this.handleSelectFiles },
      { el: this.fileInput, event: 'change', handler: this.handleFileSelect },
      { el: this.uploadArea, event: 'dragover', handler: this.handleDragOver },
      { el: this.uploadArea, event: 'dragleave', handler: this.handleDragLeave },
      { el: this.uploadArea, event: 'drop', handler: this.handleDrop }
    ];

    handlers.forEach(({ el, event, handler }) => {
      if (el) {
        el.removeEventListener(event, handler);
      }
    });
  }

  // Handle select files button click
  handleSelectFiles() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  // Drag and drop handlers
  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.uploadArea.classList.add('highlight');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.uploadArea.classList.remove('highlight');
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.uploadArea.classList.remove('highlight');
    
    const files = e.dataTransfer.files;
    this.processFileUpload(files);
  }

  // Handle file input change
  handleFileSelect(e) {
    const files = this.fileInput.files;
    this.processFileUpload(files);
    
    // Reset file input to allow re-uploading same files
    this.fileInput.value = '';
  }

  // Validate upload conditions
  validateUploadConditions() {
    // Check edit mode
    const submitButton = document.querySelector('#leadForm button[type="submit"]');
    const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";
    
    if (!isEditMode) {
      Utils.showToast("Please switch to edit mode to upload documents");
      return false;
    }

    // Validate lead ID
    if (!this.leadId) {
      Utils.showToast("Error: No lead selected for document upload");
      return false;
    }

    // Prevent concurrent uploads
    if (this.isUploading) {
      Utils.showToast("Document upload already in progress");
      return false;
    }

    return true;
  }

  // Process file upload
  processFileUpload(files) {
    // Validate upload conditions
    if (!this.validateUploadConditions()) {
      return;
    }

    // Get existing document list
    const documentsContainer = document.getElementById("signedDocumentsList");
    const existingDocuments = Array.from(documentsContainer.querySelectorAll(".document-item"))
      .map(el => el.querySelector(".document-title").textContent);

    // Filter and validate files
    const filesToUpload = Array.from(files).filter(file => {
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
    });

    // If no valid files, return
    if (filesToUpload.length === 0) {
      return;
    }

    // Set upload flag
    this.isUploading = true;

    // Upload files
    const uploadPromises = filesToUpload.map(file => this.uploadSingleFile(file));

    // Handle upload completion
    Promise.all(uploadPromises)
      .then(() => {
        // Reload documents list
        loadLeadDocuments(this.leadId);
      })
      .catch(errors => {
        console.error('Upload errors:', errors);
        // Attempt to reload documents
        loadLeadDocuments(this.leadId);
      })
      .finally(() => {
        // Reset upload flag
        this.isUploading = false;
      });
  }

  // Upload single file
  uploadSingleFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
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
          
          // Upload file
          const response = await fetch(`${API.getBaseUrl()}/api/documents/lead/${this.leadId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fileData)
          });
          
          // Check response status
          if (!response.ok) {
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
      
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        Utils.showToast(`Error reading ${file.name}`);
        reject(new Error('File read error'));
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
    });
  }

  // Update UI mode
  updateUiForMode() {
    const submitButton = document.querySelector('#leadForm button[type="submit"]');
    const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";
    
    // Update upload area visibility
    if (this.uploadArea) {
      this.uploadArea.style.display = isEditMode ? "flex" : "none";
    }
    
    // Update delete button visibility
    const deleteButtons = document.querySelectorAll(".document-actions .delete-document");
    deleteButtons.forEach(button => {
      button.style.display = isEditMode ? "flex" : "none";
    });
  }
}

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
        .addEventListener("click", (e) => {
          e.stopPropagation();
          viewDocument(doc._id, doc.fileName);
        });

      documentItem
        .querySelector(".delete-document")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${doc.fileName}"?`)) {
            deleteDocument(doc._id, leadId);
          }
        });

      // Add to container
      documentsContainer.appendChild(documentItem);
    });

    // Update UI mode
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

// View document
async function viewDocument(documentId, fileName) {
  try {
    // Open the document in a new tab
    const documentUrl = `${API.getBaseUrl()}/api/documents/${documentId}`;
    window.open(documentUrl, '_blank');
  } catch (error) {
    console.error("Error viewing document:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// Delete document
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

// Update UI mode
function updateDocumentUiForMode() {
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";
  
  // Update upload area visibility
  const uploadArea = document.getElementById("documentUploadArea");
  if (uploadArea) {
    uploadArea.style.display = isEditMode ? "flex" : "none";
  }
  
  // Update delete button visibility
  const deleteButtons = document.querySelectorAll(".document-actions .delete-document");
  deleteButtons.forEach(button => {
    button.style.display = isEditMode ? "flex" : "none";
  });
}

// Initialize document upload
function initDocumentUpload(leadId) {
  // Create or retrieve singleton instance
  const uploader = new DocumentUploader(leadId);
  
  // Update UI mode
  uploader.updateUiForMode();
  
  return uploader;
}

export {
  initDocumentUpload,
  loadLeadDocuments, 
  updateDocumentUiForMode
}