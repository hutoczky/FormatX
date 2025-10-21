/**
 * Animation Controller - Manages background SVG/CSS layers per theme
 * Handles parallax effects and respects prefers-reduced-motion
 */
(function() {
  'use strict';
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Track state
  let isPreloaderDone = false;
  let currentTheme = 'lcars';
  let parallaxEnabled = false;
  
  // Parallax state
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  
  /**
   * Theme-specific layer configurations
   */
  const themeConfigs = {
    lcars: {
      layers: [],
      enableParallax: false
    },
    starwars: {
      layers: [
        {
          id: 'hud-grid-layer',
          type: 'svg',
          src: 'assets/svgs/hud-grid.svg',
          className: 'anim-layer hud-grid',
          style: {
            mixBlendMode: 'screen',
            opacity: '0.3'
          },
          parallax: { strength: 0.02 }
        }
      ],
      enableParallax: true
    },
    cyberpunk: {
      layers: [
        {
          id: 'neon-noise-layer',
          type: 'css',
          className: 'anim-layer neon-noise',
          style: {
            background: `
              repeating-linear-gradient(
                120deg,
                rgba(255,0,184,0.08) 0 2px,
                transparent 2px 4px
              ),
              repeating-linear-gradient(
                30deg,
                rgba(0,255,245,0.06) 0 1px,
                transparent 1px 3px
              )
            `,
            mixBlendMode: 'overlay',
            opacity: '0.2',
            animation: 'noise-shift 4s ease-in-out infinite'
          },
          parallax: { strength: 0.015 }
        }
      ],
      enableParallax: true
    }
  };
  
  /**
   * Add CSS animations for layers
   */
  function addLayerStyles() {
    if (document.getElementById('anim-layer-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'anim-layer-styles';
    style.textContent = `
      .anim-layer {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      
      .anim-layer.active {
        opacity: 1;
      }
      
      .hud-grid {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
      
      ${!prefersReducedMotion ? `
        @keyframes noise-shift {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(2px, -2px);
          }
          50% {
            transform: translate(-2px, 2px);
          }
          75% {
            transform: translate(2px, 2px);
          }
        }
      ` : ''}
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Create a layer element
   * @param {Object} config - Layer configuration
   * @returns {HTMLElement} Created layer element
   */
  function createLayer(config) {
    const layer = document.createElement('div');
    layer.id = config.id;
    layer.className = config.className;
    layer.setAttribute('aria-hidden', 'true');
    
    // Apply styles
    if (config.style) {
      Object.entries(config.style).forEach(([key, value]) => {
        layer.style[key] = value;
      });
    }
    
    // Handle SVG layers
    if (config.type === 'svg' && config.src) {
      const img = document.createElement('img');
      img.src = config.src;
      img.alt = '';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      layer.appendChild(img);
    }
    
    // Add parallax attribute if enabled
    if (config.parallax && !prefersReducedMotion) {
      layer.setAttribute('data-parallax', config.parallax.strength);
    }
    
    return layer;
  }
  
  /**
   * Remove all existing layers
   */
  function clearLayers() {
    const existingLayers = document.querySelectorAll('.anim-layer');
    existingLayers.forEach(layer => {
      layer.classList.remove('active');
      setTimeout(() => {
        if (layer.parentNode) {
          layer.parentNode.removeChild(layer);
        }
      }, 500);
    });
  }
  
  /**
   * Apply layers for a specific theme
   * @param {string} theme - Theme name
   */
  function applyThemeLayers(theme) {
    currentTheme = theme;
    
    // Clear existing layers
    clearLayers();
    
    // Get configuration for theme
    const config = themeConfigs[theme];
    if (!config || !config.layers || config.layers.length === 0) {
      parallaxEnabled = false;
      return;
    }
    
    // Create and append layers
    const telemetry = document.querySelector('.telemetry');
    if (!telemetry) return;
    
    config.layers.forEach(layerConfig => {
      const layer = createLayer(layerConfig);
      telemetry.appendChild(layer);
      
      // Trigger reflow and activate
      setTimeout(() => {
        layer.classList.add('active');
      }, 50);
    });
    
    // Enable parallax if configured and preloader is done
    parallaxEnabled = config.enableParallax && isPreloaderDone && !prefersReducedMotion;
  }
  
  /**
   * Update parallax effect
   */
  function updateParallax() {
    if (!parallaxEnabled || prefersReducedMotion) return;
    
    // Smooth lerp
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;
    
    // Apply to layers with parallax
    const parallaxLayers = document.querySelectorAll('[data-parallax]');
    parallaxLayers.forEach(layer => {
      const strength = parseFloat(layer.getAttribute('data-parallax')) || 0.02;
      const x = currentX * strength;
      const y = currentY * strength;
      layer.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    // Continue animation
    if (parallaxEnabled) {
      requestAnimationFrame(updateParallax);
    }
  }
  
  /**
   * Handle mouse move for parallax
   * @param {MouseEvent} e - Mouse event
   */
  function handleMouseMove(e) {
    if (!parallaxEnabled || prefersReducedMotion) return;
    
    // Calculate relative position (-1 to 1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    
    // Convert to pixel offset
    mouseX = x * 50;
    mouseY = y * 50;
  }
  
  /**
   * Enable parallax effect
   */
  function enableParallax() {
    if (prefersReducedMotion) return;
    
    const config = themeConfigs[currentTheme];
    if (config && config.enableParallax && isPreloaderDone) {
      parallaxEnabled = true;
      requestAnimationFrame(updateParallax);
    }
  }
  
  /**
   * Initialize animation controller
   */
  function init() {
    // Add layer styles
    addLayerStyles();
    
    // Listen for theme changes
    document.addEventListener('theme:changed', (e) => {
      if (e.detail && e.detail.theme) {
        applyThemeLayers(e.detail.theme);
      }
    });
    
    // Listen for preloader completion
    document.addEventListener('preloader:done', () => {
      isPreloaderDone = true;
      enableParallax();
    });
    
    // Setup mouse move for parallax
    if (!prefersReducedMotion) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    // Apply initial theme layers
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'lcars';
    currentTheme = initialTheme;
    
    // Wait a bit before applying layers to ensure theme is loaded
    setTimeout(() => {
      applyThemeLayers(initialTheme);
    }, 100);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
