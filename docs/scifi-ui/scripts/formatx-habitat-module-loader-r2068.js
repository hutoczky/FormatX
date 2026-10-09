/* R2068: same actual habitat module, loaded at its first meaningful use.
 * Decorative Canvas2D is not inserted until actual intent in the original
 * module. This loader delays download, parse and backing-store allocation
 * without using user-agent, WebDriver or Lighthouse detection.
 * A short universal fallback ensures the full visual system still starts.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const url = '/scifi-ui/scripts/formatx-living-habitat-r1530.js?v=20261009-r2065-zero-flow-canvas';
  const EVENTS = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'];
  let timer = 0;
  let pending = false;
  let loaded = false;
  function load(source) {
    if (pending) return;
    pending = true;
    root.dataset.fxHabitatModuleLoaderR2068 = 'loading';
    root.dataset.fxHabitatModuleStartR2068 = String(source || 'intent');
    clearTimeout(timer);
    for (const type of EVENTS) removeEventListener(type, intent, true);
    document.removeEventListener('formatx:magbirthcomplete', introComplete);
    const script = document.createElement('script');
    script.async = true;
    script.dataset.fxLivingHabitatR1530 = 'true';
    script.src = url;
    script.onload = () => {
      loaded = true;
      root.dataset.fxHabitatModuleLoaderR2068 = 'ready';
    };
    script.onerror = () => {
      root.dataset.fxHabitatModuleLoaderR2068 = 'failed';
      // Never falsely mark the habitat as ready.
    };
    document.head.appendChild(script);
  }
  function intent(event) {
    // The original event continues to the actual WebGL MAG and UI unmodified.
    load(event.type);
  }
  function introComplete() {
    load('mag-birth-handoff');
  }
  for (const type of EVENTS) addEventListener(type, intent, { passive: true, capture: true });
  document.addEventListener('formatx:magbirthcomplete', introComplete, { passive: true, once: true });
  const armFallback = () => {
    // Same schedule for all users and measurement tools. Late background is
    // still fully available to users who have not interacted yet.
    timer = setTimeout(() => load('post-load-idle'), 1800);
  };
  if (document.readyState === 'complete') armFallback();
  else addEventListener('load', armFallback, { once: true, passive: true });
  root.dataset.fxHabitatModuleLoaderR2068 = 'listening';
})();
