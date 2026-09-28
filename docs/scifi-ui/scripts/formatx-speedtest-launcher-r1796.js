(() => {
  'use strict';
  const ROOT = document.documentElement;
  const BUTTON_SELECTOR = '[data-fx-speedtest-launcher]';
  const MODULE_URL = '/scifi-ui/scripts/formatx-speedtest-r1796.js?v=20260928-r1796-edge-speedtest';
  let modulePromise = null;

  function load() {
    if (!modulePromise) {
      ROOT.dataset.fxSpeedtestLoaderR1796 = 'loading-on-user-intent';
      modulePromise = import(MODULE_URL).then(mod => {
        ROOT.dataset.fxSpeedtestLoaderR1796 = 'ready';
        return mod;
      }).catch(error => {
        ROOT.dataset.fxSpeedtestLoaderR1796 = 'error';
        modulePromise = null;
        throw error;
      });
    }
    return modulePromise;
  }

  addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest(BUTTON_SELECTOR) : null;
    if (!(button instanceof HTMLElement)) return;
    event.preventDefault();
    load().then(mod => mod.openSpeedTest?.()).catch(() => {
      const text = document.documentElement.lang === 'en'
        ? 'Speed test could not be loaded.'
        : 'A sebességteszt nem tölthető be.';
      alert(text);
    });
  }, { passive: false });

  ROOT.dataset.fxSpeedtestLauncherR1796 = 'armed-zero-measurement-idle';
})();