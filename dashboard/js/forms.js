import * as API from "./api.js";
import * as Utils from "./utils.js";
import * as Pagination from "./pagination.js"; // Import pagination module

// Global variables
let allForms = [];
let editor;
let currentFormId = null;
let globalSettings = {}; // Store global settings

// Pagination state
let currentPage = 1;
let pageSize = 6; // Show 6 items per category
let categoryPagination = {}; // Track pagination for each category

// Initialize everything when the document is ready
document.addEventListener("DOMContentLoaded", async function () {
  // Initialize global settings first (important!)
  await initializeSettings();

  // Setup sidebar toggle
  setupSidebarToggle();

  // Initialize markdown editor
  initializeMarkdownEditor();

  // Setup event listeners
  setupEventListeners();

  // Load forms
  fetchAndRenderForms();

  // Configure marked.js globally to preserve whitespace
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
    smartLists: true, // Use smarter list behavior
    xhtml: true, // Self-close HTML tags
    headerIds: false, // Don't add IDs to headers
  });
});

/**
 * Initialize settings from the server
 */
async function initializeSettings() {
  try {
    // Fetch all settings
    const settings = await API.fetchAllSettings();
    globalSettings = settings;

    // Set date format in window object for global access
    window.dateFormat = settings.dateFormat || "MM/DD/YYYY";

    // Apply theme from settings
    if (settings.theme) {
      document.documentElement.setAttribute("data-theme", settings.theme);
    } else {
      // Use system preference as fallback
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
      // Save it back to the server
      await API.updateSetting("theme", systemTheme);
    }

    // Log settings for debugging
    console.log("Initialized settings:", {
      theme: settings.theme,
      dateFormat: window.dateFormat,
    });

    return settings;
  } catch (error) {
    console.error("Error initializing settings:", error);

    // Use fallbacks from localStorage if API fails
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Set fallback date format
    window.dateFormat = localStorage.getItem("dateFormat") || "MM/DD/YYYY";

    return {
      theme: savedTheme,
      dateFormat: window.dateFormat,
    };
  }
}

/**
 * Set up sidebar toggle functionality
 */
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
  sidebar.style.transition = "none";
  mainContent.style.transition = "none";

  // Set initial state based on localStorage preference
  const isSidebarCollapsed =
    localStorage.getItem("sidebarCollapsed") === "true";

  if (isSidebarCollapsed) {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("expanded");
  } else {
    sidebar.classList.remove("collapsed");
    mainContent.classList.remove("expanded");
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
    '<i class="fas fa-angles-left"></i><i class="fas fa-angles-right"></i>';

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

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Filter and search listeners
  document
    .getElementById("filterCategory")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filterTemplate")
    .addEventListener("change", applyFilters);
  document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);

  // Add new form button
  document
    .getElementById("addFormBtnFormsPage")
    .addEventListener("click", openCreateFormModal);

  // Form editor modal close button
  document
    .getElementById("closeFormEditorModal")
    .addEventListener("click", closeFormEditorModal);

  // Preview modal close button
  document
    .getElementById("closeFormPreviewModal")
    .addEventListener("click", closeFormPreviewModal);

  // Lead selection modal close button
  document
    .getElementById("closeLeadSelectionModal")
    .addEventListener("click", closeLeadSelectionModal);

  // Generated form modal close button
  document
    .getElementById("closeGeneratedFormModal")
    .addEventListener("click", closeGeneratedFormModal);

  // Form cancel button
  document
    .getElementById("cancelFormBtn")
    .addEventListener("click", closeFormEditorModal);

  // Form editor form submission
  document
    .getElementById("formEditorForm")
    .addEventListener("submit", handleFormSubmit);

  // Mobile tabs for editor/preview
  document.querySelectorAll(".editor-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      // Set active tab
      document
        .querySelectorAll(".editor-tab")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const tabName = this.getAttribute("data-tab");

      if (tabName === "editor") {
        document.querySelector(".editor-section").classList.remove("inactive");
        document.querySelector(".preview-section").classList.remove("active");
      } else {
        document.querySelector(".editor-section").classList.add("inactive");
        document.querySelector(".preview-section").classList.add("active");
        // Update preview when switching to preview tab
        updateMarkdownPreview();
      }
    });
  });

  // Variable click handlers
  document.querySelectorAll(".variable-tag").forEach((tag) => {
    tag.addEventListener("click", function () {
      const variable = this.getAttribute("data-variable");
      insertVariable(variable);
    });
  });

  // Preview modal buttons
  document.getElementById("editFormBtn").addEventListener("click", function () {
    // Close preview modal
    closeFormPreviewModal();

    // Open editor modal with current form
    openEditFormModal(currentFormId);
  });

  document
    .getElementById("useWithLeadBtn")
    .addEventListener("click", function () {
      openLeadSelectionModal();
    });

  document
    .getElementById("downloadFormBtn")
    .addEventListener("click", function () {
      downloadForm();
    });

  document
    .getElementById("printFormBtn")
    .addEventListener("click", function () {
      printForm();
    });

  // Generated form buttons
  document
    .getElementById("downloadGeneratedBtn")
    .addEventListener("click", function () {
      downloadGeneratedForm();
    });

  document
    .getElementById("printGeneratedBtn")
    .addEventListener("click", function () {
      printGeneratedForm();
    });

  // Search leads in the lead selection modal
  document
    .getElementById("leadSearchInput")
    .addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const leadItems = document.querySelectorAll("#leadsList .lead-item");

      leadItems.forEach((item) => {
        const leadName = item.querySelector("h4").textContent.toLowerCase();
        const leadBusiness = item.querySelector("p").textContent.toLowerCase();

        if (
          leadName.includes(searchTerm) ||
          leadBusiness.includes(searchTerm)
        ) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });

  // Listen for settings updates from other pages
  window.addEventListener("settingsUpdated", function (event) {
    const { key, value } = event.detail;

    if (key === "dateFormat") {
      console.log("Date format updated to:", value);
      window.dateFormat = value;

      // Refresh forms list to update date displays
      fetchAndRenderForms();
    } else if (key === "theme") {
      document.documentElement.setAttribute("data-theme", value);
    }
  });
}

