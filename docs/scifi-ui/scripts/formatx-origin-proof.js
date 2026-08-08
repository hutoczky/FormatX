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
    script.src = './scripts/formatx-product-showcase.js?v=20260806-real-product-1';
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

  function ensureArmed() {
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

  function ensureLauncher() {
    let button = document.querySelector('[data-fx-live-os-launcher]');
    if (button instanceof HTMLButtonElement) {
      button.setAttribute('aria-label', launcherLabel());
      button.title = launcherLabel() + ' · Ctrl/⌘ K';
      return;
    }
    button = document.createElement('button');
    button.type = 'button';
    button.dataset.fxLiveOsLauncher = 'true';
    button.setAttribute('aria-label', launcherLabel());
    button.title = launcherLabel() + ' · Ctrl/⌘ K';
    button.innerHTML = '<span>Live OS</span>';
    Object.assign(button.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      zIndex: '2147482000',
      minWidth: '54px',
      minHeight: '54px',
      padding: '0 14px',
      border: '1px solid rgba(44,231,243,.68)',
      borderRadius: '999px',
      background: 'rgba(5,18,31,.92)',
      color: '#effcff',
      boxShadow: '0 16px 50px rgba(0,0,0,.4),0 0 28px rgba(44,231,243,.12)',
      cursor: 'pointer',
      font: '800 12px/1 system-ui,sans-serif',
      letterSpacing: '.04em'
    });
    button.addEventListener('click', () => {
      inject();
      setTimeout(() => dispatchEvent(new CustomEvent('formatx:open-live-os')), 0);
    });
    document.body.appendChild(button);
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
      inject();
      setTimeout(() => dispatchEvent(new CustomEvent('formatx:open-live-os')), 0);
    }
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
