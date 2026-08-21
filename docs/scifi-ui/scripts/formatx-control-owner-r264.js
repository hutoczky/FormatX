(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxControlOwnerR264 === 'ready') return;
  root.dataset.fxControlOwnerR264 = 'booting';

  const mobileQuery = matchMedia('(max-width: 900px)');
  let queued = false;
  let bootObserver = null;
  let bootTimer = 0;
  let menu = null;

  const language = () => root.lang === 'en' ? 'en' : 'hu';
  const isMobile = () => mobileQuery.matches;

  function clearLegacyStyle(node) {
    if (node instanceof HTMLElement && node.hasAttribute('style')) node.removeAttribute('style');
  }

  function setMenuOpen(open) {
    const nav = document.getElementById('main-nav');
    if (!(nav instanceof HTMLElement) || !(menu instanceof HTMLButtonElement)) return;
    nav.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    root.classList.toggle('fx-organism-menu-open', open);
    if (open && root.dataset.fxImmersive !== 'active') {
      root.dataset.fxImmersive = 'active';
      dispatchEvent(new CustomEvent('formatx:immersiveactivate', {
        detail: { source: 'control-owner-r264' }
      }));
    }
  }

  function canonicalMenu(topbar) {
    let current = document.querySelector('.fx-reference-menu-button');
    if (!(current instanceof HTMLButtonElement)) {
      current = document.createElement('button');
      current.className = 'fx-reference-menu-button';
      current.type = 'button';
      current.innerHTML = '<span></span><span></span>';
      topbar.appendChild(current);
    }

    if (current.dataset.fxControlOwnerR264 !== 'true') {
      const clean = current.cloneNode(true);
      clean.removeAttribute('style');
      clean.dataset.fxControlOwnerR264 = 'true';
      current.replaceWith(clean);
      current = clean;
    }

    // The r244 runtime uses this marker before installing its own target click
    // handler. Mark the canonical clone as already bound so an earlier r264 boot
    // cannot be followed by a second legacy handler that re-closes the menu.
    current.dataset.fxR244Bound = 'true';

    for (const duplicate of Array.from(document.querySelectorAll('#menu-toggle'))) {
      if (duplicate !== current) {
        duplicate.removeAttribute('id');
        if (duplicate instanceof HTMLElement) duplicate.dataset.fxLegacyMenu = 'true';
      }
    }

    current.id = 'menu-toggle';
    current.type = 'button';
    current.classList.add('fx-reference-menu-button', 'fx-control-owner-r264');
    current.hidden = false;
    current.removeAttribute('aria-hidden');
    current.removeAttribute('tabindex');
    current.setAttribute('aria-controls', 'main-nav');
    current.setAttribute('aria-label', language() === 'en' ? 'Menu' : 'Menü');
    if (!current.hasAttribute('aria-expanded')) current.setAttribute('aria-expanded', 'false');
    clearLegacyStyle(current);

    if (current.dataset.fxControlMenuBoundR264 !== 'true') {
      current.dataset.fxControlMenuBoundR264 = 'true';
      current.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const nav = document.getElementById('main-nav');
        const open = nav instanceof HTMLElement && nav.classList.contains('open');
        setMenuOpen(!open);
      });
    }

    menu = current;
    if (menu.parentElement !== topbar) topbar.appendChild(menu);
    return menu;
  }

  function canonicalHeader(hero) {
    const topbar = document.querySelector('.topbar');
    if (!(topbar instanceof HTMLElement)) return false;

    let mag = document.querySelector('.fx-reference-mag-button');
    if (!(mag instanceof HTMLButtonElement)) {
      mag = document.createElement('button');
      mag.type = 'button';
      mag.className = 'fx-reference-mag-button';
      topbar.appendChild(mag);
    }
    mag.classList.add('fx-control-owner-r264');
    mag.textContent = language() === 'en' ? 'CORE' : 'MAG';
    mag.setAttribute('aria-label', language() === 'en' ? 'Focus the living core' : 'Az élő mag fókuszálása');
    mag.hidden = false;
    mag.removeAttribute('aria-hidden');
    clearLegacyStyle(mag);
    if (mag.parentElement !== topbar) topbar.appendChild(mag);

    if (mag.dataset.fxControlMagBoundR264 !== 'true') {
      mag.dataset.fxControlMagBoundR264 = 'true';
      mag.addEventListener('click', () => {
        hero.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        window.FormatXCoreMobileV69?.pulse?.();
      });
    }

    const lang = document.querySelector('.fx-language-toggle');
    if (lang instanceof HTMLButtonElement) {
      lang.classList.add('fx-control-owner-r264');
      lang.hidden = false;
      lang.removeAttribute('aria-hidden');
      clearLegacyStyle(lang);
      if (lang.parentElement !== topbar) topbar.appendChild(lang);
    }

    canonicalMenu(topbar);

    for (const legacy of document.querySelectorAll('.menu-toggle:not(.fx-reference-menu-button), .fx-organism-system-toggle:not(.fx-reference-menu-button), [data-fx-legacy-menu="true"]')) {
      if (!(legacy instanceof HTMLElement)) continue;
      legacy.hidden = true;
      legacy.setAttribute('aria-hidden', 'true');
      legacy.setAttribute('tabindex', '-1');
    }

    root.dataset.fxReferenceHeaderLayout = isMobile() ? 'r264-mobile-no-overlap' : 'r264-desktop-three-control';
    return true;
  }

  function ensureAsk(rail) {
    let ask = rail.querySelector('.fx-reference-ask');
    if (!(ask instanceof HTMLButtonElement)) {
      ask = document.createElement('button');
      ask.className = 'fx-reference-ask';
      ask.type = 'button';
      rail.prepend(ask);
    }
    if (!ask.querySelector('i')) ask.prepend(document.createElement('i'));
    let label = ask.querySelector('span');
    if (!(label instanceof HTMLElement)) {
      label = document.createElement('span');
      ask.appendChild(label);
    }
    label.textContent = language() === 'en' ? 'ASK' : 'KÉRDEZZ';
    ask.setAttribute('aria-label', language() === 'en' ? 'Ask FormatX' : 'Kérdezz a FormatX-től');
    if (ask.dataset.fxControlAskBoundR264 !== 'true') {
      ask.dataset.fxControlAskBoundR264 = 'true';
      ask.addEventListener('click', () => {
        if (window.FormatXOrganismVoice?.open) window.FormatXOrganismVoice.open();
        else document.querySelector('.fx-organism-thought-trigger')?.click();
        window.FormatXCoreMobileV69?.pulse?.();
      });
    }
    return ask;
  }

  function ensurePause(rail) {
    let pause = rail.querySelector('.fx-reference-pause');
    if (!(pause instanceof HTMLButtonElement)) {
      pause = document.createElement('button');
      pause.className = 'fx-reference-pause';
      pause.type = 'button';
      pause.textContent = 'Ⅱ';
      rail.appendChild(pause);
    }
    if (!pause.textContent.trim()) pause.textContent = 'Ⅱ';
    return pause;
  }

  function canonicalControls(hero) {
    const grid = hero.querySelector(':scope > .hero-grid');
    const space = grid?.querySelector(':scope > .hero-space');
    if (!(grid instanceof HTMLElement) || !(space instanceof HTMLElement)) return false;

    let controls = hero.querySelector('.fx-reference-controls-r204');
    if (!(controls instanceof HTMLElement)) {
      controls = document.createElement('div');
      controls.className = 'fx-reference-controls-r204';
    }
    controls.classList.add('fx-reference-controls-r264');
    controls.setAttribute('aria-label', language() === 'en' ? 'Hero controls' : 'Hero vezérlők');

    let rail = controls.querySelector(':scope > .fx-reference-rail') || hero.querySelector('.fx-reference-rail');
    if (!(rail instanceof HTMLElement)) {
      rail = document.createElement('div');
      rail.className = 'fx-reference-rail';
    }
    rail.classList.add('fx-reference-rail-r264');

    const ask = ensureAsk(rail);
    const pause = ensurePause(rail);
    const sound = document.querySelector('.fx-three-sound');

    if (sound instanceof HTMLButtonElement) {
      sound.classList.add('fx-control-owner-r264');
      sound.hidden = false;
      sound.removeAttribute('aria-hidden');
      if (sound.parentElement !== controls) controls.prepend(sound);
    }
    if (rail.parentElement !== controls) controls.appendChild(rail);

    const owner = isMobile() ? grid : space;
    if (controls.parentElement !== owner) owner.appendChild(controls);

    for (const node of [controls, rail, sound, ask, pause, ask.querySelector('span')]) clearLegacyStyle(node);

    root.dataset.fxReferenceControlLayout = isMobile() ? 'r264-mobile-three-cell' : 'r264-desktop-three-cell';
    return sound instanceof HTMLButtonElement;
  }

  function apply() {
    queued = false;
    const hero = document.getElementById('hero');
    if (!(hero instanceof HTMLElement)) return false;
    const headerReady = canonicalHeader(hero);
    const controlsReady = canonicalControls(hero);
    if (headerReady && controlsReady) {
      root.dataset.fxControlOwnerR264 = 'ready';
      if (bootObserver) bootObserver.disconnect();
      bootObserver = null;
      if (bootTimer) clearTimeout(bootTimer);
      bootTimer = 0;
      dispatchEvent(new CustomEvent('formatx:controlownerready', { detail: { mobile: isMobile() } }));
      return true;
    }
    return false;
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      apply();
      queueMicrotask(apply);
    });
  }

  function boot() {
    if (apply()) return;
    if (bootObserver) return;
    const target = document.body || document.documentElement;
    bootObserver = new MutationObserver(schedule);
    bootObserver.observe(target, { subtree: true, childList: true });
    bootTimer = setTimeout(() => {
      if (bootObserver) bootObserver.disconnect();
      bootObserver = null;
      bootTimer = 0;
      apply();
    }, 5000);
  }

  document.addEventListener('pointerdown', event => {
    if (!(menu instanceof HTMLButtonElement)) return;
    const nav = document.getElementById('main-nav');
    if (!(nav instanceof HTMLElement) || !nav.classList.contains('open')) return;
    const target = event.target;
    if (target instanceof Node && (menu.contains(target) || nav.contains(target))) return;
    setMenuOpen(false);
  }, true);

  document.addEventListener('click', event => {
    const nav = document.getElementById('main-nav');
    if (!(nav instanceof HTMLElement) || !nav.classList.contains('open')) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('#main-nav a[href]')) setMenuOpen(false);
  }, true);

  addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  for (const eventName of [
    'formatx:languagechange',
    'formatx:real3dready',
    'formatx:coredetailready',
    'formatx:organisminterfaceready',
    'formatx:mobilelayoutready',
    'pageshow',
    'load'
  ]) addEventListener(eventName, schedule, { passive: true });

  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
