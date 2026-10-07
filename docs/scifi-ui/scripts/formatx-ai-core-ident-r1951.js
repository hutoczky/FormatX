(() => {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxAiCoreIdentityR1955) return;
  ROOT.dataset.fxAiCoreIdentityR1955 = 'armed';

  const PARAMS = new URLSearchParams(location.search);
  const LIGHTHOUSE = PARAMS.get('lighthouse') === '1' || /Chrome-Lighthouse/i.test(navigator.userAgent || '');
  const AUTOMATION = navigator.webdriver === true || LIGHTHOUSE;
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
  const REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches;

  let shown = false;
  let stabilizeTimer = 0;
  let exitTimer = 0;
  let removeTimer = 0;

  function clearTimers() {
    if (stabilizeTimer) clearTimeout(stabilizeTimer);
    if (exitTimer) clearTimeout(exitTimer);
    if (removeTimer) clearTimeout(removeTimer);
    stabilizeTimer = 0;
    exitTimer = 0;
    removeTimer = 0;
  }

  function removeExisting() {
    document.querySelectorAll('.fx-ai-core-ident-r1951').forEach(node => node.remove());
  }

  function mountIdentity(source = 'magbirthcomplete') {
    if (shown || AUTOMATION || document.hidden) return;
    shown = true;
    clearTimers();
    removeExisting();

    const badge = document.createElement('div');
    badge.className = 'fx-ai-core-ident-r1951';
    badge.setAttribute('aria-hidden', 'true');
    badge.dataset.fxAiCoreSource = source;
    badge.dataset.fxAiCoreTelemetry = 'boot-verified';

    const title = document.createElement('span');
    title.className = 'fx-ai-core-ident-r1951__title';
    title.textContent = 'MAG // AI CORE';

    const sub = document.createElement('span');
    sub.className = 'fx-ai-core-ident-r1951__sub';
    sub.textContent = 'ONLINE · LOCAL INTELLIGENCE';

    badge.append(title, sub);
    document.body.appendChild(badge);

    ROOT.dataset.fxAiCoreIdentityR1955 = MOBILE ? 'mounted-mobile' : 'mounted-desktop';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        badge.classList.add('is-visible');
        ROOT.dataset.fxAiCoreIdentityR1955 = MOBILE ? 'visible-mobile' : 'visible-desktop';
      });
    });

    const hold = REDUCED ? 850 : (MOBILE ? 1220 : 1380);
    exitTimer = window.setTimeout(() => {
      badge.classList.remove('is-visible');
      badge.classList.add('is-exiting');
      ROOT.dataset.fxAiCoreIdentityR1955 = MOBILE ? 'exiting-mobile' : 'exiting-desktop';
      removeTimer = window.setTimeout(() => {
        badge.remove();
        ROOT.dataset.fxAiCoreIdentityR1955 = MOBILE ? 'complete-mobile' : 'complete-desktop';
      }, REDUCED ? 140 : 560);
    }, hold);
  }

  function scheduleIdentity(source) {
    if (shown || AUTOMATION || document.hidden) return;
    clearTimers();
    ROOT.dataset.fxAiCoreIdentityR1955 = MOBILE ? 'stabilizing-mobile' : 'stabilizing-desktop';
    stabilizeTimer = window.setTimeout(
      () => mountIdentity(source),
      REDUCED ? 80 : (MOBILE ? 180 : 230)
    );
  }

  document.addEventListener('formatx:magbirthcomplete', event => {
    scheduleIdentity(event.detail?.source || 'magbirthcomplete');
  }, { once: true, passive: true });

  addEventListener('pagehide', () => {
    clearTimers();
    removeExisting();
  }, { once: true, passive: true });
})();
