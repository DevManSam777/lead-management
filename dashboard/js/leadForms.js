import * as API from "./api.js";
import * as Utils from "./utils.js";

// Function to load forms for a lead
async function loadLeadForms(leadId) {
    try {
      const formsContainer = document.getElementById('leadFormsList');
      
      if (!formsContainer) return;
      
      // Show loading
      formsContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading forms...</div>';
      
      // Fetch forms for this lead
      const response = await fetch(`${API.getBaseUrl()}/api/forms/lead/${leadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead forms');
      }
      
      const forms = await response.json();
      
      // Check if we're in edit mode
      const isEditMode = !document.getElementById("firstName").hasAttribute("readonly");
      
      // Render the forms
      if (forms.length === 0) {
        formsContainer.innerHTML = '<p class="no-forms-message">No forms yet. Click "Create Form" to add one.</p>';
        return;
      }
      
      // Clear container
      formsContainer.innerHTML = '';
      
      // Add each form
      forms.forEach(form => {
        const formDate = new Date(form.lastModified);
        const formattedDate = Utils.formatDate(formDate, window.dateFormat || 'MM/DD/YYYY');
        
        const formItem = document.createElement('div');
        formItem.className = 'form-item';
        formItem.dataset.formId = form._id;
        
        // Capitalize first letter of category
        const category = form.category.charAt(0).toUpperCase() + form.category.slice(1);
        
        // In read-only mode, just show the form details without action buttons
        if (!isEditMode) {
          formItem.innerHTML = `
            <div class="form-details">
              <div class="form-title">${form.title}</div>
              <div class="form-category">${category} • ${formattedDate}</div>
            </div>
          `;
          
          // Make the entire form item clickable in read-only mode
          formItem.classList.add('clickable');
          formItem.addEventListener('click', function() {
            viewForm(form._id);
          });
        } else {
          // In edit mode, show action buttons
          formItem.innerHTML = `
            <div class="form-details">
              <div class="form-title">${form.title}</div>
              <div class="form-category">${category} • ${formattedDate}</div>
            </div>
            <div class="form-actions">
              <button class="btn-icon view-form" title="View Form">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-icon delete-form" title="Delete Form">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `;
          
          // Add event listeners for edit mode
          formItem.querySelector('.view-form').addEventListener('click', function(e) {
            e.stopPropagation();
            viewForm(form._id);
          });
          
          formItem.querySelector('.delete-form').addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${form.title}"?`)) {
              deleteForm(form._id, leadId);
            }
          });
        }
        
        formsContainer.appendChild(formItem);
      });
      
      // Set the visibility of the Add Form button
      const addFormBtn = document.getElementById('addFormBtn');
      if (addFormBtn) {
        addFormBtn.style.display = isEditMode ? 'block' : 'none';
      }
    } catch (error) {
      console.error('Error loading lead forms:', error);
      const formsContainer = document.getElementById('leadFormsList');
      if (formsContainer) {
        formsContainer.innerHTML = '<p class="no-forms-message">Error loading forms</p>';
      }
    }
  }
