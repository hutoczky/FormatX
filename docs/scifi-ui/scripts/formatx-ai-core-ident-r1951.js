(() => {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxAiCoreIdentityR1951) return;
  ROOT.dataset.fxAiCoreIdentityR1951 = 'armed';

  const MOBILE = matchMedia('(max-width:900px),(max-aspect-ratio:27/25)').matches;
  const REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let shown = false;
  let introFinished = false;
  let departed = false;
  let entryFrame = 0;
  let entryTimer = 0;
  let exitTimer = 0;
  let removeTimer = 0;

  function clearTimers() {
    if (entryFrame) cancelAnimationFrame(entryFrame);
    if (entryTimer) clearTimeout(entryTimer);
    if (exitTimer) clearTimeout(exitTimer);
    if (removeTimer) clearTimeout(removeTimer);
    exitTimer = 0;
    removeTimer = 0;
    entryFrame = 0;
    entryTimer = 0;
  }

  function removeExisting() {
    document.querySelectorAll('.fx-ai-core-ident-r1951').forEach(node => node.remove());
  }

  function showIdentity(source = 'magbirthcomplete') {
    if (shown || departed || !introFinished || document.hidden) return;
    const stage = window.FormatXLivingCore?.stage;
    if (ROOT.dataset.fxCrystalOrganismR326 !== 'ready'
      || !(stage instanceof HTMLElement) || !stage.isConnected) return;
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
    stage.appendChild(badge);

    ROOT.dataset.fxAiCoreIdentityR1951 = MOBILE ? 'shown-mobile' : 'shown-desktop';

    let entered = false;
    function enterIdentity() {
      if (entered || departed || !badge.isConnected || document.hidden) return;
      entered = true;
      if (entryFrame) cancelAnimationFrame(entryFrame);
      if (entryTimer) clearTimeout(entryTimer);
      entryFrame = entryTimer = 0;
      // Resolve the authored entry style before applying its destination.
      // This also starts the real CSS transition when display callbacks stall.
      void getComputedStyle(badge).opacity;
      badge.classList.add('is-visible');

      // Hold starts only after entry is applied, for either presentation route.
      const hold = REDUCED ? 800 : (MOBILE ? 1250 : 1500);
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
    // Prefer the existing two presentation callbacks, with a real task-based
    // entry route so delayed display callbacks cannot strand an invisible node.
    entryTimer = window.setTimeout(enterIdentity, 120);
    entryFrame = requestAnimationFrame(() => {
      entryFrame = requestAnimationFrame(enterIdentity);
    });
  }

  document.addEventListener('formatx:magbirthcomplete', event => {
    introFinished = true;
    showIdentity(event.detail?.source || 'magbirthcomplete');
  }, { once: true, passive: true });
  addEventListener('formatx:real3dready', () => {
    showIdentity('native-ready-after-intro');
  }, { passive: true });

  addEventListener('pagehide', () => {
    departed = true;
    clearTimers();
    removeExisting();
  }, { once: true, passive: true });
})();
