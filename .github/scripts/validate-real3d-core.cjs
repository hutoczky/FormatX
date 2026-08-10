'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

const productionBootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const production = read('docs/scifi-ui/scripts/formatx-core-v51.js');
const productionStyle = read('docs/scifi-ui/styles/formatx-core-v51.css');
const previewWebgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const previewMobile = read('docs/scifi-ui/styles/formatx-real3d-mobile-v29.css');

assert.match(productionBootstrap, /reference-crystal-core-v51/);
assert.match(productionBootstrap, /formatx-core-v51\.js\?v=20260810-reference-crystal-v51-1/);
assert.match(productionBootstrap, /formatx-core-v51\.css\?v=20260810-reference-crystal-v51-1/);
assert.doesNotMatch(productionBootstrap, /addScript\([^\n]*formatx-core-v50/i);
assert.equal((productionBootstrap.match(/getContext\(['"]webgl2['"]/gi) || []).length, 0);
assert.equal((production.match(/getContext\(['"]webgl2['"]/gi) || []).length, 1);

for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawElements(gl.TRIANGLES',
  'gl.drawArrays(gl.LINES',
  'function persp(',
  'function crystal(',
  'function starRadius(',
  'function sphere(',
  'function torus(',
  'function halfDepth(',
  'gl.cullFace(gl.FRONT)',
  'gl.cullFace(gl.BACK)',
  'addQuad(of0,ob0,ob1,of1,false)',
  'addQuad(ib0,if0,if1,ib1,false)',
  'sharp-four-tip-concave-crystal-v51',
  'layered-faceted-refractive-glass-v51',
  'moving-white-nucleus-concentric-spectral-rings-v51',
  'single-webgl2-reference-crystal-v51',
  'single-context-adaptive-60-plus-fps',
  'closed-volumetric-shell-with-sidewalls',
  'Math.sin(t * .71)',
  'Math.cos(t * .63)',
  'webglcontextlost'
]) assert.ok(production.includes(token), `missing: ${token}`);

assert.match(production, /const astroid=Math\.pow\(Math\.pow\(c,2\/3\)\+Math\.pow\(s,2\/3\),-1\.5\)/);
assert.match(production, /const ringData = \[/);
assert.match(production, /const dprCap = mobile \? 1\.30 : 1\.70/);
assert.match(production, /const budget = mobile \? 1350000 : 2500000/);
assert.match(production, /clamp\(w \* \.00134, \.46, \.60\)/);
assert.match(production, /const x = portrait \? 0 : \.78/);
assert.match(production, /vec3 L1=normalize\(vec3\(/, 'directional surface lighting is required');
assert.match(production, /float spec=pow\(/, 'specular depth response is required');
assert.doesNotMatch(production, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(production, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);

assert.match(productionStyle, /pointer-events:\s*none\s*!important/);
assert.match(productionStyle, /--fx-core-x:\s*50%/);
assert.match(productionStyle, /min-height:\s*clamp\(540px, 61svh, 820px\)/);
assert.match(productionStyle, /mix-blend-mode:\s*normal\s*!important/, 'canvas must preserve physical depth contrast');
assert.doesNotMatch(productionStyle, /clip-path:\s*polygon/i);

assert.match(previewWebgl, /getContext\(['"]webgl2['"]/i);
assert.match(previewWebgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.doesNotMatch(previewWebgl, /drawImage\s*\(|new\s+Image\s*\(/i);
assert.match(previewMobile, /data-fx-orbital-core="ready-v28"/);

new Function(productionBootstrap);
new Function(production);
console.log('PASS: production MAG v51 uses one native WebGL2 renderer with a closed volumetric four-tip shell, side walls, directional/specular lighting, faceted glass, moving nucleus and bounded desktop/mobile framing.');
