'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

const productionBootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const production = read('docs/scifi-ui/scripts/formatx-core-v50.js');
const productionStyle = read('docs/scifi-ui/styles/formatx-core-v50.css');
const loader = read('docs/scifi-ui/scripts/formatx-reference-core-v26.js');
const previewWebgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const previewMobile = read('docs/scifi-ui/styles/formatx-real3d-mobile-v29.css');

assert.match(productionBootstrap, /rounded-living-core-v50/);
assert.match(productionBootstrap, /formatx-core-v50\.js\?v=20260810-rounded-living-core-v50-1/);
assert.match(productionBootstrap, /formatx-core-v50\.css\?v=20260810-rounded-living-core-v50-1/);
assert.equal((productionBootstrap.match(/getContext\(['"]webgl2['"]/gi) || []).length, 0);
assert.equal((production.match(/getContext\(['"]webgl2['"]/gi) || []).length, 1);

for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawElements(gl.TRIANGLES',
  'function persp(',
  'function sphere(',
  'function torus(',
  'const ribbonData = [',
  'Math.sin(t * .71)',
  'Math.cos(t * .63)',
  'rounded-organic-glass-orb-v50',
  'moving-internal-nucleus-spectral-orbits-v50',
  'single-context-adaptive-60-plus-fps',
  'webglcontextlost'
]) assert.ok(production.includes(token), `missing: ${token}`);

assert.doesNotMatch(production, /function\s+crystal\s*\(|boundary\s*\(/, 'legacy four-tip geometry must remain retired');
assert.match(production, /const dprCap = mobile \? 1\.35 : 1\.75/);
assert.match(production, /const budget = mobile \? 1450000 : 2600000/);
assert.match(production, /clamp\(viewW \* \.34, \.36, \.66\)/);
assert.match(production, /const x = portrait \? 0 : viewW \* \.18/);
assert.doesNotMatch(production, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(production, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);

assert.match(productionStyle, /pointer-events:\s*none\s*!important/);
assert.match(productionStyle, /--fx-core-x:\s*50%/);
assert.match(productionStyle, /min-height:\s*clamp\(460px, 55svh, 690px\)/);
assert.doesNotMatch(productionStyle, /clip-path:\s*polygon/i);
assert.doesNotMatch(productionStyle, /scale\(\.78,\s*1\.04\)/);

assert.match(loader, /production-v50-rounded-living-core-authority/);
assert.match(loader, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/);
assert.match(previewWebgl, /getContext\(['"]webgl2['"]/i);
assert.match(previewWebgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.doesNotMatch(previewWebgl, /drawImage\s*\(|new\s+Image\s*\(/i);
assert.match(previewMobile, /data-fx-orbital-core="ready-v28"/);

new Function(productionBootstrap);
new Function(production);
console.log('PASS: production MAG v50 keeps one native WebGL2 rounded living core, moving nucleus, spectral ribbons and bounded desktop/mobile framing.');
