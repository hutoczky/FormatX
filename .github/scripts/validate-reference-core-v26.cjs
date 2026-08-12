'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const selector = read('docs/scifi-ui/scripts/formatx-reference-core-v26.js');
const productionBootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const desktopWrapper = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const mobileWrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const desktopProduction = read('docs/scifi-ui/scripts/formatx-core-reference-cinematic-v1.js');
const mobileProduction = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-v62.js');
const productionStyle = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');
const webgpu = read('docs/scifi-ui/scripts/formatx-webgpu-core-v29.js');
const webgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const entry = read('billing-worker/src/production-entry.js');

assert.match(selector, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/);
assert.match(productionBootstrap, /reference-crystal-core-v53/);
assert.match(productionBootstrap, /formatx-core-reference-v53\.js\?v=20260812-four-point-reference-r1/);
assert.match(productionBootstrap, /formatx-core-mobile-v55\.js\?v=20260813-pixel-reference-native-v62-r1/);
assert.match(desktopWrapper, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.match(mobileWrapper, /formatx-core-mobile-reference-v62\.js/);
assert.doesNotMatch(mobileWrapper, /formatx-core-mobile-reference-fidelity-v61\.js/);
assert.match(desktopProduction, /sharp-four-tip-concave-crystal-v53/);
assert.match(desktopProduction, /clean-faceted-refractive-glass-v53/);
assert.match(desktopProduction, /moving-white-nucleus-concentric-spectral-rings-v53/);
assert.match(desktopProduction, /reference-four-point-crystal-v1/);
assert.match(mobileProduction, /pixel-reference-native-webgl2-v62/);
assert.match(mobileProduction, /pixel-locked-organic-concave-four-point-v62/);
assert.match(mobileProduction, /multishell-refractive-crystal-glass-v62/);
assert.match(mobileProduction, /white-cyan-spherical-reactor-orbital-rings-v62/);
assert.match(mobileProduction, /native-webgl2-no-overlay-v62/);
assert.equal((desktopProduction.match(/getContext\(['"]webgl2['"]/g) || []).length, 1);
assert.equal((mobileProduction.match(/getContext\(['"]webgl2['"]/g) || []).length, 1);
assert.equal((desktopWrapper.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);
assert.equal((mobileWrapper.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);
assert.match(productionStyle, /filter:\s*none\s*!important/);
assert.doesNotMatch(desktopProduction + mobileProduction, /new\s+Image\s*\(|drawImage\s*\(|THREE\b|three\.js/i);

assert.match(webgpu, /navigator\.gpu\.requestAdapter/);
assert.match(webgpu, /pass\.drawIndexed/);
assert.match(webgl, /canvas\.getContext\('webgl2'/);
assert.match(webgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.match(entry, /formatx-reference-core-v26\.js/);

new Function(productionBootstrap);new Function(desktopWrapper);new Function(mobileWrapper);new Function(desktopProduction);new Function(mobileProduction);
console.log('PASS: desktop v53 and mobile native v62 are production authorities by mode; WebGPU v29 and WebGL2 v28 remain explicit preview paths.');
