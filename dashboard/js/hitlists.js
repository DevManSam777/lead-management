import * as API from "./api.js";
import * as Utils from "./utils.js";
import * as Pagination from "./pagination.js";

let allHitlists = [];
let currentHitlistId = null;
let currentBusinesses = []; // Store businesses globally

// Pagination state for hitlists defaults
let hitlistCurrentPage = 1;
let hitlistPageSize = 12; // Show 12 hitlists per page
let hitlistTotalPages = 1;

document.addEventListener("DOMContentLoaded", function () {
  setupSidebarToggle();
  setupEventListeners(); // Basic event listeners
  fetchAndRenderHitlists();
  // initializeDateInputs(); // Date inputs initialized specifically when the modal opens
});

function setupSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (!sidebar || !mainContent) {
    console.error("Sidebar or main content not found");
    return;
  }

  const isSidebarCollapsed =
    localStorage.getItem("sidebarCollapsed") === "true";

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
  // Hitlist modal events (these elements should be in the initial DOM)
  document
    .getElementById("createHitlistBtn")
    .addEventListener("click", openCreateHitlistModal);
  document
    .getElementById("closeHitlistModal")
    .addEventListener("click", closeHitlistModal);
  document
    .getElementById("cancelHitlistBtn")
    .addEventListener("click", closeHitlistModal);
  document
    .getElementById("hitlistForm")
    .addEventListener("submit", handleHitlistSubmit);

  // Business List modal close (this element should be in the initial DOM)
  document
    .getElementById("closeBusinessListModal")
    .addEventListener("click", closeBusinessListModal);

  // Add Business button (this element should be in the initial DOM)
  document
    .getElementById("addBusinessBtn")
    .addEventListener("click", openAddBusinessModal);

  // Search and filter events (these elements should be in the initial DOM)
  document
    .getElementById("searchInput")
    .addEventListener("input", filterHitlists);
  document
    .getElementById("businessSearchInput")
    .addEventListener("input", filterBusinesses);
  document
    .getElementById("statusFilter")
    .addEventListener("change", filterBusinesses);

  // Close button for view business modal (this element should be in the initial DOM)
  const closeBusinessViewModalButton = document.getElementById(
    "closeBusinessViewModal"
  );
  if (closeBusinessViewModalButton) {
    closeBusinessViewModalButton.addEventListener("click", function () {
      document.getElementById("businessViewModal").style.display = "none";
    });
  }

  // Setup textarea auto-resize for hitlist descriptions
  setupHitlistFormTextareas();
}

function setupHitlistFormTextareas() {
  const descriptionTextarea = document.getElementById("hitlistDescription");
  if (descriptionTextarea) {
    // Set initial height
    descriptionTextarea.style.height = "auto";
    descriptionTextarea.style.height = descriptionTextarea.scrollHeight + "px";

    // Add event listener for input changes
    descriptionTextarea.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }
}

