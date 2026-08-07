(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'seamless-v6';
  const REVISION = 'ratio-v4';
  const LOOP_GUARD_MS = 520;
  const ACTIVITY_IDLE_MS = 170;
  let bridge = null;
  let sourceHero = null;
  let transferLockedUntil = 0;
  let scrollFrame = 0;
  let landingFrame = 0;
  let activityTimer = 0;
  let repairTimer = 0;
  let loopCount = Number(root.dataset.fxLoopCount || 0);
  let layoutWidth = innerWidth;

  if (root.dataset.fxInfiniteController === VERSION) return;

  root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
  root.dataset.fxInfiniteController = VERSION;
  root.dataset.fxScrollAuthority = VERSION + '-' + REVISION;
  root.dataset.fxInfiniteCloneMode = 'hero-visual-bridge';
  root.dataset.fxInfiniteInput = 'native';
  root.dataset.fxScrollActivity = 'idle';
  root.dataset.fxAutomaticLoop = 'enabled';
  root.dataset.fxScrollJumpGuard = 'visual-ratio-v4';
  root.dataset.fxLoopBridge = 'building';
  root.classList.remove('fx-infinite-loop-jump', 'fx-three-loop-transfer', 'fx-precision-wheel');

  function ensureStyle() {
    let link = document.querySelector('link[data-fx-seamless-loop-style]');
    if (link) {
      const wanted = '/scifi-ui/styles/formatx-seamless-loop.css?v=20260808-seamless-ratio-v4';
      if (!link.href.includes('20260808-seamless-ratio-v4')) link.href = wanted;
      return;
    }
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/formatx-seamless-loop.css?v=20260808-seamless-ratio-v4';
    link.dataset.fxSeamlessLoopStyle = 'true';
    document.head.appendChild(link);
  }

  function language() { return root.lang === 'en' ? 'en' : 'hu'; }

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

  function removeLegacyLoopArtifacts() {
    document.querySelectorAll('.fx-loop-bridge,[data-fx-loop-clone="true"],[data-fx-loop-bridge="true"]').forEach(element => element.remove());
    root.classList.remove('fx-infinite-loop-jump', 'fx-three-loop-transfer');
  }

  function repairReleasePanel() {
    const main = document.getElementById('main-content');
    const footer = document.querySelector('.site-footer');
    const panel = document.querySelector('[data-organism-panel="resources"]');
    if (!main || !footer) return false;
    if (footer.closest('.fx-organism-panel') || footer.parentElement !== document.body) main.insertAdjacentElement('afterend', footer);
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
    clone.querySelectorAll('[id]').forEach((element, index) => { element.id = 'fx-loop-clone-' + index; });
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
    root.dataset.fxLoopBridge = 'ready-ratio-v4';
    return true;
  }

  function markIdle() {
    clearTimeout(activityTimer);
    activityTimer = 0;
    root.dataset.fxScrollActivity = 'idle';
    root.classList.remove('fx-page-scrolling');
  }

  function landingTarget(ratio) {
    sourceHero = document.querySelector('#main-content > #hero');
    if (!sourceHero) return null;
    const bounded = Math.max(0, Math.min(1, ratio));
    const relative = Math.min(Math.max(0, sourceHero.offsetHeight - 2), Math.round(sourceHero.offsetHeight * bounded));
    return sourceHero.offsetTop + relative;
  }

  function landAt(target) {
    if (!Number.isFinite(target)) return;
    window.scrollTo({ top: target, left: 0, behavior: 'auto' });
    root.dataset.fxLoopLanding = String(Math.round(target));
  }

  function settleLanding(target, detail) {
    cancelAnimationFrame(landingFrame);
    let frame = 0;
    const settle = () => {
      landAt(target);
      frame += 1;
      if (frame === 2) dispatchEvent(new CustomEvent('formatx:loop', { detail }));
      if (frame < 5) {
        landingFrame = requestAnimationFrame(settle);
        return;
      }
      root.classList.remove('fx-seamless-loop-transfer');
      root.dataset.fxInfiniteInput = 'native';
      root.dataset.fxLoopLandingState = 'settled';
      landingFrame = 0;
    };
    landingFrame = requestAnimationFrame(settle);
  }

  function transferIfNeeded() {
    scrollFrame = 0;
    root.dataset.fxScrollActivity = 'scrolling';
    root.classList.add('fx-page-scrolling');
    clearTimeout(activityTimer);
    activityTimer = window.setTimeout(markIdle, ACTIVITY_IDLE_MS);
    if (!bridge || !sourceHero || Date.now() < transferLockedUntil) return;
    if (document.hidden || document.body.classList.contains('fx-organism-panel-open')) return;
    if (root.classList.contains('fx-organism-menu-open') || root.classList.contains('fx-intro-running')) return;

    const bridgeTop = bridge.offsetTop;
    const bridgeHeight = Math.max(1, bridge.offsetHeight);
    const threshold = bridgeTop + Math.max(72, Math.min(innerHeight * .34, 360));
    if (scrollY < threshold) return;
    const ratio = Math.max(0, Math.min(1, (scrollY - bridgeTop) / bridgeHeight));
    const target = landingTarget(ratio);
    if (target == null) return;

    transferLockedUntil = Date.now() + LOOP_GUARD_MS;
    root.classList.add('fx-seamless-loop-transfer');
    root.dataset.fxInfiniteInput = 'visual-transfer';
    root.dataset.fxLoopLandingState = 'stabilising';
    loopCount += 1;
    root.dataset.fxLoopCount = String(loopCount);
    root.dataset.fxLoopSource = 'hero-visual-bridge';
    landAt(target);
    settleLanding(target, { count: loopCount, source: 'hero-visual-bridge', ratio, target, revision: REVISION });
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
    }, 80);
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
    if (panel) syncReleaseHub(panel);
  }

  function initialise() {
    ensureStyle();
    removeLegacyLoopArtifacts();
    repairReleasePanel();
    buildBridge();
    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: VERSION,
      revision: REVISION,
      automaticLoop: true,
      visualBridge: true,
      clonedContent: false,
      clonedHeroOnly: true,
      frameStableLanding: true,
      ratioMatchedLanding: true,
      inputInterception: false,
      jumpFree: true
    });
    root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
    root.dataset.fxInfiniteController = VERSION;
    root.dataset.fxScrollAuthority = VERSION + '-' + REVISION;
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
    cancelAnimationFrame(landingFrame);
    clearTimeout(activityTimer);
    clearTimeout(repairTimer);
  }, { once: true });
}());
