// Dátum a láblécben
document.getElementById("year").textContent = new Date().getFullYear().toString();

// Tab visibility pause for animations (performance optimization)
(function handleTabVisibility() {
  // Set initial state
  document.documentElement.setAttribute('data-tab-visible', !document.hidden);
  
  document.addEventListener("visibilitychange", () => {
    // Update data attribute for CSS-based pause control
    document.documentElement.setAttribute('data-tab-visible', !document.hidden);
    
    // Legacy support for inline style approach
    const bridgeScreens = document.querySelector('.bridge-screens');
    if (bridgeScreens) {
      if (document.hidden) {
        bridgeScreens.style.animationPlayState = 'paused';
        // Pause all child animations
        const animatedElements = bridgeScreens.querySelectorAll('*');
        animatedElements.forEach(el => {
          el.style.animationPlayState = 'paused';
        });
      } else {
        bridgeScreens.style.animationPlayState = 'running';
        // Resume all child animations
        const animatedElements = bridgeScreens.querySelectorAll('*');
        animatedElements.forEach(el => {
          el.style.animationPlayState = 'running';
        });
      }
    }
  });
})();

// URL restoration for GitHub Pages SPA fallback
(function restoreCleanURL() {
  const search = window.location.search;
  // Check if the URL starts with ?/ (GitHub Pages fallback format)
  if (search && search.startsWith('?/')) {
    const path = search.slice(1); // Remove the leading ?
    const hash = window.location.hash;
    const cleanURL = window.location.pathname + path + hash;
    // Use replaceState to update the URL without reloading
    window.history.replaceState(null, '', cleanURL);
  }
})();

// Global image fallback handler
window.handleImageError = function(img) {
  if (!img || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = 'true';
  
  // Mark the parent gallery-item as missing
  const galleryItem = img.closest('.gallery-item');
  if (galleryItem) {
    galleryItem.classList.add('missing');
    // Update the caption to show "Kép feltöltés alatt"
    const caption = galleryItem.querySelector('.gallery-caption');
    if (caption && !caption.dataset.originalText) {
      caption.dataset.originalText = caption.textContent;
      caption.textContent = 'Kép feltöltés alatt';
    }
  }
  
  // Create a clean SVG placeholder
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">',
    '<rect width="100%" height="100%" fill="#030814"/>',
    '<text x="50%" y="50%" fill="#00eaff" font-size="24" text-anchor="middle" dominant-baseline="middle">',
    'Kép hamarosan',
    '</text>',
    '</svg>'
  ].join('');
  
  img.src = 'data:image/svg+xml;base64,' + btoa(svg);
};

// Theme Toggle
(function initTheme(){
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    const stored = localStorage.getItem("fx-theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("fx-theme", theme);
    themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  };

  // Apply initial theme
  setTheme(getInitialTheme());

  // Toggle on click
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });
})();

// Betöltő elrejtése, kis késleltetéssel a hatás kedvéért
window.addEventListener("load", () => {
  const pre = document.getElementById("preloader");
  // Minimum 800ms megjelenítés
  setTimeout(() => pre.classList.add("hidden"), 850);
});

// Gépelés-animáció a fő címhez
(function typingEffect(){
  const el = document.querySelector(".title-focus");
  if(!el) return;
  const target = el.getAttribute("data-typing") || el.textContent.trim();
  el.textContent = "";
  let i=0;
  const tick = () => {
    if(i <= target.length){
      el.textContent = target.slice(0, i);
      i++;
      setTimeout(tick, i < 6 ? 120 : 42 + (Math.random()*40));
    }
  };
  tick();
})();

// Scroll-reveal megjelenítés
(function revealOnScroll(){
  const items = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver((entries) => {
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    }
  }, { threshold: .12 });
  items.forEach(i => io.observe(i));
})();

// Demó: JSON formázás / tömörítés
const inputEl = document.getElementById("demo-input");
const outputEl = document.getElementById("demo-output");
const formatBtn = document.getElementById("format-btn");
const minifyBtn = document.getElementById("minify-btn");
const warpBtn = document.getElementById("warp-btn");

