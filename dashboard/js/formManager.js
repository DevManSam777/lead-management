// Form Manager for dashboard forms.html JavaScript
import * as API from "./api.js";
import * as Utils from "./utils.js";

// Global variables
let allForms = [];
let editor;
let currentPage = 1;
let pageSize = 8;
let totalPages = 1;
let currentFormId = null;

// Initialize everything when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  // Setup sidebar toggle
  setupSidebarToggle();
  
  // Initialize markdown editor
  initializeMarkdownEditor();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load forms
  fetchAndRenderForms();
});


function setupSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  
  if (!sidebar || !mainContent) {
    console.error("Sidebar or main content not found");
    return;
  }

  // Store original transition for later restoration
  const originalSidebarTransition = sidebar.style.transition;
  const originalMainContentTransition = mainContent.style.transition;
  
  // Temporarily disable transitions
  sidebar.style.transition = 'none';
  mainContent.style.transition = 'none';
  
  // Set initial state based on localStorage preference
  const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  
  if (isSidebarCollapsed) {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
  } else {
    sidebar.classList.remove('collapsed');
    mainContent.classList.remove('expanded');
  }
  
  // Force DOM reflow to apply changes before transitions are re-enabled
  void sidebar.offsetWidth;
  
  // Remove any existing toggle button to avoid duplicates
  const existingButton = document.querySelector(".sidebar-toggle");
  if (existingButton) {
    existingButton.remove();
  }

  // Create new toggle button with both icons
  const toggleButton = document.createElement("button");
  toggleButton.className = "sidebar-toggle";
  toggleButton.setAttribute("aria-label", "Toggle Sidebar");

  // Include both icons - CSS will handle which one is visible
  toggleButton.innerHTML =
    '<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i>';

  // Add the button to the sidebar
  sidebar.appendChild(toggleButton);

  // Add click event to toggle button
  toggleButton.addEventListener("click", function () {
    // Toggle sidebar classes
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");

    // Store user preference
    localStorage.setItem(
      "sidebarCollapsed",
      sidebar.classList.contains("collapsed")
    );
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Filter and search listeners
  document.getElementById("filterCategory").addEventListener("change", applyFilters);
  document.getElementById("filterTemplate").addEventListener("change", applyFilters);
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  
  // Add new form button
  document.getElementById("addFormBtn").addEventListener("click", openCreateFormModal);
  
  // Form editor modal close button
  document.getElementById("closeFormEditorModal").addEventListener("click", closeFormEditorModal);
  
  // Preview modal close button
  document.getElementById("closeFormPreviewModal").addEventListener("click", closeFormPreviewModal);
  
  // Lead selection modal close button
  document.getElementById("closeLeadSelectionModal").addEventListener("click", closeLeadSelectionModal);
  
  // Generated form modal close button
  document.getElementById("closeGeneratedFormModal").addEventListener("click", closeGeneratedFormModal);
  
  // Form cancel button
  document.getElementById("cancelFormBtn").addEventListener("click", closeFormEditorModal);
  
  // Form editor form submission
  document.getElementById("formEditorForm").addEventListener("submit", handleFormSubmit);
  
  // Mobile tabs for editor/preview
  document.querySelectorAll(".editor-tab").forEach(tab => {
    tab.addEventListener("click", function() {
      // Set active tab
      document.querySelectorAll(".editor-tab").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      
      const tabName = this.getAttribute("data-tab");
      
      if (tabName === "editor") {
        document.querySelector(".editor-section").classList.remove("inactive");
        document.querySelector(".preview-section").classList.remove("active");
      } else {
        document.querySelector(".editor-section").classList.add("inactive");
        document.querySelector(".preview-section").classList.add("active");
      }
    });
  });
  
  // Variable click handlers
  document.querySelectorAll(".variable-tag").forEach(tag => {
    tag.addEventListener("click", function() {
      const variable = this.getAttribute("data-variable");
      insertVariable(variable);
    });
  });
  
  // Preview modal buttons
  document.getElementById("editFormBtn").addEventListener("click", function() {
    // Close preview modal
    closeFormPreviewModal();
    
    // Open editor modal with current form
    openEditFormModal(currentFormId);
  });
  
  document.getElementById("useWithLeadBtn").addEventListener("click", function() {
    openLeadSelectionModal();
  });
  
  document.getElementById("downloadFormBtn").addEventListener("click", function() {
    downloadForm();
  });
  
  document.getElementById("printFormBtn").addEventListener("click", function() {
    printForm();
  });
  
  // Generated form buttons
  document.getElementById("downloadGeneratedBtn").addEventListener("click", function() {
    downloadGeneratedForm();
  });
  
  document.getElementById("printGeneratedBtn").addEventListener("click", function() {
    printGeneratedForm();
  });
  
  // Search leads in the lead selection modal
  document.getElementById("leadSearchInput").addEventListener("input", function() {
    const searchTerm = this.value.toLowerCase();
    const leadItems = document.querySelectorAll("#leadsList .lead-item");
    
    leadItems.forEach(item => {
      const leadName = item.querySelector("h4").textContent.toLowerCase();
      const leadBusiness = item.querySelector("p").textContent.toLowerCase();
      
      if (leadName.includes(searchTerm) || leadBusiness.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });
}

// Initialize the markdown editor
function initializeMarkdownEditor() {
    const contentTextarea = document.getElementById("formContent");
    
    // Make sure the textarea is visible while CodeMirror initializes
    contentTextarea.style.display = "block";
    
    // Initialize CodeMirror
    editor = CodeMirror.fromTextArea(contentTextarea, {
      mode: "markdown",
      lineNumbers: true,
      lineWrapping: true,
      theme: "default",
      placeholder: "Write your form content here in Markdown format...",
    });
    
    // Sync content back to textarea when needed
    editor.on("change", function() {
      // Update the underlying textarea value
      editor.save();
      
      // Update preview
      updateMarkdownPreview();
    });
    
    // Initial preview update
    updateMarkdownPreview();
  }

// Update the markdown preview
function updateMarkdownPreview() {
  const content = editor.getValue();
  const preview = document.getElementById("markdownPreview");
  
  if (!content) {
    preview.innerHTML = "<p><em>No content to preview</em></p>";
    return;
  }
  
  // Convert markdown to HTML with DOMPurify for security
  const html = DOMPurify.sanitize(marked.parse(content));
  preview.innerHTML = html;
}

// Insert a variable at the current cursor position
function insertVariable(variable) {
  const cursor = editor.getCursor();
  editor.replaceRange(`{{${variable}}}`, cursor);
  editor.focus();
}

// Fetch forms from the API and render them
async function fetchAndRenderForms() {
  try {
    const formsList = document.getElementById("formsList");
    formsList.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading forms...</div>';
    
    // Get filter values
    const category = document.getElementById("filterCategory").value;
    const isTemplate = document.getElementById("filterTemplate").value;
    const searchTerm = document.getElementById("searchInput").value;
    
    // Build query parameters
    let queryParams = new URLSearchParams();
    if (category) queryParams.append("category", category);
    if (isTemplate) queryParams.append("isTemplate", isTemplate);
    
    // If search term exists, use search endpoint instead
    let apiUrl = `${API.getBaseUrl()}/api/forms`;
    if (searchTerm) {
      apiUrl = `${API.getBaseUrl()}/api/forms/search`;
      queryParams.append("query", searchTerm);
    }
    
    // Add query parameters to URL
    apiUrl += `?${queryParams.toString()}`;
    
    // Fetch forms
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch forms");
    }
    
    allForms = await response.json();
    
    // Handle empty state
    if (allForms.length === 0) {
      formsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-file-alt" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3>No forms found</h3>
          <p>Create your first form by clicking the "Create New Form" button.</p>
        </div>
      `;
      return;
    }
    
    // Calculate pagination
    totalPages = Math.ceil(allForms.length / pageSize);
    if (currentPage > totalPages) {
      currentPage = 1;
    }
    
    // Get forms for current page
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const currentForms = allForms.slice(start, end);
    
    // Render forms
    renderForms(currentForms);
    
    // Render pagination
    renderPagination();
  } catch (error) {
    console.error("Error fetching forms:", error);
    const formsList = document.getElementById("formsList");
    formsList.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--danger); margin-bottom: 1rem;"></i>
        <h3>Error Loading Forms</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="fetchAndRenderForms()">Try Again</button>
      </div>
    `;
  }
}

// Render the forms list
function renderForms(forms) {
  const formsList = document.getElementById("formsList");
  formsList.innerHTML = '';
  
  // Group forms by category
  const groupedForms = {};
  
  forms.forEach(form => {
    if (!groupedForms[form.category]) {
      groupedForms[form.category] = [];
    }
    
    groupedForms[form.category].push(form);
  });
  
  // Create category sections
  for (const [category, categoryForms] of Object.entries(groupedForms)) {
    // Create category container
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "forms-category";
    
    // Create category header
    const header = document.createElement("h3");
    let icon = "fa-file-alt"; // Default icon
    
    // Set icon based on category
    switch(category) {
      case "contract":
        icon = "fa-file-contract";
        break;
      case "proposal":
        icon = "fa-file-invoice";
        break;
      case "invoice":
        icon = "fa-file-invoice-dollar";
        break;
      case "agreement":
        icon = "fa-handshake";
        break;
    }
    
    // Format category name
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1) + "s";
    
    header.innerHTML = `<i class="fas ${icon}"></i> ${categoryName}`;
    categoryDiv.appendChild(header);
    
    // Create template cards container
    const cardsDiv = document.createElement("div");
    cardsDiv.className = "template-cards";
    
    // Add form cards
    categoryForms.forEach(form => {
      const card = createFormCard(form);
      cardsDiv.appendChild(card);
    });
    
    categoryDiv.appendChild(cardsDiv);
    formsList.appendChild(categoryDiv);
  }
}

// Create a form card element
function createFormCard(form) {
  const card = document.createElement("div");
  card.className = "template-card";
  card.dataset.formId = form._id;
  
  // Choose icon based on template status
  const icon = form.isTemplate ? "fa-copy" : "fa-file-alt";
  
  // Format date
  const lastModified = new Date(form.lastModified);
  const formattedDate = `${lastModified.toLocaleDateString()} ${lastModified.toLocaleTimeString()}`;
  
  // Create card content
  card.innerHTML = `
    <div class="template-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="template-details">
      <h4>${form.title}</h4>
      <p>${form.description || "No description"}</p>
      <div class="template-meta">
        <span><i class="far fa-clock"></i> Last updated: ${formattedDate}</span>
      </div>
    </div>
    <div class="template-actions">
      <button class="btn-icon preview-form" title="Preview">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-icon edit-form" title="Edit">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn-icon delete-form" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  // Add event listeners
  card.querySelector(".preview-form").addEventListener("click", function(e) {
    e.stopPropagation();
    openFormPreview(form._id);
  });
  
  card.querySelector(".edit-form").addEventListener("click", function(e) {
    e.stopPropagation();
    openEditFormModal(form._id);
  });
  
  card.querySelector(".delete-form").addEventListener("click", function(e) {
    e.stopPropagation();
    confirmDeleteForm(form._id);
  });
  
  // Add click event to entire card for preview
  card.addEventListener("click", function() {
    openFormPreview(form._id);
  });
  
  return card;
}

// Render pagination controls
function renderPagination() {
  const container = document.getElementById("paginationContainer");
  container.innerHTML = '';
  
  if (totalPages <= 1) {
    return;
  }
  
  // Create pagination container
  const pagination = document.createElement("div");
  pagination.className = "pagination";
  
  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "pagination-buttons-container";
  
  // Previous button
  const prevButton = document.createElement("button");
  prevButton.className = "pagination-button";
  prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevButton.title = "Previous page";
  
  if (currentPage === 1) {
    prevButton.classList.add("disabled");
  } else {
    prevButton.addEventListener("click", function() {
      if (currentPage > 1) {
        currentPage--;
        fetchAndRenderForms();
      }
    });
  }
  
  buttonsContainer.appendChild(prevButton);
  
  // Page buttons
  let startPage, endPage;
  
  if (currentPage === 1) {
    startPage = 1;
    endPage = Math.min(3, totalPages);
  } else if (currentPage === totalPages) {
    startPage = Math.max(1, totalPages - 2);
    endPage = totalPages;
  } else {
    startPage = currentPage - 1;
    endPage = currentPage + 1;
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.className = "pagination-button pagination-page";
    pageButton.textContent = i;
    
    if (i === currentPage) {
      pageButton.classList.add("active");
    } else {
      pageButton.addEventListener("click", function() {
        currentPage = i;
        fetchAndRenderForms();
      });
    }
    
    buttonsContainer.appendChild(pageButton);
  }
  
  // Next button
  const nextButton = document.createElement("button");
  nextButton.className = "pagination-button";
  nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextButton.title = "Next page";
  
  if (currentPage === totalPages) {
    nextButton.classList.add("disabled");
  } else {
    nextButton.addEventListener("click", function() {
      if (currentPage < totalPages) {
        currentPage++;
        fetchAndRenderForms();
      }
    });
  }
  
  buttonsContainer.appendChild(nextButton);
  
  // Page info
  const pageInfo = document.createElement("div");
  pageInfo.className = "pagination-info";
  pageInfo.textContent = `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, allForms.length)} of ${allForms.length}`;
  
  // Add elements to pagination
  pagination.appendChild(buttonsContainer);
  pagination.appendChild(pageInfo);
  
  container.appendChild(pagination);
}

// Apply filters and search
function applyFilters() {
  currentPage = 1; // Reset to first page when filters change
  fetchAndRenderForms();
}

// Open the form editor modal for creating a new form
function openCreateFormModal() {
  // Clear form
  document.getElementById("formId").value = "";
  document.getElementById("formTitle").value = "";
  document.getElementById("formDescription").value = "";
  document.getElementById("formCategory").value = "contract";
  document.getElementById("isTemplate").value = "false";
  
  // Clear editor content
  editor.setValue("");
  
  // Update modal title
  document.getElementById("formEditorTitle").textContent = "Create New Form";
  
  // Show modal
  document.getElementById("formEditorModal").style.display = "block";
}

// Open the form editor modal for editing an existing form
async function openEditFormModal(formId) {
  try {
    // Show loading
    Utils.showToast("Loading form...");
    
    // Fetch form details
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch form details");
    }
    
    const form = await response.json();
    
    // Populate form fields
    document.getElementById("formId").value = form._id;
    document.getElementById("formTitle").value = form.title;
    document.getElementById("formDescription").value = form.description || "";
    document.getElementById("formCategory").value = form.category;
    document.getElementById("isTemplate").value = form.isTemplate.toString();
    
    // Set editor content
    editor.setValue(form.content);
    
    // Update modal title
    document.getElementById("formEditorTitle").textContent = "Edit Form";
    
    // Show modal
    document.getElementById("formEditorModal").style.display = "block";
  } catch (error) {
    console.error("Error loading form for editing:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// Close the form editor modal
function closeFormEditorModal() {
  document.getElementById("formEditorModal").style.display = "none";
}

// Handle form submission

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Show loading indicator
    Utils.showToast("Saving form...");
    
    // Get form data
    const formId = document.getElementById("formId").value;
    const title = document.getElementById("formTitle").value;
    const description = document.getElementById("formDescription").value;
    const category = document.getElementById("formCategory").value;
    const isTemplate = document.getElementById("isTemplate").value === "true";
    
    // Important: Get content from CodeMirror editor instead of the hidden textarea
    const content = editor.getValue();
    
    console.log("Form data gathered:", {
      formId,
      title,
      description, 
      category,
      isTemplate,
      contentLength: content.length
    });
    
    // Validate required fields
    if (!title) {
      Utils.showToast("Title is required");
      document.getElementById("formTitle").focus();
      return;
    }
    
    if (!content) {
      Utils.showToast("Content is required");
      editor.focus();
      return;
    }
    
    // Prepare form data
    const formData = {
      title,
      description,
      category,
      isTemplate,
      content
    };
    
    try {
      console.log("Attempting to save form...");
const baseUrl = "http://127.0.0.1:5000/api/forms";
      
      let response;
      if (formId) {
        console.log(`Updating form ID: ${formId}`);
        response = await fetch(`${baseUrl}/${formId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
      } else {
        console.log("Creating new form");
        response = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }
      
      const savedForm = await response.json();
      console.log("Form saved successfully:", savedForm);
      
      // Close modal
      closeFormEditorModal();
      
      // Show success message
      Utils.showToast(formId ? "Form updated successfully" : "Form created successfully");
      
      // Refresh forms list
      fetchAndRenderForms();
    } catch (error) {
      console.error("Error saving form:", error);
      Utils.showToast(`Error: ${error.message || "Failed to save form"}. Check console for details.`);
    }
  }

