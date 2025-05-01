import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtxxEU1DGzGJO83lquD4biAjPlRFMzq4E",
  authDomain: "devleads-a1329.firebaseapp.com",
  projectId: "devleads-a1329",
  storageBucket: "devleads-a1329.firebasestorage.app",
  messagingSenderId: "95407568917",
  appId: "1:95407568917:web:db6424b8f1df724258361c",
  measurementId: "G-47PSY58Q5P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Set authentication persistence to session-only (browserSessionPersistence)
 *
 * This means:
 * - Users will stay logged in as they navigate between pages in the app
 * - Users will stay logged in if they refresh the page
 * - Users will stay logged in if they open new tabs to the app
 * - Users will be logged out when they close the browser completely
 * - When they reopen the browser, they'll need to log in again
 *
 * This provides better security than the default localStorage persistence
 * which keeps users logged in for months, while still maintaining good
 * user experience during active usage.
 */

// Handle login form submission
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const loginContainer = document.querySelector(".login-container");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Clear previous error messages
  errorMessage.style.display = "none";

  // Show loading state
  const submitBtn = loginForm.querySelector(".login-btn");
  const originalButtonText = submitBtn.textContent;
  submitBtn.textContent = "Signing In...";
  submitBtn.disabled = true;

  // Set persistence and then sign in
  setPersistence(auth, browserSessionPersistence)
    .then(() => {
      // After setting persistence, sign in with email/password
      return signInWithEmailAndPassword(auth, email, password);
    })
    .then(() => {
      // Replace the current history entry with the dashboard instead of adding a new one
      window.history.replaceState(null, "", "/dashboard/home");
      
      // Then navigate to the dashboard
      window.location.href = "/dashboard/home";
    })
    .catch((error) => {
      // Reset button
      submitBtn.textContent = originalButtonText;
      submitBtn.disabled = false;

      // Show error with animation
      errorMessage.textContent = getErrorMessage(error.code);
      errorMessage.style.display = "block";
      loginContainer.classList.add("shake");

      // Remove animation class after it completes
      setTimeout(() => {
        loginContainer.classList.remove("shake");
      }, 500);
    });
});

// Password Reset Modal
const resetModal = document.getElementById("resetPasswordModal");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const closeResetModal = document.getElementById("closeResetModal");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetErrorMessage = document.getElementById("resetErrorMessage");
const resetFormContainer = document.getElementById("resetFormContainer");
const resetConfirmationContainer = document.getElementById(
  "resetConfirmationContainer"
);
const confirmedEmail = document.getElementById("confirmedEmail");

// Show reset password modal
forgotPasswordLink.addEventListener("click", () => {
  resetModal.style.display = "flex";
  document.getElementById("resetEmail").value =
    document.getElementById("email").value;
  resetErrorMessage.style.display = "none";
  resetFormContainer.style.display = "block";
  resetConfirmationContainer.style.display = "none";
});

// Close reset password modal
closeResetModal.addEventListener("click", () => {
  resetModal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === resetModal) {
    resetModal.style.display = "none";
  }
});

// Handle password reset form submission
resetPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value;

  // Reset error messages
  resetErrorMessage.style.display = "none";

  // Show loading state
  const resetBtn = resetPasswordForm.querySelector(".login-btn");
  const originalButtonText = resetBtn.textContent;
  resetBtn.textContent = "Sending...";
  resetBtn.disabled = true;

  // Send password reset email
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Show success confirmation and hide form
      resetFormContainer.style.display = "none";
      confirmedEmail.textContent = email;
      resetConfirmationContainer.style.display = "block";

      // Close modal after a delay
      setTimeout(() => {
        resetModal.style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      // Show error message
      resetErrorMessage.textContent = getErrorMessage(error.code);
      resetErrorMessage.style.display = "block";
      resetBtn.textContent = originalButtonText;
      resetBtn.disabled = false;
    });
});

// Function to get user-friendly error messages
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email address";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later";
    case "auth/missing-password":
      return "Please enter your password";
    default:
      return "Failed to sign in. Please check your credentials";
  }
}

// Redirect to dashboard if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Replace the current history entry with the dashboard instead of adding a new one
    window.history.replaceState(null, "", "/dashboard/home");
    
    // Then navigate to the dashboard
    window.location.href = "/dashboard/home";
  }
});