// dashboard/js/hitlists.js
import * as API from "./api.js";
import * as Utils from "./utils.js";

let allHitlists = [];
let currentHitlistId = null;

document.addEventListener("DOMContentLoaded", function () {
  setupSidebarToggle();
  setupEventListeners();
  fetchAndRenderHitlists();
  initializeDateInputs();
});

function setupSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (!sidebar || !mainContent) {
    console.error("Sidebar or main content not found");
    return;
  }

  const isSidebarCollapsed = localStorage.getItem("sidebarCollapsed") === "true";

  if (isSidebarCollapsed) {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("expanded");
  }

  const existingButton = document.querySelector(".sidebar-toggle");
  if (existingButton) {
    existingButton.remove();
  }

  const toggleButton = document.createElement("button");
  toggleButton.className = "sidebar-toggle";
  toggleButton.setAttribute("aria-label", "Toggle Sidebar");
  toggleButton.innerHTML =
    '<i class="fas fa-angles-left"></i><i class="fas fa-angles-right"></i>';

  sidebar.appendChild(toggleButton);

  toggleButton.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    localStorage.setItem(
      "sidebarCollapsed",
      sidebar.classList.contains("collapsed")
    );
  });
}

function setupEventListeners() {
  // Hitlist modal events
  document.getElementById("createHitlistBtn").addEventListener("click", openCreateHitlistModal);
  document.getElementById("closeHitlistModal").addEventListener("click", closeHitlistModal);
  document.getElementById("cancelHitlistBtn").addEventListener("click", closeHitlistModal);
  document.getElementById("hitlistForm").addEventListener("submit", handleHitlistSubmit);

  // Business modal events
  document.getElementById("closeBusinessListModal").addEventListener("click", closeBusinessListModal);
  document.getElementById("addBusinessBtn").addEventListener("click", openAddBusinessModal);
  document.getElementById("closeBusinessModal").addEventListener("click", closeBusinessModal);
  document.getElementById("cancelBusinessBtn").addEventListener("click", closeBusinessModal);
  document.getElementById("businessForm").addEventListener("submit", handleBusinessSubmit);

  // Search and filter events
  document.getElementById("searchInput").addEventListener("input", filterHitlists);
  document.getElementById("businessSearchInput").addEventListener("input", filterBusinesses);
  document.getElementById("statusFilter").addEventListener("change", filterBusinesses);

  // Website checkbox toggle
  document.getElementById("hasWebsite").addEventListener("change", function() {
    const websiteUrlGroup = document.getElementById("websiteUrlGroup");
    websiteUrlGroup.style.display = this.value === "true" ? "block" : "none";
  });

  // Date input changes
  const lastContactedInput = document.getElementById("lastContactedDate");
  if (lastContactedInput) {
    lastContactedInput.addEventListener("change", function() {
      if (this.value) {
        const date = new Date(this.value);
        const displayElement = document.getElementById("lastContactedDisplay");
        if (displayElement) {
          displayElement.textContent = Utils.formatDate(date, window.dateFormat || "MM/DD/YYYY");
        }
      }
    });
  }
}

async function fetchAndRenderHitlists() {
  try {
    const hitlistsList = document.getElementById("hitlistsList");
    hitlistsList.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading hitlists...</div>';

    allHitlists = await API.fetchHitlists();
    renderHitlists(allHitlists);
  } catch (error) {
    console.error("Error fetching hitlists:", error);
    document.getElementById("hitlistsList").innerHTML = 
      '<div class="error-state">Error loading hitlists. Please try again.</div>';
  }
}

