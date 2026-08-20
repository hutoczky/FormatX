(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'r244-reference-frame';
  let queued = false;

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

  function ensureStyleLast() {
    const style = document.querySelector('link[data-fx-reference-production-r244]');
    if (style instanceof HTMLLinkElement && style.parentElement === document.head && style !== document.head.lastElementChild) {
      document.head.appendChild(style);
    }
  }

  function removeInlineLayout(node) {
    if (!(node instanceof HTMLElement)) return;
    for (const property of [
      'position', 'inset', 'top', 'right', 'bottom', 'left', 'display',
      'flex-direction', 'align-items', 'align-self', 'justify-content',
      'grid-area', 'grid-row', 'grid-column', 'grid-template-columns',
      'grid-template-rows', 'order', 'width', 'min-width', 'max-width',
      'height', 'min-height', 'max-height', 'margin', 'margin-top',
      'margin-right', 'margin-bottom', 'margin-left', 'padding',
      'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'overflow', 'clip', 'clip-path', 'white-space', 'transform',
      'translate', 'flex', 'visibility', 'opacity', 'pointer-events',
      'border', 'border-radius', 'z-index'
    ]) node.style.removeProperty(property);
  }

  function important(node, property, value) {
    if (node instanceof HTMLElement) node.style.setProperty(property, value, 'important');
  }

  function importantMany(node, declarations) {
    for (const [property, value] of Object.entries(declarations)) important(node, property, value);
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
        hero.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        window.FormatXCoreMobileV69?.pulse?.();
      });
    }
    if (menu.dataset.fxR244Bound !== 'true') {
      menu.dataset.fxR244Bound = 'true';
      menu.addEventListener('click', () => {
        const original = document.querySelector('#fx-reference-legacy-menu, .menu-toggle:not(.fx-reference-menu-button), .fx-organism-system-toggle:not(.fx-reference-menu-button)');
        const nav = document.getElementById('main-nav');
        const wasOpen = nav instanceof HTMLElement && nav.classList.contains('open');

        // The full organism interface is intentionally lazy for first-paint and
        // mobile frame-rate budgets. A visible menu request is the explicit
        // activation signal: start the full controller queue, while keeping the
        // navigation immediately usable during that asynchronous hand-off.
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
      live.textContent = 'Live OS';
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
    if (controls.parentElement !== hero) hero.appendChild(controls);

    if (space.nextElementSibling !== heading) space.after(heading);
    if (heading.nextElementSibling !== proof) heading.after(proof);

    return { heading, proof, live, rail, controls };
  }

  function applyMobile() {
    const hero = document.getElementById('hero');
    const grid = hero?.querySelector('.hero-grid');
    const space = hero?.querySelector('.hero-space');
    if (!(hero instanceof HTMLElement) || !(grid instanceof HTMLElement) || !(space instanceof HTMLElement)) return false;

    root.dataset.fxMobileLayoutOwner = VERSION;
    root.dataset.fxReferenceProductionR244 = 'ready';
    root.dataset.fxReferenceComposition = 'reference-frame-r244';
    ensureStyleLast();

    const header = ensureDesktopHeaderControls(hero);
    const nodes = ensureReferenceNodes(hero, grid, space);
    const narrow = innerWidth <= 374;
    const bar = header.bar;
    const brand = bar?.querySelector('.brand');
    const brandTagline = brand?.querySelector('small');
    const mag = header.mag;
    const language = header.language;
    const menu = header.menu;
    const heroCopy = hero.querySelector('.hero-copy');
    const download = hero.querySelector('.fx-mobile-download-r151');
    const stage = hero.querySelector('.fx-core-mobile-v55-stage, .fx-core-r112-stage');
    const mainCanvas = stage?.querySelector('.fx-core-mobile-v55-canvas, .fx-core-r112-canvas');
    const detailCanvas = stage?.querySelector('.fx-core-detail-r122');

    [bar, brand, mag, language, menu, hero, grid, space, heroCopy, download,
      nodes.heading, nodes.proof, nodes.live, nodes.rail, nodes.controls]
      .forEach(removeInlineLayout);

    importantMany(bar, {
      position: 'relative', inset: 'auto', display: 'block', width: '100%',
      height: '70px', 'min-height': '70px', margin: '0', padding: '0'
    });
    importantMany(brand, {
      position: 'absolute', inset: '18px auto auto 18px', display: 'flex',
      width: 'auto', height: '34px', margin: '0'
    });
    importantMany(mag, {
      position: 'absolute', inset: '15px calc(var(--fx-r244-header-edge) + 113px) auto auto',
      display: 'grid', width: '50px', 'min-width': '50px', height: '40px', 'min-height': '40px', margin: '0'
    });
    importantMany(language, {
      position: 'absolute', inset: '15px calc(var(--fx-r244-header-edge) + 58px) auto auto',
      display: 'grid', width: '42px', 'min-width': '42px', height: '40px', 'min-height': '40px', margin: '0'
    });
    importantMany(menu, {
      position: 'absolute', inset: '8px var(--fx-r244-header-edge) auto auto',
      display: 'grid', width: '50px', 'min-width': '50px', height: '54px', 'min-height': '54px', margin: '0'
    });
    importantMany(hero, {
      position: 'relative', display: 'block', width: '100%', height: 'auto',
      'min-height': '0', 'max-height': 'none', margin: '0', padding: '0 0 56px', overflow: 'visible'
    });
    importantMany(grid, {
      position: 'relative', display: 'flex', 'flex-direction': 'column',
      'align-items': 'stretch', width: '100%', 'max-width': '100%', height: 'auto',
      'min-height': '0', margin: '0', padding: '0', gap: '0', overflow: 'visible'
    });
    importantMany(space, {
      position: 'relative', inset: 'auto', order: '0', display: 'block',
      visibility: 'visible', opacity: '1', 'align-self': 'stretch',
      width: '100%', 'max-width': '100%', height: 'min(100vw, 500px)',
      'min-height': 'min(100vw, 500px)', 'max-height': '500px', margin: '0',
      padding: '0', overflow: 'visible', 'border-radius': '0', transform: 'none'
    });
    importantMany(heroCopy, {
      position: 'absolute', width: '1px', height: '1px', 'min-height': '0',
      margin: '-1px', padding: '0', overflow: 'hidden', clip: 'rect(0 0 0 0)',
      'clip-path': 'inset(50%)', 'white-space': 'nowrap', border: '0'
    });
    importantMany(nodes.controls, {
      position: 'absolute', inset: '14px var(--fx-r244-header-edge) auto auto',
      display: 'block', width: '50px', height: 'auto', 'min-height': '0',
      margin: '0', padding: '0', transform: 'none'
    });
    importantMany(nodes.rail, {
      position: 'relative', inset: 'auto', display: 'flex', 'flex-direction': 'column',
      'align-items': 'center', 'justify-content': 'flex-start', gap: '10px',
      width: '50px', 'min-width': '50px', 'max-width': '50px', height: 'auto',
      'min-height': '0', margin: '0', padding: '0', transform: 'none', flex: '0 0 50px'
    });
    importantMany(nodes.heading, {
      position: 'relative', inset: 'auto', order: '1', display: 'flex',
      'align-self': 'flex-start', width: 'calc(100% - var(--fx-r244-edge-left) - var(--fx-r244-edge-right))',
      height: '20px', 'min-height': '20px', margin: '-47px 0 25px var(--fx-r244-edge-left)',
      padding: '0', transform: 'none'
    });
    importantMany(nodes.proof, {
      position: 'relative', inset: 'auto', order: '2', display: 'block',
      'align-self': 'flex-start', width: 'calc(100% - var(--fx-r244-edge-left) - var(--fx-r244-edge-right))',
      height: 'auto', 'min-height': narrow ? '278px' : '258px', 'max-height': 'none',
      margin: '0 0 38px var(--fx-r244-edge-left)', padding: '20px 19px 24px', overflow: 'hidden', transform: 'none'
    });
    importantMany(nodes.live, {
      position: 'absolute', inset: narrow ? 'auto 6px 17px auto' : '149px 6px auto auto', display: 'grid',
      width: '78px', 'min-width': '78px', 'max-width': '78px', height: '56px',
      'min-height': '56px', margin: '0', padding: '0', transform: 'none'
    });
    importantMany(download, {
      position: 'relative', inset: 'auto', order: '3', 'align-self': 'center',
      width: 'calc(100% - 40px)', 'max-width': '680px', height: 'auto', margin: '0 auto', transform: 'none'
    });
    importantMany(stage, {
      transform: 'scaleY(.97)', 'transform-origin': '50% 0'
    });
    importantMany(mainCanvas, {
      opacity: '.10',
      filter: 'brightness(.82) contrast(1.32) saturate(1.03)'
    });
    importantMany(detailCanvas, {
      opacity: '.998',
      filter: 'brightness(.82) contrast(1.32) saturate(1.03)'
    });

    if (brandTagline && brandTagline.textContent !== 'LIVING SYSTEM') brandTagline.textContent = 'LIVING SYSTEM';
    if (mag instanceof HTMLButtonElement) {
      mag.textContent = root.lang === 'en' ? 'CORE' : 'MAG';
      mag.setAttribute('aria-label', root.lang === 'en' ? 'Focus the living core' : 'Az élő mag fókuszálása');
    }

    document.querySelectorAll('.fx-loop-hero-clone').forEach(node => node.setAttribute('aria-hidden', 'true'));
    document.querySelectorAll('.skip-link').forEach(link => {
      if (document.activeElement === link && !link.matches(':focus-visible')) link.blur();
    });
    return true;
  }

  function applyDesktop() {
    ensureStyleLast();
    if (root.dataset.fxMobileLayoutOwner === VERSION) delete root.dataset.fxMobileLayoutOwner;
    root.dataset.fxReferenceProductionR244 = 'desktop';
    root.dataset.fxReferenceComposition = 'desktop-reference-r244';
    const hero = document.getElementById('hero');
    const grid = hero?.querySelector('.hero-grid');
    const space = hero?.querySelector('.hero-space');
    if (!(hero instanceof HTMLElement) || !(grid instanceof HTMLElement) || !(space instanceof HTMLElement)) return false;

    const header = ensureDesktopHeaderControls(hero);
    const nodes = ensureReferenceNodes(hero, grid, space);
    const brand = header.bar?.querySelector('.brand');
    const heroCopy = hero.querySelector('.hero-copy');
    const stage = hero.querySelector('.fx-core-mobile-v55-stage, .fx-core-r112-stage');
    const mainCanvas = stage?.querySelector('.fx-core-mobile-v55-canvas, .fx-core-r112-canvas');
    const detailCanvas = stage?.querySelector('.fx-core-detail-r122');
    const liveLayer = stage?.querySelector('.fx-core-live-r147-layer');
    const download = hero.querySelector('.fx-mobile-download-r151');

    [header.bar, brand, header.mag, header.language, header.menu, hero, grid, space,
      heroCopy, nodes.heading, nodes.proof, nodes.live, nodes.rail, nodes.controls,
      stage, mainCanvas, detailCanvas, liveLayer, download].forEach(removeInlineLayout);

    importantMany(header.bar, {
      position: 'relative', inset: 'auto', display: 'block', width: '100%',
      height: '76px', 'min-height': '76px', margin: '0', padding: '0'
    });
    importantMany(brand, {
      position: 'absolute', inset: '18px auto auto max(38px, calc((100vw - 1320px) / 2))',
      display: 'flex', width: 'auto', height: '40px', margin: '0'
    });
    importantMany(header.mag, {
      position: 'absolute', inset: '16px 174px auto auto', display: 'grid',
      width: '54px', 'min-width': '54px', height: '44px', 'min-height': '44px', margin: '0'
    });
    importantMany(header.language, {
      position: 'absolute', inset: '16px 112px auto auto', display: 'grid',
      width: '46px', 'min-width': '46px', height: '44px', 'min-height': '44px', margin: '0'
    });
    importantMany(header.menu, {
      position: 'absolute', inset: '10px 38px auto auto', display: 'grid',
      width: '58px', 'min-width': '58px', height: '56px', 'min-height': '56px', margin: '0'
    });
    importantMany(hero, {
      position: 'relative', display: 'block', width: '100%', height: 'auto',
      'min-height': '0', 'max-height': 'none', margin: '0', padding: '36px 0 92px', overflow: 'visible'
    });
    importantMany(grid, {
      position: 'relative', display: 'grid', width: 'min(1320px, calc(100% - 80px))',
      'max-width': '1320px', height: 'auto', 'min-height': '0', margin: '0 auto',
      padding: '0', gap: '30px 56px', overflow: 'visible'
    });
    importantMany(heroCopy, {
      position: 'relative', inset: 'auto', display: 'block', width: '100%',
      height: 'auto', 'min-height': '0', margin: '0', padding: '0', overflow: 'visible',
      clip: 'auto', 'clip-path': 'none', 'white-space': 'normal', transform: 'none'
    });
    importantMany(space, {
      position: 'relative', inset: 'auto', display: 'block', width: '100%',
      'max-width': '100%', height: 'clamp(520px, 42vw, 620px)',
      'min-height': '520px', 'max-height': '620px', margin: '0', padding: '0',
      overflow: 'visible', 'border-radius': '0', transform: 'none'
    });
    importantMany(nodes.heading, {
      position: 'relative', inset: 'auto', display: 'flex', width: '100%',
      height: '24px', 'min-height': '24px', margin: '0', padding: '0', transform: 'none'
    });
    importantMany(nodes.proof, {
      position: 'relative', inset: 'auto', display: 'block', width: '100%',
      height: 'auto', 'min-height': '258px', 'max-height': 'none', margin: '0',
      padding: '28px 30px 30px', overflow: 'hidden', transform: 'none'
    });
    importantMany(nodes.live, {
      position: 'absolute', inset: 'auto 20px 22px auto', display: 'grid',
      width: '92px', 'min-width': '92px', 'max-width': '92px', height: '58px',
      'min-height': '58px', margin: '0', padding: '0', transform: 'none'
    });
    importantMany(nodes.controls, {
      position: 'absolute', inset: '18px 18px auto auto', display: 'block',
      width: '54px', height: 'auto', 'min-height': '0', margin: '0', padding: '0', transform: 'none'
    });
    importantMany(nodes.rail, {
      position: 'relative', inset: 'auto', display: 'flex', 'flex-direction': 'column',
      'align-items': 'center', 'justify-content': 'flex-start', gap: '12px',
      width: '54px', 'min-width': '54px', 'max-width': '54px', height: 'auto',
      'min-height': '0', margin: '0', padding: '0', transform: 'none', flex: '0 0 54px'
    });
    if (nodes.controls.parentElement !== space) space.appendChild(nodes.controls);
    importantMany(stage, {
      position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%',
      margin: '0', padding: '0', overflow: 'visible', transform: 'none', 'transform-origin': '50% 50%'
    });
    [mainCanvas, detailCanvas, liveLayer].forEach(layer => importantMany(layer, {
      position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%',
      margin: '0', padding: '0', transform: 'none'
    }));
    importantMany(mainCanvas, {
      opacity: '.22',
      filter: 'brightness(.82) contrast(1.92) saturate(2.18) drop-shadow(0 0 3px rgba(248,255,255,.82)) drop-shadow(0 0 9px rgba(43,235,255,.62)) drop-shadow(0 0 26px rgba(40,141,255,.32))',
      'mix-blend-mode': 'normal'
    });
    importantMany(detailCanvas, {
      opacity: '.998', filter: 'none', 'mix-blend-mode': 'normal'
    });
    importantMany(download, { display: 'none', visibility: 'hidden', 'pointer-events': 'none' });

    if (header.mag instanceof HTMLButtonElement) {
      header.mag.textContent = root.lang === 'en' ? 'CORE' : 'MAG';
      header.mag.setAttribute('aria-label', root.lang === 'en' ? 'Focus the living core' : 'Az élő mag fókuszálása');
    }
    if (header.menu instanceof HTMLButtonElement) header.menu.setAttribute('aria-label', root.lang === 'en' ? 'Menu' : 'Menü');
    document.querySelectorAll('.fx-loop-hero-clone').forEach(node => node.setAttribute('aria-hidden', 'true'));
    return true;
  }

  function apply() {
    queued = false;
    return isMobile() ? applyMobile() : applyDesktop();
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }

  const observer = new MutationObserver(records => {
    if (records.some(record => record.addedNodes.length || record.removedNodes.length)) schedule();
  });
  observer.observe(document.documentElement, { subtree: true, childList: true });

  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });
  for (const eventName of ['formatx:real3dready', 'formatx:coredetailready', 'formatx:languagechange', 'formatx:organisminterfaceready']) {
    addEventListener(eventName, schedule);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
  for (const delay of [0, 100, 450, 1200, 2600, 4800]) setTimeout(schedule, delay);
}());
