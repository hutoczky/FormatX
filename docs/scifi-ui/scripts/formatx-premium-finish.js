(function () {
  'use strict';

  // Production deployment revision: 20260808-core-click-4.

  const root = document.documentElement;
  if (root.dataset.fxPremiumFinish === 'ready-v1') return;
  root.dataset.fxPremiumFinish = 'ready-v1';

  const parameters = new URLSearchParams(location.search);
  const auditMode = parameters.get('lighthouse') === '1';
  const automaticImmersive = parameters.get('immersive') === '1';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = ['#6feee8', '#4fc9ff', '#6fffb2', '#ffb768', '#9c82ff', '#d7f7ff'];
  let resilientCore = null;

  root.dataset.fxImmersive = automaticImmersive ? 'active' : 'standby';
  root.dataset.fxThree = automaticImmersive ? (root.dataset.fxThree || 'intro-wait') : 'standby';

  function repairLegacyHomepageUrl() {
    if (location.hostname !== 'www.formatxsuite.com') return;
    if (!['/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html'].includes(location.pathname)) return;
    history.replaceState(history.state, '', '/' + location.search + location.hash);
  }

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function rendererCapability() {
    if (auditMode) return 'audit-skip';
    if (typeof WebGL2RenderingContext === 'undefined') return 'canvas2d';
    if (document.querySelector('script[data-fx-core-real3d="true"]')) return 'webgl2-pending';

    const probe = document.createElement('canvas');
    const suppressCreationNoise = event => event.preventDefault();
    probe.addEventListener('webglcontextcreationerror', suppressCreationNoise);
    try {
      const context = probe.getContext('webgl2', {
        alpha: true,
        antialias: false,
        depth: true,
        failIfMajorPerformanceCaveat: true,
        powerPreference: 'high-performance'
      });
      if (!context || context.isContextLost()) return 'canvas2d';
      context.getExtension('WEBGL_lose_context')?.loseContext();
      return 'webgl2';
    } catch (_) {
      return 'canvas2d';
    } finally {
      probe.removeEventListener('webglcontextcreationerror', suppressCreationNoise);
    }
  }

  function ensureFallbackStatus() {
    const heroSpace = document.querySelector('#hero .hero-space');
    if (!heroSpace) return;
    let status = heroSpace.querySelector('.fx-premium-core-status');
    if (!status) {
      status = document.createElement('span');
      status.className = 'fx-premium-core-status';
      status.setAttribute('aria-live', 'polite');
      heroSpace.appendChild(status);
    }
    status.textContent = language() === 'en'
      ? 'Resilient visual core active'
      : 'Ellenálló vizuális mag aktív';
  }

  function hexToRgb(hex) {
    const value = Number.parseInt(hex.slice(1), 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }

  function createResilientCore() {
    if (auditMode || resilientCore) return resilientCore;
    const host = document.querySelector('#hero .hero-space');
    if (!host) return null;

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-resilient-core';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    canvas.dataset.fxRenderer = 'canvas2d-living-core-v2';
    host.prepend(canvas);

    const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) {
      canvas.remove();
      return null;
    }

    const state = {
      canvas,
      context,
      width: 1,
      height: 1,
      dpr: 1,
      pointerX: 0,
      pointerY: 0,
      targetX: 0,
      targetY: 0,
      scene: 0,
      targetScene: 0,
      visible: true,
      active: true,
      frame: 0,
      previous: 0
    };

    function resize() {
      const box = host.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 1.25);
      const width = Math.max(1, Math.round(box.width));
      const height = Math.max(1, Math.round(box.height));
      if (state.width === width && state.height === height && state.dpr === dpr) return;
      state.width = width;
      state.height = height;
      state.dpr = dpr;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function membranePath(cx, cy, radius, time, layer, scene) {
      const points = state.width < 520 ? 44 : 58;
      const stretch = [1.04, 1.2, 1.02, 1.08, .91, .7][Math.round(scene)] || 1;
      const height = [1.09, 1.25, .96, 1.12, 1.29, 1.5][Math.round(scene)] || 1.09;
      const path = new Path2D();
      for (let index = 0; index <= points; index += 1) {
        const angle = index / points * Math.PI * 2;
        const signal = Math.sin(angle * (3 + layer) + time * (.44 + layer * .08));
        const crossSignal = Math.cos(angle * (5 - layer * .35) - time * .31 + scene * .72);
        const heartbeat = Math.sin(time * 2.35) * (scene > 2.45 && scene < 3.55 ? .035 : .012);
        const deformation = 1 + signal * (.025 + layer * .012) + crossSignal * .017 + heartbeat;
        const x = cx + Math.cos(angle) * radius * deformation * stretch;
        const y = cy + Math.sin(angle) * radius * deformation * height;
        if (index === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.closePath();
      return path;
    }

    function drawOrbit(cx, cy, radius, time, rgb, tilt, direction) {
      context.save();
      context.translate(cx, cy);
      context.rotate(tilt);
      context.scale(1, .58);
      context.lineWidth = 1;
      context.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},.19)`;
      context.setLineDash([radius * .18, radius * .07]);
      context.lineDashOffset = time * 10 * direction;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
      context.restore();
    }

    function draw(now) {
      state.frame = 0;
      if (!state.active || !state.visible || document.hidden) return;
      const mobile = state.width < 720 || matchMedia('(pointer: coarse)').matches;
      const scrolling = root.dataset.fxScrollActivity === 'scrolling';
      const minimumInterval = reducedMotion.matches ? 1000 : 1000 / (mobile ? 30 : 60);
      if (now - state.previous < minimumInterval) {
        state.frame = requestAnimationFrame(draw);
        return;
      }
      state.previous = now;
      resize();

      const time = reducedMotion.matches ? 0 : now * .001;
      state.pointerX += (state.targetX - state.pointerX) * .075;
      state.pointerY += (state.targetY - state.pointerY) * .075;
      state.scene += (state.targetScene - state.scene) * .045;

      const width = state.width;
      const height = state.height;
      const radius = Math.min(width, height) * (width < 520 ? .245 : .285);
      const cx = width * .5 + state.pointerX * Math.min(32, width * .045);
      const cy = height * .49 + state.pointerY * Math.min(22, height * .035);
      const colourIndex = Math.max(0, Math.min(5, Math.round(state.scene)));
      const rgb = hexToRgb(palette[colourIndex]);

      context.clearRect(0, 0, width, height);

      const halo = context.createRadialGradient(cx, cy, radius * .08, cx, cy, radius * 1.75);
      halo.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},.19)`);
      halo.addColorStop(.4, `rgba(${rgb.r},${rgb.g},${rgb.b},.075)`);
      halo.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
      context.fillStyle = halo;
      context.fillRect(cx - radius * 1.8, cy - radius * 1.8, radius * 3.6, radius * 3.6);

      drawOrbit(cx, cy, radius * 1.12, time, rgb, -.2 + state.pointerX * .08, 1);
      drawOrbit(cx, cy, radius * 1.36, time, rgb, .52 + state.pointerY * .06, -1);
      drawOrbit(cx, cy, radius * 1.56, time, rgb, -.78, 1);

      context.save();
      context.globalCompositeOperation = 'screen';
      for (let layer = scrolling ? 1 : 3; layer >= 0; layer -= 1) {
        const layerRadius = radius * (1 - layer * .155);
        const path = membranePath(cx, cy, layerRadius, time, layer, state.scene);
        const fill = context.createRadialGradient(
          cx - layerRadius * .22,
          cy - layerRadius * .28,
          layerRadius * .04,
          cx,
          cy,
          layerRadius * 1.08
        );
        fill.addColorStop(0, `rgba(225,255,255,${.17 + layer * .025})`);
        fill.addColorStop(.36, `rgba(${rgb.r},${rgb.g},${rgb.b},${.1 + layer * .025})`);
        fill.addColorStop(1, `rgba(3,28,48,${.1 + layer * .018})`);
        context.fillStyle = fill;
        context.fill(path);
        context.lineWidth = layer === 0 ? 1.35 : .8;
        context.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${.24 - layer * .025})`;
        context.shadowColor = `rgba(${rgb.r},${rgb.g},${rgb.b},.34)`;
        context.shadowBlur = scrolling ? 5 : layer === 0 ? 19 : 9;
        context.stroke(path);
      }
      context.restore();

      const nucleusRadius = radius * (.16 + Math.sin(time * 1.8) * .012);
      const nucleus = context.createRadialGradient(cx - nucleusRadius * .3, cy - nucleusRadius * .35, 1, cx, cy, nucleusRadius);
      nucleus.addColorStop(0, 'rgba(238,255,255,.98)');
      nucleus.addColorStop(.3, `rgba(${rgb.r},${rgb.g},${rgb.b},.88)`);
      nucleus.addColorStop(1, `rgba(${Math.round(rgb.r * .18)},${Math.round(rgb.g * .25)},${Math.round(rgb.b * .3)},.3)`);
      context.fillStyle = nucleus;
      context.shadowColor = `rgba(${rgb.r},${rgb.g},${rgb.b},.82)`;
      context.shadowBlur = 28;
      context.beginPath();
      context.ellipse(cx, cy, nucleusRadius * .88, nucleusRadius * 1.12, state.pointerX * .12, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      const particleCount = scrolling ? 5 : state.width < 520 ? 10 : 16;
      for (let index = 0; index < particleCount; index += 1) {
        const seed = index * 9.71;
        const travel = (time * (.022 + index % 4 * .004) + index / particleCount) % 1;
        const angle = seed + time * (index % 2 ? .045 : -.038);
        const distance = radius * (1.12 + travel * .7);
        const x = cx + Math.cos(angle) * distance;
        const y = cy + Math.sin(angle) * distance * .62;
        context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${.08 + (1 - travel) * .18})`;
        context.beginPath();
        context.arc(x, y, index % 5 === 0 ? 1.5 : .75, 0, Math.PI * 2);
        context.fill();
      }

      canvas.dataset.fxRenderedFrame = String(Number(canvas.dataset.fxRenderedFrame || 0) + 1);
      canvas.dataset.fxScene = String(colourIndex);
      if (!reducedMotion.matches) state.frame = requestAnimationFrame(draw);
    }

    function schedule() {
      if (state.frame || !state.active || !state.visible || document.hidden) return;
      state.frame = requestAnimationFrame(draw);
    }

    function setActive(active) {
      state.active = active;
      canvas.dataset.active = String(active);
      if (!active && state.frame) {
        cancelAnimationFrame(state.frame);
        state.frame = 0;
      }
      if (active) schedule();
    }

    function updateScene() {
      const scene = Number(root.dataset.fxScene || root.dataset.fxThreeScene || 0);
      state.targetScene = Number.isFinite(scene) ? Math.max(0, Math.min(5, scene)) : 0;
      schedule();
    }

    host.addEventListener('pointermove', event => {
      const box = host.getBoundingClientRect();
      state.targetX = Math.max(-1, Math.min(1, (event.clientX - box.left) / Math.max(1, box.width) * 2 - 1));
      state.targetY = Math.max(-1, Math.min(1, (event.clientY - box.top) / Math.max(1, box.height) * 2 - 1));
      schedule();
    }, { passive: true });
    host.addEventListener('pointerleave', () => {
      state.targetX = 0;
      state.targetY = 0;
    }, { passive: true });

    const resizeObserver = 'ResizeObserver' in window
      ? new ResizeObserver(() => {
        resize();
        schedule();
      })
      : null;
    resizeObserver?.observe(host);

    const visibilityObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
        state.visible = Boolean(entries[0]?.isIntersecting);
        if (state.visible) schedule();
        else if (state.frame) {
          cancelAnimationFrame(state.frame);
          state.frame = 0;
        }
      }, { threshold: [0, .05] })
      : null;
    visibilityObserver?.observe(host);

    const sceneObserver = new MutationObserver(updateScene);
    sceneObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-scene', 'data-fx-three-scene'] });
    const scrollObserver = new MutationObserver(() => {
      schedule();
    });
    scrollObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-scroll-activity'] });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener?.('change', schedule);
    addEventListener('pagehide', () => {
      if (state.frame) cancelAnimationFrame(state.frame);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      sceneObserver.disconnect();
      scrollObserver.disconnect();
    }, { once: true });

    resize();
    updateScene();
    state.setActive = setActive;
    schedule();
    resilientCore = state;
    return state;
  }

  function syncRendererState() {
    if (auditMode) {
      root.dataset.fxPremiumCore = 'static-audit';
      return;
    }

    if (root.dataset.fxCoreReal3d === 'ready-v20') {
      root.dataset.fxPremiumCore = 'single-webgl2-real3d';
      resilientCore?.setActive(false);
      return;
    }

    if (root.dataset.fxImmersive !== 'active') {
      root.dataset.fxPremiumCore = 'static-standby';
      resilientCore?.setActive(false);
      return;
    }

    const capability = root.dataset.fxGpuCapability;
    const currentState = root.dataset.fxThree || 'intro-wait';
    const engineReady = capability === 'webgl2' && currentState === 'ready';
    const hardFallback = capability === 'canvas2d' || currentState === 'error' || currentState === 'fallback';
    const core = createResilientCore();

    root.dataset.fxPremiumCore = engineReady
      ? 'realtime-3d'
      : hardFallback ? 'canvas2d-resilient' : 'canvas2d-warmup';
    core?.setActive(!engineReady);

    const frame = document.getElementById('fx-three-frame');
    if (frame instanceof HTMLIFrameElement) {
      frame.setAttribute('aria-hidden', 'true');
      if (hardFallback && frame.getAttribute('src') !== 'about:blank') frame.src = 'about:blank';
    }
    if (hardFallback) ensureFallbackStatus();
  }

  function handleCoreFallback(event) {
    root.dataset.fxGpuCapability = 'canvas2d';
    root.dataset.fxThree = 'fallback';
    root.dataset.fxImmersive = 'active';
    root.dataset.fxPremiumFallbackReason = event?.detail?.reason || 'real3d-unavailable';
    syncRendererState();
  }

  function updateLaunchCopy() {
    const button = document.querySelector('.fx-immersive-launch');
    if (!(button instanceof HTMLButtonElement)) return;
    button.setAttribute('aria-label', language() === 'en'
      ? 'Launch the living visual core'
      : 'Az élő vizuális mag indítása');
  }

  function activateImmersive(source = 'direct') {
    if (auditMode) return;
    const wasActive = root.dataset.fxImmersive === 'active';
    root.dataset.fxImmersive = 'active';
    if (!wasActive || !root.dataset.fxThree || root.dataset.fxThree === 'standby') {
      root.dataset.fxThree = root.dataset.fxGpuCapability === 'canvas2d' ? 'fallback' : 'intro-wait';
    }
    root.dataset.fxCoreActivation = source;
    const button = document.querySelector('.fx-immersive-launch');
    if (button instanceof HTMLButtonElement) {
      button.setAttribute('aria-pressed', 'true');
      button.disabled = true;
    }
    syncRendererState();
    dispatchEvent(new CustomEvent('formatx:immersiveactivate', {
      detail: {
        capability: root.dataset.fxGpuCapability,
        source,
        reactivation: wasActive
      }
    }));
  }

  function coreActivationHit(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('.fx-immersive-launch, [data-organ-node="0"]')) return true;

    const host = document.querySelector('#hero .hero-space');
    if (!host) return false;
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return false;

    const interactive = target?.closest('a,button,input,select,textarea,summary,[role="button"]');
    if (interactive) return false;

    const dx = event.clientX - (rect.left + rect.width * .5);
    const dy = event.clientY - (rect.top + rect.height * .5);
    const radius = Math.min(rect.width, rect.height) * .31;
    return dx * dx + dy * dy <= radius * radius;
  }

  function handleCoreActivation(event) {
    if (auditMode || root.dataset.fxImmersive === 'active') return;
    if (event.type === 'click' && event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!coreActivationHit(event)) return;
    activateImmersive(event.target instanceof Element && event.target.closest('[data-organ-node="0"]')
      ? 'core-node'
      : 'core-pointer');
  }

  function bindImmersiveLaunch() {
    const button = document.querySelector('.fx-immersive-launch');
    if (button instanceof HTMLButtonElement && button.dataset.fxBound !== 'true') {
      button.dataset.fxBound = 'true';
      button.addEventListener('click', () => activateImmersive('launch-button'));
    }

    const coreNode = document.querySelector('[data-organ-node="0"]');
    if (coreNode instanceof HTMLAnchorElement && coreNode.dataset.fxCoreActivationBound !== 'true') {
      coreNode.dataset.fxCoreActivationBound = 'true';
      coreNode.addEventListener('click', () => activateImmersive('core-node'));
      coreNode.setAttribute('aria-label', language() === 'en'
        ? 'Core — launch the living visual core'
        : 'Mag — az élő vizuális mag indítása');
    }
    updateLaunchCopy();
  }

  function handleHashNavigation(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;
    let target = null;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (_) {
      return;
    }
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    history.pushState({}, '', location.pathname + location.search + hash);
  }

  root.dataset.fxGpuCapability = rendererCapability();
  if (automaticImmersive && root.dataset.fxGpuCapability === 'canvas2d') root.dataset.fxThree = 'fallback';

  const rendererObserver = new MutationObserver(syncRendererState);
  rendererObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-three', 'data-fx-scene', 'lang'] });
  repairLegacyHomepageUrl();
  document.addEventListener('click', handleCoreActivation, true);
  document.addEventListener('click', handleHashNavigation, true);
  addEventListener('formatx:languagechange', () => {
    updateLaunchCopy();
    const coreNode = document.querySelector('[data-organ-node="0"]');
    if (coreNode instanceof HTMLAnchorElement) coreNode.setAttribute('aria-label', language() === 'en'
      ? 'Core — launch the living visual core'
      : 'Mag — az élő vizuális mag indítása');
    if (root.dataset.fxImmersive === 'active') ensureFallbackStatus();
  });
  addEventListener('formatx:premiumfallback', syncRendererState);
  addEventListener('formatx:core3dfallback', handleCoreFallback);
  addEventListener('formatx:coremesh3dready', syncRendererState);
  const initialise = () => {
    bindImmersiveLaunch();
    syncRendererState();
    if (automaticImmersive) dispatchEvent(new CustomEvent('formatx:immersiveactivate', {
      detail: { capability: root.dataset.fxGpuCapability, automatic: true }
    }));
  };
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', initialise, { once: true })
    : initialise();
}());
