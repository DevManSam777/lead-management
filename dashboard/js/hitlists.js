import * as API from "./api.js";
import * as Utils from "./utils.js";
import * as Pagination from "./pagination.js";

let allHitlists = [];
let currentHitlistId = null;
let currentBusinesses = []; // Store businesses globally
let originalBusinesses = []; // global variable to store unfiltered businesses

// Pagination state for hitlists defaults
let hitlistCurrentPage = 1;
let hitlistPageSize = 12; // Show 12 hitlists per page
let hitlistTotalPages = 1;

document.addEventListener("DOMContentLoaded", async function () {
  // Initialize settings first before doing anything else
  await initializeSettings();

  // Now proceed with the rest of the initialization
  setupSidebarToggle();
  setupEventListeners();
  fetchAndRenderHitlists();
  setupJsonUploader();

  // Add the settings update event listener
  window.addEventListener("settingsUpdated", function (event) {
    const { key, value } = event.detail;

    if (key === "dateFormat") {
      console.log("Date format updated to:", value);
      window.dateFormat = value;

      // Refresh hitlists and businesses to update date displays
      if (allHitlists && allHitlists.length > 0) {
        renderPaginatedHitlists();
      }

      // Refresh businesses if the business list modal is open
      if (
        currentHitlistId &&
        currentBusinesses &&
        currentBusinesses.length > 0
      ) {
        renderBusinesses(currentBusinesses);
      }

      // Re-initialize any open date inputs
      initializeDateInputs();
    }
  });
});

