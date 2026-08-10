'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const runtime = read('docs/scifi-ui/scripts/formatx-core-v51.js');
const style = read('docs/scifi-ui/styles/formatx-core-v51.css');
const homepage = read('docs/scifi-ui/index.html');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap, /reference-crystal-core-v51/);
assert.match(bootstrap, /formatx-core-v51\.js\?v=20260810-reference-crystal-v51-1/);
assert.match(bootstrap, /formatx-core-v51\.css\?v=20260810-reference-crystal-v51-1/);
assert.match(bootstrap, /single-webgl2-reference-crystal-v51/);
assert.equal((bootstrap.match(/getContext\('webgl2'/g) || []).length, 0, 'bootstrap must not create a WebGL context');
assert.doesNotMatch(bootstrap, /addScript\(V(?:33|44|46|47|38|41)_SCRIPT/);

assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'v51 source must own one WebGL2 context creation site');
for (const token of [
  "const VERSION = 'v51-reference-crystal-core'",
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawElements(gl.TRIANGLES',
  'gl.drawArrays(gl.LINES',
  'function crystal(',
  'function starRadius(',
  'function sphere(',
  'function torus(',
  'const ringData = [',
  'Math.sin(t * .71)',
  'Math.cos(t * .63)',
  'IntersectionObserver',
  'webglcontextlost',
  "root.dataset.fxCorePerformance = 'single-context-adaptive-60-plus-fps'"
]) assert.ok(runtime.includes(token), `missing v51 contract: ${token}`);

assert.match(runtime, /sharp-four-tip-concave-crystal-v51/);
assert.match(runtime, /layered-faceted-refractive-glass-v51/);
assert.match(runtime, /moving-white-nucleus-concentric-spectral-rings-v51/);
assert.doesNotMatch(runtime, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|backgroundImage/i, 'MAG must not be image-backed');
assert.doesNotMatch(runtime, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i, 'third-party scene engine is forbidden');
assert.match(runtime, /const dprCap = mobile \? 1\.30 : 1\.70/);
assert.match(runtime, /const budget = mobile \? 1350000 : 2500000/);
assert.match(runtime, /clamp\(w \* \.00134, \.46, \.60\)/, 'portrait crystal must be viewport-bounded');
assert.match(runtime, /pointermove/);
assert.match(runtime, /prefers-reduced-motion/);

assert.match(style, /pointer-events:\s*none\s*!important/);
assert.match(style, /--fx-core-x:\s*50%/);
assert.match(style, /min-height:\s*clamp\(540px, 61svh, 820px\)/);
assert.doesNotMatch(style, /clip-path:\s*polygon/i, 'CSS fake crystal overlay must not return');

assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
const q = contract.quality_contract;
assert.equal(q.mag_image_backed, false);
assert.equal(q.mag_webgl_context_count, 1);
assert.equal(q.mag_paused_outside_hero, true);

new Function(runtime);
new Function(bootstrap);
console.log('PASS: v51 uses one native WebGL2 sharp four-tip faceted reference crystal, moving white nucleus, concentric spectral rings, bounded mobile framing and adaptive rendering.');
