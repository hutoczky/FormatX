(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxOriginProof === 'v1') return;
  root.dataset.fxOriginProof = 'v1';

  const COPY = {
    hu: {
      eyebrow: '05.5 — EREDET / BIZONYÍTÉK / JÖVŐKÉP',
      title: 'Miért született meg a FormatX?',
      story: 'A projekt abból a problémából indult, hogy a technikusi eszközök gyakran szétszórtak, platformfüggők vagy nem mutatják meg elég világosan, mi fog történni egy kritikus művelet során. A FormatX célja ezért nem egy újabb eszköztár, hanem egy közös operációs réteg: ugyanaz a felmérési, tervezési, végrehajtási és ellenőrzési logika minden támogatott környezetben.',
      statement: 'A jövőkép: a technikus egyetlen felületen lássa, mit tud a rendszer, mit készül végrehajtani, és mi lett ténylegesen ellenőrizve.',
      cards: [
        ['KIADÁSI LÁNC', 'A teljes kiadás hivatalos csomagja a FormatX ellenőrzött kiadási csatornájából származik. A külön Stable minősítéshez további nyilvános tesztbizonyíték szükséges.'],
        ['INTEGRITÁS', 'A kiadási metaadat közzétett SHA-256 digestet ellenőriz. Külön checksum- vagy aláírási bizonyíték csak akkor jelenik meg, ha ténylegesen publikálták.'],
        ['BIZTONSÁGI MODELL', 'Célmeghajtó-azonosítás, többlépcsős megerősítés, naplózott végrehajtás és dokumentálható végeredmény.'],
        ['PLATFORMSTRATÉGIA', 'Linux/Bazzite az elsődleges platform. Windows és Android támogatott Full release; a web Technical preview, macOS és iOS/iPadOS Planned.']
      ]
    },
    en: {
      eyebrow: '05.5 — ORIGIN / PROOF / VISION',
      title: 'Why was FormatX created?',
      story: 'The project began with a practical problem: technician tools are often fragmented, platform-bound or fail to explain clearly what a critical operation will do. FormatX is therefore not another toolbox. It is a shared operating layer that applies the same assess, plan, execute and verify logic across every supported environment.',
      statement: 'The vision: one interface where the technician can see what the system knows, what it is about to execute and what was actually verified.',
      cards: [
        ['RELEASE CHAIN', 'The official full-release package comes from the verified FormatX release channel. The separate Stable designation requires additional published test evidence.'],
        ['INTEGRITY', 'Release metadata verifies a published SHA-256 digest. Separate checksum or signature proof is shown only when it has actually been published.'],
        ['SAFETY MODEL', 'Target identification, multi-step confirmation, logged execution and a documentable final result.'],
        ['PLATFORM STRATEGY', 'Linux/Bazzite is primary. Windows and Android are supported Full release platforms; Web is a Technical preview, while macOS and iOS/iPadOS are Planned.']
      ]
    }
  };

  const language = () => root.lang === 'en' ? 'en' : 'hu';
  let retryTimer = 0;
  let attempts = 0;

  function targetSystem() {
    const candidates = Array.from(document.querySelectorAll('section#system, section[data-organ="skeleton"]'));
    return candidates.find(section => section.isConnected && !section.closest('[data-fx-loop-bridge="true"]'))
      || candidates.find(section => section.isConnected)
      || null;
  }

  function createProof() {
    const existing = document.querySelector('.fx-origin-proof');
    if (existing) return existing;
    const system = targetSystem();
    if (!system) return null;

    const proof = document.createElement('section');
    proof.className = 'fx-origin-proof';
    proof.dataset.fxOriginProofBlock = 'true';
    proof.setAttribute('aria-labelledby', 'fx-origin-title');
    proof.innerHTML = '<div class="fx-origin-copy"><p class="section-index" data-fx-proof-eyebrow></p><h3 id="fx-origin-title" data-fx-proof-title></h3><p data-fx-proof-story></p><blockquote data-fx-proof-statement></blockquote></div><div class="fx-proof-grid"></div>';

    const anchor = system.querySelector('.marquee');
    const grid = system.querySelector('.system-grid');
    if (anchor) anchor.insertAdjacentElement('beforebegin', proof);
    else if (grid) grid.insertAdjacentElement('afterend', proof);
    else system.appendChild(proof);
    return proof;
  }

  function render() {
    const proof = createProof();
    if (!proof) return false;
    const copy = COPY[language()];
    proof.querySelector('[data-fx-proof-eyebrow]').textContent = copy.eyebrow;
    proof.querySelector('[data-fx-proof-title]').textContent = copy.title;
    proof.querySelector('[data-fx-proof-story]').textContent = copy.story;
    proof.querySelector('[data-fx-proof-statement]').textContent = copy.statement;
    const grid = proof.querySelector('.fx-proof-grid');
    grid.replaceChildren(...copy.cards.map((item, index) => {
      const article = document.createElement('article');
      article.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span><div><h4></h4><p></p></div>';
      article.querySelector('h4').textContent = item[0];
      article.querySelector('p').textContent = item[1];
      return article;
    }));
    root.dataset.fxOriginProofState = 'ready';
    return true;
  }

  function ensure() {
    if (render()) {
      clearInterval(retryTimer);
      retryTimer = 0;
      return;
    }
    if (!retryTimer) {
      retryTimer = window.setInterval(() => {
        attempts += 1;
        if (render() || attempts >= 80) {
          clearInterval(retryTimer);
          retryTimer = 0;
          if (attempts >= 80 && !document.querySelector('.fx-origin-proof')) root.dataset.fxOriginProofState = 'missing-target';
        }
      }, 250);
    }
  }

  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:threeready', 'formatx:loop'].forEach(name => {
    addEventListener(name, ensure);
  });
  addEventListener('formatx:languagechange', () => queueMicrotask(render));

  const languageObserver = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) queueMicrotask(render);
  });
  languageObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });

  addEventListener('pagehide', () => {
    clearInterval(retryTimer);
    languageObserver.disconnect();
  }, { once: true });
}());


