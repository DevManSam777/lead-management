import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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

// Initialize Firebase (if not already initialized)
let firebaseApp;
try {
  // Check if Firebase is already initialized
  if (!window.firebaseApp) {
    console.log("Initializing Firebase in authApi.js");
    firebaseApp = initializeApp(firebaseConfig);
    window.firebaseApp = firebaseApp;
  } else {
    console.log("Using existing Firebase app");
    firebaseApp = window.firebaseApp;
  }
} catch (e) {
  console.log("Firebase initialization error:", e);
  console.log("Using existing Firebase app");
}

// Get auth instance
const auth = getAuth(firebaseApp);

// Function to determine the appropriate API URL based on the environment
function getApiUrl() {
  // Check if we're running locally (localhost) or on the production server
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For local development, use the local API
    return "http://localhost:5000/api";
  } else {
    // For production (Render or any other host), use relative URL
    return "/api";
  }
}

// Set the API_URL based on the environment
const API_URL = getApiUrl();

// Token caching variables
let cachedToken = null;
let tokenExpiration = null;
const TOKEN_BUFFER = 5 * 60 * 1000; // 5 minute buffer before expiration

// Store the original fetch function
const originalFetch = window.fetch;

// Create an authenticated fetch function
window.fetch = async function(url, options = {}) {
  console.log(`Intercepted fetch to: ${url}`);
  
  // Determine if this is a request to our API
  let isApiRequest = false;
  
  // Check for both absolute and relative URLs
  if (url.includes('/api/')) {
    isApiRequest = true;
  } else if (url.includes('localhost:5000/api')) {
    isApiRequest = true;
  }
  
  // Only add auth headers for API calls to our backend
  if (isApiRequest) {
    const user = auth.currentUser;
    
    if (!user) {
      console.error('No authenticated user found for API call');
      
      // Wait for auth state to change
      try {
        await new Promise((resolve, reject) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
              unsubscribe();
              resolve(user);
            }
          });
          
          // Add timeout to prevent hanging
          setTimeout(() => {
            unsubscribe();
            reject(new Error('Authentication timeout - no user detected'));
          }, 5000);
        });
        
        // Get the user again after waiting
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated after waiting');
        }
        
        // Use cached token if available and not expired
        const now = Date.now();
        if (!cachedToken || !tokenExpiration || now >= tokenExpiration - TOKEN_BUFFER) {
          console.log('Token expired or not cached, getting new token');
          // Get a new token, but do NOT force refresh
          cachedToken = await user.getIdToken(false);
          
          // Calculate expiration from token
          const tokenParts = cachedToken.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              tokenExpiration = payload.exp * 1000; // Convert to milliseconds
            } catch (e) {
              // Fallback if we can't parse the token
              tokenExpiration = now + 55 * 60 * 1000; // 55 minutes
            }
          } else {
            tokenExpiration = now + 55 * 60 * 1000; // 55 minutes fallback
          }
          console.log('New token obtained, expires in', 
            Math.floor((tokenExpiration - now) / 60000), 'minutes');
        } else {
          console.log('Using cached token, expires in', 
            Math.floor((tokenExpiration - now) / 60000), 'minutes');
        }
        
        // Create headers if they don't exist
        options.headers = options.headers || {};
        
        // Add authorization header
        options.headers.Authorization = `Bearer ${cachedToken}`;
        
        console.log(`Used cached/new token for ${user.email}`);
      } catch (error) {
        console.error('Error getting auth token:', error);
        throw error;
      }
    } else {
      // User is already authenticated, get or use cached token
      try {
        // Check if we have a valid cached token
        const now = Date.now();
        if (!cachedToken || !tokenExpiration || now >= tokenExpiration - TOKEN_BUFFER) {
          console.log('Token expired or not cached, getting new token');
          // Get a new token, but do NOT force refresh
          cachedToken = await user.getIdToken(false);
          
          // Calculate expiration from token
          const tokenParts = cachedToken.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              tokenExpiration = payload.exp * 1000; // Convert to milliseconds
            } catch (e) {
              // Fallback if we can't parse the token
              tokenExpiration = now + 55 * 60 * 1000; // 55 minutes
            }
          } else {
            tokenExpiration = now + 55 * 60 * 1000; // 55 minutes fallback
          }
          console.log('New token obtained, expires in', 
            Math.floor((tokenExpiration - now) / 60000), 'minutes');
        } else {
          console.log('Using cached token, expires in', 
            Math.floor((tokenExpiration - now) / 60000), 'minutes');
        }
        
        // Create headers if they don't exist
        options.headers = options.headers || {};
        
        // Add authorization header
        options.headers.Authorization = `Bearer ${cachedToken}`;
        
        console.log(`Used cached/new token for ${user.email}`);
      } catch (error) {
        console.error('Error getting auth token:', error);
        throw error;
      }
    }
  }
  
  // Call the original fetch with the enhanced options
  return originalFetch(url, options);
};

