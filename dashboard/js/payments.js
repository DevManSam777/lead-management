import {
  formatCurrency,
  formatDate,
  showToast,
  initializeMonetaryInputs,
} from "./utils.js";
import {
  fetchLeadPayments,
  updatePayment,
  createPayment,
  deletePayment,
} from "./api.js";

function renderLeadPayments(leadPayments, leadId) {
  const paymentsContainer = document.querySelector(".payments-container");
  
  if (!paymentsContainer) {
    console.error("Payments container not found");
    return;
  }

  // Get the date format from window object or use default
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  // Clear the container first
  paymentsContainer.innerHTML = "";

  // Make sure we have valid payments
  if (!leadPayments || !Array.isArray(leadPayments) || leadPayments.length === 0) {
    paymentsContainer.innerHTML = '<p class="payment-item">No payments found</p>';
    return;
  }

  // Make sure we are filtering for the current lead ID
  const filteredPayments = leadPayments.filter(payment => {
    // Ensure we're dealing with the correct lead ID
    return payment && payment.leadId === leadId;
  });

  // If no payments for this lead
  if (filteredPayments.length === 0) {
    paymentsContainer.innerHTML = '<p class="payment-item">No payments found</p>';
    return;
  }

  // Sort payments by date (newest first)
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const dateA = new Date(a.paymentDate);
    const dateB = new Date(b.paymentDate);
    return dateB - dateA;  // Newest first
  });

  // Check if we're in edit mode
  const submitButton = document.querySelector('#leadForm button[type="submit"]');
  const isEditMode = submitButton && getComputedStyle(submitButton).display !== "none";

  // Render each payment
  sortedPayments.forEach(payment => {
    // Format the payment date - FIX HERE
    let formattedDate = "Not recorded";
    
    if (payment.paymentDate) {
      // Convert the date string to a local date object without timezone conversion
      const dateStr = new Date(payment.paymentDate).toISOString().split('T')[0];
      const [year, month, day] = dateStr.split('-');
      
      // Create a new date object with the local date parts and fixed time  12(noon) // try 24
      const localDate = new Date(Number(year), Number(month) - 1, Number(day), 24, 0, 0);
      
      formattedDate = formatDate(localDate, dateFormat);
      
      console.log(`Original: ${payment.paymentDate}, Parsed: ${localDate.toLocaleDateString()}`);
    }
    

    // Create payment item element
    const paymentItem = document.createElement("div");
    paymentItem.className = "payment-item";
    paymentItem.dataset.leadId = payment.leadId;
    paymentItem.dataset.paymentId = payment._id;

    // Create payment details section
    const paymentDetails = document.createElement("div");
    paymentDetails.className = "payment-details";

    // Add payment amount
    const amountDiv = document.createElement("div");
    amountDiv.className = "payment-amount";
    amountDiv.textContent = formatCurrency(payment.amount);
    paymentDetails.appendChild(amountDiv);

    // Add payment date
    const dateDiv = document.createElement("div");
    dateDiv.className = "payment-date";
    dateDiv.textContent = `Paid: ${formattedDate}`;
    paymentDetails.appendChild(dateDiv);

    // Add payment notes if available
    if (payment.notes) {
      const notesDiv = document.createElement("div");
      notesDiv.className = "payment-notes";
      notesDiv.textContent = payment.notes;
      paymentDetails.appendChild(notesDiv);
    }

    // Add details to the payment item
    paymentItem.appendChild(paymentDetails);

    // Add action buttons if in edit mode
    if (isEditMode) {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "payment-actions";

      // Edit button
      const editButton = document.createElement("button");
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        openPaymentModal(leadId, payment._id);
      });
      actionsDiv.appendChild(editButton);

      // Delete button
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this payment?")) {
          deletePaymentAction(payment._id, leadId);
        }
      });
      actionsDiv.appendChild(deleteButton);

      // Add actions to payment item
      paymentItem.appendChild(actionsDiv);
    }

    // Add the payment item to the container
    paymentsContainer.appendChild(paymentItem);
  });

  // Log the rendered payments
  console.log(`Rendered ${filteredPayments.length} payments for lead ID: ${leadId}`);
}

/**
 * Open the payment modal for adding or editing a payment - with fixed date handling
 * @param {string} leadId - ID of the lead
 * @param {string} paymentId - ID of the payment (optional, for editing)
 */
