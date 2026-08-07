(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLanguageCopyStability === 'ready-v2') return;
  root.dataset.fxLanguageCopyStability = 'loading-v2';

  const COPY = Object.freeze({
    hu: {
      nav: ['Működés', 'Modulok', 'Licenc és árak', 'Biztonság', 'Letöltés'],
      trial: 'napos próbalicenc',
      download: 'Teljes multiplatform verzió letöltése'
    },
    en: {
      nav: ['Workflow', 'Modules', 'Licence & pricing', 'Safety', 'Downloads'],
      trial: 'day trial licence',
      download: 'Download full multiplatform version'
    }
  });

  let scheduled = 0;
  let rendering = false;

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

      root.dataset.fxLanguageCopy = language();
      root.dataset.fxLanguageCopyStability = 'ready-v2';
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
  addEventListener('pageshow', schedule);

  const languageObserver = new MutationObserver(schedule);
  languageObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });

  const copyObserver = new MutationObserver(schedule);
  const nav = document.getElementById('main-nav');
  if (nav) copyObserver.observe(nav, { subtree: true, childList: true, characterData: true });
  const trial = document.querySelector('.hero-facts > span:nth-child(3) small');
  if (trial) copyObserver.observe(trial, { subtree: true, childList: true, characterData: true });
  const download = document.getElementById('hero-download');
  if (download) copyObserver.observe(download, { subtree: true, childList: true, characterData: true });

  render();
  setTimeout(render, 0);
  setTimeout(render, 250);
  setTimeout(render, 1200);
}());