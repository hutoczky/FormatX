'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r317.js');
const fallback = read('docs/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');

assert.match(bootstrap, /formatx-core-mobile-v55\.js/);
assert.match(bootstrap, /formatx-pure-3d-r285\.css/);
for (const token of [
  'formatx-core-mobile-reference-r317.js?v=20260825-r317-primary-soft-rim-performance',
  'formatx-core-mechanical-orb-r250.js?v=20260824-native-mechanical-orb-r251-performance',
  'modern-r317-crystal-primary',
  'mechanical-r250-fallback',
  'native-webgl-crystal-only-no-2d-overlay'
]) assert.ok(wrapper.includes(token), `missing current renderer-selection contract: ${token}`);

for (const token of [
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES',
  'reference-crystal-webgl-r317-modern-flat-normal-fresnel',
  'modern-flat-normal-fresnel-microfacet-r317',
  'soft-rim-balanced-glow',
  'bounded-interaction-bursts-no-idle-raf',
  'ResizeObserver',
  'IntersectionObserver',
  'formatx:coreinteraction',
  'formatx:real3dready',
  'pointerdown',
  'pointermove',
  'schedule(3)'
]) assert.ok(renderer.includes(token), `missing native r317 crystal contract: ${token}`);

assert.doesNotMatch(renderer, /getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);
assert.ok(fallback.includes('native-mechanical-energy-orb-r250'));
assert.doesNotMatch(wrapper, /formatx-quantum-particles-r335|formatx-core-mobile-softlight-r318/);
assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.match(layout, /restoreDesktopMenu/);

for (const source of [bootstrap, wrapper, renderer, fallback, layout]) new Function(source);
console.log('PASS: release validates the r317 soft-rim native WebGL crystal, bounded interaction rendering and r250 fallback.');
