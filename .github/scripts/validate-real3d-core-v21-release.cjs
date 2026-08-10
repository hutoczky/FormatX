'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const src = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const css = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260811-reference-v53-r1/);
assert.match(bootstrap, /formatx-core-reference-v53\.css\?v=20260811-reference-v53-r1/);
assert.equal((src.match(/getContext\('webgl2'/g) || []).length, 1);
for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawArrays(gl.TRIANGLES',
  'gl.drawArrays(gl.LINES',
  'function crystal(',
  'function radius(',
  'Math.sin(t*.71)',
  'Math.cos(t*.63)',
  'sharp-four-tip-concave-crystal-v53',
  'clean-faceted-refractive-glass-v53',
  'moving-white-nucleus-concentric-spectral-rings-v53',
  'single-context-adaptive-60-plus-fps',
  'webglcontextlost'
]) assert.ok(src.includes(token), `missing release contract: ${token}`);

assert.match(src, /const budget=mobile\?1150000:2400000/);
assert.match(src, /clamp\(w\*\.00156,\.55,\.70\)/);
assert.doesNotMatch(src, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|backgroundImage/i);
assert.doesNotMatch(src, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);
assert.match(css, /pointer-events:\s*none\s*!important/);
assert.match(css, /filter:\s*none\s*!important/);
assert.match(css, /min-height:\s*clamp\(500px, 58svh, 660px\)/);
assert.doesNotMatch(css, /clip-path:\s*polygon/i);
new Function(src);
console.log('PASS: production MAG v53 is one native WebGL2 sharp four-tip faceted reference crystal with moving white nucleus, spectral rings and bounded mobile framing.');
