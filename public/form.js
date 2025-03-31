// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the form element
  const form = document.getElementById("inquiry-form");

  // Helper function to create and show error messages
  function showError(input, message) {
    // Remove any existing error message
    const existingError =
      input.parentElement.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Create and add new error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);

    // Add error class to the input
    input.classList.add("invalid");
  }

  // Helper function to remove error messages
  function removeError(input) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove("invalid");
  }

  // Validate a phone number
  function isValidPhone(phone) {
    // Must be in format 000-000-0000 (10 digits with hyphens)
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  // Validate an email
  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validate a URL
  function isValidUrl(url) {
    if (!url) return true; // Allow empty URLs

    // For URLs with a protocol, validate directly
    if (/^https?:\/\//i.test(url)) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    }

    // For URLs without a protocol, check if it has a domain suffix
    const domainSuffixRegex = /\.[a-z]{2,}(\S*)/i;
    if (!domainSuffixRegex.test(url)) {
      return false; // URL must have a domain suffix
    }

    // Add protocol for validation
    try {
      new URL("http://" + url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Toast notification function
  function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById("toast-notification");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-notification";
      toast.className = "toast-notification";
      document.body.appendChild(toast);
    }

    // Set message
    toast.textContent = message;

    // Show toast
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Hide toast after 5 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);
  }

  // Function to validate individual field
  function validateField(field) {
    if (field.required && field.value.trim() === "") {
      showError(field, "This field is required");
      return false;
    }

    if (field.type === "email" && field.value.trim() !== "") {
      if (!isValidEmail(field.value)) {
        showError(field, "Please enter a valid email address");
        return false;
      }
    }

    if (field.type === "tel" && field.value.trim() !== "" && field.required) {
      if (!isValidPhone(field.value)) {
        showError(field, "Please enter a valid 10-digit phone number in format: 000-000-0000");
        return false;
      }
    }

    if (field.id === "websiteAddress" && field.value.trim() !== "") {
      if (!isValidUrl(field.value)) {
        showError(
          field,
          "Please enter a valid website address (e.g., example.com)"
        );
        return false;
      }
    }

    removeError(field);
    return true;
  }

  // Check if radio button groups have a selection
  function validateRadioGroup(name) {
    const radioButtons = form.querySelectorAll(`input[name="${name}"]`);
    const radioGroup =
      radioButtons[0].parentElement.parentElement.parentElement;
    const isChecked = [...radioButtons].some((radio) => radio.checked);

    if (!isChecked) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = "Please select an option";

      // Remove existing error message if any
      const existingError = radioGroup.querySelector(".error-message");
      if (existingError) {
        existingError.remove();
      }

      radioGroup.appendChild(errorDiv);
      return false;
    } else {
      const existingError = radioGroup.querySelector(".error-message");
      if (existingError) {
        existingError.remove();
      }
      return true;
    }
  }

  // Conditionally validate website URL field
  function validateWebsiteAddress() {
    const hasWebsiteYes = document.getElementById("websiteYes");
    const websiteAddress = document.getElementById("websiteAddress");

    if (hasWebsiteYes.checked && websiteAddress.value.trim() === "") {
      showError(websiteAddress, "Please provide your website address");
      return false;
    }

    if (hasWebsiteYes.checked && websiteAddress.value.trim() !== "") {
      if (!isValidUrl(websiteAddress.value)) {
        showError(
          websiteAddress,
          "Please enter a valid website address (e.g., example.com)"
        );
        return false;
      }
    }

    removeError(websiteAddress);
    return true;
  }

  // Initialize phone number formatting with Cleave.js for all telephone inputs
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    new Cleave(input, {
      numericOnly: true,
      blocks: [3, 3, 4],
      delimiters: ['-', '-']
    });
  });

  // Show/hide extension fields based on checkbox selection
  document.getElementById("phoneExtCheck").addEventListener("change", function() {
    document.getElementById("phoneExtField").style.display = this.checked ? "block" : "none";
    // Clear the field when hiding
    if (!this.checked) {
      document.getElementById("phoneExt").value = "";
    }
  });

  document.getElementById("businessPhoneExtCheck").addEventListener("change", function() {
    document.getElementById("businessPhoneExtField").style.display = this.checked ? "block" : "none";
    // Clear the field when hiding
    if (!this.checked) {
      document.getElementById("businessPhoneExt").value = "";
    }
  });

  // Add blur event listeners to validate as user moves between fields
  const requiredInputs = form.querySelectorAll(
    "input[required], textarea[required]"
  );
  requiredInputs.forEach((input) => {
    input.addEventListener("blur", function () {
      validateField(this);
    });
  });

  // Add input event listeners to validate as user types
  const emailInputs = form.querySelectorAll('input[type="email"]');
  emailInputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim() !== "") {
        if (!isValidEmail(this.value)) {
          showError(this, "Please enter a valid email address");
        } else {
          removeError(this);
        }
      }
    });
  });

  // Add blur event listeners to validate phone numbers after user finishes typing
  phoneInputs.forEach((input) => {
    input.addEventListener("blur", function () {
      if (this.value.trim() !== "" && input.required) {
        if (!isValidPhone(this.value)) {
          showError(this, "Please enter a valid 10-digit phone number in format: 000-000-0000");
        } else {
          removeError(this);
        }
      }
    });
  });

  // Add input validation for website field
  const websiteAddressInput = document.getElementById("websiteAddress");
  if (websiteAddressInput) {
    websiteAddressInput.addEventListener("input", function () {
      if (this.value.trim() !== "") {
        if (!isValidUrl(this.value)) {
          showError(
            this,
            "Please enter a valid website address (e.g., example.com)"
          );
        } else {
          removeError(this);
        }
      }
    });
  }

  // Show/hide website address field based on radio selection
  document
    .querySelectorAll('input[name="hasWebsite"]')
    .forEach((radio) => {
      radio.addEventListener("change", function () {
        const websiteAddressField = document.getElementById(
          "websiteAddressField"
        );
        if (this.value === "yes") {
          websiteAddressField.style.display = "block";
        } else {
          websiteAddressField.style.display = "none";
          // Clear any errors when hiding field
          removeError(document.getElementById("websiteAddress"));
        }
      });
    });

  // Form submission with validation
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    let isValid = true;

    // Validate all required fields
    requiredInputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    // Validate radio button groups
    if (!validateRadioGroup("preferredContact")) {
      isValid = false;
    }

    if (!validateRadioGroup("serviceDesired")) {
      isValid = false;
    }

    // Validate conditional website address
    if (document.getElementById("websiteYes").checked) {
      if (!validateWebsiteAddress()) {
        isValid = false;
      }
    }

    if (!isValid) {
      // Scroll to the first error
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // If validation passes, prepare form data
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
      // Store all values as-is, without modification
      formObject[key] = value;
    });

    // Handle phone extensions properly
    if (formObject.phoneExtCheck === "on" && formObject.phoneExt) {
      formObject.phoneExt = formObject.phoneExt;
    } else {
      formObject.phoneExt = undefined;
    }
    
    if (formObject.businessPhoneExtCheck === "on" && formObject.businessPhoneExt) {
      formObject.businessPhoneExt = formObject.businessPhoneExt;
    } else {
      formObject.businessPhoneExt = undefined;
    }
    
    // Clean up the data by removing the checkbox values
    delete formObject.phoneExtCheck;
    delete formObject.businessPhoneExtCheck;
    
    // Add the isFormSubmission flag to identify this as coming from the form
    formObject.isFormSubmission = true;

    try {
      const response = await fetch("http://localhost:5000/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        // Show success message as toast notification
        showToast("Thank you for your inquiry! We'll be in touch soon.");

        // Reset the form
        form.reset();

        // Reset extension fields and hide them
        document.getElementById("phoneExtField").style.display = "none";
        document.getElementById("businessPhoneExtField").style.display = "none";

        // Hide any conditional fields
        document.getElementById("websiteAddressField").style.display = "none";
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Server responded with an error"
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("Error: " + error.message);
    }
  });
});