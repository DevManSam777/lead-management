// settings.js
import { formatDate } from './utils.js';

document.addEventListener("DOMContentLoaded", function () {
  // API URL Configuration (same base URL as in dashboard.js)
  const API_URL = "http://localhost:5000/api";
  const SETTINGS_API_URL = `${API_URL}/settings`;
  
  // Global settings cache
  let globalSettings = {};
  
  // Get theme segment buttons
  const themeSegments = document.querySelectorAll('.theme-segment');
  
  // Get date format segment buttons
  const dateFormatSegments = document.querySelectorAll('.date-format-segment');
  
  // Get date format example element
  const dateFormatExample = document.getElementById('dateFormatExample');
  
  // Function to fetch all settings from the server
  async function fetchAllSettings() {
      try {
          const response = await fetch(SETTINGS_API_URL);
          
          if (!response.ok) {
              throw new Error("Failed to fetch settings");
          }
          
          const settings = await response.json();
          globalSettings = settings;
          
          // Return the settings
          return settings;
      } catch (error) {
          console.error("Error fetching settings:", error);
          
          // Fallback to localStorage if API fails
          return {
              theme: localStorage.getItem("theme") || 
                (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
              dateFormat: localStorage.getItem("dateFormat") || "MM/DD/YYYY"
          };
      }
  }
  
  // Function to update a setting on the server
  async function updateSetting(key, value) {
      try {
          const response = await fetch(`${SETTINGS_API_URL}/${key}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ value })
          });
          
          if (!response.ok) {
              throw new Error("Failed to update setting");
          }
          
          const updatedSetting = await response.json();
          globalSettings[key] = updatedSetting.value;
          
          // Also update localStorage as a fallback
          localStorage.setItem(key, value);
          
          // Dispatch an event to notify about setting change
          window.dispatchEvent(new CustomEvent('settingsUpdated', { 
            detail: { key, value } 
          }));
          
          return updatedSetting;
      } catch (error) {
          console.error("Error updating setting:", error);
          
          // Update localStorage as a fallback
          localStorage.setItem(key, value);
          
          // Still dispatch the event even if server update failed
          window.dispatchEvent(new CustomEvent('settingsUpdated', { 
            detail: { key, value } 
          }));
          
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
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Set initial state based on saved preference
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // Apply initial classes
    if (isSidebarCollapsed) {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    } else {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('expanded');
    }
    
    // Remove any existing toggle button to avoid duplicates
    const existingButton = document.querySelector('.sidebar-toggle');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Create new toggle button with both icons
    const toggleButton = document.createElement('button');
    toggleButton.className = 'sidebar-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle Sidebar');
    
    // Include both icons - CSS will handle which one is visible
    toggleButton.innerHTML = '<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i>';
    
    // Add the button to the sidebar
    sidebar.appendChild(toggleButton);
    
    // Add click event to toggle button
    toggleButton.addEventListener('click', function() {
      // Toggle sidebar classes
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
      
      // Store user preference
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
  }


  // Setup sidebar toggle after theme setup is complete
  setupSidebarToggle();
});