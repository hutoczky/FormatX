(function () {
  'use strict';

  /* r408 — semantic reference compatibility layer.
     r244 still creates the reference copy/control DOM required by older modules,
     but it no longer writes physical geometry. The render-blocking CSS plus the
     canonical r268 owner are the only geometry authorities. This removes the
     r244 -> r268 layout ping-pong that was visible to Lighthouse as CLS. */
  const root = document.documentElement;
  const VERSION = 'r244-reference-frame';
  let queued = false;
  let bootObserver = null;
  let bootTimer = 0;

  function installKeyboardModality() {
    if (root.dataset.fxKeyboardNavigationInstalledR425 === 'true') return;
    root.dataset.fxKeyboardNavigationInstalledR425 = 'true';
    root.dataset.fxKeyboardNavigationR425 = 'false';
    addEventListener('keydown', event => {
      if (event.key === 'Tab') root.dataset.fxKeyboardNavigationR425 = 'true';
    }, true);
    addEventListener('pointerdown', () => {
      root.dataset.fxKeyboardNavigationR425 = 'false';
      const skip = document.querySelector('.skip-link');
      if (skip === document.activeElement) skip.blur();
    }, { capture: true, passive: true });
  }

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

  // Existing validators and integrations intentionally keep this named no-op.
  // Stylesheet order is static; moving links at runtime would re-run the cascade.
  function ensureStyleLast() {}

  function mutedIcon() {
    return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M16 9l5 6"/><path d="M21 9l-5 6"/></svg></span>';
  }

  function ensureHeaderControls() {
    const bar = document.querySelector('.topbar');
    if (!(bar instanceof HTMLElement)) return {};

    let mag = document.querySelector('.fx-reference-mag-button');
    if (!(mag instanceof HTMLButtonElement)) {
      mag = document.createElement('button');
      mag.className = 'fx-reference-mag-button fx-control-owner-r264';
      mag.type = 'button';
      bar.appendChild(mag);
    }

    let menu = document.querySelector('.fx-reference-menu-button');
    if (!(menu instanceof HTMLButtonElement)) {
      menu = document.createElement('button');
      menu.className = 'fx-reference-menu-button fx-control-owner-r264';
      menu.type = 'button';
      menu.innerHTML = '<span></span><span></span>';
      menu.setAttribute('aria-expanded', 'false');
      bar.appendChild(menu);
    }
    // r268 uses document-level capture ownership, therefore this node can be
    // declared canonical immediately without cloning/replacing it later.
    menu.dataset.fxControlOwnerR268 = 'true';
    menu.dataset.fxControlOwnerR264 = 'true';

    const language = document.querySelector('.fx-language-toggle');
    if (language instanceof HTMLElement && language.parentElement !== bar) bar.appendChild(language);
    if (mag.parentElement !== bar) bar.appendChild(mag);
    if (menu.parentElement !== bar) bar.appendChild(menu);

    const magText = root.lang === 'en' ? 'CORE' : 'MAG';
    if (mag.textContent !== magText) mag.textContent = magText;
    mag.setAttribute('aria-label', root.lang === 'en' ? 'Focus the living core' : 'Az élő mag fókuszálása');
    menu.setAttribute('aria-label', root.lang === 'en' ? 'Menu' : 'Menü');

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
      live.textContent = 'Live OS';
      live.href = '#experience';
      live.setAttribute('aria-label', root.lang === 'en' ? 'Open Live OS' : 'Live OS megnyitása');
    }

    let controls = hero.querySelector('.fx-reference-controls-r204');
    if (!(controls instanceof HTMLElement)) {
      controls = document.createElement('div');
      controls.className = 'fx-reference-controls-r204 fx-reference-controls-r264';
      controls.setAttribute('aria-label', root.lang === 'en' ? 'Hero controls' : 'Hero vezérlők');
    } else {
      controls.classList.add('fx-reference-controls-r264');
    }

    let sound = document.querySelector('.fx-three-sound');
    if (!(sound instanceof HTMLButtonElement)) {
      sound = document.createElement('button');
      sound.className = 'fx-three-sound fx-wda-sound-toggle fx-control-owner-r264';
      sound.type = 'button';
      sound.dataset.fxAudioState = 'off';
      sound.setAttribute('aria-pressed', 'false');
      sound.setAttribute('aria-label', root.lang === 'en' ? 'Unmute FormatX cinematic audio' : 'FormatX filmes hang bekapcsolása');
      sound.innerHTML = mutedIcon();
    }

    let rail = controls.querySelector(':scope > .fx-reference-rail') || hero.querySelector('.fx-reference-rail');
    if (!(rail instanceof HTMLElement)) {
      rail = document.createElement('div');
      rail.className = 'fx-reference-rail fx-reference-rail-r264';
      rail.innerHTML = '<button class="fx-reference-ask" type="button" aria-label="Kérdezz"><i aria-hidden="true"></i><span>KÉRDEZZ</span></button><button class="fx-reference-pause" type="button" aria-label="Animáció szüneteltetése" data-paused="false">Ⅱ</button>';
    } else {
      rail.classList.add('fx-reference-rail-r264');
    }

    const askLabel = rail.querySelector('.fx-reference-ask span');
    if (askLabel && askLabel.textContent !== strings.ask) askLabel.textContent = strings.ask;

    if (sound.parentElement !== controls) controls.prepend(sound);
    if (rail.parentElement !== controls) controls.appendChild(rail);
    if (controls.parentElement !== space) space.appendChild(controls);

    if (space.nextElementSibling !== heading) space.after(heading);
    if (heading.nextElementSibling !== proof) heading.after(proof);

    return { heading, proof, live, rail, controls, sound };
  }

  // r408: CSS/r268 owns SOUND | ASK | PAUSE geometry. Never write inline
  // position/display/size here; repeated real3d/mobile events must be idempotent.
  function applyControlLayout(nodes, mobile) {
    void mobile;
    nodes.controls?.classList.add('fx-reference-controls-r264');
    nodes.rail?.classList.add('fx-reference-rail-r264');
    nodes.sound?.classList.add('fx-control-owner-r264');
    root.dataset.fxReferenceGeometrySchedulerR304 = 'css-canonical-r408-no-inline-geometry';
  }

  function reconcile() {
    queued = false;
    const hero = document.getElementById('hero');
    const grid = hero?.querySelector(':scope > .hero-grid');
    const space = grid?.querySelector(':scope > .hero-space');
    if (!(hero instanceof HTMLElement) || !(grid instanceof HTMLElement) || !(space instanceof HTMLElement)) return false;

    ensureStyleLast();
    const mobile = isMobile();
    if (mobile) {
      root.dataset.fxMobileLayoutOwner = 'r207-normal-flow';
      root.dataset.fxReferenceProductionR244 = 'ready';
      root.dataset.fxReferenceComposition = 'reference-frame-r244';
    } else {
      if (root.dataset.fxMobileLayoutOwner === VERSION || root.dataset.fxMobileLayoutOwner === 'r207-normal-flow') delete root.dataset.fxMobileLayoutOwner;
      root.dataset.fxReferenceProductionR244 = 'desktop';
      root.dataset.fxReferenceComposition = 'desktop-reference-r244';
    }

    ensureHeaderControls();
    const nodes = ensureReferenceNodes(hero, grid, space);
    const expectedControlOwner = space;
    if (nodes.controls.parentElement !== expectedControlOwner) expectedControlOwner.appendChild(nodes.controls);
    applyControlLayout(nodes, mobile);

    document.querySelectorAll('.fx-loop-hero-clone').forEach(node => node.setAttribute('aria-hidden', 'true'));
    root.dataset.fxReferenceRuntimeR254 = mobile
      ? 'event-driven-r207-owner-r260'
      : 'event-driven-standalone-r260';
    return true;
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(reconcile);
  }

  function stopBootObserver() {
    bootObserver?.disconnect();
    bootObserver = null;
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = 0;
  }

  function boot() {
    if (reconcile()) return;
    if (bootObserver) return;
    bootObserver = new MutationObserver(() => {
      if (reconcile()) stopBootObserver();
    });
    bootObserver.observe(document.body || document.documentElement, { subtree: true, childList: true });
    bootTimer = setTimeout(() => {
      stopBootObserver();
      reconcile();
    }, 4000);
  }

  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });
  for (const eventName of [
    'formatx:real3dready',
    'formatx:coredetailready',
    'formatx:languagechange',
    'formatx:organisminterfaceready',
    'formatx:mobilelayoutready'
  ]) addEventListener(eventName, schedule, { passive: true });

  installKeyboardModality();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
