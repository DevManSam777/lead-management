// settings.js
document.addEventListener("DOMContentLoaded", function () {
  // API URL Configuration (same base URL as in dashboard.js)
  const API_URL = "http://localhost:5000/api";
  const SETTINGS_API_URL = `${API_URL}/settings`;
  
  // Global settings cache
  let globalSettings = {};
  
  // Get theme segment buttons
  const themeSegments = document.querySelectorAll('.theme-segment');
  
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
                (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
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
  
  // Function to update active segment
  function updateActiveSegment(theme) {
      themeSegments.forEach(segment => {
          if (segment.getAttribute('data-theme') === theme) {
              segment.classList.add('active');
          } else {
              segment.classList.remove('active');
          }
      });
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
      
      // Update active segment
      updateActiveSegment(currentTheme);
  }
  
  // Initialize settings
  initializeSettings();
  
  // Add event listeners to segments
  themeSegments.forEach(segment => {
      segment.addEventListener('click', function() {
          const newTheme = this.getAttribute('data-theme');
          setTheme(newTheme);
          updateSetting('theme', newTheme);
          updateActiveSegment(newTheme);
      });
  });
  
  // Sidebar toggle functionality
  function setupSidebarToggle() {
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      
      // Check if sidebar was previously collapsed
      const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      
      // Set initial state based on saved preference and screen size
      const isMobile = window.innerWidth <= 992;
      
      // On mobile: collapsed by default unless user expanded it
      // On desktop: expanded by default unless user collapsed it
      if ((isMobile && !localStorage.getItem('sidebarCollapsed') === 'false') || 
          (!isMobile && isSidebarCollapsed)) {
          sidebar.classList.add('collapsed');
          mainContent.classList.add('expanded');
      }
      
      // Create toggle button if it doesn't exist
      if (!document.querySelector('.sidebar-toggle')) {
          const toggleButton = document.createElement('button');
          toggleButton.className = 'sidebar-toggle';
          toggleButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
          toggleButton.setAttribute('aria-label', 'Toggle Sidebar');
          toggleButton.setAttribute('title', 'Toggle Sidebar');
          
          sidebar.appendChild(toggleButton);
          
          // Add click event to toggle button
          toggleButton.addEventListener('click', toggleSidebar);
      }
      
      // Function to toggle sidebar
      function toggleSidebar() {
          sidebar.classList.toggle('collapsed');
          mainContent.classList.toggle('expanded');
          
          // Save state to localStorage
          localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
          
          // In future, this could be saved to the server as well
          // updateSetting('sidebarCollapsed', sidebar.classList.contains('collapsed'));
      }
      
      // Listen for window resize to adjust sidebar on mobile/desktop transition
      window.addEventListener('resize', function() {
          const currentIsMobile = window.innerWidth <= 992;
          
          // Only act if we're crossing the breakpoint
          if (currentIsMobile !== isMobile) {
              // If transitioning to mobile and no user preference is saved, collapse the sidebar
              if (currentIsMobile && !localStorage.getItem('sidebarCollapsed')) {
                  sidebar.classList.add('collapsed');
                  mainContent.classList.add('expanded');
              }
          }
      });
  }
  
  // Setup sidebar toggle after theme setup is complete
  setupSidebarToggle();
});