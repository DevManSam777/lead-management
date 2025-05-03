import * as API from "./api.js";
import * as Utils from "./utils.js";

function initDocumentUpload(leadId) {
  const fileInput = document.getElementById('fileInput');
  const selectFilesBtn = document.getElementById('selectFilesBtn');
  const uploadArea = document.getElementById('documentUploadArea');

  // Remove any existing listeners first
  selectFilesBtn.onclick = null;
  fileInput.onchange = null;

  // Drag and drop event handlers
  uploadArea.ondragover = (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('highlight');
  };

  uploadArea.ondragleave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('highlight');
  };

  uploadArea.ondrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('highlight');

    // Process dropped files
    await processFiles(e.dataTransfer.files, leadId);
  };

  // Simple, direct event handlers
  selectFilesBtn.onclick = (e) => {
    e.preventDefault();
    fileInput.click();
  };

  fileInput.onchange = async (e) => {
    // Process selected files
    await processFiles(e.target.files, leadId);
    
    // Reset file input
    e.target.value = '';
  };

  // Update UI mode for documents
  updateDocumentUiForMode();
}

// Separate function to process files
async function processFiles(files, leadId) {
  // Validate edit mode
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

  // Process each file
  for (let file of files) {
    // Check if file already exists
    if (existingDocuments.includes(file.name)) {
      Utils.showToast(`${file.name} is already uploaded to this lead`);
      continue;
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      Utils.showToast(`${file.name} is not a PDF file`);
      continue;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      Utils.showToast(`${file.name} is too large (max 10MB)`);
      continue;
    }

    try {
      // Read file
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Prepare file data
      const documentData = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: fileData
      };

      // Upload document
      const response = await fetch(`${API.getBaseUrl()}/api/documents/lead/${leadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Show success and reload documents
      Utils.showToast(`${file.name} uploaded successfully`);
      await loadLeadDocuments(leadId);
    } catch (error) {
      console.error('Document upload error:', error);
      Utils.showToast(`Error uploading ${file.name}: ${error.message}`);
    }
  }
}

// Reuse existing functions from previous implementation
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

// async function viewDocument(documentId, fileName) {
//   try {
//     const user = auth.currentUser;
//     if (!user) {
//       throw new Error("User is not authenticated");
//     }
//     const token = await user.getIdToken();

//     // Open the document in a new tab with the Authorization header
//     const documentUrl = `${API.getBaseUrl()}/api/documents/${documentId}`;
//     const response = await fetch(documentUrl, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch document");
//     }

//     const blob = await response.blob();
//     const blobUrl = URL.createObjectURL(blob);
//     window.open(blobUrl, '_blank');
//   } catch (error) {
//     console.error("Error viewing document:", error);
//     Utils.showToast("Error: " + error.message);
//   }
// }

async function viewDocument(documentId, fileName) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }
    const token = await user.getIdToken();

    const documentUrl = `${API.getBaseUrl()}/api/documents/${documentId}`;
    const response = await fetch(documentUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} - ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');

    // Check if the new window was successfully opened
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      Utils.showToast("Pop-up blocked. Please allow pop-ups for this site to view the document.");
      console.warn("Pop-up blocked by the browser.");
    }

  } catch (error) {
    console.error("Error viewing document:", error);
    Utils.showToast(`Error: ${error.message}`);
  }
}

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

export {
  initDocumentUpload,
  loadLeadDocuments, 
  updateDocumentUiForMode
};