function renderHitlists(hitlists) {
  const hitlistsList = document.getElementById("hitlistsList");
  
  if (!hitlists || hitlists.length === 0) {
    hitlistsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bullseye"></i>
        <h3>No hitlists yet</h3>
        <p>Create your first hitlist to start tracking businesses</p>
      </div>
    `;
    return;
  }

  hitlistsList.innerHTML = hitlists.map(hitlist => `
    <div class="hitlist-card" data-id="${hitlist._id}">
      <div class="hitlist-header">
        <h3 class="hitlist-title">${hitlist.name}</h3>
        <div class="hitlist-actions">
          <button class="btn-icon edit-hitlist" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-hitlist" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <p class="hitlist-description">${hitlist.description || 'No description'}</p>
      <div class="hitlist-stats">
        <span class="hitlist-stat">
          <i class="fas fa-building"></i>
          ${hitlist.businesses ? hitlist.businesses.length : 0} businesses
        </span>
        <span class="hitlist-stat">
          <i class="fas fa-clock"></i>
          ${Utils.formatDate(hitlist.lastModified, window.dateFormat || "MM/DD/YYYY")}
        </span>
      </div>
    </div>
  `).join('');

  // Add event listeners to cards
  hitlistsList.querySelectorAll('.hitlist-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (!e.target.closest('.hitlist-actions')) {
        openBusinessListModal(this.dataset.id);
      }
    });

    card.querySelector('.edit-hitlist').addEventListener('click', function(e) {
      e.stopPropagation();
      openEditHitlistModal(card.dataset.id);
    });

    card.querySelector('.delete-hitlist').addEventListener('click', function(e) {
      e.stopPropagation();
      deleteHitlist(card.dataset.id);
    });
  });
}

function openCreateHitlistModal() {
  document.getElementById("hitlistModalTitle").textContent = "Create New Hitlist";
  document.getElementById("hitlistId").value = "";
  document.getElementById("hitlistForm").reset();
  document.getElementById("hitlistModal").style.display = "block";
}

function openEditHitlistModal(hitlistId) {
  const hitlist = allHitlists.find(h => h._id === hitlistId);
  if (!hitlist) return;

  document.getElementById("hitlistModalTitle").textContent = "Edit Hitlist";
  document.getElementById("hitlistId").value = hitlist._id;
  document.getElementById("hitlistName").value = hitlist.name;
  document.getElementById("hitlistDescription").value = hitlist.description || "";
  document.getElementById("hitlistModal").style.display = "block";
}

function closeHitlistModal() {
  document.getElementById("hitlistModal").style.display = "none";
}

async function handleHitlistSubmit(event) {
  event.preventDefault();

  const hitlistId = document.getElementById("hitlistId").value;
  const hitlistData = {
    name: document.getElementById("hitlistName").value,
    description: document.getElementById("hitlistDescription").value
  };

  try {
    if (hitlistId) {
      await API.updateHitlist(hitlistId, hitlistData);
      Utils.showToast("Hitlist updated successfully");
    } else {
      await API.createHitlist(hitlistData);
      Utils.showToast("Hitlist created successfully");
    }

    closeHitlistModal();
    fetchAndRenderHitlists();
  } catch (error) {
    console.error("Error saving hitlist:", error);
    Utils.showToast("Error saving hitlist");
  }
}

async function deleteHitlist(hitlistId) {
  if (!confirm("Are you sure you want to delete this hitlist? All associated businesses will also be deleted.")) {
    return;
  }

  try {
    await API.deleteHitlist(hitlistId);
    Utils.showToast("Hitlist deleted successfully");
    fetchAndRenderHitlists();
  } catch (error) {
    console.error("Error deleting hitlist:", error);
    Utils.showToast("Error deleting hitlist");
  }
}

async function openBusinessListModal(hitlistId) {
  currentHitlistId = hitlistId;
  const hitlist = allHitlists.find(h => h._id === hitlistId);
  
  if (!hitlist) return;

  document.getElementById("businessListTitle").textContent = hitlist.name + " - Businesses";
  document.getElementById("businessListModal").style.display = "block";
  
  // Show loading indicator
  const businessesList = document.getElementById("businessesList");
  businessesList.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading businesses...</div>';
  
  try {
    const businesses = await API.fetchBusinessesByHitlist(hitlistId);
    renderBusinesses(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    businessesList.innerHTML = '<div class="error-state">Error loading businesses. Please try again.</div>';
  }
}

function closeBusinessListModal() {
  document.getElementById("businessListModal").style.display = "none";
  currentHitlistId = null;
}

function renderBusinesses(businesses) {
  const businessesList = document.getElementById("businessesList");
  
  if (!businesses || businesses.length === 0) {
    businessesList.innerHTML = '<div class="no-businesses-message">No businesses added yet.</div>';
    return;
  }

  businessesList.innerHTML = businesses.map(business => `
    <div class="business-item ${business.status === 'converted' ? 'converted' : ''}" data-id="${business._id}">
      <div class="business-info">
        <div class="business-header">
          <span class="business-title">${business.businessName}</span>
          <span class="status-badge status-${business.status}">${formatStatus(business.status)}</span>
          <span class="priority-badge priority-${business.priority}">${business.priority}</span>
        </div>
        <div class="business-details">
          ${business.contactName ? `<div class="business-detail"><i class="fas fa-user"></i> ${business.contactName}</div>` : ''}
          ${business.phone ? `<div class="business-detail"><i class="fas fa-phone"></i> ${business.phone}</div>` : ''}
          ${business.email ? `<div class="business-detail"><i class="fas fa-envelope"></i> ${business.email}</div>` : ''}
          ${business.websiteUrl ? `<div class="business-detail"><i class="fas fa-globe"></i> <a href="${business.websiteUrl}" target="_blank">Website</a></div>` : ''}
          ${business.lastContactedDate ? `<div class="business-detail"><i class="fas fa-clock"></i> Last contact: ${Utils.formatDate(business.lastContactedDate, window.dateFormat || "MM/DD/YYYY")}</div>` : ''}
        </div>
      </div>
      <div class="business-actions">
        ${business.status !== 'converted' ? 
          `<button class="btn-icon convert-to-lead" title="Convert to Lead">
            <i class="fas fa-user-plus"></i>
          </button>` :
          `<button class="btn-icon" disabled title="Already Converted" style="cursor: not-allowed; opacity: 0.5;">
            <i class="fas fa-check"></i>
          </button>`
        }
        <button class="btn-icon edit-business" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon delete-business" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  businessesList.querySelectorAll('.convert-to-lead').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const businessId = this.closest('.business-item').dataset.id;
      const business = businesses.find(b => b._id === businessId);
      convertBusinessToLead(business);
    });
  });

  businessesList.querySelectorAll('.edit-business').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const businessId = this.closest('.business-item').dataset.id;
      const business = businesses.find(b => b._id === businessId);
      openEditBusinessModal(business);
    });
  });

  businessesList.querySelectorAll('.delete-business').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const businessId = this.closest('.business-item').dataset.id;
      deleteBusiness(businessId);
    });
  });
}