(function loadAwardJuryLayerAfterIntentR644() {
  'use strict';
  const root=document.documentElement;
  if (root.dataset.fxAwardJuryR644) return;
  root.dataset.fxAwardJuryR644='loading-after-real-intent';
  const existing=document.querySelector('link[data-fx-award-jury-r637="true"]');
  if(existing instanceof HTMLLinkElement){
    root.dataset.fxAwardJuryR644='ready-existing';
    return;
  }
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/scifi-ui/styles/formatx-award-jury-r637.css?v=20260920-r644-post-intent-award-layer';
  link.dataset.fxAwardJuryR637='true';
  link.addEventListener('load',()=>{root.dataset.fxAwardJuryR644='ready-post-intent';},{once:true});
  link.addEventListener('error',()=>{root.dataset.fxAwardJuryR644='style-error';},{once:true});
  document.head.appendChild(link);
}());

(function loadProductShowcaseNearViewport() {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxProductShowcaseLoader === 'v2') return;
  root.dataset.fxProductShowcaseLoader = 'v2';

  let observer = null;
  let targetRetry = 0;
  let loaded = false;

  function inject() {
    if (loaded) return;
    loaded = true;
    root.dataset.fxProductShowcaseLoadState = 'loading';
    if (observer) observer.disconnect();
    clearInterval(targetRetry);

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './styles/formatx-product-showcase.css?v=20260806-real-product-1';
    stylesheet.dataset.fxProductShowcaseStyle = 'true';
    document.head.appendChild(stylesheet);

    const script = document.createElement('script');
    script.src = './scripts/formatx-product-showcase.js?v=20260920-r644-intent-prewarm-absolute-assets';
    script.async = true;
    script.dataset.fxProductShowcaseScript = 'true';
    script.addEventListener('load', () => { root.dataset.fxProductShowcaseLoadState = 'ready'; }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxProductShowcaseLoadState = 'error'; }, { once: true });
    document.head.appendChild(script);
  }

  function findTrigger() {
    const candidates = Array.from(document.querySelectorAll('section#capabilities, section[data-organ="organs"]'));
    return candidates.find(section => section.isConnected && !section.closest('[data-fx-loop-bridge="true"]'))
      || candidates.find(section => section.isConnected)
      || null;
  }

  function arm() {
    if (loaded || observer) return true;
    const trigger = findTrigger();
    if (!trigger) return false;

    if (!('IntersectionObserver' in window)) {
      inject();
      return true;
    }

    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) inject();
    }, { rootMargin: '240px 0px', threshold: 0.01 });
    observer.observe(trigger);
    root.dataset.fxProductShowcaseLoadState = 'armed';
    return true;
  }

  function triggerNearViewport() {
    const trigger = findTrigger();
    if (!trigger) return false;
    const rect = trigger.getBoundingClientRect();
    return rect.bottom >= -240 && rect.top <= innerHeight + 240;
  }

  function ensureArmed() {
    if (loaded) return;
    if (triggerNearViewport()) {
      inject();
      return;
    }
    if (arm()) {
      clearInterval(targetRetry);
      targetRetry = 0;
      return;
    }
    if (!targetRetry) {
      let attempts = 0;
      targetRetry = window.setInterval(() => {
        attempts += 1;
        if (arm() || attempts >= 80) {
          clearInterval(targetRetry);
          targetRetry = 0;
          if (attempts >= 80 && !loaded) root.dataset.fxProductShowcaseLoadState = 'missing-target';
        }
      }, 250);
    }
  }

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', ensureArmed, { once: true });
  } else {
    ensureArmed();
  }
  ['pageshow', 'formatx:livingready', 'formatx:loop'].forEach(name => addEventListener(name, ensureArmed));
  addEventListener('scroll', ensureArmed, { passive: true });
  addEventListener('hashchange', ensureArmed, { passive: true });
  addEventListener('pagehide', () => {
    if (observer) observer.disconnect();
    clearInterval(targetRetry);
  }, { once: true });
}());