function openPaymentModal(leadId, paymentId = null) {
  const paymentForm = document.getElementById("paymentForm");
  if (!paymentForm) return;

  paymentForm.reset();

  // Clear previous values
  document.getElementById("paymentId").value = "";
  document.getElementById("paymentLeadId").value = "";

  // Clear the date display
  const dateDisplay = document.getElementById("paymentDateDisplay");
  if (dateDisplay) {
    dateDisplay.textContent = "";
  }

  // Set the lead ID & verify it exists
  if (!leadId) {
    showToast("Error: No lead ID provided");
    return;
  }

  console.log(`Opening payment modal for lead ID: ${leadId}`);
  document.getElementById("paymentLeadId").value = leadId;

  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  if (paymentId) {
    // Edit existing payment - fetch it first
    fetchLeadPayments(leadId)
      .then((payments) => {
        // Find the specific payment
        const payment = payments.find(
          (p) => p._id === paymentId && p.leadId === leadId
        );

        if (!payment) {
          showToast("Payment not found or doesn't belong to this lead");
          return;
        }

        document.getElementById("paymentId").value = payment._id;
        document.getElementById("paymentAmount").value = payment.amount;

        // Format date for the date input - ensuring we get the correct local date
        if (payment.paymentDate) {
          // Create a date object (payments are stored with time at noon)
          const dateObj = new Date(payment.paymentDate);
          
          // Format as YYYY-MM-DD for input[type="date"]
          const year = dateObj.getFullYear();
          const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          const day = dateObj.getDate().toString().padStart(2, '0');
          
          const formattedDateForInput = `${year}-${month}-${day}`;
          document.getElementById("paymentDate").value = formattedDateForInput;

          // Update the display element with formatted date
          if (dateDisplay) {
            dateDisplay.textContent = formatDate(dateObj, dateFormat);
          }
        }

        // Set notes content
        document.getElementById("paymentNotes").value = payment.notes || "";

        document.getElementById("paymentModalTitle").textContent =
          "Edit Payment";

        // Make sure modal is visible before trying to resize textarea
        document.getElementById("paymentModal").style.display = "block";

        // After modal is shown, adjust the textarea height
        setTimeout(() => {
          autoResizePaymentTextarea();
        }, 0);
      })
      .catch((error) => {
        console.error("Error fetching payment:", error);
        showToast("Error: " + error.message);
      });
  } else {
    // New payment, set today's date with proper timezone handling
    const today = new Date();
    
    // Format for input as YYYY-MM-DD
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Create ISO date string for the input
    const todayFormatted = `${year}-${month}-${day}`;
    document.getElementById("paymentDate").value = todayFormatted;

    // Update the display element with today's date in the selected format
    if (dateDisplay) {
      dateDisplay.textContent = formatDate(today, dateFormat);
    }

    document.getElementById("paymentNotes").value = "";

    document.getElementById("paymentModalTitle").textContent = "Add Payment";

    // Show modal
    document.getElementById("paymentModal").style.display = "block";

    // Adjust textarea height
    setTimeout(() => {
      autoResizePaymentTextarea();
    }, 0);
  }

  // Set up event listener for date input changes
  const paymentDateInput = document.getElementById("paymentDate");
  if (paymentDateInput) {
    paymentDateInput.addEventListener("change", function () {
      if (this.value) {
        // Create a date from the input value
        const dateParts = this.value.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS
        const day = parseInt(dateParts[2]);
        
        // Create a date object with time at noon to prevent timezone issues
        const date = new Date(year, month, day, 12, 0, 0, 0);
        
        if (dateDisplay) {
          dateDisplay.textContent = formatDate(date, dateFormat);
        }
      } else {
        if (dateDisplay) {
          dateDisplay.textContent = "";
        }
      }
    });
  }

  // Set up textarea auto-resize
  const paymentNotesTextarea = document.getElementById("paymentNotes");
  if (paymentNotesTextarea) {
    // Add input event listener for auto-resize
    paymentNotesTextarea.removeEventListener(
      "input",
      autoResizePaymentTextarea
    );
    paymentNotesTextarea.addEventListener("input", autoResizePaymentTextarea);
  }

  // Initialize monetary inputs in the payment modal
  initializeMonetaryInputs();
}

/**
 * Auto-resize payment notes textarea
 */
function autoResizePaymentTextarea() {
  const textarea = document.getElementById("paymentNotes");
  if (!textarea) return;

  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = "auto";

  // Get the scroll height (content height)
  const scrollHeight = textarea.scrollHeight;

  // Set a minimum height to match input fields
  const minHeight = 38; // in pixels - matches standard input height

  // Only expand beyond minimum if content requires it
  if (scrollHeight > minHeight) {
    textarea.style.cssText += `height: ${scrollHeight}px !important;`;
  } else {
    textarea.style.cssText += `height: ${minHeight}px !important;`;
  }
}

/**
 * Close the payment modal
 */
function closePaymentModal() {
  const paymentModal = document.getElementById("paymentModal");
  if (!paymentModal) return;

  // Hide the payment modal
  paymentModal.style.display = "none";

  // Get the stored lead modal state
  const leadModalState = paymentModal.dataset.leadModalState;

  // If we have a stored state and it was "block", ensure lead modal stays open
  if (leadModalState === "block") {
    document.getElementById("leadModal").style.display = "block";
  }
}

