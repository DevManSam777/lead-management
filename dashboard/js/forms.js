/**
 * Forms page JavaScript functionality
 */
document.addEventListener("DOMContentLoaded", function () {
    // Setup sidebar toggle
    setupSidebarToggle();
    
    // Setup template preview handlers
    setupTemplatePreviewHandlers();
    
    // Setup filters
    setupFilters();
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
      '<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i>';
  
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
  
  /**
   * Set up template preview modal handlers
   */
  function setupTemplatePreviewHandlers() {
    const templateModal = document.getElementById('templateModal');
    const closeModal = document.getElementById('closeModal');
    const previewButtons = document.querySelectorAll('.template-actions .btn-icon:first-child');
    
    if (!templateModal || !closeModal) {
      console.error('Template modal elements not found');
      return;
    }
    
    previewButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Get the template details to display in the modal
        const templateCard = this.closest('.template-card');
        const templateTitle = templateCard.querySelector('h4').textContent;
        
        // Update the modal title
        document.getElementById('modalTitle').textContent = templateTitle;
        
        // Display the modal
        templateModal.style.display = 'block';
        
        // For demo purposes, just show the modal
      });
    });
    
    // Close modal button
    closeModal.addEventListener('click', function() {
      templateModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === templateModal) {
        templateModal.style.display = 'none';
      }
    });
  }
  
  /**
   * Set up filtering functionality
   */
  function setupFilters() {
    const filterSelect = document.getElementById('filterCategory');
    const searchInput = document.getElementById('searchInput');
    
    if (!filterSelect || !searchInput) {
      console.error('Filter elements not found');
      return;
    }
    
    function applyFilters() {
      const filterValue = filterSelect.value.toLowerCase();
      const searchValue = searchInput.value.toLowerCase();
      
      document.querySelectorAll('.forms-category').forEach(category => {
        // If filter is set and doesn't match the category, hide it
        if (filterValue && !category.querySelector('h3').textContent.toLowerCase().includes(filterValue)) {
          category.style.display = 'none';
          return;
        }
        
        // Show the category
        category.style.display = 'block';
        
        // Filter templates within the category
        const templates = category.querySelectorAll('.template-card');
        let visibleCount = 0;
        
        templates.forEach(template => {
          const title = template.querySelector('h4').textContent.toLowerCase();
          const desc = template.querySelector('p').textContent.toLowerCase();
          
          if (searchValue && !title.includes(searchValue) && !desc.includes(searchValue)) {
            template.style.display = 'none';
          } else {
            template.style.display = 'flex';
            visibleCount++;
          }
        });
        
        // If no templates visible in this category, hide the category
        if (visibleCount === 0) {
          category.style.display = 'none';
        }
      });
    }
    
    filterSelect.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
  }