async function fetchAndRenderHitlists() {
  try {
    const hitlistsList = document.getElementById("hitlistsList");
    hitlistsList.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading hitlists...</div>';

    allHitlists = await API.fetchHitlists();

    // Initialize pagination with all hitlists
    const paginationInfo = Pagination.initPagination(
      allHitlists,
      hitlistCurrentPage,
      hitlistPageSize
    );

    // Update current page and total pages based on pagination info
    hitlistCurrentPage = paginationInfo.currentPage;
    hitlistTotalPages = paginationInfo.totalPages;

    // Get only the hitlists for the current page
    const paginatedHitlists = Pagination.getPaginatedItems(
      allHitlists,
      hitlistCurrentPage,
      hitlistPageSize
    );

    renderHitlists(paginatedHitlists);

    // Add pagination UI for hitlists
    Pagination.renderPagination({
      totalItems: allHitlists.length,
      totalPages: hitlistTotalPages,
      currentPage: hitlistCurrentPage,
      pageSize: hitlistPageSize,
      onPageChange: (newPage) => {
        hitlistCurrentPage = newPage;
        renderPaginatedHitlists();
      },
      onPageSizeChange: (newPageSize) => {
        hitlistPageSize = newPageSize;
        localStorage.setItem("hitlistPageSize", newPageSize);
        hitlistCurrentPage = 1; // Reset to first page when changing page size
        renderPaginatedHitlists();
      },
      // containerId: ".hitlists-container",
      containerId: ".hitlists-container",
    });
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
        <h3>No hitlists found</h3>
        <p>Try again or press the "Create Hitlist" button to get started</p>
      </div>
    `;
    return;
  }

  hitlistsList.innerHTML = hitlists
    .map(
      (hitlist) => `
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
      <p class="hitlist-description">${
        hitlist.description || "No description"
      }</p>
      <div class="hitlist-stats">
        <span class="hitlist-stat">
          <i class="fas fa-building"></i>
          ${hitlist.businesses ? hitlist.businesses.length : 0} businesses
        </span>
        <span class="hitlist-stat">
          <i class="fas fa-clock"></i>
          ${
            hitlist.lastModified
              ? Utils.formatDate(
                  hitlist.lastModified,
                  window.dateFormat || "MM/DD/YYYY"
                )
              : "N/A"
          }
        </span>
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners to cards
  const hitlistCards = document.querySelectorAll(".hitlist-card");
  hitlistCards.forEach((card) => {
    // Open business list when card is clicked
    card.addEventListener("click", function (e) {
      if (!e.target.closest(".hitlist-actions")) {
        openBusinessListModal(this.dataset.id);
      }
    });

    // Edit hitlist button
    card.querySelector(".edit-hitlist").addEventListener("click", function (e) {
      e.stopPropagation(); // Correctly stop propagation on the event object
      openEditHitlistModal(card.dataset.id);
    });

    // Delete hitlist button
    card
      .querySelector(".delete-hitlist")
      .addEventListener("click", function (e) {
        e.stopPropagation(); // Correctly stop propagation on the event object
        deleteHitlist(card.dataset.id);
      });
  });
}

function renderPaginatedHitlists() {
  // Get paginated hitlists for the current page
  const paginatedHitlists = Pagination.getPaginatedItems(
    allHitlists,
    hitlistCurrentPage,
    hitlistPageSize
  );

  // Render the hitlists
  renderHitlists(paginatedHitlists);

  Pagination.renderPagination({
    totalItems: allHitlists.length,
    totalPages: hitlistTotalPages,
    currentPage: hitlistCurrentPage,
    pageSize: hitlistPageSize,
    onPageChange: (newPage) => {
      hitlistCurrentPage = newPage;
      renderPaginatedHitlists();
    },
    onPageSizeChange: (newPageSize) => {
      hitlistPageSize = newPageSize;
      localStorage.setItem("hitlistPageSize", newPageSize);
      hitlistCurrentPage = 1;
      renderPaginatedHitlists();
    },
    containerId: ".hitlists-container", // Make sure this is correct
  });
}

function openCreateHitlistModal() {
  document.getElementById("hitlistModalTitle").textContent =
    "Create New Hitlist";
  document.getElementById("hitlistId").value = ""; // Clear hidden ID for new hitlist
  document.getElementById("hitlistForm").reset();
  document.getElementById("hitlistModal").style.display = "block";
}

function openEditHitlistModal(hitlistId) {
  const hitlist = allHitlists.find((h) => h._id === hitlistId);
  if (!hitlist) return;

  document.getElementById("hitlistModalTitle").textContent = "Edit Hitlist";
  document.getElementById("hitlistId").value = hitlist._id; // Set hidden ID for editing
  document.getElementById("hitlistName").value = hitlist.name;

  // Set the description and ensure the textarea properly shows its content
  const descriptionTextarea = document.getElementById("hitlistDescription");
  descriptionTextarea.value = hitlist.description || "";

  // Apply auto-resize to textarea
  setTimeout(() => {
    descriptionTextarea.style.height = "auto";
    descriptionTextarea.style.height = descriptionTextarea.scrollHeight + "px";
  }, 0);

  document.getElementById("hitlistModal").style.display = "block";
}

function closeHitlistModal() {
  document.getElementById("hitlistModal").style.display = "none";
}

async function handleHitlistSubmit(event) {
  event.preventDefault();

  const hitlistId = document.getElementById("hitlistId").value; // Check if hitlistId exists (editing)
  const hitlistData = {
    name: document.getElementById("hitlistName").value.trim(),
    description: document.getElementById("hitlistDescription").value,
  };

  try {
    if (hitlistId) {
      // Edit existing hitlist
      await API.updateHitlist(hitlistId, hitlistData);
      Utils.showToast("Hitlist updated successfully");
    } else {
      // Create NEW hitlist
      await API.createHitlist(hitlistData); // This is the correct API call for creating a hitlist
      Utils.showToast("Hitlist created successfully");
    }

    closeHitlistModal(); // Close the Hitlist Modal
    fetchAndRenderHitlists(); // Refresh the list of hitlists
  } catch (error) {
    console.error("Error saving hitlist:", error); // Correct error logging
    Utils.showToast("Error saving hitlist"); // Correct toast message
  }
}

async function openBusinessListModal(hitlistId) {
  currentHitlistId = hitlistId;
  const hitlist = allHitlists.find((h) => h._id === hitlistId);

  if (!hitlist) return;

  document.getElementById("businessListTitle").textContent =
    hitlist.name + " - Businesses";
  document.getElementById("businessListModal").style.display = "block";

  // Show loading indicator
  const businessesList = document.getElementById("businessesList");
  businessesList.innerHTML =
    '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading businesses...</div>';

  try {
    const businesses = await API.fetchBusinessesByHitlist(hitlistId);
    renderBusinesses(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    businessesList.innerHTML =
      '<div class="error-state">Error loading businesses. Please try again.</div>';
  }
}

function closeBusinessListModal() {
  document.getElementById("businessListModal").style.display = "none";
  currentHitlistId = null;
}

function attachBusinessActionListeners(businesses) {
  const businessesList = document.getElementById("businessesList");

  // View business button
  businessesList.querySelectorAll(".view-business").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Correctly stop propagation on the event object
      const businessId = this.closest(".business-item").dataset.id;
      const business = businesses.find((b) => b._id === businessId);
      openViewBusinessModal(business);
    });
  });

  // Convert to lead button
  businessesList.querySelectorAll(".convert-to-lead").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Correctly stop propagation on the event object
      const businessId = this.closest(".business-item").dataset.id;
      const business = businesses.find((b) => b._id === businessId);
      convertBusinessToLead(business);
    });
  });

  // Edit business button
  businessesList.querySelectorAll(".edit-business").forEach((button) => {
    // Removed incorrect button.stopPropagation()
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Correctly stop propagation on the event object
      const businessId = this.closest(".business-item").dataset.id;
      const business = businesses.find((b) => b._id === businessId);
      openEditBusinessModal(business);
    });
  });

  // Delete business button
  businessesList.querySelectorAll(".delete-business").forEach((button) => {
    // Removed incorrect button.stopPropagation()
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Correctly stop propagation on the event object
      const businessId = this.closest(".business-item").dataset.id;
      deleteBusiness(businessId);
    });
  });
}

