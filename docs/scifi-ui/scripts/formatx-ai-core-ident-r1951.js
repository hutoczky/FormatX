(() => {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxAiCoreIdentityR1951) return;
  ROOT.dataset.fxAiCoreIdentityR1951 = 'armed';

  const PARAMS = new URLSearchParams(location.search);
  const LIGHTHOUSE = PARAMS.get('lighthouse') === '1' || /Chrome-Lighthouse/i.test(navigator.userAgent || '');
  const AUTOMATION = navigator.webdriver === true || LIGHTHOUSE;
  // Explicit intro replay is the real user path even in browser screenshot
  // validation. Ordinary automated non-intro audits still never show the film.
  const EXPLICIT_INTRO = PARAMS.get('intro') === '1' || PARAMS.get('visualintro') === '1';
  // A manually requested fixed-frame storyboard is a still photo, not the
  // chronological 10-second playback. Hold its already-faded-in telemetry
  // for deterministic real-GPU screenshots; never change ordinary visitors.
  const FIXED_STILL = EXPLICIT_INTRO && PARAMS.has('introframe');
  const MOBILE = matchMedia('(max-width:900px),(max-aspect-ratio:27/25)').matches;
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

  function showIdentity(source = 'magbirthcomplete', position = null) {
    if (shown || (AUTOMATION && !EXPLICIT_INTRO) || document.hidden) return;
    shown = true;
    clearTimers();
    removeExisting();

    const badge = document.createElement('div');
    badge.className = 'fx-ai-core-ident-r1951';
    badge.setAttribute('aria-hidden', 'true');
    if (FIXED_STILL) badge.dataset.fxAiCoreStill = 'true';
    badge.dataset.fxAiCoreSource = source;
    badge.dataset.fxAiCoreShot = source === 'single-genesis-shot-r2072'
      ? 'inside-the-original-10s-film' : 'fallback-after-genesis';
    const stage = document.querySelector('#hero .fx-crystal-organism-r326-stage');
    const stageRect = stage?.getBoundingClientRect();
    const x = Number.isFinite(position?.x) ? position.x
      : stageRect ? stageRect.left + stageRect.width * .5 : innerWidth * .5;
    const y = Number.isFinite(position?.y) ? position.y
      : stageRect ? stageRect.top + stageRect.height * .5 : innerHeight * .45;
    badge.style.setProperty('--fx-ident-x',
      Math.max(110,Math.min(innerWidth-110,x)).toFixed(1)+'px');
    badge.style.setProperty('--fx-ident-y',
      Math.max(80,Math.min(innerHeight-100,y)).toFixed(1)+'px');

    const title = document.createElement('span');
    title.className = 'fx-ai-core-ident-r1951__title';
    title.textContent = 'MAG // AI CORE';

    const sub = document.createElement('span');
    sub.className = 'fx-ai-core-ident-r1951__sub';
    sub.textContent = 'ONLINE · LOCAL INTELLIGENCE';

    badge.append(title, sub);
    document.body.appendChild(badge);

    ROOT.dataset.fxAiCoreIdentityR1951 = MOBILE ? 'shown-mobile' : 'shown-desktop';
    ROOT.dataset.fxAiCoreIdentityR2072 = badge.dataset.fxAiCoreShot;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if(badge.isConnected)badge.classList.add('is-visible');
      });
    });

    const hold = FIXED_STILL ? 24000 : (REDUCED ? 600 : (MOBILE ? 1100 : 1200));
    exitTimer = window.setTimeout(() => {
      badge.classList.remove('is-visible');
      badge.classList.add('is-exiting');
      ROOT.dataset.fxAiCoreIdentityR1951 = MOBILE ? 'exiting-mobile' : 'exiting-desktop';
      removeTimer = window.setTimeout(() => {
        badge.remove();
        ROOT.dataset.fxAiCoreIdentityR1951 = MOBILE ? 'complete-mobile' : 'complete-desktop';
      }, REDUCED ? 120 : 600);
    }, hold);
  }

  // The identification is telemetry inside the same stabilized shot, not a
  // second HTML splash after the intro has finished. This shared signal is
  // emitted at ~8.05s by R533 with the actual MAG screen-space center.
  document.addEventListener('formatx:magbirthstabilized', event => {
    showIdentity(event.detail?.source || 'single-genesis-shot-r2072',event.detail);
  }, { once:true, passive:true });

  document.addEventListener('formatx:magbirthcomplete', event => {
    // R2079: the film is the SOLE owner of this identity. A slow GPU may
    // start the optical label after 8.05 s and its local timeout would
    // otherwise outlive the real 10 s film. The genuine native MAG must
    // never inherit a leftover or newly created boot title.
    clearTimers();
    removeExisting();
    const source=event.detail?.source||'magbirthcomplete';
    ROOT.dataset.fxAiCoreIdentityR2072=
      /skip|pagehide|reduced-motion/.test(source)
      ?'skipped-without-second-splash':'cleared-exactly-at-film-handoff';
    ROOT.dataset.fxAiCoreIdentityR1951=
      MOBILE?'complete-mobile':'complete-desktop';
  }, { once:true, passive:true });

  addEventListener('pagehide', () => {
    clearTimers();
    removeExisting();
  }, { once: true, passive: true });
})();
