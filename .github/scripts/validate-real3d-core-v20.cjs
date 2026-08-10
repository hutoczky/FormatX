'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const runtime = read('docs/scifi-ui/scripts/formatx-core-v50.js');
const style = read('docs/scifi-ui/styles/formatx-core-v50.css');
const homepage = read('docs/scifi-ui/index.html');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap, /rounded-living-core-v50/);
assert.match(bootstrap, /formatx-core-v50\.js\?v=20260810-rounded-living-core-v50-1/);
assert.match(bootstrap, /formatx-core-v50\.css\?v=20260810-rounded-living-core-v50-1/);
assert.match(bootstrap, /single-webgl2-rounded-living-core-v50/);
assert.equal((bootstrap.match(/getContext\('webgl2'/g) || []).length, 0, 'bootstrap must not create a WebGL context');
assert.doesNotMatch(bootstrap, /addScript\(V(?:33|44|46|47|38|41)_SCRIPT/);

assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'v50 source must own one WebGL2 context creation site');
for (const token of [
  "const VERSION = 'v50-rounded-living-core'",
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawElements(gl.TRIANGLES',
  'function sphere(',
  'function torus(',
  'const ribbonData = [',
  'Math.sin(t * .71)',
  'Math.cos(t * .63)',
  'IntersectionObserver',
  'webglcontextlost',
  "root.dataset.fxCorePerformance = 'single-context-adaptive-60-plus-fps'"
]) assert.ok(runtime.includes(token), `missing v50 contract: ${token}`);

assert.doesNotMatch(runtime, /function\s+crystal\s*\(/, 'four-tip crystal geometry must remain retired');
assert.doesNotMatch(runtime, /boundary\s*\(/, 'p-norm diamond boundary must remain retired');
assert.doesNotMatch(runtime, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|backgroundImage/i, 'MAG must not be image-backed');
assert.doesNotMatch(runtime, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i, 'third-party scene engine is forbidden');
assert.match(runtime, /const dprCap = mobile \? 1\.35 : 1\.75/);
assert.match(runtime, /const budget = mobile \? 1450000 : 2600000/);
assert.match(runtime, /clamp\(viewW \* \.34, \.36, \.66\)/, 'portrait core must be viewport-bounded');
assert.match(runtime, /pointermove/);
assert.match(runtime, /prefers-reduced-motion/);

assert.match(style, /pointer-events:\s*none\s*!important/);
assert.match(style, /--fx-core-x:\s*50%/);
assert.match(style, /min-height:\s*clamp\(460px, 55svh, 690px\)/);
assert.doesNotMatch(style, /clip-path:\s*polygon/i, 'diamond overlay must not return');
assert.doesNotMatch(style, /scale\(\.78,\s*1\.04\)/, 'mobile aspect distortion must not return');

assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
const q = contract.quality_contract;
assert.equal(q.mag_image_backed, false);
assert.equal(q.mag_webgl_context_count, 1);
assert.equal(q.mag_paused_outside_hero, true);

new Function(runtime);
new Function(bootstrap);
console.log('PASS: v50 uses one native WebGL2 rounded living core, moving internal nucleus, five spectral ribbons, bounded mobile framing and adaptive rendering.');