function openAddBusinessModal() {
  // Ensure the modal exists before trying to access its elements
  const modal = document.getElementById("businessModal");
  if (!modal) {
    console.error("Business modal not found");
    return;
  }

  // Reset the form
  const form = document.getElementById("businessForm");
  if (form) {
    form.reset();
  }

  // Clear hidden inputs
  document.getElementById("businessId").value = ""; // Clear business ID for new business
  document.getElementById("currentHitlistId").value = currentHitlistId || ""; // Set hitlist ID

  // Reset and hide date display for new business
  const lastContactedInput = document.getElementById("lastContactedDate");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");
  if (lastContactedInput) lastContactedInput.value = "";
  if (lastContactedDisplay) lastContactedDisplay.textContent = "";

  // Hide website URL group by default (based on initial select value or default)
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  const websiteUrlGroup = document.getElementById("websiteUrlGroup");
  if (hasWebsiteSelect && websiteUrlGroup) {
    websiteUrlGroup.style.display =
      hasWebsiteSelect.value === "true" ? "block" : "none";
  } else if (websiteUrlGroup) {
    // If select not found but group is, hide it just in case
    websiteUrlGroup.style.display = "none";
  }

  // Set up listeners specific to the business modal if they haven't been already
  setupBusinessModalListeners();

  // Show the modal
  modal.style.display = "block";
}

