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

// Handle login form submission
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const loginContainer = document.querySelector(".login-container");
const emailInput = document.getElementById("email");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value;
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

// Handle forgot password link
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

forgotPasswordLink.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    errorMessage.textContent = "Please enter your email address first.";
    errorMessage.style.display = "block";
    errorMessage.style.backgroundColor = "rgba(220, 53, 69, 0.08)";
    errorMessage.style.color = "#dc3545";
    return;
  }

  // Clear previous messages
  errorMessage.style.display = "none";

  // Disable the login button to prevent multiple submissions
  const submitBtn = loginForm.querySelector(".login-btn");
  const originalButtonText = submitBtn.textContent;
  submitBtn.textContent = "Processing...";
  submitBtn.disabled = true;

  try {
    await sendPasswordResetEmail(auth, email);

    // Show success message
    errorMessage.textContent = "Password reset email sent. Check your inbox.";
    errorMessage.style.display = "block";
    errorMessage.style.backgroundColor = "rgba(40, 167, 69, 0.08)";
    errorMessage.style.color = "#28a745";
  } catch (error) {
    // Show error message
    errorMessage.textContent =
      "Failed to send reset email. " + getErrorMessage(error.code);
    errorMessage.style.display = "block";
    errorMessage.style.backgroundColor = "rgba(220, 53, 69, 0.08)";
    errorMessage.style.color = "#dc3545";
  } finally {
    // Re-enable the login button
    submitBtn.textContent = originalButtonText;
    submitBtn.disabled = false;
  }
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
