(function () {
  'use strict';

  const THEMES = ['lcars', 'holo', 'cyber'];

  /**
   * Detects the current theme from body classes
   */
  function getCurrentTheme() {
    const body = document.body;
    for (const theme of THEMES) {
      if (body.classList.contains(`theme-${theme}`)) {
        return theme;
      }
    }
    return 'lcars'; // default
  }

  /**
   * Checks if user prefers reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Finds the LICENSE section/card in the DOM
   * Priority:
   * 1. Look for dedicated container: #license, .license, [data-section="license"]
   * 2. Search for <a> tags with LICENSE/LICENCE in href or textContent
   */
  function findLicenseElement() {
    // Try dedicated containers first
    const dedicatedSelectors = ['#license', '.license', '[data-section="license"]'];
    for (const selector of dedicatedSelectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }

    // Search all anchor tags
    const links = Array.from(document.querySelectorAll('a'));
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const text = link.textContent || '';
      
      // Check if href ends with LICENSE/LICENCE (optionally .txt)
      if (/licen[cs]e(\.txt)?$/i.test(href)) {
        // Return the closest card or section container
        return link.closest('.card') || link.closest('section') || link;
      }
      
      // Check if text content matches license pattern
      if (/licen[cs]e/i.test(text)) {
        return link.closest('.card') || link.closest('section') || link;
      }
    }

    return null;
  }

  /**
   * Creates the holographic panel HTML based on theme
   */
  function createHolographicPanel(theme) {
    const panel = document.createElement('div');
    panel.className = 'holographic-panel';
    panel.setAttribute('data-theme', theme);
    panel.setAttribute('aria-label', 'Holographic display panel');
    
    const reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      panel.setAttribute('data-reduced-motion', 'true');
    }

    let content = '';
    
    if (theme === 'lcars') {
      // LCARS: Subspace telemetry radar sweep
      content = `
        <div class="holo-content holo-lcars">
          <svg class="holo-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lcars-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#ff9a00;stop-opacity:0.2" />
                <stop offset="100%" style="stop-color:#ff9a00;stop-opacity:0.8" />
              </linearGradient>
            </defs>
            <!-- Concentric circles -->
            <circle cx="150" cy="150" r="120" fill="none" stroke="#ff9a00" stroke-width="1" opacity="0.3" />
            <circle cx="150" cy="150" r="90" fill="none" stroke="#ff9a00" stroke-width="1" opacity="0.4" />
            <circle cx="150" cy="150" r="60" fill="none" stroke="#ff9a00" stroke-width="1.5" opacity="0.5" />
            <circle cx="150" cy="150" r="30" fill="none" stroke="#ffa000" stroke-width="2" opacity="0.6" />
            <!-- Center dot -->
            <circle cx="150" cy="150" r="4" fill="#ffa000" opacity="0.8" />
            <!-- Sweep line -->
            <line class="radar-sweep" x1="150" y1="150" x2="150" y2="30" stroke="url(#lcars-grad)" stroke-width="2" opacity="0.9" />
            <!-- Target blips -->
            <circle class="blip blip-1" cx="200" cy="100" r="3" fill="#c25093" />
            <circle class="blip blip-2" cx="120" cy="180" r="3" fill="#c25093" />
            <circle class="blip blip-3" cx="180" cy="160" r="3" fill="#ffa000" />
          </svg>
          <div class="holo-label">SUBSPACE TELEMETRY</div>
        </div>
      `;
    } else if (theme === 'holo') {
      // Star Wars: Holonet rings (3D-ish)
      content = `
        <div class="holo-content holo-starwars">
          <svg class="holo-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="holo-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#2ee6ff;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#2ee6ff;stop-opacity:0.2" />
              </linearGradient>
              <linearGradient id="holo-grad-2" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" style="stop-color:#90f0ff;stop-opacity:0.6" />
                <stop offset="100%" style="stop-color:#90f0ff;stop-opacity:0.1" />
              </linearGradient>
            </defs>
            <!-- Base projector -->
            <ellipse cx="150" cy="260" rx="40" ry="8" fill="#2ee6ff" opacity="0.3" />
            <!-- Hovering rings with 3D perspective -->
            <ellipse class="holo-ring ring-1" cx="150" cy="150" rx="100" ry="25" fill="none" stroke="url(#holo-grad-1)" stroke-width="2" />
            <ellipse class="holo-ring ring-2" cx="150" cy="140" rx="75" ry="18" fill="none" stroke="url(#holo-grad-1)" stroke-width="1.5" />
            <ellipse class="holo-ring ring-3" cx="150" cy="130" rx="50" ry="12" fill="none" stroke="url(#holo-grad-2)" stroke-width="1" />
            <!-- Inner glow -->
            <circle cx="150" cy="120" r="15" fill="#2ee6ff" opacity="0.2" />
          </svg>
          <div class="holo-label">HOLONET TRANSMISSION</div>
        </div>
      `;
    } else if (theme === 'cyber') {
      // Cyberpunk: Neon glitch with grid scan
      content = `
        <div class="holo-content holo-cyber">
          <svg class="holo-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#ff2ec0;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#25f3ff;stop-opacity:0.8" />
              </linearGradient>
            </defs>
            <!-- Grid lines -->
            <g class="grid-lines" stroke="#ff2ec0" stroke-width="0.5" opacity="0.4">
              <line x1="0" y1="50" x2="300" y2="50" />
              <line x1="0" y1="100" x2="300" y2="100" />
              <line x1="0" y1="150" x2="300" y2="150" />
              <line x1="0" y1="200" x2="300" y2="200" />
              <line x1="0" y1="250" x2="300" y2="250" />
              <line x1="50" y1="0" x2="50" y2="300" />
              <line x1="100" y1="0" x2="100" y2="300" />
              <line x1="150" y1="0" x2="150" y2="300" />
              <line x1="200" y1="0" x2="200" y2="300" />
              <line x1="250" y1="0" x2="250" y2="300" />
            </g>
            <!-- Scan line -->
            <rect class="scan-line" x="0" y="0" width="300" height="4" fill="url(#cyber-grad)" opacity="0.9" />
            <!-- Corner brackets -->
            <path d="M 20 20 L 20 50 M 20 20 L 50 20" stroke="#25f3ff" stroke-width="2" fill="none" />
            <path d="M 280 20 L 280 50 M 280 20 L 250 20" stroke="#25f3ff" stroke-width="2" fill="none" />
            <path d="M 20 280 L 20 250 M 20 280 L 50 280" stroke="#ff2ec0" stroke-width="2" fill="none" />
            <path d="M 280 280 L 280 250 M 280 280 L 250 280" stroke="#ff2ec0" stroke-width="2" fill="none" />
          </svg>
          <div class="holo-label" data-glitch="NEURAL LINK ACTIVE">NEURAL LINK ACTIVE</div>
        </div>
      `;
    }

    panel.innerHTML = content;
    return panel;
  }

  /**
   * Inserts the holographic panel after the LICENSE element
   */
  function insertHolographicPanel() {
    const theme = getCurrentTheme();
    const licenseElement = findLicenseElement();
    
    if (!licenseElement) {
      console.warn('LICENSE element not found. Appending holographic panel to end of main.');
      const main = document.querySelector('main');
      if (main) {
        const panel = createHolographicPanel(theme);
        main.appendChild(panel);
      }
      return;
    }

    // Check if panel already exists
    const existingPanel = document.querySelector('.holographic-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    const panel = createHolographicPanel(theme);
    
    // Check if license element is inside a .download-grid
    const grid = licenseElement.closest('.download-grid');
    
    if (grid) {
      // Insert panel after the entire grid, not inside it
      grid.insertAdjacentElement('afterend', panel);
    } else {
      // Fallback: Insert after the license element itself
      if (licenseElement.nextSibling) {
        licenseElement.parentNode.insertBefore(panel, licenseElement.nextSibling);
      } else {
        licenseElement.parentNode.appendChild(panel);
      }
    }
    
    // Safety fallback: if panel ends up in a grid, span all columns
    if (panel.parentElement && panel.parentElement.classList.contains('download-grid')) {
      panel.style.gridColumn = '1 / -1';
    }
  }

  /**
   * Updates the panel when theme changes
   */
  function updatePanelForTheme() {
    insertHolographicPanel();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertHolographicPanel);
  } else {
    insertHolographicPanel();
  }

  // Listen for theme changes (the theme switcher in site.js doesn't dispatch events,
  // so we'll observe class changes on body)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updatePanelForTheme();
        break;
      }
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Also listen for reduced motion changes
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', updatePanelForTheme);
})();
