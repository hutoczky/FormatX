(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'seamless-v7';
  const LOOP_GUARD_MS = 420;
  const ACTIVITY_IDLE_MS = 170;
  const MOBILE_SETTLE_MS = 220;
  const MOBILE_FLOW_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const HERO_START_HASHES = new Set(['', '#top', '#hero']);
  let bridge = null;
  let sourceHero = null;
  let transferLockedUntil = 0;
  let scrollFrame = 0;
  let landingFrame = 0;
  let activityTimer = 0;
  let mobileSettleTimer = 0;
  let pendingMobileRelative = null;
  let touchActive = false;
  let loopCount = Number(root.dataset.fxLoopCount || 0);
  let repairTimer = 0;
  let geometryFrame = 0;
  let geometryObserver = null;
  let layoutWidth = innerWidth;
  let initialHeroGuardApplied = false;
  let loopGeometry = Object.freeze({
    ready: false,
    bridgeTop: 0,
    bridgeThreshold: 0,
    sourceTop: 0,
    sourceHeight: 0,
    documentEnd: 0,
  });

  if (root.dataset.fxInfiniteController === VERSION) return;

  root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
  root.dataset.fxInfiniteController = VERSION;
  root.dataset.fxInfiniteCloneMode = 'visual-bridge';
  root.dataset.fxInfiniteInput = 'native';
  root.dataset.fxScrollActivity = 'idle';
  root.dataset.fxAutomaticLoop = 'enabled';
  root.dataset.fxScrollJumpGuard = 'visual-match-v4';
  root.dataset.fxLoopBridge = 'initialising';
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

  function ensureStyle() {
    if (document.querySelector('link[data-fx-seamless-loop-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/formatx-seamless-loop.css?v=20260808-seamless-v7';
    link.dataset.fxSeamlessLoopStyle = 'true';
    document.head.appendChild(link);
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

  function neutraliseClone(clone) {
    clone.id = 'fx-loop-hero-bridge';
    clone.dataset.fxLoopClone = 'true';
    clone.classList.add('fx-loop-hero-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('inert', '');

    clone.querySelectorAll('[id]').forEach((element, index) => {
      element.id = 'fx-loop-clone-' + index;
    });
    clone.querySelectorAll('[aria-labelledby],[aria-controls],[for]').forEach(element => {
      element.removeAttribute('aria-labelledby');
      element.removeAttribute('aria-controls');
      element.removeAttribute('for');
    });
    clone.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(element => {
      element.setAttribute('tabindex', '-1');
      element.setAttribute('aria-hidden', 'true');
      if ('disabled' in element) element.disabled = true;
      if (element instanceof HTMLAnchorElement) element.removeAttribute('href');
    });
    clone.querySelectorAll('canvas,iframe,video,audio').forEach(element => element.remove());
    setBilingualText(clone);
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

    loopGeometry = Object.freeze({
      ready: true,
      bridgeTop,
      bridgeThreshold: bridgeTop + Math.max(36, Math.min(viewportHeight * .18, 180)),
      sourceTop,
      sourceHeight,
      documentEnd,
    });
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
    document.querySelectorAll('.fx-loop-bridge,[data-fx-loop-clone="true"]').forEach(element => {
      if (element !== bridge) element.remove();
    });
    bridge = null;
    resetGeometry();
    root.dataset.fxLoopBridge = 'missing';
  }

  function buildBridge() {
    if (!repairReleasePanel()) return false;
    const footer = document.querySelector('body > .site-footer');
    sourceHero = document.querySelector('#main-content > #hero');
    if (!footer || !sourceHero) return false;

    removeBridge();
    const clone = sourceHero.cloneNode(true);
    neutraliseClone(clone);

    bridge = document.createElement('div');
    bridge.className = 'fx-loop-bridge';
    bridge.dataset.fxLoopBridge = VERSION;
    bridge.setAttribute('aria-hidden', 'true');
    bridge.appendChild(clone);
    footer.insertAdjacentElement('afterend', bridge);
    root.dataset.fxLoopBridge = 'ready-v3';

    // Geometry is deliberately sampled outside the scroll hot path. This avoids
    // style writes followed by offset/scrollHeight reads on every animation frame.
    refreshGeometry();
    observeGeometry();
    scheduleGeometryRefresh();
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
    if (!isMobileFlow() || pendingMobileRelative == null || touchActive) return;
    clearTimeout(mobileSettleTimer);
    mobileSettleTimer = window.setTimeout(commitMobileTransfer, MOBILE_SETTLE_MS);
  }

  function transferIfNeeded() {
    scrollFrame = 0;

    // Read the cached transfer position before mutating classes/data attributes.
    // The scroll frame therefore contains no layout-dependent DOM reads.
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
      }
      return;
    }

    if (isMobileFlow()) {
      pendingMobileRelative = relative;
      root.dataset.fxInfiniteInput = 'native';
      root.dataset.fxLoopLandingState = touchActive ? 'waiting-touch-end' : 'waiting-momentum-end';
      scheduleMobileTransfer();
      return;
    }

    performTransfer(relative, 'visual-bridge-desktop');
  }

  function onScroll() {
    if (scrollFrame) return;
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
    const nextWidth = innerWidth;
    const widthChanged = Math.abs(nextWidth - layoutWidth) > 8;
    if (widthChanged) layoutWidth = nextWidth;
    scheduleRepair(widthChanged);
  }

  function onTouchStart() {
    if (!isMobileFlow()) return;
    touchActive = true;
    clearTimeout(mobileSettleTimer);
    mobileSettleTimer = 0;
    root.dataset.fxInfiniteInput = 'native-touch';
  }

  function onTouchEnd() {
    if (!isMobileFlow()) return;
    touchActive = false;
    root.dataset.fxInfiniteInput = 'native';
    scheduleMobileTransfer();
  }

  function onScrollEnd() {
    if (!isMobileFlow() || touchActive || pendingMobileRelative == null) return;
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

  function initialise() {
    ensureStyle();
    guaranteeInitialHero();
    repairReleasePanel();
    buildBridge();
    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: VERSION,
      automaticLoop: true,
      visualBridge: true,
      clonedContent: false,
      clonedHeroOnly: true,
      reinitialisedRenderer: false,
      frameStableLanding: true,
      jumpFree: true,
      sectionSnapDisabled: true,
      geometryCachedOutsideScroll: true,
      deepLinksPreserved: true,
      initialHeroGuaranteed: shouldGuaranteeHeroStart(),
      desktopTransfer: 'immediate-visual-match',
      mobileTransfer: 'scrollend-or-idle',
      mobileNativeMomentumPreserved: true
    });
    root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
    root.dataset.fxInfiniteController = VERSION;
    root.dataset.fxAutomaticLoop = 'enabled';
    root.dataset.fxMobileScrollMode = 'native-momentum-loop';
    onScroll();

    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleGeometryRefresh).catch(() => {});
    }
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('scrollend', onScrollEnd, { passive: true });
  addEventListener('resize', onResize, { passive: true });
  addEventListener('load', scheduleGeometryRefresh, { once: true, passive: true });
  addEventListener('pageshow', () => scheduleRepair(true), { passive: true });
  addEventListener('formatx:organisminterfaceready', () => scheduleRepair(true));
  addEventListener('formatx:organismpanelopen', onPanelOpen);
  addEventListener('formatx:organismpanelclose', () => scheduleRepair(true));
  addEventListener('formatx:languagechange', () => {
    setBilingualText(bridge);
    const footer = document.querySelector('.site-footer');
    if (footer) repairFooterCopy(footer);
    const panel = document.querySelector('[data-organism-panel="resources"]');
    if (panel) syncReleaseHub(panel);
    scheduleGeometryRefresh();
  });
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
  document.addEventListener('touchcancel', onTouchEnd, { passive: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();

  addEventListener('pagehide', () => {
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(landingFrame);
    cancelAnimationFrame(geometryFrame);
    clearTimeout(activityTimer);
    clearTimeout(mobileSettleTimer);
    clearTimeout(repairTimer);
    geometryObserver?.disconnect();
  }, { once: true });
}());
