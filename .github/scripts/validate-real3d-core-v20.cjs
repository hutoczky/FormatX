'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const runtime = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const style = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');
const homepage = read('docs/scifi-ui/index.html');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /const SCRIPT = '\/scifi-ui\/scripts\/formatx-core-reference-v53\.js/,
  'desktop runtime path must be root-safe on the canonical apex URL');
assert.match(bootstrap, /const STYLE = '\/scifi-ui\/styles\/formatx-core-reference-v53\.css/,
  'desktop style path must be root-safe on the canonical apex URL');
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260811-reference-v53-r3/);
assert.match(bootstrap, /formatx-core-reference-v53\.css\?v=20260811-reference-v53-r3/);
assert.match(bootstrap, /single-webgl2-reference-crystal-v53/);
assert.equal((bootstrap.match(/getContext\('webgl2'/g) || []).length, 0, 'bootstrap must not create a WebGL context');

assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'v53 must own exactly one WebGL2 context creation site');
for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawArrays(gl.TRIANGLES',
  'gl.drawArrays(gl.LINES',
  'function crystal(',
  'function radius(',
  'IntersectionObserver',
  'ResizeObserver',
  'webglcontextlost',
  'sharp-four-tip-concave-crystal-v53',
  'clean-faceted-refractive-glass-v53',
  'moving-white-nucleus-concentric-spectral-rings-v53',
  'single-context-adaptive-60-plus-fps',
  'single-webgl2-reference-crystal-v53',
  'physical-triangle-ribbons-interactive-r2',
  'inside-moving-volume-r2'
]) assert.ok(runtime.includes(token), `missing v53 contract: ${token}`);

assert.doesNotMatch(runtime, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|backgroundImage/i, 'MAG must not be image-backed');
assert.doesNotMatch(runtime, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i, 'third-party scene engine is forbidden');
assert.match(runtime, /budget=mobile\?1150000:2400000/);
assert.match(runtime, /pointermove/);
assert.match(runtime, /prefers-reduced-motion/);

assert.match(style, /pointer-events:\s*none\s*!important/);
assert.match(style, /filter:\s*none\s*!important/);
assert.match(style, /min-height:\s*clamp\(500px, 58svh, 660px\)/);
assert.doesNotMatch(style, /clip-path:\s*polygon/i, 'CSS fake crystal overlay must not return');

assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
const q = contract.quality_contract;
assert.equal(q.mag_image_backed, false);
assert.equal(q.mag_webgl_context_count, 1);
assert.equal(q.mag_paused_outside_hero, true);

new Function(runtime);
new Function(bootstrap);
console.log('PASS: v53 production MAG uses one native WebGL2 sharp four-tip crystal with moving nucleus, animated spectral rings, clean mobile composition and adaptive rendering.');
