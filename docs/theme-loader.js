/**
 * FormatX Multi-Theme Loader
 * Handles theme switching with localStorage persistence
 * Supports: LCARS (default), Cyberpunk 2077, Star Wars, Stargate
 */

(function() {
  'use strict';

  // Theme definitions
  const THEMES = {
    lcars: {
      name: 'LCARS',
      label: 'Star Trek LCARS',
      icon: '🖖'
    },
    cyberpunk: {
      name: 'Cyberpunk',
      label: 'Cyberpunk 2077',
      icon: '🌃'
    },
    starwars: {
      name: 'Star Wars',
      label: 'Star Wars',
      icon: '⚔️'
    },
    stargate: {
      name: 'Stargate',
      label: 'Stargate',
      icon: '🌌'
    }
  };

  const STORAGE_KEY = 'fx-theme';
  const DEFAULT_THEME = 'lcars';

  /**
   * Get the initial theme from localStorage or use default
   */
  function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES[stored]) {
      return stored;
    }
    return DEFAULT_THEME;
  }

  /**
   * Apply theme to the document
   */
  function applyTheme(themeId) {
    if (!THEMES[themeId]) {
      themeId = DEFAULT_THEME;
    }
    
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem(STORAGE_KEY, themeId);
    
    // Update selector if it exists
    const selector = document.getElementById('theme-selector');
    if (selector) {
      selector.value = themeId;
    }
    
    // Dispatch custom event for other scripts that might need to react
    document.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: themeId } 
    }));
  }

  /**
   * Inject themes.css into the document
   */
  function injectThemeStyles() {
    // Check if already injected
    if (document.getElementById('theme-styles')) {
      return;
    }

    const link = document.createElement('link');
    link.id = 'theme-styles';
    link.rel = 'stylesheet';
    link.href = './themes.css';
    
    // Insert before main styles.css to allow proper cascading
    const mainStyles = document.querySelector('link[href="./styles.css"]');
    if (mainStyles) {
      mainStyles.parentNode.insertBefore(link, mainStyles.nextSibling);
    } else {
      document.head.appendChild(link);
    }
  }

  /**
   * Create and insert theme selector in navigation
   */
  function createThemeSelector() {
    const nav = document.querySelector('.nav');
    if (!nav) {
      console.warn('Navigation element not found');
      return;
    }

    // Remove old theme toggle if it exists
    const oldToggle = document.getElementById('theme-toggle');
    if (oldToggle) {
      oldToggle.remove();
    }

    // Create selector container
    const container = document.createElement('div');
    container.className = 'theme-selector-container';

    // Create select element
    const select = document.createElement('select');
    select.id = 'theme-selector';
    select.className = 'theme-selector';
    select.setAttribute('aria-label', 'Válassz témát');

    // Add options
    Object.keys(THEMES).forEach(themeId => {
      const option = document.createElement('option');
      option.value = themeId;
      option.textContent = `${THEMES[themeId].icon} ${THEMES[themeId].label}`;
      select.appendChild(option);
    });

    // Set current theme
    select.value = getInitialTheme();

    // Add change listener
    select.addEventListener('change', (e) => {
      applyTheme(e.target.value);
      
      // Add a subtle animation to show theme changed
      if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        document.body.style.opacity = '0.95';
        setTimeout(() => {
          document.body.style.opacity = '';
        }, 150);
      }
    });

    container.appendChild(select);
    nav.appendChild(container);
  }

  /**
   * Initialize theme system
   */
  function init() {
    // Inject theme styles first
    injectThemeStyles();
    
    // Apply initial theme immediately to prevent flash
    applyTheme(getInitialTheme());

    // Wait for DOM to be ready before creating selector
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createThemeSelector);
    } else {
      createThemeSelector();
    }
  }

  // Run initialization
  init();

  // Expose theme API for console access and debugging
  window.FormatXThemes = {
    themes: THEMES,
    current: () => document.documentElement.getAttribute('data-theme'),
    set: applyTheme,
    list: () => Object.keys(THEMES)
  };
})();
