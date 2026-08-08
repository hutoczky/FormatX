(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'seamless-v6';
  const ACTIVITY_IDLE_MS = 170;
  let activityTimer = 0;
  let repairTimer = 0;

  if (root.dataset.fxInfiniteController === VERSION) return;

  root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
  root.dataset.fxInfiniteController = VERSION;
  root.dataset.fxInfiniteCloneMode = 'none';
  root.dataset.fxInfiniteInput = 'native';
  root.dataset.fxScrollActivity = 'idle';
  root.dataset.fxAutomaticLoop = 'disabled';
  root.dataset.fxScrollJumpGuard = 'native-position-v1';
  root.dataset.fxLoopBridge = 'disabled';
  root.dataset.fxScrollSnap = 'disabled';
  root.classList.add('fx-continuous-scroll-mode', 'fx-mobile-native-scroll');
  root.classList.remove(
    'fx-infinite-loop-jump',
    'fx-three-loop-transfer',
    'fx-precision-wheel',
    'fx-seamless-loop-transfer'
  );

  function ensureStyle() {
    if (document.querySelector('link[data-fx-seamless-loop-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/formatx-seamless-loop.css?v=20260808-mobile-native-v7';
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
    document.querySelectorAll('.fx-loop-bridge,[data-fx-loop-clone="true"]').forEach(element => element.remove());
    root.classList.remove('fx-seamless-loop-transfer', 'fx-infinite-loop-jump', 'fx-three-loop-transfer');
    root.dataset.fxLoopBridge = 'disabled';
  }

  function repairReleasePanel() {
    removeLegacyLoopArtifacts();
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

  function markIdle() {
    clearTimeout(activityTimer);
    activityTimer = 0;
    root.dataset.fxScrollActivity = 'idle';
    root.classList.remove('fx-page-scrolling');
  }

  function onScroll() {
    root.dataset.fxScrollActivity = 'scrolling';
    root.classList.add('fx-page-scrolling');
    clearTimeout(activityTimer);
    activityTimer = window.setTimeout(markIdle, ACTIVITY_IDLE_MS);
  }

  function scheduleRepair() {
    clearTimeout(repairTimer);
    repairTimer = window.setTimeout(repairReleasePanel, 60);
  }

  function onPanelOpen(event) {
    if (event.detail?.id !== 'resources') return;
    const panel = document.querySelector('[data-organism-panel="resources"]');
    if (panel) syncReleaseHub(panel);
  }

  function initialise() {
    ensureStyle();
    repairReleasePanel();
    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: VERSION,
      automaticLoop: false,
      visualBridge: false,
      clonedContent: false,
      clonedHeroOnly: false,
      reinitialisedRenderer: false,
      frameStableLanding: false,
      jumpFree: true,
      nativePositionOnly: true,
      mobileNativeMomentumPreserved: true,
      sectionSnapDisabled: true
    });
    root.dataset.fxInfiniteScroll = 'ready-' + VERSION;
    root.dataset.fxInfiniteController = VERSION;
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', scheduleRepair, { passive: true });
  addEventListener('pageshow', scheduleRepair, { passive: true });
  addEventListener('formatx:organisminterfaceready', scheduleRepair);
  addEventListener('formatx:organismpanelopen', onPanelOpen);
  addEventListener('formatx:organismpanelclose', scheduleRepair);
  addEventListener('formatx:languagechange', () => {
    const footer = document.querySelector('.site-footer');
    if (footer) repairFooterCopy(footer);
    const panel = document.querySelector('[data-organism-panel="resources"]');
    if (panel) syncReleaseHub(panel);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();

  addEventListener('pagehide', () => {
    clearTimeout(activityTimer);
    clearTimeout(repairTimer);
  }, { once: true });
}());
