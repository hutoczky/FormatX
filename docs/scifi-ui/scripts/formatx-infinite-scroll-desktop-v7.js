(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'seamless-v7';
  const LOOP_GUARD_MS = 420;
  const ACTIVITY_IDLE_MS = 170;
  const MOBILE_SETTLE_MS = 220;
  const LOOP_BOOT_FLOOR_MS = 1750;
  const STYLE_URL = '/scifi-ui/styles/formatx-seamless-loop.css?v=20260907-r592-style-ready-geometry';
  const MOBILE_FLOW_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const HERO_START_HASHES = new Set(['', '#top', '#hero']);
  let bridge = null;
  let mirror = null;
  let mirrorImage = null;
  let mirrorCaptureFrame = 0;
  let mirrorCaptureTimer = 0;
  let sourceHero = null;
  let transferLockedUntil = 0;
  let scrollFrame = 0;
  let landingFrame = 0;
  let activityTimer = 0;
  let mobileSettleTimer = 0;
  let pendingMobileRelative = null;
  let pendingDesktopRelative = null;
  let touchActive = false;
  let loopCount = Number(root.dataset.fxLoopCount || 0);
  let repairTimer = 0;
  let geometryFrame = 0;
  let geometryObserver = null;
  let bootTimer = 0;
  let layoutWidth = innerWidth;
  let initialHeroGuardApplied = false;
  let initialised = false;
  let loopGeometry = Object.freeze({
    ready: false,
    bridgeTop: 0,
    bridgeThreshold: 0,
    sourceTop: 0,
    sourceHeight: 0,
    documentEnd: 0,
  });

  if (root.dataset.fxInfiniteController === VERSION) return;

  root.dataset.fxInfiniteScroll = 'initialising-' + VERSION;
  root.dataset.fxInfiniteController = VERSION;
  root.dataset.fxInfiniteCloneMode = 'inert-reference-mirror';
  root.dataset.fxInfiniteInput = 'native';
  root.dataset.fxScrollActivity = 'idle';
  root.dataset.fxAutomaticLoop = 'enabled';
  root.dataset.fxScrollJumpGuard = 'visual-match-v4';
  root.dataset.fxLoopBridge = 'initialising';
  root.dataset.fxLoopStyleR592 = 'loading';
  root.dataset.fxLoopBootstrapR593 = 'post-critical-window-pending';
  root.dataset.fxScrollSnap = 'disabled';
  root.dataset.fxMobileScrollMode = 'native-momentum-loop';
  root.dataset.fxInitialHeroGuard = 'pending';
  root.classList.add('fx-continuous-scroll-mode');
  root.classList.remove(
    'fx-infinite-loop-jump',
    'fx-three-loop-transfer',
    'fx-precision-wheel',
    'fx-mobile-native-scroll'
  );

  function isMobileFlow() {
    return MOBILE_FLOW_QUERY.matches;
  }

  function ensureStyleReady() {
    return new Promise((resolve, reject) => {
      let link = document.querySelector('link[data-fx-seamless-loop-style]');
      if (link instanceof HTMLLinkElement && link.sheet) {
        root.dataset.fxLoopStyleR592 = 'ready-existing';
        resolve(link);
        return;
      }
      if (!(link instanceof HTMLLinkElement)) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = STYLE_URL;
        link.dataset.fxSeamlessLoopStyle = 'true';
        document.head.appendChild(link);
      }
      let settled = false;
      const finish = (ok, source) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        link.removeEventListener('load', onLoad);
        link.removeEventListener('error', onError);
        if (ok) {
          root.dataset.fxLoopStyleR592 = source;
          requestAnimationFrame(() => resolve(link));
        } else {
          root.dataset.fxLoopStyleR592 = source;
          root.dataset.fxLoopBridge = 'style-unavailable';
          reject(new Error('FormatX seamless loop stylesheet unavailable'));
        }
      };
      const onLoad = () => finish(true, 'ready-load');
      const onError = () => finish(false, 'failed-load');
      link.addEventListener('load', onLoad, { once: true });
      link.addEventListener('error', onError, { once: true });
      const timer = window.setTimeout(() => {
        if (link.sheet) finish(true, 'ready-sheet-timeout-check');
        else finish(false, 'failed-style-timeout');
      }, 2000);
    });
  }

  function waitForBootFloor() {
    const delay = Math.max(0, LOOP_BOOT_FLOOR_MS - performance.now());
    if (delay <= 0) return Promise.resolve();
    return new Promise(resolve => {
      clearTimeout(bootTimer);
      bootTimer = window.setTimeout(() => {
        bootTimer = 0;
        resolve();
      }, delay);
    });
  }

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function setBilingualText(scope) {
    if (!scope) return;
    scope.querySelectorAll('[data-hu][data-en]').forEach(element => {
      if (element.matches('input,textarea')) return;
      element.textContent = element.dataset[language()];
    });
  }

  function navigationType() {
    try {
      return performance.getEntriesByType('navigation')[0]?.type || 'navigate';
    } catch (_) {
      return 'navigate';
    }
  }

  function shouldGuaranteeHeroStart() {
    if (!HERO_START_HASHES.has(location.hash)) return false;
    return navigationType() !== 'back_forward';
  }

  function heroTop() {
    sourceHero = document.querySelector('#main-content > #hero');
    return sourceHero ? Math.max(0, sourceHero.offsetTop) : 0;
  }

  function forceHeroStart(source) {
    sourceHero = document.querySelector('#main-content > #hero');
    if (!sourceHero) return false;
    const top = heroTop();
    window.scrollTo({ top, left: 0, behavior: 'auto' });
    root.dataset.fxInitialHeroGuard = source;
    root.dataset.fxInitialHeroTop = String(Math.round(top));
    return true;
  }

  function guaranteeInitialHero() {
    if (initialHeroGuardApplied || !shouldGuaranteeHeroStart()) {
      if (!initialHeroGuardApplied) root.dataset.fxInitialHeroGuard = 'preserve-navigation';
      return;
    }
    initialHeroGuardApplied = true;
    try { history.scrollRestoration = 'manual'; } catch (_) {}

    if (location.hash === '#top') {
      history.replaceState({}, '', location.pathname + location.search + '#hero');
    }

    forceHeroStart('initial');
    requestAnimationFrame(() => {
      forceHeroStart('frame-1');
      requestAnimationFrame(() => forceHeroStart('frame-2'));
    });

    document.addEventListener('formatx:introcomplete', () => {
      const top = heroTop();
      if (Math.abs(scrollY - top) > 96) {
        root.dataset.fxInitialHeroGuard = 'user-scroll-preserved';
        return;
      }
      requestAnimationFrame(() => forceHeroStart('intro-complete'));
    }, { once: true });
  }

  function repairFooterCopy(footer) {
    const licence = footer.querySelector('[data-fx-licence-link]');
    if (licence) {
      licence.dataset.hu = 'Licencfeltételek';
      licence.dataset.en = 'Licence terms';
      licence.textContent = language() === 'en' ? 'Licence terms' : 'Licencfeltételek';
    }

    footer.querySelectorAll('nav').forEach(nav => {
      const seen = new Set();
      Array.from(nav.querySelectorAll('a[href]')).forEach(link => {
        const key = new URL(link.getAttribute('href'), document.baseURI).href;
        if (seen.has(key)) link.remove();
        else seen.add(key);
      });
    });
  }

  function actionLink(className, href, hu, en, external) {
    const anchor = document.createElement('a');
    anchor.className = className;
    anchor.href = href;
    anchor.dataset.hu = hu;
    anchor.dataset.en = en;
    anchor.textContent = language() === 'en' ? en : hu;
    if (external) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    return anchor;
  }

  function buildReleaseHub(panel) {
    let hub = panel.querySelector('.fx-release-download-hub');
    if (hub) return hub;

    hub = document.createElement('section');
    hub.className = 'fx-release-download-hub';
    hub.setAttribute('aria-labelledby', 'fx-release-download-title');

    const head = document.createElement('div');
    head.className = 'fx-release-download-head';
    const copy = document.createElement('div');
    const kicker = document.createElement('p');
    kicker.className = 'section-index';
    kicker.dataset.hu = 'KÖZVETLEN KIADÁSI KÖZPONT';
    kicker.dataset.en = 'DIRECT RELEASE CENTRE';
    const title = document.createElement('h3');
    title.id = 'fx-release-download-title';
    title.dataset.hu = 'Letöltés, kiadás és támogatás egy helyen.';
    title.dataset.en = 'Downloads, releases and support in one place.';
    const lead = document.createElement('p');
    lead.dataset.hu = 'A FormatX teljes verzió. A Bazzite/Linux az elsődleges rendszer, a Windows támogatott platform ugyanabban a multiplatform csomagban. Az első használat 5 napos próbalicenccel indul.';
    lead.dataset.en = 'FormatX is a full release. Bazzite/Linux is the primary system and Windows is supported in the same multiplatform package. First use starts with a 5-day trial licence.';
    copy.append(kicker, title, lead);

    const badge = document.createElement('span');
    badge.className = 'fx-release-download-badge';
    badge.dataset.hu = 'TELJES VERZIÓ';
    badge.dataset.en = 'FULL RELEASE';
    head.append(copy, badge);

    const grid = document.createElement('div');
    grid.className = 'fx-release-download-grid';
    const download = actionLink('fx-release-download-card is-primary', '/scifi-ui/downloads/', 'Teljes multiplatform verzió', 'Full multiplatform version');
    download.dataset.fxReleaseAction = 'multiplatform';
    const android = actionLink('fx-release-download-card', '/download/android', 'Android teljes verzió', 'Android full version');
    const release = actionLink('fx-release-download-card', 'https://github.com/hutoczky/FormatX-Updates/releases', 'Kiadási részletek', 'Release details', true);
    release.dataset.fxReleaseAction = 'release';
    const support = actionLink('fx-release-download-card', '/scifi-ui/support.html', 'Támogatás', 'Support');
    grid.append(download, android, release, support);

    const note = document.createElement('p');
    note.className = 'fx-release-download-note';
    note.dataset.hu = 'Teljes verzió · 5 napos próbalicenc. A letöltési oldal jelzi a platform állapotát és az ellenőrizhető kiadási információkat.';
    note.dataset.en = 'Full release · 5-day trial licence. The downloads page shows platform status and verifiable release information.';

    hub.append(head, grid, note);
    const releaseLayout = panel.querySelector('.release-layout');
    if (releaseLayout) releaseLayout.insertAdjacentElement('afterend', hub);
    else panel.prepend(hub);
    setBilingualText(hub);
    return hub;
  }

  function syncReleaseHub(panel) {
    const hub = buildReleaseHub(panel);
    const heroDownload = document.getElementById('hero-download');
    const releasePage = document.getElementById('release-page-link');
    const direct = hub.querySelector('[data-fx-release-action="multiplatform"]');
    const release = hub.querySelector('[data-fx-release-action="release"]');
    if (direct && heroDownload?.href) direct.href = heroDownload.href;
    if (release && releasePage?.href) release.href = releasePage.href;
    setBilingualText(hub);
  }

  function repairReleasePanel() {
    const main = document.getElementById('main-content');
    const footer = document.querySelector('.site-footer');
    const panel = document.querySelector('[data-organism-panel="resources"]');
    if (!main || !footer) return false;

    if (footer.closest('.fx-organism-panel') || footer.parentElement !== document.body) {
      main.insertAdjacentElement('afterend', footer);
    }
    footer.dataset.fxFooterFlow = 'document';
    repairFooterCopy(footer);

    if (panel) {
      panel.dataset.fxReleasePanel = 'stable-v3';
      syncReleaseHub(panel);
    }
    return true;
  }

  function buildReferenceMirror() {
    const section = document.createElement('section');
    section.className = 'fx-loop-reference-mirror';
    section.dataset.fxLoopMirror = 'reference-v8';
    section.setAttribute('aria-hidden', 'true');
    section.setAttribute('inert', '');
    section.innerHTML = [
      '<div class="fx-loop-reference-copy">',
      '<span class="fx-loop-reference-copy-kicker" data-hu="TECHNIKUSI OPERÁCIÓS RÉTEG" data-en="TECHNICIAN OPERATIONS LAYER">TECHNIKUSI OPERÁCIÓS RÉTEG</span>',
      '<strong>FORMATX</strong><b>SUITE PRO</b>',
      '<p data-hu="Valós rendszerállapot, kontrollált végrehajtás és visszaellenőrizhető eredmény." data-en="Real system state, controlled execution and verifiable outcomes.">Valós rendszerállapot, kontrollált végrehajtás és visszaellenőrizhető eredmény.</p>',
      '</div>',
      '<div class="fx-loop-reference-visual" aria-hidden="true"><img alt="" decoding="async">',
      '<div class="fx-loop-reference-controls"><span class="fx-loop-reference-ask"><i></i><b data-hu="KÉRDEZZ" data-en="ASK">KÉRDEZZ</b></span><span class="fx-loop-reference-pause"></span></div>',
      '</div>',
      '<div class="fx-loop-reference-heading" data-hu="A MŰKÖDÉS MEGISMERÉSE" data-en="DISCOVER HOW IT WORKS">A MŰKÖDÉS MEGISMERÉSE</div>',
      '<article class="fx-loop-reference-proof">',
      '<span>PUBLIC PROOF LAYER</span>',
      '<h2 data-hu="Bizonyíték a látvány mögött." data-en="Proof behind the visual.">Bizonyíték a látvány mögött.</h2>',
      '<p data-hu="A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető." data-en="FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.">A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.</p>',
      '<i>Live OS</i>',
      '</article>'
    ].join('');
    setBilingualText(section);
    return section;
  }

  function captureReferenceMirror() {
    mirrorCaptureFrame = 0;
    if (!mirrorImage || !mirror?.isConnected || !sourceHero?.isConnected) return false;
    const detail = sourceHero.querySelector('.fx-core-detail-r122');
    if (!(detail instanceof HTMLCanvasElement) || detail.width < 8 || detail.height < 8) return false;
    try {
      const snapshot = detail.toDataURL('image/webp', .9);
      if (!snapshot || snapshot.length < 512) return false;
      mirrorImage.src = snapshot;
      mirrorImage.hidden = false;
      root.dataset.fxLoopMirrorFrame = `${detail.width}x${detail.height}`;
      return true;
    } catch (_) {
      root.dataset.fxLoopMirrorFrame = 'capture-unavailable';
      return false;
    }
  }

  function scheduleMirrorCapture(delay = 0) {
    clearTimeout(mirrorCaptureTimer);
    mirrorCaptureTimer = window.setTimeout(() => {
      cancelAnimationFrame(mirrorCaptureFrame);
      mirrorCaptureFrame = requestAnimationFrame(() => {
        mirrorCaptureFrame = requestAnimationFrame(captureReferenceMirror);
      });
    }, Math.max(0, delay));
  }

  function resetGeometry() {
    loopGeometry = Object.freeze({
      ready: false,
      bridgeTop: 0,
      bridgeThreshold: 0,
      sourceTop: 0,
      sourceHeight: 0,
      documentEnd: 0,
    });
  }

  function refreshGeometry() {
    sourceHero = document.querySelector('#main-content > #hero');
    if (!bridge || !sourceHero || !bridge.isConnected || !sourceHero.isConnected) {
      resetGeometry();
      return false;
    }

    const viewportHeight = innerHeight;
    const bridgeTop = bridge.offsetTop;
    const sourceTop = sourceHero.offsetTop;
    const sourceHeight = sourceHero.offsetHeight;
    const documentEnd = Math.max(0, document.documentElement.scrollHeight - viewportHeight);

    bridge.style.setProperty('--fx-loop-source-height', `${Math.round(sourceHeight)}px`);

    loopGeometry = Object.freeze({
      ready: true,
      bridgeTop,
      bridgeThreshold: bridgeTop + Math.max(36, Math.min(viewportHeight * .18, 180)),
      sourceTop,
      sourceHeight,
      documentEnd,
    });
    root.dataset.fxLoopGeometryR592 = `${Math.round(bridgeTop)}:${Math.round(loopGeometry.bridgeThreshold)}:${Math.round(documentEnd)}`;
    return true;
  }

  function scheduleGeometryRefresh() {
    if (geometryFrame) return;
    geometryFrame = requestAnimationFrame(() => {
      geometryFrame = 0;
      refreshGeometry();
    });
  }

  function observeGeometry() {
    geometryObserver?.disconnect();
    geometryObserver = null;
    if (!('ResizeObserver' in window) || !bridge || !sourceHero) return;

    geometryObserver = new ResizeObserver(() => scheduleGeometryRefresh());
    const main = document.getElementById('main-content');
    const footer = document.querySelector('body > .site-footer');
    if (main) geometryObserver.observe(main);
    if (footer) geometryObserver.observe(footer);
    geometryObserver.observe(sourceHero);
    geometryObserver.observe(bridge);
  }

  function removeBridge() {
    geometryObserver?.disconnect();
    geometryObserver = null;
    bridge?.remove();
    document.querySelectorAll('.fx-loop-bridge,[data-fx-loop-clone="true"],[data-fx-loop-mirror]').forEach(element => {
      if (element !== bridge) element.remove();
    });
    bridge = null;
    mirror = null;
    mirrorImage = null;
    resetGeometry();
    root.dataset.fxLoopBridge = 'missing';
  }

  function buildBridge() {
    if (!repairReleasePanel()) return false;
    const footer = document.querySelector('body > .site-footer');
    sourceHero = document.querySelector('#main-content > #hero');
    if (!footer || !sourceHero) return false;

    removeBridge();
    mirror = buildReferenceMirror();
    mirrorImage = mirror.querySelector('img');

    bridge = document.createElement('div');
    bridge.className = 'fx-loop-bridge';
    bridge.dataset.fxLoopBridge = VERSION;
    bridge.setAttribute('aria-hidden', 'true');
    bridge.setAttribute('inert', '');
    bridge.appendChild(mirror);
    footer.insertAdjacentElement('afterend', bridge);

    // R592: stylesheet readiness is a prerequisite. Geometry is sampled only
    // after the bridge's min-height/runway rules are in the render tree.
    refreshGeometry();
    observeGeometry();
    scheduleGeometryRefresh();
    scheduleMirrorCapture(80);
    root.dataset.fxLoopBridge = 'ready-v3';
    return true;
  }

  function bridgeRelative() {
    const geometry = loopGeometry;
    if (!geometry.ready) return null;
    const y = scrollY;
    if (y < geometry.bridgeThreshold || y > geometry.documentEnd + 2) return null;
    return Math.max(0, Math.min(y - geometry.bridgeTop, Math.max(0, geometry.sourceHeight - 2)));
  }

  function markIdle() {
    clearTimeout(activityTimer);
    activityTimer = 0;
    root.dataset.fxScrollActivity = 'idle';
    root.classList.remove('fx-page-scrolling');
    if (isMobileFlow()) scheduleMobileTransfer();
    else commitDesktopTransfer();
  }

  function landingTarget(relative) {
    let geometry = loopGeometry;
    if (!geometry.ready) {
      refreshGeometry();
      geometry = loopGeometry;
    }
    if (!geometry.ready) return null;
    const bounded = Math.max(0, Math.min(relative, Math.max(0, geometry.sourceHeight - 2)));
    return geometry.sourceTop + bounded;
  }

  function landAt(relative) {
    const target = landingTarget(relative);
    if (target == null) return;
    window.scrollTo({ top: target, left: 0, behavior: 'auto' });
    root.dataset.fxLoopLanding = String(Math.round(target));
  }

  function finishLanding(relative) {
    cancelAnimationFrame(landingFrame);
    landAt(relative);
    landingFrame = requestAnimationFrame(() => {
      landAt(relative);
      landingFrame = requestAnimationFrame(() => {
        root.classList.remove('fx-seamless-loop-transfer');
        root.dataset.fxInfiniteInput = 'native';
        root.dataset.fxLoopLandingState = 'settled';
        landingFrame = 0;
      });
    });
  }

  function performTransfer(relative, source) {
    if (relative == null || Date.now() < transferLockedUntil) return false;
    if (document.body.classList.contains('fx-organism-panel-open')) return false;
    if (root.classList.contains('fx-organism-menu-open') || root.classList.contains('fx-intro-running')) return false;

    transferLockedUntil = Date.now() + LOOP_GUARD_MS;
    pendingMobileRelative = null;
    pendingDesktopRelative = null;
    clearTimeout(mobileSettleTimer);
    mobileSettleTimer = 0;
    root.classList.add('fx-seamless-loop-transfer');
    root.dataset.fxInfiniteInput = 'visual-transfer';
    root.dataset.fxLoopLandingState = 'stabilising';
    loopCount += 1;
    root.dataset.fxLoopCount = String(loopCount);
    root.dataset.fxLoopSource = source;

    dispatchEvent(new CustomEvent('formatx:loop', {
      detail: { count: loopCount, source, relative }
    }));
    finishLanding(relative);
    return true;
  }

  function commitMobileTransfer() {
    mobileSettleTimer = 0;
    if (touchActive || Date.now() < transferLockedUntil) return;

    refreshGeometry();
    const relative = bridgeRelative();
    if (relative == null) {
      pendingMobileRelative = null;
      root.dataset.fxLoopLandingState = 'native-mobile';
      return;
    }
    pendingMobileRelative = relative;
    performTransfer(relative, 'visual-bridge-mobile-idle');
  }

  function scheduleMobileTransfer() {
    if (!isMobileFlow() || touchActive) return;
    clearTimeout(mobileSettleTimer);
    mobileSettleTimer = window.setTimeout(commitMobileTransfer, MOBILE_SETTLE_MS);
  }

  function commitDesktopTransfer() {
    if (isMobileFlow() || pendingDesktopRelative == null || Date.now() < transferLockedUntil) return;
    refreshGeometry();
    const relative = bridgeRelative();
    if (relative == null) {
      pendingDesktopRelative = null;
      root.dataset.fxLoopLandingState = 'native-desktop';
      return;
    }
    pendingDesktopRelative = relative;
    performTransfer(relative, 'visual-bridge-desktop-idle');
  }

  function transferIfNeeded() {
    scrollFrame = 0;
    const relative = bridgeRelative();

    root.dataset.fxScrollActivity = 'scrolling';
    root.classList.add('fx-page-scrolling');
    clearTimeout(activityTimer);
    activityTimer = window.setTimeout(markIdle, ACTIVITY_IDLE_MS);

    if (relative == null) {
      if (isMobileFlow()) {
        pendingMobileRelative = null;
        clearTimeout(mobileSettleTimer);
        mobileSettleTimer = 0;
      } else pendingDesktopRelative = null;
      return;
    }

    if (isMobileFlow()) {
      pendingMobileRelative = relative;
      root.dataset.fxInfiniteInput = 'native';
      root.dataset.fxLoopLandingState = touchActive ? 'waiting-touch-end' : 'waiting-momentum-end';
      scheduleMobileTransfer();
      return;
    }

    pendingDesktopRelative = relative;
    root.dataset.fxInfiniteInput = 'native-wheel';
    root.dataset.fxLoopLandingState = 'waiting-wheel-idle';
  }

  function onScroll() {
    if (scrollFrame || !initialised) return;
    scrollFrame = requestAnimationFrame(transferIfNeeded);
  }

  function scheduleRepair(rebuildBridge) {
    clearTimeout(repairTimer);
    repairTimer = window.setTimeout(() => {
      repairReleasePanel();
      if (rebuildBridge !== false && !document.body.classList.contains('fx-organism-panel-open')) buildBridge();
      else scheduleGeometryRefresh();
    }, 60);
  }

  function onResize() {
    if (!initialised) return;
    const nextWidth = innerWidth;
    const widthChanged = Math.abs(nextWidth - layoutWidth) > 8;
    if (widthChanged) layoutWidth = nextWidth;
    scheduleRepair(widthChanged);
    scheduleMirrorCapture(180);
  }

  function onTouchStart() {
    if (!initialised || !isMobileFlow()) return;
    touchActive = true;
    clearTimeout(mobileSettleTimer);
    mobileSettleTimer = 0;
    root.dataset.fxInfiniteInput = 'native-touch';
  }

  function onTouchEnd() {
    if (!initialised || !isMobileFlow()) return;
    touchActive = false;
    root.dataset.fxInfiniteInput = 'native';
    scheduleMobileTransfer();
  }

  function onScrollEnd() {
    if (!initialised || !isMobileFlow() || touchActive) return;
    clearTimeout(mobileSettleTimer);
    mobileSettleTimer = window.setTimeout(commitMobileTransfer, 0);
  }

  function onPanelOpen(event) {
    if (event.detail?.id !== 'resources') return;
    const panel = document.querySelector('[data-organism-panel="resources"]');
    if (panel) {
      syncReleaseHub(panel);
      panel.scrollTop = 0;
    }
    scheduleGeometryRefresh();
  }

  async function initialise() {
    if (initialised) return;
    try {
      await ensureStyleReady();
      await waitForBootFloor();
    } catch (_) {
      root.dataset.fxInfiniteScroll = 'failed-style-' + VERSION;
      return;
    }
    root.dataset.fxLoopBootstrapR593 = 'post-critical-window-running';
    guaranteeInitialHero();
    repairReleasePanel();
    if (!buildBridge()) {
      root.dataset.fxInfiniteScroll = 'failed-bridge-' + VERSION;
      return;
    }
    initialised = true;
    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: VERSION,
      automaticLoop: true,
      visualBridge: true,
      clonedContent: false,
      clonedHeroOnly: false,
      inertReferenceMirror: true,
      mirrorContext: 'static-2d-snapshot-no-webgl',
      reinitialisedRenderer: false,
      frameStableLanding: true,
      jumpFree: true,
      sectionSnapDisabled: true,
      geometryCachedOutsideScroll: true,
      styleReadyGeometryR592: true,
      postCriticalWindowBootR593: LOOP_BOOT_FLOOR_MS,
      mobileIdleGeometryRefresh: true,
      deepLinksPreserved: true,
      initialHeroGuaranteed: shouldGuaranteeHeroStart(),
      desktopTransfer: 'scroll-idle-visual-match',
      mobileTransfer: 'scrollend-or-idle',
      mobileNativeMomentumPreserved: true
    });
    root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
    root.dataset.fxInfiniteController = VERSION;
    root.dataset.fxAutomaticLoop = 'enabled';
    root.dataset.fxMobileScrollMode = 'native-momentum-loop';
    root.dataset.fxLoopBootstrapR593 = 'ready-post-critical-window';
    onScroll();

    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleGeometryRefresh).catch(() => {});
    }
    for (const delay of [320, 900, 2200]) scheduleMirrorCapture(delay);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('scrollend', onScrollEnd, { passive: true });
  addEventListener('resize', onResize, { passive: true });
  addEventListener('load', scheduleGeometryRefresh, { once: true, passive: true });
  addEventListener('pageshow', () => { if (initialised) scheduleRepair(true); }, { passive: true });
  addEventListener('formatx:organisminterfaceready', () => { if (initialised) scheduleRepair(true); });
  addEventListener('formatx:organismpanelopen', onPanelOpen);
  addEventListener('formatx:organismpanelclose', () => { if (initialised) scheduleRepair(true); });
  addEventListener('formatx:languagechange', () => {
    if (!initialised) return;
    setBilingualText(bridge);
    const footer = document.querySelector('.site-footer');
    if (footer) repairFooterCopy(footer);
    const panel = document.querySelector('[data-organism-panel="resources"]');
    if (panel) syncReleaseHub(panel);
    scheduleGeometryRefresh();
  });
  addEventListener('formatx:coredetailready', () => { if (initialised) scheduleMirrorCapture(80); });
  addEventListener('formatx:real3dready', () => { if (initialised) scheduleMirrorCapture(220); });
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
  document.addEventListener('touchcancel', onTouchEnd, { passive: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();

  addEventListener('pagehide', () => {
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(landingFrame);
    cancelAnimationFrame(geometryFrame);
    cancelAnimationFrame(mirrorCaptureFrame);
    clearTimeout(activityTimer);
    clearTimeout(mobileSettleTimer);
    clearTimeout(repairTimer);
    clearTimeout(mirrorCaptureTimer);
    clearTimeout(bootTimer);
    geometryObserver?.disconnect();
  }, { once: true });
}());
