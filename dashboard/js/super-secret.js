// super-secret.js
// Additional utility functions for enhanced user experience
// Core functionality extensions

(function () {
  "use strict";

  let clickCount = 0;
  let clickTimer = null;
  let pizzaMode = false;
  let pizzaRainTimer = null;
  let flashTimer = null;
  let pizzaElements = [];

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPizzaEasterEgg);
  } else {
    initPizzaEasterEgg();
  }

  function initPizzaEasterEgg() {
    // Check if pizza mode was previously activated
    if (localStorage.getItem("pizzaModeActive") === "true") {
      applyPizzaBackground();
      applyPizzaTextStyling();
      applyPizzaCardBackgrounds();
      showExitButton();
    }

    // Find the header element (h2 with "Project Dashboard" or similar)
    const header = document.querySelector("h2");

    if (!header) {
      console.log("No h2 header found");
      return;
    }

    // Add click and touch event listeners to header
    header.addEventListener("click", handleHeaderClick);
    header.addEventListener("touchend", handleHeaderTouch);
  }

  function handleHeaderClick() {
    incrementClickCount();
  }

  function handleHeaderTouch(e) {
    // Prevent the touch from also triggering a click event
    e.preventDefault();
    incrementClickCount();
  }

  function incrementClickCount() {
    clickCount++;

    // Clear existing timer
    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    // Reset counter after 3 seconds
    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 3000);

    // Check if we've reached 7 clicks
    if (clickCount >= 7) {
      clickCount = 0;
      clearTimeout(clickTimer);
      activatePizzaMode();
    }
  }

  function activatePizzaMode() {
    if (pizzaMode) return; // Already active

    pizzaMode = true;

    // Apply pizza background
    applyPizzaBackground();

    // Apply text styling changes
    applyPizzaTextStyling();

    // Apply card backgrounds
    applyPizzaCardBackgrounds();

    // Start pizza rain for 5 seconds
    startPizzaRain();

    // Start flashing "Pizza Gang!" text
    startFlashingText();

    // Show exit button after pizza rain ends
    setTimeout(() => {
      showExitButton();
    }, 5000);

    console.log("🍕 PIZZA MODE ACTIVATED! 🍕");
  }

  function applyPizzaBackground() {
    // Create pizza background overlay for main background
    const pizzaOverlay = document.createElement("div");
    pizzaOverlay.id = "pizza-background-overlay";
    pizzaOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-image: url('/dashboard/assets/pizza_bg.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        `;

    document.body.appendChild(pizzaOverlay);

    // Fade in the pizza background
    setTimeout(() => {
      pizzaOverlay.style.opacity = "1";
    }, 100);

    // Store in localStorage so other pages can access it
    localStorage.setItem("pizzaModeActive", "true");
  }

  function applyPizzaTextStyling() {
    // Store the current theme for restoration later
    window.originalTheme = document.documentElement.getAttribute('data-theme');
    
    // Force dark theme for pizza mode
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Create style element for pizza-specific overrides
    const pizzaTextStyles = document.createElement("style");
    pizzaTextStyles.id = "pizza-text-styles";
    pizzaTextStyles.textContent = `
            .pizza-mode h2,
            .pizza-mode .header h2 {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8) !important;
            }
            
            .pizza-mode details summary h3,
            .pizza-mode summary h3 {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8) !important;
            }
            
            /* Chart text styling for pizza mode */
            .pizza-mode .chart-card h3,
            .pizza-mode .chart-container h3,
            .pizza-mode .chart-card .chart-container h3 {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8) !important;
            }
            
            /* Stats card text styling for pizza mode */
            .pizza-mode .stats-card h3,
            .pizza-mode .stats-card .value,
            .pizza-mode .stats-card .change,
            .pizza-mode .stats-card .change span,
            .pizza-mode .stats-card *,
            .pizza-mode .chart-card *,
            .pizza-mode .chart-container *,
            .pizza-mode .chart-card text,
            .pizza-mode .chart-card tspan {
                color: white !important;
                fill: white !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
            }
            
            /* Force all chart text elements to be white */
            .pizza-mode .chart-container svg text,
            .pizza-mode .chart-container svg tspan,
            .pizza-mode .chart-card svg text,
            .pizza-mode .chart-card svg tspan {
                fill: white !important;
                color: white !important;
            }
            
            /* Chart.js specific text styling */
            .pizza-mode .chart-container canvas {
                filter: brightness(1.2) contrast(1.1);
            }
            
            /* Force chart center text to be white and visible - AGGRESSIVE */
            .pizza-mode .chart-container canvas + div,
            .pizza-mode .chart-card canvas + div,
            .pizza-mode canvas + div {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.9) !important;
            }
            
            /* Override any chart center text styling */
            .pizza-mode .chart-container *[style*="color"],
            .pizza-mode .chart-card *[style*="color"] {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.9) !important;
            }
        `;

    document.head.appendChild(pizzaTextStyles);

    // Add pizza-mode class to body
    document.body.classList.add("pizza-mode");

    // Force chart rebuild with dark theme
    if (window.updateAllCharts) {
      setTimeout(() => {
        window.updateAllCharts();
      }, 500);
    }

    // Override the getThemeColors function for charts to ensure white text
    if (window.getThemeColors) {
      window.originalGetThemeColors = window.getThemeColors;
      window.getThemeColors = function() {
        const colors = window.originalGetThemeColors();
        // Force white text in pizza mode
        return {
          ...colors,
          textColor: "#ffffff",
          textMuted: "#ffffff"
        };
      };
    }

    // Additional chart text override with interval for consistency
    window.pizzaModeChartOverride = function() {
      if (window.Chart && window.Chart.instances) {
        Object.values(window.Chart.instances).forEach(chart => {
          if (chart && chart.options) {
            // Update legend colors
            if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
              chart.options.plugins.legend.labels.color = '#ffffff';
            }
            // Update tooltip colors  
            if (chart.options.plugins && chart.options.plugins.tooltip) {
              chart.options.plugins.tooltip.titleColor = '#ffffff';
              chart.options.plugins.tooltip.bodyColor = '#ffffff';
            }
            // Update scale colors
            if (chart.options.scales) {
              Object.keys(chart.options.scales).forEach(scaleKey => {
                if (chart.options.scales[scaleKey].ticks) {
                  chart.options.scales[scaleKey].ticks.color = '#ffffff';
                }
              });
            }
            chart.update();
          }
        });
      }

      // AGGRESSIVE center text override - find and force white
      const chartContainers = document.querySelectorAll('.pizza-mode .chart-container, .pizza-mode .chart-card');
      chartContainers.forEach(container => {
        const canvas = container.querySelector('canvas');
        if (canvas) {
          // Override the canvas drawing context
          const ctx = canvas.getContext('2d');
          if (ctx && !canvas._pizzaOverridden) {
            canvas._pizzaOverridden = true;
            
            // Store original fillText
            const originalFillText = ctx.fillText;
            
            // Override fillText to force white color
            ctx.fillText = function(text, x, y, maxWidth) {
              // Save current state
              const originalStyle = this.fillStyle;
              const originalShadowColor = this.shadowColor;
              const originalShadowBlur = this.shadowBlur;
              const originalShadowOffsetX = this.shadowOffsetX;
              const originalShadowOffsetY = this.shadowOffsetY;
              
              // Force white with shadow
              this.fillStyle = '#ffffff';
              this.shadowColor = 'rgba(0,0,0,0.8)';
              this.shadowBlur = 3;
              this.shadowOffsetX = 2;
              this.shadowOffsetY = 2;
              
              // Call original function
              const result = originalFillText.call(this, text, x, y, maxWidth);
              
              // Restore original state
              this.fillStyle = originalStyle;
              this.shadowColor = originalShadowColor;
              this.shadowBlur = originalShadowBlur;
              this.shadowOffsetX = originalShadowOffsetX;
              this.shadowOffsetY = originalShadowOffsetY;
              
              return result;
            };
          }
        }
      });
    };

    // Set up interval to continuously ensure white chart text
    window.pizzaModeInterval = setInterval(window.pizzaModeChartOverride, 300);

    // Run initial chart override
    setTimeout(window.pizzaModeChartOverride, 1000);
  }

  function applyPizzaCardBackgrounds() {
    // Create style element for pizza card backgrounds
    const pizzaCardStyles = document.createElement("style");
    pizzaCardStyles.id = "pizza-card-styles";
    pizzaCardStyles.textContent = `
            .pizza-mode .leads-container,
            .pizza-mode .hitlists-container,
            .pizza-mode .forms-container .forms-category,
            .pizza-mode .resource-card,
            .pizza-mode .settings-container,
            .pizza-mode .stats-cards .stats-card,
            .pizza-mode .charts-cards .chart-card {
                position: relative;
                overflow: hidden;
            }
            
            .pizza-mode .leads-container::before,
            .pizza-mode .hitlists-container::before,
            .pizza-mode .forms-container .forms-category::before,
            .pizza-mode .resource-card::before,
            .pizza-mode .settings-container::before,
            .pizza-mode .stats-cards .stats-card::before,
            .pizza-mode .charts-cards .chart-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/dashboard/assets/pizza_bg.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.4;
                z-index: 0;
                pointer-events: none;
            }
            
            /* Keep main containers and stats/charts with dark backgrounds */
            .pizza-mode .leads-container,
            .pizza-mode .hitlists-container,
            .pizza-mode .forms-container .forms-category,
            .pizza-mode .resource-card,
            .pizza-mode .settings-container,
            .pizza-mode .stats-cards .stats-card,
            .pizza-mode .charts-cards .chart-card {
                background-color: rgba(0, 0, 0, 0.9) !important;
            }
            
            /* Make header and pagination transparent to show main pizza background */
            .pizza-mode .header,
            .pizza-mode .pagination {
                background-color: transparent !important;
            }
            
            /* Make pagination text white for better readability - comprehensive coverage */
            .pizza-mode .pagination,
            .pizza-mode .pagination *,
            .pizza-mode .pagination button,
            .pizza-mode .pagination select,
            .pizza-mode .pagination option,
            .pizza-mode .pagination-controls,
            .pizza-mode .pagination-controls *,
            .pizza-mode .pagination-info,
            .pizza-mode .pagination-info *,
            .pizza-mode .forms-container .pagination,
            .pizza-mode .forms-container .pagination *,
            .pizza-mode .hitlists-container .pagination,
            .pizza-mode .hitlists-container .pagination *,
            .pizza-mode .pagination .btn,
            .pizza-mode .pagination button[class*="btn"],
            .pizza-mode .pagination .page-btn,
            .pizza-mode .pagination .page-link,
            .pizza-mode .pagination .page-item,
            .pizza-mode .pagination .page-item *,
            .pizza-mode .pagination [class*="page-"],
            .pizza-mode .pagination [class*="page-"] * {
                color: white !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
            }
            
            /* ONLY individual cards get semi-transparent backgrounds - more opaque for accessibility */
            .pizza-mode .hitlist-card,
            .pizza-mode .lead-card,
            .pizza-mode .template-card,
            .pizza-mode .business-item {
                background-color: rgba(255, 255, 255, 0.8) !important;
                position: relative;
                overflow: visible;
            }
            
            /* Remove pizza background from individual cards */
            .pizza-mode .hitlist-card::before,
            .pizza-mode .lead-card::before,
            .pizza-mode .template-card::before,
            .pizza-mode .business-item::before {
                display: none !important;
            }
            
            [data-theme="dark"] .pizza-mode .hitlist-card,
            [data-theme="dark"] .pizza-mode .lead-card,
            [data-theme="dark"] .pizza-mode .template-card,
            [data-theme="dark"] .pizza-mode .business-item {
                background-color: rgba(45, 50, 56, 0.8) !important;
            }
            
            /* Remove special hover backgrounds - keep normal hover states */
            .pizza-mode .hitlist-card:hover,
            .pizza-mode .lead-card:hover,
            .pizza-mode .template-card:hover,
            .pizza-mode .business-item:hover {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }
            
            [data-theme="dark"] .pizza-mode .hitlist-card:hover,
            [data-theme="dark"] .pizza-mode .lead-card:hover,
            [data-theme="dark"] .pizza-mode .template-card:hover,
            [data-theme="dark"] .pizza-mode .business-item:hover {
                background-color: rgba(45, 50, 56, 0.8) !important;
            }
            
            /* Better text readability for light mode on resources and settings - NO BUTTONS */
            .pizza-mode .resource-card h3,
            .pizza-mode .resource-card h4,
            .pizza-mode .resource-card p,
            .pizza-mode .settings-container h3,
            .pizza-mode .settings-container label:not(.theme-segment):not(.date-format-segment) {
                color: white !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
            }
            
            /* Dark theme - keep main containers dark */
            [data-theme="dark"] .pizza-mode .leads-container,
            [data-theme="dark"] .pizza-mode .hitlists-container,
            [data-theme="dark"] .pizza-mode .forms-container .forms-category,
            [data-theme="dark"] .pizza-mode .resource-card,
            [data-theme="dark"] .pizza-mode .settings-container,
            [data-theme="dark"] .pizza-mode .stats-cards .stats-card,
            [data-theme="dark"] .pizza-mode .charts-cards .chart-card {
                background-color: rgba(0, 0, 0, 0.9) !important;
            }
            
            /* Ensure content stays above the pizza background */
            .pizza-mode .leads-container > *,
            .pizza-mode .hitlists-container > *,
            .pizza-mode .forms-container .forms-category > *,
            .pizza-mode .resource-card > *,
            .pizza-mode .settings-container > *,
            .pizza-mode .stats-cards .stats-card > *,
            .pizza-mode .charts-cards .chart-card > * {
                position: relative;
                z-index: 1;
            }
            
            /* Special handling for forms category cards */
            .pizza-mode .template-card {
                position: relative;
                overflow: hidden;
            }
            
            .pizza-mode .template-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/dashboard/assets/pizza_bg.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.1;
                z-index: -1;
                pointer-events: none;
            }
            
            /* Special handling for hitlist cards */
            .pizza-mode .hitlist-card {
                position: relative;
                overflow: hidden;
            }
            
            .pizza-mode .hitlist-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/dashboard/assets/pizza_bg.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.1;
                z-index: -1;
                pointer-events: none;
            }
            
            /* Special handling for lead cards */
            .pizza-mode .lead-card {
                position: relative;
                overflow: hidden;
            }
            
            .pizza-mode .lead-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/dashboard/assets/pizza_bg.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.08;
                z-index: -1;
                pointer-events: none;
            }
        `;

    document.head.appendChild(pizzaCardStyles);
  }

  function startPizzaRain() {
    const pizzaContainer = document.createElement("div");
    pizzaContainer.id = "pizza-rain-container";
    pizzaContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;

    document.body.appendChild(pizzaContainer);

    // Create pizza emojis continuously for 5 seconds
    const rainInterval = setInterval(() => {
      createPizzaEmoji(pizzaContainer);
      createConfetti(pizzaContainer);
    }, 150); // Create new pizza every 150ms

    // Stop creating new pizzas after 5 seconds
    setTimeout(() => {
      clearInterval(rainInterval);

      // Remove remaining pizzas after animation completes
      setTimeout(() => {
        if (pizzaContainer.parentNode) {
          pizzaContainer.remove();
        }
        pizzaElements = [];
      }, 3000);
    }, 5000);
  }

  function createPizzaEmoji(container) {
    const pizza = document.createElement("div");
    pizza.textContent = "🍕";
    pizza.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 30 + 50}px;
            left: ${Math.random() * 100}%;
            top: -50px;
            animation: pizzaFall ${Math.random() * 3 + 4}s linear forwards;
            z-index: 10000;
            pointer-events: none;
            transform: rotate(${Math.random() * 360}deg);
        `;

    container.appendChild(pizza);
    pizzaElements.push(pizza);

    // Remove pizza element after animation
    setTimeout(() => {
      if (pizza.parentNode) {
        pizza.remove();
      }
    }, 7000);
  }

  function createConfetti(container) {
    const confettiColors = ["🤩", "🥳", "⭐", "🎊", "🎉"];
    const confetti = document.createElement("div");
    confetti.textContent =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 15 + 50}px;
            left: ${Math.random() * 100}%;
            top: -50px;
            animation: confettiFall ${Math.random() * 2 + 3}s linear forwards;
            z-index: 10000;
            pointer-events: none;
            transform: rotate(${Math.random() * 360}deg);
        `;

    container.appendChild(confetti);
    pizzaElements.push(confetti);

    // Remove confetti element after animation
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.remove();
      }
    }, 5000);
  }

  function startFlashingText() {
    // Import Bagel Fat One font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Create flashing text element
    const flashText = document.createElement("div");
    flashText.id = "pizza-gang-text";
    flashText.textContent = "Pizza Gang!";
    flashText.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            font-weight: bold;
            font-family: 'Bagel Fat One', 'Comic Sans MS', cursive, sans-serif;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
            z-index: 10001;
            pointer-events: none;
            animation: pizzaFlash 0.5s infinite alternate;
        `;

    document.body.appendChild(flashText);

    // Remove flashing text after 5 seconds
    setTimeout(() => {
      if (flashText.parentNode) {
        flashText.remove();
      }
    }, 5000);
  }

  function showExitButton() {
    const exitButton = document.createElement("button");
    exitButton.id = "pizza-exit-button";
    exitButton.textContent = "Exit Pizza Mode";
    exitButton.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(45deg, #8b5cf6, #ec4899);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10002;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            animation: pizzaBounce 2s infinite;
        `;

    exitButton.addEventListener("click", exitPizzaMode);
    exitButton.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.1)";
      this.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
      this.style.background = "linear-gradient(45deg, #7c3aed, #db2777)";
    });
    exitButton.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
      this.style.background = "linear-gradient(45deg, #8b5cf6, #ec4899)";
    });

    document.body.appendChild(exitButton);
  }

  function exitPizzaMode() {
    pizzaMode = false;

    // Remove from localStorage
    localStorage.removeItem("pizzaModeActive");

    // Remove pizza-mode class from body
    document.body.classList.remove("pizza-mode");

    // Remove pizza background
    const pizzaOverlay = document.getElementById("pizza-background-overlay");
    if (pizzaOverlay) {
      pizzaOverlay.style.opacity = "0";
      setTimeout(() => {
        if (pizzaOverlay.parentNode) {
          pizzaOverlay.remove();
        }
      }, 500);
    }

    // Remove pizza text styles
    const pizzaTextStyles = document.getElementById("pizza-text-styles");
    if (pizzaTextStyles) {
      pizzaTextStyles.remove();
    }

    // Restore original theme
    if (window.originalTheme) {
      document.documentElement.setAttribute('data-theme', window.originalTheme);
      delete window.originalTheme;
    }

    // Restore original getThemeColors function
    if (window.originalGetThemeColors) {
      window.getThemeColors = window.originalGetThemeColors;
      delete window.originalGetThemeColors;
    }

    // Clear the chart override interval
    if (window.pizzaModeInterval) {
      clearInterval(window.pizzaModeInterval);
      delete window.pizzaModeInterval;
    }

    // Clean up the chart override function
    if (window.pizzaModeChartOverride) {
      delete window.pizzaModeChartOverride;
    }

    // Remove pizza card styles
    const pizzaCardStyles = document.getElementById("pizza-card-styles");
    if (pizzaCardStyles) {
      pizzaCardStyles.remove();
    }

    // Remove exit button
    const exitButton = document.getElementById("pizza-exit-button");
    if (exitButton) {
      exitButton.remove();
    }

    // Clean up any remaining pizza elements
    pizzaElements.forEach((pizza) => {
      if (pizza.parentNode) {
        pizza.remove();
      }
    });
    pizzaElements = [];

    // Remove any remaining containers
    const rainContainer = document.getElementById("pizza-rain-container");
    if (rainContainer) {
      rainContainer.remove();
    }

    const gangText = document.getElementById("pizza-gang-text");
    if (gangText) {
      gangText.remove();
    }

    // Force chart rebuild to restore original colors
    if (window.updateAllCharts) {
      setTimeout(() => {
        window.updateAllCharts();
      }, 500);
    }

    console.log("Pizza mode deactivated 🍕➜🏠");
  }

  // Add CSS animations
  function addPizzaStyles() {
    if (document.getElementById("pizza-styles")) return;

    const style = document.createElement("style");
    style.id = "pizza-styles";
    style.textContent = `
            @keyframes pizzaFall {
                to {
                    transform: translateY(calc(100vh + 50px)) rotate(720deg);
                }
            }
            
            @keyframes confettiFall {
                to {
                    transform: translateY(calc(100vh + 50px)) rotate(1080deg);
                }
            }
            
            @keyframes pizzaFlash {
                0% { 
                    color: #ff6b6b; 
                    transform: translate(-50%, -50%) scale(1);
                }
                25% { 
                    color: #4ecdc4; 
                    transform: translate(-50%, -50%) scale(1.1);
                }
                50% { 
                    color: #45b7d1; 
                    transform: translate(-50%, -50%) scale(1);
                }
                75% { 
                    color: #f39c12; 
                    transform: translate(-50%, -50%) scale(1.1);
                }
                100% { 
                    color: #e74c3c; 
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            @keyframes pizzaBounce {
                0%, 100% { 
                    transform: translateY(0); 
                }
                50% { 
                    transform: translateY(-10px); 
                }
            }
        `;

    document.head.appendChild(style);
  }

  // Initialize styles
  addPizzaStyles();
})();