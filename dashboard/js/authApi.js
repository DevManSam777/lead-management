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
// const API_URL = "http://localhost:5000/api";
const API_URL = "https://lead-management-8u3l.onrender.com/api";

// Store the original fetch function
const originalFetch = window.fetch;

// Create an authenticated fetch function
window.fetch = async function(url, options = {}) {
  console.log(`Intercepted fetch to: ${url}`);
  
  // Only add auth headers for API calls to our backend
  if (url.includes('localhost:5000/api') || url.includes('/api/')) {
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
        
        // Get token
        const token = await user.getIdToken();
        
        // Create headers if they don't exist
        options.headers = options.headers || {};
        
        // Add authorization header
        options.headers.Authorization = `Bearer ${token}`;
        
        console.log(`Added auth token to request for ${user.email}`);
      } catch (error) {
        console.error('Error getting auth token:', error);
        throw error;
      }
    } else {
      // User is already authenticated, get the token
      try {
        const token = await user.getIdToken();
        
        // Create headers if they don't exist
        options.headers = options.headers || {};
        
        // Add authorization header
        options.headers.Authorization = `Bearer ${token}`;
        
        console.log(`Added auth token to request for ${user.email}`);
      } catch (error) {
        console.error('Error getting auth token:', error);
        throw error;
      }
    }
  }
  
  // Call the original fetch with the enhanced options
  return originalFetch(url, options);
};

console.log('Authenticated fetch interceptor installed');

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
    // Get the Firebase ID token
    console.log('Getting ID token for user:', user.email);
    const token = await user.getIdToken(true);
    console.log('Got token successfully');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
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

// Create convenience methods for common API operations
export const authApi = {
  get: (endpoint) => apiCall(endpoint, 'GET'),
  post: (endpoint, data) => apiCall(endpoint, 'POST', data),
  put: (endpoint, data) => apiCall(endpoint, 'PUT', data),
  delete: (endpoint) => apiCall(endpoint, 'DELETE')
};