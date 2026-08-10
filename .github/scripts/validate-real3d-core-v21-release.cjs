'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const src = read('docs/scifi-ui/scripts/formatx-core-v51.js');
const css = read('docs/scifi-ui/styles/formatx-core-v51.css');

assert.match(bootstrap, /reference-crystal-core-v51/);
assert.match(bootstrap, /formatx-core-v51\.js\?v=20260810-reference-crystal-v51-1/);
assert.match(bootstrap, /formatx-core-v51\.css\?v=20260810-reference-crystal-v51-1/);
assert.equal((src.match(/getContext\('webgl2'/g) || []).length, 1);
for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawElements(gl.TRIANGLES',
  'gl.drawArrays(gl.LINES',
  'function crystal(',
  'function starRadius(',
  'function torus(',
  'function sphere(',
  'const ringData = [',
  'Math.sin(t * .71)',
  'Math.cos(t * .63)',
  'sharp-four-tip-concave-crystal-v51',
  'layered-faceted-refractive-glass-v51',
  'moving-white-nucleus-concentric-spectral-rings-v51',
  'single-context-adaptive-60-plus-fps',
  'webglcontextlost'
]) assert.ok(src.includes(token), `missing release contract: ${token}`);

assert.match(src, /const dprCap = mobile \? 1\.30 : 1\.70/);
assert.match(src, /const budget = mobile \? 1350000 : 2500000/);
assert.match(src, /clamp\(w \* \.00134, \.46, \.60\)/);
assert.match(src, /const x = portrait \? 0 : \.78/);
assert.doesNotMatch(src, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|backgroundImage/i);
assert.doesNotMatch(src, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);
assert.match(css, /pointer-events:\s*none\s*!important/);
assert.match(css, /--fx-core-x:\s*50%/);
assert.match(css, /min-height:\s*clamp\(540px, 61svh, 820px\)/);
assert.doesNotMatch(css, /clip-path:\s*polygon/i);
new Function(src);
console.log('PASS: production MAG v51 is one native WebGL2 sharp four-tip faceted reference crystal with moving white nucleus, spectral rings and bounded mobile framing.');