console.log('Authenticated fetch interceptor installed with token caching');

/**
 * Base function to make authenticated API calls
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} data - Request body data
 * @returns {Promise} - Fetch promise
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  console.log(`Making ${method} request to ${endpoint}`);
  
  // Check if user is authenticated
  const user = auth.currentUser;
  
  if (!user) {
    
    // Return a promise that resolves when auth state changes
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe(); // Unsubscribe once we get a response
        
        if (user) {
          console.log('User authenticated:', user.email);
          // Now make the API call with the authenticated user
          makeAuthenticatedCall(endpoint, method, data, user)
            .then(resolve)
            .catch(reject);
        } else {
          console.error('No authenticated user after auth state change');
          reject(new Error('User not authenticated'));
        }
      });
      
      // Add timeout to prevent hanging
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Authentication timeout - no user detected'));
      }, 5000);
    });
  }
  
  // If we have a user, make the API call directly
  return makeAuthenticatedCall(endpoint, method, data, user);
}

/**
 * Helper function to make an API call with authentication
 */
async function makeAuthenticatedCall(endpoint, method, data, user) {
  try {
    // Check if we have a valid cached token
    const now = Date.now();
    if (!cachedToken || !tokenExpiration || now >= tokenExpiration - TOKEN_BUFFER) {
      console.log('Getting ID token for user:', user.email);
      // Get a new token, but DO NOT force refresh
      cachedToken = await user.getIdToken(false);
      
      // Calculate expiration from token
      const tokenParts = cachedToken.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          tokenExpiration = payload.exp * 1000; // Convert to milliseconds
        } catch (e) {
          // Fallback if we can't parse the token
          tokenExpiration = now + 55 * 60 * 1000; // 55 minutes
        }
      } else {
        tokenExpiration = now + 55 * 60 * 1000; // 55 minutes fallback
      }
      console.log('New token obtained, expires in', 
        Math.floor((tokenExpiration - now) / 60000), 'minutes');
    } else {
      console.log('Using cached token, expires in', 
        Math.floor((tokenExpiration - now) / 60000), 'minutes');
    }
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cachedToken}`
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    // Use the dynamic API URL
    console.log(`Sending request to ${API_URL}${endpoint}...`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API request failed:', response.status, errorData);
      throw new Error(errorData.message || `API call failed with status ${response.status}`);
    }
    
    console.log('Request successful');
    return response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Helper function for exponential backoff retry
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries || !(error.message && error.message.includes("quota"))) {
        throw error; // Don't retry if max retries reached or not quota error
      }
      
      const delay = initialDelay * Math.pow(2, retries);
      console.log(`Quota error, retrying after ${delay}ms (retry ${retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
}

// Circuit breaker pattern
let isCircuitBroken = false;
let circuitResetTimeout = null;

async function safeApiCall(fn) {
  if (isCircuitBroken) {
    throw new Error("Circuit breaker is open due to recent quota issues. Try again later.");
  }
  
  try {
    return await fn();
  } catch (error) {
    if (error.message && error.message.includes("quota")) {
      // Open the circuit breaker
      isCircuitBroken = true;
      
      // Reset after 1 minute
      clearTimeout(circuitResetTimeout);
      circuitResetTimeout = setTimeout(() => {
        isCircuitBroken = false;
      }, 60000);
      
      throw new Error("Rate limit exceeded. Please wait a minute before trying again.");
    }
    throw error;
  }
}

// Create convenience methods for common API operations
export const authApi = {
  get: (endpoint) => retryWithBackoff(() => safeApiCall(() => apiCall(endpoint, 'GET'))),
  post: (endpoint, data) => retryWithBackoff(() => safeApiCall(() => apiCall(endpoint, 'POST', data))),
  put: (endpoint, data) => retryWithBackoff(() => safeApiCall(() => apiCall(endpoint, 'PUT', data))),
  delete: (endpoint) => retryWithBackoff(() => safeApiCall(() => apiCall(endpoint, 'DELETE')))
};