/**
 * Initialize the markdown editor
 */
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
  editor.on("change", function () {
    // Update the underlying textarea value
    editor.save();

    // Update preview
    updateMarkdownPreview();
  });

  // Initial preview update
  updateMarkdownPreview();
}

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

/**
 * Insert a variable at the current cursor position
 */
function insertVariable(variable) {
  const cursor = editor.getCursor();
  editor.replaceRange(`{{${variable}}}`, cursor);
  editor.focus();
}

async function fetchAndRenderForms() {
  try {
    const formsList = document.getElementById("formsList");
    formsList.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading forms...</div>';

    // Get filter values
    const categoryFilter = document.getElementById("filterCategory").value;
    const templateFilter = document.getElementById("filterTemplate").value;
    const searchTerm = document.getElementById("searchInput").value;

    // Build query parameters
    let queryParams = {};
    if (categoryFilter) queryParams.category = categoryFilter;

    // Use the new templateType parameter
    queryParams.templateType = templateFilter;

    // If search term exists, use search endpoint instead
    if (searchTerm) {
      // Pass the templateType to search as well
      allForms = await API.searchForms(searchTerm, queryParams);
    } else {
      // Fetch forms with filters
      allForms = await API.fetchForms(queryParams);
    }

    console.log(`Fetched ${allForms.length} forms`);

    // Handle empty state
    if (allForms.length === 0) {
      formsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-file-alt"></i>
          <h3>No forms found</h3>
          <p>Create a form by clicking the "Create New Form" button above</p>
        </div>
      `;
      return;
    }

    // Clear previous content
    formsList.innerHTML = "";

    // Group forms by category
    const groupedForms = {};
    allForms.forEach((form) => {
      if (!groupedForms[form.category]) {
        groupedForms[form.category] = [];
      }
      groupedForms[form.category].push(form);
    });

    // Create a container for all categories
    const allCategoriesContainer = document.createElement("div");

    // Initialize pagination for each category with custom page sizes
    const categoryPageSizes = {
      'drafts': 12,  // Sets number of drafts per category
      'templates': 12  // Sets number of templates per category
    };

    // Ensure pagination is initialized for each category
    Object.keys(groupedForms).forEach((category) => {
      if (!categoryPagination[category]) {
        categoryPagination[category] = { currentPage: 1 };
      }
    });

    // Process each category
    Object.entries(groupedForms).forEach(([category, forms]) => {
      // Create category container
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "forms-category";
      categoryDiv.style.marginBottom = "30px"; // Add spacing between categories

      // Create category header
      const header = document.createElement("h3");
      let icon = "fa-file-alt"; // Default icon

      // Set icon based on category
      switch (category) {
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
        case "drafts":
          icon = "fa-file-alt";
          break;
      }

      // Format category name
      const categoryName =
        category.charAt(0).toUpperCase() + category.slice(1);

      header.innerHTML = `<i class="fas ${icon}"></i> ${categoryName}`;
      categoryDiv.appendChild(header);

      // Create template cards container
      const cardsDiv = document.createElement("div");
      cardsDiv.className = "template-cards";
      cardsDiv.style.display = "grid"; // Force grid display

      // Determine page size for this category
      // Check if the template filter is set to 'draft'
      const isDraftsCategory = templateFilter === 'draft';
      const pageSize = isDraftsCategory 
        ? categoryPageSizes['drafts'] 
        : categoryPageSizes['templates'];

      // Set up pagination for this category
      const totalItems = forms.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const currentPageForCategory =
        categoryPagination[category].currentPage || 1;

      // Make sure current page is valid
      if (currentPageForCategory > totalPages) {
        categoryPagination[category].currentPage = 1;
      }

      // Get items for current page
      const startIndex =
        (categoryPagination[category].currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      const paginatedForms = forms.slice(startIndex, endIndex);

      console.log(
        `Category ${category}: ${forms.length} forms, ${totalPages} pages, current page size: ${pageSize}, current page: ${categoryPagination[category].currentPage}`
      );
      console.log(`Showing items ${startIndex} to ${endIndex}`);

      // Add form cards for current page
      paginatedForms.forEach((form) => {
        const card = createFormCard(form);
        card.style.display = "flex"; // Force display
        cardsDiv.appendChild(card);
      });

      categoryDiv.appendChild(cardsDiv);

      // Only show pagination if total forms exceed page size
      if (totalItems > pageSize) {
        const paginationContainer = document.createElement("div");
        paginationContainer.className = "pagination";
        paginationContainer.style.margin = "0 0 1rem";

        // Previous button
        const prevButton = document.createElement("button");
        prevButton.className = "pagination-button";
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = categoryPagination[category].currentPage === 1;
        prevButton.addEventListener("click", () => {
          if (categoryPagination[category].currentPage > 1) {
            categoryPagination[category].currentPage--;
            fetchAndRenderForms();
          }
        });
        paginationContainer.appendChild(prevButton);

        // Determine start and end pages to show
        let startPage = categoryPagination[category].currentPage - 1;
        let endPage = categoryPagination[category].currentPage + 1;

        // Adjust start and end pages to always show 3 pages
        if (startPage < 1) {
          startPage = 1;
          endPage = Math.min(3, totalPages);
        }
        
        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = Math.max(1, totalPages - 2);
        }

        // Add page number buttons
        for (let i = startPage; i <= endPage; i++) {
          const pageButton = document.createElement("button");
          pageButton.className = "pagination-button";
          if (i === categoryPagination[category].currentPage) {
            pageButton.classList.add("active");
          }
          pageButton.textContent = i;
          pageButton.addEventListener("click", () => {
            categoryPagination[category].currentPage = i;
            fetchAndRenderForms();
          });
          paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement("button");
        nextButton.className = "pagination-button";
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = 
          categoryPagination[category].currentPage === totalPages || 
          totalPages === 0;
        nextButton.addEventListener("click", () => {
          if (categoryPagination[category].currentPage < totalPages) {
            categoryPagination[category].currentPage++;
            fetchAndRenderForms();
          }
        });
        paginationContainer.appendChild(nextButton);

        // Pagination info
        const pageInfo = document.createElement("div");
        pageInfo.className = "pagination-info";

        // Calculate the item range
        const startIndex = (categoryPagination[category].currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(
          categoryPagination[category].currentPage * pageSize, 
          totalItems
        );

        pageInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalItems}`;
        paginationContainer.appendChild(pageInfo);

        categoryDiv.appendChild(paginationContainer);
      } else {
        // If fewer forms than page size, center the item count with padding
        const pageInfo = document.createElement("div");
        pageInfo.className = "pagination-info";
        pageInfo.style.textAlign = "center";
        pageInfo.style.padding = "1rem";
        pageInfo.style.color = "var(--text-muted)";
        pageInfo.textContent = `Showing ${totalItems} of ${totalItems} forms`;
        categoryDiv.appendChild(pageInfo);
      }

      allCategoriesContainer.appendChild(categoryDiv);
    });

    // Add all categories to the forms list
    formsList.appendChild(allCategoriesContainer);

    console.log(
      `Rendered ${allForms.length} forms across ${
        Object.keys(groupedForms).length
      } categories`
    );
  } catch (error) {
    console.error("Error fetching forms:", error);
    const formsList = document.getElementById("formsList");
    formsList.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error Loading Forms</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="fetchAndRenderForms()">Try Again</button>
      </div>
    `;
  }
}

// Updated createFormCard function
function createFormCard(form) {
  const card = document.createElement("div");
  card.className = "template-card";
  card.dataset.formId = form._id;

  // Choose icon based on category
  let icon = "fa-file-alt"; // Default icon

  // Choose icon based on category
  if (form.category === "contract") {
    icon = "fa-file-contract";
  } else if (form.category === "proposal") {
    icon = "fa-file-invoice";
  } else if (form.category === "invoice") {
    icon = "fa-file-invoice-dollar";
  } else if (form.category === "agreement") {
    icon = "fa-handshake";
  }

  // Use the GLOBAL date format - this is the key fix!
  const currentDateFormat = window.dateFormat || "MM/DD/YYYY";

  // Format modified date
  let formattedModifiedDate = "Not recorded";
  if (form.lastModified) {
    const modifiedDate = new Date(form.lastModified);
    formattedModifiedDate = Utils.formatDateTime(
      modifiedDate,
      currentDateFormat
    );
  }

  // Format creation date
  let formattedCreationDate = "Not recorded";
  if (form.createdAt) {
    const creationDate = new Date(form.createdAt);
    formattedCreationDate = Utils.formatDateTime(
      creationDate,
      currentDateFormat
    );
  }

  // Add a label for template or draft
  const typeLabel = form.isTemplate
    ? '<span class="type-label template">Template</span>'
    : '<span class="type-label draft">Draft</span>';

  // Create card content with both dates and type label
  card.innerHTML = `
    <div class="template-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="template-details">
      <h4>${form.title} ${typeLabel}</h4>
      <p>${form.description || "No description"}</p>
      <div class="template-meta">
        <span><i class="far fa-calendar-plus"></i> Created: ${formattedCreationDate}</span>
        <span><i class="far fa-clock"></i> Modified: ${formattedModifiedDate}</span>
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
  card.querySelector(".preview-form").addEventListener("click", function (e) {
    e.stopPropagation();
    openFormPreview(form._id);
  });

  card.querySelector(".edit-form").addEventListener("click", function (e) {
    e.stopPropagation();
    openEditFormModal(form._id);
  });

  card.querySelector(".delete-form").addEventListener("click", function (e) {
    e.stopPropagation();
    confirmDeleteForm(form._id);
  });

  // Add click event to entire card for preview
  card.addEventListener("click", function () {
    openFormPreview(form._id);
  });

  return card;
}

