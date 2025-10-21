/**
 * Preloader - LCARS-style boot animation with accessibility
 * Preloads critical CSS/SVG and shows accessible progress indicator
 */
(function() {
  'use strict';
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  /**
   * Create and show preloader
   */
  function createPreloader() {
    // Create preloader container
    const preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.setAttribute('aria-live', 'polite');
    preloader.setAttribute('aria-busy', 'true');
    
    // Create progress bar with ARIA attributes
    const progressBar = document.createElement('div');
    progressBar.className = 'preloader-content';
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-valuenow', '0');
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-label', 'Loading interface');
    
    // Create visual boot bar (LCARS style)
    const bootBar = document.createElement('div');
    bootBar.className = 'boot-bar';
    
    const bootTrack = document.createElement('div');
    bootTrack.className = 'boot-track';
    
    const bootFill = document.createElement('div');
    bootFill.className = 'boot-fill';
    
    const bootCap = document.createElement('div');
    bootCap.className = 'boot-cap';
    
    bootTrack.appendChild(bootFill);
    bootTrack.appendChild(bootCap);
    bootBar.appendChild(bootTrack);
    
    // Create status text
    const statusText = document.createElement('div');
    statusText.className = 'preloader-status';
    statusText.textContent = 'INITIALIZING SYSTEMS';
    
    progressBar.appendChild(statusText);
    progressBar.appendChild(bootBar);
    preloader.appendChild(progressBar);
    
    // Add styles
    addPreloaderStyles();
    
    return preloader;
  }
  
  /**
   * Add inline styles for preloader
   */
  function addPreloaderStyles() {
    if (document.getElementById('preloader-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'preloader-styles';
    style.textContent = `
      #preloader {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #080a11;
        color: #eaf3ff;
        font-family: "Eurostile", "Orbitron", system-ui, sans-serif;
      }
      
      .preloader-content {
        text-align: center;
        max-width: min(600px, 90vw);
      }
      
      .preloader-status {
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        margin-bottom: 1.5rem;
        color: #ffc94d;
        text-transform: uppercase;
      }
      
      .boot-bar {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
      }
      
      .boot-track {
        position: relative;
        height: 32px;
        background: rgba(12, 16, 26, 0.6);
        border-radius: 16px 16px 16px 16px;
        box-shadow: 
          inset 0 2px 8px rgba(0, 0, 0, 0.4),
          0 0 0 1px rgba(126, 200, 255, 0.2);
        overflow: hidden;
      }
      
      .boot-fill {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #ffc94d 0%, #f6c9a6 100%);
        border-radius: 16px 0 0 16px;
        box-shadow: 
          inset 0 -2px 6px rgba(0, 0, 0, 0.3),
          0 0 12px rgba(255, 201, 77, 0.4);
        transition: width 0.3s ease-out;
      }
      
      .boot-cap {
        position: absolute;
        right: 0;
        top: 0;
        width: 40%;
        height: 100%;
        background: rgba(8, 12, 18, 0.4);
        border-radius: 0 16px 16px 0;
        pointer-events: none;
      }
      
      ${!prefersReducedMotion ? `
        @keyframes boot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .boot-fill {
          animation: boot-pulse 1.5s ease-in-out infinite;
        }
      ` : ''}
      
      #preloader.hidden {
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.35s ease;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Update progress
   * @param {number} percent - Progress percentage (0-100)
   */
  function updateProgress(percent) {
    const progressBar = document.querySelector('#preloader [role="progressbar"]');
    const bootFill = document.querySelector('.boot-fill');
    
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', Math.round(percent));
    }
    
    if (bootFill) {
      bootFill.style.width = percent + '%';
    }
  }
  
  /**
   * Preload critical resources
   * @returns {Promise} Promise that resolves when resources are loaded
   */
  function preloadResources() {
    const resources = [
      // Critical CSS
      'styles/base.css',
      'styles/themes.css',
      // HUD grid SVG for Star Wars theme
      'assets/svgs/hud-grid.svg'
    ];
    
    let loaded = 0;
    const total = resources.length;
    
    const promises = resources.map(url => {
      return new Promise((resolve) => {
        if (url.endsWith('.css')) {
          // Preload CSS
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'style';
          link.href = url;
          link.onload = () => {
            loaded++;
            updateProgress((loaded / total) * 100);
            resolve();
          };
          link.onerror = () => {
            loaded++;
            updateProgress((loaded / total) * 100);
            resolve(); // Don't fail on individual resource errors
          };
          document.head.appendChild(link);
        } else {
          // Preload other resources
          fetch(url)
            .then(() => {
              loaded++;
              updateProgress((loaded / total) * 100);
              resolve();
            })
            .catch(() => {
              loaded++;
              updateProgress((loaded / total) * 100);
              resolve(); // Don't fail on individual resource errors
            });
        }
      });
    });
    
    return Promise.all(promises);
  }
  
  /**
   * Hide preloader and dispatch completion event
   */
  function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    // Update status
    const statusText = preloader.querySelector('.preloader-status');
    if (statusText) {
      statusText.textContent = 'SYSTEMS READY';
    }
    
    // Update ARIA
    preloader.setAttribute('aria-busy', 'false');
    
    // Hide after brief delay
    setTimeout(() => {
      preloader.classList.add('hidden');
      
      // Dispatch completion event
      const event = new CustomEvent('preloader:done', {
        bubbles: true
      });
      document.dispatchEvent(event);
      
      // Remove from DOM after transition
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 400);
    }, 300);
  }
  
  /**
   * Initialize preloader
   */
  function init() {
    // Create and insert preloader
    const preloader = createPreloader();
    document.body.insertBefore(preloader, document.body.firstChild);
    
    // Start preloading
    updateProgress(10);
    
    preloadResources()
      .then(() => {
        updateProgress(100);
        
        // Minimum display time for visibility
        const minDisplayTime = prefersReducedMotion ? 200 : 800;
        setTimeout(hidePreloader, minDisplayTime);
      })
      .catch((error) => {
        console.error('Preloader error:', error);
        // Still hide preloader on error
        updateProgress(100);
        setTimeout(hidePreloader, 500);
      });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
