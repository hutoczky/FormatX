(function () {
  'use strict';

  const ROOT = document.documentElement;
  const PLAN_IDS = ['business_lite', 'business_pro', 'technician_team'];
  const PLANS = {
    business_lite: { name: 'Business Lite', HUF: 7900, EUR: 22 },
    business_pro: { name: 'Business Pro', HUF: 15900, EUR: 44 },
    technician_team: { name: 'Technician Team', HUF: 29900, EUR: 83 }
  };
  const SCENES = [
    { hu: 'MAG', en: 'CORE', progress: 0 },
    { hu: 'IDEGRENDSZER', en: 'NERVOUS SYSTEM', progress: .2 },
    { hu: 'RENDSZERSZERVEK', en: 'SYSTEM ORGANS', progress: .4 },
    { hu: 'KERESKEDELMI SZÍV', en: 'COMMERCE HEART', progress: .6 },
    { hu: 'RENDSZERVÁZ', en: 'SYSTEM SKELETON', progress: .8 },
    { hu: 'KIADÁSI JELADÓ', en: 'RELEASE BEACON', progress: 1 }
  ];

  const status = document.querySelector('.fx-organism-status');
  const statusIndex = status?.querySelector('.fx-organism-status-index');
  const statusName = status?.querySelector('strong');
  const nodes = Array.from(document.querySelectorAll('[data-organ-node]'));
  let qrGeneration = 0;
  let threeLoadStarted = false;
  let threeLoaderArmed = false;
  let qrDockActivated = false;
  let qrDockObserver = null;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function currency() {
    return document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
  }

  function money(value, selectedCurrency) {
    return new Intl.NumberFormat(language() === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function checkoutHref(planId, selectedCurrency) {
    const url = new URL('./checkout.html', document.baseURI);
    url.searchParams.set('plan', planId);
    url.searchParams.set('cycle', 'monthly');
    url.searchParams.set('currency', selectedCurrency);
    url.searchParams.set('lang', language());
    url.searchParams.set('source', 'living-qr-dock');
    return url.href;
  }

  function qrApiUrl(planId, selectedCurrency) {
    const params = new URLSearchParams({
      plan: planId,
      cycle: 'monthly',
      currency: selectedCurrency,
      v: '20260730-qr1'
    });
    return '/api/checkout-qr?' + params.toString();
  }

  function qrLocalUrl(planId, selectedCurrency) {
    return './assets/qr/' + planId + '-' + selectedCurrency.toLowerCase() + '.svg?v=20260730-qr1';
  }

  function ensureStyle(href, attr, onReady) {
    let link = document.querySelector(`link[${attr}]`);
    if (link instanceof HTMLLinkElement) return link;
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(attr, 'true');
    if (onReady) link.addEventListener('load', onReady, { once: true });
    document.head.appendChild(link);
    return link;
  }

  function loadScriptOrdered(src, attr, readyCheck) {
    return new Promise((resolve, reject) => {
      let script = document.querySelector(`script[${attr}]`);
      let probeTimer = 0;
      let settled = false;
      const ready = () => {
        try { return typeof readyCheck === 'function' && Boolean(readyCheck()); }
        catch (_) { return false; }
      };
      const cleanup = () => {
        if (probeTimer) clearTimeout(probeTimer);
        probeTimer = 0;
        script?.removeEventListener('load', loaded);
        script?.removeEventListener('error', failed);
      };
      const finish = (ok, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (ok) {
          if (script instanceof HTMLScriptElement) script.dataset.fxLoadedR552 = 'true';
          resolve(script);
        } else reject(value);
      };
      const loaded = () => finish(true);
      const failed = () => finish(false, new Error(`failed to load ${src}`));
      const probe = () => {
        if (settled) return;
        if (ready()) { loaded(); return; }
        probeTimer = setTimeout(probe, 25);
      };

      if (script instanceof HTMLScriptElement && (script.dataset.fxLoadedR552 === 'true' || ready())) {
        script.dataset.fxLoadedR552 = 'true';
        resolve(script);
        return;
      }
      if (script instanceof HTMLScriptElement) {
        script.addEventListener('load', loaded, { once: true });
        script.addEventListener('error', failed, { once: true });
        if (typeof readyCheck === 'function') probe();
        return;
      }
      script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.setAttribute(attr, 'true');
      script.addEventListener('load', loaded, { once: true });
      script.addEventListener('error', failed, { once: true });
      document.head.appendChild(script);
      if (typeof readyCheck === 'function') probe();
    });
  }

  async function loadThreeExperience() {
    if (threeLoadStarted) return;
    threeLoadStarted = true;
    ROOT.dataset.fxThreeLoader = 'starting-on-demand-r554';

    ensureStyle('./styles/igloo-parity.css?v=20260727-webgpu-1', 'data-fx-cryosphere-style');
    ensureStyle('./styles/readability-focus.css?v=20260727-readability-2', 'data-fx-readability-style', () => {
      ROOT.dataset.fxReadability = 'ready';
    });
    ensureStyle('./styles/organism-interface.css?v=20260727-organism-1', 'data-fx-organism-interface-style');
    ensureStyle('./styles/organism-interface-layering.css?v=20260727-fullscreen-1', 'data-fx-organism-layering-style');

    try {
      ROOT.dataset.fxThreeLoader = 'loading-interface-r554';
      await loadScriptOrdered(
        './scripts/organism-interface.js?v=20260906-r554-idempotent-handoff',
        'data-fx-organism-interface-script',
        () => ROOT.dataset.fxOrganismInterface === 'ready'
      );
      if (ROOT.dataset.fxOrganismInterface !== 'ready') throw new Error('organism interface loaded without READY state');
      ROOT.dataset.fxThreeLoader = 'interface-ready-r554';

      await loadScriptOrdered(
        './scripts/organism-menu-controller.js?v=20260906-r554-idempotent-handoff',
        'data-fx-organism-menu-script',
        () => ROOT.dataset.fxOrganismMenu === 'ready'
      );
      ROOT.dataset.fxThreeLoader = 'menu-ready-r554';

      await loadScriptOrdered(
        './scripts/igloo-parity.js?v=20260820-reference-loop-r246&rev=20260906-r554-idempotent-handoff',
        'data-fx-cryosphere-script',
        () => ROOT.dataset.fxTranscendLoader === 'safe-ready-v28'
      );
      ROOT.dataset.fxThreeLoader = 'ready-on-demand-r554';
      dispatchEvent(new CustomEvent('formatx:organismhandoffready', { detail: { revision: 'r554' } }));
    } catch (error) {
      ROOT.dataset.fxThreeLoader = 'failed-on-demand-r554';
      ROOT.dataset.fxThreeLoaderErrorR552 = String(error?.message || error || 'unknown-load-error').slice(0, 160);
      dispatchEvent(new CustomEvent('formatx:organismhandofferror', { detail: { revision: 'r554', message: ROOT.dataset.fxThreeLoaderErrorR552 } }));
    }
  }

  function armThreeExperience() {
    if (threeLoaderArmed || threeLoadStarted) return;
    threeLoaderArmed = true;
    if (ROOT.dataset.fxImmersive === 'active') {
      void loadThreeExperience();
      return;
    }
    ROOT.dataset.fxThreeLoader = 'deferred-user-activation';
    addEventListener('formatx:immersiveactivate', () => { void loadThreeExperience(); }, { once: true });
  }

  /* R554: arm the lightweight handoff immediately. MAG still boots from
     navigation independently; only the heavy Organism UI waits for a genuine
     immersive/MAG activation. Existing already-ready scripts are recognized
     deterministically rather than waiting for a second load event. */
  armThreeExperience();

  function revealQrDock() {
    const dock = document.getElementById('formatx-plan-qr-dock');
    if (!dock) return;
    dock.classList.add('visible');
    dock.style.setProperty('opacity', '1', 'important');
    dock.style.setProperty('visibility', 'visible', 'important');
    dock.style.setProperty('transform', 'none', 'important');
    dock.style.setProperty('filter', 'none', 'important');
    dock.dataset.fxQrVisible = 'true';
  }

  function activateQrDock() {
    if (qrDockActivated) return;
    qrDockActivated = true;
    ROOT.dataset.fxQrLoading = 'active-near-viewport';
    qrDockObserver?.disconnect();
    qrDockObserver = null;
    updateCommerce();
  }

  function prepareQrDock() {
    const dock = document.getElementById('formatx-plan-qr-dock');
    revealQrDock();
    if (!dock) return;
    if (!('IntersectionObserver' in window)) {
      activateQrDock();
      return;
    }
    ROOT.dataset.fxQrLoading = 'deferred';
    qrDockObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) activateQrDock();
    }, { rootMargin: '700px 0px', threshold: 0 });
    qrDockObserver.observe(dock);
  }

  function syncScene() {
    const raw = Number(ROOT.dataset.fxScene || 0);
    const index = Math.max(0, Math.min(SCENES.length - 1, Number.isFinite(raw) ? raw : 0));
    const scene = SCENES[index];
    ROOT.style.setProperty('--organism-progress', Math.round(scene.progress * 100) + '%');
    if (statusIndex) statusIndex.textContent = String(index + 1).padStart(2, '0') + ' / 06';
    if (statusName) statusName.textContent = scene[language()];
    nodes.forEach((node, nodeIndex) => {
      const active = nodeIndex === index;
      node.classList.toggle('active', active);
      if (active) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
  }

  function loadQrImage(card, image, planId, selectedCurrency, generation) {
    const apiSource = qrApiUrl(planId, selectedCurrency);
    const localSource = qrLocalUrl(planId, selectedCurrency);

    card.classList.remove('is-qr-ready', 'is-qr-error');
    card.classList.add('is-qr-loading');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.dataset.fxQrFallback = 'false';

    image.onload = () => {
      if (generation !== qrGeneration) return;
      if (image.naturalWidth < 32 || image.naturalHeight < 32) {
        image.onerror?.();
        return;
      }
      card.classList.remove('is-qr-loading', 'is-qr-error');
      card.classList.add('is-qr-ready');
      ROOT.dataset.fxQrDelivery = image.dataset.fxQrFallback === 'true' ? 'local-fallback' : 'api';
    };

    image.onerror = () => {
      if (generation !== qrGeneration) return;
      if (image.dataset.fxQrFallback !== 'true') {
        image.dataset.fxQrFallback = 'true';
        image.src = localSource;
        return;
      }
      card.classList.remove('is-qr-loading', 'is-qr-ready');
      card.classList.add('is-qr-error');
      ROOT.dataset.fxQrDelivery = 'failed';
    };

    if (image.getAttribute('src') !== apiSource || !image.complete || image.naturalWidth < 32) {
      image.src = apiSource;
    } else {
      image.onload();
    }
  }

  function updateCommerce() {
    const selectedCurrency = currency();
    const otherCurrency = selectedCurrency === 'HUF' ? 'EUR' : 'HUF';
    const generation = ++qrGeneration;
    revealQrDock();

    document.querySelectorAll('[data-plan-id]').forEach(card => {
      const planId = card.dataset.planId;
      const plan = PLANS[planId];
      if (!plan) return;
      const main = card.querySelector('.price strong');
      const secondary = card.querySelector('.price small');
      const link = card.querySelector(':scope > a');
      if (main) main.textContent = money(plan[selectedCurrency], selectedCurrency);
      if (secondary) secondary.textContent = money(plan[otherCurrency], otherCurrency)
        + (language() === 'hu' ? ' / hó' : ' / month');
      if (link) link.href = checkoutHref(planId, selectedCurrency);
    });

    PLAN_IDS.forEach(planId => {
      const plan = PLANS[planId];
      const card = document.querySelector('[data-plan-qr="' + planId + '"]');
      if (!plan || !card) return;
      const link = card.querySelector('.fx-plan-qr-link');
      const image = card.querySelector('[data-plan-qr-image]');
      const price = card.querySelector('[data-plan-qr-price]');
      const href = checkoutHref(planId, selectedCurrency);
      if (price) price.textContent = money(plan[selectedCurrency], selectedCurrency)
        + (language() === 'hu' ? ' / hó' : ' / month');
      if (link) {
        link.href = href;
        link.setAttribute('aria-label', plan.name + ' — '
          + (language() === 'hu' ? 'fizetési oldal megnyitása' : 'open payment'));
      }
      if (!image) return;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.alt = plan.name + ' — '
        + (language() === 'hu' ? 'fizetési oldal QR-kódja' : 'payment page QR code');
      if (qrDockActivated) loadQrImage(card, image, planId, selectedCurrency, generation);
    });
  }

  function bind() {
    const observer = new MutationObserver(entries => {
      let sceneChanged = false;
      let languageChanged = false;
      for (const entry of entries) {
        if (entry.type !== 'attributes') continue;
        if (entry.attributeName === 'data-fx-scene') sceneChanged = true;
        if (entry.attributeName === 'lang') languageChanged = true;
      }
      if (sceneChanged || languageChanged) syncScene();
      if (languageChanged) updateCommerce();
    });
    observer.observe(ROOT, { attributes: true, attributeFilter: ['data-fx-scene', 'lang'] });
    document.addEventListener('click', event => {
      if (!event.target.closest('[data-currency], .fx-language-toggle, [data-language], [data-language-choice]')) return;
      setTimeout(() => {
        syncScene();
        updateCommerce();
      }, 0);
    });
    addEventListener('formatx:languagechange', () => {
      syncScene();
      updateCommerce();
    });
    addEventListener('pageshow', () => {
      revealQrDock();
      updateCommerce();
    });
    addEventListener('pagehide', () => {
      observer.disconnect();
      qrDockObserver?.disconnect();
      qrDockObserver = null;
    }, { once: true });
  }

  function initialise() {
    ROOT.dataset.fxQrOwner = 'living-v3-performance';
    revealQrDock();
    syncScene();
    updateCommerce();
    prepareQrDock();
    bind();
    ROOT.dataset.fxLivingArchitecture = 'ready-performance-v3';
    dispatchEvent(new CustomEvent('formatx:livingready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());
