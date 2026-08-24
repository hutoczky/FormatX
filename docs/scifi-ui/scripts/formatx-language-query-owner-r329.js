(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLanguageQueryOwnerR329 === 'ready') return;
  root.dataset.fxLanguageQueryOwnerR329 = 'booting';

  const supported = new Set(['hu', 'en']);
  let queued = false;
  let correcting = false;

  function selectedLanguage() {
    const value = new URLSearchParams(location.search).get('lang');
    return supported.has(value) ? value : null;
  }

  function enforce(source) {
    queued = false;
    const language = selectedLanguage();
    if (!language) {
      root.dataset.fxLanguageQueryOwnerR329 = 'passive-no-query';
      return;
    }
    if (root.lang === language) {
      root.dataset.fxLanguageQueryOwnerR329 = 'ready';
      return;
    }

    correcting = true;
    root.lang = language;
    root.dataset.fxLanguageQueryOwnerR329 = 'ready';
    root.dataset.fxLanguageQueryCorrectionR329 = source || 'runtime';
    queueMicrotask(() => {
      dispatchEvent(new CustomEvent('formatx:languagechange', {
        detail: { language, source: 'query-owner-r329' }
      }));
      correcting = false;
    });
  }

  function schedule(source) {
    if (queued || correcting) return;
    queued = true;
    queueMicrotask(() => enforce(source));
  }

  const observer = new MutationObserver(() => schedule('root-lang-mutation'));
  observer.observe(root, { attributes: true, attributeFilter: ['lang'] });

  for (const eventName of [
    'pageshow',
    'formatx:organisminterfaceready',
    'formatx:immersiveactivate',
    'formatx:controlownerready'
  ]) {
    addEventListener(eventName, () => schedule(eventName), { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => enforce('dom-ready'), { once: true });
  } else {
    enforce('immediate');
  }

  for (const delay of [50, 250, 1000]) {
    setTimeout(() => enforce('bounded-late-pass'), delay);
  }
}());