(function loadLiveOperatingSystemLayer() {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLiveOsLoader === 'v1') return;
  root.dataset.fxLiveOsLoader = 'v1';

  let loaded = false;
  let observer = null;
  let retryTimer = 0;

  function launcherLabel() {
    return root.lang === 'en'
      ? 'Live OS — FormatX command'
      : 'Live OS — FormatX parancs';
  }

  function requestOpenR644(source='launcher') {
    root.dataset.fxLiveOsOpenPendingR644 = 'true';
    root.dataset.fxLiveOsOpenSourceR644 = source;
    inject();
  }

  function ensureLauncher() {
    const control = document.querySelector('[data-fx-live-os-launcher]')
      || document.querySelector('#hero .fx-reference-liveos');
    if (!(control instanceof HTMLElement)) {
      root.dataset.fxLiveOsLauncherR643 = 'awaiting-reference-cta';
      return null;
    }
    control.dataset.fxLiveOsLauncher = 'true';
    control.setAttribute('aria-label', launcherLabel());
    control.title = launcherLabel() + ' · Ctrl/⌘ K';
    if (control.dataset.fxLiveOsRuntimeBoundR644 !== 'true') {
      control.dataset.fxLiveOsRuntimeBoundR644 = 'true';
      control.addEventListener('click', event => {
        event.preventDefault();
        requestOpenR644('bound-launcher-click');
      });
    }
    root.dataset.fxLiveOsLauncherR643 = 'hero-reference-cta-no-fixed-overlay';
    root.dataset.fxLiveOsLauncherR644 = 'persistent-open-handshake';
    return control;
  }

  function inject() {
    if (loaded) return;
    loaded = true;
    if (observer) observer.disconnect();
    clearInterval(retryTimer);
    root.dataset.fxLiveOsLoadState = 'loading';

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './styles/formatx-live-os.css?v=20260806-live-os-1';
    stylesheet.dataset.fxLiveOsStyle = 'true';
    document.head.appendChild(stylesheet);

    const script = document.createElement('script');
    script.src = './scripts/formatx-live-os.js?v=20260806-live-os-1';
    script.async = true;
    script.dataset.fxLiveOsScript = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxLiveOsLoadState = 'ready';
      ensureLauncher();
      dispatchEvent(new CustomEvent('formatx:open-live-os-ready'));
    }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxLiveOsLoadState = 'error'; }, { once: true });
    document.head.appendChild(script);
  }

  function triggerTarget() {
    return document.getElementById('product-showcase')
      || document.querySelector('section#capabilities, section[data-organ="organs"]');
  }

  function arm() {
    if (loaded || observer) return true;
    const trigger = triggerTarget();
    if (!trigger) return false;
    if (!('IntersectionObserver' in window)) {
      inject();
      return true;
    }
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) inject();
    }, { rootMargin: '520px 0px', threshold: 0.01 });
    observer.observe(trigger);
    root.dataset.fxLiveOsLoadState = 'armed';
    return true;
  }

  function ensureArmed() {
    ensureLauncher();
    root.dataset.fxLiveOsLauncherR641 = 'superseded-by-r643-hero-reference-cta';
    if (root.dataset.fxLiveOsOpenPendingR644 === 'true') {
      inject();
      return;
    }
    if (arm()) {
      clearInterval(retryTimer);
      retryTimer = 0;
      return;
    }
    if (!retryTimer) {
      let attempts = 0;
      retryTimer = window.setInterval(() => {
        attempts += 1;
        if (arm() || attempts >= 80) {
          clearInterval(retryTimer);
          retryTimer = 0;
          if (attempts >= 80 && !loaded) root.dataset.fxLiveOsLoadState = 'missing-target';
        }
      }, 250);
    }
  }

  addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      requestOpenR644('origin-keyboard-shortcut');
    }
  });
  addEventListener('formatx:request-live-os', event => {
    requestOpenR644(String(event.detail?.source || 'runtime-request'));
  });

  addEventListener('formatx:languagechange', ensureLauncher);
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', ensureArmed, { once: true });
  else ensureArmed();
  ['pageshow', 'formatx:livingready', 'formatx:loop', 'formatx:productshowcaseready'].forEach(name => addEventListener(name, ensureArmed));
  addEventListener('pagehide', () => {
    if (observer) observer.disconnect();
    clearInterval(retryTimer);
  }, { once: true });
}());
