// Dátum a láblécben
document.getElementById("year").textContent = new Date().getFullYear().toString();

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