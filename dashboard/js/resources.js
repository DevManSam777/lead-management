document.addEventListener("DOMContentLoaded", function () {
    // Setup sidebar toggle
    setupSidebarToggle();
  });
  
  /**
   * Set up the sidebar toggle functionality
   */
  function setupSidebarToggle() {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    
    if (!sidebar || !mainContent) {
      console.error("Sidebar or main content not found");
      return;
    }
  
    // hide the sidebar to prevent flicker
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