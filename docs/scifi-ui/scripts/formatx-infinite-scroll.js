(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'seamless-v6';
  const LOOP_GUARD_MS = 420;
  const ACTIVITY_IDLE_MS = 170;
  let bridge = null;
  let sourceHero = null;
  let transferLockedUntil = 0;
  let scrollFrame = 0;
  let activityTimer = 0;
  let loopCount = Number(root.dataset.fxLoopCount || 0);
  let repairTimer = 0;
  let layoutWidth = innerWidth;

  if (root.dataset.fxInfiniteController === VERSION) return;

  root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
  root.dataset.fxInfiniteController = VERSION;
  root.dataset.fxInfiniteCloneMode = 'visual-bridge';
  root.dataset.fxInfiniteInput = 'native';
  root.dataset.fxScrollActivity = 'idle';
  root.dataset.fxAutomaticLoop = 'enabled';
  root.dataset.fxScrollJumpGuard = 'visual-match-v2';
  root.classList.remove('fx-infinite-loop-jump', 'fx-three-loop-transfer', 'fx-precision-wheel');

  function ensureStyle() {
    if (document.querySelector('link[data-fx-seamless-loop-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/formatx-seamless-loop.css?v=20260806-seamless-v6';
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
    lead.dataset.hu = 'A gombok valódi FormatX útvonalakra mutatnak. A multiplatform csomag Bazzite/Linux elsődleges és Windows támogatott nyilvános béta.';
    lead.dataset.en = 'Buttons point to real FormatX routes. The multiplatform package is a public beta with Bazzite/Linux primary and Windows supported.';
    copy.append(kicker, title, lead);

    const badge = document.createElement('span');
    badge.className = 'fx-release-download-badge';
    badge.dataset.hu = 'NYILVÁNOS BÉTA';
    badge.dataset.en = 'PUBLIC BETA';
    head.append(copy, badge);

    const grid = document.createElement('div');
    grid.className = 'fx-release-download-grid';
    const download = actionLink('fx-release-download-card is-primary', '/scifi-ui/downloads/', 'Multiplatform béta', 'Multiplatform beta');
    download.dataset.fxReleaseAction = 'multiplatform';
    const android = actionLink('fx-release-download-card', '/download/android', 'Android APK', 'Android APK');
    const release = actionLink('fx-release-download-card', 'https://github.com/hutoczky/FormatX-Updates/releases', 'Kiadási részletek', 'Release details', true);
    release.dataset.fxReleaseAction = 'release';
    const support = actionLink('fx-release-download-card', '/scifi-ui/support.html', 'Támogatás', 'Support');
    grid.append(download, android, release, support);

    const note = document.createElement('p');
    note.className = 'fx-release-download-note';
    note.dataset.hu = 'A letöltési oldal mindig jelzi a platform állapotát, a kiadás érettségét és az ellenőrizhető kiadási információkat.';
    note.dataset.en = 'The downloads page always shows platform status, release maturity and verifiable release information.';

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
      panel.dataset.fxReleasePanel = 'stable-v2';
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

  function removeBridge() {
    bridge?.remove();
    bridge = null;
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
    root.dataset.fxLoopBridge = 'ready-v2';
    return true;
  }

  function documentEnd() {
    return Math.max(0, document.documentElement.scrollHeight - innerHeight);
  }

  function markIdle() {
    clearTimeout(activityTimer);
    activityTimer = 0;
    root.dataset.fxScrollActivity = 'idle';
    root.classList.remove('fx-page-scrolling');
  }

  function transferIfNeeded() {
    scrollFrame = 0;
    root.dataset.fxScrollActivity = 'scrolling';
    root.classList.add('fx-page-scrolling');
    clearTimeout(activityTimer);
    activityTimer = window.setTimeout(markIdle, ACTIVITY_IDLE_MS);

    if (!bridge || !sourceHero || Date.now() < transferLockedUntil) return;
    if (document.body.classList.contains('fx-organism-panel-open')) return;
    if (root.classList.contains('fx-organism-menu-open') || root.classList.contains('fx-intro-running')) return;

    const bridgeTop = bridge.offsetTop;
    const threshold = bridgeTop + Math.max(36, Math.min(innerHeight * .18, 180));
    if (scrollY < threshold || scrollY > documentEnd() + 2) return;

    const relative = Math.max(0, Math.min(scrollY - bridgeTop, Math.max(0, sourceHero.offsetHeight - 2)));
    const target = sourceHero.offsetTop + relative;
    transferLockedUntil = Date.now() + LOOP_GUARD_MS;
    root.classList.add('fx-seamless-loop-transfer');
    root.dataset.fxInfiniteInput = 'visual-transfer';
    loopCount += 1;
    root.dataset.fxLoopCount = String(loopCount);
    root.dataset.fxLoopSource = 'visual-bridge';
    window.scrollTo(0, target);
    dispatchEvent(new CustomEvent('formatx:loop', {
      detail: { count: loopCount, source: 'visual-bridge', relative }
    }));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove('fx-seamless-loop-transfer');
      root.dataset.fxInfiniteInput = 'native';
    }));
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
    }, 60);
  }

  function onResize() {
    const nextWidth = innerWidth;
    const widthChanged = Math.abs(nextWidth - layoutWidth) > 8;
    if (widthChanged) layoutWidth = nextWidth;
    scheduleRepair(widthChanged);
  }

  function onPanelOpen(event) {
    if (event.detail?.id !== 'resources') return;
    const panel = document.querySelector('[data-organism-panel="resources"]');
    if (panel) {
      syncReleaseHub(panel);
      panel.scrollTop = 0;
    }
  }

  function initialise() {
    ensureStyle();
    repairReleasePanel();
    buildBridge();
    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: VERSION,
      automaticLoop: true,
      visualBridge: true,
      clonedContent: false,
      clonedHeroOnly: true,
      reinitialisedRenderer: false,
      jumpFree: true
    });
    root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
    root.dataset.fxInfiniteController = VERSION;
    onScroll();
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize, { passive: true });
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
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();

  addEventListener('pagehide', () => {
    cancelAnimationFrame(scrollFrame);
    clearTimeout(activityTimer);
    clearTimeout(repairTimer);
  }, { once: true });
}());