// Open form preview
async function openFormPreview(formId) {
  try {
    // Store current form ID
    currentFormId = formId;
    
    // Show loading
    Utils.showToast("Loading preview...");
    
    // Fetch form details
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch form details");
    }
    
    const form = await response.json();
    
    // Set preview title
    document.getElementById("previewFormTitle").textContent = form.title;
    
    // Convert markdown to HTML
    const html = DOMPurify.sanitize(marked.parse(form.content));
    
    // Set preview content
    document.getElementById("previewContent").innerHTML = html;
    
    // Show modal
    document.getElementById("formPreviewModal").style.display = "block";
  } catch (error) {
    console.error("Error loading form preview:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// Close the form preview modal
function closeFormPreviewModal() {
  document.getElementById("formPreviewModal").style.display = "none";
}

// Confirm delete form
function confirmDeleteForm(formId) {
  if (confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
    deleteForm(formId);
  }
}

// Delete a form
async function deleteForm(formId) {
  try {
    // Show loading
    Utils.showToast("Deleting form...");
    
    // Delete form
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete form");
    }
    
    // Show success message
    Utils.showToast("Form deleted successfully");
    
    // Refresh forms list
    fetchAndRenderForms();
  } catch (error) {
    console.error("Error deleting form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// Download form as markdown or PDF
function downloadForm() {
  const title = document.getElementById("previewFormTitle").textContent;
  const content = document.getElementById("previewContent").innerHTML;
  
  // Create a temporary element to extract text content
  const tempElement = document.createElement("div");
  tempElement.innerHTML = content;
  const textContent = tempElement.innerText;
  
  // Create a blob with the content
  const blob = new Blob([textContent], { type: "text/markdown" });
  
  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${title.replace(/\s+/g, "_")}.md`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Print the form
function printForm() {
  const title = document.getElementById("previewFormTitle").textContent;
  const content = document.getElementById("previewContent").innerHTML;
  
  // Create a print window
  const printWindow = window.open("", "_blank");
  
  // Write content to print window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }
          
          blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1rem;
            margin-left: 0;
            color: #666;
          }
          
          pre {
            background-color: #f5f5f5;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
          }
          
          code {
            background-color: #f5f5f5;
            padding: 0.2rem 0.4rem;
            border-radius: 0.3rem;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 0.5rem;
          }
          
          th {
            background-color: #f5f5f5;
          }
          
          hr {
            border: 0;
            border-top: 1px solid #ddd;
            margin: 2rem 0;
          }
          
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
    </html>
  `);
  
  // Print the window
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  
  // Close the window after printing (optional)
  // printWindow.close();
}

// Open lead selection modal
async function openLeadSelectionModal() {
  try {
    // Show loading
    Utils.showToast("Loading leads...");
    
    // Fetch leads
    const response = await fetch(`${API.getBaseUrl()}/api/leads`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch leads");
    }
    
    const leads = await response.json();
    
    // Build leads list
    const leadsList = document.getElementById("leadsList");
    leadsList.innerHTML = "";
    
    if (leads.length === 0) {
      leadsList.innerHTML = "<p>No leads found</p>";
    } else {
      leads.forEach(lead => {
        const leadItem = document.createElement("div");
        leadItem.className = "lead-item";
        leadItem.style.display = "flex";
        leadItem.style.alignItems = "center";
        leadItem.style.justifyContent = "space-between";
        leadItem.style.padding = "1rem";
        leadItem.style.borderBottom = "1px solid var(--border-color)";
        leadItem.style.cursor = "pointer";
        
        // Format lead name
        const fullName = `${lead.firstName} ${lead.lastName}`;
        const businessName = lead.businessName || "N/A";
        
        leadItem.innerHTML = `
          <div>
            <h4 style="margin: 0 0 0.5rem 0;">${fullName}</h4>
            <p style="margin: 0; color: var(--text-muted);">${businessName}</p>
          </div>
          <button class="btn btn-primary">Use</button>
        `;
        
        // Add click event to button
        leadItem.querySelector("button").addEventListener("click", function() {
          generateFormWithLeadData(currentFormId, lead._id);
          closeLeadSelectionModal();
        });
        
        leadsList.appendChild(leadItem);
      });
    }
    
    // Show modal
    document.getElementById("leadSelectionModal").style.display = "block";
  } catch (error) {
    console.error("Error loading leads:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// Close the lead selection modal
function closeLeadSelectionModal() {
  document.getElementById("leadSelectionModal").style.display = "none";
}

// Generate form with lead data
async function generateFormWithLeadData(formId, leadId) {
  try {
    // Show loading
    Utils.showToast("Generating form...");
    
    // Generate form
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ leadId })
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate form");
    }
    
    const generatedForm = await response.json();
    
    // Set form title
    document.getElementById("generatedFormTitle").textContent = generatedForm.title;
    
    // Convert markdown to HTML
    const html = DOMPurify.sanitize(marked.parse(generatedForm.content));
    
    // Set form content
    document.getElementById("generatedContent").innerHTML = html;
    
    // Show modal
    document.getElementById("generatedFormModal").style.display = "block";
  } catch (error) {
    console.error("Error generating form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

// Close the generated form modal
function closeGeneratedFormModal() {
  document.getElementById("generatedFormModal").style.display = "none";
}

// Download generated form
function downloadGeneratedForm() {
  const title = document.getElementById("generatedFormTitle").textContent;
  const content = document.getElementById("generatedContent").innerHTML;
  
  // Create a temporary element to extract text content
  const tempElement = document.createElement("div");
  tempElement.innerHTML = content;
  const textContent = tempElement.innerText;
  
  // Create a blob with the content
  const blob = new Blob([textContent], { type: "text/markdown" });
  
  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${title.replace(/\s+/g, "_")}.md`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Print the generated form
function printGeneratedForm() {
  const title = document.getElementById("generatedFormTitle").textContent;
  const content = document.getElementById("generatedContent").innerHTML;
  
  // Create a print window
  const printWindow = window.open("", "_blank");
  
  // Write content to print window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }
          
          blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1rem;
            margin-left: 0;
            color: #666;
          }
          
          pre {
            background-color: #f5f5f5;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
          }
          
          code {
            background-color: #f5f5f5;
            padding: 0.2rem 0.4rem;
            border-radius: 0.3rem;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 0.5rem;
          }
          
          th {
            background-color: #f5f5f5;
          }
          
          hr {
            border: 0;
            border-top: 1px solid #ddd;
            margin: 2rem 0;
          }
          
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
    </html>
  `);
  
  // Print the window
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}