/**
 * Apply filters and search
 */
function applyFilters() {
  // Reset category pagination when filters change
  categoryPagination = {};
  fetchAndRenderForms();
}

/**
 * Open the form creation modal
 */
function openCreateFormModal() {
  // Clear form
  document.getElementById("formId").value = "";
  document.getElementById("formTitle").value = "";
  document.getElementById("formDescription").value = "";
  document.getElementById("formCategory").value = "contract";
  document.getElementById("isTemplate").value = "true";

  // Clear editor content properly and update preview
  if (editor) {
    // Set to empty string
    editor.setValue("");

    // Force editor refresh to update display
    setTimeout(() => {
      editor.refresh();
      editor.focus();
      // Force update the preview
      updateMarkdownPreview();
    }, 50);
  }

  // Update modal title
  document.getElementById("formEditorTitle").textContent = "Create New Form";

  // Show modal
  document.getElementById("formEditorModal").style.display = "block";
}

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

    // This is the important part - refresh the editor after setting content
    setTimeout(() => {
      editor.refresh();
      // Also force focus on the editor to ensure it's visible
      editor.focus();
    }, 10);

    // Update modal title
    document.getElementById("formEditorTitle").textContent = "Edit Form";

    // Show/hide variables section based on template status
    const variablesContainer = document.querySelector(".variables-container");
    const isTemplate = form.isTemplate;

    // if (variablesContainer) {
    //   variablesContainer.style.display = isTemplate ? "block" : "none";
    // }

    // Show modal
    document.getElementById("formEditorModal").style.display = "block";
  } catch (error) {
    console.error("Error loading form for editing:", error);
    Utils.showToast("Error: " + error.message);
  }
}

