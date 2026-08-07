(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLanguageCopyStability === 'ready-v4') return;
  root.dataset.fxLanguageCopyStability = 'loading-v4';

  const COPY = Object.freeze({
    hu: {
      nav: ['Működés', 'Modulok', 'Licenc és árak', 'Biztonság', 'Letöltés'],
      trial: 'napos próbalicenc',
      download: 'Teljes multiplatform verzió letöltése',
      releaseName: 'Teljes multiplatform verzió'
    },
    en: {
      nav: ['Workflow', 'Modules', 'Licence & pricing', 'Safety', 'Downloads'],
      trial: 'day trial licence',
      download: 'Download full multiplatform version',
      releaseName: 'Full multiplatform version'
    }
  });

  let scheduled = 0;
  let rendering = false;

  function ensureGuard() {
    if (document.querySelector('script[data-fx-full-release-guard]')) return;
    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/formatx-full-release-guard.js?v=20260807-full-release-guard-v2';
    script.defer = true;
    script.dataset.fxFullReleaseGuard = 'true';
    document.head.appendChild(script);
  }

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function setText(element, hu, en) {
    if (!(element instanceof Element)) return;
    element.dataset.hu = hu;
    element.dataset.en = en;
    const expected = language() === 'en' ? en : hu;
    if (element.textContent !== expected) element.textContent = expected;
  }

  function render() {
    scheduled = 0;
    if (rendering) return;
    rendering = true;
    try {
      const hu = COPY.hu;
      const en = COPY.en;
      const links = Array.from(document.querySelectorAll('#main-nav a'));
      links.forEach((link, index) => {
        if (hu.nav[index] && en.nav[index]) setText(link, hu.nav[index], en.nav[index]);
      });

      const trial = document.querySelector('.hero-facts > span:nth-child(3) small');
      setText(trial, hu.trial, en.trial);

      const download = document.querySelector('#hero-download [data-release-download-label], #hero-download span');
      setText(download, hu.download, en.download);
      const downloadLink = document.getElementById('hero-download');
      if (downloadLink) {
        downloadLink.dataset.releaseDownload = 'multiplatform';
        downloadLink.dataset.releaseChannel = 'multiplatform';
      }

      const releaseName = document.getElementById('release-name');
      setText(releaseName, hu.releaseName, en.releaseName);

      const telemetryValue = document.querySelector('#hero .hero-label.b span, #hero .hero-label[data-release-telemetry] span');
      if (telemetryValue && telemetryValue.textContent !== 'FULL') telemetryValue.textContent = 'FULL';
      const telemetryLabel = document.querySelector('#hero .hero-label.b b, #hero .hero-label[data-release-telemetry] b');
      if (telemetryLabel && telemetryLabel.textContent !== 'PUBLIC RELEASE') telemetryLabel.textContent = 'PUBLIC RELEASE';

      root.dataset.fxLanguageCopy = language();
      root.dataset.fxLanguageCopyStability = 'ready-v4';
    } finally {
      rendering = false;
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = requestAnimationFrame(render);
  }

  addEventListener('formatx:languagechange', schedule);
  addEventListener('formatx:releasemetadataready', schedule);
  addEventListener('formatx:platformstatusready', schedule);
  addEventListener('pageshow', schedule);

  const languageObserver = new MutationObserver(schedule);
  languageObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });

  const copyObserver = new MutationObserver(schedule);
  [
    document.getElementById('main-nav'),
    document.querySelector('.hero-facts > span:nth-child(3) small'),
    document.getElementById('hero-download'),
    document.getElementById('release-name'),
    document.querySelector('#hero .hero-label.b'),
    document.querySelector('#hero .hero-label[data-release-telemetry]')
  ].filter(Boolean).forEach(node => {
    copyObserver.observe(node, { subtree: true, childList: true, characterData: true });
  });

  ensureGuard();
  render();
  setTimeout(render, 0);
  setTimeout(render, 250);
  setTimeout(render, 1200);
}());