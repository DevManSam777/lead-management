import * as API from "./api.js";
import * as Utils from "./utils.js";

function initDocumentUpload(leadId) {
  const fileInput = document.getElementById('fileInput');
  const selectFilesBtn = document.getElementById('selectFilesBtn');
  const uploadArea = document.getElementById('documentUploadArea');

  // remove any existing listeners first
  selectFilesBtn.onclick = null;
  fileInput.onchange = null;

  // drag and drop event handlers
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

    // process dropped files
    await processFiles(e.dataTransfer.files, leadId);
  };
  selectFilesBtn.onclick = (e) => {
    e.preventDefault();
    fileInput.click();
  };

  fileInput.onchange = async (e) => {
    // process selected files
    await processFiles(e.target.files, leadId);
    
    // reset file input
    e.target.value = '';
  };

  // update UI mode for documents
  updateDocumentUiForMode();
}

// separate function to process files
async function processFiles(files, leadId) {
  // validate edit mode
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";
  
  if (!isEditMode) {
    Utils.showToast("Please switch to edit mode to upload documents");
    return;
  }

  // validate lead ID
  if (!leadId) {
    Utils.showToast("Error: No lead selected for document upload");
    return;
  }

  // get existing document list
  const documentsContainer = document.getElementById("signedDocumentsList");
  const existingDocuments = Array.from(documentsContainer.querySelectorAll(".document-item"))
    .map(el => el.querySelector(".document-title").textContent);

  // process each file
  for (let file of files) {
    // check if file already exists
    if (existingDocuments.includes(file.name)) {
      Utils.showToast(`${file.name} is already uploaded to this lead`);
      continue;
    }
    
    // validate file type
    if (file.type !== 'application/pdf') {
      Utils.showToast(`${file.name} is not a PDF file`);
      continue;
    }
    
    // file size 16MB limit
    if (file.size > 16 * 1024 * 1024) {
      Utils.showToast(`${file.name} is too large (max 16MB)`);
      continue;
    }

    try {
      // read file
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // file data
      const documentData = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: fileData
      };

      // upload document
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

      // show success and reload documents
      Utils.showToast(`${file.name} uploaded successfully`);
      await loadLeadDocuments(leadId);
    } catch (error) {
      console.error('Document upload error:', error);
      Utils.showToast(`Error uploading ${file.name}: ${error.message}`);
    }
  }
}

async function loadLeadDocuments(leadId) {
  try {
    const documentsContainer = document.getElementById("signedDocumentsList");

    if (!documentsContainer) return;

    documentsContainer.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading documents...</div>';

    // fetch documents for this lead
    const response = await fetch(
      `${API.getBaseUrl()}/api/documents/lead/${leadId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch lead documents");
    }

    const documents = await response.json();

    // clear container
    documentsContainer.innerHTML = "";

    // get date format from window object or use default
    const dateFormat = window.dateFormat || "MM/DD/YYYY";

    // add each document
    documents.forEach((doc) => {
      // format dates
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

      // add to container
      documentsContainer.appendChild(documentItem);
    });

    // update UI mode
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

    // check if the new window was successfully opened
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
    const response = await fetch(`${API.getBaseUrl()}/api/documents/${documentId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete document");
    }

    Utils.showToast("Document deleted successfully");

    // reload documents list
    loadLeadDocuments(leadId);
  } catch (error) {
    console.error("Error deleting document:", error);
    Utils.showToast("Error: " + error.message);
  }
}

function updateDocumentUiForMode() {
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";
  
  // update upload area visibility
  const uploadArea = document.getElementById("documentUploadArea");
  if (uploadArea) {
    uploadArea.style.display = isEditMode ? "flex" : "none";
  }
  
  // update delete button visibility
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