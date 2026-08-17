(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'r193-cache-staged-hydration';
  if (root.dataset.fxProductionIdleLoaderR193 === VERSION) return;
  root.dataset.fxProductionIdleLoaderR193 = 'booting';

  const CONTENT_STYLE = '/scifi-ui/styles/formatx-content-standard.css?v=20260812-quality-r1';
  const CONTENT_SCRIPTS = [
    '/scifi-ui/scripts/release-metadata.js?v=20260807-full-release-1',
    '/scifi-ui/scripts/formatx-content-standard.js?v=20260731-content-1',
    '/scifi-ui/scripts/formatx-seo.js?v=20260812-final-polish-r1',
    '/scifi-ui/scripts/formatx-content-finalizer.js?v=20260813-single-mag-root-r70',
    '/scifi-ui/scripts/formatx-platform-surface-finalizer.js?v=20260731-platform-final-1',
    '/scifi-ui/scripts/formatx-organism-trust.js?v=20260731-organism-trust-1',
    '/scifi-ui/scripts/formatx-organism-semantic-state.js?v=20260731-organism-semantic-1'
  ];

  const ESSENTIAL_INTERACTION_SCRIPTS = [
    '/scifi-ui/scripts/formatx-premium-finish.js?v=20260817-r193-staged',
    '/scifi-ui/scripts/formatx-signature-system-r185.js?v=20260817-r193-staged'
  ];

  const SECONDARY_VISUAL_SCRIPTS = [
    '/scifi-ui/scripts/living-architecture.js?v=20260726-living-1',
    '/scifi-ui/scripts/formatx-category-positioning.js?v=20260728-category-v1',
    '/scifi-ui/scripts/formatx-category-deck-stabilizer.js?v=20260728-category-deck-v1',
    '/scifi-ui/scripts/formatx-origin-proof.js?v=20260728-origin-proof-v1',
    '/scifi-ui/scripts/project-simulator-entry.js?v=20260728-operational-twin-1',
    '/scifi-ui/scripts/formatx-live-heartbeat-r155.js?v=20260817-r193-staged',
    '/scifi-ui/scripts/formatx-seamless-enforcer-r159.js?v=20260817-r187-first-paint',
    '/scifi-ui/scripts/formatx-living-energy-r168.js?v=20260817-r193-staged',
    '/scifi-ui/scripts/formatx-award-narrative-r175.js?v=20260816-r175-award-narrative',
    '/scifi-ui/scripts/formatx-soty-continuity-r179.js?v=20260817-r193-staged'
  ];

  const DESKTOP_VISUAL_SCRIPTS = [
    '/scifi-ui/scripts/formatx-desktop-apex-r181.js?v=20260816-r181-crystal-apex'
  ];

  const FEEDBACK_STYLE = '/scifi-ui/styles/formatx-feedback.css?v=20260806-feedback-1';
  const FEEDBACK_SCRIPT = '/scifi-ui/scripts/formatx-feedback.js?v=20260806-feedback-1';

  let essentialStarted = false;
  let secondaryStarted = false;
  let contentStarted = false;
  let feedbackStarted = false;
  let secondaryObserver = null;
  let secondaryFallback = 0;
  let contentFallback = 0;

  function mobileViewport() {
    return matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  }

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function loadStyle(href, marker) {
    const filename = href.split('?')[0].split('/').pop();
    if (document.querySelector(`link[href*="${filename}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset[marker] = 'true';
    document.head.appendChild(link);
  }

  function loadScript(src, marker) {
    const filename = src.split('?')[0].split('/').pop();
    if (document.querySelector(`script[src*="${filename}"]`)) return Promise.resolve();
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset[marker] = 'true';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => {
        root.dataset.fxProductionIdleLoaderErrorR193 = filename;
        resolve();
      }, { once: true });
      document.head.appendChild(script);
    });
  }

  function activateDeferredMobileStyles() {
    if (!mobileViewport()) {
      root.dataset.fxProductionMobileStyleHydrationR193 = 'desktop-native-media';
      return;
    }
    const links = Array.from(document.querySelectorAll('link[data-fx-mobile-deferred-r192]'));
    for (const link of links) link.media = 'all';
    root.dataset.fxProductionMobileStyleHydrationR193 = `ready-${links.length}`;
  }

  function applyAwardProofMetrics() {
    const facts = document.querySelectorAll('#hero .hero-facts > span');
    if (facts.length < 3) return;
    const values = language() === 'en'
      ? [
          ['04', 'method steps'],
          ['06', 'published platform states'],
          ['04', 'public proof routes']
        ]
      : [
          ['04', 'módszerlépés'],
          ['06', 'közzétett platformállapot'],
          ['04', 'nyilvános bizonyítéki útvonal']
        ];

    facts.forEach((fact, index) => {
      const value = fact.querySelector('b');
      const label = fact.querySelector('small');
      if (value) value.textContent = values[index][0];
      if (label) {
        label.textContent = values[index][1];
        label.dataset.hu = index === 0
          ? 'módszerlépés'
          : index === 1 ? 'közzétett platformállapot' : 'nyilvános bizonyítéki útvonal';
        label.dataset.en = index === 0
          ? 'method steps'
          : index === 1 ? 'published platform states' : 'public proof routes';
      }
      fact.classList.add('fx-proof-metric');
      fact.dataset.state = 'available';
    });
    root.dataset.fxAwardProofMetricsR193 = '04-06-04';
  }

  async function hydrateEssentialInteractions() {
    if (essentialStarted) return;
    essentialStarted = true;
    root.dataset.fxProductionEssentialHydrationR193 = 'loading';
    for (const src of ESSENTIAL_INTERACTION_SCRIPTS) {
      await loadScript(src, 'fxProductionEssentialScriptR193');
    }
    root.dataset.fxProductionEssentialHydrationR193 = `ready-${ESSENTIAL_INTERACTION_SCRIPTS.length}`;
  }

  async function hydrateSecondaryVisuals(source) {
    if (secondaryStarted) return;
    secondaryStarted = true;
    clearTimeout(secondaryFallback);
    secondaryObserver?.disconnect();
    secondaryObserver = null;
    root.dataset.fxProductionSecondaryHydrationR193 = `loading-${source || 'scheduled'}`;
    activateDeferredMobileStyles();
    const queue = mobileViewport()
      ? SECONDARY_VISUAL_SCRIPTS
      : SECONDARY_VISUAL_SCRIPTS.concat(DESKTOP_VISUAL_SCRIPTS);
    for (const src of queue) {
      await loadScript(src, 'fxProductionSecondaryScriptR193');
    }
    root.dataset.fxProductionSecondaryHydrationR193 = `ready-${queue.length}`;
  }

  async function hydrateContent(source) {
    if (contentStarted) return;
    contentStarted = true;
    clearTimeout(contentFallback);
    root.dataset.fxProductionContentHydrationR193 = `loading-${source || 'scheduled'}`;
    loadStyle(CONTENT_STYLE, 'fxContentStandardStyleR193');
    for (const src of CONTENT_SCRIPTS) {
      await loadScript(src, 'fxProductionContentScriptR193');
    }
    applyAwardProofMetrics();
    root.dataset.fxProductionContentHydrationR193 = 'ready';
  }

  async function hydrateFeedback() {
    if (feedbackStarted) return;
    feedbackStarted = true;
    root.dataset.fxProductionFeedbackHydrationR193 = 'loading';
    loadStyle(FEEDBACK_STYLE, 'fxFeedbackStyleR193');
    await loadScript(FEEDBACK_SCRIPT, 'fxFeedbackScriptR193');
    root.dataset.fxProductionFeedbackHydrationR193 = 'ready';
  }

  function afterFirstPaint(callback, timeout, fallbackDelay) {
    const schedule = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) requestIdleCallback(callback, { timeout });
      else setTimeout(callback, fallbackDelay);
    }));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
    else schedule();
  }

  function scheduleEssential() {
    afterFirstPaint(() => void hydrateEssentialInteractions(), mobileViewport() ? 760 : 420, mobileViewport() ? 420 : 180);
  }

  function scheduleSecondary() {
    const trigger = source => void hydrateSecondaryVisuals(source);
    const experience = document.getElementById('experience');

    if (experience && 'IntersectionObserver' in window) {
      secondaryObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        trigger('near-experience');
      }, { rootMargin: '900px 0px', threshold: 0 });
      secondaryObserver.observe(experience);
    }

    const intent = () => trigger('user-intent');
    addEventListener('scroll', intent, { passive: true, once: true });
    addEventListener('wheel', intent, { passive: true, once: true });
    addEventListener('touchmove', intent, { passive: true, once: true });
    addEventListener('keydown', event => {
      if (['PageDown', 'ArrowDown', 'End', ' '].includes(event.key)) trigger('keyboard-intent');
    }, { once: true });

    secondaryFallback = setTimeout(() => trigger('fallback'), mobileViewport() ? 3200 : 1800);
  }

  function scheduleContent() {
    const start = source => void hydrateContent(source);
    afterFirstPaint(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => start('idle'), { timeout: mobileViewport() ? 2200 : 1400 });
      } else {
        contentFallback = setTimeout(() => start('fallback'), mobileViewport() ? 1800 : 900);
      }
    }, mobileViewport() ? 1800 : 900, mobileViewport() ? 1100 : 520);

    const interaction = () => start('user-intent');
    addEventListener('scroll', interaction, { passive: true, once: true });
    addEventListener('pointerdown', interaction, { passive: true, once: true });
  }

  function observeFeedback() {
    const section = document.getElementById('user-feedback');
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      setTimeout(() => void hydrateFeedback(), 2400);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      void hydrateFeedback();
    }, { rootMargin: '700px 0px' });
    observer.observe(section);
  }

  function boot() {
    applyAwardProofMetrics();
    root.dataset.fxProductionPublicShellR193 = 'homepage-critical-shell';
    root.dataset.fxProductionIdleLoaderR193 = VERSION;
    root.dataset.fxProductionIdleLoaderR192 = 'superseded-by-r193';
    root.dataset.fxProductionDesktopApexR193 = mobileViewport()
      ? 'not-requested-on-mobile'
      : 'secondary-after-first-paint';
    scheduleEssential();
    scheduleSecondary();
    scheduleContent();
    observeFeedback();
  }

  addEventListener('formatx:languagechange', () => {
    queueMicrotask(applyAwardProofMetrics);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
