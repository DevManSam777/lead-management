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


/**
 * Render lead payments in the UI.
 * @param {Array<Object>} leadPayments - Array of payment objects for the lead.
 * @param {string} leadId - The ID of the lead.
 */
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

  // Make sure we have valid payments for this lead
  const filteredPayments = leadPayments.filter(payment => {
    return payment && payment.leadId === leadId;
  });

  // If no payments for this lead
  if (!filteredPayments || filteredPayments.length === 0) {
    paymentsContainer.innerHTML = '<p class="no-payments-message">No payments found.  Click "Add Payment" to add one.</p>';
    return;
  }

  // Sort payments by date (newest first)
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    // Directly compare Date objects created from the UTC strings
    const dateA = new Date(a.paymentDate);
    const dateB = new Date(b.paymentDate);
    return dateB.getTime() - dateA.getTime();  // Compare timestamps for accuracy
  });

  // Check if we're in edit mode (Lead modal is open and in edit mode)
  const leadModal = document.getElementById("leadModal");
  // Check if the lead modal is open and has a submit button that is visible (indicating edit mode)
  const submitButton = leadModal ? leadModal.querySelector('button[type="submit"]') : null;
  const isEditMode = leadModal && leadModal.style.display !== 'none' && submitButton && getComputedStyle(submitButton).display !== "none";


  // Render each payment
  sortedPayments.forEach(payment => {
    let formattedDate = "Not recorded";

    if (payment.paymentDate) {
      // Create a Date object from the stored UTC string
      const paymentDateUTC = new Date(payment.paymentDate);

      // Check if the date is valid before proceeding
      if (!isNaN(paymentDateUTC.getTime())) {
           // Create a *local* Date object representing the same date as the UTC date at local midnight
           // This is the standard way to display a date stored in UTC in the local timezone.
           const localDateForDisplay = new Date(
             paymentDateUTC.getUTCFullYear(),
             paymentDateUTC.getUTCMonth(),
             paymentDateUTC.getUTCDate() // Use UTC date components to construct local date
           );

           // Format the local date for display
           formattedDate = formatDate(localDateForDisplay, dateFormat);

           // Debug log to compare dates
           console.log(`Render Payment Date: Original='${payment.paymentDate}', UTC Parsed='${paymentDateUTC.toISOString()}', Local Display Date='${localDateForDisplay.toLocaleDateString()}'`);

      } else {
          console.warn(`Invalid payment date format received: ${payment.paymentDate}`);
          formattedDate = "Invalid Date"; // Display something if the date is invalid
      }
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
    dateDiv.innerHTML = `<i class="fa-solid fa-money-bill-wave" style="opacity: 0.7"></i> Paid: ${formattedDate}`;
    paymentDetails.appendChild(dateDiv);

    // Add payment notes if available
    if (payment.notes) {
      const notesDiv = document.createElement("div");
      notesDiv.className = "payment-notes";
      notesDiv.innerHTML = `<i class="fa-regular fa-clipboard" style="margin-left: 0.3rem;"></i><span style="font-style: normal; padding-left: 0.5rem;">Note: </span>"<span style="padding">${payment.notes}</span>"`;
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
      editButton.title = "Edit Payment"; // Add title for better UX
      editButton.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Pass leadId and paymentId to open the modal in edit mode
        openPaymentModal(payment.leadId, payment._id);
      });
      actionsDiv.appendChild(editButton);

      // Delete button
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
       deleteButton.title = "Delete Payment"; // Add title for better UX
      deleteButton.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this payment?")) {
          // Pass paymentId and leadId for deletion and subsequent refresh
          deletePaymentAction(payment._id, payment.leadId);
        }
      });
      actionsDiv.appendChild(deleteButton);

      // Add actions div to the payment item
      paymentItem.appendChild(actionsDiv); // <--- CORRECTED LINE
    }

    // Add the payment item to the container (This should always happen)
    paymentsContainer.appendChild(paymentItem); // <--- MOVED THIS LINE OUTSIDE THE IF/ELSE

  });

  // Log the rendered payments
  console.log(`Rendered ${filteredPayments.length} payments for lead ID: ${leadId}`);
}


