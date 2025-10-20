/**
 * FormatX Multi-Theme System
 * Handles theme switching, intro animations, and persistent storage
 * Safe for reduced-motion users
 */

(function initThemeSystem() {
  'use strict';

  // Theme configuration
  const THEMES = {
    lcars: {
      name: 'LCARS',
      description: 'Star Trek inspired',
      introClass: 'lcars',
      introDuration: 1000
    },
    cyberpunk: {
      name: 'Cyberpunk 2077',
      description: 'Neon dystopia',
      introClass: 'cyberpunk',
      introDuration: 1200
    },
    starwars: {
      name: 'Star Wars',
      description: 'Galaxy far away',
      introClass: 'starwars',
      introDuration: 1200
    },
    stargate: {
      name: 'Stargate',
      description: 'Chevron locked',
      introClass: 'stargate',
      introDuration: 1500
    }
  };

  const STORAGE_KEY = 'fx-franchise-theme';
  const DEFAULT_THEME = 'lcars';

  // State
  let currentTheme = DEFAULT_THEME;
  let isMinimized = localStorage.getItem('fx-theme-selector-minimized') === 'true';

  /**
   * Inject themes.css dynamically
   */
  function injectThemeStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './themes.css';
    link.id = 'theme-styles';
    document.head.appendChild(link);
  }

  /**
   * Get the stored theme or default
   */
  function getSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved && THEMES[saved]) ? saved : DEFAULT_THEME;
  }

  /**
   * Apply theme to document root
   */
  function applyTheme(themeId, skipAnimation = false) {
    if (!THEMES[themeId]) {
      console.warn(`Theme "${themeId}" not found, falling back to ${DEFAULT_THEME}`);
      themeId = DEFAULT_THEME;
    }

    currentTheme = themeId;
    document.documentElement.setAttribute('data-franchise-theme', themeId);
    localStorage.setItem(STORAGE_KEY, themeId);

    // Update active state in UI
    updateThemeSelector();

    // Show intro animation if not skipped
    if (!skipAnimation) {
      showThemeIntro(themeId);
    }
  }

  /**
   * Show theme-specific intro animation
   */
  function showThemeIntro(themeId) {
    const theme = THEMES[themeId];
    if (!theme) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Create intro element
    const intro = document.createElement('div');
    intro.className = `theme-intro ${theme.introClass}`;
    
    // Add specific structure for LCARS theme
    if (themeId === 'lcars') {
      intro.innerHTML = '<div class="panel-top"></div><div class="panel-bottom"></div>';
    }
    
    document.body.appendChild(intro);

    // Remove intro after animation completes
    const duration = prefersReducedMotion ? 50 : theme.introDuration;
    setTimeout(() => {
      intro.remove();
    }, duration);
  }

  /**
   * Create theme selector UI
   */
  function createThemeSelector() {
    const selector = document.createElement('div');
    selector.className = 'theme-selector';
    if (isMinimized) {
      selector.classList.add('minimized');
    }
    selector.setAttribute('role', 'region');
    selector.setAttribute('aria-label', 'Theme selector');

    // Header with toggle
    const header = document.createElement('div');
    header.className = 'theme-selector-header';

    const title = document.createElement('h3');
    title.className = 'theme-selector-title';
    title.textContent = 'Themes';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-selector-toggle';
    toggleBtn.textContent = isMinimized ? '▼' : '▲';
    toggleBtn.setAttribute('aria-label', isMinimized ? 'Expand theme selector' : 'Collapse theme selector');
    toggleBtn.addEventListener('click', toggleMinimized);

    header.appendChild(title);
    header.appendChild(toggleBtn);

    // Options container
    const options = document.createElement('div');
    options.className = 'theme-options';

    // Create option for each theme
    Object.entries(THEMES).forEach(([id, theme]) => {
      const option = document.createElement('button');
      option.className = 'theme-option';
      option.setAttribute('data-theme', id);
      option.setAttribute('role', 'radio');
      option.setAttribute('aria-checked', id === currentTheme ? 'true' : 'false');
      
      if (id === currentTheme) {
        option.classList.add('active');
      }

      const icon = document.createElement('span');
      icon.className = 'theme-option-icon';
      icon.setAttribute('aria-hidden', 'true');

      const textContainer = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = theme.name;
      
      textContainer.appendChild(name);

      option.appendChild(icon);
      option.appendChild(textContainer);

      option.addEventListener('click', () => {
        applyTheme(id, false);
      });

      options.appendChild(option);
    });

    selector.appendChild(header);
    selector.appendChild(options);

    document.body.appendChild(selector);

    return selector;
  }

  /**
   * Toggle minimized state
   */
  function toggleMinimized() {
    isMinimized = !isMinimized;
    localStorage.setItem('fx-theme-selector-minimized', isMinimized.toString());
    
    const selector = document.querySelector('.theme-selector');
    const toggleBtn = document.querySelector('.theme-selector-toggle');
    
    if (selector) {
      if (isMinimized) {
        selector.classList.add('minimized');
        toggleBtn.textContent = '▼';
        toggleBtn.setAttribute('aria-label', 'Expand theme selector');
      } else {
        selector.classList.remove('minimized');
        toggleBtn.textContent = '▲';
        toggleBtn.setAttribute('aria-label', 'Collapse theme selector');
      }
    }
  }

  /**
   * Update active state in theme selector
   */
  function updateThemeSelector() {
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      const themeId = option.getAttribute('data-theme');
      const isActive = themeId === currentTheme;
      
      if (isActive) {
        option.classList.add('active');
        option.setAttribute('aria-checked', 'true');
      } else {
        option.classList.remove('active');
        option.setAttribute('aria-checked', 'false');
      }
    });
  }

  /**
   * Initialize the theme system
   */
  function init() {
    // Inject theme styles first
    injectThemeStyles();

    // Get saved theme
    const savedTheme = getSavedTheme();

    // Check if this is first visit (show intro) or returning (skip intro)
    const isFirstVisit = !localStorage.getItem(STORAGE_KEY);
    
    // Apply theme
    applyTheme(savedTheme, !isFirstVisit);

    // Wait for DOM to be ready before creating UI
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createThemeSelector);
    } else {
      createThemeSelector();
    }

    // Listen for system theme preference changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually selected a theme
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(DEFAULT_THEME, true);
      }
    });
  }

  // Initialize when script loads
  init();

  // Expose API for external use
  window.FormatXThemes = {
    themes: THEMES,
    getCurrentTheme: () => currentTheme,
    setTheme: (themeId, skipAnimation = false) => applyTheme(themeId, skipAnimation),
    resetTheme: () => {
      localStorage.removeItem(STORAGE_KEY);
      applyTheme(DEFAULT_THEME, false);
    }
  };

})();
