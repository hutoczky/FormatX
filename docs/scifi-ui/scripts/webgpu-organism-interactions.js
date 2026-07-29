// Interaction and performance patch for the FormatX WebGPU organism.
// Runs before experience-entry.js and augments the fetched engine source.
(() => {
  'use strict';

  if (window.__FORMATX_ORGANISM_INTERACTIONS__) return;
  window.__FORMATX_ORGANISM_INTERACTIONS__ = true;

  const PARTICLE_BUDGET_RATIO = 0.35;
  const nativeFetch = window.fetch.bind(window);
  const enginePattern = /\/ExperienceWebGPU\.js(?:\?|$)/;

  function installMobileScrollPriority() {
    try {
      const documentRef = parent.document;
      if (!documentRef.querySelector('link[data-fx-mobile-scroll-style]')) {
        const link = documentRef.createElement('link');
        link.rel = 'stylesheet';
        link.href = './styles/formatx-mobile-scroll.css?v=20260729-mobile-scroll-1';
        link.dataset.fxMobileScrollStyle = 'true';
        documentRef.head.appendChild(link);
      }
      documentRef.documentElement.dataset.fxMobileScroll = 'native-pan-y';
    } catch (_) {}
  }

  function replaceRequired(source, search, replacement, label) {
    if (!source.includes(search)) {
      throw new Error('FormatX organism interaction marker missing: ' + label);
    }
    return source.replace(search, replacement);
  }

  installMobileScrollPriority();

  window.fetch = async function formatXInteractionFetch(input, init) {
    const response = await nativeFetch(input, init);
    const requestUrl = typeof input === 'string'
      ? input
      : input instanceof Request
        ? input.url
        : String(input || '');

    if (!response.ok || !enginePattern.test(requestUrl)) return response;

    let source = await response.text();

    source = replaceRequired(
      source,
      '    this.onPageHide = () => this.dispose();',
      `    this.onPageHide = () => this.dispose();
    this.scrollImpulse = 0;
    this.clickImpulse = 0;
    this.tapCandidate = null;
    this.mobileTouchRouting = matchMedia('(pointer: coarse), (max-width: 900px)').matches;

    this.onCorePointerDown = event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = event.target;
      if (target && target.closest && target.closest('a,button,input,select,textarea,[contenteditable="true"],[role="button"]')) {
        this.tapCandidate = null;
        return;
      }
      this.tapCandidate = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
        moved: false
      };
    };

    this.onMobilePointerMoveCapture = event => {
      if (!this.mobileTouchRouting || event.pointerType !== 'touch') return;
      const candidate = this.tapCandidate;
      if (candidate && candidate.id === event.pointerId) {
        if (Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y) > 6) candidate.moved = true;
      }
      // Do not cancel the browser default. Only stop the old 3D drag listener.
      event.stopImmediatePropagation();
    };

    this.onCorePointerMove = event => {
      const candidate = this.tapCandidate;
      if (!candidate || candidate.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y) > 12) {
        candidate.moved = true;
      }
    };

    this.onCorePointerUp = event => {
      const candidate = this.tapCandidate;
      if (!candidate || candidate.id !== event.pointerId) return;
      this.tapCandidate = null;
      const travel = Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y);
      if (candidate.moved || travel > 12 || performance.now() - candidate.startedAt > 450) return;
      const viewportWidth = Math.max(1, parent.innerWidth || innerWidth);
      const viewportHeight = Math.max(1, parent.innerHeight || innerHeight);
      const inCoreZone = event.clientX > viewportWidth * 0.18
        && event.clientX < viewportWidth * 0.84
        && event.clientY > viewportHeight * 0.1
        && event.clientY < viewportHeight * 0.9;
      if (inCoreZone) this.clickImpulse = 1;
    };

    this.onCorePointerCancel = event => {
      if (this.tapCandidate && this.tapCandidate.id === event.pointerId) this.tapCandidate = null;
    };

    this.onLoop = () => {
      this.scrollImpulse = 0;
      this.clickImpulse = 0;
      this.sceneValue = 0;
      this.scrollValue = 0;
      this.pointerVX = 0;
      this.pointerVY = 0;
      if (this.particles && typeof this.particles.reset === 'function') this.particles.reset();
      try {
        parent.document.documentElement.dataset.fxParticleLoopReset = String(Date.now());
      } catch (_) {}
    };

    try {
      parent.addEventListener('pointermove', this.onMobilePointerMoveCapture, { capture: true, passive: true });
      parent.document.addEventListener('pointerdown', this.onCorePointerDown, { passive: true });
      parent.document.addEventListener('pointermove', this.onCorePointerMove, { passive: true });
      parent.document.addEventListener('pointerup', this.onCorePointerUp, { passive: true });
      parent.document.addEventListener('pointercancel', this.onCorePointerCancel, { passive: true });
      parent.addEventListener('formatx:loop', this.onLoop);
    } catch (_) {}`,
      'tap, scroll and loop interaction state'
    );

    source = replaceRequired(
      source,
      '    this.maxCount = reduced ? 60000 : mobile ? 260000 : 500000;',
      `    this.maxCount = reduced ? 60000 : mobile ? 260000 : 500000;
    this.particleBudget = Math.max(1, Math.floor(this.maxCount * ${PARTICLE_BUDGET_RATIO}));`,
      'fixed particle budget'
    );

    source = replaceRequired(
      source,
      "    this.positions = instancedArray(this.maxCount, 'vec3');",
      "    this.positions = instancedArray(this.particleBudget, 'vec3');",
      'particle position buffer budget'
    );
    source = replaceRequired(
      source,
      "    this.velocities = instancedArray(this.maxCount, 'vec3');",
      "    this.velocities = instancedArray(this.particleBudget, 'vec3');",
      'particle velocity buffer budget'
    );
    source = replaceRequired(
      source,
      "    this.seeds = instancedArray(this.maxCount, 'vec4');",
      "    this.seeds = instancedArray(this.particleBudget, 'vec4');",
      'particle seed buffer budget'
    );
    source = replaceRequired(
      source,
      "    })().compute(this.maxCount).setName('FormatX particle initialization');",
      "    })().compute(this.particleBudget).setName('FormatX particle initialization');",
      'particle initialization budget'
    );
    source = replaceRequired(
      source,
      '    this.computeNodes = this.counts.map(count => updateFn().compute(count).setName(`FormatX particle update ${count}`));',
      `    this.computeNodes = this.counts.map(count => {
      const budgetCount = Math.max(1, Math.floor(count * ${PARTICLE_BUDGET_RATIO}));
      return updateFn().compute(budgetCount).setName(\`FormatX particle update \${budgetCount}\`);
    });`,
      'particle compute budget'
    );
    source = replaceRequired(
      source,
      '    this.sprite.count = this.counts[1];',
      `    this.sprite.count = Math.max(1, Math.floor(this.counts[1] * ${PARTICLE_BUDGET_RATIO}));`,
      'initial visible particle budget'
    );
    source = replaceRequired(
      source,
      '    this.sprite.count = this.counts[this.tier];',
      `    this.sprite.count = Math.max(1, Math.floor(this.counts[this.tier] * ${PARTICLE_BUDGET_RATIO}));`,
      'tier visible particle budget'
    );

    source = replaceRequired(
      source,
      '  dispose() {\n    this.sprite.material.dispose();',
      `  reset() {
    this.renderer.compute(this.computeInit);
  }

  dispose() {
    this.sprite.material.dispose();`,
      'particle field loop reset method'
    );

    source = replaceRequired(
      source,
      '    this.core.update(seconds, this.sceneValue, this.pointerX, this.pointerY, this.quality);',
      `    const scrollVelocity = runtimeState[INDEX.VELOCITY] || 0;
    const scrollTarget = Math.min(1, Math.abs(scrollVelocity) * 0.86);
    this.scrollImpulse += (scrollTarget - this.scrollImpulse) * (1 - Math.exp(-delta * 7.2));
    this.clickImpulse += (0 - this.clickImpulse) * (1 - Math.exp(-delta * 7.8));

    this.core.update(seconds, this.sceneValue, this.pointerX, this.pointerY, this.quality);

    // Reuse existing uniforms and the current WebGPU frame; no extra render loop.
    this.core.pulse.value = Math.min(
      1.85,
      this.core.pulse.value + this.scrollImpulse * 0.34 + this.clickImpulse * 0.92
    );
    this.core.explode.value += this.clickImpulse * 0.16;

    const reactionScale = 1 + this.scrollImpulse * 0.032 + this.clickImpulse * 0.068;
    this.core.group.scale.multiplyScalar(reactionScale);

    const interactionFollow = Math.min(1, delta * 6.2);
    const targetDepth = -this.scrollImpulse * 0.3 - this.clickImpulse * 0.09;
    this.core.group.position.z += (targetDepth - this.core.group.position.z) * interactionFollow;
    this.core.group.rotation.y += (
      this.clickImpulse * 0.2 + Math.max(-0.16, Math.min(0.16, scrollVelocity * 0.08))
      - this.core.group.rotation.y
    ) * interactionFollow;`,
      'scroll and tap reaction'
    );

    source = replaceRequired(
      source,
      "    removeEventListener('resize', this.onResize);",
      `    removeEventListener('resize', this.onResize);
    try {
      parent.removeEventListener('pointermove', this.onMobilePointerMoveCapture, true);
      parent.document.removeEventListener('pointerdown', this.onCorePointerDown);
      parent.document.removeEventListener('pointermove', this.onCorePointerMove);
      parent.document.removeEventListener('pointerup', this.onCorePointerUp);
      parent.document.removeEventListener('pointercancel', this.onCorePointerCancel);
      parent.removeEventListener('formatx:loop', this.onLoop);
    } catch (_) {}`,
      'interaction cleanup'
    );

    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/javascript; charset=utf-8');
    return new Response(source, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
})();