async function validateAndSavePayment(event) {
  event.preventDefault();

  // Get form data
  const paymentId = document.getElementById("paymentId").value;
  const leadId = document.getElementById("paymentLeadId").value;
  const amountStr = document.getElementById("paymentAmount").value;
  const paymentDate = document.getElementById("paymentDate").value;
  const notes = document.getElementById("paymentNotes").value;

  // Validate data
  if (!leadId) {
    showToast("Error: Missing lead ID");
    return;
  }

  // Extract numeric value from formatted amount
  const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ""));

  if (isNaN(amount) || amount <= 0) {
    showToast("Please enter a valid amount");
    return;
  }

  if (!paymentDate) {
    showToast("Payment date is required");
    return;
  }

  // Create a date object at noon to avoid timezone issues
  const dateObj = new Date(paymentDate);
  dateObj.setHours(12, 0, 0, 0);

  // Prepare payment data
  const paymentData = {
    leadId,
    amount,
    paymentDate: dateObj,
    notes,
  };

  try {
    let result;
    
    if (paymentId) {
      // Update existing payment
      result = await updatePayment(paymentId, paymentData);
      console.log("Updated payment:", result);
    } else {
      // Create new payment
      result = await createPayment(paymentData);
      console.log("Created payment:", result);
    }

    // Close the payment modal
    closePaymentModal();

    // Get updated payments list
    const updatedPayments = await fetchLeadPayments(leadId);
    console.log("Updated payments:", updatedPayments);

    // Calculate the total paid
    const totalPaid = updatedPayments.reduce((sum, payment) => {
      return sum + (parseFloat(payment.amount) || 0);
    }, 0);

    // Update paid amount field
    const paidAmountField = document.getElementById("paidAmount");
    if (paidAmountField) {
      paidAmountField.value = formatCurrency(totalPaid);
    }

    // Update remaining balance field
    const remainingBalanceField = document.getElementById("remainingBalance");
    if (remainingBalanceField) {
      // Get the billed amount (total budget) from the form
      const totalBudgetStr = document.getElementById("totalBudget").value;
      const totalBudget = parseFloat(totalBudgetStr.replace(/[^\d.-]/g, "")) || 0;
      const remainingBalance = totalBudget - totalPaid;
      remainingBalanceField.value = formatCurrency(remainingBalance);
      
      console.log("Updated payment amounts:", {
        totalBudget,
        totalPaid,
        remainingBalance
      });
    }

    // Render updated payment list
    renderLeadPayments(updatedPayments, leadId);

    // Show success message
    showToast(
      paymentId ? "Payment updated successfully" : "Payment added successfully"
    );

    // Signal that payments have been updated
    window.dispatchEvent(new CustomEvent("paymentsUpdated"));
  } catch (error) {
    console.error("Error saving payment:", error);
    showToast("Error: " + error.message);
  }
}


async function deletePaymentAction(paymentId, leadId) {
  try {
    if (!paymentId || !leadId) {
      throw new Error("Missing payment ID or lead ID");
    }

    // Store the lead modal state before any operations
    const leadModalDisplayStyle = document.getElementById("leadModal").style.display;

    // Delete the payment
    const response = await deletePayment(paymentId);
    if (!response) {
      throw new Error("Failed to delete payment");
    }

    // Get updated payments for this specific lead
    const leadPayments = await fetchLeadPayments(leadId);
    console.log("Updated payments after deletion:", leadPayments);

    // Calculate the total paid
    const totalPaid = leadPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);

    // Update paid amount field
    const paidAmountField = document.getElementById("paidAmount");
    if (paidAmountField) {
      paidAmountField.value = formatCurrency(totalPaid);
    }

    // Update remaining balance field
    const remainingBalanceField = document.getElementById("remainingBalance");
    if (remainingBalanceField) {
      // Get the total budget from the form
      const totalBudgetStr = document.getElementById("totalBudget").value;
      const totalBudget = parseFloat(totalBudgetStr.replace(/[^\d.-]/g, "")) || 0;
      const remainingBalance = totalBudget - totalPaid;
      remainingBalanceField.value = formatCurrency(remainingBalance);
    }

    // Force re-render payment list with current date format
    renderLeadPayments(leadPayments, leadId);

    // Ensure lead modal stays in its original state
    document.getElementById("leadModal").style.display = leadModalDisplayStyle;

    // Signal that payments have been updated
    window.dispatchEvent(new CustomEvent("paymentsUpdated"));

    // Show success message
    showToast("Payment deleted successfully");
  } catch (error) {
    console.error("Error deleting payment:", error);
    showToast("Error: " + error.message);
  }
}

export {
  renderLeadPayments,
  openPaymentModal,
  closePaymentModal,
  validateAndSavePayment,
  deletePaymentAction,
};