function openAddBusinessModal() {
  document.getElementById("businessModalTitle").textContent = "Add Business";
  document.getElementById("businessId").value = "";
  document.getElementById("currentHitlistId").value = currentHitlistId;
  document.getElementById("businessForm").reset();
  document.getElementById("websiteUrlGroup").style.display = "none";
  document.getElementById("businessModal").style.display = "block";
}

function openEditBusinessModal(business) {
  document.getElementById("businessModalTitle").textContent = "Edit Business";
  document.getElementById("businessId").value = business._id;
  document.getElementById("currentHitlistId").value = business.hitlistId;
  
  // Fill form fields
  document.getElementById("businessName").value = business.businessName;
  document.getElementById("industry").value = business.industry || "";
  document.getElementById("contactName").value = business.contactName || "";
  document.getElementById("phone").value = business.phone || "";
  document.getElementById("email").value = business.email || "";
  document.getElementById("hasWebsite").value = business.hasWebsite ? "true" : "false";
  document.getElementById("websiteUrl").value = business.websiteUrl || "";
  document.getElementById("status").value = business.status;
  document.getElementById("priority").value = business.priority;
  document.getElementById("notes").value = business.notes || "";
  
  if (business.lastContactedDate) {
    const date = new Date(business.lastContactedDate);
    document.getElementById("lastContactedDate").value = date.toISOString().split('T')[0];
    document.getElementById("lastContactedDisplay").textContent = Utils.formatDate(date, window.dateFormat || "MM/DD/YYYY");
  }
  
  // Show/hide website URL field
  document.getElementById("websiteUrlGroup").style.display = business.hasWebsite ? "block" : "none";
  
  document.getElementById("businessModal").style.display = "block";
}

function closeBusinessModal() {
  document.getElementById("businessModal").style.display = "none";
}

async function handleBusinessSubmit(event) {
  event.preventDefault();

  const businessId = document.getElementById("businessId").value;
  const hitlistId = document.getElementById("currentHitlistId").value;
  
  const businessData = {
    businessName: document.getElementById("businessName").value,
    industry: document.getElementById("industry").value,
    contactName: document.getElementById("contactName").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    hasWebsite: document.getElementById("hasWebsite").value === "true",
    websiteUrl: document.getElementById("websiteUrl").value,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    notes: document.getElementById("notes").value,
    hitlistId: hitlistId
  };

  // Handle date
  const lastContactedDate = document.getElementById("lastContactedDate").value;
  if (lastContactedDate) {
    businessData.lastContactedDate = new Date(lastContactedDate);
  }

  try {
    if (businessId) {
      await API.updateBusiness(businessId, businessData);
      Utils.showToast("Business updated successfully");
    } else {
      await API.createBusiness(hitlistId, businessData);
      Utils.showToast("Business added successfully");
    }

    closeBusinessModal();
    openBusinessListModal(hitlistId); // Refresh business list
  } catch (error) {
    console.error("Error saving business:", error);
    Utils.showToast("Error saving business");
  }
}

