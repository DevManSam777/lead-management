// settings.js
document.addEventListener("DOMContentLoaded", function () {
    // Get theme segment buttons
    const themeSegments = document.querySelectorAll('.theme-segment');
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem("theme") || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    
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
    
    // Set the current theme on page load
    setTheme(currentTheme);
    
    // Update active segment
    updateActiveSegment(currentTheme);
    
    // Add event listeners to segments
    themeSegments.forEach(segment => {
      segment.addEventListener('click', function() {
        const newTheme = this.getAttribute('data-theme');
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        updateActiveSegment(newTheme);
      });
    });
    
    // Sidebar toggle functionality - add this function below
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