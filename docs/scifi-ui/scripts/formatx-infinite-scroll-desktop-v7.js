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
  let desktopGuardRetryTimer = 0;
  let pendingMobileRelative = null;
  let pendingDesktopRelative = null;
  let pendingDesktopSourceTop = null;
  let desktopGestureAnchorY = null;
  let desktopGestureAnchorRelative = null;
  let canonicalLandingSourceTop = 0;
  let touchActive = false;
  let loopCount = Number(root.dataset.fxLoopCount || 0);
  let repairTimer = 0;
  let geometryFrame = 0;
  let geometryObserver = null;
  let sectionSettledObserver = null;
  let stableDesktopBridgeTop = null;
  let stableDesktopSourceHeight = 0;
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
  root.dataset.fxInfiniteCloneMode = 'inert-reference-mirror';
  root.dataset.fxInfiniteInput = 'native';
  root.dataset.fxScrollActivity = 'idle';
  root.dataset.fxAutomaticLoop = 'enabled';
  root.dataset.fxScrollJumpGuard = 'visual-match-v4';
  root.dataset.fxLoopBridge = 'initialising';
  root.dataset.fxScrollSnap = 'disabled';
  root.dataset.fxMobileScrollMode = 'native-momentum-loop';
  root.dataset.fxInitialHeroGuard = 'pending';
  root.dataset.fxLoopEndIntentPolicyR1724='cached-end-latched-through-idle-reflow';
  root.dataset.fxLoopDesktopSettleR1724='scrollend-primary-idle-timer-fallback';
  root.dataset.fxLoopVisualContinuityR1724='scroll-frame-relative-authoritative-through-reflow';
  root.dataset.fxLoopSourceTopContinuityR1724='scroll-frame-source-top-authoritative-through-idle-reflow';
  root.dataset.fxLoopSourceTopContinuityR1725='hero-local-loop-origin-zero-active-scroll-offsetparent-proof';
  root.dataset.fxLoopLandingSpaceR1725='hero-local-coordinate-space';
  root.dataset.fxLoopGestureGeometryR1725='single-live-read-at-desktop-scroll-start-then-cache';
  root.dataset.fxLoopSectionNavigationIsolationR1724='programmatic-section-scroll-never-triggers-loop';
  root.dataset.fxLoopGeometrySyncR1724='body-resize-plus-explicit-refresh-event';
  root.dataset.fxLoopPendingCorrectionPolicyR1724='90ms-fresh-geometry-before-170ms-commit';
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
    const existing=document.querySelector('link[data-fx-seamless-loop-style]');
    if(existing instanceof HTMLLinkElement){
      if(!existing.sheet)existing.addEventListener('load',scheduleGeometryRefresh,{once:true,passive:true});
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/formatx-seamless-loop.css?v=20260924-r1715-idle-geometry-refresh';
    link.dataset.fxSeamlessLoopStyle = 'true';
    link.addEventListener('load',scheduleGeometryRefresh,{once:true,passive:true});
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

  function buildReferenceMirror() {
    const section = document.createElement('section');
    section.className = 'fx-loop-reference-mirror';
    section.dataset.fxLoopMirror = 'reference-v8';
    section.dataset.fxLoopCapture = 'pending-r534';
    section.setAttribute('aria-hidden', 'true');
    section.setAttribute('inert', '');
    section.innerHTML = [
      '<div class="fx-loop-reference-copy">',
      '<span class="fx-loop-reference-copy-kicker" data-hu="TECHNIKUSI OPERÁCIÓS RÉTEG" data-en="TECHNICIAN OPERATIONS LAYER">TECHNIKUSI OPERÁCIÓS RÉTEG</span>',
      '<strong>FORMATX</strong><b>SUITE PRO</b>',
      '<p data-hu="Valós rendszerállapot, kontrollált végrehajtás és visszaellenőrizhető eredmény." data-en="Real system state, controlled execution and verifiable outcomes.">Valós rendszerállapot, kontrollált végrehajtás és visszaellenőrizhető eredmény.</p>',
      '</div>',
      '<div class="fx-loop-reference-visual" aria-hidden="true"><span class="fx-loop-reference-core-fallback"></span><img class="fx-loop-reference-image" alt="" decoding="async"></div>',
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

  function activeCoreCanvas() {
    const api = window.FormatXLivingCore || window.FormatXCoreMobileV69;
    const apiCanvas = api?.canvas;
    if (apiCanvas instanceof HTMLCanvasElement && apiCanvas.width >= 8 && apiCanvas.height >= 8) return apiCanvas;
    const current = sourceHero?.querySelector(
      '.fx-crystal-organism-r326-canvas, .fx-core-mobile-v55-canvas, .fx-core-real3d-canvas'
    );
    return current instanceof HTMLCanvasElement && current.width >= 8 && current.height >= 8 ? current : null;
  }

  function captureReferenceMirror() {
    mirrorCaptureFrame = 0;
    if (!mirrorImage || !mirror?.isConnected || !sourceHero?.isConnected) return false;
    const liveCanvas = activeCoreCanvas();
    if (!(liveCanvas instanceof HTMLCanvasElement)) {
      mirror.dataset.fxLoopCapture = 'fallback-r534';
      root.dataset.fxLoopMirrorFrame = 'live-canvas-unavailable';
      return false;
    }

    try {
      /* The production MAG uses preserveDrawingBuffer:false. Capture it in the
         same animation frame as a requested native render, copying into a 2D
         bitmap so the loop bridge never exposes the obsolete blank r122 layer. */
      const maxSide = 1100;
      const scale = Math.min(1, maxSide / Math.max(liveCanvas.width, liveCanvas.height));
      const snapshotCanvas = document.createElement('canvas');
      snapshotCanvas.width = Math.max(8, Math.round(liveCanvas.width * scale));
      snapshotCanvas.height = Math.max(8, Math.round(liveCanvas.height * scale));
      const snapshotContext = snapshotCanvas.getContext('2d', { alpha: true });
      if (!snapshotContext) throw new Error('2d-snapshot-context-unavailable');
      snapshotContext.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
      snapshotContext.drawImage(liveCanvas, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
      const snapshot = snapshotCanvas.toDataURL('image/webp', .9);
      if (!snapshot || snapshot.length < 900) throw new Error('snapshot-empty');

      mirrorImage.src = snapshot;
      mirror.dataset.fxLoopCapture = 'ready-r534';
      root.dataset.fxLoopMirrorFrame = `${liveCanvas.width}x${liveCanvas.height}-native-r326`;
      return true;
    } catch (_) {
      mirror.dataset.fxLoopCapture = 'fallback-r534';
      root.dataset.fxLoopMirrorFrame = 'capture-unavailable-r534';
      return false;
    }
  }

  function scheduleMirrorCapture(delay = 0) {
    clearTimeout(mirrorCaptureTimer);
    mirrorCaptureTimer = window.setTimeout(function attemptMirrorCapture() {
      mirrorCaptureTimer=0;
      const activeScroll = root.dataset.fxScrollBudgetR1660 === 'fast'
        || root.dataset.fxScrollActivity === 'scrolling'
        || root.classList.contains('fx-page-scrolling');
      if(activeScroll){
        root.dataset.fxLoopMirrorCaptureR1679='deferred-active-scroll';
        mirrorCaptureTimer=window.setTimeout(attemptMirrorCapture,360);
        return;
      }
      cancelAnimationFrame(mirrorCaptureFrame);
      const api = window.FormatXLivingCore || window.FormatXCoreMobileV69;
      try { api?.requestRender?.(1); } catch (_) {}
      /* Snapshot work is strictly post-scroll. It must never steal a frame from
         the native scroll path or the 60 Hz compositor budget. */
      mirrorCaptureFrame = requestAnimationFrame(()=>{
        captureReferenceMirror();
        root.dataset.fxLoopMirrorCaptureR1679='post-scroll-single-frame';
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
    const desiredThreshold = bridgeTop + Math.max(36, Math.min(viewportHeight * .18, 180));
    /* R1724: the bridge may begin inside the final viewport, so bridgeTop can
       legitimately be greater than the maximum scroll position. Never clamp
       the trigger back up to an unreachable bridgeTop; use the last reachable
       document coordinate instead. bridgeRelative() then resolves this case to
       relative=0, which lands on the real hero without a dead scroll zone. */
    const reachableLimit = Math.max(0, documentEnd - 2);
    const reachableThreshold = Math.max(0, Math.min(desiredThreshold, reachableLimit));

    bridge.style.setProperty('--fx-loop-source-height', `${Math.round(sourceHeight)}px`);

    loopGeometry = Object.freeze({
      ready: true,
      bridgeTop,
      bridgeThreshold: reachableThreshold,
      sourceTop,
      sourceHeight,
      documentEnd,
    });
    root.dataset.fxLoopReachableThresholdR1723 = String(Math.round(reachableThreshold));
    root.dataset.fxLoopReachableThresholdR1724 = documentEnd < bridgeTop ? 'final-viewport-safe' : 'bridge-relative-safe';
    return true;
  }

  function captureStableDesktopGeometry(reason='idle') {
    if (isMobileFlow() || !bridge?.isConnected || !sourceHero?.isConnected) return false;
    const top=Number(bridge.offsetTop);
    const sourceHeight=Number(sourceHero.offsetHeight);
    if(!Number.isFinite(top) || !Number.isFinite(sourceHeight))return false;
    stableDesktopBridgeTop=Math.max(0,top);
    stableDesktopSourceHeight=Math.max(0,sourceHeight);
    root.dataset.fxLoopStableBridgeTopR1727=String(Math.round(stableDesktopBridgeTop));
    root.dataset.fxLoopStableSourceHeightR1727=String(Math.round(stableDesktopSourceHeight));
    root.dataset.fxLoopStableGeometrySourceR1727=reason;
    return true;
  }

  function scheduleGeometryRefresh() {
    if (geometryFrame) return;
    geometryFrame = requestAnimationFrame(() => {
      geometryFrame = 0;
      refreshGeometry();
      const quiet=root.dataset.fxScrollActivity!=='scrolling'
        && !root.classList.contains('fx-page-scrolling')
        && !root.classList.contains('fx-seamless-loop-transfer')
        && !root.classList.contains('fx-section-navigation-active')
        && !Number.isFinite(desktopGestureAnchorY);
      if(quiet)captureStableDesktopGeometry('idle-geometry-refresh');
    });
  }

  function observeGeometry() {
    geometryObserver?.disconnect();
    geometryObserver = null;
    sectionSettledObserver?.disconnect();
    sectionSettledObserver = null;
    if (!('ResizeObserver' in window) || !bridge || !sourceHero) return;

    geometryObserver = new ResizeObserver(() => scheduleGeometryRefresh());
    const main = document.getElementById('main-content');
    const footer = document.querySelector('body > .site-footer');
    if (document.body) geometryObserver.observe(document.body);
    if (main) geometryObserver.observe(main);
    if (footer) geometryObserver.observe(footer);
    geometryObserver.observe(sourceHero);
    geometryObserver.observe(bridge);

    if('MutationObserver' in window){
      sectionSettledObserver=new MutationObserver(records=>{
        if(!records.some(record=>record.attributeName==='data-fx-section-navigation-settled-r581'))return;
        captureStableDesktopGeometry('section-navigation-settled');
        requestAnimationFrame(()=>{
          if(!root.classList.contains('fx-page-scrolling')
            && !root.classList.contains('fx-section-navigation-active')){
            captureStableDesktopGeometry('section-navigation-settled-raf');
          }
        });
      });
      sectionSettledObserver.observe(root,{attributes:true,attributeFilter:['data-fx-section-navigation-settled-r581']});
    }
  }

  function removeBridge() {
    geometryObserver?.disconnect();
    geometryObserver = null;
    sectionSettledObserver?.disconnect();
    sectionSettledObserver = null;
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
    root.dataset.fxLoopBridge = 'ready-v3';
    captureCanonicalLandingOrigin();

    // Geometry is deliberately sampled outside the scroll hot path. This avoids
    // style writes followed by offset/scrollHeight reads on every animation frame.
    refreshGeometry();
    captureStableDesktopGeometry('bridge-build');
    observeGeometry();
    scheduleGeometryRefresh();
    scheduleMirrorCapture(80);
    return true;
  }

  function bridgeRelative() {
    const geometry = loopGeometry;
    if (!geometry.ready) return null;
    const y = scrollY;
    if (y < geometry.bridgeThreshold || y > geometry.documentEnd + 2) return null;
    return Math.max(0, Math.min(y - geometry.bridgeTop, Math.max(0, geometry.sourceHeight - 2)));
  }

  function captureCanonicalLandingOrigin() {
    if (!sourceHero || !sourceHero.isConnected) return;
    /* offsetTop is sampled only after scrolling settles and while the real hero
       is still the active scene. This prevents active-scroll offsetParent/layout
       changes from contaminating the loop destination. */
    if (scrollY > Math.max(innerHeight * 1.10, sourceHero.offsetHeight + 160)) return;
    const measured = Number(sourceHero.offsetTop);
    if (!Number.isFinite(measured)) return;
    canonicalLandingSourceTop = Math.max(0, measured);
    root.dataset.fxLoopCanonicalSourceTopR1725 = String(Math.round(canonicalLandingSourceTop));
  }

  function markIdle() {
    clearTimeout(activityTimer);
    activityTimer = 0;
    root.dataset.fxScrollActivity = 'idle';
    root.classList.remove('fx-page-scrolling');
    captureCanonicalLandingOrigin();
    if (isMobileFlow()) scheduleMobileTransfer();
    else commitDesktopTransfer();
  }

  function landingTarget(relative, sourceTopOverride=null) {
    let geometry = loopGeometry;
    if (!geometry.ready) {
      refreshGeometry();
      geometry = loopGeometry;
    }
    if (!geometry.ready) return null;
    const bounded = Math.max(0, Math.min(relative, Math.max(0, geometry.sourceHeight - 2)));
    const sourceTop=Number.isFinite(sourceTopOverride)?sourceTopOverride:geometry.sourceTop;
    return Math.max(0,sourceTop + bounded);
  }

  function landAt(relative, sourceTopOverride=null) {
    const target = landingTarget(relative,sourceTopOverride);
    if (target == null) return;
    window.scrollTo({ top: target, left: 0, behavior: 'auto' });
    root.dataset.fxLoopLanding = String(Math.round(target));
  }

  function finishLanding(relative, sourceTopOverride=null) {
    cancelAnimationFrame(landingFrame);
    landAt(relative,sourceTopOverride);
    landingFrame = requestAnimationFrame(() => {
      landAt(relative,sourceTopOverride);
      landingFrame = requestAnimationFrame(() => {
        root.classList.remove('fx-seamless-loop-transfer');
        root.dataset.fxInfiniteInput = 'native';
        root.dataset.fxLoopLandingState = 'settled';
        landingFrame = 0;
      });
    });
  }

  function performTransfer(relative, source, sourceTopOverride=null) {
    if (relative == null || Date.now() < transferLockedUntil) return false;
    if (document.body.classList.contains('fx-organism-panel-open')) return false;
    if (root.classList.contains('fx-organism-menu-open') || root.classList.contains('fx-intro-running') || root.classList.contains('fx-section-navigation-active')) return false;

    transferLockedUntil = Date.now() + LOOP_GUARD_MS;
    clearTimeout(desktopGuardRetryTimer);
    desktopGuardRetryTimer = 0;
    pendingMobileRelative = null;
    pendingDesktopRelative = null;
    pendingDesktopSourceTop = null;
    desktopGestureAnchorY = null;
    desktopGestureAnchorRelative = null;
    clearTimeout(mobileSettleTimer);
    mobileSettleTimer = 0;
    root.classList.add('fx-seamless-loop-transfer');
    root.dataset.fxInfiniteInput = 'visual-transfer';
    root.dataset.fxLoopLandingState = 'stabilising';
    loopCount += 1;
    root.dataset.fxLoopCount = String(loopCount);
    root.dataset.fxLoopSource = source;

    dispatchEvent(new CustomEvent('formatx:loop', {
      detail: { count: loopCount, source, relative, sourceTop:sourceTopOverride }
    }));
    finishLanding(relative,sourceTopOverride);
    return true;
  }

  function commitMobileTransfer() {
    mobileSettleTimer = 0;
    if (touchActive) return;
    const guardRemaining = transferLockedUntil - Date.now();
    if (guardRemaining > 0) {
      mobileSettleTimer = window.setTimeout(commitMobileTransfer, guardRemaining + 20);
      root.dataset.fxLoopGuardRetryR1711 = 'mobile-retry-armed';
      return;
    }

    // r306: r305 intentionally removes large mobile placeholder heights. Any
    // late content/font/layout settling can therefore move the loop bridge after
    // the scroll hot path cached its position. Re-sample only at the idle/end
    // boundary, never on an active scroll frame, then decide from live geometry.
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
    if (isMobileFlow()) return;
    if(root.classList.contains('fx-section-navigation-active')){
      pendingDesktopRelative=null;
      pendingDesktopSourceTop=null;
      desktopGestureAnchorY=null;
      desktopGestureAnchorRelative=null;
      root.dataset.fxLoopLandingState='section-navigation';
      return;
    }
    const guardRemaining = transferLockedUntil - Date.now();
    if (guardRemaining > 0) {
      clearTimeout(desktopGuardRetryTimer);
      desktopGuardRetryTimer = window.setTimeout(() => {
        desktopGuardRetryTimer = 0;
        commitDesktopTransfer();
      }, guardRemaining + 20);
      root.dataset.fxLoopGuardRetryR1711 = 'desktop-retry-armed';
      return;
    }
    /* R1715: desktop now mirrors the mobile idle contract. Re-measure only
       after scrolling has settled so late CSS/fonts/hero geometry cannot leave
       the cached bridge threshold stale, while the scroll hot path stays read-free. */
    const cachedRelative=Number.isFinite(pendingDesktopRelative)?pendingDesktopRelative:null;
    refreshGeometry();
    /* R1727 — preserve the gesture-relative coordinate captured while the
       user actually crossed the bridge. Late font/intro/layout settling may move
       bridgeTop before the 170 ms idle commit; re-deriving the relative position
       at that point changes the user's landing by the same layout delta. Fresh
       geometry is used only to clamp the cached gesture intent. */
    const freshRelative=bridgeRelative();
    const hasGestureSnapshot=Number.isFinite(desktopGestureAnchorY);
    let relative=hasGestureSnapshot
      ? (cachedRelative!=null
          ? Math.max(0,Math.min(cachedRelative,Math.max(0,loopGeometry.sourceHeight-2)))
          : null)
      : freshRelative;
    if(hasGestureSnapshot && cachedRelative!=null){
      root.dataset.fxLoopDesktopRecoveryR1724='gesture-snapshot-inside-authoritative';
    }else if(hasGestureSnapshot){
      root.dataset.fxLoopDesktopRecoveryR1724='gesture-snapshot-outside-authoritative';
    }else if(freshRelative!=null){
      root.dataset.fxLoopDesktopRecoveryR1724='fresh-idle-relative-fallback';
    }else{
      root.dataset.fxLoopDesktopRecoveryR1724='no-boundary';
    }
    root.dataset.fxLoopDesktopGeometryR1715 = loopGeometry.ready ? 'fresh-idle-sample' : 'unavailable';
    root.dataset.fxLoopDesktopRecoveryR1723 = 'fresh-idle-relative-with-cached-end-fallback';
    if (relative == null) {
      pendingDesktopRelative = null;
      desktopGestureAnchorY = null;
      desktopGestureAnchorRelative = null;
      root.dataset.fxLoopLandingState = 'native-desktop';
      return;
    }
    pendingDesktopRelative = relative;
    /* R1725 — the bridge-relative coordinate remains authoritative, but the
       destination hero origin must come from the fresh idle geometry. A cached
       sourceTop can belong to pre-font/pre-layout geometry and creates a visible
       vertical jump on the next cycle. */
    /* R1725c — the reference mirror contains the hero scene itself, not the
       document chrome preceding #main-content. Its local y=0 therefore maps to
       window scroll y=0. Adding offsetParent/document chrome here duplicates
       the top offset and creates the exact visible 225px jump caught by CI. */
    const heroLoopOrigin=0;
    root.dataset.fxLoopDesktopSourceTopR1724='0';
    root.dataset.fxLoopDesktopLandingR1725='cached-relative-hero-local-origin';
    root.dataset.fxLoopDesktopLandingR1727='gesture-relative-preserved-through-idle-layout-shift';
    performTransfer(relative,'visual-bridge-desktop-idle-r1727',heroLoopOrigin);
  }

  function transferIfNeeded() {
    scrollFrame = 0;
    if(root.classList.contains('fx-section-navigation-active')){
      pendingDesktopRelative=null;
      pendingDesktopSourceTop=null;
      desktopGestureAnchorY=null;
      desktopGestureAnchorRelative=null;
      pendingMobileRelative=null;
      root.dataset.fxLoopLandingState='section-navigation';
      return;
    }

    const startingDesktopGesture=!isMobileFlow() && root.dataset.fxScrollActivity!=='scrolling';
    // Normal frames stay cache-only. At the first desktop scroll frame we allow
    // one live bridge read so late font/Guardian/layout shifts cannot poison the
    // entire gesture with an obsolete bridgeTop. This is a single read per
    // gesture, not a per-frame layout query.
    let relative = (!isMobileFlow() && Number.isFinite(desktopGestureAnchorY))
      ? (Number.isFinite(pendingDesktopRelative) ? pendingDesktopRelative : null)
      : bridgeRelative();
    const cachedGeometry=loopGeometry;
    if(startingDesktopGesture && relative==null && !Number.isFinite(desktopGestureAnchorY) && bridge?.isConnected){
      const liveRect=bridge.getBoundingClientRect();
      const liveBridgeTop=scrollY+liveRect.top;
      const liveRelative=scrollY-liveBridgeTop;
      const liveSourceHeight=Math.max(0,cachedGeometry.sourceHeight||sourceHero?.offsetHeight||0);
      if(liveRelative>=-2){
        relative=Math.max(0,Math.min(liveRelative,Math.max(0,liveSourceHeight-2)));
        root.dataset.fxLoopGestureGeometryR1725='live-first-frame-fallback-only';
        root.dataset.fxLoopGestureRelativeR1725=String(Math.round(relative));
      }
    }
    if(startingDesktopGesture && relative!=null){
      root.dataset.fxLoopGestureGeometryR1727='cached-boundary-relative-authoritative';
      root.dataset.fxLoopGestureRelativeR1727=String(Math.round(relative));
    }
    /* R1724 — preserve the user's boundary intent across late layout reflow.
       If the scroll reached the cached document end, latch the corresponding
       bridge-relative position so an image/font/Guardian reflow cannot cancel
       the already-entered seamless-loop gesture before idle commit. */
    const cachedEndIntent=cachedGeometry.ready
      && scrollY>=Math.max(0,cachedGeometry.documentEnd-4);
    if(relative==null&&cachedEndIntent){
      relative=Math.max(0,Math.min(
        scrollY-cachedGeometry.bridgeTop,
        Math.max(0,cachedGeometry.sourceHeight-2)
      ));
      root.dataset.fxLoopEndIntentR1724='latched-cached-end';
    }

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
    pendingDesktopSourceTop = cachedGeometry.sourceTop;
    root.dataset.fxInfiniteInput = 'native-wheel';
    root.dataset.fxLoopLandingState = 'waiting-wheel-idle';
  }

  function onScroll() {
    /* R1727 — capture desktop bridge entry synchronously once. Deferred CSS,
       fonts or intro teardown can move bridge.offsetTop before the rAF/idle
       phase. After this anchor is taken, continue the gesture using scroll
       deltas only, so there is no per-frame layout read. */
    if(!isMobileFlow()
      && !root.classList.contains('fx-seamless-loop-transfer')
      && !root.classList.contains('fx-section-navigation-active')
      && bridge?.isConnected){
      if(!Number.isFinite(desktopGestureAnchorY)){
        /* R1727b — the first scroll event must use the bridge position that is
           live in the same layout state as scrollY. A previously idle snapshot
           can be stale after font/deferred-style reflow and miss a programmatic
           or real fast boundary crossing. We still read it only once per gesture. */
        const liveEventBridgeTop=Number(bridge.offsetTop);
        const eventBridgeTop=Number.isFinite(liveEventBridgeTop)
          ? liveEventBridgeTop
          : stableDesktopBridgeTop;
        const eventSourceHeight=Math.max(0,stableDesktopSourceHeight||loopGeometry.sourceHeight||sourceHero?.offsetHeight||0);
        if(Number.isFinite(eventBridgeTop)){
          desktopGestureAnchorY=scrollY;
          desktopGestureAnchorRelative=scrollY-eventBridgeTop;
          const projected=desktopGestureAnchorRelative;
          pendingDesktopRelative=projected>=-2
            ? Math.max(0,Math.min(projected,Math.max(0,eventSourceHeight-2)))
            : null;
          root.dataset.fxLoopGestureGeometryR1727='single-live-bridge-snapshot-per-gesture';
          root.dataset.fxLoopGestureBridgeTopR1727=String(Math.round(eventBridgeTop));
          root.dataset.fxLoopGestureRelativeR1727=String(Math.round(projected));
        }
      }else{
        const eventSourceHeight=Math.max(0,stableDesktopSourceHeight||loopGeometry.sourceHeight||sourceHero?.offsetHeight||0);
        const projected=desktopGestureAnchorRelative+(scrollY-desktopGestureAnchorY);
        pendingDesktopRelative=projected>=-2
          ? Math.max(0,Math.min(projected,Math.max(0,eventSourceHeight-2)))
          : null;
        root.dataset.fxLoopGestureRelativeR1727=String(Math.round(projected));
      }
    }
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
    scheduleMirrorCapture(180);
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
    if (touchActive) return;
    if (isMobileFlow()) {
      clearTimeout(mobileSettleTimer);
      mobileSettleTimer = window.setTimeout(commitMobileTransfer, 0);
      return;
    }

    /* R1724 — desktop browsers expose scrollend as the strongest signal that
       the native scroll gesture has really settled. Re-sample geometry here,
       outside the scroll hot path, preserve any cached bridge-relative intent,
       then commit immediately. The existing ACTIVITY_IDLE_MS timer remains the
       compatibility fallback for browsers without scrollend. */
    clearTimeout(activityTimer);
    activityTimer = 0;
    root.dataset.fxScrollActivity = 'idle';
    root.classList.remove('fx-page-scrolling');
    const cachedRelative=Number.isFinite(pendingDesktopRelative)?pendingDesktopRelative:null;
    const hasGestureSnapshot=Number.isFinite(desktopGestureAnchorY);
    if(cachedRelative==null){
      refreshGeometry();
      const liveRelative=bridgeRelative();
      const reachedDocumentEnd=loopGeometry.ready
        && scrollY>=Math.max(0,loopGeometry.documentEnd-4);
      if(liveRelative!=null){
        pendingDesktopRelative=liveRelative;
        root.dataset.fxLoopDesktopScrollEndRecoveryR1724=hasGestureSnapshot
          ? 'fresh-relative-after-outside-snapshot'
          : 'fresh-relative-no-snapshot';
      }else if(reachedDocumentEnd){
        /* R1727c — bridgeTop may sit below the final reachable scroll
           coordinate. Reaching the physical document end is still explicit
           loop intent. Map that unreachable bridge segment to local relative
           zero instead of leaving the gesture permanently uncommitted. */
        pendingDesktopRelative=0;
        root.dataset.fxLoopDesktopScrollEndRecoveryR1724=hasGestureSnapshot
          ? 'document-end-zero-after-outside-snapshot'
          : 'document-end-zero-no-snapshot';
      }else{
        root.dataset.fxLoopDesktopScrollEndRecoveryR1724=hasGestureSnapshot
          ? 'gesture-snapshot-outside-no-boundary'
          : 'no-live-boundary';
      }
    }else{
      root.dataset.fxLoopDesktopScrollEndRecoveryR1724='cached-relative-preserved';
    }
    root.dataset.fxLoopDesktopScrollEndR1724=Number.isFinite(pendingDesktopRelative)?'boundary-commit':'no-boundary';
    commitDesktopTransfer();
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
      clonedHeroOnly: false,
      inertReferenceMirror: true,
      mirrorContext: 'static-2d-snapshot-no-webgl',
      reinitialisedRenderer: false,
      frameStableLanding: true,
      jumpFree: true,
      sectionSnapDisabled: true,
      geometryCachedOutsideScroll: true,
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
    onScroll();

    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleGeometryRefresh).catch(() => {});
    }
    // One late snapshot is enough. 4.6 s stays outside the startup/scroll hot path.
    scheduleMirrorCapture(4600);
    root.dataset.fxLoopMirrorSchedulerR1679='single-post-startup-scroll-safe-capture';
    root.dataset.fxLoopRuntimeR1715='idle-fresh-geometry-guard-retry-two-cycle-safe';
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('scrollend', onScrollEnd, { passive: true });
  addEventListener('resize', onResize, { passive: true });
  addEventListener('load', scheduleGeometryRefresh, { once: true, passive: true });
  addEventListener('formatx:loopgeometryrefresh',event=>{
    const hadDesktopIntent=!isMobileFlow()&&Number.isFinite(pendingDesktopRelative);
    refreshGeometry();
    if(hadDesktopIntent){
      const corrected=bridgeRelative();
      if(corrected!=null){
        pendingDesktopRelative=corrected;
        root.dataset.fxLoopPendingCorrectionR1724='fresh-geometry-relative';
      }else{
        root.dataset.fxLoopPendingCorrectionR1724='preserved-cached-intent';
      }
    }
    root.dataset.fxLoopGeometryEventR1724=String(event.detail?.source||'external-refresh');
  },{passive:true});
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
  addEventListener('formatx:coredetailready', () => scheduleMirrorCapture(80));
  addEventListener('formatx:real3dready', () => scheduleMirrorCapture(220));
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
    clearTimeout(desktopGuardRetryTimer);
    clearTimeout(repairTimer);
    clearTimeout(mirrorCaptureTimer);
    geometryObserver?.disconnect();
  }, { once: true });
}());
