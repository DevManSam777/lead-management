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
            font-family: 'Comic Sans MS', cursive, sans-serif;
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
            background: linear-gradient(45deg, #ff6b6b, #ffa500);
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
    });
    exitButton.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
    });

    document.body.appendChild(exitButton);
  }

  function exitPizzaMode() {
    pizzaMode = false;

    // Remove from localStorage
    localStorage.removeItem("pizzaModeActive");

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
