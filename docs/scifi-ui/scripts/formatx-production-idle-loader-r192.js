(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxProductionIdleLoaderR192 === 'ready') return;
  root.dataset.fxProductionIdleLoaderR192 = 'booting';

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
  const FEEDBACK_STYLE = '/scifi-ui/styles/formatx-feedback.css?v=20260806-feedback-1';
  const FEEDBACK_SCRIPT = '/scifi-ui/scripts/formatx-feedback.js?v=20260806-feedback-1';

  let contentStarted = false;
  let feedbackStarted = false;

  function mobileViewport() {
    return matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  }

  function loadStyle(href, marker) {
    if (document.querySelector(`link[href*="${href.split('?')[0].split('/').pop()}"]`)) return;
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
        root.dataset.fxProductionIdleLoaderErrorR192 = filename;
        resolve();
      }, { once: true });
      document.head.appendChild(script);
    });
  }

  function activateDeferredMobileStyles() {
    if (!mobileViewport()) {
      root.dataset.fxProductionMobileStyleHydrationR192 = 'desktop-immediate';
      return;
    }
    const links = Array.from(document.querySelectorAll('link[data-fx-mobile-deferred-r192]'));
    if (!links.length) {
      root.dataset.fxProductionMobileStyleHydrationR192 = 'none';
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      for (const link of links) link.media = 'all';
      root.dataset.fxProductionMobileStyleHydrationR192 = `ready-${links.length}`;
    }));
  }

  async function hydrateContent() {
    if (contentStarted) return;
    contentStarted = true;
    root.dataset.fxProductionContentHydrationR192 = 'loading';
    loadStyle(CONTENT_STYLE, 'fxContentStandardStyleR192');
    for (const src of CONTENT_SCRIPTS) {
      await loadScript(src, 'fxProductionIdleScriptR192');
    }
    root.dataset.fxProductionContentHydrationR192 = 'ready';
  }

  async function hydrateFeedback() {
    if (feedbackStarted) return;
    feedbackStarted = true;
    root.dataset.fxProductionFeedbackHydrationR192 = 'loading';
    loadStyle(FEEDBACK_STYLE, 'fxFeedbackStyleR192');
    await loadScript(FEEDBACK_SCRIPT, 'fxFeedbackScriptR192');
    root.dataset.fxProductionFeedbackHydrationR192 = 'ready';
  }

  function scheduleContent() {
    const afterPaint = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => void hydrateContent(), { timeout: 900 });
      } else {
        setTimeout(() => void hydrateContent(), 240);
      }
    }));
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', afterPaint, { once: true });
    } else {
      afterPaint();
    }
  }

  function observeFeedback() {
    const section = document.getElementById('user-feedback');
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      setTimeout(() => void hydrateFeedback(), 1800);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      void hydrateFeedback();
    }, { rootMargin: '700px 0px' });
    observer.observe(section);
  }

  root.dataset.fxProductionPublicShellR192 = 'homepage-not-required';
  root.dataset.fxProductionIdleLoaderR192 = 'ready';
  activateDeferredMobileStyles();
  scheduleContent();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeFeedback, { once: true });
  } else {
    observeFeedback();
  }
}());
