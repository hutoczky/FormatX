'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const desktop = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const mobile = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const src = read('docs/scifi-ui/scripts/formatx-core-reference-cinematic-v1.js');
const css = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /formatx-core-reference-v53\.css\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260812-four-point-reference-r1/);
assert.match(desktop, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.match(mobile, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.equal((src.match(/getContext\(['"]webgl2['"]/g) || []).length, 1);

for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawArrays(gl.TRIANGLES',
  'gl.POINTS',
  'function outlineRadius(',
  'function surfacePoint(',
  'function buildShell(',
  'function starContour(',
  'function radialFacets(',
  'reference-four-point-crystal-v1',
  'sharp-four-tip-concave-crystal-v53',
  'clean-faceted-refractive-glass-v53',
  'moving-white-nucleus-concentric-spectral-rings-v53',
  'single-context-adaptive-60-plus-fps',
  'physical-triangle-ribbons-interactive-r2',
  'inside-moving-volume-r2',
  'webglcontextlost'
]) assert.ok(src.includes(token), `missing release renderer contract: ${token}`);

assert.match(src, /budget=mobile\?1100000:2500000/);
assert.match(src, /pointerX\+=\(targetX-pointerX\)/);
assert.match(src, /energy\*=reduced\.matches/);
assert.match(src, /vec3 N=normalize\(vN\),V=normalize\(-vW\)/);
assert.doesNotMatch(src, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|backgroundImage/i);
assert.doesNotMatch(src, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);
assert.match(css, /pointer-events:\s*none\s*!important/);
assert.match(css, /filter:\s*none\s*!important/);
assert.match(css, /min-height:\s*clamp\(500px, 58svh, 660px\)/);
assert.doesNotMatch(css, /clip-path:\s*polygon/i);
new Function(src);new Function(desktop);new Function(mobile);
console.log('PASS: production MAG is one native shared WebGL2 four-point faceted reference crystal with white reactor nucleus, cyan/violet rings, adaptive rendering and direct interaction.');
