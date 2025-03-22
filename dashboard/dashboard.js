const API_URL = "http://localhost:5000/api/leads"; // Replace with your API URL

let leads = [];

async function fetchLeads() {
  try {
    const response = await fetch(API_URL);
    leads = await response.json();
    renderLeads(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
  }
}

function renderLeads(leadsToRender) {
  const leadCards = document.getElementById("leadCards");
  leadCards.innerHTML = "";

  leadsToRender.forEach((lead) => {
    const card = document.createElement("div");
    card.className = "lead-card";
    card.innerHTML = `
            <h3>${lead.firstName} ${lead.lastName}</h3>
            <p>Email: ${lead.email}</p>
            <p>Phone: ${lead.phone}</p>
            <p>Status: <span class="math-inline">${lead.status}<\/p>
<button onclick="editLead('</span>${lead._id}')">Edit</button>
            <button onclick="deleteLead('${lead._id}')">Delete</button>
        `;
    leadCards.appendChild(card);
  });
}

function openModal() {
  document.getElementById("leadModal").style.display = "block";
}

function closeModal() {
  document.getElementById("leadModal").style.display = "none";
  document.getElementById("leadForm").reset();
  document.getElementById("leadId").value = "";
}

async function saveLead(event) {
  event.preventDefault();

  const leadId = document.getElementById("leadId").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const status = document.getElementById("status").value;

  const leadData = { name, email, phone, status };

  try {
    let response;
    if (leadId) {
      response = await fetch(
        `<span class="math-inline">\{API\_URL\}/</span>{leadId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        }
      );
    } else {
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    }

    if (response.ok) {
      fetchLeads();
      closeModal();
      showToast(leadId ? "Lead updated" : "Lead added");
    } else {
      showToast("Failed to save lead");
    }
  } catch (error) {
    console.error("Error saving lead:", error);
    showToast("Error saving lead");
  }
}

async function editLead(leadId) {
  try {
    const response = await fetch(`${API_URL}/${leadId}`);
    const lead = await response.json();

    document.getElementById("leadId").value = lead._id;
    document.getElementById("name").value = lead.name;
    document.getElementById("email").value = lead.email;
    document.getElementById("phone").value = lead.phone;
    document.getElementById("status").value = lead.status;

    openModal();
  } catch (error) {
    console.error("Error editing lead:", error);
    showToast("Error fetching lead for edit");
  }
}

async function deleteLead(leadId) {
  if (confirm("Are you sure you want to delete this lead?")) {
    try {
      const response = await fetch(`${API_URL}/${leadId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchLeads();
        showToast("Lead deleted");
      } else {
        showToast("Failed to delete lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      showToast("Error deleting lead");
    }
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

function searchLeads() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredLeads = leads.filter((lead) => {
    return (
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm)
    );
  });
  renderLeads(filteredLeads);
}

function filterLeads() {
  const filterStatus = document.getElementById("filterStatus").value;
  let filteredLeads = leads;

  if (filterStatus) {
    filteredLeads = leads.filter((lead) => lead.status === filterStatus);
  }
  renderLeads(filteredLeads);
}

function sortLeads() {
  const sortField = document.getElementById("sortField").value;
  const sortOrder = document.getElementById("sortOrder").value;

  const sortedLeads = [...leads].sort((a, b) => {
    let comparison = 0;
    if (a[sortField] > b[sortField]) {
      comparison = 1;
    } else if (a[sortField] < b[sortField]) {
      comparison = -1;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
  renderLeads(sortedLeads);
}

// Event Listeners
document.getElementById("addLeadBtn").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("leadForm").addEventListener("submit", saveLead);
document.getElementById("searchInput").addEventListener("input", searchLeads);
document.getElementById("filterStatus").addEventListener("change", filterLeads);
document.getElementById("sortField").addEventListener("change", sortLeads);
document.getElementById("sortOrder").addEventListener("change", sortLeads);

// Initial Load
fetchLeads();
