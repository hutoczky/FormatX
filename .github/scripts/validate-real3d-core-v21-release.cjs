'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const src = read('docs/scifi-ui/scripts/formatx-core-v50.js');
const css = read('docs/scifi-ui/styles/formatx-core-v50.css');

assert.match(bootstrap, /rounded-living-core-v50/);
assert.match(bootstrap, /formatx-core-v50\.js\?v=20260810-rounded-living-core-v50-1/);
assert.match(bootstrap, /formatx-core-v50\.css\?v=20260810-rounded-living-core-v50-1/);
assert.equal((src.match(/getContext\('webgl2'/g) || []).length, 1);
for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawElements(gl.TRIANGLES',
  'function torus(',
  'function sphere(',
  'const ribbonData = [',
  'Math.sin(t * .71)',
  'Math.cos(t * .63)',
  'single-context-adaptive-60-plus-fps',
  'webglcontextlost'
]) assert.ok(src.includes(token), `missing release contract: ${token}`);

assert.match(src, /const dprCap = mobile \? 1\.35 : 1\.75/);
assert.match(src, /const budget = mobile \? 1450000 : 2600000/);
assert.match(src, /clamp\(viewW \* \.34, \.36, \.66\)/);
assert.match(src, /const x = portrait \? 0 : viewW \* \.18/);
assert.doesNotMatch(src, /function\s+crystal\s*\(|boundary\s*\(/);
assert.doesNotMatch(src, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|backgroundImage/i);
assert.doesNotMatch(src, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);
assert.match(css, /pointer-events:\s*none\s*!important/);
assert.match(css, /--fx-core-x:\s*50%/);
assert.match(css, /min-height:\s*clamp\(460px, 55svh, 690px\)/);
assert.doesNotMatch(css, /clip-path:\s*polygon/i);
assert.doesNotMatch(css, /scale\(\.78,\s*1\.04\)/);
new Function(src);
console.log('PASS: production MAG v50 is a single-context rounded transparent living core with moving nucleus, spectral orbits and bounded mobile framing.');
