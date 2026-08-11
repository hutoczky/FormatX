'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const selector = read('docs/scifi-ui/scripts/formatx-reference-core-v26.js');
const productionBootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const production = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const productionStyle = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');
const webgpu = read('docs/scifi-ui/scripts/formatx-webgpu-core-v29.js');
const webgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const entry = read('billing-worker/src/production-entry.js');

assert.match(selector, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/);
assert.match(productionBootstrap, /reference-crystal-core-v53/);
assert.match(productionBootstrap, /formatx-core-reference-v53\.js\?v=20260811-reference-v53-r3/);
assert.match(productionBootstrap, /formatx-core-reference-v53\.css\?v=20260811-reference-v53-r3/);
assert.match(production, /sharp-four-tip-concave-crystal-v53/);
assert.match(production, /clean-faceted-refractive-glass-v53/);
assert.match(production, /moving-white-nucleus-concentric-spectral-rings-v53/);
assert.match(production, /single-webgl2-reference-crystal-v53/);
assert.match(production, /physical-triangle-ribbons-interactive-r2/);
assert.match(production, /inside-moving-volume-r2/);
assert.equal((production.match(/getContext\('webgl2'/g) || []).length, 1);
assert.match(productionStyle, /filter:\s*none\s*!important/);
assert.doesNotMatch(production, /new\s+Image\s*\(|drawImage\s*\(|THREE\b|three\.js/i);

assert.match(webgpu, /navigator\.gpu\.requestAdapter/);
assert.match(webgpu, /pass\.drawIndexed/);
assert.match(webgl, /canvas\.getContext\('webgl2'/);
assert.match(webgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.match(entry, /formatx-reference-core-v26\.js/);

new Function(productionBootstrap);
new Function(production);
console.log('PASS: v53 sharp four-tip animated WebGL2 reference crystal is production authority; WebGPU v29 and WebGL2 v28 remain explicit preview paths.');