function safeParse(str){
  try{ return [JSON.parse(str), null] }
  catch(e){ return [null, e] }
}
function highlightJSON(jsonString){
  // minimál színezés
  return jsonString
    .replace(/(&)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (m) => {
      let cls = "num";
      if (/^"/.test(m)) {
        cls = /:$/.test(m) ? "key" : "str";
      } else if (/true|false/.test(m)) {
        cls = "bool";
      } else if (/null/.test(m)) {
        cls = "null";
      }
      return `<span class="${cls}">${m}</span>`;
    });
}
function setOutput(html){
  outputEl.innerHTML = html;
}

formatBtn?.addEventListener("click", () => {
  const [obj, err] = safeParse(inputEl.value || "{}");
  if(err){
    setOutput(`<span style=\"color:#ff6b6b\">Hiba:</span> ${err.message}`);
    outputEl.classList.add("warp");
    setTimeout(() => outputEl.classList.remove("warp"), 920);
    return;
  }
  const pretty = JSON.stringify(obj, null, 2);
  setOutput(highlightJSON(pretty));
  outputEl.classList.add("warp");
  setTimeout(() => outputEl.classList.remove("warp"), 920);
});

minifyBtn?.addEventListener("click", () => {
  const [obj, err] = safeParse(inputEl.value || "{}");
  if(err){
    setOutput(`<span style=\"color:#ff6b6b\">Hiba:</span> ${err.message}`);
    return;
  }
  setOutput(JSON.stringify(obj));
});

warpBtn?.addEventListener("click", () => {
  document.body.classList.add("warp");
  setTimeout(() => document.body.classList.remove("warp"), 950);
});

// Minimális stílus a JSON színezéséhez (shadow-DOM nélkül)
const style = document.createElement("style");
style.textContent = `
  #demo-output .key { color: #7cc1ff }
  #demo-output .str { color: #b0ffea }
  #demo-output .num { color: #ffd37c }
  #demo-output .bool { color: #ff9ac1 }
  #demo-output .null { color: #8ea6b8 }
`;

document.head.appendChild(style);

// Lightbox functionality
(function initLightbox(){
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector(".lightbox-image");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  let currentGallery = [];
  let currentIndex = 0;

  // Find all gallery items
  const galleryContainer = document.querySelector('[data-gallery="pro"]');
  if (!galleryContainer) return;

  const galleryItems = Array.from(galleryContainer.querySelectorAll('.gallery-item'));

  const openLightbox = (index) => {
    currentGallery = galleryItems;
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const updateLightbox = () => {
    if (!currentGallery[currentIndex]) return;
    const item = currentGallery[currentIndex];
    const img = item.querySelector("img");
    const caption = item.querySelector(".gallery-caption");

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : "";

    // Update navigation visibility
    prevBtn.style.display = currentIndex > 0 ? "block" : "none";
    nextBtn.style.display = currentIndex < currentGallery.length - 1 ? "block" : "none";
  };

  const showPrev = () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateLightbox();
    }
  };

  const showNext = () => {
    if (currentIndex < currentGallery.length - 1) {
      currentIndex++;
      updateLightbox();
    }
  };

  // Event listeners
  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(index);
      }
    });
    // Make items keyboard accessible
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", showPrev);
  nextBtn.addEventListener("click", showNext);

  // Close on background click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    switch(e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowLeft":
        showPrev();
        break;
      case "ArrowRight":
        showNext();
        break;
    }
  });
})();

