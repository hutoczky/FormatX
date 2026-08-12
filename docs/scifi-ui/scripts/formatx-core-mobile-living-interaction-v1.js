(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'mobile-living-interaction-v1';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  if (root.dataset.fxCoreMobileLivingInteraction === VERSION) return;
  root.dataset.fxCoreMobileLivingInteraction = 'booting-v1';

  let svg = null;
  let stage = null;
  let halo = null;
  let crystal = null;
  let volume = null;
  let facets = null;
  let filaments = null;
  let reactor = null;
  let floor = null;
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let energy = 0.18;
  let targetEnergy = 0.18;
  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;
  let burst = 0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function injectStyle() {
    if (document.getElementById('fx-mobile-living-interaction-v1-style')) return;
    const style = document.createElement('style');
    style.id = 'fx-mobile-living-interaction-v1-style';
    style.textContent = `
      @media (max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25) {
        .fx-core-fidelity-v61 .fx61-filaments path {
          stroke-dasharray: 26 18;
          animation: fx61-filament-flow 4.8s linear infinite;
        }
        .fx-core-fidelity-v61 .fx61-filaments path:nth-child(2n) { animation-duration: 6.2s; animation-direction: reverse; }
        .fx-core-fidelity-v61 .fx61-filaments path:nth-child(3n) { animation-duration: 7.4s; }
        .fx-core-fidelity-v61 .fx61-crystal > path:nth-child(2) {
          animation: fx61-edge-breathe 2.8s ease-in-out infinite;
        }
        .fx-core-fidelity-v61 .fx61-facets {
          animation: fx61-facet-breathe 3.6s ease-in-out infinite;
        }
        .fx-core-fidelity-v61 .fx61-floor {
          animation: fx61-floor-breathe 4.6s ease-in-out infinite;
        }
        @keyframes fx61-filament-flow { to { stroke-dashoffset: -176; } }
        @keyframes fx61-edge-breathe { 0%,100% { stroke-opacity:.64 } 50% { stroke-opacity:.98 } }
        @keyframes fx61-facet-breathe { 0%,100% { opacity:.74 } 50% { opacity:1 } }
        @keyframes fx61-floor-breathe { 0%,100% { opacity:.30 } 50% { opacity:.52 } }
      }
      @media (prefers-reduced-motion: reduce) {
        .fx-core-fidelity-v61 .fx61-filaments path,
        .fx-core-fidelity-v61 .fx61-crystal > path:nth-child(2),
        .fx-core-fidelity-v61 .fx61-facets,
        .fx-core-fidelity-v61 .fx61-floor { animation:none!important; }
      }
    `;
    document.head.appendChild(style);
  }

  function bindNodes() {
    stage = document.querySelector('#hero .hero-space > .fx-core-mobile-v55-stage');
    svg = stage?.querySelector(':scope > .fx-core-fidelity-v61') || null;
    if (!svg) return false;
    halo = svg.querySelector('.fx61-halo-rings');
    crystal = svg.querySelector('.fx61-crystal');
    volume = svg.querySelector('.fx61-crystal-volume');
    facets = svg.querySelector('.fx61-facets');
    filaments = svg.querySelector('.fx61-filaments');
    reactor = svg.querySelector('.fx61-reactor-rings');
    floor = svg.querySelector('.fx61-floor');
    [halo, crystal, volume, facets, filaments, reactor, floor].forEach(node => {
      if (!node) return;
      node.style.transformBox = 'fill-box';
      node.style.transformOrigin = 'center';
      node.style.willChange = 'transform,opacity,filter';
    });
    return true;
  }

  function addWave(strength) {
    if (!svg) return;
    const ns = 'http://www.w3.org/2000/svg';
    const wave = document.createElementNS(ns, 'circle');
    wave.setAttribute('cx', '500');
    wave.setAttribute('cy', '600');
    wave.setAttribute('r', '74');
    wave.setAttribute('fill', 'none');
    wave.setAttribute('stroke', strength > .75 ? '#ffffff' : '#62efff');
    wave.setAttribute('stroke-width', strength > .75 ? '4.2' : '3');
    wave.setAttribute('stroke-opacity', '.9');
    wave.style.transformBox = 'fill-box';
    wave.style.transformOrigin = 'center';
    svg.appendChild(wave);
    const animation = wave.animate([
      { transform: 'scale(.72)', opacity: .95 },
      { transform: `scale(${1.95 + strength * .85})`, opacity: 0 }
    ], { duration: 620 + strength * 280, easing: 'cubic-bezier(.12,.72,.18,1)' });
    animation.addEventListener('finish', () => wave.remove(), { once: true });
  }

  function onCoreInteraction(event) {
    const d = event.detail || {};
    if (Number.isFinite(d.x)) tx = clamp(d.x, -1, 1);
    if (Number.isFinite(d.y)) ty = clamp(d.y, -1, 1);

    if (d.phase === 'hover') targetEnergy = Math.max(targetEnergy, .42);
    if (d.phase === 'press') {
      targetEnergy = 1;
      burst = 1;
      addWave(.78);
    }
    if (d.phase === 'drag') targetEnergy = Math.max(targetEnergy, .84);
    if (d.phase === 'burst' || d.phase === 'press-sustain') {
      targetEnergy = 1.18;
      burst = 1.25;
      addWave(1);
    }
    if (d.phase === 'release' || d.phase === 'cancel') {
      targetEnergy = .28;
      tx *= .45;
      ty *= .45;
    }
  }

  function onPointerMove(event) {
    if (!stage?.isConnected) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    tx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    ty = clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1, 1);
    if (event.pointerType === 'touch' && event.buttons) targetEnergy = Math.max(targetEnergy, .72);
  }

  function render(now) {
    raf = 0;
    if (!visible || !svg?.isConnected) return;

    const dt = Math.min(40, Math.max(0, now - last));
    last = now;
    const lerp = 1 - Math.pow(.0015, dt / 1000);
    const slow = 1 - Math.pow(.035, dt / 1000);
    px += (tx - px) * lerp;
    py += (ty - py) * lerp;
    energy += (targetEnergy - energy) * lerp;
    burst *= Math.pow(.10, dt / 1000);
    targetEnergy += (.18 - targetEnergy) * slow;
    tx *= Math.pow(.14, dt / 1000);
    ty *= Math.pow(.14, dt / 1000);

    const t = now * .001;
    const motion = reducedMotion.matches ? .18 : 1;
    const swayX = px * 10 * motion;
    const swayY = -py * 8 * motion;
    const pulse = Math.sin(t * 2.15) * .5 + .5;
    const coreScale = 1 + (.006 + energy * .014 + burst * .012) * pulse;

    if (halo) {
      const rot = reducedMotion.matches ? 0 : t * 3.2;
      halo.style.transform = `translate(${swayX * .18}px,${swayY * .18}px) rotate(${rot}deg)`;
      halo.style.opacity = String(.68 + energy * .13);
    }
    if (volume) {
      volume.style.transform = `translate(${swayX * .42}px,${swayY * .42}px) scale(${coreScale})`;
      volume.style.opacity = String(.88 + Math.min(.12, energy * .08));
    }
    if (crystal) {
      crystal.style.transform = `translate(${swayX * .58}px,${swayY * .58}px) scale(${1 + energy * .004})`;
    }
    if (facets) {
      facets.style.transform = `translate(${swayX * .78}px,${swayY * .78}px) skew(${px * .42}deg,${-py * .32}deg)`;
    }
    if (filaments) {
      filaments.style.transform = `translate(${swayX}px,${swayY}px) scale(${1 + energy * .006})`;
      filaments.style.opacity = String(.74 + Math.min(.26, energy * .18));
    }
    if (reactor) {
      const rot = reducedMotion.matches ? 0 : -(t * (18 + energy * 12 + burst * 14));
      const s = 1 + energy * .018 + burst * .022 + pulse * .006;
      reactor.style.transform = `translate(${swayX * .24}px,${swayY * .24}px) rotate(${rot}deg) scale(${s})`;
      reactor.style.filter = `brightness(${1.02 + energy * .28 + burst * .2}) saturate(${1.02 + energy * .18})`;
    }
    if (floor) {
      floor.style.transform = `translate(${swayX * .12}px,${Math.abs(swayY) * .08}px) scaleX(${1 + energy * .012})`;
    }

    raf = requestAnimationFrame(render);
  }

  function startLoop() {
    if (!raf && visible && svg?.isConnected) {
      last = performance.now();
      raf = requestAnimationFrame(render);
    }
  }

  function boot(attempt = 0) {
    injectStyle();
    if (!bindNodes()) {
      if (attempt < 240) {
        requestAnimationFrame(() => boot(attempt + 1));
        return;
      }
      root.dataset.fxCoreMobileLivingInteraction = 'stage-unavailable-v1';
      return;
    }

    root.dataset.fxCoreMobileLivingInteraction = VERSION;
    root.dataset.fxCoreAnimation = 'continuous-living-motion-v1';
    root.dataset.fxCoreInteractionVisual = 'touch-drag-energy-parallax-v1';

    const hero = document.getElementById('hero');
    if ('IntersectionObserver' in window && hero) {
      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible) startLoop();
        else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      }, { rootMargin: '20% 0px 20% 0px', threshold: .01 });
      observer.observe(hero);
    }

    addEventListener('formatx:coreinteraction', onCoreInteraction, { passive: true });
    addEventListener('pointermove', onPointerMove, { passive: true });
    addEventListener('pointerdown', onPointerMove, { passive: true });
    addEventListener('pageshow', () => { targetEnergy = .24; startLoop(); }, { passive: true });
    reducedMotion.addEventListener?.('change', startLoop);

    startLoop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(), { once: true });
  else boot();
}());
