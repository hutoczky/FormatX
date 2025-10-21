/**
 * Theme Switcher - Live stylesheet swap with CustomEvent dispatch
 * Manages theme switching without page reload
 */
(function() {
  'use strict';
  
  const STORAGE_KEY = 'scifi-theme';
  const themes = {
    lcars: 'styles/lcars.css',
    starwars: 'styles/starwars.css',
    cyberpunk: 'styles/cyberpunk.css'
  };
  
  /**
   * Set and apply a theme
   * @param {string} name - Theme name (lcars, starwars, cyberpunk)
   */
  function setTheme(name) {
    // Validate theme name
    if (!themes[name]) {
      console.warn(`Unknown theme: ${name}, defaulting to lcars`);
      name = 'lcars';
    }
    
    // Get or create theme stylesheet link
    let themeLink = document.getElementById('theme-css');
    if (!themeLink) {
      themeLink = document.createElement('link');
      themeLink.id = 'theme-css';
      themeLink.rel = 'stylesheet';
      document.head.appendChild(themeLink);
    }
    
    // Swap stylesheet href
    themeLink.href = themes[name];
    
    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, name);
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    
    // Set data-theme attribute on documentElement
    document.documentElement.setAttribute('data-theme', name);
    
    // Update button states
    updateButtonStates(name);
    
    // Dispatch CustomEvent
    const event = new CustomEvent('theme:changed', {
      detail: { theme: name },
      bubbles: true
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Update aria-pressed and aria-selected on theme buttons
   * @param {string} activeTheme - Currently active theme name
   */
  function updateButtonStates(activeTheme) {
    const buttons = document.querySelectorAll('[data-theme]');
    buttons.forEach(btn => {
      const btnTheme = btn.getAttribute('data-theme');
      const isActive = btnTheme === activeTheme;
      btn.setAttribute('aria-pressed', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
  }
  
  /**
   * Initialize theme switcher on DOM ready
   */
  function init() {
    // Load saved theme or default to lcars
    let initialTheme = 'lcars';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && themes[saved]) {
        initialTheme = saved;
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    
    // Apply initial theme
    setTheme(initialTheme);
    
    // Setup button click handlers
    const buttons = document.querySelectorAll('[data-theme]');
    buttons.forEach(btn => {
      const themeName = btn.getAttribute('data-theme');
      
      // Click handler
      btn.addEventListener('click', () => {
        setTheme(themeName);
      });
      
      // Keyboard handler (Enter and Space)
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setTheme(themeName);
        }
      });
      
      // Ensure proper role and tabindex
      if (!btn.hasAttribute('role')) {
        btn.setAttribute('role', 'button');
      }
      if (!btn.hasAttribute('tabindex')) {
        btn.tabIndex = 0;
      }
    });
  }
  
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose setTheme globally for external access
  window.setTheme = setTheme;
  
})();