// Deep Search (Mélykutatás) - In-page search with no HTML template changes
(function initDeepSearch() {
  // Inject search UI container
  const searchContainer = document.createElement('div');
  searchContainer.id = 'deep-search';
  searchContainer.className = 'deep-search-container';
  searchContainer.setAttribute('role', 'search');
  searchContainer.setAttribute('aria-label', 'Oldalon belüli keresés');
  searchContainer.style.cssText = `
    position: fixed;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    background: linear-gradient(135deg, rgba(0, 10, 30, 0.98), rgba(10, 20, 50, 0.98));
    border: 2px solid #00eaff;
    border-radius: 12px;
    padding: 16px 20px;
    min-width: 450px;
    max-width: 90vw;
    box-shadow: 0 8px 32px rgba(0, 234, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Exo', sans-serif;
  `;

  searchContainer.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="flex: 1; position: relative;">
        <input 
          type="text" 
          id="deep-search-input" 
          placeholder="Keresés az oldalon... (Ctrl+K)"
          aria-label="Keresési kifejezés"
          style="
            width: 100%;
            padding: 10px 40px 10px 12px;
            background: rgba(0, 20, 40, 0.8);
            border: 1px solid #00eaff;
            border-radius: 6px;
            color: #00eaff;
            font-size: 15px;
            font-family: 'Exo', sans-serif;
            outline: none;
            transition: all 0.2s;
          "
        />
        <button 
          id="deep-search-clear"
          aria-label="Keresés törlése"
          style="
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #00eaff;
            cursor: pointer;
            padding: 4px;
            display: none;
            opacity: 0.7;
            transition: opacity 0.2s;
          "
        >✕</button>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <span 
          id="deep-search-counter" 
          style="
            color: #b0ffea;
            font-size: 13px;
            min-width: 60px;
            text-align: center;
            opacity: 0;
            transition: opacity 0.2s;
          "
          aria-live="polite"
          aria-atomic="true"
        ></span>
        <button 
          id="deep-search-prev" 
          aria-label="Előző találat"
          disabled
          style="
            background: rgba(0, 234, 255, 0.1);
            border: 1px solid #00eaff;
            border-radius: 4px;
            color: #00eaff;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s;
            opacity: 0.5;
          "
        >↑</button>
        <button 
          id="deep-search-next" 
          aria-label="Következő találat"
          disabled
          style="
            background: rgba(0, 234, 255, 0.1);
            border: 1px solid #00eaff;
            border-radius: 4px;
            color: #00eaff;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s;
            opacity: 0.5;
          "
        >↓</button>
        <button 
          id="deep-search-close" 
          aria-label="Keresés bezárása"
          style="
            background: rgba(255, 107, 107, 0.2);
            border: 1px solid #ff6b6b;
            border-radius: 4px;
            color: #ff6b6b;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s;
          "
        >✕</button>
      </div>
    </div>
  `;

  document.body.appendChild(searchContainer);

  // Inject styles for highlights
  const highlightStyle = document.createElement('style');
  highlightStyle.textContent = `
    .deep-search-highlight {
      background-color: rgba(255, 255, 0, 0.4);
      color: inherit;
      padding: 2px 0;
      border-radius: 2px;
      transition: background-color 0.2s;
    }
    .deep-search-highlight.active {
      background-color: rgba(255, 165, 0, 0.6);
      box-shadow: 0 0 8px rgba(255, 165, 0, 0.8);
    }
    #deep-search-input:focus {
      border-color: #7c4dff;
      box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.2);
    }
    #deep-search-prev:not(:disabled):hover,
    #deep-search-next:not(:disabled):hover {
      background: rgba(0, 234, 255, 0.2);
      transform: scale(1.05);
    }
    #deep-search-prev:not(:disabled),
    #deep-search-next:not(:disabled) {
      opacity: 1;
      cursor: pointer;
    }
    #deep-search-close:hover {
      background: rgba(255, 107, 107, 0.3);
      transform: scale(1.05);
    }
    #deep-search-clear:hover {
      opacity: 1;
    }
    .deep-search-container.active {
      top: 20px;
    }
  `;
  document.head.appendChild(highlightStyle);

  // Search state
  let searchTerm = '';
  let matches = [];
  let currentMatchIndex = -1;
  let isSearchActive = false;

  // Get references to UI elements
  const searchInput = document.getElementById('deep-search-input');
  const searchCounter = document.getElementById('deep-search-counter');
  const prevBtn = document.getElementById('deep-search-prev');
  const nextBtn = document.getElementById('deep-search-next');
  const closeBtn = document.getElementById('deep-search-close');
  const clearBtn = document.getElementById('deep-search-clear');

  // Elements to exclude from search
  const excludeSelectors = [
    'script',
    'style',
    'noscript',
    '#preloader',
    '#deep-search',
    '.lightbox',
    'svg'
  ];

  // Get all text nodes in the document
  function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip empty or whitespace-only nodes
          if (!node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip excluded elements
          let parent = node.parentElement;
          while (parent) {
            if (excludeSelectors.some(selector => parent.matches?.(selector))) {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    return textNodes;
  }

  // Clear all highlights
  function clearHighlights() {
    const highlights = document.querySelectorAll('.deep-search-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
    matches = [];
    currentMatchIndex = -1;
  }

  // Highlight all matches
  function highlightMatches(term) {
    if (!term || term.length < 2) {
      clearHighlights();
      updateUI();
      return;
    }

    clearHighlights();
    matches = [];

    const textNodes = getTextNodes(document.body);
    const searchRegex = new RegExp(escapeRegex(term), 'gi');

    textNodes.forEach(node => {
      const text = node.nodeValue;
      const matches_in_node = [];
      let match;

      while ((match = searchRegex.exec(text)) !== null) {
        matches_in_node.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }

      if (matches_in_node.length > 0) {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches_in_node.forEach(m => {
          // Add text before match
          if (m.start > lastIndex) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, m.start)));
          }

          // Add highlighted match
          const highlight = document.createElement('mark');
          highlight.className = 'deep-search-highlight';
          highlight.textContent = text.substring(m.start, m.end);
          fragment.appendChild(highlight);
          matches.push(highlight);

          lastIndex = m.end;
        });

        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }

        node.parentNode.replaceChild(fragment, node);
      }
    });

    if (matches.length > 0) {
      currentMatchIndex = 0;
      scrollToMatch(0);
    }

    updateUI();
  }

  // Escape special regex characters
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Scroll to specific match
  function scrollToMatch(index) {
    if (index < 0 || index >= matches.length) return;

    // Remove active class from all matches
    matches.forEach(m => m.classList.remove('active'));

    // Add active class to current match
    const match = matches[index];
    match.classList.add('active');

    // Scroll to match with offset for fixed header
    const rect = match.getBoundingClientRect();
    const offset = 100; // Account for header
    
    if (rect.top < offset || rect.bottom > window.innerHeight) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    currentMatchIndex = index;
    updateUI();
  }

  // Update UI state
  function updateUI() {
    if (matches.length > 0) {
      searchCounter.textContent = `${currentMatchIndex + 1} / ${matches.length}`;
      searchCounter.style.opacity = '1';
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    } else if (searchTerm.length >= 2) {
      searchCounter.textContent = 'Nincs találat';
      searchCounter.style.opacity = '1';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    } else {
      searchCounter.textContent = '';
      searchCounter.style.opacity = '0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }

    clearBtn.style.display = searchTerm.length > 0 ? 'block' : 'none';
  }

  // Show search UI
  function showSearch() {
    isSearchActive = true;
    searchContainer.classList.add('active');
    searchInput.focus();
    searchInput.select();
  }

  // Hide search UI
  function hideSearch() {
    isSearchActive = false;
    searchContainer.classList.remove('active');
    clearHighlights();
    searchInput.value = '';
    searchTerm = '';
    updateUI();
  }

  // Event listeners
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    highlightMatches(searchTerm);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevious();
      } else {
        goToNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hideSearch();
    }
  });

  prevBtn.addEventListener('click', goToPrevious);
  nextBtn.addEventListener('click', goToNext);
  closeBtn.addEventListener('click', hideSearch);
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    highlightMatches('');
    searchInput.focus();
  });

  function goToNext() {
    if (matches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    scrollToMatch(nextIndex);
  }

  function goToPrevious() {
    if (matches.length === 0) return;
    const prevIndex = currentMatchIndex - 1 < 0 ? matches.length - 1 : currentMatchIndex - 1;
    scrollToMatch(prevIndex);
  }

  // Global keyboard shortcut (Ctrl+K or Ctrl+F)
  document.addEventListener('keydown', (e) => {
    // Don't trigger if user is typing in an input/textarea (except our search)
    const isInputFocused = document.activeElement.tagName === 'INPUT' || 
                          document.activeElement.tagName === 'TEXTAREA';
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (isSearchActive) {
        hideSearch();
      } else {
        showSearch();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      // Only override browser's Ctrl+F if our search is already active
      if (isSearchActive) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Initialize UI state
  updateUI();
})();