/**
 * FormatX Theme Loader
 * Handles multi-theme system with franchise-inspired themes
 */

(function() {
  'use strict';

  // Theme configuration
  const THEMES = {
    lcars: {
      name: 'LCARS (Star Trek)',
      id: 'lcars'
    },
    cyberpunk: {
      name: 'Cyberpunk 2077',
      id: 'cyberpunk'
    },
    starwars: {
      name: 'Star Wars',
      id: 'starwars'
    },
    stargate: {
      name: 'Stargate',
      id: 'stargate'
    }
  };

  const STORAGE_KEY = 'fx-franchise-theme';
  const DEFAULT_THEME = 'lcars';

  // Dynamic CSS injection
  function injectThemeCSS() {
    // Check if themes.css is already loaded
    const existingLink = document.querySelector('link[href*="themes.css"]');
    if (existingLink) {
      return;
    }

    // Create and inject the themes.css link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './themes.css';
    link.id = 'theme-stylesheet';
    document.head.appendChild(link);
  }

  // Get saved theme or default
  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && THEMES[saved] ? saved : DEFAULT_THEME;
    } catch (e) {
      console.warn('Could not access localStorage:', e);
      return DEFAULT_THEME;
    }
  }

  // Save theme preference
  function saveTheme(themeId) {
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  }

  // Apply theme to document
  function applyTheme(themeId) {
    const root = document.documentElement;
    
    // Remove any existing franchise theme
    root.removeAttribute('data-franchise-theme');
    
    // Apply new theme (if not LCARS, which is default)
    if (themeId !== 'lcars') {
      root.setAttribute('data-franchise-theme', themeId);
    }
    
    // Save preference
    saveTheme(themeId);
    
    // Update active state in theme selector if it exists
    updateThemeSelectorUI(themeId);
    
    // Trigger a custom event for other scripts to listen to
    const event = new CustomEvent('themeChanged', { detail: { theme: themeId } });
    document.dispatchEvent(event);
  }

  // Update theme selector UI
  function updateThemeSelectorUI(activeThemeId) {
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      const themeId = option.dataset.theme;
      if (themeId === activeThemeId) {
        option.classList.add('active');
        option.setAttribute('aria-pressed', 'true');
      } else {
        option.classList.remove('active');
        option.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // Create theme selector UI
  function createThemeSelector() {
    // Check if selector already exists
    if (document.querySelector('.theme-selector')) {
      return;
    }

    const currentTheme = getSavedTheme();
    
    // Create the selector container
    const selector = document.createElement('div');
    selector.className = 'theme-selector';
    selector.setAttribute('role', 'region');
    selector.setAttribute('aria-label', 'Téma választó');
    
    // Create header with title and minimize button
    const header = document.createElement('div');
    header.className = 'theme-selector-header';
    
    const title = document.createElement('h3');
    title.className = 'theme-selector-title';
    title.textContent = 'Témák';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-selector-toggle';
    toggleBtn.setAttribute('aria-label', 'Téma választó összecsukása/kinyitása');
    toggleBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    
    header.appendChild(title);
    header.appendChild(toggleBtn);
    
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'theme-options';
    
    // Create theme buttons
    Object.entries(THEMES).forEach(([id, theme]) => {
      const button = document.createElement('button');
      button.className = 'theme-option';
      button.dataset.theme = id;
      button.textContent = theme.name;
      button.setAttribute('role', 'button');
      button.setAttribute('aria-pressed', id === currentTheme ? 'true' : 'false');
      
      if (id === currentTheme) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        applyTheme(id);
      });
      
      optionsContainer.appendChild(button);
    });
    
    // Assemble selector
    selector.appendChild(header);
    selector.appendChild(optionsContainer);
    
    // Add to page
    document.body.appendChild(selector);
    
    // Add minimize/maximize functionality
    toggleBtn.addEventListener('click', () => {
      selector.classList.toggle('minimized');
      const isMinimized = selector.classList.contains('minimized');
      toggleBtn.setAttribute('aria-expanded', !isMinimized);
    });
    
    // Load minimized state from localStorage
    try {
      const isMinimized = localStorage.getItem('fx-theme-selector-minimized') === 'true';
      if (isMinimized) {
        selector.classList.add('minimized');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Save minimized state
    toggleBtn.addEventListener('click', () => {
      try {
        const isMinimized = selector.classList.contains('minimized');
        localStorage.setItem('fx-theme-selector-minimized', isMinimized);
      } catch (e) {
        // Ignore localStorage errors
      }
    });
  }

  // Initialize theme system
  function init() {
    // Inject theme CSS immediately
    injectThemeCSS();
    
    // Apply saved theme as early as possible (before DOM ready)
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    
    // Create theme selector when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createThemeSelector);
    } else {
      createThemeSelector();
    }
  }

  // Run initialization
  init();

  // Export to window for debugging if needed
  if (typeof window !== 'undefined') {
    window.FormatXThemes = {
      applyTheme,
      getSavedTheme,
      THEMES
    };
  }
})();
