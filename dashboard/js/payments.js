// payments.js - Payment functionality

import { formatCurrency, formatDate, showToast } from './utils.js';
import { fetchLeadPayments, updatePayment, createPayment, deletePayment } from './api.js';

/**
 * Render all payments for a specific lead
 * @param {Array} leadPayments - Payments for the lead
 * @param {string} leadId - ID of the lead
 */
function renderLeadPayments(leadPayments, leadId) {
  const paymentsContainer = document.querySelector(".payments-container");
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  if (!paymentsContainer) return;

  // Clear container before rendering
  paymentsContainer.innerHTML = "";

  if (!leadPayments || leadPayments.length === 0) {
    paymentsContainer.innerHTML =
      '<p class="payment-item">No payments found</p>';
    return;
  }

  // Only render payments that match the current lead ID
  const filteredPayments = leadPayments.filter(
    (payment) => payment.leadId === leadId
  );

  if (filteredPayments.length === 0) {
    paymentsContainer.innerHTML =
      '<p class="payment-item">No payments found</p>';
    return;
  }

  // Check if we're in edit mode by looking for the submit button visibility
  const submitButton = document.querySelector(
    '#leadForm button[type="submit"]'
  );
  const isEditMode = submitButton && submitButton.style.display !== "none";

  filteredPayments.forEach((payment) => {
    const paymentDate = payment.paymentDate
      ? formatDate(new Date(payment.paymentDate), dateFormat)
      : "Not recorded";

    const paymentItem = document.createElement("div");
    paymentItem.className = "payment-item";
    paymentItem.dataset.leadId = payment.leadId;
    paymentItem.dataset.paymentId = payment._id;

    // Create the payment details element
    const paymentDetails = document.createElement("div");
    paymentDetails.className = "payment-details";

    const amountDiv = document.createElement("div");
    amountDiv.className = "payment-amount";
    amountDiv.textContent = formatCurrency(
      payment.amount,
      payment.currency || "USD"
    );

    const dateDiv = document.createElement("div");
    dateDiv.className = "payment-date";
    dateDiv.textContent = `Paid: ${paymentDate}`;

    paymentDetails.appendChild(amountDiv);
    paymentDetails.appendChild(dateDiv);

    if (payment.notes) {
      const notesDiv = document.createElement("div");
      notesDiv.className = "payment-notes";
      notesDiv.textContent = payment.notes;
      paymentDetails.appendChild(notesDiv);
    }

    paymentItem.appendChild(paymentDetails);

    // Only add action buttons if we're in edit mode
    if (isEditMode) {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "payment-actions";

      // Create edit button with direct click handler
      const editButton = document.createElement("button");
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.onclick = function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        openPaymentModal(leadId, payment._id);
      };

      // Create delete button with direct click handler
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.onclick = function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (confirm("Are you sure you want to delete this payment?")) {
          deletePaymentAction(payment._id, leadId);
        }
      };

      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);
      paymentItem.appendChild(actionsDiv);
    }

    paymentsContainer.appendChild(paymentItem);
  });
}

/**
 * Open the payment modal for adding or editing a payment
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

  // Set the lead ID - verify it exists
  if (!leadId) {
    showToast("Error: No lead ID provided");
    return;
  }

  console.log(`Opening payment modal for lead ID: ${leadId}`);
  document.getElementById("paymentLeadId").value = leadId;
  
  const dateFormat = window.dateFormat || "MM/DD/YYYY";

  if (paymentId) {
    // Edit existing payment - fetch it first
    fetchLeadPayments(leadId).then(payments => {
      // Find the specific payment
      const payment = payments.find(p => p._id === paymentId && p.leadId === leadId);
      
      if (!payment) {
        showToast("Payment not found or doesn't belong to this lead");
        return;
      }
      
      document.getElementById("paymentId").value = payment._id;
      document.getElementById("paymentAmount").value = payment.amount;
      document.getElementById("paymentCurrency").value = payment.currency || "USD";

      // Format date for the date input
      if (payment.paymentDate) {
        // Create a date object in the local timezone
        const dateObj = new Date(payment.paymentDate);
        
        // Format as YYYY-MM-DD for input[type="date"]
        const formattedDate = dateObj.toISOString().split("T")[0];
        document.getElementById("paymentDate").value = formattedDate;
        
        // Update the display element with formatted date
        if (dateDisplay) {
          dateDisplay.textContent = formatDate(dateObj, dateFormat);
        }
      }

      document.getElementById("paymentNotes").value = payment.notes || "";

      document.getElementById("paymentModalTitle").textContent = "Edit Payment";
    }).catch(error => {
      console.error("Error fetching payment:", error);
      showToast("Error: " + error.message);
    });
  } else {
    // New payment
    // Set default values
    const defaultCurrency = document.getElementById("budgetCurrency")?.value || "USD";
    document.getElementById("paymentCurrency").value = defaultCurrency;

    // Set today's date correctly with timezone adjustment
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to prevent timezone issues
    const localDate = today.toISOString().split("T")[0];

    document.getElementById("paymentDate").value = localDate;
    
    // Update the display element with today's date in the selected format
    if (dateDisplay) {
      dateDisplay.textContent = formatDate(today, dateFormat);
    }
    
    document.getElementById("paymentNotes").value = "";

    document.getElementById("paymentModalTitle").textContent = "Add Payment";
  }
  
  // Set up event listener for date input changes
  const paymentDateInput = document.getElementById("paymentDate");
  if (paymentDateInput) {
    paymentDateInput.addEventListener("change", function() {
      if (this.value) {
        const date = new Date(this.value);
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

  document.getElementById("paymentModal").style.display = "block";
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

/**
 * Validate and save a payment
 * @param {Event} event - Form submission event
 */