/**
 * Close the form editor modal
 */
function closeFormEditorModal() {
  document.getElementById("formEditorModal").style.display = "none";
}

/**
 * Handle form submission
 */
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
    contentLength: content.length,
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
    content,
  };

  try {
    console.log("Attempting to save form...");
    const baseUrl = API.getBaseUrl() + "/api/forms";

    let response;
    if (formId) {
      console.log(`Updating form ID: ${formId}`);
      response = await fetch(`${baseUrl}/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    } else {
      console.log("Creating new form");
      response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response:", errorData);
      throw new Error(
        errorData.message || `Server returned ${response.status}`
      );
    }

    const savedForm = await response.json();
    console.log("Form saved successfully:", savedForm);

    // Close modal
    closeFormEditorModal();

    // Show success message
    Utils.showToast(
      formId ? "Form updated successfully" : "Form created successfully"
    );

    // Refresh forms list
    fetchAndRenderForms();
  } catch (error) {
    console.error("Error saving form:", error);
    Utils.showToast(
      `Error: ${
        error.message || "Failed to save form"
      }. Check console for details.`
    );
  }
}

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

    // Get date format from window object or use default
    const dateFormat = window.dateFormat || "MM/DD/YYYY";

    // Format dates for display
    let formattedCreationDate = "Not recorded";
    let formattedModifiedDate = "Not recorded";

    if (form.createdAt) {
      const creationDate = new Date(form.createdAt);
      formattedCreationDate = Utils.formatDateTime(creationDate, dateFormat);
    }

    if (form.lastModified) {
      const modifiedDate = new Date(form.lastModified);
      formattedModifiedDate = Utils.formatDateTime(modifiedDate, dateFormat);
    }

    // Set preview title
    document.getElementById("previewFormTitle").textContent = form.title;

    // Create metadata section for dates
    const metadataHTML = `
       <div class="form-metadata">
          <div><strong>Form Id: ${formId}</strong></div>
          <div><strong>Created:</strong> ${formattedCreationDate}</div>
          <div><strong>Last Modified:</strong> ${formattedModifiedDate}</div>
          <small>(Form Metadata will not be visible outside of this preview)</small>
          <hr>
        </div> 
    `;

    // Convert markdown to HTML
    const html = DOMPurify.sanitize(marked.parse(form.content));

    // Set preview content with metadata
    const previewContent = document.getElementById("previewContent");
    previewContent.innerHTML = metadataHTML + html;

    // Only show the "Use with Lead" button for templates
    const useWithLeadButton = form.isTemplate
      ? `<button type="button" id="useWithLeadBtn" class="btn btn-outline">
        <i class="fas fa-user"></i> Use Customer Data
      </button>`
      : "";

    // Update the modal-actions div to conditionally include the use with lead button
    const modalActions = document.querySelector(
      "#formPreviewModal .modal-actions"
    );
    if (modalActions) {
      modalActions.innerHTML = `
        <div>
          <button type="button" id="editFormBtn" class="btn btn-outline">
            <i class="fas fa-edit"></i> Edit
          </button>
          ${useWithLeadButton}
        </div>
        <div>
          <button type="button" id="downloadFormBtn" class="btn btn-primary">
            <i class="fas fa-download"></i> Download .md
          </button>
          <button type="button" id="printFormBtn" class="btn btn-primary">
            <i class="fas fa-print"></i> Print PDF
          </button>
        </div>
      `;
    }

    // Show modal
    document.getElementById("formPreviewModal").style.display = "block";

    // Add event listeners to buttons
    document
      .getElementById("editFormBtn")
      .addEventListener("click", function () {
        closeFormPreviewModal();
        openEditFormModal(formId);
      });

    document
      .getElementById("downloadFormBtn")
      .addEventListener("click", function () {
        downloadForm(formId);
      });

    document
      .getElementById("printFormBtn")
      .addEventListener("click", function () {
        printForm(formId);
      });

    // Only add the Use with Lead event listener if the button exists
    const useWithLeadBtn = document.getElementById("useWithLeadBtn");
    if (useWithLeadBtn) {
      useWithLeadBtn.addEventListener("click", function () {
        openLeadSelectionModal();
      });
    }
  } catch (error) {
    console.error("Error loading form preview:", error);
    Utils.showToast("Error: " + error.message);
  }
}

/**
 * Close the form preview modal
 */
function closeFormPreviewModal() {
  document.getElementById("formPreviewModal").style.display = "none";
}

/**
 * Confirm delete form
 */
function confirmDeleteForm(formId) {
  if (
    confirm(
      "Are you sure you want to delete this form? This action cannot be undone."
    )
  ) {
    deleteForm(formId);
  }
}

/**
 * Delete a form
 */
async function deleteForm(formId) {
  try {
    // Delete form
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`, {
      method: "DELETE",
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

async function downloadForm(formId) {
  try {
    // Get the form content directly from the server or editor
    let formContent;
    let title;

    if (formId) {
      // Fetch form from server to get original content with all whitespace
      const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch form");
      }

      const form = await response.json();
      formContent = form.content;
      title = form.title;
    } else {
      // Use content from the preview modal
      title = document.getElementById("previewFormTitle").textContent;

      // Get content directly from editor if available
      if (editor) {
        formContent = editor.getValue();
      } else {
        // Fallback in case editor isn't available
        const previewContent = document.getElementById("previewContent");
        // Create a temporary div to avoid HTML-to-text conversion issues
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = previewContent.innerHTML;
        formContent = tempDiv.innerText;
      }
    }

    // Create a blob with the raw content - important to use text/markdown mime type
    const blob = new Blob([formContent], {
      type: "text/markdown;charset=utf-8",
    });

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${title.replace(/\s+/g, "_")}.md`;

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error("Error downloading form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

async function printForm(formId) {
  try {
    // Fetch the form with original formatting
    let form;
    if (formId) {
      const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch form");
      }

      form = await response.json();
    } else {
      // Use the current form content from the preview
      const title = document.getElementById("previewFormTitle").textContent;
      const content = editor
        ? editor.getValue()
        : document.getElementById("previewContent").innerText;
      form = { title, content };
    }

    // Create print window with styles that preserve whitespace
    const printWindow = window.open("", "_blank");

    // Convert markdown to HTML using marked with whitespace options
    const formattedContent = marked.parse(form.content);

    // Write content to print window with special styling for whitespace
    printWindow.document.write(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>${form.title}</title>
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
        
        p {
          margin: 1em 0;
          white-space: pre-wrap;
        }
        
        blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1rem;
          margin-left: 0;
          color: #666;
        }
        
        pre, code {
          white-space: pre;
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: monospace;
        }
        
        ul, ol {
          padding-left: 2em;
          margin: 1em 0;
        }
        
        li {
          margin-bottom: 0.5em;
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
      ${formattedContent}
    </body>
  </html>
`);

    // Print and close
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    console.error("Error printing form:", error);
    Utils.showToast("Error printing form: allow browswer pop-ups" + error.message);
  }
}

async function openLeadSelectionModal() {
  try {
    // First, close the form preview modal
    const previewModal = document.getElementById("formPreviewModal");
    if (previewModal) {
      previewModal.style.display = "none";
    }

    // Check if the current form is a template
    if (currentFormId) {
      const form = await fetchFormById(currentFormId);

      if (!form.isTemplate) {
        Utils.showToast(
          "Only templates can be used with leads. This is a regular form."
        );
        return;
      }
    } else {
      Utils.showToast("Form not found");
      return;
    }

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
      leads.forEach((lead) => {
        const leadItem = document.createElement("div");
        leadItem.className = "lead-item";
        leadItem.style.display = "flex";
        leadItem.style.alignItems = "center";
        leadItem.style.justifyContent = "space-between";
        leadItem.style.padding = "1rem";
        leadItem.style.borderBottom = "1px solid var(--border-color)";

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
        leadItem.querySelector("button").addEventListener("click", function () {
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

// Helper function to fetch a single form
async function fetchFormById(formId) {
  try {
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch form");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching form:", error);
    throw error;
  }
}

async function generateFormWithLeadData(formId, leadId) {
  try {
    // Show loading
    Utils.showToast("Generating form...");

    // Generate form
    const response = await fetch(
      `${API.getBaseUrl()}/api/forms/${formId}/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate form");
    }

    const generatedForm = await response.json();

    // Store the generated form data in a variable to access it later for editing
    window.currentGeneratedForm = generatedForm;

    // Update the modal structure to include editor/preview tabs
    const generatedModal = document.getElementById("generatedFormModal");

    // Set modal content
    generatedModal.querySelector(".modal-content").innerHTML = `
  <span class="close-modal" id="closeGeneratedFormModal">&times;</span>
  <div class="modal-header">
    <h3 id="generatedFormTitle">${generatedForm.title}</h3>
    <div class="editor-tabs">
    <div class="editor-tab" data-tab="editor">Editor</div>
    <div class="editor-tab active" data-tab="preview">Preview</div>
      
    </div>
  </div>
  
  <div class="form-editor-container">
    <div class="preview-section active">
      <div class="markdown-content" id="generatedContent">
        ${DOMPurify.sanitize(marked.parse(generatedForm.content))}
      </div>
    </div>
    
    <div class="editor-section inactive">
      <textarea id="editGeneratedContent">${generatedForm.content}</textarea>
    </div>
  </div>
  
  <div class="modal-actions">
    <button type="button" id="saveGeneratedBtn" class="btn btn-primary">
      <i class="fas fa-save"></i> Save Changes
    </button>
    <button type="button" id="downloadGeneratedBtn" class="btn btn-primary">
      <i class="fas fa-download"></i> Download .md
    </button>
    <button type="button" id="printGeneratedBtn" class="btn btn-primary">
      <i class="fas fa-print"></i> Print PDF
    </button>
  </div>
`;

    // Show modal
    generatedModal.style.display = "block";

    // Initialize the CodeMirror editor for the generated content
    setTimeout(() => {
      initializeGeneratedFormEditor();

      // Set up event handlers for the new modal structure
      setupGeneratedFormModalEvents(leadId);
    }, 100);
  } catch (error) {
    console.error("Error generating form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

function initializeGeneratedFormEditor() {
  const textarea = document.getElementById("editGeneratedContent");
  if (!textarea) return;

  // Check if CodeMirror is already initialized on this textarea
  // Fix: Safely check if nextSibling exists before accessing its properties
  if (
    textarea.nextSibling &&
    textarea.nextSibling.classList &&
    textarea.nextSibling.classList.contains("CodeMirror")
  ) {
    return;
  }

  // Initialize CodeMirror
  try {
    window.generatedFormEditor = CodeMirror.fromTextArea(textarea, {
      mode: "markdown",
      lineNumbers: true,
      lineWrapping: true,
      theme: "default",
      placeholder: "Edit your form content here in Markdown format...",
    });

    // Update preview when content changes
    window.generatedFormEditor.on("change", function () {
      updateGeneratedFormPreview();
    });

    // Force a refresh to ensure proper rendering
    setTimeout(() => {
      if (window.generatedFormEditor) {
        window.generatedFormEditor.refresh();
      }
    }, 50);
  } catch (error) {
    console.error("Error initializing CodeMirror editor:", error);
    // Fallback to regular textarea if CodeMirror fails
  }
}

// New function to update the generated form preview
function updateGeneratedFormPreview() {
  if (!window.generatedFormEditor) return;

  const content = window.generatedFormEditor.getValue();
  const preview = document.getElementById("generatedContent");

  if (!content) {
    preview.innerHTML = "<p><em>No content to preview</em></p>";
    return;
  }

  // Convert markdown to HTML with DOMPurify for security
  const html = DOMPurify.sanitize(marked.parse(content));
  preview.innerHTML = html;
}

function setupGeneratedFormModalEvents(leadId) {
  // Tab switching
  document
    .querySelectorAll("#generatedFormModal .editor-tab")
    .forEach((tab) => {
      tab.addEventListener("click", function () {
        console.log("Tab clicked:", this.getAttribute("data-tab"));

        // Set active tab
        document
          .querySelectorAll("#generatedFormModal .editor-tab")
          .forEach((t) => {
            t.classList.remove("active");
          });
        this.classList.add("active");

        const tabName = this.getAttribute("data-tab");
        const editorSection = document.querySelector(
          "#generatedFormModal .editor-section"
        );
        const previewSection = document.querySelector(
          "#generatedFormModal .preview-section"
        );

        console.log("Switching to tab:", tabName);
        console.log("Editor section:", editorSection);
        console.log("Preview section:", previewSection);

        if (tabName === "editor") {
          if (editorSection) editorSection.classList.remove("inactive");
          if (previewSection) previewSection.classList.remove("active");

          // Refresh CodeMirror
          if (window.generatedFormEditor) {
            setTimeout(() => {
              window.generatedFormEditor.refresh();
              window.generatedFormEditor.focus();
            }, 50);
          }
        } else {
          if (editorSection) editorSection.classList.add("inactive");
          if (previewSection) previewSection.classList.add("active");

          // Update preview
          updateGeneratedFormPreview();
        }
      });
    });

  // Save button
  document
    .getElementById("saveGeneratedBtn")
    .addEventListener("click", function () {
      saveGeneratedForm(leadId);
    });

  // Close button
  document
    .getElementById("closeGeneratedFormModal")
    .addEventListener("click", function () {
      document.getElementById("generatedFormModal").style.display = "none";
    });

  // Download button
  document
    .getElementById("downloadGeneratedBtn")
    .addEventListener("click", function () {
      downloadGeneratedForm();
    });

  // Print button
  document
    .getElementById("printGeneratedBtn")
    .addEventListener("click", function () {
      printGeneratedForm();
    });
}

// Fixed function to save the edited generated form
async function saveGeneratedForm(leadId) {
  try {
    if (!window.generatedFormEditor || !window.currentGeneratedForm) {
      Utils.showToast("Error: Form editor not initialized");
      return;
    }

    const formId = window.currentGeneratedForm._id;
    const content = window.generatedFormEditor.getValue();

    // Show loading toast
    Utils.showToast("Saving form...");

    // Update the form
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Failed to save form");
    }

    // Show success message
    Utils.showToast("Form saved successfully");

    // Update the preview
    updateGeneratedFormPreview();

    // Reload lead forms - Fixed: Use the correct function name
    if (leadId) {
      try {
        // First check if the function exists in the global scope
        if (typeof window.loadLeadForms === "function") {
          window.loadLeadForms(leadId);
        } else if (typeof loadLeadForms === "function") {
          loadLeadForms(leadId);
        } else {
          console.log(
            "Note: Form saved but couldn't refresh lead forms list automatically."
          );
          // You might need to manually refresh the page or provide a button for the user to do so
        }
      } catch (err) {
        console.log(
          "Note: Form saved but couldn't refresh lead forms list automatically."
        );
        // This catch ensures the function doesn't fail even if the refresh function isn't available
      }
    }
  } catch (error) {
    console.error("Error saving form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

/**
 * Close the generated form modal
 */
function closeGeneratedFormModal() {
  document.getElementById("generatedFormModal").style.display = "none";
}

function closeLeadSelectionModal() {
  const modal = document.getElementById("leadSelectionModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function downloadGeneratedForm() {
  try {
    // Get the original generated form content
    let content;

    if (window.currentGeneratedForm && window.currentGeneratedForm.content) {
      // Use the original content from the generated form object
      content = window.currentGeneratedForm.content;
    } else if (window.generatedFormEditor) {
      // If editor exists, get content from there
      content = window.generatedFormEditor.getValue();
    } else {
      // Fallback to get content from the HTML
      const generatedContent = document.getElementById("generatedContent");
      const tempElement = document.createElement("div");
      tempElement.innerHTML = generatedContent.innerHTML;
      content = tempElement.innerText;
    }

    const title = document.getElementById("generatedFormTitle").textContent;

    // Create a blob with the content - using text/markdown mime type
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${title.replace(/\s+/g, "_")}.md`;

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error("Error downloading generated form:", error);
    Utils.showToast("Error: " + error.message);
  }
}

/**
 * Print the generated form
 */
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
    ${content}
  </body>
</html>
`);

  // Print the window
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export {
  openFormPreview,
  downloadForm,
  printForm,
  openEditFormModal,
  deleteForm,
};
