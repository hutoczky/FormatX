(() => {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxAiCoreIdentityR1951) return;
  ROOT.dataset.fxAiCoreIdentityR1951 = 'armed';
  ROOT.dataset.fxAiCoreIdentityR1957 = 'boot-telemetry-fixed-system-label-1350ms';

  const PARAMS = new URLSearchParams(location.search);
  const LIGHTHOUSE = PARAMS.get('lighthouse') === '1' || /Chrome-Lighthouse/i.test(navigator.userAgent || '');
  const AUTOMATION = navigator.webdriver === true || LIGHTHOUSE;
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
  const REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let shown = false;
  let exitTimer = 0;
  let removeTimer = 0;

  function clearTimers() {
    if (exitTimer) clearTimeout(exitTimer);
    if (removeTimer) clearTimeout(removeTimer);
    exitTimer = 0;
    removeTimer = 0;
  }

  function removeExisting() {
    document.querySelectorAll('.fx-ai-core-ident-r1951').forEach(node => node.remove());
  }

  function showIdentity(source = 'magbirthcomplete') {
    if (shown || AUTOMATION || document.hidden) return;
    shown = true;
    clearTimers();
    removeExisting();

    const badge = document.createElement('div');
    badge.className = 'fx-ai-core-ident-r1951';
    badge.setAttribute('aria-hidden', 'true');
    badge.dataset.fxAiCoreSource = source;

    const title = document.createElement('span');
    title.className = 'fx-ai-core-ident-r1951__title';
    title.textContent = 'MAG // AI CORE';

    const sub = document.createElement('span');
    sub.className = 'fx-ai-core-ident-r1951__sub';
    sub.textContent = 'ONLINE · LOCAL INTELLIGENCE';

    badge.append(title, sub);
    document.body.appendChild(badge);

    ROOT.dataset.fxAiCoreIdentityR1951 = MOBILE ? 'shown-mobile' : 'shown-desktop';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => badge.classList.add('is-visible'));
    });

    const hold = REDUCED ? 720 : 1350;
    exitTimer = window.setTimeout(() => {
      badge.classList.remove('is-visible');
      badge.classList.add('is-exiting');
      ROOT.dataset.fxAiCoreIdentityR1951 = MOBILE ? 'exiting-mobile' : 'exiting-desktop';
      removeTimer = window.setTimeout(() => {
        badge.remove();
        ROOT.dataset.fxAiCoreIdentityR1951 = MOBILE ? 'complete-mobile' : 'complete-desktop';
      }, REDUCED ? 120 : 680);
    }, hold);
  }

  document.addEventListener('formatx:magbirthcomplete', event => {
    showIdentity(event.detail?.source || 'magbirthcomplete');
  }, { once: true, passive: true });

  addEventListener('pagehide', () => {
    clearTimers();
    removeExisting();
  }, { once: true, passive: true });
})();
