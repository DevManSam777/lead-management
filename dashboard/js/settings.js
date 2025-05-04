import { formatDate } from './utils.js';
import { authApi } from './authApi.js';

document.addEventListener("DOMContentLoaded", function () {
  // API URL Configuration (same base URL as in dashboard.js)
  // const API_URL = "http://localhost:5000/api";
  const API_URL = "https://lead-management-8u3l.onrender.com/api"
  const SETTINGS_API_URL = `${API_URL}/settings`;
  
  // Global settings cache
  let globalSettings = {};
  
  // Get theme segment buttons
  const themeSegments = document.querySelectorAll('.theme-segment');
  
  // Get date format segment buttons
  const dateFormatSegments = document.querySelectorAll('.date-format-segment');
  
  // Get date format example element
  const dateFormatExample = document.getElementById('dateFormatExample');
  
  
  /* Fetch all settings
  * @returns {Promise<Object>} 
  */
 async function fetchAllSettings() {
   try {
     console.log("Fetching all settings...");
     
     // Use authApi instead of direct fetch
     const settings = await authApi.get('/settings');
     console.log("Settings fetched successfully:", settings);
     return settings;
   } catch (error) {
     console.error("Error fetching settings:", error);
     
     // Fallback to localStorage if API fails
     console.log("Using localStorage fallback due to API error");
     return {
       theme:
         localStorage.getItem("theme") ||
         (window.matchMedia("(prefers-color-scheme: dark)").matches
           ? "dark"
           : "light"),
     };
   }
 }
 
 /**
  * Update a specific setting
  * @param {string} key
  * @param {*} value
  * @returns {Promise<Object>} 
  */
 async function updateSetting(key, value) {
   try {
     console.log(`Updating setting ${key} to ${value}...`);
     
     // Use authApi instead of direct fetch
     const updatedSetting = await authApi.put(`/settings/${key}`, { value });
     console.log(`Setting ${key} updated successfully:`, updatedSetting);
     
     // Also update localStorage as a fallback
     localStorage.setItem(key, value);
     
     return updatedSetting;
   } catch (error) {
     console.error("Error updating setting:", error);
     
     // Update localStorage as a fallback
     localStorage.setItem(key, value);
     
     return { key, value };
   }
 }
 

  // Function to apply theme to HTML element
  function setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
  }
  
  // Function to update active theme segment
  function updateActiveThemeSegment(theme) {
      themeSegments.forEach(segment => {
          if (segment.getAttribute('data-theme') === theme) {
              segment.classList.add('active');
          } else {
              segment.classList.remove('active');
          }
      });
  }
  
  // Function to update active date format segment
  function updateActiveDateFormatSegment(format) {
      dateFormatSegments.forEach(segment => {
          if (segment.getAttribute('data-format') === format) {
              segment.classList.add('active');
          } else {
              segment.classList.remove('active');
          }
      });
      
      // Update the example display
      updateDateFormatExample(format);
  }
  
  // Function to update date format example
function updateDateFormatExample(format) {
    const today = new Date();
    // Ensure we're using the local time display, not UTC
    if (dateFormatExample) {
      dateFormatExample.textContent = formatDate(today, format);
    }
  }
  
  // Initialize settings on page load
  async function initializeSettings() {
      // Fetch all settings
      const settings = await fetchAllSettings();
      
      // Handle theme setting - if theme doesn't exist on server, set it from system preference
      let currentTheme = settings.theme;
      if (!currentTheme) {
          currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          // Save it to server
          await updateSetting('theme', currentTheme);
      }
      
      // Set the current theme
      setTheme(currentTheme);
      
      // Update active theme segment
      updateActiveThemeSegment(currentTheme);
      
      // Handle date format setting
      let currentDateFormat = settings.dateFormat;
      if (!currentDateFormat) {
          currentDateFormat = "MM/DD/YYYY"; // Default format
          // Save it to server
          await updateSetting('dateFormat', currentDateFormat);
      }
      
      // Update active date format segment
      updateActiveDateFormatSegment(currentDateFormat);
  }
  
  // Initialize settings
  initializeSettings();
  
  // Add event listeners to theme segments
  themeSegments.forEach(segment => {
      segment.addEventListener('click', function() {
          const newTheme = this.getAttribute('data-theme');
          setTheme(newTheme);
          updateSetting('theme', newTheme);
          updateActiveThemeSegment(newTheme);
      });
  });
  
  // Add event listeners to date format segments
  dateFormatSegments.forEach(segment => {
      segment.addEventListener('click', function() {
          const newFormat = this.getAttribute('data-format');
          updateSetting('dateFormat', newFormat);
          updateActiveDateFormatSegment(newFormat);
      });
  });
  

function setupSidebarToggle() {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    
    if (!sidebar || !mainContent) {
      console.error("Sidebar or main content not found");
      return;
    }
  
    // First, hide the sidebar to prevent flicker
    // Store original transition for later restoration
    const originalSidebarTransition = sidebar.style.transition;
    const originalMainContentTransition = mainContent.style.transition;
    
    // Temporarily disable transitions
    sidebar.style.transition = 'none';
    mainContent.style.transition = 'none';
    
    // Set initial state based on localStorage preference
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isSidebarCollapsed) {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    } else {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('expanded');
    }
    
    // Force DOM reflow to apply changes before transitions are re-enabled
    // This prevents the browser from batching the class changes and transition changes
    void sidebar.offsetWidth;
    
    // Remove any existing toggle button to avoid duplicates
    const existingButton = document.querySelector(".sidebar-toggle");
    if (existingButton) {
      existingButton.remove();
    }
  
    // Create new toggle button with both icons
    const toggleButton = document.createElement("button");
    toggleButton.className = "sidebar-toggle";
    toggleButton.setAttribute("aria-label", "Toggle Sidebar");
  
    // Include both icons - CSS will handle which one is visible
    toggleButton.innerHTML =
      '<i class="fas fa-angles-left"></i><i class="fas fa-angles-right"></i>';
  
    // Add the button to the sidebar
    sidebar.appendChild(toggleButton);
  
    // Add click event to toggle button
    toggleButton.addEventListener("click", function () {
      // Toggle sidebar classes
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("expanded");
  
      // Store user preference
      localStorage.setItem(
        "sidebarCollapsed",
        sidebar.classList.contains("collapsed")
      );
    });
  }
  
  // Ensure this function runs as early as possible
  if (document.readyState === 'loading') {
    // If document hasn't finished loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', setupSidebarToggle);
  } else {
    // If document is already loaded, run immediately
    setupSidebarToggle();
  }
});

// Theme segment event listeners
themeSegments.forEach(segment => {
  segment.addEventListener('click', function() {
      const newTheme = this.getAttribute('data-theme');
      
      // Apply theme immediately
      setTheme(newTheme);
      
      // Save to server
      updateSetting('theme', newTheme);
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Update active segment
      updateActiveThemeSegment(newTheme);
      
      // Dispatch event to notify other parts of the app
      window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: { key: 'theme', value: newTheme }
      }));
  });
});