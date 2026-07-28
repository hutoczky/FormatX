// Interaction patch for the FormatX WebGPU organism.
// Runs before experience-entry.js and augments the fetched engine source.
(() => {
  'use strict';

  if (window.__FORMATX_ORGANISM_INTERACTIONS__) return;
  window.__FORMATX_ORGANISM_INTERACTIONS__ = true;

  const nativeFetch = window.fetch.bind(window);
  const enginePattern = /\/ExperienceWebGPU\.js(?:\?|$)/;

  function replaceRequired(source, search, replacement, label) {
    if (!source.includes(search)) {
      throw new Error('FormatX organism interaction marker missing: ' + label);
    }
    return source.replace(search, replacement);
  }

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
    this.onCorePointerDown = event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = event.target;
      if (target && target.closest && target.closest('a,button,input,select,textarea,[contenteditable="true"],[role="button"]')) return;
      const viewportWidth = Math.max(1, parent.innerWidth || innerWidth);
      const viewportHeight = Math.max(1, parent.innerHeight || innerHeight);
      const inCoreZone = event.clientX > viewportWidth * 0.18
        && event.clientX < viewportWidth * 0.84
        && event.clientY > viewportHeight * 0.1
        && event.clientY < viewportHeight * 0.9;
      if (inCoreZone) this.clickImpulse = 1;
    };
    try {
      parent.document.addEventListener('pointerdown', this.onCorePointerDown, { passive: true });
    } catch (_) {}`,
      'interaction state'
    );

    source = replaceRequired(
      source,
      '    this.core.update(seconds, this.sceneValue, this.pointerX, this.pointerY, this.quality);',
      `    const scrollVelocity = runtimeState[INDEX.VELOCITY] || 0;
    const scrollTarget = Math.min(1, Math.abs(scrollVelocity) * 0.86);
    this.scrollImpulse += (scrollTarget - this.scrollImpulse) * (1 - Math.exp(-delta * 7.2));
    this.clickImpulse += (0 - this.clickImpulse) * (1 - Math.exp(-delta * 7.8));

    this.core.update(seconds, this.sceneValue, this.pointerX, this.pointerY, this.quality);

    // Reuse the existing organism pulse uniform, so no extra shader or render loop is required.
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
      'scroll and click reaction'
    );

    source = replaceRequired(
      source,
      "    removeEventListener('resize', this.onResize);",
      `    removeEventListener('resize', this.onResize);
    try {
      parent.document.removeEventListener('pointerdown', this.onCorePointerDown);
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