// Function to open form template selection modal
function openFormTemplateModal(leadId) {
  // Create a modal to select a form template
  const modal = document.createElement('div');
  modal.id = 'formTemplateModal';
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal" id="closeFormTemplateModal">&times;</span>
      <div class="modal-header">
        <h3>Select Form Template</h3>
      </div>
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" id="templateSearchInput" placeholder="Search templates...">
      </div>
      <div id="templatesList" class="template-list">
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Loading templates...
        </div>
      </div>
    </div>
  `;
  
  // Add modal to the DOM
  document.body.appendChild(modal);
  
  // Show the modal
  modal.style.display = 'block';
  
  // Add close button event listener
  document.getElementById('closeFormTemplateModal').addEventListener('click', function() {
    modal.style.display = 'none';
    document.body.removeChild(modal);
  });
  
  // Load templates
  loadFormTemplates(leadId);
  
  // Add search functionality
  document.getElementById('templateSearchInput').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const templateItems = document.querySelectorAll('#templatesList .template-card');
    
    templateItems.forEach(item => {
      const title = item.querySelector('h4').textContent.toLowerCase();
      const desc = item.querySelector('p').textContent.toLowerCase();
      
      if (title.includes(searchTerm) || desc.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// Function to load form templates
async function loadFormTemplates(leadId) {
  try {
    const templatesContainer = document.getElementById('templatesList');
    
    // Fetch templates (forms where isTemplate = true)
    const response = await fetch(`${API.getBaseUrl()}/api/forms?isTemplate=true`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    
    const templates = await response.json();
    
    if (templates.length === 0) {
      templatesContainer.innerHTML = '<p class="no-templates-message">No templates available. Please create templates in the Forms section first.</p>';
      return;
    }
    
    // Clear container
    templatesContainer.innerHTML = '';
    
    // Group templates by category
    const groupedTemplates = {};
    templates.forEach(template => {
      if (!groupedTemplates[template.category]) {
        groupedTemplates[template.category] = [];
      }
      groupedTemplates[template.category].push(template);
    });
    
    // Create a section for each category
    Object.entries(groupedTemplates).forEach(([category, categoryTemplates]) => {
      // Create category header
      const categoryHeader = document.createElement('h4');
      categoryHeader.className = 'template-category-header';
      categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1) + 's';
      templatesContainer.appendChild(categoryHeader);
      
      // Create template cards container
      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'template-cards';
      
      // Add template cards
      categoryTemplates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.templateId = template._id;
        
        // Get icon based on category
        let icon = 'fa-file-alt';
        if (template.category === 'contract') icon = 'fa-file-contract';
        if (template.category === 'proposal') icon = 'fa-file-invoice';
        if (template.category === 'invoice') icon = 'fa-file-invoice-dollar';
        if (template.category === 'agreement') icon = 'fa-handshake';
        
        card.innerHTML = `
          <div class="template-icon">
            <i class="fas ${icon}"></i>
          </div>
          <div class="template-details">
            <h4>${template.title}</h4>
            <p>${template.description || 'No description'}</p>
          </div>
          <div class="template-actions">
            <button class="btn btn-primary use-template">Use Template</button>
          </div>
        `;
        
        // Add event listener to use template button
        card.querySelector('.use-template').addEventListener('click', function() {
          generateFormFromTemplate(template._id, leadId);
        });
        
        cardsContainer.appendChild(card);
      });
      
      templatesContainer.appendChild(cardsContainer);
    });
  } catch (error) {
    console.error('Error loading templates:', error);
    const templatesContainer = document.getElementById('templatesList');
    templatesContainer.innerHTML = '<p class="no-templates-message">Error loading templates</p>';
  }
}

// Function to generate a form from a template
async function generateFormFromTemplate(templateId, leadId) {
  try {
    // Show loading toast
    Utils.showToast('Generating form...');
    
    // Call API to generate form with lead data
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${templateId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ leadId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate form');
    }
    
    const result = await response.json();
    
    // Close template modal
    const modal = document.getElementById('formTemplateModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.removeChild(modal);
    }
    
    // Show success message
    Utils.showToast('Form created successfully');
    
    // Reload lead forms to show the new form
    loadLeadForms(leadId);
  } catch (error) {
    console.error('Error generating form:', error);
    Utils.showToast('Error: ' + error.message);
  }
}

// Function to view a form
async function viewForm(formId) {
    try {
      // Fetch the form
      const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch form');
      }
      
      const form = await response.json();
      
      // Create preview modal
      const modal = document.createElement('div');
      modal.id = 'formPreviewModal';
      modal.className = 'modal';
      
      // Check if we're in edit mode
      const isEditMode = !document.getElementById("firstName").hasAttribute("readonly");
      
      // Use DOMPurify to sanitize the HTML
      const formattedContent = marked.parse ? 
        DOMPurify.sanitize(marked.parse(form.content)) : 
        `<pre style="white-space: pre-wrap;">${form.content}</pre>`;
      
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal" id="closeFormPreviewModal">&times;</span>
          <div class="modal-header">
            <h3>${form.title}</h3>
          </div>
          <div class="preview-container">
            <div class="markdown-content">${formattedContent}</div>
          </div>
          <div class="modal-actions">
            ${isEditMode ? `
              <button type="button" id="editContentBtn" class="btn btn-primary">
                <i class="fas fa-edit"></i> Edit Content
              </button>
            ` : ''}
            <button type="button" id="printPreviewBtn" class="btn btn-primary">
              <i class="fas fa-print"></i> Print PDF
            </button>
            <button type="button" id="downloadPreviewBtn" class="btn btn-primary">
              <i class="fas fa-download"></i> Download .md
            </button>
          </div>
        </div>
      `;
      
      // Add modal to the DOM
      document.body.appendChild(modal);
      
      // Show the modal
      modal.style.display = 'block';
      
      // Add close button event listener
      document.getElementById('closeFormPreviewModal').addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.removeChild(modal);
      });
      
      // Add download button event listener
      document.getElementById('downloadPreviewBtn').addEventListener('click', function() {
        downloadForm(formId);
      });
      
      // Add print button event listener
      document.getElementById('printPreviewBtn').addEventListener('click', function() {
        printForm(formId);
      });
      
      // Add edit button event listener if in edit mode
      if (isEditMode) {
        document.getElementById('editContentBtn').addEventListener('click', function() {
          // Close the preview modal
          modal.style.display = 'none';
          document.body.removeChild(modal);
          
          // Open the edit modal
          openEditContentModal(form);
        });
      }
    } catch (error) {
      console.error('Error viewing form:', error);
      Utils.showToast('Error: ' + error.message);
    }
  }
  
  // Function to open edit content modal
  function openEditContentModal(form) {
    // Create edit modal
    const modal = document.createElement('div');
    modal.id = 'formEditContentModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal" id="closeEditContentModal">&times;</span>
        <div class="modal-header">
          <h3>Edit Form: ${form.title}</h3>
        </div>
        <div class="form-group">
          <textarea id="editFormContent" style="width: 100%; min-height: 300px; font-family: monospace;">${form.content}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" id="saveContentBtn" class="btn btn-primary">
            <i class="fas fa-save"></i> Save Changes
          </button>
          <button type="button" id="cancelEditBtn" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    // Add modal to the DOM
    document.body.appendChild(modal);
    
    // Show the modal
    modal.style.display = 'block';
    
    // Add close button event listener
    document.getElementById('closeEditContentModal').addEventListener('click', function() {
      if (confirm('Are you sure you want to close without saving changes?')) {
        modal.style.display = 'none';
        document.body.removeChild(modal);
      }
    });
    
    // Add save button event listener
    document.getElementById('saveContentBtn').addEventListener('click', function() {
      saveFormContent(form._id, document.getElementById('editFormContent').value);
      modal.style.display = 'none';
      document.body.removeChild(modal);
    });
    
    // Add cancel button event listener
    document.getElementById('cancelEditBtn').addEventListener('click', function() {
      if (confirm('Are you sure you want to cancel without saving changes?')) {
        modal.style.display = 'none';
        document.body.removeChild(modal);
      }
    });
  }
  
  // Function to save form content
  async function saveFormContent(formId, content) {
    try {
      // Show loading toast
      Utils.showToast('Saving form...');
      
      // Call API to update the form
      const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save form');
      }
      
      // Show success message
      Utils.showToast('Form saved successfully');
      
      // Get the lead ID
      const leadId = document.getElementById('leadId').value;
      
      // Reload lead forms
      if (leadId) {
        loadLeadForms(leadId);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      Utils.showToast('Error: ' + error.message);
    }
  }