async function initializeSettings() {
  try {
    console.log("Initializing settings for hitlist page...");

    // Fetch settings from the server using the existing API function
    const settings = await API.fetchAllSettings();

    // Set the date format globally
    window.dateFormat = settings.dateFormat || "MM/DD/YYYY";

    console.log("Date format initialized:", window.dateFormat);

    return settings;
  } catch (error) {
    console.error("Error initializing settings:", error);

    // Use fallback format from localStorage if API fails
    window.dateFormat = localStorage.getItem("dateFormat") || "MM/DD/YYYY";
    console.log("Using fallback date format:", window.dateFormat);

    return {
      dateFormat: window.dateFormat,
    };
  }
}

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
    const hitlistsLoadingSpinner = document.getElementById(
      "hitlistsLoadingSpinner"
    );
    const hitlistsList = document.getElementById("hitlistsList");

    // Show loading spinner
    if (hitlistsLoadingSpinner) hitlistsLoadingSpinner.style.display = "flex";
    if (hitlistsList) hitlistsList.innerHTML = "";

    allHitlists = await API.fetchHitlists();

    allHitlists = sortHitlistsAlphabetically(allHitlists);

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

    // Hide loading spinner
    if (hitlistsLoadingSpinner) hitlistsLoadingSpinner.style.display = "none";

    // Render hitlists
    renderHitlists(paginatedHitlists);

    // Add pagination UI
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
      containerId: ".hitlists-container",
    });
  } catch (error) {
    console.error("Error fetching hitlists:", error);

    const hitlistsLoadingSpinner = document.getElementById(
      "hitlistsLoadingSpinner"
    );
    if (hitlistsLoadingSpinner) hitlistsLoadingSpinner.style.display = "none";

    const hitlistsList = document.getElementById("hitlistsList");
    if (hitlistsList) {
      hitlistsList.innerHTML =
        '<div class="error-state">Error loading hitlists. Please try again.</div>';
    }
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

  // Get dateFormat from window object (set in settings)
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  hitlistsList.innerHTML = hitlists
    .map(
      (hitlist) => `
    <div class="hitlist-card" data-id="${hitlist._id}">
      <div class="hitlist-header">
        <h3 class="hitlist-title"><span class="bullseye"><i class="fa-solid fa-bullseye"></i></span> ${
          hitlist.name
        }</h3>
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
          <i class="far fa-building"></i>
          ${hitlist.businesses ? hitlist.businesses.length : 0} businesses
        </span>
        <div class="hitlist-dates">
          <span class="hitlist-stat">
            <i class="far fa-calendar-plus"></i>
            Created: ${
              hitlist.createdAt
                ? Utils.formatDate(new Date(hitlist.createdAt), dateFormat)
                : "N/A"
            }
          </span>
          <span class="hitlist-stat">
            <i class="far fa-clock"></i>
            Modified: ${
              hitlist.lastModified
                ? Utils.formatDate(new Date(hitlist.lastModified), dateFormat)
                : "N/A"
            }
          </span>
        </div>
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
    const sortedBusinesses = sortBusinessesAlphabetically(businesses);
    originalBusinesses = [...sortedBusinesses];
    currentBusinesses = [...sortedBusinesses];

    // Reset filter inputs when opening the modal
    document.getElementById("businessSearchInput").value = "";
    document.getElementById("statusFilter").value = "";

    renderBusinesses(currentBusinesses);
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
  document.getElementById("businessPhoneExt").value =
    business.businessPhoneExt || ""; // Add Extension
  document.getElementById("businessEmail").value = business.businessEmail || "";
  document.getElementById("websiteUrl").value = business.websiteUrl || "";

  // Populate address fields
  const address = business.address || {};
  document.getElementById("businessStreet").value = address.street || "";
  document.getElementById("businessAptUnit").value = address.aptUnit || "";
  document.getElementById("businessCity").value = address.city || "";
  document.getElementById("businessState").value = address.state || "";
  document.getElementById("businessZipCode").value = address.zipCode || "";
  document.getElementById("businessCountry").value = address.country || "USA";

  document.getElementById("status").value = business.status || "not-contacted";
  document.getElementById("priority").value = business.priority || "low";
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

    // Remove the business from both arrays
    originalBusinesses = originalBusinesses.filter((b) => b._id !== businessId);
    currentBusinesses = currentBusinesses.filter((b) => b._id !== businessId);

    // Re-render the list
    renderBusinesses(currentBusinesses);
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

    // Create a new Date object for the current date (set to noon to avoid timezone issues)
    const currentDate = new Date();
    currentDate.setHours(12, 0, 0, 0);

    // Set lastContactedAt to current date
    const lastContactedAt = currentDate;

    const leadData = {
      firstName: nameParts[0] || "@",
      lastName: nameParts.slice(1).join(" ") || business.businessName,
      email: business.businessEmail || "example@email.com",
      phone: business.businessPhone || "",
      phoneExt: business.businessPhoneExt || "",
      businessName: business.businessName,
      businessPhone: business.businessPhone || "",
      businessPhoneExt: business.businessPhoneExt || "",
      businessEmail: business.businessEmail || "",
      businessServices: business.typeOfBusiness || "",
      websiteAddress: business.websiteUrl || "",
      serviceDesired: "Web Development", // Default service
      hasWebsite: business.websiteUrl ? "yes" : "no",
      status: mapBusinessStatusToLeadStatus(business.status),
      notes: business.notes || "",
      lastContactedAt: lastContactedAt, // Set current date as the last contacted date
      source: `Converted from Hitlist: ${
        business.hitlistId || currentHitlistId
      }`,
      message: `Converted from business hitlist`,
      // Add billing address from business address
      billingAddress: business.address
        ? {
            street: business.address.street || "",
            aptUnit: business.address.aptUnit || "",
            city: business.address.city || "",
            state: business.address.state || "",
            zipCode: business.address.zipCode || "",
            country: business.address.country || "",
          }
        : {},
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

    // Update business status to converted and set last contacted date
    const businessUpdateData = {
      status: "converted",
      lastContactedDate: currentDate, // Set the same current date for the business
    };

    await API.updateBusiness(business._id, businessUpdateData);

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
  renderHitlists(sortHitlistsAlphabetically(filteredHitlists));
}

function filterBusinesses() {
  const searchTerm = document
    .getElementById("businessSearchInput")
    .value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  // Always filter from the original list (not from the currently filtered list)
  // This ensures filtering works properly after the first filter is applied
  currentBusinesses = originalBusinesses.filter((business) => {
    const matchesSearch =
      (business.businessName &&
        business.businessName.toLowerCase().includes(searchTerm)) ||
      (business.contactName &&
        business.contactName.toLowerCase().includes(searchTerm)) ||
      (business.businessEmail &&
        business.businessEmail.toLowerCase().includes(searchTerm)) ||
      (business.businessPhone &&
        business.businessPhone.toLowerCase().includes(searchTerm)) ||
      (business.notes && business.notes.toLowerCase().includes(searchTerm)) ||
      (business.typeOfBusiness &&
        business.typeOfBusiness.toLowerCase().includes(searchTerm));

    const matchesStatus = !statusFilter || business.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  currentBusinesses = sortBusinessesAlphabetically(currentBusinesses);
  // Render the filtered list
  renderBusinesses(currentBusinesses);
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

function setupJsonUploader() {
  // Find the business actions container instead of directly next to the Add Business button
  const businessActionsContainer = document.querySelector(
    ".business-actions-container"
  );
  if (!businessActionsContainer) return;

  // Create the Import JSON button with proper styling to match other buttons
  const importJsonBtn = document.createElement("button");
  importJsonBtn.id = "importJsonBtn";
  importJsonBtn.className = "btn btn-primary";
  importJsonBtn.innerHTML = '<i class="fas fa-file-import"></i> Import JSON';

  // Add to the business actions container
  businessActionsContainer.appendChild(importJsonBtn);

  // Create a hidden file input
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "jsonFileInput";
  fileInput.accept = ".json";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  // Add click event to the import button to trigger file input
  importJsonBtn.addEventListener("click", function () {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        // Parse the JSON content
        const jsonData = JSON.parse(e.target.result);

        // Check if it's an array
        if (!Array.isArray(jsonData)) {
          Utils.showToast(
            "Invalid JSON format: File must contain an array of businesses"
          );
          return;
        }

        // Process the businesses from the JSON file
        await processScrapedBusinesses(jsonData);

        // Clear the file input for future use
        fileInput.value = "";
      } catch (error) {
        console.error("Error processing JSON file:", error);
        Utils.showToast("Error processing JSON file: " + error.message);
      }
    };

    reader.readAsText(file);
  });
}

async function processScrapedBusinesses(businesses) {
  // Validate current hitlist
  if (!currentHitlistId) {
    Utils.showToast("Please select a hitlist first");
    return;
  }

  try {
    let successCount = 0;
    let errorCount = 0;
    let processingCount = 0;
    const totalBusinesses = businesses.length;

    // Create upload progress container
    const businessesList = document.getElementById("businessesList");
    if (businessesList) {
      businessesList.innerHTML = `
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Importing businesses...
        </div>
        <div class="upload-progress-container">
          <div class="upload-progress">
            <div class="upload-progress-bar" style="width: 0%"></div>
          </div>
          <div class="upload-status">Processed 0 of ${totalBusinesses} businesses</div>
        </div>`;
    }

    // Process each business in sequence
    for (const scrapedBusiness of businesses) {
      try {
        // Format phone number using the helper function
        let phone = scrapedBusiness.phone || "";
        // Remove all non-digit characters first
        phone = phone.replace(/\D/g, "");
        if (phone && phone.length >= 10) {
          // Format as XXX-XXX-XXXX properly
          phone = formatPhoneNumber(phone);
        }

        // Extract phone extension if it exists
        let phoneExt = "";
        if (scrapedBusiness.phone) {
          const extMatch = scrapedBusiness.phone.match(
            /(?:\s+ext\.?|\s+x)(\s*\d+)$/i
          );
          if (extMatch && extMatch[1]) {
            phoneExt = extMatch[1].trim();
          }
        }

        // Format website URL
        let websiteUrl = scrapedBusiness.website || "";
        if (websiteUrl && !websiteUrl.startsWith("http")) {
          websiteUrl = "https://" + websiteUrl;
        }

        // Map the scraped business to our business model
        const businessData = {
          businessName: scrapedBusiness.businessName || "",
          typeOfBusiness: scrapedBusiness.businessType || "",
          contactName: "", // YellowPages data doesn't typically include contact names
          businessPhone: phone,
          businessPhoneExt: phoneExt || "",
          businessEmail: scrapedBusiness.businessEmail || "",
          websiteUrl: websiteUrl,
          address: {
            street: scrapedBusiness.streetAddress || "",
            aptUnit: "",
            city: scrapedBusiness.city || "",
            state: scrapedBusiness.state || "",
            zipCode: scrapedBusiness.zipCode || "",
            country: "USA",
          },
          status: "not-contacted",
          priority: "low",
          notes: `Imported from JSON on ${new Date().toLocaleDateString()}`,
        };

        // Create the business in the hitlist
        await API.createBusiness(currentHitlistId, businessData);
        successCount++;

        // Update progress
        processingCount++;
        updateImportProgress(
          processingCount,
          totalBusinesses,
          successCount,
          errorCount
        );
      } catch (error) {
        console.error("Error importing business:", error);
        errorCount++;

        // Update progress even on error
        processingCount++;
        updateImportProgress(
          processingCount,
          totalBusinesses,
          successCount,
          errorCount
        );
      }
    }

    // Update the hitlist card on the main view to show the updated business count
    // Pass the actual success count instead of defaulting to 1
    updateHitlistBusinessCount(currentHitlistId, successCount);

    // Reload the businesses
    const updatedBusinesses = await API.fetchBusinessesByHitlist(
      currentHitlistId
    );
    const sortedBusinesses = sortBusinessesAlphabetically(updatedBusinesses);
    originalBusinesses = [...sortedBusinesses];
    currentBusinesses = [...sortedBusinesses];
    renderBusinesses(currentBusinesses);

    // Show success message
    Utils.showToast(
      `Import complete: ${successCount} businesses added, ${errorCount} failed`
    );
  } catch (error) {
    console.error("Error processing businesses:", error);
    Utils.showToast("Error processing businesses: " + error.message);
  }
}

// Helper function to update the import progress bar
function updateImportProgress(current, total, successes, errors) {
  const progressBar = document.querySelector(".upload-progress-bar");
  const statusText = document.querySelector(".upload-status");

  if (progressBar && statusText) {
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = `${percentage}%`;
    statusText.textContent = `Processed ${current} of ${total} businesses (${successes} succeeded, ${errors} failed)`;
  }
}

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

/**
 * Sorts hitlists alphabetically by name
 * @param {Array} hitlists - Array of hitlist objects
 * @returns {Array} - Sorted array of hitlists
 */
function sortHitlistsAlphabetically(hitlists) {
  if (!hitlists || !Array.isArray(hitlists) || hitlists.length === 0) {
    return hitlists;
  }

  return [...hitlists].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Sorts businesses alphabetically by business name
 * @param {Array} businesses - Array of business objects
 * @returns {Array} - Sorted array of businesses
 */
function sortBusinessesAlphabetically(businesses) {
  if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
    return businesses;
  }

  return [...businesses].sort((a, b) => {
    const nameA = (a.businessName || "").toLowerCase();
    const nameB = (b.businessName || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Format website URL to display just the domain
 * @param {string} url - The full website URL
 * @returns {string} - Formatted URL for display
 */
function formatWebsiteUrlForDisplay(url) {
  if (!url) return "";

  try {
    // Add https:// if no protocol specified
    let fullUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      fullUrl = "https://" + url;
    }

    // Parse the URL to get just the hostname
    const urlObject = new URL(fullUrl);
    return urlObject.hostname;
  } catch (e) {
    // If URL parsing fails, just return the original
    console.error("Error parsing URL:", e);
    return url;
  }
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
  const contactFirstName = document
    .getElementById("contactFirstName")
    .value.trim();
  const contactLastName = document
    .getElementById("contactLastName")
    .value.trim();
  const contactName =
    contactFirstName || contactLastName
      ? `${contactFirstName} ${contactLastName}`.trim()
      : "";

  // Get phone number value (Cleave.js handles formatting on input, but get the raw value or formatted)
  let businessPhone = document.getElementById("businessPhone").value.trim();
  // Get phone extension (new field)
  let businessPhoneExt = document
    .getElementById("businessPhoneExt")
    .value.trim();

  let websiteUrl = document.getElementById("websiteUrl").value.trim();
  // Check if the URL already starts with http:// or https://
  if (
    websiteUrl &&
    !websiteUrl.startsWith("http://") &&
    !websiteUrl.startsWith("https://")
  ) {
    // If not, prepend https://
    websiteUrl = "https://" + websiteUrl;
  }

  const businessData = {
    businessName: document.getElementById("businessName").value.trim(),
    typeOfBusiness: document.getElementById("typeOfBusiness").value.trim(),
    contactName: contactName,
    businessPhone: businessPhone,
    businessPhoneExt: businessPhoneExt, // Add the extension field
    businessEmail: document.getElementById("businessEmail").value.trim() || "",
    websiteUrl: websiteUrl,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    notes: document.getElementById("notes").value.trim(),
    hitlistId: hitlistId,
    // Add address fields
    address: {
      street: document.getElementById("businessStreet").value.trim(),
      aptUnit: document.getElementById("businessAptUnit").value.trim(),
      city: document.getElementById("businessCity").value.trim(),
      state: document.getElementById("businessState").value.trim(),
      zipCode: document.getElementById("businessZipCode").value.trim(),
      country: document.getElementById("businessCountry").value.trim(),
    },
  };

  // Handle date - get the value directly from the hidden input
  const lastContactedDateValue =
    document.getElementById("lastContactedDate").value;

  // Convert YYYY-MM-DD to an ISO string or Date object if your API expects that
  let lastContactedISO = null;
  if (lastContactedDateValue) {
    const date = new Date(lastContactedDateValue + "T12:00:00"); // Treat as local noon to avoid timezone issues
    if (date && !isNaN(date.getTime())) {
      lastContactedISO = date.toISOString(); // Convert to ISO string for the API
    } else {
      console.warn(
        "Invalid lastContactedDate value from input:",
        lastContactedDateValue
      );
    }
  }
  businessData.lastContactedDate = lastContactedISO; // Send ISO string or null

  try {
    let savedBusiness;

    if (businessId) {
      // If businessId exists, update the existing business
      savedBusiness = await API.updateBusiness(businessId, businessData);
      Utils.showToast("Business updated successfully");

      // Update in both arrays
      const businessIndex = currentBusinesses.findIndex(
        (b) => b._id === businessId
      );
      if (businessIndex !== -1) {
        currentBusinesses[businessIndex] = savedBusiness;
      }

      const originalIndex = originalBusinesses.findIndex(
        (b) => b._id === businessId
      );
      if (originalIndex !== -1) {
        originalBusinesses[originalIndex] = savedBusiness;
      }
    } else {
      // If no businessId, create a new business
      savedBusiness = await API.createBusiness(hitlistId, businessData);
      Utils.showToast("Business added successfully");

      // Add to both arrays
      currentBusinesses.push(savedBusiness);
      originalBusinesses.push(savedBusiness);

      currentBusinesses = sortBusinessesAlphabetically(currentBusinesses);
      originalBusinesses = sortBusinessesAlphabetically(originalBusinesses);

      // Update the hitlist card on the main view to show the updated business count
      updateHitlistBusinessCount(hitlistId);
    }

    // Close the business modal
    closeBusinessModal();
    // Re-apply current filters
    filterBusinesses();
  } catch (error) {
    console.error("Error saving business:", error);
    Utils.showToast("Error saving business");
  }
}


async function updateHitlistBusinessCount(hitlistId, addedCount = 1) {
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
    if (!hitlist) return;

    // If businesses array doesn't exist, create it
    if (!hitlist.businesses) {
      hitlist.businesses = [];
    }

    // Add the specified number of businesses to our local data
    for (let i = 0; i < addedCount; i++) {
      hitlist.businesses.push({ _id: "temp-" + Date.now() + i }); // Add temporary businesses
    }

    // Update the UI
    businessStat.innerHTML = `<i class="fas fa-building"></i> ${hitlist.businesses.length} businesses`;
  } catch (error) {
    console.error("Error updating hitlist business count:", error);
  }
}

function renderBusinesses(businesses) {
  // Get dateFormat from window object (set in settings)
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  const businessesList = document.getElementById("businessesList");

  if (!businessesList) {
    console.error("Businesses list container not found");
    return;
  }

  if (!businesses || businesses.length === 0) {
    businessesList.innerHTML =
      '<div class="no-businesses-message">No businesses found with current filters. Try adjusting your search criteria.</div>';
    return;
  }

  businessesList.innerHTML = businesses
    .map((business) => {
      // Format phone number for display if needed
      let displayPhone = business.businessPhone || "";
      if (displayPhone && !displayPhone.includes("-")) {
        displayPhone = formatPhoneNumber(displayPhone);
      }

      // Add extension if available
      if (business.businessPhoneExt) {
        displayPhone += ` Ext: ${business.businessPhoneExt}`;
      }

      // Format website URL for display - show just the domain
      let displayWebsite = "";
      let fullWebsiteUrl = "";

      if (business.websiteUrl) {
        // Store the full URL for the href
        fullWebsiteUrl = business.websiteUrl;
        if (
          !fullWebsiteUrl.startsWith("http://") &&
          !fullWebsiteUrl.startsWith("https://")
        ) {
          fullWebsiteUrl = "https://" + fullWebsiteUrl;
        }

        // Create simplified display URL (just domain)
        try {
          const urlObj = new URL(fullWebsiteUrl);
          displayWebsite = urlObj.hostname;
        } catch (error) {
          // If URL parsing fails, just use the original
          displayWebsite = business.websiteUrl;
        }
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
            ? `<div class="business-detail"><i class="fas fa-globe"></i> <a href="${fullWebsiteUrl}" target="_blank">${displayWebsite}</a></div>`
            : ""
        }
        ${
          business.lastContactedDate
            ? `
          <div class="business-detail"><i class="fas fas fa-clock"></i> Last contact: ${(() => {
            const fetchedDate = new Date(business.lastContactedDate);
            // Check if fetchedDate is a valid Date object
            if (fetchedDate && !isNaN(fetchedDate.getTime())) {
              // Create local date at noon to avoid timezone issues
              const localDateForDisplay = new Date(
                fetchedDate.getUTCFullYear(),
                fetchedDate.getUTCMonth(),
                fetchedDate.getUTCDate(),
                12,
                0,
                0
              );
              return Utils.formatDate(localDateForDisplay, dateFormat);
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

function openViewBusinessModal(business) {
  // Get dateFormat from window object (set in settings)
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

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

  // Add extension display
  document.getElementById("viewBusinessPhoneExt").textContent =
    business.businessPhoneExt ? `Ext: ${business.businessPhoneExt}` : "";

  document.getElementById("viewBusinessEmail").textContent =
    business.businessEmail || "N/A";

  // Display address if available
  const address = business.address || {};
  document.getElementById("viewBusinessStreet").textContent =
    address.street || "N/A";
  document.getElementById("viewBusinessAptUnit").textContent =
    address.aptUnit || "N/A";
  document.getElementById("viewBusinessCity").textContent =
    address.city || "N/A";
  document.getElementById("viewBusinessState").textContent =
    address.state || "N/A";
  document.getElementById("viewBusinessZipCode").textContent =
    address.zipCode || "N/A";
  document.getElementById("viewBusinessCountry").textContent =
    address.country || "N/A";

  // Improved website URL display logic
  const websiteLinkHtml = business.websiteUrl
    ? (() => {
        // Create the full URL with protocol for the href
        let fullUrl = business.websiteUrl;
        if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
          fullUrl = `https://${fullUrl}`;
        }

        // Create a simplified display URL (just the domain)
        let displayUrl = business.websiteUrl;
        try {
          // Try to parse the URL to get just the hostname
          const url = new URL(fullUrl);
          displayUrl = url.hostname;

          return `<a href="${fullUrl}" target="_blank">${displayUrl}</a>`;
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

  // Last contacted date - use the global date format from settings
  const lastContactedDisplayDate = business.lastContactedDate
    ? new Date(business.lastContactedDate)
    : null;

  let formattedLastContacted = "N/A";

  if (lastContactedDisplayDate && !isNaN(lastContactedDisplayDate.getTime())) {
    // Using UTC components to create local date at noon, consistent with other date displays
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
  }

  document.getElementById("viewLastContactedDate").textContent =
    formattedLastContacted;

  document.getElementById("viewNotes").textContent = business.notes || "N/A";

  // Show the view modal
  document.getElementById("businessViewModal").style.display = "block";
}

function initializeDateInputs() {
  // Get dateFormat from window object (set in settings)
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

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
            // Format using the local date object created with the global date format
            displayElement.textContent = Utils.formatDate(date, dateFormat);
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
  sortHitlistsAlphabetically,
  sortBusinessesAlphabetically
};
