(function () {
  'use strict';

  // r256 performance/stability pass.
  // CSS owns geometry; this runtime only reconciles DOM/control state. In the
  // Worker-served production page, r207 remains the single physical mobile owner.
  const root = document.documentElement;
  const VERSION = 'r244-reference-frame';
  let queued = false;
  let bootObserver = null;
  let bootTimer = 0;

  const isMobile = () => matchMedia('(max-width: 900px)').matches;
  const copy = () => root.lang === 'en' ? {
    heading: 'DISCOVER HOW IT WORKS',
    title: 'Proof behind the visual.',
    body: 'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.',
    ask: 'ASK'
  } : {
    heading: 'A MŰKÖDÉS MEGISMERÉSE',
    title: 'Bizonyíték a látvány mögött.',
    body: 'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.',
    ask: 'KÉRDEZZ'
  };

  const LAYOUT_PROPERTIES = [
    'position', 'inset', 'top', 'right', 'bottom', 'left', 'display',
    'flex-direction', 'align-items', 'align-self', 'justify-content',
    'grid-area', 'grid-row', 'grid-column', 'grid-template-columns',
    'grid-template-rows', 'order', 'width', 'min-width', 'max-width',
    'height', 'min-height', 'max-height', 'margin', 'margin-top',
    'margin-right', 'margin-bottom', 'margin-left', 'padding',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'overflow', 'clip', 'clip-path', 'white-space', 'transform',
    'translate', 'flex', 'visibility', 'opacity', 'pointer-events',
    'border', 'border-radius', 'z-index', 'filter', 'mix-blend-mode'
  ];

  function ensureStyleLast() {
    const style = document.querySelector('link[data-fx-reference-production-r244]');
    if (style instanceof HTMLLinkElement && style.parentElement === document.head && style !== document.head.lastElementChild) {
      document.head.appendChild(style);
    }
  }

  function clearInlineLayout(node) {
    if (!(node instanceof HTMLElement)) return;
    for (const property of LAYOUT_PROPERTIES) node.style.removeProperty(property);
  }

  function important(node, property, value) {
    if (node instanceof HTMLElement) node.style.setProperty(property, value, 'important');
  }

  function ensureDesktopHeaderControls(hero) {
    const bar = document.querySelector('.topbar');
    if (!(bar instanceof HTMLElement)) return {};

    let mag = document.querySelector('.fx-reference-mag-button');
    if (!(mag instanceof HTMLButtonElement)) {
      mag = document.createElement('button');
      mag.className = 'fx-reference-mag-button';
      mag.type = 'button';
      bar.appendChild(mag);
    }

    let menu = document.querySelector('.fx-reference-menu-button');
    if (!(menu instanceof HTMLButtonElement)) {
      menu = document.createElement('button');
      menu.className = 'fx-reference-menu-button';
      menu.type = 'button';
      menu.innerHTML = '<span></span><span></span>';
      menu.setAttribute('aria-expanded', 'false');
      bar.appendChild(menu);
    }

    const language = document.querySelector('.fx-language-toggle');
    if (language instanceof HTMLElement && language.parentElement !== bar) bar.appendChild(language);
    if (mag.parentElement !== bar) bar.appendChild(mag);
    if (menu.parentElement !== bar) bar.appendChild(menu);

    if (mag.dataset.fxR244Bound !== 'true') {
      mag.dataset.fxR244Bound = 'true';
      mag.addEventListener('click', () => {
        hero.scrollIntoView({
          block: 'start',
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
        window.FormatXCoreMobileV69?.pulse?.();
      });
    }

    if (menu.dataset.fxR244Bound !== 'true') {
      menu.dataset.fxR244Bound = 'true';
      menu.addEventListener('click', () => {
        const original = document.querySelector('#fx-reference-legacy-menu, .menu-toggle:not(.fx-reference-menu-button), .fx-organism-system-toggle:not(.fx-reference-menu-button)');
        const nav = document.getElementById('main-nav');
        const wasOpen = nav instanceof HTMLElement && nav.classList.contains('open');

        if (root.dataset.fxImmersive !== 'active') {
          root.dataset.fxImmersive = 'active';
          dispatchEvent(new CustomEvent('formatx:immersiveactivate', {
            detail: { source: 'reference-menu-r244' }
          }));
        }

        if (original instanceof HTMLButtonElement) original.click();
        const controllerChangedState = nav instanceof HTMLElement
          && nav.classList.contains('open') !== wasOpen;

        if (nav instanceof HTMLElement && !controllerChangedState) {
          nav.classList.toggle('open', !wasOpen);
          root.classList.toggle('fx-organism-menu-open', !wasOpen);
          original?.classList.toggle('open', !wasOpen);
          original?.setAttribute('aria-expanded', String(!wasOpen));
        }

        const open = nav instanceof HTMLElement && nav.classList.contains('open');
        menu.setAttribute('aria-expanded', String(open));
      });
    }

    return { bar, mag, language, menu };
  }

  function ensureReferenceNodes(hero, grid, space) {
    const strings = copy();

    const headings = Array.from(hero.querySelectorAll('.fx-reference-heading'));
    const heading = headings.shift() || document.createElement('div');
    headings.forEach(node => node.remove());
    heading.className = 'fx-reference-heading';
    if (heading.textContent !== strings.heading) heading.textContent = strings.heading;

    const proofs = Array.from(hero.querySelectorAll('.fx-reference-proof'));
    const proof = proofs.shift() || document.createElement('article');
    proofs.forEach(node => node.remove());
    proof.className = 'fx-reference-proof';

    if (!proof.querySelector('.fx-reference-proof-kicker, h2, p, .fx-reference-liveos')) {
      proof.innerHTML = '<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2></h2><p></p><a class="fx-reference-liveos" href="#experience">Live OS</a>';
    }

    const kicker = proof.querySelector('.fx-reference-proof-kicker');
    const title = proof.querySelector('h2');
    const body = proof.querySelector('p');
    const live = proof.querySelector('.fx-reference-liveos');

    if (kicker && kicker.textContent !== 'PUBLIC PROOF LAYER') kicker.textContent = 'PUBLIC PROOF LAYER';
    if (title && title.textContent !== strings.title) title.textContent = strings.title;
    if (body && body.textContent !== strings.body) body.textContent = strings.body;

    if (live instanceof HTMLAnchorElement) {
      if (live.textContent !== 'Live OS') live.textContent = 'Live OS';
      live.href = '#experience';
      live.setAttribute('aria-label', root.lang === 'en' ? 'Open Live OS' : 'Live OS megnyitása');
    }

    let rail = hero.querySelector('.fx-reference-rail');
    if (!(rail instanceof HTMLElement)) {
      rail = document.createElement('div');
      rail.className = 'fx-reference-rail';
      rail.innerHTML = '<button class="fx-reference-ask" type="button" aria-label="Kérdezz"><i aria-hidden="true"></i><span>KÉRDEZZ</span></button><button class="fx-reference-pause" type="button" aria-label="Animáció szüneteltetése" data-paused="false">Ⅱ</button>';
    }

    const askLabel = rail.querySelector('.fx-reference-ask span');
    if (askLabel && askLabel.textContent !== strings.ask) askLabel.textContent = strings.ask;

    let controls = hero.querySelector('.fx-reference-controls-r204');
    if (!(controls instanceof HTMLElement)) {
      controls = document.createElement('div');
      controls.className = 'fx-reference-controls-r204';
      controls.setAttribute('aria-label', root.lang === 'en' ? 'Hero controls' : 'Hero vezérlők');
    }

    controls.querySelectorAll('.fx-three-sound').forEach(sound => document.body.appendChild(sound));
    if (rail.parentElement !== controls) controls.appendChild(rail);

    if (space.nextElementSibling !== heading) space.after(heading);
    if (heading.nextElementSibling !== proof) heading.after(proof);

    return { heading, proof, live, rail, controls };
  }

  function reconcile() {
    queued = false;

    const hero = document.getElementById('hero');
    const grid = hero?.querySelector('.hero-grid');
    const space = hero?.querySelector('.hero-space');
    if (!(hero instanceof HTMLElement) || !(grid instanceof HTMLElement) || !(space instanceof HTMLElement)) return false;

    ensureStyleLast();

    const mobile = isMobile();
    const canonicalMobileOwner = mobile
      && document.querySelector('link[data-fx-mobile-layout-r207]') instanceof HTMLLinkElement;

    if (mobile) {
      root.dataset.fxMobileLayoutOwner = canonicalMobileOwner ? 'r207-normal-flow' : VERSION;
      root.dataset.fxReferenceProductionR244 = 'ready';
      root.dataset.fxReferenceComposition = 'reference-frame-r244';
    } else {
      if (root.dataset.fxMobileLayoutOwner === VERSION || root.dataset.fxMobileLayoutOwner === 'r207-normal-flow') delete root.dataset.fxMobileLayoutOwner;
      root.dataset.fxReferenceProductionR244 = 'desktop';
      root.dataset.fxReferenceComposition = 'desktop-reference-r244';
    }

    const header = ensureDesktopHeaderControls(hero);
    const nodes = ensureReferenceNodes(hero, grid, space);
    const brand = header.bar?.querySelector('.brand');
    const brandTagline = brand?.querySelector('small');
    const heroCopy = hero.querySelector('.hero-copy');
    const download = hero.querySelector('.fx-mobile-download-r151');
    const stage = hero.querySelector('.fx-core-mobile-v55-stage, .fx-core-r112-stage');
    const mainCanvas = stage?.querySelector('.fx-core-mobile-v55-canvas, .fx-core-r112-canvas');
    const detailCanvas = stage?.querySelector('.fx-core-detail-r122');
    const liveLayer = stage?.querySelector('.fx-core-live-r147-layer');

    [
      header.bar, brand, header.mag, header.language, header.menu,
      hero, grid, space, heroCopy, download,
      nodes.heading, nodes.proof, nodes.live, nodes.rail, nodes.controls,
      stage, mainCanvas, detailCanvas, liveLayer
    ].forEach(clearInlineLayout);

    if (mobile) {
      const controlOwner = canonicalMobileOwner ? grid : hero;
      if (nodes.controls.parentElement !== controlOwner) controlOwner.appendChild(nodes.controls);
      important(stage, 'transform', 'scaleY(.97)');
      important(stage, 'transform-origin', '50% 0');
    } else if (nodes.controls.parentElement !== space) {
      space.appendChild(nodes.controls);
    }

    if (brandTagline && brandTagline.textContent !== 'LIVING SYSTEM') brandTagline.textContent = 'LIVING SYSTEM';

    if (header.mag instanceof HTMLButtonElement) {
      header.mag.textContent = root.lang === 'en' ? 'CORE' : 'MAG';
      header.mag.setAttribute('aria-label', root.lang === 'en' ? 'Focus the living core' : 'Az élő mag fókuszálása');
    }

    if (header.menu instanceof HTMLButtonElement) {
      header.menu.setAttribute('aria-label', root.lang === 'en' ? 'Menu' : 'Menü');
    }

    document.querySelectorAll('.fx-loop-hero-clone').forEach(node => node.setAttribute('aria-hidden', 'true'));
    document.querySelectorAll('.skip-link').forEach(link => {
      if (document.activeElement === link && !link.matches(':focus-visible')) link.blur();
    });

    root.dataset.fxReferenceRuntimeR254 = canonicalMobileOwner
      ? 'event-driven-r207-owner'
      : 'event-driven-standalone';
    return true;
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(reconcile);
  }

  function stopBootObserver() {
    if (bootObserver) bootObserver.disconnect();
    bootObserver = null;
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = 0;
  }

  function boot() {
    if (reconcile()) return;
    if (bootObserver) return;

    const target = document.body || document.documentElement;
    bootObserver = new MutationObserver(() => {
      if (reconcile()) stopBootObserver();
    });
    bootObserver.observe(target, { subtree: true, childList: true });

    bootTimer = setTimeout(() => {
      stopBootObserver();
      reconcile();
    }, 5000);
  }

  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });

  for (const eventName of [
    'formatx:real3dready',
    'formatx:coredetailready',
    'formatx:languagechange',
    'formatx:organisminterfaceready'
  ]) {
    addEventListener(eventName, schedule);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
