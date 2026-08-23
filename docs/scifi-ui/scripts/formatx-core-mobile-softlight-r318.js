(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCoreSoftlightR318) return;

  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  if (!mobile) {
    root.dataset.fxCoreSoftlightR318 = 'desktop-skip';
    root.dataset.fxCoreSoftlightOwnershipR321 = 'desktop-unchanged';
    root.dataset.fxCoreBiolumeR323 = 'desktop-skip';
    return;
  }

  root.dataset.fxCoreSoftlightR318 = 'shader-tuned-r319';
  root.dataset.fxCoreRimProfileR318 = 'broader-softer-low-intensity-fresnel';
  root.dataset.fxCoreGlowProfileR318 = 'balanced-mobile-perimeter-and-core';
  root.dataset.fxCoreSoftlightOwnershipR321 = 'native-r317-source-no-prototype-patch';
  root.dataset.fxCoreSoftlightCompatibilityR321 = 'r319-markers-preserved';
  root.dataset.fxCoreBiolumeR323 = 'booting';

  const NS = 'http://www.w3.org/2000/svg';
  const PATH = 'M50 3 C55 21 67 38 85 49 C66 54 56 74 50 97 C44 74 34 54 15 49 C33 38 45 21 50 3 Z';

  function el(name, attrs) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function makePath(className) {
    return el('path', {
      d: PATH,
      class: className,
      pathLength: '100'
    });
  }

  function install() {
    const stage = document.querySelector('#hero .fx-core-r317-stage');
    if (!(stage instanceof HTMLElement)) return false;
    if (stage.querySelector('.fx-core-biolume-r323')) {
      root.dataset.fxCoreBiolumeR323 = 'ready';
      return true;
    }

    const svg = el('svg', {
      class: 'fx-core-biolume-r323',
      viewBox: '0 0 100 100',
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
      focusable: 'false'
    });

    const defs = el('defs');
    const gradient = el('linearGradient', {
      id: 'fx-biolume-gradient-r323',
      x1: '0%', y1: '0%', x2: '100%', y2: '100%'
    });
    gradient.append(
      el('stop', { offset: '0%', 'stop-color': '#71ffd0', 'stop-opacity': '.55' }),
      el('stop', { offset: '28%', 'stop-color': '#75f7ff', 'stop-opacity': '.86' }),
      el('stop', { offset: '58%', 'stop-color': '#5aa7ff', 'stop-opacity': '.68' }),
      el('stop', { offset: '82%', 'stop-color': '#9a7bff', 'stop-opacity': '.72' }),
      el('stop', { offset: '100%', 'stop-color': '#71ffd0', 'stop-opacity': '.55' })
    );
    defs.appendChild(gradient);

    svg.append(
      defs,
      makePath('fx-biolume-halo'),
      makePath('fx-biolume-base'),
      makePath('fx-biolume-runner-a'),
      makePath('fx-biolume-runner-b'),
      makePath('fx-biolume-runner-c')
    );

    stage.appendChild(svg);
    root.dataset.fxCoreBiolumeR323 = 'ready';
    root.dataset.fxCoreBiolumeProfileR323 = 'deep-water-iridescent-traveling-rim';
    return true;
  }

  function arm() {
    if (install()) return;
    const hero = document.getElementById('hero');
    if (!(hero instanceof HTMLElement)) {
      setTimeout(arm, 120);
      return;
    }
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(hero, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      install();
    }, 9000);
  }

  addEventListener('formatx:real3dready', install, { passive: true });
  addEventListener('pageshow', install, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arm, { once: true });
  } else {
    arm();
  }
}());