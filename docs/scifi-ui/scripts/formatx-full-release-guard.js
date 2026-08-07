(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxFullReleaseGuard === 'ready-v1') return;
  root.dataset.fxFullReleaseGuard = 'loading-v1';

  const EXACT = new Map([
    ['Nyilvános béta', 'Teljes verzió'],
    ['Public beta', 'Full release'],
    ['BÉTA', 'TELJES VERZIÓ'],
    ['BETA', 'FULL RELEASE'],
    ['Multiplatform nyilvános béta', 'Teljes multiplatform verzió'],
    ['Multiplatform public beta', 'Full multiplatform version'],
    ['Multiplatform nyilvános béta letöltése', 'Teljes multiplatform verzió letöltése'],
    ['Download multiplatform public beta', 'Download full multiplatform version'],
    ['Android nyilvános béta', 'Android teljes verzió'],
    ['Android public beta', 'Android full release'],
    ['Android nyilvános béta letöltése', 'Android teljes verzió letöltése'],
    ['Download Android public beta', 'Download Android full version'],
    ['NATÍV BÉTA', 'TELJES VERZIÓ'],
    ['NATIVE BETA', 'FULL RELEASE']
  ]);

  const PHRASES = [
    [/\bhivatalos nyilvános béta\b/gi, 'hivatalos teljes verzió'],
    [/\bofficial public beta\b/gi, 'official full release'],
    [/\bmultiplatform nyilvános béta\b/gi, 'teljes multiplatform verzió'],
    [/\bmultiplatform public beta\b/gi, 'full multiplatform version'],
    [/\bnyilvános béta csomag\b/gi, 'teljes multiplatform csomag'],
    [/\bpublic beta package\b/gi, 'full multiplatform package']
  ];

  let scheduled = 0;
  let applying = false;

  function replaceText(value) {
    if (!value) return value;
    const trimmed = value.trim();
    if (EXACT.has(trimmed)) {
      const leading = value.match(/^\s*/)?.[0] || '';
      const trailing = value.match(/\s*$/)?.[0] || '';
      return leading + EXACT.get(trimmed) + trailing;
    }
    let result = value;
    for (const [pattern, replacement] of PHRASES) result = result.replace(pattern, replacement);
    return result;
  }

  function safeElement(element) {
    return element instanceof Element
      && !element.closest('script,style,template,code,pre,textarea,input');
  }

  function normalizeAttributes(scope) {
    const elements = [];
    if (scope instanceof Element) elements.push(scope);
    if (scope?.querySelectorAll) elements.push(...scope.querySelectorAll('[data-hu],[data-en], [title], [aria-label]'));
    for (const element of elements) {
      if (!safeElement(element)) continue;
      for (const attribute of ['data-hu', 'data-en', 'title', 'aria-label']) {
        const current = element.getAttribute(attribute);
        const next = replaceText(current);
        if (current && next !== current) element.setAttribute(attribute, next);
      }
    }
  }

  function normalizeText(scope) {
    const walker = document.createTreeWalker(
      scope || document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return safeElement(node.parentElement)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const next = replaceText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function enforceCanonicalRelease() {
    const releaseName = document.getElementById('release-name');
    if (releaseName) {
      releaseName.dataset.hu = 'Teljes multiplatform verzió';
      releaseName.dataset.en = 'Full multiplatform version';
      releaseName.textContent = root.lang === 'en' ? releaseName.dataset.en : releaseName.dataset.hu;
    }

    const telemetryValue = document.querySelector('#hero .hero-label.b span, #hero .hero-label[data-release-telemetry] span');
    if (telemetryValue) telemetryValue.textContent = 'FULL';
    const telemetryLabel = document.querySelector('#hero .hero-label.b b, #hero .hero-label[data-release-telemetry] b');
    if (telemetryLabel) telemetryLabel.textContent = 'PUBLIC RELEASE';

    document.querySelectorAll('[data-public-release-badge]').forEach(badge => {
      badge.dataset.hu = 'TELJES VERZIÓ';
      badge.dataset.en = 'FULL RELEASE';
      badge.textContent = root.lang === 'en' ? 'FULL RELEASE' : 'TELJES VERZIÓ';
    });
  }

  function apply() {
    scheduled = 0;
    if (applying || !document.body) return;
    applying = true;
    try {
      normalizeAttributes(document.body);
      normalizeText(document.body);
      enforceCanonicalRelease();
      root.dataset.fxFullRelease = 'full-release';
      root.dataset.fxTrialDays = '5';
      root.dataset.fxFullReleaseGuard = 'ready-v1';
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (scheduled || applying) return;
    scheduled = requestAnimationFrame(apply);
  }

  const observer = new MutationObserver(schedule);
  function start() {
    apply();
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-hu', 'data-en', 'title', 'aria-label']
    });
  }

  ['formatx:languagechange', 'formatx:releasemetadataready', 'formatx:platformstatusready', 'formatx:publicshellready'].forEach(name => {
    addEventListener(name, schedule);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}());
