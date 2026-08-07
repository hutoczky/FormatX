"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const loader = read("docs/scifi-ui/scripts/igloo-parity.js");
const language = read("docs/scifi-ui/scripts/single-language-toggle.js");
const webgl = read("docs/scifi-ui/scripts/webgl-fallback-loader.js");
const webgpu = read("docs/scifi-ui/scripts/experience-entry.js");
const premium = read("docs/scifi-ui/scripts/formatx-premium-finish.js");
const premiumCss = read("docs/scifi-ui/styles/formatx-premium-finish.css");
const mobileRecovery = read("docs/scifi-ui/scripts/formatx-mobile-recovery.js");
const threeHost = read("docs/scifi-ui/scripts/formatx-three-host-safe.js");
const infinite = read("docs/scifi-ui/scripts/formatx-infinite-scroll.js");
const homepage = read("docs/scifi-ui/index.html");
const production = read("billing-worker/src/production-with-license.js");

assert.ok(loader.includes("timeout = setTimeout(() => finish(false, 'timeout'), 9000);"), "module timeout is missing");
assert.ok(loader.includes("root.dataset.fxTranscendProgress = '100';"), "loader completion marker is missing");
assert.ok(loader.includes("root.dataset.fxTranscendLoader = 'safe-degraded-v27';"), "loader degradation path is missing");
assert.ok(language.includes("if (event.target === container) toggle.click();"), "full language control is not clickable");
assert.ok(webgl.includes("this.maxCount = mobile ? 1200 : 2400;"), "WebGL particle cap regressed");
assert.ok(webgl.includes("} else if (false && fps > 58 && this.tier < 3) {"), "WebGL upward particle scaling is enabled");
assert.ok(webgpu.includes("this.maxCount = reduced ? 8000 : mobile ? 18000 : 32000;"), "WebGPU particle cap regressed");
assert.ok(webgpu.includes("} else if (false && fps > 108 && this.tier < 3) {"), "WebGPU upward particle scaling is enabled");
assert.ok(loader.includes("formatx-premium-finish.css?v=20260805-motion-gate-3"), "premium finish CSS is not loaded last");
assert.ok(loader.includes("formatx-premium-finish.js?v=20260805-motion-gate-3"), "premium finish runtime is missing");
assert.ok(premium.includes("a[href^=\"#\"]"), "root-safe hash navigation is missing");
assert.ok(premium.includes("history.replaceState(history.state, '', '/' + location.search + location.hash)"), "legacy homepage URL repair is missing");
assert.ok(premiumCss.includes("html[data-fx-three='error'] .fx-three-stage-shell"), "renderer failure fallback is missing");
assert.ok(premium.includes("root.dataset.fxGpuCapability = rendererCapability()"), "WebGL2 capability gate is missing");
assert.ok(premium.includes("canvas2d-living-core-v2"), "resilient Canvas2D living core is missing");
assert.ok(premium.includes("1000 / (mobile ? 30 : 60)"), "adaptive Canvas2D frame ceiling is missing");
assert.ok(premiumCss.includes(".fx-resilient-core[data-active='true']"), "resilient core visual handoff is missing");
assert.ok(homepage.includes('class="fx-immersive-launch"'), "click-to-launch living core control is missing");
assert.ok(premium.includes("root.dataset.fxImmersive !== 'active'"), "living core is not gated behind explicit activation");
assert.ok(premium.includes("formatx:immersiveactivate"), "immersive activation event is missing");
assert.ok(premium.includes("const scrolling = root.dataset.fxScrollActivity === 'scrolling'"), "Canvas2D renderer does not adapt its quality while scrolling");
assert.ok(premiumCss.includes("html[data-fx-immersive='standby'] #hero .hero-space::before"), "static FormatX identity preview is missing");
assert.ok(threeHost.includes("if (!immersiveActive() || document.hidden) return;"), "Three host still renders while inactive");
assert.ok(mobileRecovery.includes("immersiveActive() && introComplete"), "Three iframe is not protected by the activation gate");
assert.ok(infinite.includes("const VERSION = 'seamless-v6'"), "current scroll controller is missing");
assert.ok(infinite.includes("root.dataset.fxAutomaticLoop = 'disabled'"), "automatic page loop is not disabled");
assert.ok(infinite.includes("nativePositionOnly: true") && infinite.includes("jumpFree: true"), "native no-jump scroll contract is missing");
assert.ok(!infinite.includes("window.scrollTo(") && !infinite.includes("scrollIntoView("), "scroll controller must not move page position automatically");
assert.ok(!infinite.includes("cloneNode(true)"), "automatic loop clone returned");
assert.ok(!infinite.includes("addEventListener('wheel'") && !infinite.includes("addEventListener('touchmove'"), "scroll input must remain native");
assert.ok(!infinite.includes("const SETTLE_MS"), "legacy repeated scroll settling remains active");
assert.ok(mobileRecovery.includes("markFallback('webgl2-unavailable')"), "unsupported WebGL2 still reaches the iframe engine");
assert.ok(production.includes("new URL('/scifi-ui/', request.url)"), "domain root does not serve the canonical homepage asset without an asset redirect");
assert.ok(production.includes("['/scifi-ui', '/scifi-ui/']"), "safe legacy homepage normalisation is missing");
assert.ok(!production.includes("['/scifi-ui/', '/']"), "redirect-loop-prone legacy homepage redirect is present");

console.log("FormatX 110% finish validation passed.");
