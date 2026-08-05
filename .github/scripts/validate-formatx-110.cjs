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
const production = read("billing-worker/src/production-with-license.js");

assert.ok(loader.includes("timeout = setTimeout(() => finish(false, 'timeout'), 9000);"), "module timeout is missing");
assert.ok(loader.includes("root.dataset.fxTranscendProgress = '100';"), "loader completion marker is missing");
assert.ok(loader.includes("root.dataset.fxTranscendLoader = 'safe-degraded-v27';"), "loader degradation path is missing");
assert.ok(language.includes("if (event.target === container) toggle.click();"), "full language control is not clickable");
assert.ok(webgl.includes("this.maxCount = mobile ? 1200 : 2400;"), "WebGL particle cap regressed");
assert.ok(webgl.includes("} else if (false && fps > 58 && this.tier < 3) {"), "WebGL upward particle scaling is enabled");
assert.ok(webgpu.includes("this.maxCount = reduced ? 8000 : mobile ? 18000 : 32000;"), "WebGPU particle cap regressed");
assert.ok(webgpu.includes("} else if (false && fps > 108 && this.tier < 3) {"), "WebGPU upward particle scaling is enabled");
assert.ok(loader.includes("formatx-premium-finish.css?v=20260805-premium-1"), "premium finish CSS is not loaded last");
assert.ok(loader.includes("formatx-premium-finish.js?v=20260805-premium-1"), "premium finish runtime is missing");
assert.ok(premium.includes("a[href^=\"#\"]"), "root-safe hash navigation is missing");
assert.ok(premium.includes("history.replaceState(history.state, '', '/' + location.search + location.hash)"), "legacy homepage URL repair is missing");
assert.ok(premiumCss.includes("html[data-fx-three='error'] .fx-three-stage-shell"), "renderer failure fallback is missing");
assert.ok(production.includes("new URL('/scifi-ui/index.html', request.url)"), "domain root does not serve the canonical homepage asset");
assert.ok(production.includes("['/scifi-ui', '/scifi-ui/']"), "safe legacy homepage normalisation is missing");
assert.ok(!production.includes("['/scifi-ui/', '/']"), "redirect-loop-prone legacy homepage redirect is present");

console.log("FormatX 110% finish validation passed.");
