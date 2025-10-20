/**
 * FormatX Theme Loader
 * Handles franchise theme selection, persistence, and dynamic injection
 */

(function() {
  'use strict';

  const THEMES = {
    lcars: 'LCARS',
    cyberpunk: 'Cyberpunk 2077',
    starwars: 'Star Wars',
    stargate: 'Stargate'
  };

  const STORAGE_KEY = 'fx-franchise-theme';
  const DEFAULT_THEME = 'lcars';

  /**
   * Get the current franchise theme from localStorage
   */
  function getCurrentTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && THEMES[stored] ? stored : DEFAULT_THEME;
  }

  /**
   * Set the franchise theme
   */
  function setTheme(themeName) {
    if (!THEMES[themeName]) {
      console.warn(`Unknown theme: ${themeName}, falling back to ${DEFAULT_THEME}`);
      themeName = DEFAULT_THEME;
    }

    document.documentElement.setAttribute('data-franchise-theme', themeName);
    localStorage.setItem(STORAGE_KEY, themeName);

    // Dispatch custom event for other scripts that might want to react to theme changes
    window.dispatchEvent(new CustomEvent('franchiseThemeChanged', { 
      detail: { theme: themeName } 
    }));
  }

  /**
   * Inject the themes.css file dynamically
   */
  function injectThemeStyles() {
    // Check if already injected
    if (document.getElementById('franchise-themes')) {
      return;
    }

    const link = document.createElement('link');
    link.id = 'franchise-themes';
    link.rel = 'stylesheet';
    link.href = './themes.css';
    
    // Insert before the main styles.css if it exists, otherwise append to head
    const mainStyles = document.querySelector('link[href*="styles.css"]');
    if (mainStyles) {
      mainStyles.parentNode.insertBefore(link, mainStyles.nextSibling);
    } else {
      document.head.appendChild(link);
    }
  }

  /**
   * Create and inject the theme selector UI
   */
  function createThemeSelector() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    // Create theme selector container
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'theme-selector';

    // Create theme selector button
    const button = document.createElement('button');
    button.className = 'theme-selector-button';
    button.setAttribute('aria-label', 'Téma választó');
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    
    button.innerHTML = `
      <svg class="theme-selector-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
      </svg>
      <span class="theme-selector-text">Téma</span>
    `;

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'theme-dropdown';
    dropdown.setAttribute('role', 'menu');

    // Add theme options
    const currentTheme = getCurrentTheme();
    Object.entries(THEMES).forEach(([key, label]) => {
      const option = document.createElement('div');
      option.className = 'theme-option';
      option.setAttribute('role', 'menuitem');
      option.setAttribute('data-theme', key);
      if (key === currentTheme) {
        option.classList.add('active');
      }

      option.innerHTML = `
        <span class="theme-option-indicator"></span>
        <span class="theme-option-label">${label}</span>
      `;

      option.addEventListener('click', () => {
        setTheme(key);
        updateThemeSelector(key);
        closeDropdown();
      });

      dropdown.appendChild(option);
    });

    // Toggle dropdown
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('active');
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!selectorContainer.contains(e.target)) {
        closeDropdown();
      }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('active')) {
        closeDropdown();
        button.focus();
      }
    });

    function openDropdown() {
      dropdown.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
      dropdown.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    }

    function updateThemeSelector(activeTheme) {
      dropdown.querySelectorAll('.theme-option').forEach(option => {
        const isActive = option.getAttribute('data-theme') === activeTheme;
        option.classList.toggle('active', isActive);
      });
    }

    // Assemble and inject
    selectorContainer.appendChild(button);
    selectorContainer.appendChild(dropdown);
    nav.appendChild(selectorContainer);
  }

  /**
   * Initialize the theme system
   */
  function init() {
    // Inject theme styles first
    injectThemeStyles();

    // Apply saved theme immediately to prevent flash
    const theme = getCurrentTheme();
    setTheme(theme);

    // Wait for DOM to be ready before creating UI
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createThemeSelector);
    } else {
      createThemeSelector();
    }
  }

  // Initialize immediately
  init();

  // Expose API for external use if needed
  window.FormatXThemes = {
    getTheme: getCurrentTheme,
    setTheme: setTheme,
    themes: THEMES
  };
})();
