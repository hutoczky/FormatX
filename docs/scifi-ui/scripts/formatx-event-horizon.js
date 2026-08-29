(function () {
  'use strict';

  /* FormatX r411 — first-paint-stable bootstrap.
     The static HTML is the LCP owner. This runtime may create semantic controls
     and reference proof nodes, but it never reparents the existing hero copy. */
  const ROOT = document.documentElement;
  const EARLY_REFERENCE_MOBILE = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const REDUCE_QUERY = matchMedia('(prefers-reduced-motion: reduce)');
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  const OVERLAY_ID = 'formatx-event-horizon';

  if (!ROOT.dataset.fxReferenceProductionR244) {
    ROOT.dataset.fxReferenceProductionR244 = EARLY_REFERENCE_MOBILE ? 'ready' : 'desktop';
  }
  ROOT.dataset.fxReferenceComposition = EARLY_REFERENCE_MOBILE
    ? 'reference-frame-r244'
    : 'desktop-reference-r244';
  ROOT.dataset.fxLivingCopyGuard = 'ready';
  ROOT.dataset.fxLivingCopyGuardPolicyR293 = 'static-content-normalized-no-document-scan';
  ROOT.dataset.fxHeroLcpOwnerR411 = 'static-html-no-reparent';

  const AWARD_RUNTIME_URL = './scripts/formatx-award-runtime-r206.js?v=20260823-r312-postdom-pulse&rev=20260829-r424-sharp-organic-core';
  const MOBILE_REGRESSION_URL = './scripts/formatx-mobile-regression-r310.js?v=20260823-r312-postdom&rev=20260827-r413-static-3d';
  const PULSE_STYLE_URL = './styles/formatx-core-pulse-r312.css?v=20260823-r312-living-pulse';
  const FIRST_PAINT_STYLE_URL = './styles/formatx-first-paint-r206.css?v=20260825-r306-static-production-parity';
  const FIRST_FRAME_STYLE_URL = './styles/formatx-first-frame-geometry-r274.css?v=20260825-r306-static-production-parity';
  const FIRST_CONTROL_STYLE_URL = './styles/formatx-first-paint-controls-r306.css?v=20260825-r306-prepaint-final-geometry';
  const MOBILE_LAYOUT_STYLE_URL = './styles/formatx-mobile-layout-r207.css?v=20260824-native-orb-r250';

  function ensureEarlyStyle(selector, attribute, href, media) {
    if (document.querySelector(selector)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (media) link.media = media;
    link.setAttribute(attribute, 'true');
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  }

  function copyStrings() {
    return ROOT.lang === 'en' ? {
      heading: 'DISCOVER HOW IT WORKS',
      title: 'Proof behind the visual.',
      body: 'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.',
      ask: 'ASK',
      askAria: 'Ask FormatX',
      controls: 'Hero controls'
    } : {
      heading: 'A MŰKÖDÉS MEGISMERÉSE',
      title: 'Bizonyíték a látvány mögött.',
      body: 'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.',
      ask: 'KÉRDEZZ',
      askAria: 'Kérdezz a FormatX-től',
      controls: 'Hero vezérlők'
    };
  }

  function ensureControlZone(hero, space, strings) {
    let controls = hero.querySelector('.fx-reference-controls-r204');
    if (!(controls instanceof HTMLElement)) {
      controls = document.createElement('div');
      controls.className = 'fx-reference-controls-r204 fx-reference-controls-r264';
    }
    controls.classList.add('fx-reference-controls-r264');
    controls.setAttribute('aria-label', strings.controls);

    let sound = controls.querySelector(':scope > .fx-three-sound') || document.querySelector('.fx-three-sound');
    if (!(sound instanceof HTMLButtonElement)) {
      sound = document.createElement('button');
      sound.type = 'button';
      sound.className = 'fx-three-sound fx-wda-sound-toggle fx-control-owner-r264';
      sound.dataset.fxAudioState = 'off';
      sound.setAttribute('aria-pressed', 'false');
      sound.setAttribute('aria-label', ROOT.lang === 'en' ? 'Unmute FormatX cinematic audio' : 'FormatX filmes hang bekapcsolása');
      sound.innerHTML = '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M16 9l5 6"/><path d="M21 9l-5 6"/></svg></span>';
    }
    sound.classList.add('fx-wda-sound-toggle', 'fx-control-owner-r264');
    if (sound.parentElement !== controls) controls.prepend(sound);

    let rail = controls.querySelector(':scope > .fx-reference-rail') || hero.querySelector('.fx-reference-rail');
    if (!(rail instanceof HTMLElement)) {
      rail = document.createElement('div');
      rail.className = 'fx-reference-rail fx-reference-rail-r264';
    }
    rail.classList.add('fx-reference-rail-r264');

    let ask = rail.querySelector('.fx-reference-ask');
    if (!(ask instanceof HTMLButtonElement)) {
      ask = document.createElement('button');
      ask.type = 'button';
      ask.className = 'fx-reference-ask';
      ask.innerHTML = '<i aria-hidden="true"></i><span></span>';
    }
    ask.setAttribute('aria-label', strings.askAria);
    let askLabel = ask.querySelector('span');
    if (!(askLabel instanceof HTMLElement)) {
      askLabel = document.createElement('span');
      ask.appendChild(askLabel);
    }
    askLabel.textContent = strings.ask;

    let pause = rail.querySelector('.fx-reference-pause');
    if (!(pause instanceof HTMLButtonElement)) {
      pause = document.createElement('button');
      pause.type = 'button';
      pause.className = 'fx-reference-pause';
      pause.textContent = 'Ⅱ';
      pause.dataset.paused = 'false';
    }
    pause.setAttribute('aria-label', ROOT.lang === 'en' ? 'Pause animation' : 'Animáció szüneteltetése');

    if (ask.parentElement !== rail) rail.prepend(ask);
    if (pause.parentElement !== rail) rail.appendChild(pause);
    if (rail.parentElement !== controls) controls.appendChild(rail);
    if (controls.parentElement !== space) space.appendChild(controls);
    return controls;
  }

  function ensureReferenceProof(hero, grid, strings) {
    let heading = hero.querySelector('.fx-reference-heading');
    if (!(heading instanceof HTMLElement)) {
      heading = document.createElement('div');
      heading.className = 'fx-reference-heading';
      grid.appendChild(heading);
    }
    heading.textContent = strings.heading;

    let proof = hero.querySelector('.fx-reference-proof');
    if (!(proof instanceof HTMLElement)) {
      proof = document.createElement('article');
      proof.className = 'fx-reference-proof';
      proof.innerHTML = '<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2></h2><p></p><a class="fx-reference-liveos" href="#experience">Live OS</a>';
      grid.appendChild(proof);
    }
    const title = proof.querySelector('h2');
    const body = proof.querySelector('p');
    const live = proof.querySelector('.fx-reference-liveos');
    if (title) title.textContent = strings.title;
    if (body) body.textContent = strings.body;
    if (live instanceof HTMLAnchorElement) {
      live.href = '#experience';
      live.setAttribute('aria-label', ROOT.lang === 'en' ? 'Open Live OS' : 'Live OS megnyitása');
    }
  }

  function stabilizeReferenceFirstPaint() {
    ensureEarlyStyle('link[data-fx-first-paint-r206]', 'data-fx-first-paint-r206', FIRST_PAINT_STYLE_URL);
    ensureEarlyStyle('link[data-fx-first-frame-geometry-r306]', 'data-fx-first-frame-geometry-r306', FIRST_FRAME_STYLE_URL);
    ensureEarlyStyle('link[data-fx-first-paint-controls-r306]', 'data-fx-first-paint-controls-r306', FIRST_CONTROL_STYLE_URL);
    if (EARLY_REFERENCE_MOBILE) {
      ensureEarlyStyle('link[data-fx-mobile-layout-r207]', 'data-fx-mobile-layout-r207', MOBILE_LAYOUT_STYLE_URL, '(max-width: 900px)');
    }

    const hero = document.getElementById('hero');
    const grid = hero?.querySelector(':scope > .hero-grid');
    const space = grid?.querySelector(':scope > .hero-space');
    const heroCopy = grid?.querySelector(':scope > .hero-copy');
    if (!(hero instanceof HTMLElement)
      || !(grid instanceof HTMLElement)
      || !(space instanceof HTMLElement)
      || !(heroCopy instanceof HTMLElement)) return false;

    const strings = copyStrings();
    ensureControlZone(hero, space, strings);
    ensureReferenceProof(hero, grid, strings);

    /* r411: do not call space.after(...), controls.after(heroCopy) or any other
       reparent operation on the LCP-visible hero copy. CSS order is authoritative. */
    ROOT.dataset.fxHeroCopyPlacementR411 = 'static-dom-css-order';
    ROOT.dataset.fxFirstPaintControlsR306 = EARLY_REFERENCE_MOBILE
      ? 'mobile-final-geometry-prepaint-css'
      : 'desktop-final-geometry-prepaint-css';
    return true;
  }

  function activateCriticalReal3dStyle() {
    const link = document.querySelector('link[data-fx-core-real3d="true"]');
    if (!(link instanceof HTMLLinkElement)) {
      ROOT.dataset.fxCoreReal3dCssR310 = 'missing';
      return;
    }
    link.removeAttribute('data-fx-deferred-media-r300');
    link.media = REDUCE_QUERY.matches ? 'all' : '(prefers-reduced-motion: no-preference)';
    ROOT.dataset.fxCoreReal3dCssR310 = REDUCE_QUERY.matches
      ? 'active-static-r413'
      : link.sheet ? 'active' : 'activating-postdom-r312';
    if (link.dataset.fxR310LoadBound !== 'true') {
      link.dataset.fxR310LoadBound = 'true';
      link.addEventListener('load', () => { ROOT.dataset.fxCoreReal3dCssR310 = 'active'; }, { once: true });
      link.addEventListener('error', () => { ROOT.dataset.fxCoreReal3dCssR310 = 'failed'; }, { once: true });
    }
  }

  function ensureCorePulseStyle() {
    if (REDUCE_QUERY.matches) {
      ROOT.dataset.fxCorePulseR312 = 'reduced-motion-static';
      return;
    }
    if (document.querySelector('link[data-fx-core-pulse-r312]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = PULSE_STYLE_URL;
    link.dataset.fxCorePulseR312 = 'true';
    document.head.appendChild(link);
  }

  function ensureMobileRegressionR310() {
    if (document.querySelector('script[data-fx-mobile-regression-r310]')) return;
    const script = document.createElement('script');
    script.src = MOBILE_REGRESSION_URL;
    script.async = true;
    script.dataset.fxMobileRegressionR310 = 'true';
    document.head.appendChild(script);
  }

  function ensureAwardRuntime() {
    if (AUDIT_MODE || document.querySelector('script[data-fx-award-runtime-r206]')) return;
    const script = document.createElement('script');
    script.src = AWARD_RUNTIME_URL;
    script.async = true;
    script.dataset.fxAwardRuntimeR206 = 'true';
    document.head.appendChild(script);
  }

  function afterFirstPaint(callback) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 650 });
      } else {
        setTimeout(callback, 120);
      }
    }));
  }

  function queuePostDomEnhancements(includeMobileReal3d) {
    const run = () => afterFirstPaint(() => {
      ensureCorePulseStyle();
      if (includeMobileReal3d) {
        activateCriticalReal3dStyle();
        ensureMobileRegressionR310();
      }
      ensureAwardRuntime();
      ROOT.dataset.fxMobileBootstrapR312 = includeMobileReal3d
        ? 'postdom-real3d-and-pulse'
        : 'postdom-pulse';
      ROOT.dataset.fxPostDomScheduleR411 = 'two-raf-idle-timeout-650';
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();
  }

  function complete(source) {
    document.dispatchEvent(new CustomEvent('formatx:introcomplete', { detail: { source } }));
  }

  function fastRelease(source, deferComplete) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
    ROOT.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    ROOT.classList.add('fx-intro-complete');
    ROOT.dataset.fxIntro = source;
    const notify = () => complete(source);
    if (deferComplete) {
      const queueNotify = () => setTimeout(notify, 0);
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueNotify, { once: true });
      else queueNotify();
    } else notify();
  }

  stabilizeReferenceFirstPaint();

  if (AUDIT_MODE) {
    ROOT.classList.add('fx-audit-mode');
    fastRelease('audit-skip', false);
    return;
  }

  ROOT.dataset.fxIntroStrategy = EARLY_REFERENCE_MOBILE
    ? 'mobile-direct-award-r251'
    : 'desktop-direct-award-r251';
  fastRelease('instant-award-r251', true);
  queuePostDomEnhancements(EARLY_REFERENCE_MOBILE);

  addEventListener('pageshow', event => {
    if (event.persisted) fastRelease('bfcache-restore', false);
  });
  addEventListener('error', () => fastRelease('runtime-error', false));
  addEventListener('unhandledrejection', () => fastRelease('promise-error', false));
}());
