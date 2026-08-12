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
const scrollBootstrap = read("docs/scifi-ui/scripts/formatx-infinite-scroll.js");
const desktopScroll = read("docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js");
const scrollPolicy = JSON.parse(read("docs/scifi-ui/data/scroll-policy.json"));
const thoughtGenome = read("docs/scifi-ui/scripts/synaptic-thought-genome.js");
const homepage = read("docs/scifi-ui/index.html");
const production = read("billing-worker/src/production-with-license.js");

assert.ok(loader.includes("timeout = setTimeout(() => finish(false, 'timeout'), 9000);"), "module timeout is missing");
assert.ok(loader.includes("root.dataset.fxTranscendProgress = '100';"), "loader completion marker is missing");
assert.ok(loader.includes("root.dataset.fxTranscendLoader = 'safe-degraded-v28';"), "current loader degradation path is missing");
assert.ok(loader.includes("synaptic-thought-genome.js?v=20260811-current-host-v2"), "Thought Genome cache-busted production module is missing");
assert.ok(language.includes("if (event.target === container) toggle.click();"), "full language control is not clickable");
assert.ok(webgl.includes("this.maxCount = mobile ? 1200 : 2400;"), "WebGL particle cap regressed");
assert.ok(webgl.includes("} else if (false && fps > 58 && this.tier < 3) {"), "WebGL upward particle scaling is enabled");
assert.ok(webgpu.includes("this.maxCount = reduced ? 8000 : mobile ? 18000 : 32000;"), "WebGPU particle cap regressed");
assert.ok(webgpu.includes("} else if (false && fps > 108 && this.tier < 3) {"), "WebGPU upward particle scaling is enabled");
assert.ok(loader.includes("formatx-premium-finish.js?v=20260805-motion-gate-3"), "premium finish runtime is missing");
assert.ok(premium.includes("a[href^=\"#\"]"), "root-safe hash navigation is missing");
assert.ok(premium.includes("root.dataset.fxGpuCapability = rendererCapability()"), "WebGL2 capability gate is missing");
assert.ok(premium.includes("canvas2d-living-core-v2"), "resilient Canvas2D living core is missing");
assert.ok(premium.includes("1000 / (mobile ? 30 : 60)"), "adaptive Canvas2D frame ceiling is missing");
assert.ok(premiumCss.includes(".fx-resilient-core[data-active='true']"), "resilient core visual handoff is missing");
assert.ok(homepage.includes('class="fx-immersive-launch"'), "living core activation control is missing");
assert.ok(premium.includes("root.dataset.fxImmersive !== 'active'"), "living core is not gated behind activation");
assert.ok(premium.includes("formatx:immersiveactivate"), "immersive activation event is missing");
assert.ok(premium.includes("const scrolling = root.dataset.fxScrollActivity === 'scrolling'"), "Canvas2D renderer does not adapt while scrolling");
assert.ok(threeHost.includes("if (!immersiveActive() || document.hidden) return;"), "safe Three host renders while inactive");
assert.ok(mobileRecovery.includes("immersiveActive() && introComplete"), "legacy iframe path is not activation-gated");

assert.ok(scrollBootstrap.includes("platform-scroll-v2"), "platform scroll bootstrap is missing");
assert.ok(scrollBootstrap.includes("mobile-seamless-loading-v1"), "mobile seamless-v7 loading controller is missing");
assert.ok(scrollBootstrap.includes("native-momentum-loop-v1"), "mobile native-momentum loop policy marker is missing");
assert.ok(scrollBootstrap.includes("root.dataset.fxAutomaticLoop = mobile ? 'pending-mobile' : 'desktop-only'"), "mobile seamless loop handoff is missing");
assert.ok(scrollBootstrap.includes("formatx-infinite-scroll-desktop-v7.js"), "shared seamless-v7 runtime loader is missing");
assert.ok(!scrollBootstrap.includes("scrollTo(") && !scrollBootstrap.includes("scrollIntoView(") && !scrollBootstrap.includes("cloneNode("), "platform bootstrap moves or clones the page before the boundary runtime");
assert.ok(!scrollBootstrap.includes("preventDefault"), "scroll bootstrap cancels native input");
assert.ok(desktopScroll.includes("const VERSION = 'seamless-v7'"), "shared seamless-v7 controller is missing");
assert.ok(desktopScroll.includes("root.dataset.fxAutomaticLoop = 'enabled'"), "automatic seamless loop is not enabled");
assert.ok(desktopScroll.includes("visualBridge: true") && desktopScroll.includes("clonedHeroOnly: true"), "visual bridge contract is missing");
assert.ok(desktopScroll.includes("window.scrollTo(") && desktopScroll.includes("sourceHero.cloneNode(true)"), "boundary transfer implementation is missing");
assert.ok(!desktopScroll.includes("addEventListener('wheel'") && !desktopScroll.includes("addEventListener('touchmove'"), "seamless runtime owns native wheel/touch input");
assert.equal(scrollPolicy.policy.input_capture, false, "public input capture policy regressed");
assert.equal(scrollPolicy.policy.section_scroll_snap, false, "public section snap policy regressed");
assert.equal(scrollPolicy.mobile.controller, "seamless-v7", "public mobile seamless controller regressed");
assert.equal(scrollPolicy.mobile.automatic_loop, true, "public mobile infinite loop policy regressed");
assert.equal(scrollPolicy.mobile.visual_bridge, true, "public mobile visual bridge policy regressed");
assert.equal(scrollPolicy.mobile.cloned_content, false, "mobile content cloning must remain disabled");
assert.equal(scrollPolicy.mobile.cloned_hero_only, true, "mobile boundary bridge must remain hero-only");
assert.equal(scrollPolicy.mobile.boundary_handoff_only, true, "mobile automatic positioning must remain boundary-only");
assert.equal(scrollPolicy.mobile.native_momentum_preserved, true, "mobile native momentum policy regressed");
assert.equal(scrollPolicy.mobile.finite_document, false, "mobile infinite document policy regressed");
assert.equal(scrollPolicy.desktop.controller, "seamless-v7", "public desktop scroll policy regressed");
assert.equal(scrollPolicy.desktop.automatic_loop, true, "public desktop loop policy regressed");

assert.ok(thoughtGenome.includes("fxThoughtGenomeStage = 'hero-space'"), "Thought Genome current hero host fallback is missing");
assert.ok(thoughtGenome.includes("questionStored: false"), "Thought Genome privacy contract regressed");
assert.ok(!thoughtGenome.includes("style.setProperty('--fx-genome"), "Thought Genome reintroduced CSP-blocked inline styles");
assert.ok(production.includes("new URL('/scifi-ui/', request.url)"), "domain root does not serve canonical homepage asset");
assert.ok(production.includes("['/scifi-ui', '/scifi-ui/']"), "safe legacy homepage normalisation is missing");
assert.ok(!production.includes("['/scifi-ui/', '/']"), "redirect-loop-prone legacy homepage redirect is present");

console.log("FormatX current high-finish runtime validation passed.");
