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
  
  // Proper base64 encoding for unicode
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  img.src = 'data:image/svg+xml;base64,' + encoded;
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
  if (pre) setTimeout(() => pre.classList.add("hidden"), 850);
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
(function initDeepSearch(){
  // Inject styles (alap + LCARS scope)
  const s = document.createElement('style');
  s.textContent = `
  .site-header .nav .site-search { position: relative; display: inline-flex; align-items: center; margin-left: .5rem; }
  .site-header .nav .site-search input[type="search"]{
    width: 11.5rem; max-width: 42vw; padding: .48rem .7rem;
    border-radius: 12px; border: 1px solid rgba(255,255,255,.16);
    background: rgba(0,0,0,.18); color: inherit; outline: none;
    transition: width .15s ease, background .15s ease, box-shadow .15s ease;
  }
  .site-header .nav .site-search input[type="search"]::placeholder{ opacity: .6; }
  .site-header .nav .site-search input[type="search"]:focus{
    width: 16rem; background: rgba(0,0,0,.24); box-shadow: 0 0 0 2px rgba(0,234,255,.25);
  }
  .site-header .nav .search-results{
    position: absolute; top: calc(100% + 6px); left: 0; right: 0; max-height: 60vh; overflow: auto;
    background: rgba(8,12,20,.96); border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.35); padding: .4rem; display: none; z-index: 1200;
  }
  .site-header .nav .search-results[aria-expanded="true"]{ display: block; }
  .site-header .nav .search-results .result{
    display: grid; grid-template-columns: 1.2rem 1fr; gap: .6rem; align-items: start;
    padding: .42rem .5rem; border-radius: 8px; color: inherit; text-decoration: none;
  }
  .site-header .nav .search-results .result:hover,
  .site-header .nav .search-results .result[aria-selected="true"]{
    background: rgba(0,234,255,.12);
  }
  .site-header .nav .search-results .result .icn{
    width: .9rem; height: .9rem; border-radius: 4px; margin-top: .15rem;
    background: linear-gradient(180deg, #00eaff, #7c4dff); opacity: .8;
  }
  .site-header .nav .search-results .result .title{ font-weight: 700; letter-spacing: .02em; }
  .site-header .nav .search-results .result .text{ opacity: .8; font-size: .9em; }
  .site-header .nav .search-results mark{ background: rgba(255,209,102,.28); color: inherit; padding: 0 .05em; border-radius: 3px; }
  /* LCARS scope finomítások */
  html[data-franchise-theme="lcars"] .site-header .nav .site-search input[type="search"],
  body.theme-lcars .site-header .nav .site-search input[type="search"]{
    border-color: rgba(255,255,255,.12);
    background: rgba(5,10,18,.18);
  }
  html[data-franchise-theme="lcars"] .site-header .nav .site-search input[type="search"]:focus,
  body.theme-lcars .site-header .nav .site-search input[type="search"]:focus{
    box-shadow: 0 0 0 2px var(--lcars-cyan, #7EC8FF);
    background: rgba(5,10,18,.24);
  }
  html[data-franchise-theme="lcars"] .site-header .nav .search-results,
  body.theme-lcars .site-header .nav .search-results{
    background: var(--lcars-ink, #0B0F18);
    border-color: rgba(255,255,255,.14);
  }
  `;
  document.head.appendChild(s);

  const nav = document.querySelector('.site-header .nav');
  if (!nav) return;

  const wrap = document.createElement('div');
  wrap.className = 'site-search';
  wrap.setAttribute('role', 'search');
  wrap.innerHTML = `
    <input id="site-search-input" type="search" placeholder="Keresés…" autocomplete="off" aria-label="Keresés a lapon" />
    <div id="site-search-results" class="search-results" role="listbox" aria-expanded="false" aria-label="Keresési találatok"></div>
  `;
  const toggle = nav.querySelector('#theme-toggle');
  if (toggle && toggle.parentElement === nav) {
    toggle.insertAdjacentElement('afterend', wrap);
  } else {
    nav.appendChild(wrap);
  }

  const input = wrap.querySelector('#site-search-input');
  const resultsEl = wrap.querySelector('#site-search-results');

  const normalize = (s) => (s || "")
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const index = [];
  const push = (title, text, href, type) => {
    const nt = normalize(title);
    const nx = normalize(text);
    index.push({ title, text, href, nt, nx, type });
  };

  document.querySelectorAll('section .section-title').forEach(h => {
    const section = h.closest('section');
    if (!section) return;
    const title = h.textContent.trim();
    const desc = section.querySelector('.demo-desc, p')?.textContent?.trim() || '';
    push(title, desc, `#${section.id || ''}`, 'section');
  });

  document.querySelectorAll('#features .card').forEach(card => {
    const title = card.querySelector('h3')?.textContent?.trim() || 'Funkció';
    const text = card.querySelector('p')?.textContent?.trim() || '';
    push(title, text, '#features', 'card');
  });

  document.querySelectorAll('[data-gallery="pro"] .gallery-item').forEach(item => {
    const caption = item.querySelector('.gallery-caption')?.textContent?.trim() || '';
    const imgAlt = item.querySelector('img')?.alt?.trim() || '';
    const text = [caption, imgAlt].filter(Boolean).join(' — ');
    push(caption || imgAlt || 'Galéria elem', text, '#pro', 'gallery');
  });

  document.querySelectorAll('#download .download-card').forEach(a => {
    const title = a.querySelector('h3')?.textContent?.trim() || 'Letöltés';
    const text = a.querySelector('p')?.textContent?.trim() || '';
    const href = a.getAttribute('href') || '#download';
    push(title, text, href, 'download');
  });

  document.querySelectorAll('#docs .docs-card').forEach a => {
    const title = a.querySelector('h3')?.textContent?.trim() || 'Dokumentum';
    const text = a.querySelector('p')?.textContent?.trim() || '';
    const href = a.getAttribute('href') || '#docs';
    push(title, text, href, 'doc');
  });

  const scoreItem = (item, qTokens, qRaw) => {
    let s = 0;
    if (item.nt.includes(qRaw)) s += 12;
    if (item.nx.includes(qRaw)) s += 6;

    for (const t of qTokens) {
      if (!t) continue;
      if (item.nt.includes(t)) s += 8;
      if (item.nx.includes(t)) s += 3;
      if (item.nt.startsWith(t)) s += 2;
    }
    switch(item.type){
      case 'section': s += 2; break;
      case 'download': s += 1; break;
    }
    return s;
  };

  const highlight = (text, tokens) => {
    if (!text) return '';
    let out = text;
    const uniq = Array.from(new Set(tokens.filter(Boolean))).sort((a,b)=>b.length-a.length);
    for (const tok of uniq) {
      const esc = tok.replace(/[.*+?^${}()|[\\]]/g, '\\$&');
      out = out.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
    }
    return out;
  };

  const render = (items, tokens) => {
    resultsEl.innerHTML = '';
    if (!items.length) {
      resultsEl.setAttribute('aria-expanded', 'false');
      return;
    }
    const frag = document.createDocumentFragment();
    items.slice(0, 8).forEach((it, i) => {
      const a = document.createElement('a');
      a.className = 'result';
      a.setAttribute('role', 'option');
      a.setAttribute('data-index', String(i));
      a.href = it.href || '#';
      a.innerHTML = `
        <span class="icn" aria-hidden="true"></span>
        <span class="meta">
          <div class="title">${highlight(it.title, tokens)}</div>
          <div class="text">${highlight(it.text, tokens)}</div>
        </span>
      `;
      frag.appendChild(a);
    });
    resultsEl.appendChild(frag);
    resultsEl.setAttribute('aria-expanded', 'true');
    activeIndex = -1;
  };

  let activeIndex = -1;

  const moveActive = (dir) => {
    const items = Array.from(resultsEl.querySelectorAll('.result'));
    if (!items.length) return;
    activeIndex = (activeIndex + dir + items.length) % items.length;
    items.forEach(el => el.setAttribute('aria-selected', 'false'));
    items[activeIndex].setAttribute('aria-selected', 'true');
    items[activeIndex].scrollIntoView({ block: 'nearest' });
  };

  const openActive = () => {
    const el = resultsEl.querySelector(`.result[aria-selected="true"]`) || resultsEl.querySelector('.result');
    if (el) {
      window.location.href = el.getAttribute('href') || '#';
      resultsEl.setAttribute('aria-expanded', 'false');
      input.blur();
    }
  };

  const handleQuery = (q) => {
    const qn = normalize(q).trim();
    if (!qn) {
      resultsEl.setAttribute('aria-expanded', 'false');
      resultsEl.innerHTML = '';
      return;
    }
    const tokens = qn.split(/\s+/).filter(Boolean);
    const scored = index
      .map(item => ({ item, s: scoreItem(item, tokens, qn) }))
      .filter(x => x.s > 0)
      .sort((a,b) => b.s - a.s)
      .map(x => x.item);
    render(scored, tokens);
  };

  input.addEventListener('input', (e) => handleQuery(e.target.value));
  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); moveActive(1); break;
      case 'ArrowUp': e.preventDefault(); moveActive(-1); break;
      case 'Enter': e.preventDefault(); openActive(); break;
      case 'Escape':
        resultsEl.setAttribute('aria-expanded', 'false');
        input.blur();
        break;
    }
  });

  document.addEventListener('keydown', (e) => {
    const target = e.target;
    const isMod = e.ctrlKey || e.metaKey;
    const isEditing = (target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ));
    if (isEditing) return;

    if (e.key === '/' || (isMod && (e.key.toLowerCase() === 'k'))) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      resultsEl.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ============ LCARS overlay enable + central console waves ============ */
(function enableLcarsOverlay(){
  const css = `
  /* Ensure overlay visible only in LCARS; keep it hidden in CP2077/Cyberpunk */
  html[data-franchise-theme="lcars"] .bridge-screens,
  body.theme-lcars .bridge-screens { display: grid !important; }
  html[data-franchise-theme="cyberpunk"] .bridge-screens,
  body.theme-cyberpunk .bridge-screens,
  html[data-franchise-theme="cp2077"] .bridge-screens,
  body.theme-cp2077 .bridge-screens { display: none !important; }

  /* Hide legacy radar HUD inside main-hud under LCARS */
  html[data-franchise-theme="lcars"] .screen.main-hud > svg,
  body.theme-lcars .screen.main-hud > svg { display: none !important; }

  /* Animated wave bands (data-URI SVG) scrolling horizontally */
  html[data-franchise-theme="lcars"] .screen.main-hud::before,
  body.theme-lcars .screen.main-hud::before {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    background-color: rgba(6, 10, 18, .65);
    background-image:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 400'><rect width='1600' height='400' fill='none'/><path d='M0 200 C 220 150 420 250 640 200 S 1060 150 1280 200 S 1480 250 1600 200' stroke='%237EC8FF' stroke-width='5' fill='none' opacity='0.95'/><path d='M0 245 C 220 195 420 295 640 245 S 1060 195 1280 245 S 1480 295 1600 245' stroke='%23FFCE66' stroke-width='4' fill='none' opacity='0.9'/><path d='M0 290 C 220 240 420 340 640 290 S 1060 240 1280 290 S 1480 340 1600 290' stroke='%23E08AA3' stroke-width='3.5' fill='none' opacity='0.85'/></svg>");
    background-repeat: repeat-x;
    background-size: 1600px 100%;
    background-position: 0 50%;
    animation: lcars-wave-pan 26s linear infinite;
    box-shadow:
      inset 0 0 0 1px rgba(126,200,255,.22),
      inset 0 16px 28px rgba(0,0,0,.28),
      0 0 24px rgba(0,234,255,.08);
  }

  /* Console grid + bezel overlay */
  html[data-franchise-theme="lcars"] .screen.main-hud::after,
  body.theme-lcars .screen.main-hud::after {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,.12)),
      repeating-linear-gradient(
        to right,
        rgba(126,200,255,.10) 0 1px,
        transparent 1px 28px
      ),
      repeating-linear-gradient(
        to bottom,
        rgba(126,200,255,.08) 0 1px,
        transparent 1px 24px
      );
    box-shadow:
      inset 0 0 0 2px rgba(0,234,255,.18),
      inset 0 0 0 1px rgba(126,200,255,.25),
      0 6px 32px rgba(0,0,0,.35);
  }

  @keyframes lcars-wave-pan { 0%{ background-position: 0 50%; } 100%{ background-position: -1600px 50%; } }

  /* Harmonize side panels under LCARS */
  html[data-franchise-theme="lcars"] .wave-path,
  body.theme-lcars .wave-path { stroke: var(--lcars-amber, #FFCE66); filter: drop-shadow(0 0 6px rgba(255,206,102,.5)); }
  html[data-franchise-theme="lcars"] .eq .bar,
  body.theme-lcars .eq .bar { background: linear-gradient(180deg, var(--lcars-cyan, #7EC8FF), var(--lcars-cyan-2, #00EAFF)); box-shadow: 0 0 10px rgba(0,234,255,.25); opacity: .78; }
  html[data-franchise-theme="lcars"] .list::before,
  html[data-franchise-theme="lcars"] .list::after,
  body.theme-lcars .list::before,
  body.theme-lcars .list::after { background: linear-gradient(90deg, transparent, rgba(126,200,255,.12), transparent); }
  html[data-franchise-theme="lcars"] .list .col,
  body.theme-lcars .list .col { background: repeating-linear-gradient(to bottom, rgba(126,200,255,.26) 0 1px, transparent 1px 21px); border-right: 1px solid rgba(126,200,255,.22); }

  /* Pause the wave animation when tab hidden */
  html:not([data-tab-visible="true"]) .screen.main-hud::before { animation-play-state: paused !important; }

  /* Reduced motion: disable */
  @media (prefers-reduced-motion: reduce){
    html[data-franchise-theme="lcars"] .screen.main-hud::before,
    body.theme-lcars .screen.main-hud::before { animation: none !important; }
  }
  `;
  const st = document.createElement('style');
  st.setAttribute('data-lcars-console', 'true');
  st.textContent = css;
  document.head.appendChild(st);
})();
