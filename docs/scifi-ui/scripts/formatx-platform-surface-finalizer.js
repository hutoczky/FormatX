(function () {
  'use strict';

  const ROOT = document.documentElement;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function apply() {
    const data = ROOT.__FORMATX_PLATFORM_STATUS__;
    if (!data) return;

    document.querySelectorAll('.fx-platform-status').forEach(section => {
      const eyebrow = section.querySelector('.section-index');
      const heading = section.querySelector('h2');
      const lead = section.querySelector('header p:not(.section-index)');
      const product = section.querySelector('.fx-product-release-state strong');
      const note = section.querySelector('.fx-platform-status-note');
      const english = language() === 'en';

      if (eyebrow) {
        eyebrow.textContent = english
          ? 'CANONICAL PLATFORM STATUS'
          : 'IRÁNYADÓ PLATFORMÁLLAPOT';
      }
      if (heading) {
        heading.textContent = english
          ? 'Bazzite/Linux is primary; Windows remains supported.'
          : 'A Bazzite/Linux az elsődleges; a Windows támogatott.';
      }
      if (lead) {
        lead.textContent = english
          ? 'The official FormatX package is a full multiplatform release. Bazzite/Linux is the primary system, Windows is supported in the same package, and Android is available as a full release through its verified endpoint. Use starts with a 5-day trial licence.'
          : 'A hivatalos FormatX csomag teljes multiplatform kiadás. A Bazzite/Linux az elsődleges rendszer, a Windows ugyanebben a csomagban támogatott, az Android pedig teljes verzióként érhető el a hitelesített végpontján. A használat 5 napos próbalicenccel indul.';
      }
      if (product) {
        product.textContent = english
          ? 'Full release · 5-day trial licence'
          : 'Teljes verzió · 5 napos próbalicenc';
      }
      if (note) {
        note.innerHTML = english
          ? 'Package URLs and integrity data come from official release metadata. The evidence-gated Stable designation is a separate verification level. <a href="/scifi-ui/test-matrix.html">Open public test matrix</a>'
          : 'A csomag-URL és az integritási adatok a hivatalos kiadási metaadatból érkeznek. A bizonyítékokhoz kötött Stable minősítés külön ellenőrzési szint. <a href="/scifi-ui/test-matrix.html">Nyilvános tesztmátrix</a>';
      }
    });

    const checkoutState = document.querySelector('.fx-checkout-product-state div');
    if (checkoutState) {
      checkoutState.innerHTML = language() === 'en'
        ? '<strong>The licensed application is the full multiplatform release.</strong><span>Bazzite/Linux is primary, Windows is supported in the same package, and first use starts with a 5-day trial licence. The Stable evidence label remains separate.</span>'
        : '<strong>A licencelt alkalmazás a teljes multiplatform kiadás.</strong><span>A Bazzite/Linux az elsődleges, a Windows ugyanabban a csomagban támogatott, az első használat pedig 5 napos próbalicenccel indul. A Stable bizonyítéki minősítés ettől különálló.</span>';
    }

    ROOT.dataset.fxPlatformSurfaceFinalizer = 'ready-v3';
  }

  ['formatx:platformstatusready', 'formatx:languagechange'].forEach(name => {
    addEventListener(name, apply);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(apply, 0), { once: true });
  } else {
    setTimeout(apply, 0);
  }
  setTimeout(apply, 1800);
}());