/**
 * Open the payment modal for adding or editing a payment
 * @param {string} leadId - ID of the lead (Required for new payments)
 * @param {string} paymentId - ID of the payment (Optional, for editing)
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
    console.error("Attempted to open payment modal without lead ID");
    return;
  }

  console.log(`Opening payment modal for lead ID: ${leadId} ${paymentId ? '(Editing Payment ID: ' + paymentId + ')' : '(New Payment)'}`);
  document.getElementById("paymentLeadId").value = leadId;

  const dateFormat = window.dateFormat || "MM/DD/YYYY";


  // --- Handle Editing an existing payment ---
  if (paymentId) {
    // Fetch payments for the lead to find the specific payment
    fetchLeadPayments(leadId)
      .then((payments) => {
        // Find the specific payment by ID
        const payment = payments.find(
          (p) => p._id === paymentId && p.leadId === leadId // Added leadId check for safety
        );

        if (!payment) {
          showToast("Payment not found or doesn't belong to this lead");
          console.error(`Payment ID ${paymentId} not found for lead ${leadId}`);
          return;
        }

        // Populate form fields with payment data
        document.getElementById("paymentId").value = payment._id;
        document.getElementById("paymentAmount").value = payment.amount;

        // --- Correct Date Handling for Editing ---
        if (payment.paymentDate) {
          // Create a Date object from the stored UTC string
          const paymentDateUTC = new Date(payment.paymentDate);

          // Create a *local* Date object representing the same date as the UTC date at local midnight
          // This gives us the correct local date to format for the input field.
          const localDateForInput = new Date(
             paymentDateUTC.getUTCFullYear(),
             paymentDateUTC.getUTCMonth(),
             paymentDateUTC.getUTCDate() // Use UTC date components
          );

          // Format the local Date object as YYYY-MM-DD for the input[type="date"] field
          const year = localDateForInput.getFullYear();
          const month = (localDateForInput.getMonth() + 1).toString().padStart(2, '0');
          const day = localDateForInput.getDate().toString().padStart(2, '0'); // NO +1 here

          const formattedDateForInput = `${year}-${month}-${day}`;
          document.getElementById("paymentDate").value = formattedDateForInput;

          // Update the display element with formatted date using the dateFormat
          if (dateDisplay) {
            // Use the same localDateForInput for formatting the display
            dateDisplay.textContent = formatDate(localDateForInput, dateFormat);
          }

           // Debug log for editing date
          console.log(`Opening for Edit - Payment Date: Original='${payment.paymentDate}', UTC Parsed='${paymentDateUTC.toISOString()}', Local Date for Input='${localDateForInput.toLocaleDateString()}', Formatted for Input='${formattedDateForInput}'`);

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
        console.error("Error fetching payment for editing:", error);
        showToast("Error fetching payment details.");
      });
  }
  // --- Handle Adding a new payment ---
  else {
    // For a new payment, set today's date in the input field and display
    const today = new Date();

    // Format today's date for the input field as YYYY-MM-DD (local time)
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const todayFormattedForInput = `${year}-${month}-${day}`;
    document.getElementById("paymentDate").value = todayFormattedForInput;

    // Update the display element with today's date in the selected format
    if (dateDisplay) {
      dateDisplay.textContent = formatDate(today, dateFormat); // Format local 'today' date
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

  // Setup event listener for date input changes (for both add and edit)
  const paymentDateInput = document.getElementById("paymentDate");
  if (paymentDateInput) {
    // Remove any existing listeners to avoid duplicates
    const oldInput = paymentDateInput;
     const newInput = oldInput.cloneNode(true);
     oldInput.parentNode.replaceChild(newInput, oldInput);
     // Re-get the element reference
     const updatedPaymentDateInput = document.getElementById("paymentDate");


    updatedPaymentDateInput.addEventListener("change", function () {
      if (this.value) {
        // The input value is YYYY-MM-DD local date string
        const dateParts = this.value.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS
        const day = parseInt(dateParts[2]);

        // Create a local Date object for display purposes
        const dateForDisplay = new Date(year, month, day); // Local date at midnight

        if (dateDisplay) {
          dateDisplay.textContent = formatDate(dateForDisplay, dateFormat);
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
     // Add input event listener for auto-resize (remove and add again for safety)
     const oldTextarea = paymentNotesTextarea;
     const newTextarea = oldTextarea.cloneNode(true);
     oldTextarea.parentNode.replaceChild(newTextarea, oldTextarea);
     // Re-get the element reference
     const updatedPaymentNotesTextarea = document.getElementById("paymentNotes");

     updatedPaymentNotesTextarea.removeEventListener("input", autoResizePaymentTextarea);
     updatedPaymentNotesTextarea.addEventListener("input", autoResizePaymentTextarea);

     // Trigger resize once on open
     autoResizePaymentTextarea();
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
  const paymentDateString = document.getElementById("paymentDate").value; // Get the YYYY-MM-DD string
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

  if (!paymentDateString) {
    showToast("Payment date is required");
    return;
  }

  // --- Correct Date Handling: Convert local date input to UTC ISO string ---

  // paymentDateString is in YYYY-MM-DD format (e.g., "2025-05-01")
  const [year, month, day] = paymentDateString.split("-").map(Number);

  // Create a Date object representing midnight of that date in the *local* timezone
  const paymentDateLocalMidnight = new Date(year, month - 1, day);

  // Convert this local Date object to its UTC ISO string representation for saving
  const paymentDateForSaving = paymentDateLocalMidnight.toISOString();

  // --- End Correct Date Handling ---


  // Prepare payment data
  const paymentData = {
    leadId,
    amount,
    paymentDate: paymentDateForSaving, // Use the correctly formatted UTC string here
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

    // Get updated payments list for this lead
    const updatedLeadPayments = await fetchLeadPayments(leadId);
    console.log("Updated payments for lead:", updatedLeadPayments);

    // Calculate the total paid for this lead
    const totalPaid = updatedLeadPayments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);


    // Update paid amount field on the lead form/modal
    const paidAmountField = document.getElementById("paidAmount");
    if (paidAmountField) {
      paidAmountField.value = formatCurrency(totalPaid);
    }

    // Update remaining balance field on the lead form/modal
    const remainingBalanceField = document.getElementById("remainingBalance");
    if (remainingBalanceField) {
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

    // Render updated payment list in the modal
    renderLeadPayments(updatedLeadPayments, leadId);

    // Show success message
    showToast(
      paymentId ? "Payment updated successfully" : "Payment added successfully"
    );

    // Signal that ALL payments have been updated (for dashboard stats)
    window.dispatchEvent(new CustomEvent("paymentsUpdated"));

  } catch (error) {
    console.error("Error saving payment:", error);
    showToast("Error: " + (error.message || "An unknown error occurred"));
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
