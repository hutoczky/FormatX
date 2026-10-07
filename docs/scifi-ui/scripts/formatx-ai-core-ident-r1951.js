(() => {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxAiCoreIdentityR1951) return;
  ROOT.dataset.fxAiCoreIdentityR1951 = 'armed';
  ROOT.dataset.fxAiCoreIdentityR1959 = 'stabilisation-telemetry-armed';

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

  function showIdentity(source = 'magbirthcomplete', detail = {}) {
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

    /* R1959 — pin the telemetry label to the actual MAG target. During the
       genesis film the renderer sends its current optical target; the fallback
       derives the permanent hero-space centre. */
    let x=Number(detail.x),y=Number(detail.y);
    if(!Number.isFinite(x)||!Number.isFinite(y)){
      const heroSpace=document.querySelector('#hero .hero-space');
      const rect=heroSpace?.getBoundingClientRect?.();
      if(rect){
        x=rect.left+rect.width*.5;
        y=rect.top+rect.height*.47;
      }else{
        x=innerWidth*.5;
        y=innerHeight*.48;
      }
    }
    badge.style.setProperty('--fx-ai-core-x',Math.round(x)+'px');
    badge.style.setProperty('--fx-ai-core-y',Math.round(y)+'px');
    document.body.appendChild(badge);

    ROOT.dataset.fxAiCoreIdentityR1951 = MOBILE ? 'shown-mobile' : 'shown-desktop';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => badge.classList.add('is-visible'));
    });

    const hold = REDUCED ? 760 : (MOBILE ? 1100 : 1280);
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

  document.addEventListener('formatx:magstabilized', event => {
    showIdentity(event.detail?.source || 'magstabilized', event.detail || {});
  }, { once: true, passive: true });

  /* Fallback for reduced-motion, skipped or renderer-fail paths. The shown
     guard ensures only one identity pass ever appears. */
  document.addEventListener('formatx:magbirthcomplete', event => {
    showIdentity(event.detail?.source || 'magbirthcomplete', event.detail || {});
  }, { once: true, passive: true });

  addEventListener('pagehide', () => {
    clearTimers();
    removeExisting();
  }, { once: true, passive: true });
})();
