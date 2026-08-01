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
          ? 'The official public beta is one multiplatform package. Bazzite/Linux is the primary system, while Windows is supported in the same package. Android remains a separate public beta channel.'
          : 'A hivatalos nyilvános béta egyetlen multiplatform csomag. A Bazzite/Linux az elsődleges rendszer, a Windows ugyanebben a csomagban támogatott. Az Android külön nyilvános béta csatorna.';
      }
      if (product) {
        product.textContent = english
          ? 'Technician Operating Layer'
          : 'Technikusi operációs réteg';
      }
      if (note) {
        note.innerHTML = english
          ? 'Package URLs and integrity data come from official release metadata. <a href="/scifi-ui/test-matrix.html">Open public test matrix</a>'
          : 'A csomag-URL és az integritási adatok a hivatalos kiadási metaadatból érkeznek. <a href="/scifi-ui/test-matrix.html">Nyilvános tesztmátrix</a>';
      }
    });

    const checkoutState = document.querySelector('.fx-checkout-product-state div');
    if (checkoutState) {
      checkoutState.innerHTML = language() === 'en'
        ? '<strong>The licensed application is a multiplatform public beta, not Stable.</strong><span>Bazzite/Linux is primary and Windows is supported in the same package.</span>'
        : '<strong>A licencelt alkalmazás multiplatform nyilvános béta, nem Stable.</strong><span>A Bazzite/Linux az elsődleges, a Windows ugyanabban a csomagban támogatott.</span>';
    }

    ROOT.dataset.fxPlatformSurfaceFinalizer = 'ready-v2';
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
