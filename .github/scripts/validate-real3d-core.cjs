'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

const productionBootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const production = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const productionStyle = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');
const previewWebgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const previewMobile = read('docs/scifi-ui/styles/formatx-real3d-mobile-v29.css');

assert.match(productionBootstrap, /reference-crystal-core-v53/);
assert.match(productionBootstrap, /formatx-core-reference-v53\.js\?v=20260811-reference-v53-r3/);
assert.match(productionBootstrap, /formatx-core-reference-v53\.css\?v=20260811-reference-v53-r3/);
assert.equal((productionBootstrap.match(/getContext\(['"]webgl2['"]/gi) || []).length, 0);
assert.equal((production.match(/getContext\(['"]webgl2['"]/gi) || []).length, 1);

for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawArrays(gl.TRIANGLES',
  'gl.drawArrays(gl.LINES',
  'function persp(',
  'function crystal(',
  'function radius(',
  'sharp-four-tip-concave-crystal-v53',
  'clean-faceted-refractive-glass-v53',
  'moving-white-nucleus-concentric-spectral-rings-v53',
  'single-webgl2-reference-crystal-v53',
  'single-context-adaptive-60-plus-fps',
  'physical-triangle-ribbons-interactive-r2',
  'inside-moving-volume-r2',
  'Math.sin(t*.71)',
  'Math.cos(t*.63)',
  'webglcontextlost'
]) assert.ok(production.includes(token), `missing: ${token}`);

assert.match(production, /budget=mobile\?1150000:2400000/);
assert.match(production, /vec3 N=normalize\(vN\),V=normalize\(-vW\)/, 'directional surface lighting is required');
assert.match(production, /sp=pow\(/, 'specular depth response is required');
assert.doesNotMatch(production, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(production, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);

assert.match(productionStyle, /pointer-events:\s*none\s*!important/);
assert.match(productionStyle, /filter:\s*none\s*!important/);
assert.match(productionStyle, /min-height:\s*clamp\(500px, 58svh, 660px\)/);
assert.doesNotMatch(productionStyle, /clip-path:\s*polygon/i);

assert.match(previewWebgl, /getContext\(['"]webgl2['"]/i);
assert.match(previewWebgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.doesNotMatch(previewWebgl, /drawImage\s*\(|new\s+Image\s*\(/i);
assert.match(previewMobile, /data-fx-orbital-core="ready-v28"/);

new Function(productionBootstrap);
new Function(production);
console.log('PASS: production MAG v53 uses one native WebGL2 renderer with a sharp four-tip shell, faceted glass, moving nucleus, animated rings and bounded desktop/mobile framing.');