function openEditBusinessModal(business) {
  if (!business) {
    console.error("No business data provided");
    return;
  }

  // Ensure the modal exists before trying to access its elements
  const modal = document.getElementById("businessModal");
  if (!modal) {
    console.error("Business modal not found");
    return;
  }

  // Split contact name if exists
  const nameParts = (business.contactName || "").split(" ");

  // Set form fields
  document.getElementById("businessId").value = business._id; // Set business ID for editing
  document.getElementById("currentHitlistId").value = business.hitlistId; // Set hitlist ID
  document.getElementById("businessName").value = business.businessName || "";
  document.getElementById("typeOfBusiness").value =
    business.typeOfBusiness || "";
  document.getElementById("contactFirstName").value = nameParts[0] || "";
  document.getElementById("contactLastName").value =
    nameParts.slice(1).join(" ") || "";
  document.getElementById("businessPhone").value = business.businessPhone || "";
  document.getElementById("businessEmail").value = business.businessEmail || "";
  document.getElementById("websiteUrl").value = business.websiteUrl || "";
  document.getElementById("status").value = business.status || "not-contacted";
  document.getElementById("priority").value = business.priority || "medium";
  document.getElementById("notes").value = business.notes || "";

  // Set last contacted date
  const lastContactedInput = document.getElementById("lastContactedDate");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");

  if (business.lastContactedDate) {
    const fetchedDate = new Date(business.lastContactedDate);
    // Check if the fetched date is a valid Date object
    if (fetchedDate && !isNaN(fetchedDate.getTime())) {
      // Treat the fetched date (could be UTC or local from backend) and create a local date object at noon for display and input
      // Using UTC components from the fetched date helps if the backend stored UTC
      const localDateForDisplay = new Date(
        fetchedDate.getUTCFullYear(),
        fetchedDate.getUTCMonth(),
        fetchedDate.getUTCDate(),
        12,
        0,
        0
      );

      const year = localDateForDisplay.getFullYear();
      const month = (localDateForDisplay.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const day = localDateForDisplay.getDate().toString().padStart(2, "0");

      lastContactedInput.value = `${year}-${month}-${day}`; // Set the input value correctly (YYYY-MM-DD)
      lastContactedDisplay.textContent = Utils.formatDate(
        localDateForDisplay,
        window.dateFormat || "MM/DD/YYYY"
      ); // Format the local date for display
    } else {
      console.error(
        "Invalid lastContactedDate received for business (editing):",
        business._id,
        business.lastContactedDate
      );
      lastContactedInput.value = "";
      lastContactedDisplay.textContent = "";
    }
  } else {
    // Handle no date - clear inputs/displays
    lastContactedInput.value = "";
    lastContactedDisplay.textContent = "";
  }

  // Show/hide website URL field based on loaded value
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  const websiteUrlGroup = document.getElementById("websiteUrlGroup");
  if (hasWebsiteSelect && websiteUrlGroup) {
    websiteUrlGroup.style.display = business.hasWebsite ? "block" : "none";
  }

  // Set up listeners specific to the business modal if they haven't been already
  setupBusinessModalListeners();

  // Show the modal
  modal.style.display = "block";
}

function closeBusinessModal() {
  document.getElementById("businessModal").style.display = "none";
  // Optional: Reset business form or content here if needed
  document.getElementById("businessForm").reset();
  document.getElementById("businessId").value = ""; // Clear business ID
  document.getElementById("currentHitlistId").value = ""; // Clear hitlist ID
}

async function deleteBusiness(businessId) {
  if (!confirm("Are you sure you want to delete this business?")) {
    return;
  }

  try {
    // Get the hitlist ID from the current context
    const hitlistId = currentHitlistId;

    // Delete the business
    await API.deleteBusiness(businessId);
    Utils.showToast("Business deleted successfully");

    // Update the hitlist card to show the updated business count
    if (hitlistId) {
      decrementHitlistBusinessCount(hitlistId);
    }

    // Refresh business list
    openBusinessListModal(hitlistId);
  } catch (error) {
    console.error("Error deleting business:", error);
    Utils.showToast("Error deleting business");
  }
}

function decrementHitlistBusinessCount(hitlistId) {
  try {
    // Find the hitlist card for this hitlist
    const hitlistCard = document.querySelector(
      `.hitlist-card[data-id="${hitlistId}"]`
    );
    if (!hitlistCard) return;

    // Find the business stat element
    const businessStat = hitlistCard.querySelector(".hitlist-stat:first-child");
    if (!businessStat) return;

    // Find the hitlist in our data
    const hitlist = allHitlists.find((h) => h._id === hitlistId);
    if (!hitlist || !hitlist.businesses || hitlist.businesses.length === 0)
      return;

    // Decrement the business count
    hitlist.businesses.pop(); // Remove one business

    // Update the UI
    businessStat.innerHTML = `<i class="fas fa-building"></i> ${hitlist.businesses.length} businesses`;
  } catch (error) {
    console.error("Error updating hitlist business count:", error);
  }
}

async function deleteHitlist(hitlistId) {
  if (
    !confirm(
      "Are you sure you want to delete this hitlist? All businesses in this hitlist will also be deleted."
    )
  ) {
    return;
  }

  try {
    // Delete the hitlist
    await API.deleteHitlist(hitlistId);

    // Remove the hitlist from the allHitlists array
    allHitlists = allHitlists.filter((h) => h._id !== hitlistId);

    // Update UI
    Utils.showToast("Hitlist deleted successfully");

    // Re-render hitlists
    renderHitlists(allHitlists);
  } catch (error) {
    console.error("Error deleting hitlist:", error);
    Utils.showToast("Error deleting hitlist");
  }
}

async function convertBusinessToLead(business) {
  try {
    // Prepare lead data from business information
    const nameParts = (business.contactName || "").split(" ");

    let lastContactedAt = null;
    if (business.lastContactedDate) {
      const dateStr = new Date(business.lastContactedDate)
        .toISOString()
        .split("T")[0];
      const [year, month, day] = dateStr.split("-").map(Number);

      lastContactedAt = new Date(year, month - 1, day, 12, 0, 0);
    }

    const leadData = {
      firstName: nameParts[0] || "Not specified",
      lastName: nameParts.slice(1).join(" ") || "Not specified",
      email: business.businessEmail || "example@email.com",
      phone: business.businessPhone || "",
      businessName: business.businessName,
      businessPhone: business.businessPhone || "",
      businessEmail: business.businessEmail || "",
      businessServices: business.typeOfBusiness || "",
      websiteAddress: business.websiteUrl || "",
      serviceDesired: "Web Development", // Default service
      status: mapBusinessStatusToLeadStatus(business.status),
      notes: business.notes || "",
      lastContactedAt: lastContactedAt,
      source: `Converted from Hitlist: ${
        business.hitlistId || currentHitlistId
      }`,
      message: `Converted from business hitlist`,
    };

    // Basic validation
    if (!leadData.businessName) {
      Utils.showToast("Business Name is required for conversion.");
      return;
    }
    if (leadData.email === "Not specified" && !leadData.phone) {
      Utils.showToast("Either Email or Phone is required for conversion.");
      return;
    }

    // Create the lead
    const createdLead = await API.createLead(leadData);

    // Update business status to converted
    if (business.status !== "converted") {
      await API.updateBusiness(business._id, { status: "converted" });
    }

    // Show success message
    Utils.showToast(
      `Business "${business.businessName}" successfully converted to lead!`
    );

    // Refresh the business list in the modal
    const hitlistId = business.hitlistId || currentHitlistId;
    if (hitlistId) {
      setTimeout(() => {
        openBusinessListModal(hitlistId);
      }, 300);
    }
  } catch (error) {
    console.error("Error converting business to lead:", error);
    Utils.showToast(`Error converting business to lead: ${error.message}`);
  }
}

function mapBusinessStatusToLeadStatus(businessStatus) {
  // Map business status to lead status
  switch (businessStatus) {
    case "not-contacted":
      return "new";
    case "contacted":
    case "follow-up":
      return "contacted";
    case "not-interested":
      return "closed-lost";
    case "converted":
      // This mapping is only used if the business status is *already* converted,
      // but the convert button is disabled in that case.
      // If somehow triggered for an already converted business, mapping to 'contacted' or 'new'
      // is more appropriate for the initial lead status than 'closed-won'.
      return "contacted"; // Or 'new'
    default:
      return "new";
  }
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function filterHitlists() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredHitlists = allHitlists.filter(
    (hitlist) =>
      hitlist.name.toLowerCase().includes(searchTerm) ||
      (hitlist.description &&
        hitlist.description.toLowerCase().includes(searchTerm))
  );
  renderHitlists(filteredHitlists);
}

function filterBusinesses() {
  const searchTerm = document
    .getElementById("businessSearchInput")
    .value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  // Filter based on the currently loaded businesses
  renderBusinesses(
    currentBusinesses.filter((business) => {
      const matchesSearch =
        business.businessName.toLowerCase().includes(searchTerm) ||
        (business.contactName &&
          business.contactName.toLowerCase().includes(searchTerm)) ||
        (business.businessEmail &&
          business.businessEmail.toLowerCase().includes(searchTerm)) ||
        (business.businessPhone &&
          business.businessPhone.toLowerCase().includes(searchTerm)) ||
        (business.notes && business.notes.toLowerCase().includes(searchTerm)) || // Include notes in search
        (business.typeOfBusiness &&
          business.typeOfBusiness.toLowerCase().includes(searchTerm)); // Include type in search

      const matchesStatus = !statusFilter || business.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
  );
}

function initializePhoneInputs() {
  const businessPhoneInput = document.getElementById("businessPhone");
  if (businessPhoneInput) {
    // Initialize Cleave.js on the businessPhone input
    new Cleave(businessPhoneInput, {
      delimiters: ["-", "-"],
      blocks: [3, 3, 4],
      numericOnly: true,
    });
  }
}

function setupBusinessModalListeners() {
  // Set up business form submit listener
  const businessForm = document.getElementById("businessForm");
  if (businessForm && !businessForm.dataset.listenerAttached) {
    // Check if listener already attached
    businessForm.addEventListener("submit", handleBusinessSubmit);
    businessForm.dataset.listenerAttached = "true"; // Mark as attached
  }

  // Set up website checkbox toggle listener
  const hasWebsiteSelect = document.getElementById("hasWebsite");
  const websiteUrlGroup = document.getElementById("websiteUrlGroup");

  // Only set up the listener if both elements exist and listener isn't already attached
  if (
    hasWebsiteSelect &&
    websiteUrlGroup &&
    !hasWebsiteSelect.dataset.listenerAttached
  ) {
    hasWebsiteSelect.addEventListener("change", function () {
      // websiteUrlGroup is guaranteed to exist if this listener is attached here
      websiteUrlGroup.style.display = this.value === "true" ? "block" : "none";
    });
    hasWebsiteSelect.dataset.listenerAttached = "true"; // Mark as attached
    // Trigger the change once on setup to set initial state based on current value
    hasWebsiteSelect.dispatchEvent(new Event("change"));
  }

  // Initialize date inputs and display for the modal
  initializeDateInputs();

  // Initialize phone inputs with Cleave.js
  initializePhoneInputs();

  // Close button for the Business Modal (ensure it's tied here if modal is dynamic)
  const closeBusinessModalButton =
    document.getElementById("closeBusinessModal");
  const cancelBusinessButton = document.getElementById("cancelBusinessBtn");

  if (
    closeBusinessModalButton &&
    !closeBusinessModalButton.dataset.listenerAttached
  ) {
    closeBusinessModalButton.addEventListener("click", closeBusinessModal);
    closeBusinessModalButton.dataset.listenerAttached = "true";
  }
  if (cancelBusinessButton && !cancelBusinessButton.dataset.listenerAttached) {
    cancelBusinessButton.addEventListener("click", closeBusinessModal);
    cancelBusinessButton.dataset.listenerAttached = "true";
  }
}

// Helper function to format phone numbers if needed
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";

  // Remove all non-digit characters
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");

  // Check if we have at least 10 digits
  if (cleaned.length >= 10) {
    // Format the first 10 digits as 000-000-0000
    return (
      cleaned.substring(0, 3) +
      "-" +
      cleaned.substring(3, 6) +
      "-" +
      cleaned.substring(6, 10)
    );
  }

  // Return original if we couldn't format it
  return phoneNumber;
}

async function handleBusinessSubmit(event) {
  event.preventDefault();

  const businessId = document.getElementById("businessId").value;
  const hitlistId = document.getElementById("currentHitlistId").value;

  if (!hitlistId) {
    console.error("Cannot save business: No hitlist ID found.");
    Utils.showToast("Error saving business: No hitlist selected.");
    return;
  }

  // Combine first and last name for contact name
  const contactFirstName = document.getElementById("contactFirstName").value;
  const contactLastName = document.getElementById("contactLastName").value;
  const contactName =
    contactFirstName || contactLastName
      ? `${contactFirstName} ${contactLastName}`.trim()
      : "";

  // Ensure phone number is formatted correctly
  let businessPhone = document.getElementById("businessPhone").value.trim();
  businessPhone = formatPhoneNumber(businessPhone);

  const businessData = {
    businessName: document.getElementById("businessName").value,
    typeOfBusiness: document.getElementById("typeOfBusiness").value,
    contactName: contactName,
    businessPhone: businessPhone,
    businessEmail: document.getElementById("businessEmail").value || "",
    websiteUrl: document.getElementById("websiteUrl").value.trim(),
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    notes: document.getElementById("notes").value,
    hitlistId: hitlistId,
  };

  // Handle date
  const lastContactedDateValue =
    document.getElementById("lastContactedDate").value;
  businessData.lastContactedDate = lastContactedDateValue || null;

  try {
    let savedBusiness;

    if (businessId) {
      savedBusiness = await API.updateBusiness(businessId, businessData);
      Utils.showToast("Business updated successfully");
    } else {
      savedBusiness = await API.createBusiness(hitlistId, businessData);
      Utils.showToast("Business added successfully");

      // Update the hitlist card to show the updated business count
      updateHitlistBusinessCount(hitlistId);
    }

    closeBusinessModal();
    openBusinessListModal(hitlistId);
  } catch (error) {
    console.error("Error saving business:", error);
    Utils.showToast("Error saving business");
  }
}

async function updateHitlistBusinessCount(hitlistId) {
  try {
    // Find the hitlist card for this hitlist
    const hitlistCard = document.querySelector(
      `.hitlist-card[data-id="${hitlistId}"]`
    );
    if (!hitlistCard) return;

    // Find the business stat element
    const businessStat = hitlistCard.querySelector(".hitlist-stat:first-child");
    if (!businessStat) return;

    // Fetch the current hitlist
    const hitlist = allHitlists.find((h) => h._id === hitlistId);
    if (!hitlist) return;

    // If businesses array doesn't exist, create it
    if (!hitlist.businesses) {
      hitlist.businesses = [];
    }

    // Increment the business count in our local data
    hitlist.businesses.push({ _id: "temp-" + Date.now() }); // Add a temporary business

    // Update the UI
    businessStat.innerHTML = `<i class="fas fa-building"></i> ${hitlist.businesses.length} businesses`;
  } catch (error) {
    console.error("Error updating hitlist business count:", error);
  }
}

// Update renderBusinesses to format phone numbers in the business list
function renderBusinesses(businesses) {
  currentBusinesses = businesses; // Store for later use
  const businessesList = document.getElementById("businessesList");

  if (!businessesList) {
    console.error("Businesses list container not found");
    return;
  }

  if (!businesses || businesses.length === 0) {
    businessesList.innerHTML =
      '<div class="no-businesses-message">No businesses added yet.</div>';
    return;
  }

  businessesList.innerHTML = businesses
    .map((business) => {
      // Format phone number for display if needed
      let displayPhone = business.businessPhone || "";
      if (displayPhone && !displayPhone.includes("-")) {
        displayPhone = formatPhoneNumber(displayPhone);
      }

      return `
  <div class="business-item ${
    business.status === "converted" ? "converted" : ""
  }" data-id="${business._id}">
    <div class="business-info">
      <div class="business-header">
        <span class="business-title">${business.businessName}</span>
        <span class="status-badge status-${business.status}">${formatStatus(
        business.status
      )}</span>
        <span class="priority-badge priority-${business.priority}">${
        business.priority
      }</span>
      </div>
      <div class="business-details">
        ${
          business.contactName
            ? `<div class="business-detail"><i class="fas fa-user"></i> ${business.contactName}</div>`
            : ""
        }
        ${
          displayPhone
            ? `<div class="business-detail"><i class="fas fa-phone"></i> ${displayPhone}</div>`
            : ""
        }
        ${
          business.businessEmail
            ? `<div class="business-detail"><i class="fas fa-envelope"></i> ${business.businessEmail}</div>`
            : ""
        }
        ${
          business.websiteUrl
            ? `<div class="business-detail"><i class="fas fa-globe"></i> <a href="${business.websiteUrl}" target="_blank">Website</a></div>`
            : ""
        }
        ${
          business.lastContactedDate
            ? `
          <div class="business-detail"><i class="fas fas fa-clock"></i> Last contact: ${(() => {
            const fetchedDate = new Date(business.lastContactedDate);
            // Check if fetchedDate is a valid Date object
            if (fetchedDate && !isNaN(fetchedDate.getTime())) {
              // **Using UTC components to create local date at noon, consistent with working edit modal**
              const localDateForDisplay = new Date(
                fetchedDate.getUTCFullYear(),
                fetchedDate.getUTCMonth(),
                fetchedDate.getUTCDate(),
                12,
                0,
                0
              );
              return Utils.formatDate(
                localDateForDisplay,
                window.dateFormat || "MM/DD/YYYY"
              );
            } else {
              console.error(
                "Invalid lastContactedDate for business ID",
                business._id,
                ":",
                business.lastContactedDate
              );
              return "N/A"; // Display N/A or similar for invalid dates
            }
          })()}</div>
        `
            : ""
        }
      </div>
    </div>
    <div class="business-actions">
      <button class="btn-icon view-business" title="View Business Details">
        <i class="fas fa-eye"></i>
      </button>
      ${
        business.status !== "converted"
          ? `<button class="btn-icon convert-to-lead" title="Convert to Lead">
          <i class="fas fa-user-plus"></i>
        </button>`
          : `<button class="btn-icon" disabled title="Already Converted" style="cursor: not-allowed; opacity: 0.5;">
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
`;
    })
    .join("");

  // Add event listeners after rendering
  attachBusinessActionListeners(businesses);
}

// Update openViewBusinessModal to format the phone number in the view details
function openViewBusinessModal(business) {
  document.getElementById("viewBusinessName").textContent =
    business.businessName || "N/A";
  document.getElementById("viewTypeOfBusiness").textContent =
    business.typeOfBusiness || "N/A";

  // Split contact name
  const nameParts = (business.contactName || "").split(" ");
  document.getElementById("viewContactFirstName").textContent =
    nameParts[0] || "N/A";
  document.getElementById("viewContactLastName").textContent =
    nameParts.slice(1).join(" ") || "N/A";

  // Format phone number for view modal
  let displayPhone = business.businessPhone || "N/A";
  if (displayPhone !== "N/A" && !displayPhone.includes("-")) {
    displayPhone = formatPhoneNumber(displayPhone);
  }
  document.getElementById("viewBusinessPhone").textContent = displayPhone;

  document.getElementById("viewBusinessEmail").textContent =
    business.businessEmail || "N/A";

  // Corrected websiteUrl link creation for display
  const websiteLinkHtml = business.websiteUrl
    ? (() => {
        let displayUrl = business.websiteUrl;
        if (
          !displayUrl.startsWith("http://") &&
          !displayUrl.startsWith("https://")
        ) {
          displayUrl = `https://${displayUrl}`;
        }
        try {
          const url = new URL(displayUrl);
          return `<a href="${url.href}" target="_blank">${url.hostname}</a>`; // Link text is just the hostname
        } catch (e) {
          console.error("Invalid URL for display:", business.websiteUrl);
          return business.websiteUrl; // Fallback to just showing the text if invalid
        }
      })()
    : "N/A";

  document.getElementById("viewWebsiteUrl").innerHTML = websiteLinkHtml;

  document.getElementById("viewStatus").textContent = formatStatus(
    business.status
  );
  document.getElementById("viewPriority").textContent = business.priority;

  // Last contacted date
  // Attempt to create a Date object from the fetched value for formatting
  const lastContactedDisplayDate = business.lastContactedDate
    ? new Date(business.lastContactedDate)
    : null;
  const dateFormat = window.dateFormat || "MM/DD/YYYY";
  let formattedLastContacted = "N/A";

  if (lastContactedDisplayDate && !isNaN(lastContactedDisplayDate.getTime())) {
    // **Using UTC components to create local date at noon, consistent with working edit modal and list card**
    const localDateForDisplay = new Date(
      lastContactedDisplayDate.getUTCFullYear(),
      lastContactedDisplayDate.getUTCMonth(),
      lastContactedDisplayDate.getUTCDate(),
      12,
      0,
      0
    );
    formattedLastContacted = Utils.formatDate(localDateForDisplay, dateFormat);
  } else if (business.lastContactedDate) {
    console.error(
      "Invalid lastContactedDate received for business (viewing):",
      business._id,
      business.lastContactedDate
    );
    // formattedLastContacted remains 'N/A'
  }

  document.getElementById("viewLastContactedDate").textContent =
    formattedLastContacted;

  document.getElementById("viewNotes").textContent = business.notes || "N/A";

  // Show the view modal
  document.getElementById("businessViewModal").style.display = "block";
}

// Function to initialize date inputs and their display handlers within a specific modal
function initializeDateInputs() {
  // Handle date input changes
  const lastContactedInput = document.getElementById("lastContactedDate");
  const lastContactedDisplay = document.getElementById("lastContactedDisplay");

  // Ensure elements exist before adding listeners
  if (
    lastContactedInput &&
    lastContactedDisplay &&
    !lastContactedInput.dataset.listenerAttached
  ) {
    lastContactedInput.addEventListener("change", function () {
      if (this.value) {
        const [year, month, day] = this.value.split("-").map(Number);
        // Create a local date object at noon from the input value components
        // This avoids timezone issues when formatting the display text
        const date = new Date(year, month - 1, day, 12, 0, 0);

        // Check if the date object is valid
        if (date && !isNaN(date.getTime())) {
          const displayElement = document.getElementById(
            "lastContactedDisplay"
          );
          if (displayElement) {
            // Format using the local date object created
            displayElement.textContent = Utils.formatDate(
              date,
              window.dateFormat || "MM/DD/YYYY"
            );
          }
        } else {
          // Handle invalid date input value if necessary (shouldn't happen with type="date")
          console.error("Invalid date input value:", this.value);
          lastContactedDisplay.textContent = "";
        }
      } else {
        lastContactedDisplay.textContent = "";
      }
    });
    lastContactedInput.dataset.listenerAttached = "true"; // Mark as attached
  }
}

export {
  setupSidebarToggle,
  setupEventListeners,
  fetchAndRenderHitlists,
  renderHitlists,
  openBusinessListModal,
  openAddBusinessModal,
  convertBusinessToLead,
  openEditBusinessModal,
  openViewBusinessModal,
};