async function validateAndSavePayment(event) {
  event.preventDefault();

  // Get form data
  const paymentId = document.getElementById("paymentId").value;
  const leadId = document.getElementById("paymentLeadId").value;
  const amountStr = document.getElementById("paymentAmount").value;
  const currency = document.getElementById("paymentCurrency").value;
  const paymentDate = document.getElementById("paymentDate").value;
  const notes = document.getElementById("paymentNotes").value;

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

  // Create a date at noon local time, then adjust for timezone
  const dateObj = new Date(paymentDate + "T12:00:00");
  console.log("Original payment date input:", paymentDate);
  console.log("Date object created:", dateObj.toISOString());

  // Timezone offset to ensure the date doesn't shift
  const timezoneOffset = dateObj.getTimezoneOffset() * 60000; // Convert to milliseconds
  const adjustedDate = new Date(dateObj.getTime() + timezoneOffset);
  console.log("Adjusted date with timezone offset:", adjustedDate.toISOString());

  // Prepare payment data with adjusted date
  const paymentData = {
    leadId,
    amount,
    currency,
    paymentDate: adjustedDate,
    notes,
  };

  // If editing existing payment, add the ID
  if (paymentId) {
    paymentData._id = paymentId;
  }

  try {
    let result;
    if (paymentId) {
      // Update existing payment
      result = await updatePayment(paymentId, paymentData);
    } else {
      // Create new payment
      result = await createPayment(paymentData);
    }

    // Get the current lead ID
    const leadId = document.getElementById("leadId").value;

    if (leadId) {
      // Get updated payments specifically for this lead
      const leadPayments = await fetchLeadPayments(leadId);

      // Calculate the total paid
      const totalPaid = leadPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Update paid amount field
      const paidAmountField = document.getElementById("paidAmount");
      if (paidAmountField) {
        paidAmountField.value = formatCurrency(
          totalPaid,
          currency || "USD"
        );
      }

      // Update remaining balance field
      const remainingBalanceField = document.getElementById("remainingBalance");
      if (remainingBalanceField) {
        // Get the total budget from the form
        const totalBudgetStr = document.getElementById("totalBudget").value;
        const totalBudget = parseFloat(totalBudgetStr.replace(/[^\d.-]/g, "")) || 0;
        const remainingBalance = Math.max(0, totalBudget - totalPaid);
        
        remainingBalanceField.value = formatCurrency(
          remainingBalance,
          currency || "USD"
        );
      }

      // Render payment list
      renderLeadPayments(leadPayments, leadId);
    }
    
    // Close the payment modal
    closePaymentModal();

    // Show success message
    showToast(
      paymentId
        ? "Payment updated successfully"
        : "Payment added successfully"
    );
    
    // Signal that payments have been updated
    window.dispatchEvent(new CustomEvent('paymentsUpdated'));
    
  } catch (error) {
    console.error("Error saving payment:", error);
    showToast("Error: " + error.message);
  }
}

/**
 * Delete a payment
 * @param {string} paymentId - ID of the payment to delete
 * @param {string} leadId - ID of the lead the payment belongs to
 */
async function deletePaymentAction(paymentId, leadId) {
  try {
    // Store the lead modal state before any operations
    const leadModalDisplayStyle =
      document.getElementById("leadModal").style.display;

    if (!paymentId || !leadId) {
      throw new Error("Missing payment ID or lead ID");
    }

    // Delete the payment
    await deletePayment(paymentId);

    if (leadId) {
      // Get updated payments for this specific lead
      const leadPayments = await fetchLeadPayments(leadId);

      // Calculate the total paid
      const totalPaid = leadPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Get the lead's currency
      const currencyElem = document.getElementById("budgetCurrency");
      const currency = currencyElem ? currencyElem.value : "USD";

      // Update paid amount field
      const paidAmountField = document.getElementById("paidAmount");
      if (paidAmountField) {
        paidAmountField.value = formatCurrency(
          totalPaid,
          currency
        );
      }

      // Update remaining balance field
      const remainingBalanceField = document.getElementById("remainingBalance");
      if (remainingBalanceField) {
        // Get the total budget from the form
        const totalBudgetStr = document.getElementById("totalBudget").value;
        const totalBudget = parseFloat(totalBudgetStr.replace(/[^\d.-]/g, "")) || 0;
        const remainingBalance = Math.max(0, totalBudget - totalPaid);
        
        remainingBalanceField.value = formatCurrency(
          remainingBalance,
          currency
        );
      }

      // Render payment list with current date format
      renderLeadPayments(leadPayments, leadId);
    }

    // Ensure lead modal stays in its original state
    document.getElementById("leadModal").style.display = leadModalDisplayStyle;

    // Signal that payments have been updated
    window.dispatchEvent(new CustomEvent('paymentsUpdated'));

    showToast("Payment deleted successfully");
  } catch (error) {
    console.error("Error deleting payment:", error);
    showToast("Error: " + error.message);
  }
}

// Export payment functions
export {
  renderLeadPayments,
  openPaymentModal,
  closePaymentModal,
  validateAndSavePayment,
  deletePaymentAction
};