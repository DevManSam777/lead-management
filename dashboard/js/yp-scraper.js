class YPScraperComponent extends HTMLElement {
  static get observedAttributes() {
    return ["src"];
  }

  constructor() {
    super();

    // create a shadow DOM
    this.attachShadow({ mode: "open" });

    // no default src, must be provided as an attribute
    //   this._src = '';

    // set up the internal structure
    this.render();

    // bind methods
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.updateButtonStyle = this.updateButtonStyle.bind(this);
  }

  // lifecycle, when the element is added to the DOM
  connectedCallback() {
    // check if src attribute is provided
    if (!this.hasAttribute("src")) {
      console.error(
        "Error: src attribute is required for yp-scraper component"
      );
    } else {
      this._src = this.getAttribute("src");
    }

    // add event listeners
    const button = this.shadowRoot.querySelector(".yp-button");
    const closeBtn = this.shadowRoot.querySelector(".close-modal");
    const modal = this.shadowRoot.querySelector(".modal");

    button.addEventListener("click", this.openModal);
    closeBtn.addEventListener("click", this.closeModal);
    modal.addEventListener("click", this.handleOutsideClick);

    // update styles based on theme
    this.updateStyles();

    // handle initial button style immediately
    this.updateButtonStyle();

    // watch for theme changes
    const observer = new MutationObserver(() => {
      this.updateStyles();
    });

    // observe the document element for attribute changes
    observer.observe(document.documentElement, { attributes: true });

    // handle window resize for responsive adjustments
    window.addEventListener("resize", this.updateButtonStyle);
  }

  // update button style based on screen width
  updateButtonStyle() {
    // we need to adjust the host element, not just the button
    // this allows the component to fit the layout properly
    if (window.innerWidth <= 992) {
      // on small screens - make component take full width
      this.style.cssText = "display: block; width: 100%; max-width: 100%;";
    } else {
      // on large screens - make component take only button width
      this.style.cssText =
        "display: inline-block; width: auto; max-width: fit-content;";
    }

    // then update the button inside
    const button = this.shadowRoot.querySelector(".yp-button");
    if (window.innerWidth <= 992) {
      button.style.cssText = "width: 100%; justify-content: center;";
    } else {
      button.style.cssText = "width: auto; justify-content: flex-start;";
    }
  }

  // lifecycle, when the element is removed from the DOM
  disconnectedCallback() {
    // remove event listeners to prevent memory leaks
    const button = this.shadowRoot.querySelector(".yp-button");
    const closeBtn = this.shadowRoot.querySelector(".close-modal");
    const modal = this.shadowRoot.querySelector(".modal");

    button.removeEventListener("click", this.openModal);
    closeBtn.removeEventListener("click", this.closeModal);
    modal.removeEventListener("click", this.handleOutsideClick);

    // remove window resize listener
    window.removeEventListener("resize", this.updateButtonStyle);
  }

  // lifecycle, when attributes change
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === "src" && newValue) {
      this._src = newValue;
    }
  }

  // get CSS variables from the main document
  updateStyles() {
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue("--primary") || "#4361ee";
    const secondary = styles.getPropertyValue("--secondary") || "#3f37c9";

    // update component styles
    const styleElement = this.shadowRoot.querySelector("#dynamic-styles");
    if (styleElement) {
      styleElement.textContent = `
          .yp-button {
            background-color: ${primary};
            color: #ffffff;
          }
          
          .yp-button:hover {
            background-color: ${secondary};
          }
        `;
    }

    // update button style for current screen size
    this.updateButtonStyle();
  }

  // render the component
  render() {
    // HTML template for the component
    this.shadowRoot.innerHTML = `
        <style>
          /* Import Nunito Sans font */
          @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200..1000;1,200..1000&display=swap');
          
          :host {
            display: inline-block;
            box-sizing: border-box;
          }
          
          /* Base font styles */
          * {
            font-family: "Nunito Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          }
          
          /* Button styling */
          .yp-button {
            border: none;
            border-radius: 0.5rem;
            padding: 1rem 1.5rem;
            font-size: 1.4rem;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: background-color 0.2s ease;
            box-sizing: border-box;
            font-family: "Nunito Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            font-weight: 500;
          }
          
          /* Search icon SVG */
          .search-icon {
            width: 1.3rem;
            height: 1.3rem;
            fill: white;
          }
          
          /* Modal styling */
          .modal {
            display: none;
            position: fixed;
            z-index: 999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.6);
          }
          
          .modal-content {
            background-color: var(--card-background, #2a2a2a);
            margin: 5% auto;
            padding: 2rem;
            width: 60%;
            height: 90%;
            border-radius: 0.8rem;
            display: flex;
            flex-direction: column;
            position: relative;
            font-family: "Nunito Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .close-modal {
            position: absolute;
            top: 10px;
            right: 20px;
            color: #6c757d;
            font-size: 2.8rem;
            font-weight: bold;
            cursor: pointer;
            z-index: 1010;
            line-height: 1;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: "Nunito Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .close-modal:hover {
            opacity: 1;
          }
          
          .iframe-container {
            flex: 1;
            position: relative;
            border-radius: 0.5rem;
            overflow: hidden;
            margin-top: 35px; /* Increased space below X button */
          }
          
          iframe {
            width: 100%;
            height: 100%;
            border: none;
            overflow: auto;
          }
          
   
          @media (max-width: 768px) {
            .modal-content {
              width: 95%;
              height: 95%;
              padding: 1.5rem;
            }
            
            .iframe-container {
              margin-top: 30px;
            }
          }

          @media (max-width: 576px) {
            .yp-button {
              font-size: 1.3rem;
            }
          }

          @media (max-width: 480px) {
            .modal-content {
              width: 90%;
              height: 90%;
              margin: 5% auto;
              border-radius: 0.8rem;
            }
            
            .close-modal {
              top: 8px;
              right: 15px;
            }
            
            .iframe-container {
              margin-top: 25px;
            }
          }
        </style>
        
        <style id="dynamic-styles">
          /* This will be updated with document CSS variables */
        </style>
        
        <button class="yp-button">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/>
          </svg>
          YP Scraper
        </button>
        
        <div class="modal">
          <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="iframe-container">
              <!-- Iframe is created dynamically when modal opens -->
            </div>
          </div>
        </div>
      `;
  }

  // open the modal
  openModal() {
    // check if src attribute is provided
    if (!this._src) {
      console.error(
        "Error: src attribute is required for yp-scraper component"
      );
      return;
    }

    const modal = this.shadowRoot.querySelector(".modal");
    modal.style.display = "block";

    // create iframe when the modal opens
    const container = this.shadowRoot.querySelector(".iframe-container");

    // clear any existing iframe
    container.innerHTML = "";

    // create a new iframe with the src from the attribute
    const iframe = document.createElement("iframe");
    iframe.src = this._src;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("allow", "clipboard-write");

    // make sure iframe allows scrolling
    iframe.style.overflow = "auto";

    // add the iframe to the container
    container.appendChild(iframe);
  }

  // close the modal
  closeModal() {
    const modal = this.shadowRoot.querySelector(".modal");
    modal.style.display = "none";

    // remove iframe when closing to free resources
    const container = this.shadowRoot.querySelector(".iframe-container");
    container.innerHTML = "";
  }

  // handle clicks outside the modal content
  handleOutsideClick(event) {
    if (event.target.classList.contains("modal")) {
      this.closeModal();
    }
  }
}

// register the component
customElements.define("yp-scraper", YPScraperComponent);
