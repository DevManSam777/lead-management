// settings.js
document.addEventListener("DOMContentLoaded", function () {
    // Get theme segment buttons
    const themeSegments = document.querySelectorAll('.theme-segment');
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem("theme") || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    
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
  });