// Function to edit a form
async function editForm(formId, leadId) {
  try {
    // Redirect to the forms page with the form ID
    const formsUrl = `${window.location.origin}/dashboard/html/forms.html?formId=${formId}`;
    window.open(formsUrl, '_blank');
  } catch (error) {
    console.error('Error editing form:', error);
    Utils.showToast('Error: ' + error.message);
  }
}

// Function to download a form
async function downloadForm(formId) {
  try {
    // Fetch the form
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch form');
    }
    
    const form = await response.json();
    
    // Create a blob
    const blob = new Blob([form.content], { type: 'text/markdown' });
    
    // Create download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${form.title.replace(/\s+/g, '_')}.md`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading form:', error);
    Utils.showToast('Error: ' + error.message);
  }
}

// Function to print a form
async function printForm(formId) {
    try {
      // Fetch the form
      const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch form');
      }
      
      const form = await response.json();
      
      // Create print window
      const printWindow = window.open('', '_blank');
      
      // Convert markdown to HTML if marked is available
      const formattedContent = marked.parse ?
        DOMPurify.sanitize(marked.parse(form.content)) :
        `<pre style="white-space: pre-wrap;">${form.content}</pre>`;
      
      // Write to print window - remove the h1 title line
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
            ${formattedContent}
          </body>
        </html>
      `);
      
      // Print and close
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error('Error printing form:', error);
      Utils.showToast('Error: ' + error.message);
    }
  }

// Function to delete a form
async function deleteForm(formId, leadId) {
  try {
    // Show loading toast
    Utils.showToast('Deleting form...');
    
    // Call API to delete the form
    const response = await fetch(`${API.getBaseUrl()}/api/forms/${formId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete form');
    }
    
    // Also remove the association from the lead
    const leadResponse = await fetch(`${API.getBaseUrl()}/api/leads/${leadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        $pull: { associatedForms: formId }
      })
    });
    
    if (!leadResponse.ok) {
      console.warn('Form deleted but could not update lead association');
    }
    
    // Show success message
    Utils.showToast('Form deleted successfully');
    
    // Reload lead forms
    loadLeadForms(leadId);
  } catch (error) {
    console.error('Error deleting form:', error);
    Utils.showToast('Error: ' + error.message);
  }
}

window.openFormTemplateModal = openFormTemplateModal;

export {
    loadLeadForms,
    openFormTemplateModal,
    viewForm,
    downloadForm,
    printForm,
    saveFormContent,
    openEditContentModal,
    deleteForm
  };