async function deleteBusiness(businessId) {
  if (!confirm("Are you sure you want to delete this business?")) {
    return;
  }

  try {
    await API.deleteBusiness(businessId);
    Utils.showToast("Business deleted successfully");
    openBusinessListModal(currentHitlistId); // Refresh business list
  } catch (error) {
    console.error("Error deleting business:", error);
    Utils.showToast("Error deleting business");
  }
}

function filterHitlists() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredHitlists = allHitlists.filter(hitlist => 
    hitlist.name.toLowerCase().includes(searchTerm) ||
    (hitlist.description && hitlist.description.toLowerCase().includes(searchTerm))
  );
  renderHitlists(filteredHitlists);
}

function filterBusinesses() {
  const searchTerm = document.getElementById("businessSearchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  
  // For filtering, we need to fetch businesses again or store them globally
  API.fetchBusinessesByHitlist(currentHitlistId).then(businesses => {
    const filteredBusinesses = businesses.filter(business => {
      const matchesSearch = 
        business.businessName.toLowerCase().includes(searchTerm) ||
        (business.contactName && business.contactName.toLowerCase().includes(searchTerm)) ||
        (business.email && business.email.toLowerCase().includes(searchTerm)) ||
        (business.phone && business.phone.toLowerCase().includes(searchTerm));
      
      const matchesStatus = !statusFilter || business.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    renderBusinesses(filteredBusinesses);
  });
}

function formatStatus(status) {
  return status.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function initializeDateInputs() {
  // Handle date input changes
  const lastContactedInput = document.getElementById("lastContactedDate");
  if (lastContactedInput) {
    lastContactedInput.addEventListener("change", function() {
      if (this.value) {
        const date = new Date(this.value);
        const displayElement = document.getElementById("lastContactedDisplay");
        if (displayElement) {
          displayElement.textContent = Utils.formatDate(date, window.dateFormat || "MM/DD/YYYY");
        }
      }
    });
  }
}

async function convertBusinessToLead(business) {
  try {
    // Prepare lead data from business information
    const leadData = {
      firstName: business.contactName ? business.contactName.split(' ')[0] || '' : 'Unknown',
      lastName: business.contactName ? business.contactName.split(' ').slice(1).join(' ') || '' : 'Lead',
      email: business.email || '',
      phone: business.phone || '',
      businessName: business.businessName,
      businessPhone: business.phone || '',
      businessEmail: business.email || '',
      hasWebsite: business.hasWebsite ? 'yes' : 'no',
      websiteAddress: business.websiteUrl || '',
      status: mapBusinessStatusToLeadStatus(business.status),
      notes: business.notes || '',
      lastContactedAt: business.lastContactedDate || null,
      source: `Converted from Hitlist: ${currentHitlistId}`,
      message: `Converted from business hitlist. Industry: ${business.industry || 'Not specified'}. Priority: ${business.priority}`,
    };

    // Create the lead
    const createdLead = await API.createLead(leadData);
    
    // Show success message
    Utils.showToast(`Business "${business.businessName}" successfully converted to lead!`);
    
    // Optionally update the business status to "converted"
    if (business.status !== 'converted') {
      const updatedBusiness = {
        ...business,
        status: 'converted'
      };
      await API.updateBusiness(business._id, updatedBusiness);
      
      // Refresh the business list to show updated status
      openBusinessListModal(currentHitlistId);
    }

    // Redirect to dashboard leads page to see the newly created lead
    window.location.href = 'dashboard.html';

  } catch (error) {
    console.error("Error converting business to lead:", error);
    Utils.showToast("Error converting business to lead");
  }
}

function mapBusinessStatusToLeadStatus(businessStatus) {
  // Map business status to lead status
  switch (businessStatus) {
    case 'not-contacted':
      return 'new';
    case 'contacted':
    case 'follow-up':
      return 'contacted';
    case 'not-interested':
      return 'closed-lost';
    case 'converted':
      return 'closed-won';
    default:
      return 'new';
  }
}