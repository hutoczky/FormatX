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

assert.ok(loader.includes("timeout = setTimeout(() => finish(false, 'timeout'), 9000);"), "module timeout is missing");
assert.ok(loader.includes("root.dataset.fxTranscendProgress = '100';"), "loader completion marker is missing");
assert.ok(loader.includes("root.dataset.fxTranscendLoader = 'safe-degraded-v27';"), "loader degradation path is missing");
assert.ok(language.includes("if (event.target === container) toggle.click();"), "full language control is not clickable");
assert.ok(webgl.includes("this.maxCount = mobile ? 1800 : 3500;"), "WebGL particle cap regressed");
assert.ok(webgl.includes("} else if (false && fps > 58 && this.tier < 3) {"), "WebGL upward particle scaling is enabled");
assert.ok(webgpu.includes("this.maxCount = reduced ? 18000 : mobile ? 60000 : 100000;"), "WebGPU particle cap regressed");
assert.ok(webgpu.includes("} else if (false && fps > 108 && this.tier < 3) {"), "WebGPU upward particle scaling is enabled");

console.log("FormatX 110% finish validation passed.");
